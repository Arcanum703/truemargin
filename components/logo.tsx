export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="TrueMargin" className={className}>
    <rect width="64" height="64" rx="16" fill="#d94b0f" />
    <path d="M14 22h36v8H36v20h-8V30H14z" fill="#fff" />
    <path d="M40 50l10-14 4 6 4-6v14h-4v-4l-4 6-4-6v4z" fill="#ffe6d5" opacity=".95" />
    <rect x="14" y="14" width="36" height="4" rx="2" fill="#ffe6d5" />
  </svg>;
}

export function Wordmark({ tagline }: { tagline?: string }) {
  return <span className="flex items-center gap-3">
    <LogoMark />
    <span className="leading-tight">
      <span className="block font-display text-lg font-semibold tracking-tight text-ink-900">True<span className="text-brand-600">Margin</span></span>
      {tagline && <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">{tagline}</span>}
    </span>
  </span>;
}
