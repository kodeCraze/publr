import { z } from 'zod'

const MAX_FILE_SIZE = 1024

const slackFileItem = z.object({
  url: z.string().min(1),
  type: z.enum(['image', 'video']),
  size: z.number().positive().max(MAX_FILE_SIZE, 'Slack files cannot exceed 1GB'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().nullish(),
  extension: z.enum([
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'svg',

    'mp4',
    'mov',
    'avi',
    'mkv',
    'webm',
    'm4v',
    'flv',

    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'csv',
    'zip',
    'rar',
  ]),
  aspectRatio: z.string().optional(),
})

const file = z
  .array(slackFileItem)
  .min(1, 'Slack file uploads require at least 1 file')
  .max(10, 'Slack file uploads support up to 10 files')

export const slack = { file }
