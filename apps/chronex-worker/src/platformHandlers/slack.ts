import { getAuthToken } from "../utils/getAuthToken";
import {
  markProcessing,
  markPublished,
  markFailed,
} from "../utils/updatePostStatus";
import { fetchMedia, fetchMediaMany, streamMedia } from "../utils/media";
import type { Env, PlatformJobPayload } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlackMetadata {
  caption: string;
  fileIds: number[];
  type: "message" | "file";
  /** Slack channel ID to post to (stored in metadata or from authToken.profileId) */
  channelId?: string;
}

type AuthToken = Awaited<ReturnType<typeof getAuthToken>>;

const SLACK_API = "https://slack.com/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * For Slack the auth_token row stores:
 *   accessToken = Bot/User OAuth token (xoxb-... or xoxp-...)
 *   profileId   = default channel ID
 *
 * Docs: https://api.slack.com/methods
 */

/**
 * Post a text message to a Slack channel.
 *
 * POST https://slack.com/api/chat.postMessage
 * Docs: https://api.slack.com/methods/chat.postMessage
 */
async function postMessage(
  token: AuthToken,
  channelId: string,
  text: string,
): Promise<string> {
  const res = await fetch(`${SLACK_API}/chat.postMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify({
      channel: channelId,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Slack chat.postMessage HTTP error: ${err}`);
  }

  const data = (await res.json()) as {
    ok: boolean;
    ts?: string;
    error?: string;
  };
  if (!data.ok) {
    throw new Error(`Slack chat.postMessage failed: ${data.error}`);
  }

  return data.ts ?? "";
}



async function uploadFile(
  token: AuthToken,
  channelId: string,
  fileName: string,
  fileSize: number,
  mediaUrl: string,
  initialComment?: string,
): Promise<string> {
  // Step 1: Get the upload URL
  const urlRes = await fetch(`${SLACK_API}/files.getUploadURLExternal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: new URLSearchParams({
      filename: fileName,
      length: String(fileSize),
    }),
  });

  const urlData = (await urlRes.json()) as {
    ok: boolean;
    upload_url?: string;
    file_id?: string;
    error?: string;
  };

  if (!urlData.ok || !urlData.upload_url || !urlData.file_id) {
    throw new Error(
      `Slack files.getUploadURLExternal failed: ${urlData.error ?? "Unknown error"}`,
    );
  }

  // Step 2: Stream binary data to the upload URL via PUT
  const { body, contentType, contentLength } = await streamMedia(mediaUrl);

  const putHeaders: Record<string, string> = {
    "Content-Type": contentType,
  };
  if (contentLength) {
    putHeaders["Content-Length"] = String(contentLength);
  }

  const putRes = await fetch(urlData.upload_url, {
    method: "PUT",
    headers: putHeaders,
    body,
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`Slack file upload PUT failed: ${err}`);
  }

  // Step 3: Complete the upload and share to channel
  const completeRes = await fetch(`${SLACK_API}/files.completeUploadExternal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify({
      files: [{ id: urlData.file_id, title: fileName }],
      channel_id: channelId,
      ...(initialComment && { initial_comment: initialComment }),
    }),
  });

  const completeData = (await completeRes.json()) as {
    ok: boolean;
    files?: Array<{ id: string }>;
    error?: string;
  };

  if (!completeData.ok) {
    throw new Error(
      `Slack files.completeUploadExternal failed: ${completeData.error ?? "Unknown error"}`,
    );
  }

  return completeData.files?.[0]?.id ?? urlData.file_id;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * Send a plain text message to a Slack channel.
 */
export const SlackMessage = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as SlackMetadata;

  try {
    await markProcessing(db, payload.platformPostId);

    const token = await getAuthToken(db, payload.workspaceId, "slack");
    const channelId = data.channelId ?? token.profileId ?? "";

    if (!channelId) {
      throw new Error("No Slack channel ID specified");
    }

    const ts = await postMessage(token, channelId, data.caption);
    await markPublished(db, payload.platformPostId, ts);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};

/**
 * Upload file(s) to a Slack channel.
 *
 * Uses Slack's new multi-step upload flow:
 *   files.getUploadURLExternal → PUT binary (streamed) → files.completeUploadExternal
 *
 * For multiple files, each is uploaded individually and shared to the channel.
 */
export const SlackFile = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as SlackMetadata;

  try {
    await markProcessing(db, payload.platformPostId);

    const token = await getAuthToken(db, payload.workspaceId, "slack");
    const channelId = data.channelId ?? token.profileId ?? "";

    if (!channelId) {
      throw new Error("No Slack channel ID specified");
    }

    const mediaItems = await fetchMediaMany(db, data.fileIds);
    const uploadedFileIds: string[] = [];

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i]!;

      // We need the file size for getUploadURLExternal
      const headRes = await fetch(item.url, { method: "HEAD" });
      const size = parseInt(headRes.headers.get("content-length") ?? "0", 10);
      if (!size) {
        throw new Error(
          `Could not determine file size for fileId ${data.fileIds[i]}`,
        );
      }

      // Derive filename
      const urlPath = new URL(item.url).pathname;
      const fileName =
        urlPath.split("/").pop() ?? `file_${i}.${item.extension ?? "bin"}`;

      const fileId = await uploadFile(
        token,
        channelId,
        fileName,
        size,
        item.url,
        // Include caption only on the first file
        i === 0 ? data.caption : undefined,
      );

      uploadedFileIds.push(fileId);
    }

    // Use the first file ID as the external ID for the platform post
    await markPublished(db, payload.platformPostId, uploadedFileIds[0] ?? "");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};
