import { useCallback, useRef, useState } from 'react'
import AdminItemContextMenu from '@/admin/components/AdminItemContextMenu'
import { useLongPressMenu } from '@/admin/hooks/useLongPressMenu'

/** Button with optional long-press / right-click Select·Delete menu. */
function AdminGestureActionButton({
  className = '',
  disabled = false,
  onClick,
  onMenuSelect,
  onMenuDelete,
  menuEnabled = true,
  children,
  ...rest
}) {
  const [menu, setMenu] = useState(null)
  const suppressClickRef = useRef(false)

  const openMenu = useCallback((x, y) => {
    if (!menuEnabled || disabled) return
    suppressClickRef.current = true
    setMenu({ x, y })
  }, [disabled, menuEnabled])

  const gesture = useLongPressMenu(openMenu, { disabled: disabled || !menuEnabled })

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        {...rest}
        {...(menuEnabled ? gesture : {})}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false
            event.preventDefault()
            event.stopPropagation()
            return
          }
          onClick?.(event)
        }}
      >
        {children}
      </button>
      {menu && (
        <AdminItemContextMenu
          x={menu.x}
          y={menu.y}
          onSelect={() => {
            onMenuSelect?.()
            setMenu(null)
          }}
          onDelete={() => {
            onMenuDelete?.()
            setMenu(null)
          }}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  )
}

export default AdminGestureActionButton
