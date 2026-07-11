export function isMdxContentReady(content) {
  if (!content?.body?.trim()) return true
  return typeof content.MdxContent === 'function'
}
