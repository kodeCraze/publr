import { poppins } from '@/lib/fonts'

export const BrandName = () => {
  return (
    <span
      className={`${poppins.className} relative inline-flex items-center text-xl font-semibold tracking-tight`}
    >
      {/* background layer */}
      <span className="absolute inset-0 -skew-y-3 rounded-md bg-primary/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)]" />

      {/* text */}
      <span className="relative z-10 px-5 py-2 tracking-wide text-primary-foreground">Chronex</span>
    </span>
  )
}
