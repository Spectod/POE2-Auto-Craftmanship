import type { NormalizedMod, ModQueryOptions } from '@/types/mods'
import type { ItemCategory } from '@/types/itemTypes'

interface CacheEntry<T> {
  key: string
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface ModsCacheEntry extends CacheEntry<NormalizedMod[]> {
  itemCategory: ItemCategory
  options: ModQueryOptions
}

/**
 * IndexedDB service for caching large datasets
 * Provides persistent storage with TTL and efficient querying
 */
export class IndexedDBService {
  private db: IDBDatabase | null = null
  private readonly dbName = 'POE2CraftingCache'
  private readonly dbVersion = 1
  private readonly defaultTTL = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.initDB()
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.warn('IndexedDB not available, falling back to memory cache')
        resolve()
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('mods')) {
          const modsStore = db.createObjectStore('mods', { keyPath: 'key' })
          modsStore.createIndex('itemCategory', 'itemCategory', { unique: false })
          modsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('modStats')) {
          db.createObjectStore('modStats', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('searchResults')) {
          db.createObjectStore('searchResults', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * Cache mods data with TTL
   */
  async cacheMods(
    itemCategory: ItemCategory,
    options: ModQueryOptions,
    mods: NormalizedMod[],
    ttl: number = this.defaultTTL
  ): Promise<void> {
    if (!this.db) return

    const key = this.generateModsKey(itemCategory, options)
    const entry: ModsCacheEntry = {
      key,
      data: mods,
      timestamp: Date.now(),
      ttl,
      itemCategory,
      options
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mods'], 'readwrite')
      const store = transaction.objectStore('mods')
      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get cached mods data
   */
  async getCachedMods(
    itemCategory: ItemCategory,
    options: ModQueryOptions
  ): Promise<NormalizedMod[] | null> {
    if (!this.db) return null

    const key = this.generateModsKey(itemCategory, options)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mods'], 'readonly')
      const store = transaction.objectStore('mods')
      const request = store.get(key)

      request.onsuccess = () => {
        const entry: ModsCacheEntry | undefined = request.result

        if (!entry) {
          resolve(null)
          return
        }

        // Check if cache is expired
        if (Date.now() - entry.timestamp > entry.ttl) {
          // Remove expired entry
          this.removeExpiredEntry(key)
          resolve(null)
          return
        }

        resolve(entry.data)
      }

      request.onerror = () => resolve(null)
    })
  }

  /**
   * Cache mod statistics
   */
  async cacheModStats(
    itemCategory: ItemCategory,
    stats: any,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    if (!this.db) return

    const key = `stats_${itemCategory}`
    const entry: CacheEntry<any> = {
      key,
      data: stats,
      timestamp: Date.now(),
      ttl
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['modStats'], 'readwrite')
      const store = transaction.objectStore('modStats')
      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get cached mod statistics
   */
  async getCachedModStats(itemCategory: ItemCategory): Promise<any | null> {
    if (!this.db) return null

    const key = `stats_${itemCategory}`

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['modStats'], 'readonly')
      const store = transaction.objectStore('modStats')
      const request = store.get(key)

      request.onsuccess = () => {
        const entry: CacheEntry<any> | undefined = request.result

        if (!entry) {
          resolve(null)
          return
        }

        if (Date.now() - entry.timestamp > entry.ttl) {
          this.removeExpiredEntry(key, 'modStats')
          resolve(null)
          return
        }

        resolve(entry.data)
      }

      request.onerror = () => resolve(null)
    })
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(
    query: string,
    results: NormalizedMod[],
    ttl: number = this.defaultTTL
  ): Promise<void> {
    if (!this.db) return

    const key = `search_${query.toLowerCase()}`
    const entry: CacheEntry<NormalizedMod[]> = {
      key,
      data: results,
      timestamp: Date.now(),
      ttl
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchResults'], 'readwrite')
      const store = transaction.objectStore('searchResults')
      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(query: string): Promise<NormalizedMod[] | null> {
    if (!this.db) return null

    const key = `search_${query.toLowerCase()}`

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchResults'], 'readonly')
      const store = transaction.objectStore('searchResults')
      const request = store.get(key)

      request.onsuccess = () => {
        const entry: CacheEntry<NormalizedMod[]> | undefined = request.result

        if (!entry) {
          resolve(null)
          return
        }

        if (Date.now() - entry.timestamp > entry.ttl) {
          this.removeExpiredEntry(key, 'searchResults')
          resolve(null)
          return
        }

        resolve(entry.data)
      }

      request.onerror = () => resolve(null)
    })
  }

  /**
   * Clean up expired entries
   */
  async cleanupExpiredEntries(): Promise<void> {
    if (!this.db) return

    const stores = ['mods', 'modStats', 'searchResults']

    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.openCursor()

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result

          if (cursor) {
            const entry: CacheEntry<any> = cursor.value

            if (Date.now() - entry.timestamp > entry.ttl) {
              cursor.delete()
            }

            cursor.continue()
          } else {
            resolve()
          }
        }

        request.onerror = () => reject(request.error)
      })
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    if (!this.db) return

    const stores = ['mods', 'modStats', 'searchResults']

    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    mods: number
    modStats: number
    searchResults: number
    totalSize: number
  }> {
    if (!this.db) return { mods: 0, modStats: 0, searchResults: 0, totalSize: 0 }

    const stats = {
      mods: 0,
      modStats: 0,
      searchResults: 0,
      totalSize: 0
    }

    const stores = ['mods', 'modStats', 'searchResults']

    for (const storeName of stores) {
      await new Promise<void>((resolve) => {
        const transaction = this.db!.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.count()

        request.onsuccess = () => {
          stats[storeName as keyof typeof stats] = request.result
          resolve()
        }

        request.onerror = () => resolve()
      })
    }

    return stats
  }

  /**
   * Generate cache key for mods
   */
  private generateModsKey(itemCategory: ItemCategory, options: ModQueryOptions): string {
    return `mods_${itemCategory}_${JSON.stringify(options)}`
  }

  /**
   * Remove expired cache entry
   */
  private async removeExpiredEntry(key: string, storeName: string = 'mods'): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Check if IndexedDB is available
   */
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined'
  }
}
