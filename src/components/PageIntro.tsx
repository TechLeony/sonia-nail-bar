import type { ReactNode } from 'react'

export function PageIntro({ eyebrow, title, description, children }: {
  eyebrow: string; title: string; description: string; children?: ReactNode
}) {
  return (
    <section className="py-16 sm:py-24">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.12] sm:text-6xl">{title}</h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-muted">{description}</p>
      {children}
    </section>
  )
}
