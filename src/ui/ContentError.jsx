import { Link } from 'react-router-dom'

function ContentError({
  label = 'Something’s off',
  title,
  description,
  actionLabel,
  onAction,
  secondaryTo,
  secondaryLabel,
}) {
  return (
    <section className="content-error" role="alert">
      {label ? <p className="content-error-label">{label}</p> : null}
      <h1 className="content-error-title">{title}</h1>
      {description ? <p className="content-error-lead">{description}</p> : null}

      {(actionLabel && onAction) || (secondaryTo && secondaryLabel) ? (
        <div className="content-error-actions">
          {actionLabel && onAction ? (
            <button type="button" className="content-error-button" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
          {secondaryTo && secondaryLabel ? (
            <Link className="content-error-link" to={secondaryTo} viewTransition>
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default ContentError
