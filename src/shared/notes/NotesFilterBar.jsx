import FilterKindIcon from '@/shared/notes/FilterKindIcon'
import { activeFilterItems } from '@/shared/notes/notesFilterUtils'

export function NotesFilterOptions({ filterOptions, onSelect }) {
  if (!filterOptions.length) return null

  return (
    <div className="notes-tag-filters notes-tag-filters--scroll" role="group" aria-label="Filter by category and tag">
      {filterOptions.map((option) => (
        <button
          key={`${option.kind}-${option.id}`}
          type="button"
          className="notes-tag-filter"
          aria-label={`${option.kind === 'category' ? 'Category' : 'Tag'}: ${option.name}`}
          onClick={() => onSelect(option)}
        >
          <FilterKindIcon kind={option.kind} />
          {option.name}
        </button>
      ))}
    </div>
  )
}

export function NotesActiveFilters({ selectedCategories, selectedTags, onRemove }) {
  const items = activeFilterItems(selectedCategories, selectedTags)
  if (!items.length) return null

  return (
    <div className="notes-active-filters" aria-label="Active filters">
      {items.map((item) => (
        <button
          key={`${item.kind}-${item.id}`}
          type="button"
          className="notes-active-filter"
          aria-label={`Remove ${item.kind}: ${item.name}`}
          onClick={() => onRemove(item.kind, item.id)}
        >
          <FilterKindIcon kind={item.kind} />
          {item.name}
          <span className="notes-active-filter-remove" aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  )
}
