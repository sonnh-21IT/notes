import { Children, isValidElement } from 'react'

export function getLanguage(children, className = '') {
  const fromPre = className.match(/language-([\w-]+)/)?.[1]
  if (fromPre) return fromPre

  if (isValidElement(children) && typeof children.props?.className === 'string') {
    return children.props.className.match(/language-([\w-]+)/)?.[1] || ''
  }

  return ''
}

export function getRawCode(children) {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return Children.toArray(children).map(getRawCode).join('')
  if (isValidElement(children)) return getRawCode(children.props.children)
  return ''
}
