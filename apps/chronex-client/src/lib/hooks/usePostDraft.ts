'use client'

import { useCallback } from 'react'
import type { PlatformId } from '@/config/platforms'

export interface PlatformSelection {
  platform: PlatformId
  contentType: string
}

export interface PostDraft {
  title: string
  scheduledAt: string
  platforms: PlatformSelection[]
  selectedMediaIds: string[]
}

export interface PlatformFieldData {
  platform: PlatformId
  type: string
  caption?: string
  description?: string
  title?: string
  hashtags?: string
  fileIds?: string[]
  channelId?: string
  workspaceName?: string
  embed?: {
    title?: string
    description?: string
    color: number
    footer?: { text: string }
    timestamp: string
    image?: { url: string }
    thumbnail?: { url: string }
  }
}

const DRAFT_KEY = 'chronex_post_draft'
const PLATFORM_DATA_KEY = 'chronex_platform_data'

export function usePostDraft() {
  const saveDraft = useCallback((draft: PostDraft) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [])

  const loadDraft = useCallback((): PostDraft | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return null
      return JSON.parse(raw) as PostDraft
    } catch {
      return null
    }
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(PLATFORM_DATA_KEY)
  }, [])

  const savePlatformData = useCallback((data: PlatformFieldData[]) => {
    localStorage.setItem(PLATFORM_DATA_KEY, JSON.stringify(data))
  }, [])

  const loadPlatformData = useCallback((): PlatformFieldData[] | null => {
    try {
      const raw = localStorage.getItem(PLATFORM_DATA_KEY)
      if (!raw) return null
      return JSON.parse(raw) as PlatformFieldData[]
    } catch {
      return null
    }
  }, [])

  return { saveDraft, loadDraft, clearDraft, savePlatformData, loadPlatformData }
}
