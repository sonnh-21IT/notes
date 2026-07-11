import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createSyncedDraftController } from '@/admin/lib/syncedDraft'

describe('createSyncedDraftController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps keystrokes local until debounce, then commits', () => {
    const onCommit = vi.fn()
    const sync = createSyncedDraftController({ initialValue: 'a', delayMs: 150, onCommit })

    sync.setDraft('ab')
    expect(sync.getDraft()).toBe('ab')
    expect(onCommit).not.toHaveBeenCalled()

    vi.advanceTimersByTime(149)
    expect(onCommit).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onCommit).toHaveBeenCalledWith('ab')
    expect(sync.getCommitted()).toBe('ab')
  })

  it('flush commits immediately', () => {
    const onCommit = vi.fn()
    const sync = createSyncedDraftController({ initialValue: 'x', delayMs: 500, onCommit })

    sync.setDraft('xy')
    sync.flush()
    expect(onCommit).toHaveBeenCalledWith('xy')
  })

  it('adopts external value when parent resets', () => {
    const onCommit = vi.fn()
    const sync = createSyncedDraftController({ initialValue: 'old', delayMs: 150, onCommit })

    sync.setDraft('typing')
    expect(sync.adoptExternal('loaded-from-server')).toBe(true)
    expect(sync.getDraft()).toBe('loaded-from-server')
    expect(sync.getCommitted()).toBe('loaded-from-server')

    vi.advanceTimersByTime(200)
    expect(onCommit).not.toHaveBeenCalled()
  })
})
