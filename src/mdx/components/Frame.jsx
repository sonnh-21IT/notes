import '@/styles/public/mdx/media.css'

function Frame({ children, caption }) {
  return (
    <figure className="mdx-frame">
      <div className="mdx-frame-body">{children}</div>
      {caption ? <figcaption className="mdx-frame-caption">{caption}</figcaption> : null}
    </figure>
  )
}

export default Frame
