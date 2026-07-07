const cache = new Map()
const inflight = new Map()

export function withCache(loader, keyFn) {
  return (...args) => {
    const key = keyFn(...args)

    if (cache.has(key)) {
      return Promise.resolve(cache.get(key))
    }

    if (inflight.has(key)) {
      return inflight.get(key)
    }

    const promise = Promise.resolve(loader(...args))
      .then((data) => {
        cache.set(key, data)
        inflight.delete(key)
        return data
      })
      .catch((error) => {
        inflight.delete(key)
        throw error
      })

    inflight.set(key, promise)
    return promise
  }
}

export function clearAsyncCache(keyPrefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key)
  }
}
