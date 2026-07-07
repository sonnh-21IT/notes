import { Link } from 'react-router-dom'
import { formatArticleDate } from '@/utils/formatArticleMeta'
import { prefetchRoute } from '@/utils/prefetchRoute'

const prefetchNotePage = () => prefetchRoute(() => import('@/pages/notes/NotePage'))

function NotesList({ notes, className = '', loading = false }) {
  return (
    <ul
      className={`content-list${loading ? ' content-list--loading' : ''}${className ? ` ${className}` : ''}`}
      aria-busy={loading}
    >
      {notes.map((note) => {
        const meta = [formatArticleDate(note.publishedAt), note.category]
          .filter(Boolean)
          .join(' • ')

        return (
          <li key={note.slug} className="content-list-item">
            <Link
              className="content-list-link"
              to={`/notes/${note.slug}`}
              onMouseEnter={prefetchNotePage}
              onFocus={prefetchNotePage}
            >
              <span className="content-list-title">{note.title}</span>
              {meta ? <span className="content-list-meta">{meta}</span> : null}
              {note.summary ? <p className="content-list-summary">{note.summary}</p> : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NotesList
