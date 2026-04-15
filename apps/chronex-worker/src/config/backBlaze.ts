import { Buffer } from 'node:buffer'
import type { Env } from '../index'

interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
  apiInfo: {
    storageApi: {
      downloadUrl: string
      apiUrl: string
    }
  }
}

interface B2DownloadAuthResponse {
  authorizationToken: string
}

type B2Credentials = Pick<Env, 'B2_KEY_ID' | 'B2_APP_KEY'>
type B2DownloadEnv = Pick<Env, 'B2_DOWNLOAD_URL' | 'B2_BUCKET_NAME'>
type FullB2Env = B2Credentials & B2DownloadEnv

function getValidatedB2BaseUrls(env: B2DownloadEnv) {
  const rawDownloadUrl = env.B2_DOWNLOAD_URL

  if (!rawDownloadUrl) {
    throw new Error('B2_DOWNLOAD_URL is not configured')
  }

  try {
    const normalizedDownloadUrl = new URL(rawDownloadUrl).toString().replace(/\/$/, '')
    return { downloadUrl: normalizedDownloadUrl }
  } catch {
    throw new Error(`B2_DOWNLOAD_URL is invalid: ${rawDownloadUrl}`)
  }
}

async function authorizeB2Account(env: B2Credentials): Promise<B2AuthResponse> {
  if (!env.B2_KEY_ID) throw new Error('B2_KEY_ID is not configured')
  if (!env.B2_APP_KEY) throw new Error('B2_APP_KEY is not configured')

  const credentials = Buffer.from(`${env.B2_KEY_ID}:${env.B2_APP_KEY}`).toString('base64')

  const response = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (!response.ok) {
    throw new Error(`B2 authorization failed: ${response.statusText}`)
  }

  return response.json() as Promise<B2AuthResponse>
}

async function getDownloadAuthorization(
  authToken: string,
  apiUrl: string,
  bucketId: string,
  fileNamePrefix: string,
  validDurationSeconds = 3600,
): Promise<B2DownloadAuthResponse> {
  const response = await fetch(`${apiUrl}/b2api/v3/b2_get_download_authorization`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bucketId,
      fileNamePrefix,
      validDurationInSeconds: validDurationSeconds,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get download auth: ${response.statusText}`)
  }
  return response.json()
}

async function getFileInfo(
  authToken: string,
  apiUrl: string,
  fileId: string,
): Promise<{ fileName: string; bucketId: string }> {
  const response = await fetch(`${apiUrl}/b2api/v3/b2_get_file_info`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get file info: ${response.statusText}`)
  }
  return response.json() as Promise<{ fileName: string; bucketId: string }>
}

function buildAuthorizedDownloadUrl(fileName: string, downloadToken: string, env: B2DownloadEnv) {
  const { downloadUrl } = getValidatedB2BaseUrls(env)
  const bucketName = env.B2_BUCKET_NAME ?? 'publr'
  return `${downloadUrl}/file/${bucketName}/${fileName}?Authorization=${encodeURIComponent(downloadToken)}`
}

async function getBackblazeDownloadAuthorization(
  bucketId: string,
  fileName: string,
  env: B2Credentials,
): Promise<string> {
  const authData = await authorizeB2Account(env)
  const { authorizationToken, apiInfo } = authData
  const apiUrl = apiInfo.storageApi.apiUrl

  const { authorizationToken: downloadToken } = await getDownloadAuthorization(
    authorizationToken,
    apiUrl,
    bucketId,
    fileName,
  )

  return downloadToken
}

export async function getBackblazeSignedUrlForFileName(
  fileName: string,
  bucketId: string,
  env: FullB2Env,
): Promise<{ url: string; downloadToken: string }> {
  try {
    const downloadToken = await getBackblazeDownloadAuthorization(bucketId, fileName, env)
    return {
      url: buildAuthorizedDownloadUrl(fileName, downloadToken, env),
      downloadToken,
    }
  } catch (error) {
    throw new Error(`Error generating Backblaze signed URL: ${error}`)
  }
}

function extractBackblazeFileName(rawUrl: string): string | null {
  if (!rawUrl?.trim()) {
    return null
  }

  try {
    const url = new URL(rawUrl)

    if (url.pathname.includes('b2_download_file_by_id') || url.searchParams.has('fileId')) {
      return null
    }

    const pathMatch = url.pathname.match(/^\/file\/[^/]+\/(.+)$/)
    if (pathMatch?.[1]) {
      return decodeURIComponent(pathMatch[1])
    }

    const pathname = url.pathname.replace(/^\/+/, '')
    return pathname ? decodeURIComponent(pathname) : null
  } catch {
    return null
  }
}

export async function getBackblazeSignedUrl(
  rawUrl: string,
  bucketId: string,
  env: FullB2Env,
): Promise<{ url: string; downloadToken: string }> {
  try {
    const authData = await authorizeB2Account(env)
    const { authorizationToken, apiInfo } = authData
    const apiUrl = apiInfo.storageApi.apiUrl
    let fileName = extractBackblazeFileName(rawUrl)

    if (!fileName) {
      const url = new URL(rawUrl)
      const fileId = url.searchParams.get('fileId')
      if (!fileId) {
        throw new Error('fileId parameter missing from URL')
      }
      const fileInfo = await getFileInfo(authorizationToken, apiUrl, fileId)
      fileName = fileInfo.fileName
    }

    return getBackblazeSignedUrlForFileName(fileName, bucketId, env)
  } catch (error) {
    throw new Error(`Error generating Backblaze signed URL: ${error}`)
  }
}
