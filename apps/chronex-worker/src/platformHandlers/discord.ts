import { getAuthToken } from "../utils/getAuthToken";
import {
  markProcessing,
  markPublished,
  markFailed,
} from "../utils/updatePostStatus";
import { fetchMedia, fetchMediaMany } from "../utils/media";
import type { Env, PlatformJobPayload } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiscordMetadata {
  caption: string;
  fileIds: number[];
  channelId: string;
  type: "message" | "embed" | "file";
  embed?: DiscordEmbed;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  image?: { url: string };
  thumbnail?: { url: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

interface DiscordWebhookResponse {
  id: string;
  token?: string;
}

/** Response from POST /channels/{id}/webhooks */
interface DiscordWebhookCreateResponse {
  id: string;
  token: string;
}

type AuthToken = Awaited<ReturnType<typeof getAuthToken>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * For Discord the auth_token row stores:
 *   accessToken = guild ID
 *   profileId   = guild ID
 *
 * The bot token lives in env.DISCORD_BOT_TOKEN.
 * At execution time the worker creates a temporary webhook in the target
 * channel (channelId comes from the job payload metadata), uses it to post,
 * and then deletes the webhook to keep the channel clean.
 *
 * Discord docs:
 *   Create Webhook  — POST /channels/{channel.id}/webhooks
 *   Execute Webhook — POST /webhooks/{webhook.id}/{webhook.token}
 *   Delete Webhook  — DELETE /webhooks/{webhook.id}/{webhook.token}
 */

const DISCORD_API = "https://discord.com/api/v10";

/**
 * Create a temporary webhook in the given channel using the bot token.
 */
async function createWebhook(
  botToken: string,
  channelId: string,
): Promise<{ webhookUrl: string; webhookId: string; webhookToken: string }> {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/webhooks`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Chronex" }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Discord webhook: ${err}`);
  }

  const data = (await res.json()) as DiscordWebhookCreateResponse;
  return {
    webhookUrl: `${DISCORD_API}/webhooks/${data.id}/${data.token}`,
    webhookId: data.id,
    webhookToken: data.token,
  };
}

/**
 * Delete a webhook after use to keep the channel clean.
 */
async function deleteWebhook(
  webhookId: string,
  webhookToken: string,
): Promise<void> {
  await fetch(`${DISCORD_API}/webhooks/${webhookId}/${webhookToken}`, {
    method: "DELETE",
  });
}

/**
 * Execute a Discord webhook with a JSON body (text/embed messages).
 * Appends ?wait=true so we get the created message back (with its ID).
 */
async function executeWebhookJson(
  webhookUrl: string,
  body: Record<string, unknown>,
): Promise<DiscordWebhookResponse> {
  const res = await fetch(`${webhookUrl}?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord webhook (JSON) failed: ${err}`);
  }

  return res.json() as Promise<DiscordWebhookResponse>;
}

/**
 * Execute a Discord webhook with streaming multipart/form-data for file
 * attachments.
 *
 * Instead of buffering all files into memory (which would blow the 128 MB
 * Workers limit for large / many attachments), each file's binary data is
 * streamed directly from its source URL through the multipart body using a
 * TransformStream pipe.
 *
 * Discord webhook supports up to 10 files via multipart.
 * The JSON payload goes into the `payload_json` part and each binary file
 * goes into its own `files[n]` part.
 *
 * Docs: https://discord.com/developers/docs/reference#uploading-files
 */
async function executeWebhookMultipart(
  webhookUrl: string,
  jsonPayload: Record<string, unknown>,
  files: Array<{ name: string; mediaUrl: string }>,
): Promise<DiscordWebhookResponse> {
  const boundary = `----ChronexBoundary${Date.now()}`;
  const encoder = new TextEncoder();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Produce the multipart body asynchronously while fetch consumes it
  const writePromise = (async () => {
    try {
      // ── payload_json part ──────────────────────────────────────────────
      await writer.write(
        encoder.encode(
          `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="payload_json"\r\n` +
            `Content-Type: application/json\r\n\r\n` +
            JSON.stringify(jsonPayload) +
            `\r\n`,
        ),
      );

      // ── file parts — streamed from source ─────────────────────────────
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;

        // Fetch the file — read Content-Type from response headers, then
        // stream the body without ever buffering the whole file in memory.
        const res = await fetch(file.mediaUrl);
        if (!res.ok || !res.body) {
          throw new Error(
            `Failed to fetch file "${file.name}" from ${file.mediaUrl}: ${res.status}`,
          );
        }

        const contentType =
          res.headers.get("content-type") ?? "application/octet-stream";

        // Part header
        await writer.write(
          encoder.encode(
            `--${boundary}\r\n` +
              `Content-Disposition: form-data; name="files[${i}]"; filename="${file.name}"\r\n` +
              `Content-Type: ${contentType}\r\n\r\n`,
          ),
        );

        // Pipe file body through
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }

        // CRLF after part body
        await writer.write(encoder.encode(`\r\n`));
      }

      // Closing boundary
      await writer.write(encoder.encode(`--${boundary}--\r\n`));
      await writer.close();
    } catch (err) {
      await writer.abort(err);
      throw err;
    }
  })();

  // fetch consumes the readable stream concurrently with the writer
  const [res] = await Promise.all([
    fetch(`${webhookUrl}?wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: readable,
      // @ts-expect-error — duplex required for streaming request body in Workers
      duplex: "half",
    }),
    writePromise,
  ]);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord webhook (multipart) failed: ${err}`);
  }

  return res.json() as Promise<DiscordWebhookResponse>;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * Send a plain text message via Discord webhook.
 */
export const DiscordMessage = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as DiscordMetadata;

  let webhookId: string | undefined;
  let webhookToken: string | undefined;

  try {
    await markProcessing(db, payload.platformPostId);

    const webhook = await createWebhook(env.DISCORD_BOT_TOKEN, data.channelId);
    webhookId = webhook.webhookId;
    webhookToken = webhook.webhookToken;

    const result = await executeWebhookJson(webhook.webhookUrl, {
      content: data.caption,
    });

    await markPublished(db, payload.platformPostId, result.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  } finally {
    if (webhookId && webhookToken) {
      await deleteWebhook(webhookId, webhookToken).catch(() => {});
    }
  }
};

/**
 * Send a rich embed message via Discord webhook.
 *
 * The embed object is taken from metadata.embed. If images are referenced
 * in fileIds, we include them as the embed image.
 */
export const DiscordEmbed = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as DiscordMetadata;

  let webhookId: string | undefined;
  let webhookToken: string | undefined;

  try {
    await markProcessing(db, payload.platformPostId);

    const webhook = await createWebhook(env.DISCORD_BOT_TOKEN, data.channelId);
    webhookId = webhook.webhookId;
    webhookToken = webhook.webhookToken;

    // Build embed object — if file IDs exist, use the first as the embed image
    const embed: Record<string, unknown> = { ...data.embed };

    if (data.fileIds?.length) {
      const media = await fetchMedia(db, data.fileIds[0] ?? 0);
      embed.image = { url: media.url };
    }

    if (data.caption && !embed.description) {
      embed.description = data.caption;
    }

    const result = await executeWebhookJson(webhook.webhookUrl, {
      embeds: [embed],
    });

    await markPublished(db, payload.platformPostId, result.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  } finally {
    if (webhookId && webhookToken) {
      await deleteWebhook(webhookId, webhookToken).catch(() => {});
    }
  }
};

/**
 * Send file(s) via Discord webhook using streaming multipart form data.
 *
 * Each file is streamed directly from its source URL through the multipart
 * body — no file is ever fully buffered in Worker memory.
 * Discord supports up to 10 attachments per webhook message.
 */
export const DiscordFile = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  const data = payload.metadata as DiscordMetadata;

  let webhookId: string | undefined;
  let webhookToken: string | undefined;

  try {
    await markProcessing(db, payload.platformPostId);

    const webhook = await createWebhook(env.DISCORD_BOT_TOKEN, data.channelId);
    webhookId = webhook.webhookId;
    webhookToken = webhook.webhookToken;

    const mediaItems = await fetchMediaMany(db, data.fileIds);

    // Build lightweight file descriptors — no binary download, just URLs
    const files = mediaItems.map((item, idx) => {
      const urlPath = new URL(item.url).pathname;
      const name =
        urlPath.split("/").pop() ?? `file_${idx}.${item.extension ?? "bin"}`;
      return { name, mediaUrl: item.url };
    });

    const result = await executeWebhookMultipart(
      webhook.webhookUrl,
      { content: data.caption || undefined },
      files,
    );

    await markPublished(db, payload.platformPostId, result.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  } finally {
    if (webhookId && webhookToken) {
      await deleteWebhook(webhookId, webhookToken).catch(() => {});
    }
  }
};
