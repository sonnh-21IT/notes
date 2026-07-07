import { Folder, Tag } from 'lucide-react'

function FilterKindIcon({ kind, className = 'notes-filter-kind-icon' }) {
  const Icon = kind === 'category' ? Folder : Tag
  return <Icon className={className} aria-hidden="true" size={12} strokeWidth={2} />
}

export default FilterKindIcon
