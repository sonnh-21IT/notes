import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Local draft that syncs to parent on debounce + flush (blur/submit).
 * Keeps typing responsive without re-rendering the whole editor tree every keystroke.
 */
export function useSyncedDraft(value, onCommit, delayMs = 150) {
  const [draft, setDraft] = useState(value)
  const skipParentSyncRef = useRef(false)
  const timerRef = useRef(0)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  // Parent → local when value changes from outside (load / reset).
  useEffect(() => {
    if (skipParentSyncRef.current) {
      skipParentSyncRef.current = false
      return
    }
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (draft === value) return undefined

    timerRef.current = window.setTimeout(() => {
      timerRef.current = 0
      skipParentSyncRef.current = true
      onCommitRef.current(draft)
    }, delayMs)

    return () => {
      window.clearTimeout(timerRef.current)
      timerRef.current = 0
    }
  }, [draft, value, delayMs])

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = 0
    if (draft === value) return
    skipParentSyncRef.current = true
    onCommitRef.current(draft)
  }, [draft, value])

  return [draft, setDraft, flush]
}
