import { z } from 'zod'

const MAX_IMAGE_SIZE = 8
const MAX_STORY_IMAGE = 30
const MAX_REEL_SIZE = 100
const MAX_STORY_VIDEO = 4096

const IG_IMAGE_MIN_RATIO = 4 / 5
const IG_IMAGE_MAX_RATIO = 1.91
const IG_REEL_MIN_RATIO = 0.01
const IG_REEL_MAX_RATIO = 10
const IG_STORY_VIDEO_MIN_RATIO = 0.1
const IG_STORY_VIDEO_MAX_RATIO = 10

function parseRatio(ar: string): number {
  const [w, h] = ar.split(':').map(Number)
  return w / h
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a))
  b = Math.abs(Math.trunc(b))
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a || 1
}
export function normalizeAspectRatio(w: number, h: number): string {
  const g = gcd(w, h)
  return `${Math.trunc(w / g)}:${Math.trunc(h / g)}`
}

const instagramImageBase = z.object({
  url: z.string().min(1),
  type: z.literal('image'),
  size: z.number().positive().max(MAX_IMAGE_SIZE, 'Instagram images cannot exceed 8MB'),
  width: z.number().int().positive().min(320, 'Minimum width is 320px'),
  height: z.number().int().positive().min(320, 'Minimum height is 320px'),
  extension: z.enum(['jpg', 'jpeg', 'png', 'webp']),
  aspectRatio: z.string().regex(/^([1-9]\d*):([1-9]\d*)$/, 'Aspect ratio must be in W:H format'),
  duration: z.number().nullish(),
})

const instagramVideoBase = z.object({
  url: z.string().min(1),
  type: z.literal('video'),
  size: z.number().positive().max(MAX_REEL_SIZE, 'Instagram videos cannot exceed 100MB'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  duration: z
    .number()
    .positive()
    .min(3, 'Must be at least 3 seconds')
    .max(120, 'Must be at most 120 seconds'),
  extension: z.enum(['mp4', 'mov']),
  aspectRatio: z.string().regex(/^([1-9]\d*):([1-9]\d*)$/, 'Aspect ratio must be in W:H format'),
})

const instagramImageItem = instagramImageBase
  .refine((d) => normalizeAspectRatio(d.width, d.height) === d.aspectRatio, {
    message: 'aspectRatio does not match width/height',
    path: ['aspectRatio'],
  })
  .refine(
    (d) => {
      const ratio = parseRatio(d.aspectRatio)
      return ratio >= IG_IMAGE_MIN_RATIO && ratio <= IG_IMAGE_MAX_RATIO
    },
    {
      message: 'Instagram feed images must have an aspect ratio between 4:5 and 1.91:1',
      path: ['aspectRatio'],
    },
  )

const instagramVideoItem = instagramVideoBase
  .refine((d) => normalizeAspectRatio(d.width, d.height) === d.aspectRatio, {
    message: 'aspectRatio does not match width/height',
    path: ['aspectRatio'],
  })
  .refine(
    (d) => {
      const ratio = parseRatio(d.aspectRatio)
      return ratio >= IG_REEL_MIN_RATIO && ratio <= IG_REEL_MAX_RATIO
    },
    {
      message:
        'Instagram reels must have an aspect ratio between 0.01:1 and 10:1 (recommended 9:16)',
      path: ['aspectRatio'],
    },
  )

const image = z.array(instagramImageItem).length(1, 'Instagram image posts require exactly 1 image')

const reel = z.array(instagramVideoItem).length(1, 'Instagram reels require exactly 1 video')

const carousel = z
  .array(z.union([instagramImageBase, instagramVideoBase]))
  .min(2, 'Instagram carousels require at least 2 media items')
  .max(10, 'Instagram carousels support up to 10 media items')

const story = z
  .array(
    z.discriminatedUnion('type', [
      z.object({
        url: z.string().min(1),
        type: z.literal('image'),
        size: z.number().positive().max(MAX_STORY_IMAGE, 'Story images cannot exceed 30MB'),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        extension: z.enum(['jpg', 'jpeg', 'png', 'webp']),
        aspectRatio: z.string(),
        duration: z.number().nullish(),
      }),
      z.object({
        url: z.string().min(1),
        type: z.literal('video'),
        size: z.number().positive().max(MAX_STORY_VIDEO, 'Story videos cannot exceed 4GB'),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        duration: z
          .number()
          .positive()
          .min(1, 'Story videos must be at least 1 second')
          .max(60, 'Story videos must be at most 60 seconds'),
        extension: z.enum(['mp4', 'mov']),
        aspectRatio: z.string(),
      }),
    ]),
  )
  .length(1, 'Instagram stories require exactly 1 media file')
  .refine(
    (items) =>
      items.every((item) => {
        if (item.type === 'video') {
          const ratio = parseRatio(item.aspectRatio)
          return ratio >= IG_STORY_VIDEO_MIN_RATIO && ratio <= IG_STORY_VIDEO_MAX_RATIO
        }
        return true
      }),
    {
      message: 'Instagram story videos must have an aspect ratio between 0.1:1 and 10:1',
    },
  )

export const instagram = { image, reel, carousel, story }
