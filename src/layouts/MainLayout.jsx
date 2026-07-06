import { Outlet } from 'react-router-dom'
import FooterSocialLinks from '@/ui/FooterSocialLinks'
import SiteHeader from '@/ui/SiteHeader'
import { useSiteContent } from '@/hooks/useSiteContent'

function MainLayout() {
  const { error, siteContent } = useSiteContent()
  const header = siteContent?.header || {}
  const footer = siteContent?.footer || {}

  return (
    <div className="site-shell">
      <SiteHeader title={header.title} tagline={header.tagline} />

      <main className="site-main">
        <div className="container">
          {error && (
            <p className="content-lead site-settings-error" role="alert">
              Site settings unavailable: {error.message}
            </p>
          )}
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-brand">
            <span className="site-logo">{header.title || 'Ryan'}</span>
            {header.tagline && <span className="site-tagline">{header.tagline}</span>}
          </div>
          <FooterSocialLinks links={footer.socialLinks} />
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
