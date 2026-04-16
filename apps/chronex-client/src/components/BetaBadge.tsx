import { IS_BETA } from '@/config/site'

/**
 * Renders a "Beta" badge when IS_BETA is true, nothing otherwise.
 * Drop it next to any brand-name element; it is purely decorative.
 */
export function BetaBadge() {
  if (!IS_BETA) return null

  return (
    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-primary uppercase select-none">
      Beta
    </span>
  )
}
