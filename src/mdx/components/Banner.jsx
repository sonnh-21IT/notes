import '@/styles/public/mdx/banner.css'

function Banner({ children, type = 'info' }) {
  const kind = String(type || 'info').toLowerCase()

  return (
    <aside className={`mdx-banner mdx-banner--${kind}`} role="note">
      <div className="mdx-banner-body">{children}</div>
    </aside>
  )
}

export default Banner
