import { Helmet } from 'react-helmet-async'
import { useSiteContent } from '@/hooks/useSiteContent'
import { withAppBase } from '@/utils/appBase'

function resolveSiteOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function PageMeta({
  title,
  description,
  path,
  type = 'website',
  image,
}) {
  const { siteContent } = useSiteContent()
  const siteName = siteContent?.header?.title?.trim() || 'Portfolio'
  const tagline = siteContent?.header?.tagline?.trim() || ''
  const pageTitle = title?.trim()
  const fullTitle = pageTitle ? `${pageTitle} · ${siteName}` : (tagline ? `${siteName} · ${tagline}` : siteName)
  const metaDescription = description?.trim() || tagline || undefined
  const origin = resolveSiteOrigin()
  const canonicalUrl = path && origin ? `${origin}${withAppBase(path)}` : undefined
  const imageUrl = image?.startsWith('http') ? image : (image && origin ? `${origin}${withAppBase(image)}` : undefined)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      <meta property="og:title" content={fullTitle} />
      {metaDescription && <meta property="og:description" content={metaDescription} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content={type} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      {metaDescription && <meta name="twitter:description" content={metaDescription} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  )
}

export default PageMeta
