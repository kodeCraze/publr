import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function HomePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-44" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      </Card>
    </div>
  )
}

export function PostsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-72" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function CreatePostPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-linear-to-b from-primary/3 to-transparent">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <Skeleton className="h-11 w-36" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function MediaPageSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-36" />
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function TokensPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="mb-8 rounded-2xl border border-border/60 bg-card px-6 py-5">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-44" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export function WorkspacePageSkeleton() {
  return (
    <div className="mx-auto min-h-full max-w-3xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <Skeleton className="h-9 w-full" />

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_80px_36px] items-center border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
            <span />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_80px_36px] items-center border-b border-border px-4 py-3 last:border-0"
            >
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-7 w-7" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </main>
  )
}
