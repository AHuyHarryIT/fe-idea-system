interface SectionCardProps {
  title?: string
  description?: string
  children: React.ReactNode
}

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_18px_48px_rgba(15,23,42,0.06)]">
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
