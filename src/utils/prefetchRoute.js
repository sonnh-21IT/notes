const prefetched = new Set()

export function prefetchRoute(importer) {
  if (prefetched.has(importer)) return
  prefetched.add(importer)
  void importer()
}
