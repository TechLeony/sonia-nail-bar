/** Small, static line artwork inspired by the approved reference. */
export function BrandMotif({ kind = 'bow', className = '' }: {
  kind?: 'bow' | 'heart' | 'sparkle'
  className?: string
}) {
  return (
    <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="2.3"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {kind === 'bow' && <path d="M40 26C27 8 6 9 10 20c3 9 21 9 30 6Zm0 0C53 8 74 9 70 20c-3 9-21 9-30 6Zm0 0L17 48m23-22 24 22M36 27c2-5 7-5 9 0" />}
      {kind === 'heart' && <path d="M20 49C20 24 13 8 24 10c9 1 8 18 7 23C55-2 77 16 53 34L21 55m-5 3 36-16" />}
      {kind === 'sparkle' && <path d="m36 5 6 19 17 7-17 6-6 20-6-20-18-6 18-7L36 5Zm26 35 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />}
    </svg>
  )
}
