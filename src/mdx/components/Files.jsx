import '@/styles/public/mdx/files.css'
import { isSafeAssetUrl } from '@/utils/safeUrl'
import { FileIcon, FolderClosed, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Files({ children, label = 'Files' }) {
  return (
    <div className="mdx-files" role="tree" aria-label={label}>
      <ul className="mdx-files-list">{children}</ul>
    </div>
  )
}

function Folder({ name, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = open ? FolderOpen : FolderClosed

  return (
    <li className="mdx-file-item mdx-file-folder" role="treeitem" aria-expanded={open}>
      <button
        type="button"
        className="mdx-file-row"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Icon className="mdx-file-icon" aria-hidden size={15} strokeWidth={1.75} />
        <span className="mdx-file-name">{name}</span>
      </button>
      {open ? <ul className="mdx-files-list">{children}</ul> : null}
    </li>
  )
}

function FileRow({ name }) {
  return (
    <>
      <FileIcon className="mdx-file-icon" aria-hidden size={15} strokeWidth={1.75} />
      <span className="mdx-file-name">{name}</span>
    </>
  )
}

function File({ name, href }) {
  if (href && isSafeAssetUrl(href)) {
    if (href.startsWith('/')) {
      return (
        <li className="mdx-file-item" role="treeitem">
          <Link className="mdx-file-row mdx-file-row--link" to={href}>
            <FileRow name={name} />
          </Link>
        </li>
      )
    }

    return (
      <li className="mdx-file-item" role="treeitem">
        <a
          className="mdx-file-row mdx-file-row--link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileRow name={name} />
        </a>
      </li>
    )
  }

  return (
    <li className="mdx-file-item" role="treeitem">
      <div className="mdx-file-row">
        <FileRow name={name} />
      </div>
    </li>
  )
}

export { File, Files, Folder }
