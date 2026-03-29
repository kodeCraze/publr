import { z } from 'zod'

const MAX_IMAGE_SIZE = 8
const MAX_VIDEO_SIZE = 100

const THREADS_IMAGE_MAX_RATIO = 10
const THREADS_VIDEO_MIN_RATIO = 0.01
const THREADS_VIDEO_MAX_RATIO = 10

function parseRatio(ar: string): number {
  const [w, h] = ar.split(':').map(Number)
  return w / h
}

const imageItem = z
  .object({
    url: z.string().min(1),
    type: z.literal('image'),
    size: z.number().positive().max(MAX_IMAGE_SIZE, 'Threads images cannot exceed 8MB'),
    width: z
      .number()
      .int()
      .positive()
      .min(320, 'Minimum width is 320px')
      .max(4096, 'Maximum width is 4096px'),
    height: z
      .number()
      .int()
      .positive()
      .min(320, 'Minimum height is 320px')
      .max(4096, 'Maximum height is 4096px'),
    extension: z.enum(['jpg', 'jpeg', 'png', 'webp']),
    aspectRatio: z.string().regex(/^([1-9]\d*):([1-9]\d*)$/, 'Aspect ratio must be in W:H format'),
    duration: z.number().nullish(),
  })
  .refine(
    (d) => {
      const ratio = parseRatio(d.aspectRatio)
      return ratio <= THREADS_IMAGE_MAX_RATIO
    },
    {
      message: 'Threads image aspect ratio must not exceed 10:1',
      path: ['aspectRatio'],
    },
  )

const image = z
  .array(imageItem)
  .min(1, 'Threads image posts require at least 1 image')
  .max(10, 'Threads image posts support up to 10 images')

const videoItem = z
  .object({
    url: z.string().min(1),
    type: z.literal('video'),
    size: z.number().positive().max(MAX_VIDEO_SIZE, 'Threads videos cannot exceed 100MB'),
    width: z.number().int().positive().min(360, 'Minimum width is 360px'),

    height: z.number().int().positive().min(360, 'Minimum height is 360px'),

    duration: z
      .number()
      .positive()
      .min(1, 'Threads videos must be at least 1 second')
      .max(300, 'Threads videos must be at most 5 minutes'),
    extension: z.enum(['mp4', 'mov']),
    aspectRatio: z.string().regex(/^([1-9]\d*):([1-9]\d*)$/, 'Aspect ratio must be in W:H format'),
  })
  .refine(
    (d) => {
      const ratio = parseRatio(d.aspectRatio)
      return ratio >= THREADS_VIDEO_MIN_RATIO && ratio <= THREADS_VIDEO_MAX_RATIO
    },
    {
      message: 'Threads video aspect ratio must be between 0.01:1 and 10:1 (recommended 9:16)',
      path: ['aspectRatio'],
    },
  )

const video = z.array(videoItem).length(1, 'Threads video posts require exactly 1 video')

const carousel = z
  .array(z.union([imageItem, videoItem]))
  .refine((arr) => arr.length >= 2 && arr.length <= 10, {
    message: 'Threads carousels must contain between 2 and 10 items',
  })

export const threads = { image, video, carousel }
