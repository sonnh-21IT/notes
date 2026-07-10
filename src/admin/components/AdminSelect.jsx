import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

function AdminSelect({
  value,
  onChange,
  options,
  invalid = false,
  disabled = false,
  creatable = false,
  onCreate,
  creating = false,
  createError = '',
  emptyLabel = 'None',
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const searchRef = useRef(null)
  const listId = useId()

  const trimmedQuery = query.trim()
  const selected = options.find((option) => String(option.value) === String(value))
  const displayLabel = selected?.label ?? (value === '' || value == null ? emptyLabel : '—')

  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) return options
    const needle = trimmedQuery.toLowerCase()
    return options.filter((option) => option.label.toLowerCase().includes(needle))
  }, [options, trimmedQuery])

  const matchedOption = useMemo(() => {
    if (!trimmedQuery) return null
    const needle = trimmedQuery.toLowerCase()
    return options.find((option) => option.label.toLowerCase() === needle) ?? null
  }, [options, trimmedQuery])

  const canCreate = creatable && trimmedQuery && !matchedOption && onCreate

  function closeMenu() {
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!open || disabled) return undefined

    if (creatable) {
      searchRef.current?.focus()
    }

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) closeMenu()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, creatable, disabled])

  async function handleCreate() {
    if (!canCreate || creating || disabled) return

    try {
      await onCreate(trimmedQuery)
      closeMenu()
    } catch {
      // ponytail: parent sets createError; keep menu open
    }
  }

  function selectOption(optionValue) {
    if (disabled) return
    onChange(optionValue)
    closeMenu()
  }

  const menuOpen = open && !disabled

  return (
    <div ref={wrapRef} className={`admin-select-wrap${menuOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`admin-input admin-select-trigger${invalid ? ' admin-input--invalid' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          open ? closeMenu() : setOpen(true)
        }}
      >
        <span className="admin-select-value">{displayLabel}</span>
        <ChevronDown className="admin-select-chevron" size={16} strokeWidth={2} aria-hidden />
      </button>

      {menuOpen && (
        <ul id={listId} className="admin-select-menu" role="listbox">
          {creatable && (
            <li className="admin-select-search" role="presentation">
              <input
                ref={searchRef}
                type="text"
                className="admin-input admin-select-search-input"
                placeholder="Search or create…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  if (matchedOption) {
                    selectOption(matchedOption.value)
                    return
                  }
                  if (canCreate) handleCreate()
                }}
                onClick={(event) => event.stopPropagation()}
              />
            </li>
          )}

          {filteredOptions.map((option) => {
            const active = String(value) === String(option.value)
            return (
              <li key={String(option.value)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`admin-select-option${active ? ' is-active' : ''}`}
                  onClick={() => selectOption(option.value)}
                >
                  {option.label}
                </button>
              </li>
            )
          })}

          {creatable && trimmedQuery && filteredOptions.length === 0 && !canCreate && (
            <li className="admin-select-empty" role="presentation">
              No matches.
            </li>
          )}

          {canCreate && (
            <li role="presentation">
              <button
                type="button"
                className="admin-select-option admin-select-option--create"
                disabled={creating}
                onClick={handleCreate}
              >
                {creating ? 'Creating…' : `Create "${trimmedQuery}"`}
              </button>
            </li>
          )}

          {createError && (
            <li className="admin-select-error" role="alert">
              {createError}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default AdminSelect
