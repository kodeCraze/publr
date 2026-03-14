import { getAuthToken } from "../utils/getAuthToken";
import {
  markProcessing,
  markPublishedIGTH,
  markFailed,
} from "../utils/updatePostStatus";
import { fetchMedia, fetchMediaMany } from "../utils/media";
import type { Env, PlatformJobPayload } from "../index";



export interface MetaDataSchema {
  caption: string;
  fileIds: number[];
  type: string;
  hashtag?: string[];
}

interface ContainerResponse {
  id: string;
}

interface ContainerStatusResponse {
  status_code: "IN_PROGRESS" | "FINISHED" | "ERROR";
}

interface PublishResponse {
  id: string;
}

type AuthToken = Awaited<ReturnType<typeof getAuthToken>>;



const IG_API = "https://graph.instagram.com/v25.0";



function containerUrl(profileId: string) {
  return `${IG_API}/${profileId}/media`;
}

function publishUrl(profileId: string) {
  return `${IG_API}/${profileId}/media_publish`;
}

/**
 * Create a media container on Instagram.
 */
async function createContainer(
  token: AuthToken,
  body: Record<string, unknown>,
): Promise<ContainerResponse> {
  const res = await fetch(containerUrl(token.profileId!), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create IG media container: ${err}`);
  }

  return res.json() as Promise<ContainerResponse>;
}

/**
 * Publish a previously created media container (or carousel).
 */
async function publishContainer(
  token: AuthToken,
  creationId: string,
): Promise<PublishResponse> {
  const res = await fetch(publishUrl(token.profileId!), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken}`,
    },
    body: JSON.stringify({ creation_id: creationId }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to publish IG media: ${err}`);
  }

  return res.json() as Promise<PublishResponse>;
}

/**
 * Check if a container has finished processing.
 * Returns the status_code string.
 */
async function checkContainerStatus(
  token: AuthToken,
  containerId: string,
): Promise<ContainerStatusResponse["status_code"]> {
  const res = await fetch(
    `${IG_API}/${containerId}?fields=status_code,status&access_token=${token.accessToken}`,
  );
  const data = (await res.json()) as ContainerStatusResponse;
  console.log("Checked IG container status:", JSON.stringify(data));
  return data.status_code;
}

/**
 * Re-enqueue a job with a delay so the queue picks it up later for status
 * checking. The `containerId` is carried in the payload so we can resume.
 */
async function enqueueStatusCheck(
  env: Env,
  payload: PlatformJobPayload,
  containerId: string,
  childContainerIds?: string[],
  delaySeconds = 5,
) {
  await env.CHRONEX_QUEUE_PRODUCER.send(
    {
      ...payload,
      phase: "check_status",
      containerId,
      ...(childContainerIds && { childContainerIds }),
    },
    { delaySeconds },
  );
}



/**
 * Publish a single IMAGE post to Instagram.
 * Uses signed URLs for media.
 */
export const InstagramImage = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  console.log("dhappa bhen ke lode");
  try {
    const token = await getAuthToken(db, payload.workspaceId, "instagram");

    if (payload.phase === "check_status" && payload.containerId) {
      
      const status = await checkContainerStatus(token, payload.containerId);

      if (status === "FINISHED") {
        const result = await publishContainer(token, payload.containerId);
        await markPublishedIGTH(db, payload.platformPostId, result.id,token.accessToken,IG_API);
        return;
      }

      if (status === "ERROR") {
        await markFailed(
          db,
          payload.platformPostId,
          `IG container ${payload.containerId} processing failed`,
        );
        return;
      }

      
      await enqueueStatusCheck(env, payload, payload.containerId);
      return;
    }

    
    await markProcessing(db, payload.platformPostId);

 
   

    const data = payload.metadata as MetaDataSchema;
    const media = await fetchMedia(db, data.fileIds[0] ?? 0);
    const container = await createContainer(token, {
      image_url: media.url,
      caption: data.caption,
    });

    
    await enqueueStatusCheck(env, payload, container.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};

/**
 * Publish a REEL (video) to Instagram.
 *
 * Phase 1 ("create"):  create container → set processing → re-enqueue for status check
 * Phase 2 ("check_status"): check container status →
 *   - FINISHED → publish → mark published
 *   - IN_PROGRESS → re-enqueue again
 *   - ERROR → mark failed
 */
export const InstagramReel = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
 
  
  const data = payload.metadata as MetaDataSchema;
  try {
    const token = await getAuthToken(db, payload.workspaceId, "instagram");

    if (payload.phase === "check_status" && payload.containerId) {
      
      const status = await checkContainerStatus(token, payload.containerId);

      if (status === "FINISHED") {
        const result = await publishContainer(token, payload.containerId);
        await markPublishedIGTH(db, payload.platformPostId, result.id,token.accessToken,IG_API);
        return;
      }

      if (status === "ERROR") {
        await markFailed(
          db,
          payload.platformPostId,
          `IG container ${payload.containerId} processing failed`,
        );
        return;
      }

      
      await enqueueStatusCheck(env, payload, payload.containerId);
      return;
    }

    await markProcessing(db, payload.platformPostId);

    const media = await fetchMedia(db, data.fileIds[0] ?? 0);
    const container = await createContainer(token, {
      video_url: media.url,
      caption: data.caption,
      media_type: "REELS",
    });

    await enqueueStatusCheck(env, payload, container.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};


export const InstagramCarousel = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  console.log("ye raha aapka payload", payload);
 
  

  const data = payload.metadata as MetaDataSchema;
  try {
    const token = await getAuthToken(db, payload.workspaceId, "instagram");

    if (payload.phase === "check_status" && payload.childContainerIds?.length) {
      for (const childId of payload.childContainerIds) {
        const status = await checkContainerStatus(token, childId);

        if (status === "ERROR") {
          await markFailed(
            db,
            payload.platformPostId,
            `IG carousel child container ${childId} processing failed`,
          );
          return;
        }

        if (status === "IN_PROGRESS") {
          await enqueueStatusCheck(env, payload, "", payload.childContainerIds);
          return;
        }
      }

      if (payload.containerId) {
        const status = await checkContainerStatus(token, payload.containerId);
        if (status === "ERROR") {
          await markFailed(
            db,
            payload.platformPostId,
            `IG carousel parent container ${payload.containerId} processing failed`,
          );
          return;
        }
        if (status === "IN_PROGRESS") {
          await enqueueStatusCheck(
            env,
            payload,
            payload.containerId,
            payload.childContainerIds,
          );
          return;
        }
        const result = await publishContainer(token, payload.containerId);
        await markPublishedIGTH(db, payload.platformPostId, result.id,token.accessToken,IG_API);
        console.log("Carousel published with ID:", result.id);
        return;
      }
      const carousel = await createContainer(token, {
        media_type: "CAROUSEL",
        caption: data.caption,
        children: payload.childContainerIds,
      });
      await enqueueStatusCheck(
        env,
        payload,
        carousel.id,
        payload.childContainerIds,
      );
      return;
    }

    await markProcessing(db, payload.platformPostId);
    console.log("ye raha aapka data", data);
    const mediaItems = await fetchMediaMany(db, data.fileIds);
    const childIds: string[] = [];
    console.log("Creating child containers for carousel items:", mediaItems);
    for (const item of mediaItems) {
      const isVideo = item.type === "video";

      const child = await createContainer(token, {
        ...(isVideo
          ? { video_url: item.url, media_type: "VIDEO" }
          : { image_url: item.url }),
        is_carousel_item: true,
      });

      childIds.push(child.id);
      console.log(`Created child container ${child.id} for media ${item}`);
    }

    await enqueueStatusCheck(env, payload, "", childIds);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};


export const InstagramStory = async (
  payload: PlatformJobPayload,
  env: Env,
): Promise<void> => {
  const db = (await import("@repo/db")).createDb(env.DATABASE_URL);
  console.log("ye raha aapka payload", payload);
 
  
  const data = payload.metadata as MetaDataSchema;

  try {
    const token = await getAuthToken(db, payload.workspaceId, "instagram");

    if (payload.phase === "check_status" && payload.containerId) {
      const status = await checkContainerStatus(token, payload.containerId);

      if (status === "FINISHED") {
        console.log(
          "IG story container finished processing, now publishing...",
        );
        const result = await publishContainer(token, payload.containerId);
        await markPublishedIGTH(db, payload.platformPostId, result.id,token.accessToken,IG_API);
        console.log("Story published with ID:", result.id);
        return;
      }

      if (status === "ERROR") {
        console.error("IG story container processing failed");
        await markFailed(
          db,
          payload.platformPostId,
          `IG story container ${payload.containerId} processing failed`,
        );
        return;
      }

      console.log(
        "IG story container still processing, re-enqueueing for status check...",
      );
      await enqueueStatusCheck(env, payload, payload.containerId);
      return;
    }

    await markProcessing(db, payload.platformPostId);

    const media = await fetchMedia(db, data.fileIds[0] ?? 0);
    const isVideo = media.type === "video";

    console.log(
      "IG Story media URL:",
      media.url,
      "type:",
      media.type,
      "extension:",
      media.extension,
    );
    const probe = await fetch(media.url, { method: "HEAD" });
    if (!probe.ok) {
      throw new Error(
        `Media URL not accessible (HTTP ${probe.status}): ${media.url}`,
      );
    }
    console.log(
      "IG Story media probe OK, content-type:",
      probe.headers.get("content-type"),
      "content-length:",
      probe.headers.get("content-length"),
    );

    const container = await createContainer(token, {
      ...(isVideo ? { video_url: media.url } : { image_url: media.url }),
      media_type: "STORIES",
    });

    console.log("IG Story container created:", container.id);
    await enqueueStatusCheck(env, payload, container.id);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await markFailed(db, payload.platformPostId, msg);
    throw error;
  }
};
