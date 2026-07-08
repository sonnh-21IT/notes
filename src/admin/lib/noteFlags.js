export function noteFlagsToastMessage(patch) {
  if (patch.published === true) return 'Note published.'
  if (patch.published === false) return 'Note unpublished.'
  if (patch.pinned === true) return 'Note pinned.'
  if (patch.pinned === false) return 'Note unpinned.'
  return 'Note updated.'
}
