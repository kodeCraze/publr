import { poppins } from '@/lib/fonts'

export const BrandName = () => {
  return (
    <span className={`${poppins.className} inline-flex items-center gap-2.5`}>
      <span className="relative inline-flex size-5 items-center justify-center rounded-full border border-primary/35 bg-primary/12 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.55)]">
        <span className="size-2 rounded-full bg-primary" />
      </span>
      <span className="text-lg font-semibold tracking-[-0.03em] text-foreground sm:text-xl">
        publr
      </span>
    </span>
  )
}
