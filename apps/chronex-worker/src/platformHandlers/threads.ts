import { getAuthToken } from "../utils/getAuthToken";
import {
  markProcessing,
  markPublished,
  markFailed,
} from "../utils/updatePostStatus";
import { fetchMedia } from "../utils/media";
import type { Env, PlatformJobPayload } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThreadsMetadata {
  caption: string;
  fileIds: number[];
  type: "text" | "image" | "video";
}

type AuthToken = Awaited<ReturnType<typeof getAuthToken>>;

// Threads API uses the same Graph API host
const THREADS_API = "https://graph.threads.net/v1.0";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a media container on Threads.
 *
 * POST /{user-id}/threads
 * Docs: https://developers.facebook.com/docs/threads/posts
 */
async function createContainer(
  token: AuthToken,
  body: Record<string, unknown>,
): Promise<{ id: string }> {
  const res = await fetch(`${THREADS_API}/${token.profileId}/threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Threads createContainer failed: ${err}`);
  }

  return res.json() as Promise<{ id: string }>;
}

/**
 * Publish a previously created Threads container.
 *
 * POST /{user-id}/threads_publish
 */
async function publishContainer(
  token: AuthToken,
  creationId: string,
): Promise<{ id: string }> {
  const res = await fetch(`${THREADS_API}/${token.profileId}/threads_publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify({ creation_id: creationId }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Threads publishContainer failed: ${err}`);
  }

  return res.json() as Promise<{ id: string }>;
}

/**
 * Check if a Threads container has finished processing (for video).
 *
 * GET /{container-id}?fields=status
 * Returns: FINISHED | IN_PROGRESS | ERROR
 */
async function checkContainerStatus(
  token: AuthToken,
  containerId: string,
): Promise<string> {
  const res = await fetch(
    `${THREADS_API}/${containerId}?fields=status&access_token=${token.accessToken}`,
  );
  const data = (await res.json()) as { status: string };
  return data.status;
}

/**
 * Re-enqueue a job with delay for status polling.
 */
async function enqueueStatusCheck(
  env: Env,
  payload: PlatformJobPayload,
  containerId: string,
) {
  await env.CHRONEX_QUEUE_PRODUCER.send(
    {
      ...payload,
      phase: "check_status",
      containerId,
    },
    { delaySeconds: 10 },
  );
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * Publish a TEXT-only post to Threads.
 *
 * Flow: create container (media_type=TEXT) → publish
 */
export const ThreadsText = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as ThreadsMetadata;

  try {
    await markProcessing(db, payload.platformPostId);

    const token = await getAuthToken(db, payload.workspaceId, "threads");

    const container = await createContainer(token, {
      media_type: "TEXT",
      text: data.caption,
    });

    const result = await publishContainer(token, container.id);
    await markPublished(db, payload.platformPostId, result.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};

/**
 * Publish an IMAGE post to Threads.
 *
 * Flow: create container (media_type=IMAGE) → publish
 */
export const ThreadsImage = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as ThreadsMetadata;

  try {
    await markProcessing(db, payload.platformPostId);

    const token = await getAuthToken(db, payload.workspaceId, "threads");
    const media = await fetchMedia(db, data.fileIds[0] ?? 0);

    const container = await createContainer(token, {
      media_type: "IMAGE",
      image_url: media.url,
      text: data.caption,
    });

    const result = await publishContainer(token, container.id);
    await markPublished(db, payload.platformPostId, result.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};

/**
 * Publish a VIDEO post to Threads.
 *
 * Phase 1 ("create"): create container (media_type=VIDEO) → re-enqueue for status
 * Phase 2 ("check_status"): check status →
 *   - FINISHED → publish → mark published
 *   - IN_PROGRESS → re-enqueue
 *   - ERROR → mark failed
 */
export const ThreadsVideo = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as ThreadsMetadata;

  try {
    const token = await getAuthToken(db, payload.workspaceId, "threads");

    if (payload.phase === "check_status" && payload.containerId) {
      const status = await checkContainerStatus(token, payload.containerId);

      if (status === "FINISHED") {
        const result = await publishContainer(token, payload.containerId);
        await markPublished(db, payload.platformPostId, result.id);
        return;
      }

      if (status === "ERROR") {
        await markFailed(
          db,
          payload.platformPostId,
          `Threads container ${payload.containerId} processing failed`,
        );
        return;
      }

      // Still IN_PROGRESS
      await enqueueStatusCheck(env, payload, payload.containerId);
      return;
    }

    // Phase 1: Create container
    await markProcessing(db, payload.platformPostId);

    const media = await fetchMedia(db, data.fileIds[0] ?? 0);

    const container = await createContainer(token, {
      media_type: "VIDEO",
      video_url: media.url,
      text: data.caption,
    });

    await enqueueStatusCheck(env, payload, container.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};
