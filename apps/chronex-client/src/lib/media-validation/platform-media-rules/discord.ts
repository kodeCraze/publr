import { z } from 'zod'

const MAX_FILE_SIZE = 25

const discordFileItem = z.object({
  url: z.string().min(1),
  type: z.enum(['image', 'video']),
  size: z.number().positive().max(MAX_FILE_SIZE, 'Discord attachments cannot exceed 25MB'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().nullish(),
  extension: z.string().min(1),
  aspectRatio: z.string().optional(),
})

const file = z
  .array(discordFileItem)
  .min(1, 'Discord file uploads require at least 1 file')
  .max(10, 'Discord supports up to 10 attachments')

export const discord = { file }
