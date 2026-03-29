import { poppins } from '@/lib/fonts'

export const BrandName = () => {
  return (
    <span
      className={`${poppins.className} relative inline-flex items-center text-lg font-semibold tracking-tight sm:text-xl`}
    >
      {}
      <span className="absolute inset-0 -skew-y-3 rounded-md bg-primary/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)]" />

      {}
      <span className="relative z-10 px-4 py-1.5 tracking-wide text-primary-foreground sm:px-5 sm:py-2">
        Chronex
      </span>
    </span>
  )
}
