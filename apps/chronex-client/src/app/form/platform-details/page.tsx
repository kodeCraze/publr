'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { trpc } from '@/utils/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import IconRenderer from '@/lib/logoMapping'
import { PLATFORM_MAP, type PlatformId } from '@/config/platforms'
import { usePostDraft, type PostDraft, type PlatformFieldData } from '@/lib/hooks/usePostDraft'
import {
  ArrowLeft,
  Check,
  Send,
  AlertCircle,
  Sparkles,
  Hash,
  MessageSquare,
  Type,
  Palette,
  Clock,
  ImageIcon,
  Link2,
  Loader2,
  CalendarDays,
} from 'lucide-react'

// ─── Step Indicator ───────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Post Details' },
    { num: 2, label: 'Platform Config' },
  ]
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                currentStep >= step.num
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {currentStep > step.num ? <Check className="size-4" /> : step.num}
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                currentStep >= step.num ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'h-px w-8 transition-colors',
                currentStep > 1 ? 'bg-primary' : 'bg-border',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Textarea Component (inline) ──────────────────────────────────────
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

// ─── Platform Form Components ─────────────────────────────────────────

/** Instagram form fields */
function InstagramFields({
  data,
  onChange,
}: {
  data: PlatformFieldData
  onChange: (updates: Partial<PlatformFieldData>) => void
}) {
  const maxCaption = data.type === 'story' ? 125 : 2200
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="size-4 text-muted-foreground" />
          Caption
        </label>
        <Textarea
          placeholder="Write your Instagram caption..."
          value={data.caption || ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          maxLength={maxCaption}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {(data.caption || '').length}/{maxCaption} characters
        </p>
      </div>
    </div>
  )
}

/** LinkedIn form fields */
function LinkedInFields({
  data,
  onChange,
}: {
  data: PlatformFieldData
  onChange: (updates: Partial<PlatformFieldData>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="size-4 text-muted-foreground" />
          Caption
        </label>
        <Textarea
          placeholder="Write your LinkedIn post..."
          value={data.caption || ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          maxLength={3000}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {(data.caption || '').length}/3000 characters
        </p>
      </div>
    </div>
  )
}

/** Threads form fields */
function ThreadsFields({
  data,
  onChange,
}: {
  data: PlatformFieldData
  onChange: (updates: Partial<PlatformFieldData>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="size-4 text-muted-foreground" />
          Caption
        </label>
        <Textarea
          placeholder="Write your Threads post..."
          value={data.caption || ''}
          onChange={(e) => onChange({ caption: e.target.value })}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {(data.caption || '').length}/500 characters
        </p>
      </div>
      {data.type === 'text' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Type className="size-4 text-muted-foreground" />
            Description <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            placeholder="Extended description..."
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            maxLength={10000}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {(data.description || '').length}/10,000 characters
          </p>
        </div>
      )}
    </div>
  )
}

/** Slack form fields */
function SlackFields({
  data,
  onChange,
}: {
  data: PlatformFieldData
  onChange: (updates: Partial<PlatformFieldData>) => void
}) {
  return (
    <div className="space-y-4">
      {(data.type === 'message' || data.type === 'file') && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="size-4 text-muted-foreground" />
            Message{' '}
            {data.type === 'file' && (
              <span className="text-xs text-muted-foreground">(optional)</span>
            )}
          </label>
          <Textarea
            placeholder="Write your Slack message..."
            value={data.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            maxLength={4000}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {(data.caption || '').length}/4000 characters
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Hash className="size-4 text-muted-foreground" />
            Channel ID <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. C0AEB4DEQHK"
            value={data.channelId || ''}
            onChange={(e) => onChange({ channelId: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Type className="size-4 text-muted-foreground" />
            Workspace Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. my-workspace"
            value={data.workspaceName || ''}
            onChange={(e) => onChange({ workspaceName: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

/** Discord form fields */
function DiscordFields({
  data,
  onChange,
}: {
  data: PlatformFieldData
  onChange: (updates: Partial<PlatformFieldData>) => void
}) {
  return (
    <div className="space-y-4">
      {data.type === 'message' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="size-4 text-muted-foreground" />
            Message
          </label>
          <Textarea
            placeholder="Write your Discord message..."
            value={data.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            maxLength={2000}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {(data.caption || '').length}/2000 characters
          </p>
        </div>
      )}

      {data.type === 'file' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquare className="size-4 text-muted-foreground" />
            Caption <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            placeholder="Optional message with files..."
            value={data.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            maxLength={2000}
            rows={2}
          />
        </div>
      )}

      {data.type === 'embed' && (
        <div className="space-y-4">
          <div className="space-y-4 rounded-lg border border-border/50 bg-accent/20 p-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Embed Configuration
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Type className="size-4 text-muted-foreground" />
                  Title
                </label>
                <Input
                  placeholder="Embed title"
                  value={data.embed?.title || ''}
                  onChange={(e) =>
                    onChange({
                      embed: { ...data.embed!, title: e.target.value },
                    })
                  }
                  maxLength={256}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Palette className="size-4 text-muted-foreground" />
                  Color (hex)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. FF5733"
                    value={
                      data.embed?.color !== undefined
                        ? data.embed.color.toString(16).toUpperCase().padStart(6, '0')
                        : ''
                    }
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 16)
                      if (!isNaN(val) && val <= 0xffffff) {
                        onChange({ embed: { ...data.embed!, color: val } })
                      }
                    }}
                    maxLength={6}
                  />
                  {data.embed?.color !== undefined && (
                    <div
                      className="size-9 shrink-0 rounded-md border border-border"
                      style={{
                        backgroundColor: `#${data.embed.color.toString(16).padStart(6, '0')}`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                placeholder="Embed description..."
                value={data.embed?.description || ''}
                onChange={(e) =>
                  onChange({
                    embed: { ...data.embed!, description: e.target.value },
                  })
                }
                maxLength={4096}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="size-4 text-muted-foreground" />
                  Timestamp (ISO)
                </label>
                <Input
                  type="datetime-local"
                  value={data.embed?.timestamp ? data.embed.timestamp.slice(0, 16) : ''}
                  onChange={(e) =>
                    onChange({
                      embed: {
                        ...data.embed!,
                        timestamp: new Date(e.target.value).toISOString(),
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Footer text</label>
                <Input
                  placeholder="Footer text"
                  value={data.embed?.footer?.text || ''}
                  onChange={(e) =>
                    onChange({
                      embed: {
                        ...data.embed!,
                        footer: { text: e.target.value },
                      },
                    })
                  }
                  maxLength={2000}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  Image URL
                </label>
                <Input
                  placeholder="https://..."
                  value={data.embed?.image?.url || ''}
                  onChange={(e) =>
                    onChange({
                      embed: { ...data.embed!, image: { url: e.target.value } },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Link2 className="size-4 text-muted-foreground" />
                  Thumbnail URL
                </label>
                <Input
                  placeholder="https://..."
                  value={data.embed?.thumbnail?.url || ''}
                  onChange={(e) =>
                    onChange({
                      embed: { ...data.embed!, thumbnail: { url: e.target.value } },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Hash className="size-4 text-muted-foreground" />
          Channel ID <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. 1042078978430746666"
          value={data.channelId || ''}
          onChange={(e) => onChange({ channelId: e.target.value })}
        />
      </div>
    </div>
  )
}

// ─── Draft Summary ────────────────────────────────────────────────────
function DraftSummary({ draft }: { draft: PostDraft }) {
  return (
    <Card size="sm">
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Title</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{draft.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Scheduled</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              {new Date(draft.scheduledAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Media</p>
            <p className="mt-0.5 text-sm text-foreground">
              {draft.selectedMediaIds.length} file{draft.selectedMediaIds.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function PlatformDetailsForm() {
  const router = useRouter()
  const { loadDraft, loadPlatformData, savePlatformData, clearDraft } = usePostDraft()
  const createPost = trpc.post.createPost.useMutation()

  const [draft, setDraft] = React.useState<PostDraft | null>(null)
  const [platformData, setPlatformData] = React.useState<Map<PlatformId, PlatformFieldData>>(
    new Map(),
  )
  const [errors, setErrors] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<string>('')

  // Load draft on mount
  React.useEffect(() => {
    const savedDraft = loadDraft()
    if (!savedDraft || savedDraft.platforms.length === 0) {
      router.push('/form')
      return
    }
    setDraft(savedDraft)
    setActiveTab(savedDraft.platforms[0].platform)

    // Initialize platform data from saved or defaults
    const savedPlatformData = loadPlatformData()
    const dataMap = new Map<PlatformId, PlatformFieldData>()

    for (const sel of savedDraft.platforms) {
      const existing = savedPlatformData?.find((d) => d.platform === sel.platform)
      if (existing) {
        dataMap.set(sel.platform, existing)
      } else {
        const defaultData: PlatformFieldData = {
          platform: sel.platform,
          type: sel.contentType,
          caption: '',
        }

        // Set fileIds from selected media if content type requires media
        const ctConfig = PLATFORM_MAP[sel.platform]?.contentTypes.find(
          (ct) => ct.id === sel.contentType,
        )
        if (ctConfig?.requiresMedia || (ctConfig && ctConfig.maxMedia > 0)) {
          defaultData.fileIds = savedDraft.selectedMediaIds
        }

        // Set defaults for embed
        if (sel.platform === 'discord' && sel.contentType === 'embed') {
          defaultData.embed = {
            title: '',
            description: '',
            color: 0x5865f2,
            timestamp: new Date().toISOString(),
          }
        }

        dataMap.set(sel.platform, defaultData)
      }
    }

    setPlatformData(dataMap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatePlatformField = React.useCallback(
    (platform: PlatformId, updates: Partial<PlatformFieldData>) => {
      setPlatformData((prev) => {
        const next = new Map(prev)
        const current = next.get(platform)
        if (current) {
          next.set(platform, { ...current, ...updates })
        }
        return next
      })
    },
    [],
  )

  // Auto-save platform data
  React.useEffect(() => {
    if (platformData.size > 0) {
      savePlatformData(Array.from(platformData.values()))
    }
  }, [platformData, savePlatformData])

  // ── Validation
  const validate = React.useCallback((): string[] => {
    if (!draft) return ['No draft found']
    const errs: string[] = []

    for (const sel of draft.platforms) {
      const pData = platformData.get(sel.platform)
      if (!pData) {
        errs.push(`Missing data for ${PLATFORM_MAP[sel.platform]?.label}`)
        continue
      }

      const label = PLATFORM_MAP[sel.platform]?.label || sel.platform

      // check required caption
      if (
        sel.platform === 'instagram' ||
        sel.platform === 'linkedin' ||
        sel.platform === 'threads'
      ) {
        if (!pData.caption?.trim()) {
          errs.push(`${label}: Caption is required`)
        }
      }
      if (sel.platform === 'slack' || sel.platform === 'discord') {
        if (sel.contentType === 'message' && !pData.caption?.trim()) {
          errs.push(`${label}: Message is required`)
        }
      }

      // Slack/Discord channel ID
      if (sel.platform === 'slack' || sel.platform === 'discord') {
        if (!pData.channelId?.trim()) {
          errs.push(`${label}: Channel ID is required`)
        }
      }

      // Slack workspace name
      if (sel.platform === 'slack') {
        if (!pData.workspaceName?.trim()) {
          errs.push(`${label}: Workspace name is required`)
        }
      }

      // Discord embed
      if (sel.platform === 'discord' && sel.contentType === 'embed') {
        if (!pData.embed?.timestamp) {
          errs.push(`${label}: Embed timestamp is required`)
        }
        if (pData.embed?.color === undefined) {
          errs.push(`${label}: Embed color is required`)
        }
      }
    }

    return errs
  }, [draft, platformData])

  // ── Submit
  const handleSubmit = async () => {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    if (!draft) return

    setErrors([])
    setIsSubmitting(true)

    try {
      const platformdata = draft.platforms.map((sel) => {
        const pData = platformData.get(sel.platform)!
        return pData
      })

      await createPost.mutateAsync({
        title: draft.title,
        content: draft.selectedMediaIds,
        platforms: draft.platforms.map((s) => s.platform),
        scheduledAt: new Date(draft.scheduledAt),
        platformdata: platformdata as any,
      })

      clearDraft()
      router.push('/dashboard')
    } catch (err: any) {
      setErrors([err.message || 'Failed to create post'])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <div className="border-b border-border/50 bg-linear-to-b from-accent/30 to-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Platform Configuration
                </h1>
              </div>
              <p className="mt-1 ml-[52px] text-sm text-muted-foreground">
                Add platform-specific content for each selected platform
              </p>
            </div>
            <StepIndicator currentStep={2} />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        {/* draft summary */}
        <DraftSummary draft={draft} />

        {/* errors */}
        {errors.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm font-medium">Please fix the following:</p>
            </div>
            <ul className="mt-2 space-y-1">
              {errors.map((err, i) => (
                <li key={i} className="text-xs text-destructive/80">
                  • {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* platform tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full justify-start">
                {draft.platforms.map((sel) => {
                  const config = PLATFORM_MAP[sel.platform]
                  const ctConfig = config?.contentTypes.find((ct) => ct.id === sel.contentType)
                  return (
                    <TabsTrigger key={sel.platform} value={sel.platform} className="gap-2 px-4">
                      <IconRenderer name={sel.platform} size={16} />
                      <span className="hidden sm:inline">{config?.label}</span>
                      <Badge variant="secondary" className="hidden text-[10px] sm:flex">
                        {ctConfig?.label}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {draft.platforms.map((sel) => {
                const pData = platformData.get(sel.platform)
                if (!pData) return null

                const config = PLATFORM_MAP[sel.platform]
                const ctConfig = config?.contentTypes.find((ct) => ct.id === sel.contentType)

                return (
                  <TabsContent key={sel.platform} value={sel.platform}>
                    <div className="space-y-4">
                      {/* platform header */}
                      <div className="flex items-center gap-3 rounded-lg bg-accent/30 px-4 py-3">
                        <IconRenderer name={sel.platform} size={28} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{config?.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {ctConfig?.label}
                            {ctConfig?.requiresMedia && (
                              <span>
                                {' '}
                                · {ctConfig.minMedia}–{ctConfig.maxMedia} media file
                                {ctConfig.maxMedia > 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                        {/* media badges */}
                        {pData.fileIds && pData.fileIds.length > 0 && (
                          <Badge className="ml-auto bg-emerald-500/10 text-emerald-500">
                            <ImageIcon className="mr-1 size-3" />
                            {pData.fileIds.length} file{pData.fileIds.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* platform-specific fields */}
                      {sel.platform === 'instagram' && (
                        <InstagramFields
                          data={pData}
                          onChange={(updates) => updatePlatformField(sel.platform, updates)}
                        />
                      )}
                      {sel.platform === 'linkedin' && (
                        <LinkedInFields
                          data={pData}
                          onChange={(updates) => updatePlatformField(sel.platform, updates)}
                        />
                      )}
                      {sel.platform === 'threads' && (
                        <ThreadsFields
                          data={pData}
                          onChange={(updates) => updatePlatformField(sel.platform, updates)}
                        />
                      )}
                      {sel.platform === 'slack' && (
                        <SlackFields
                          data={pData}
                          onChange={(updates) => updatePlatformField(sel.platform, updates)}
                        />
                      )}
                      {sel.platform === 'discord' && (
                        <DiscordFields
                          data={pData}
                          onChange={(updates) => updatePlatformField(sel.platform, updates)}
                        />
                      )}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* footer actions */}
        <div className="flex items-center justify-between pb-8">
          <Button
            variant="outline"
            className="cursor-pointer gap-2"
            onClick={() => router.push('/form')}
          >
            <ArrowLeft className="size-4" />
            Back to Details
          </Button>
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
