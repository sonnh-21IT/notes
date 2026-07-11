export function createSyncedDraftController({
  initialValue = '',
  delayMs = 150,
  onCommit,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
} = {}) {
  let draft = initialValue
  let lastCommitted = initialValue
  let timer = null

  function clearTimer() {
    if (timer != null) {
      clearTimeoutFn(timer)
      timer = null
    }
  }

  function commit(next) {
    clearTimer()
    if (next === lastCommitted) return
    lastCommitted = next
    onCommit?.(next)
  }

  return {
    getDraft: () => draft,
    getCommitted: () => lastCommitted,
    setDraft(next) {
      draft = next
      clearTimer()
      if (next === lastCommitted) return
      timer = setTimeoutFn(() => {
        timer = null
        commit(draft)
      }, delayMs)
    },
    /** Parent loaded/reset a different value. */
    adoptExternal(value) {
      if (value === lastCommitted || value === draft) return false
      clearTimer()
      draft = value
      lastCommitted = value
      return true
    },
    flush() {
      commit(draft)
    },
    dispose: clearTimer,
  }
}
