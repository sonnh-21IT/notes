import { useEffect, useRef } from 'react'

function AdminItemContextMenu({ x, y, onSelect, onDelete, onClose, selectLabel = 'Select', deleteLabel = 'Delete' }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) onClose()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const left = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 160 : x)
  const top = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 96 : y)

  return (
    <div
      ref={menuRef}
      className="admin-item-menu"
      role="menu"
      style={{ left, top }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        className="admin-item-menu-action"
        onClick={() => {
          onSelect()
          onClose()
        }}
      >
        {selectLabel}
      </button>
      <button
        type="button"
        role="menuitem"
        className="admin-item-menu-action admin-item-menu-action--danger"
        onClick={() => {
          onDelete()
          onClose()
        }}
      >
        {deleteLabel}
      </button>
    </div>
  )
}

export default AdminItemContextMenu
