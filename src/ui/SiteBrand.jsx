import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import { resolveSiteBrand } from '@/data/siteDefaults'

function SiteBrand({ title, tagline, loading = false }) {
  const brand = resolveSiteBrand({ title, tagline })
  const waiting = loading && !title?.trim()
  const showSkeleton = useDeferredLoading(waiting)

  if (showSkeleton) {
    return (
      <div className="site-brand site-brand--skeleton" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading site name</span>
        <span className="site-brand-skeleton site-brand-skeleton--title" aria-hidden="true" />
        <span className="site-brand-skeleton site-brand-skeleton--tagline" aria-hidden="true" />
      </div>
    )
  }

  if (waiting) {
    return (
      <div className="site-brand site-brand--pending" aria-busy="true">
        <span className="visually-hidden">Loading site name</span>
      </div>
    )
  }

  return (
    <div className="site-brand">
      <span className="site-logo">{brand.title}</span>
      {brand.tagline ? <span className="site-tagline">{brand.tagline}</span> : null}
    </div>
  )
}

export default SiteBrand
