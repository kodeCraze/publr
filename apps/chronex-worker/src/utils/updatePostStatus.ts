import { DB, platformPosts, eq } from "@repo/db";

type PlatformPostStatus = "pending" | "processing" | "published" | "failed";

/**
 * Update the status of a platform post row.
 */
export async function updatePlatformPostStatus(
  db: DB,
  platformPostId: number,
  status: PlatformPostStatus,
  extra?: {
    externalId?: string;
    postUrl?: string;
    errorMessage?: string;
    publishedAt?: Date;
  },
) {
  await db
    .update(platformPosts)
    .set({
      status,
      updatedAt: new Date(),
      ...(extra?.externalId && { externalId: extra.externalId }),
      ...(extra?.postUrl && { postUrl: extra.postUrl }),
      ...(extra?.errorMessage && { errorMessage: extra.errorMessage }),
      ...(extra?.publishedAt && { publishedAt: extra.publishedAt }),
    })
    .where(eq(platformPosts.id, platformPostId));
}

/**
 * Mark a platform post as "processing".
 */
export async function markProcessing(db: DB, platformPostId: number) {
  return updatePlatformPostStatus(db, platformPostId, "processing");
}

/**
 * Mark a platform post as "published" with the external ID from the platform.
 */
export async function markPublished(
  db: DB,
  platformPostId: number,
  externalId: string,
) {
  return updatePlatformPostStatus(db, platformPostId, "published", {
    externalId,
    publishedAt: new Date(),
  });
}

/**
 * Mark a platform post as "failed" with an error message.
 */
export async function markFailed(
  db: DB,
  platformPostId: number,
  errorMessage: string,
) {
  return updatePlatformPostStatus(db, platformPostId, "failed", {
    errorMessage,
  });
}
