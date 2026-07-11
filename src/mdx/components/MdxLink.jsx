import { Link } from 'react-router-dom'

function MdxLink({ href = '', children, ...props }) {
  if (href.startsWith('/')) {
    return (
      <Link className="content-link" to={href} viewTransition {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a className="content-link" href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

export default MdxLink
