function FooterSocialLinks({ links = [] }) {
  if (!links.length) {
    return null
  }

  return (
    <div className="footer-links" aria-label="Social links">
      {links.map((item) => {
        const external = /^(https?:)/.test(item.url)

        return (
          <a
            key={item.id || item.url}
            className="content-link"
            href={item.url}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {item.label}
          </a>
        )
      })}
    </div>
  )
}

export default FooterSocialLinks
