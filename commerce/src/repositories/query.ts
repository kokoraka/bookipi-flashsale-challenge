import { QueryOption } from './repository.js'

export function parseQueryOption(opts?: QueryOption): QueryOption {
  const {
    readCache = false,
    writeCache = false,
    cacheTtl = 60_000,
    cachePrefix = '',
  } = opts || {}

  return {
    readCache,
    writeCache,
    cacheTtl,
    cachePrefix,
  }
}
