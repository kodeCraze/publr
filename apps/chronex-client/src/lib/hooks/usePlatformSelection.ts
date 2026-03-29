'use client'

import { useState, useCallback } from 'react'
import {
  PLATFORM_CONFIG,
  PLATFORM_MAP,
  type PlatformId,
  type ContentType,
} from '@/config/platforms'

export interface PlatformSelection {
  platform: PlatformId
  contentType: string
}

export interface UsePlatformSelectionReturn {
  availablePlatforms: typeof PLATFORM_CONFIG

  selections: PlatformSelection[]

  selectedPlatformIds: PlatformId[]

  togglePlatform: (platform: PlatformId) => void

  setContentType: (platform: PlatformId, contentType: string) => void

  isPlatformSelected: (platform: PlatformId) => boolean

  getContentType: (platform: PlatformId) => string | undefined

  getContentTypeConfig: (platform: PlatformId) => ContentType | undefined

  clearAll: () => void
}

export function usePlatformSelection(): UsePlatformSelectionReturn {
  const [selections, setSelections] = useState<PlatformSelection[]>([])

  const togglePlatform = useCallback((platform: PlatformId) => {
    setSelections((prev) => {
      const exists = prev.some((s) => s.platform === platform)
      if (exists) {
        return prev.filter((s) => s.platform !== platform)
      }

      const defaultType = PLATFORM_MAP[platform].contentTypes[0].id
      return [...prev, { platform, contentType: defaultType }]
    })
  }, [])

  const setContentType = useCallback((platform: PlatformId, contentType: string) => {
    setSelections((prev) => prev.map((s) => (s.platform === platform ? { ...s, contentType } : s)))
  }, [])

  const isPlatformSelected = useCallback(
    (platform: PlatformId) => selections.some((s) => s.platform === platform),
    [selections],
  )

  const getContentType = useCallback(
    (platform: PlatformId) => selections.find((s) => s.platform === platform)?.contentType,
    [selections],
  )

  const getContentTypeConfig = useCallback(
    (platform: PlatformId): ContentType | undefined => {
      const type = selections.find((s) => s.platform === platform)?.contentType
      if (!type) return undefined
      return PLATFORM_MAP[platform].contentTypes.find((ct) => ct.id === type)
    },
    [selections],
  )

  const clearAll = useCallback(() => setSelections([]), [])

  return {
    availablePlatforms: PLATFORM_CONFIG,
    selections,
    selectedPlatformIds: selections.map((s) => s.platform),
    togglePlatform,
    setContentType,
    isPlatformSelected,
    getContentType,
    getContentTypeConfig,
    clearAll,
  }
}
