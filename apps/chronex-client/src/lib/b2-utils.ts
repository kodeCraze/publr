import { TRPCError } from '@trpc/server'

export function getValidatedB2DownloadUrl(): string {
  const rawBaseUrl = process.env.B2_DOWNLOAD_URL

  if (!rawBaseUrl) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'B2_DOWNLOAD_URL is not configured',
    })
  }

  try {
    const normalized = new URL(rawBaseUrl)
    return normalized.toString().replace(/\/$/, '')
  } catch {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `B2_DOWNLOAD_URL is invalid: ${rawBaseUrl}`,
    })
  }
}

export function buildB2SignedUrl(name: string, token: string): string {
  const baseUrl = getValidatedB2DownloadUrl()
  const bucketName = process.env.B2_BUCKET_NAME ?? 'publr'
  return `${baseUrl}/file/${bucketName}/${name}?Authorization=${encodeURIComponent(token)}`
}
