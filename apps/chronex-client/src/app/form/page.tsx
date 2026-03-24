'use client'

import * as React from 'react'
import { trpc } from '@/utils/trpc'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import FileUpload from '@/components/fileUpload'
import IconRenderer from '@/lib/logoMapping'
import {
  PLATFORM_CONFIG,
  PLATFORM_MAP,
  type PlatformId,
  type PlatformConfig,
  type ContentType,
} from '@/config/platforms'
import type { platformSchema } from '@/types/zod/platform'
import {
  CalendarDays,
  ImageIcon,
  Play,
  Check,
  X,
  Upload,
  AlertCircle,
  Layers,
  Search,
  Loader2,
  Info,
  Send,
  Hash,
  MessageSquare,
  Type,
  Palette,
  Clock,
  Link2,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────
type MediaItem = {
  id: number
  name: string
  url: string
  type: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date | null
  downloadToken: string | null
}

interface PlatformFormData {
  platform: PlatformId
  contentType: string
  caption: string
  description?: string
  fileIds: string[]
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

// ─── Helpers ──────────────────────────────────────────────────────────
function formatDateForInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getAllowedMediaTypes(
  platform: PlatformId,
  contentTypeId: string,
): ('image' | 'video')[] | null {
  if (platform === 'instagram') {
    if (contentTypeId === 'image' || contentTypeId === 'story') return ['image']
    if (contentTypeId === 'reel') return ['video']
    if (contentTypeId === 'carousel') return ['image', 'video']
  }
  if (platform === 'linkedin') {
    if (contentTypeId === 'image') return ['image']
    if (contentTypeId === 'video') return ['video']
    if (contentTypeId === 'MultiPost') return ['image', 'video']
    if (contentTypeId === 'text') return null
  }
  if (platform === 'threads') {
    if (contentTypeId === 'text') return null
    if (contentTypeId === 'image') return ['image']
    if (contentTypeId === 'video') return ['video']
  }
  if (platform === 'slack' || platform === 'discord') {
    if (['message', 'embed'].includes(contentTypeId)) return null
    return ['image', 'video']
  }
  return ['image', 'video']
}

// ─── Inline Textarea ──────────────────────────────────────────────────
function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

// ─── Section Header ───────────────────────────────────────────────────
function SectionHeader({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          {number}
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <p className="mt-1 ml-10 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// ─── Media Picker Dialog (per-platform) ───────────────────────────────
function MediaPickerInline({
  media,
  isLoading,
  selectedIds,
  onToggle,
  allowedTypes,
  ctConfig,
  onUploadToggle,
  showUpload,
}: {
  media: MediaItem[]
  isLoading: boolean
  selectedIds: Set<string>
  onToggle: (id: string) => void
  allowedTypes: ('image' | 'video')[] | null
  ctConfig: ContentType
  onUploadToggle: () => void
  showUpload: boolean
}) {
  const [search, setSearch] = React.useState('')

  const filtered = React.useMemo(() => {
    if (!media) return []
    return media.filter((m) => {
      const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase())
      const matchesAllowed = !allowedTypes || allowedTypes.includes(m.type as 'image' | 'video')
      return matchesSearch && matchesAllowed
    })
  }, [media, search, allowedTypes])

  if (!ctConfig.requiresMedia && ctConfig.maxMedia === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ImageIcon className="size-4 text-muted-foreground" />
          Select media
        </label>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Badge
              className={cn(
                'text-xs',
                selectedIds.size >= ctConfig.minMedia && selectedIds.size <= ctConfig.maxMedia
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              {selectedIds.size}/{ctConfig.maxMedia} selected
            </Badge>
          )}
          <Button
            variant="outline"
            size="xs"
            className="cursor-pointer gap-1"
            onClick={onUploadToggle}
          >
            <Upload className="size-3" />
            Upload new
          </Button>
        </div>
      </div>

      {/* constraints hint */}
      <div className="flex items-center gap-1.5 rounded-md bg-accent/40 px-3 py-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5 shrink-0" />
        {ctConfig.minMedia === ctConfig.maxMedia
          ? `Exactly ${ctConfig.minMedia} file${ctConfig.minMedia > 1 ? 's' : ''} required`
          : `${ctConfig.minMedia}–${ctConfig.maxMedia} files`}
        {allowedTypes && <span className="ml-1">· {allowedTypes.join(' or ')} only</span>}
      </div>

      {showUpload && (
        <div className="rounded-xl border border-dashed border-border bg-accent/10 p-3">
          <FileUpload />
        </div>
      )}

      {/* search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full rounded-md border border-border/60 bg-muted/40 pr-3 pl-8 text-xs text-foreground transition-all outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
        />
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">No matching media found</p>
      ) : (
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-6">
            {filtered.map((item) => {
              const id = String(item.id)
              const selected = selectedIds.has(id)
              const disabled = !selected && selectedIds.size >= ctConfig.maxMedia
              const isVideo = item.type === 'video'

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle(id)}
                  className={cn(
                    'group relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 transition-all',
                    selected
                      ? 'border-primary ring-2 ring-primary/20'
                      : disabled
                        ? 'cursor-not-allowed border-border/20 opacity-30'
                        : 'border-transparent hover:border-primary/40',
                  )}
                >
                  <div className="relative size-full bg-muted">
                    {isVideo ? (
                      <>
                        <video
                          src={item.url}
                          className="size-full object-cover"
                          preload="metadata"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Play className="size-3.5 text-white" fill="white" />
                        </div>
                      </>
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
                      />
                    )}
                  </div>
                  {selected && (
                    <div className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-primary">
                      <Check className="size-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// ─── Platform Section ─────────────────────────────────────────────────
function PlatformSection({
  config,
  formData,
  onChange,
  media,
  mediaLoading,
  onRemovePlatform,
}: {
  config: PlatformConfig
  formData: PlatformFormData
  onChange: (updates: Partial<PlatformFormData>) => void
  media: MediaItem[]
  mediaLoading: boolean
  onRemovePlatform: () => void
}) {
  const [expanded, setExpanded] = React.useState(true)
  const [showUpload, setShowUpload] = React.useState(false)

  const ctConfig = config.contentTypes.find((ct) => ct.id === formData.contentType)!
  const allowedTypes = getAllowedMediaTypes(config.id, formData.contentType)
  const selectedMediaIds = new Set(formData.fileIds)

  const toggleMedia = (id: string) => {
    const current = new Set(formData.fileIds)
    if (current.has(id)) {
      current.delete(id)
    } else {
      current.add(id)
    }
    onChange({ fileIds: Array.from(current) })
  }

  // Caption limits per platform
  const captionLimit = (() => {
    if (config.id === 'instagram') return formData.contentType === 'story' ? 125 : 2200
    if (config.id === 'linkedin') return 3000
    if (config.id === 'threads') return 500
    if (config.id === 'slack') return 4000
    if (config.id === 'discord') return 2000
    return 2000
  })()

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card transition-all">
      {/* header bar */}
      <div
        className="flex cursor-pointer items-center gap-3 border-b border-border/40 px-5 py-3.5 transition-colors hover:bg-accent/20"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent/50">
          <IconRenderer name={config.id} size={22} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{config.label}</p>
          <p className="text-xs text-muted-foreground">
            {ctConfig.label}
            {formData.fileIds.length > 0 && ` · ${formData.fileIds.length} media`}
            {formData.caption && ` · ${formData.caption.length} chars`}
          </p>
        </div>

        {/* validation status */}
        {ctConfig.requiresMedia &&
          formData.fileIds.length >= ctConfig.minMedia &&
          formData.fileIds.length <= ctConfig.maxMedia && (
            <Badge className="bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Check className="mr-0.5 size-3" />
              Ready
            </Badge>
          )}
        {ctConfig.requiresMedia && formData.fileIds.length < ctConfig.minMedia && (
          <Badge className="bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
            Needs media
          </Badge>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemovePlatform()
          }}
          className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Remove platform"
        >
          <X className="size-4" />
        </button>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </div>

      {/* content */}
      {expanded && (
        <div className="space-y-5 px-5 py-5">
          {/* content type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {config.contentTypes.map((ct) => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => onChange({ contentType: ct.id, fileIds: [] })}
                  className={cn(
                    'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                    formData.contentType === ct.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* media selector (per-platform) */}
          <MediaPickerInline
            media={media}
            isLoading={mediaLoading}
            selectedIds={selectedMediaIds}
            onToggle={toggleMedia}
            allowedTypes={allowedTypes}
            ctConfig={ctConfig}
            onUploadToggle={() => setShowUpload(!showUpload)}
            showUpload={showUpload}
          />

          {/* caption / message */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="size-4 text-muted-foreground" />
              {config.id === 'slack' || config.id === 'discord' ? 'Message' : 'Caption'}
              {config.id === 'slack' && formData.contentType === 'file' && (
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              )}
            </label>
            <Textarea
              placeholder={`Start typing your ${config.label.toLowerCase()} caption...`}
              value={formData.caption}
              onChange={(e) => onChange({ caption: e.target.value })}
              maxLength={captionLimit}
              rows={4}
            />
            <p className="text-right text-xs text-muted-foreground">
              {formData.caption.length}/{captionLimit}
            </p>
          </div>

          {/* Threads description for text posts */}
          {config.id === 'threads' && formData.contentType === 'text' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Type className="size-4 text-muted-foreground" />
                Description
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Extended text content..."
                value={formData.description || ''}
                onChange={(e) => onChange({ description: e.target.value })}
                maxLength={10000}
                rows={3}
              />
              <p className="text-right text-xs text-muted-foreground">
                {(formData.description || '').length}/10,000
              </p>
            </div>
          )}

          {/* Slack fields */}
          {config.id === 'slack' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Hash className="size-4 text-muted-foreground" />
                  Channel ID <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="C0AEB4DEQHK"
                  value={formData.channelId || ''}
                  onChange={(e) => onChange({ channelId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Type className="size-4 text-muted-foreground" />
                  Workspace Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="my-workspace"
                  value={formData.workspaceName || ''}
                  onChange={(e) => onChange({ workspaceName: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Discord channel ID */}
          {config.id === 'discord' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Hash className="size-4 text-muted-foreground" />
                Channel ID <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="1042078978430746666"
                value={formData.channelId || ''}
                onChange={(e) => onChange({ channelId: e.target.value })}
              />
            </div>
          )}

          {/* Discord embed */}
          {config.id === 'discord' && formData.contentType === 'embed' && (
            <div className="space-y-4 rounded-lg border border-border/50 bg-accent/10 p-4">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Embed Configuration
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Title</label>
                  <Input
                    placeholder="Embed title"
                    value={formData.embed?.title || ''}
                    onChange={(e) =>
                      onChange({ embed: { ...formData.embed!, title: e.target.value } })
                    }
                    maxLength={256}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Palette className="size-3" /> Color
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="FF5733"
                      value={
                        formData.embed?.color !== undefined
                          ? formData.embed.color.toString(16).toUpperCase().padStart(6, '0')
                          : ''
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 16)
                        if (!isNaN(val) && val <= 0xffffff)
                          onChange({ embed: { ...formData.embed!, color: val } })
                      }}
                      maxLength={6}
                    />
                    {formData.embed?.color !== undefined && (
                      <div
                        className="size-8 shrink-0 rounded-md border"
                        style={{
                          backgroundColor: `#${formData.embed.color.toString(16).padStart(6, '0')}`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Embed description..."
                  value={formData.embed?.description || ''}
                  onChange={(e) =>
                    onChange({ embed: { ...formData.embed!, description: e.target.value } })
                  }
                  maxLength={4096}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Clock className="size-3" /> Timestamp
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.embed?.timestamp ? formData.embed.timestamp.slice(0, 16) : ''}
                    onChange={(e) =>
                      onChange({
                        embed: {
                          ...formData.embed!,
                          timestamp: new Date(e.target.value).toISOString(),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Footer</label>
                  <Input
                    placeholder="Footer text"
                    value={formData.embed?.footer?.text || ''}
                    onChange={(e) =>
                      onChange({ embed: { ...formData.embed!, footer: { text: e.target.value } } })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <ImageIcon className="size-3" /> Image URL
                  </label>
                  <Input
                    placeholder="https://..."
                    value={formData.embed?.image?.url || ''}
                    onChange={(e) =>
                      onChange({ embed: { ...formData.embed!, image: { url: e.target.value } } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Link2 className="size-3" /> Thumbnail URL
                  </label>
                  <Input
                    placeholder="https://..."
                    value={formData.embed?.thumbnail?.url || ''}
                    onChange={(e) =>
                      onChange({
                        embed: { ...formData.embed!, thumbnail: { url: e.target.value } },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function CreatePostForm() {
  const { data: media, isLoading: mediaLoading } = trpc.user.getMedia.useQuery()
  const createPost = trpc.post.createPost.useMutation()

  const [title, setTitle] = React.useState('')
  const [scheduledAt, setScheduledAt] = React.useState(() =>
    formatDateForInput(new Date(Date.now())),
  )
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<Set<PlatformId>>(new Set())
  const [platformData, setPlatformData] = React.useState<Map<PlatformId, PlatformFormData>>(
    new Map(),
  )
  const [errors, setErrors] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // ── platform toggle
  const togglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setPlatformData((pd) => {
          const m = new Map(pd)
          m.delete(id)
          return m
        })
      } else {
        next.add(id)
        const config = PLATFORM_MAP[id]
        const defaultCt = config.contentTypes[0]
        const defaultData: PlatformFormData = {
          platform: id,
          contentType: defaultCt.id,
          caption: '',
          fileIds: [],
        }
        if (id === 'discord') {
          defaultData.embed = {
            color: 0x5865f2,
            timestamp: new Date().toISOString(),
          }
        }
        setPlatformData((pd) => new Map(pd).set(id, defaultData))
      }
      return next
    })
  }

  const updatePlatform = (id: PlatformId, updates: Partial<PlatformFormData>) => {
    setPlatformData((prev) => {
      const m = new Map(prev)
      const current = m.get(id)
      if (current) m.set(id, { ...current, ...updates })
      return m
    })
  }

  // ── validation
  const validate = (): string[] => {
    const errs: string[] = []
    if (!title.trim()) errs.push('Post title is required')
    if (!scheduledAt) errs.push('Schedule date is required')
    else if (new Date(scheduledAt) < new Date(Date.now() - 60000))
      errs.push('Schedule date cannot be in the past')
    if (selectedPlatforms.size === 0) errs.push('Select at least one platform')

    for (const pid of selectedPlatforms) {
      const pd = platformData.get(pid)
      const config = PLATFORM_MAP[pid]
      const label = config?.label || pid
      if (!pd) {
        errs.push(`${label}: configuration missing`)
        continue
      }

      const ct = config?.contentTypes.find((c) => c.id === pd.contentType)
      if (ct?.requiresMedia) {
        if (pd.fileIds.length < ct.minMedia)
          errs.push(
            `${label} (${ct.label}): needs at least ${ct.minMedia} file${ct.minMedia > 1 ? 's' : ''}`,
          )
        if (pd.fileIds.length > ct.maxMedia)
          errs.push(`${label} (${ct.label}): max ${ct.maxMedia} file${ct.maxMedia > 1 ? 's' : ''}`)
      }

      if (['instagram', 'linkedin', 'threads'].includes(pid) && !pd.caption.trim())
        errs.push(`${label}: Caption is required`)
      if (
        (pid === 'slack' || pid === 'discord') &&
        pd.contentType === 'message' &&
        !pd.caption.trim()
      )
        errs.push(`${label}: Message is required`)
      if ((pid === 'slack' || pid === 'discord') && !pd.channelId?.trim())
        errs.push(`${label}: Channel ID is required`)
      if (pid === 'slack' && !pd.workspaceName?.trim())
        errs.push(`${label}: Workspace name is required`)
      if (pid === 'discord' && pd.contentType === 'embed') {
        if (!pd.embed?.timestamp) errs.push(`${label}: Embed timestamp is required`)
        if (pd.embed?.color === undefined) errs.push(`${label}: Embed color is required`)
      }
    }
    return errs
  }

  // ── build zod-compatible platform data payload
  // Each platform schema is a discriminatedUnion on `type`.
  // We must send EXACTLY the fields each variant defines — no extras, no missing required fields.
  const buildPlatformPayload = (pd: PlatformFormData): Record<string, unknown> => {
    const p = pd.platform
    const t = pd.contentType // maps to zod's `type` discriminator

    // ── Instagram: image | reel | carousel | story
    //    All have: { platform, type, caption, fileIds }
    if (p === 'instagram') {
      return {
        platform: p,
        type: t,
        caption: pd.caption || '',
        fileIds: pd.fileIds,
      }
    }

    // ── LinkedIn: image | video | MultiPost | text
    //    image/video/MultiPost: { platform, type, caption, fileIds }
    //    text:                  { platform, type, caption }  (no fileIds)
    if (p === 'linkedin') {
      if (t === 'text') {
        return { platform: p, type: t, caption: pd.caption || '' }
      }
      return {
        platform: p,
        type: t,
        caption: pd.caption || '',
        fileIds: pd.fileIds,
      }
    }

    // ── Threads: text | image | video | carousel
    //    text:     { platform, type, caption, description? }  (no fileIds)
    //    others:   { platform, type, caption, fileIds }
    if (p === 'threads') {
      if (t === 'text') {
        const payload: Record<string, unknown> = {
          platform: p,
          type: t,
          caption: pd.caption || '',
        }
        if (pd.description) payload.description = pd.description
        return payload
      }
      return {
        platform: p,
        type: t,
        caption: pd.caption || '',
        fileIds: pd.fileIds,
      }
    }

    // ── Slack: message | file
    //    message: { platform, type, caption, channelId, workspaceName }
    //    file:    { platform, type, caption?, fileIds, channelId, workspaceName }
    if (p === 'slack') {
      if (t === 'message') {
        return {
          platform: p,
          type: t,
          caption: pd.caption || '',
          channelId: pd.channelId || '',
          workspaceName: pd.workspaceName || '',
        }
      }
      // file
      const payload: Record<string, unknown> = {
        platform: p,
        type: t,
        fileIds: pd.fileIds,
        channelId: pd.channelId || '',
        workspaceName: pd.workspaceName || '',
      }
      if (pd.caption) payload.caption = pd.caption
      return payload
    }

    // ── Discord: message | embed | file
    //    message: { platform, type, caption, channelId }
    //    embed:   { platform, type, embed, channelId }     (NO caption)
    //    file:    { platform, type, caption?, fileIds, channelId }
    if (p === 'discord') {
      if (t === 'message') {
        return {
          platform: p,
          type: t,
          caption: pd.caption || '',
          channelId: pd.channelId || '',
        }
      }
      if (t === 'embed') {
        return {
          platform: p,
          type: t,
          embed: pd.embed || {
            color: 0x5865f2,
            timestamp: new Date().toISOString(),
          },
          channelId: pd.channelId || '',
        }
      }
      // file
      const payload: Record<string, unknown> = {
        platform: p,
        type: t,
        fileIds: pd.fileIds,
        channelId: pd.channelId || '',
      }
      if (pd.caption) payload.caption = pd.caption
      return payload
    }

    // Fallback (should not reach here)
    return { platform: p, type: t, caption: pd.caption || '' }
  }

  // ── submit
  const handleSubmit = async () => {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    setIsSubmitting(true)

    try {
      const allFileIds = new Set<string>()
      const platformdata = Array.from(selectedPlatforms).map((pid) => {
        const pd = platformData.get(pid)!
        pd.fileIds.forEach((id) => allFileIds.add(id))
        return buildPlatformPayload(pd)
      })

      await createPost.mutateAsync({
        title,
        content: Array.from(allFileIds),
        platforms: Array.from(selectedPlatforms),
        scheduledAt: new Date(scheduledAt),
        platformdata: platformdata as platformSchema,
      })

      // reset
      setTitle('')
      setScheduledAt(formatDateForInput(new Date(Date.now())))
      setSelectedPlatforms(new Set())
      setPlatformData(new Map())
      setErrors([])
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to create post'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderedPlatforms = PLATFORM_CONFIG.filter((p) => selectedPlatforms.has(p.id))

  return (
    <div className="min-h-screen bg-background">
      {/* page header */}
      <div className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create post</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Create a new post for your social media accounts.
            </p>
          </div>
          <Button
            className="cursor-pointer gap-2 px-5"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Schedule Post
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-8">
        {/* errors */}
        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <p className="text-sm font-medium">Please fix the following errors:</p>
            </div>
            <ul className="mt-2 space-y-0.5 pl-6">
              {errors.map((e, i) => (
                <li key={i} className="text-xs text-destructive/80">
                  • {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ────────── Section 1: Select Platforms ────────── */}
        <section>
          <SectionHeader
            number={1}
            title="Select Social Accounts"
            description="Choose which platforms to publish to"
          />
          <div className="flex flex-wrap gap-3">
            {PLATFORM_CONFIG.map((p) => {
              const selected = selectedPlatforms.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    'group flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 px-5 py-3.5 transition-all',
                    selected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-primary/30 hover:bg-accent/20',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-lg transition-all',
                      selected ? 'bg-primary/10' : 'bg-muted group-hover:bg-accent',
                    )}
                  >
                    <IconRenderer name={p.id} size={24} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{p.label}</span>
                  {selected && (
                    <div className="flex size-4 items-center justify-center rounded-full bg-primary">
                      <Check className="size-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ────────── Section 2: Basic Data ────────── */}
        <section>
          <SectionHeader
            number={2}
            title="Set basic data"
            description="Give your post a title to help you identify it later"
          />
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="post-title" className="text-sm font-medium text-foreground">
                Internal title
              </label>
              <Input
                id="post-title"
                placeholder="Internal title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="scheduled-at"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <CalendarDays className="size-4 text-muted-foreground" />
                Post date & time
              </label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={formatDateForInput(new Date())}
              />
              <p className="text-xs text-muted-foreground">
                {scheduledAt &&
                  new Date(scheduledAt).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                (local time)
              </p>
            </div>
          </div>
        </section>

        {/* ────────── Section 3: Platform-specific ────────── */}
        {orderedPlatforms.length > 0 && (
          <section>
            <SectionHeader
              number={3}
              title="Platform configuration"
              description="Configure media, captions, and settings for each platform separately"
            />
            <div className="space-y-4">
              {orderedPlatforms.map((config) => {
                const pd = platformData.get(config.id)
                if (!pd) return null
                return (
                  <PlatformSection
                    key={config.id}
                    config={config}
                    formData={pd}
                    onChange={(updates) => updatePlatform(config.id, updates)}
                    media={(media as MediaItem[]) || []}
                    mediaLoading={mediaLoading}
                    onRemovePlatform={() => togglePlatform(config.id)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* bottom action */}
        <div className="flex justify-end border-t border-border/50 pt-6 pb-8">
          <Button
            className="cursor-pointer gap-2 px-6"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Schedule Post
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
