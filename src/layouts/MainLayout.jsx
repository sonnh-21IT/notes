import { Outlet } from 'react-router-dom'
import FooterSocialLinks from '@/ui/FooterSocialLinks'
import SiteBrand from '@/ui/SiteBrand'
import SiteHeader from '@/ui/SiteHeader'
import { useSiteContent } from '@/hooks/useSiteContent'

function MainLayout() {
  const { loading, error, siteContent } = useSiteContent()
  const header = siteContent?.header || {}
  const footer = siteContent?.footer || {}

  return (
    <div className="site-shell">
      <SiteHeader title={header.title} tagline={header.tagline} loading={loading} />

      <main className="site-main">
        <div className="container">
          {error && (
            <p className="content-lead site-settings-error" role="alert">
              Some site details couldn&apos;t load. The rest of the page may still work.
            </p>
          )}
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <SiteBrand title={header.title} tagline={header.tagline} loading={loading} />
          <FooterSocialLinks links={footer.socialLinks} />
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
