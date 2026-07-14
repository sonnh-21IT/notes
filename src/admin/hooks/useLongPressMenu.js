import { useCallback, useRef } from 'react'

const LONG_PRESS_MS = 450
const MOVE_TOLERANCE_PX = 10

/**
 * Pointer long-press + right-click handlers for a floating action menu.
 * `onOpen(clientX, clientY)` fires when the menu should appear.
 */
export function useLongPressMenu(onOpen, { disabled = false } = {}) {
  const timerRef = useRef(0)
  const startRef = useRef(null)
  const openedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = 0
    }
  }, [])

  const onPointerDown = useCallback((event) => {
    if (disabled || event.button !== 0) return

    openedRef.current = false
    startRef.current = { x: event.clientX, y: event.clientY }
    clearTimer()

    timerRef.current = window.setTimeout(() => {
      timerRef.current = 0
      openedRef.current = true
      const point = startRef.current
      if (point) onOpen(point.x, point.y)
    }, LONG_PRESS_MS)
  }, [clearTimer, disabled, onOpen])

  const onPointerMove = useCallback((event) => {
    if (!startRef.current || !timerRef.current) return
    const dx = event.clientX - startRef.current.x
    const dy = event.clientY - startRef.current.y
    if ((dx * dx) + (dy * dy) > MOVE_TOLERANCE_PX * MOVE_TOLERANCE_PX) {
      clearTimer()
      startRef.current = null
    }
  }, [clearTimer])

  const onPointerUp = useCallback((event) => {
    clearTimer()
    startRef.current = null
    if (openedRef.current) {
      // Suppress the click that follows a long-press.
      event.preventDefault()
      event.stopPropagation()
      openedRef.current = false
    }
  }, [clearTimer])

  const onPointerCancel = useCallback(() => {
    clearTimer()
    startRef.current = null
    openedRef.current = false
  }, [clearTimer])

  const onContextMenu = useCallback((event) => {
    if (disabled) return
    event.preventDefault()
    event.stopPropagation()
    clearTimer()
    openedRef.current = true
    onOpen(event.clientX, event.clientY)
  }, [clearTimer, disabled, onOpen])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onContextMenu,
  }
}
