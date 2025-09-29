/**
 * Memoization utilities for performance optimization
 */

interface MemoizedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>
  clear: () => void
  getCacheSize: () => number
}

/**
 * Create a memoized version of a function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
  maxCacheSize: number = 100
): MemoizedFunction<T> {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    const cached = cache.get(key)
    if (cached) {
      // Move to end (most recently used)
      cache.delete(key)
      cache.set(key, cached)
      return cached.value
    }

    const result = fn(...args)
    cache.set(key, { value: result, timestamp: Date.now() })

    // Evict least recently used items if cache is too large
    if (cache.size > maxCacheSize) {
      const firstKey = cache.keys().next().value
      if (firstKey) {
        cache.delete(firstKey)
      }
    }

    return result
  }

  memoized.clear = () => cache.clear()
  memoized.getCacheSize = () => cache.size

  return memoized
}

/**
 * Memoize async functions with TTL (Time To Live)
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
  maxCacheSize: number = 50
): MemoizedFunction<T> {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()

  const memoized = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      // Move to end (most recently used)
      cache.delete(key)
      cache.set(key, cached)
      return cached.value
    }

    const result = await fn(...args)
    cache.set(key, { value: result, timestamp: Date.now() })

    // Evict least recently used items if cache is too large
    if (cache.size > maxCacheSize) {
      const firstKey = cache.keys().next().value
      if (firstKey) {
        cache.delete(firstKey)
      }
    }

    return result
  }

  memoized.clear = () => cache.clear()
  memoized.getCacheSize = () => cache.size

  return memoized as MemoizedFunction<T>
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCallTime >= interval) {
      lastCallTime = now
      fn(...args)
    }
  }
}

/**
 * Lazy loading utility for components
 */
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  fallback?: T
): {
  load: () => Promise<T>
  isLoaded: () => boolean
  getValue: () => T | undefined
  reset: () => void
} {
  let promise: Promise<T> | null = null
  let value: T | undefined = fallback
  let loaded = false

  const load = async (): Promise<T> => {
    if (promise) return promise

    promise = loader().then(result => {
      value = result
      loaded = true
      return result
    })

    return promise
  }

  const isLoaded = () => loaded
  const getValue = () => value
  const reset = () => {
    promise = null
    value = fallback
    loaded = false
  }

  return { load, isLoaded, getValue, reset }
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): {
  observe: (element: Element) => void
  unobserve: (element: Element) => void
  disconnect: () => void
} {
  const observer = new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  })

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect()
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private measurements = new Map<string, number[]>()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startMeasurement(name: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!this.measurements.has(name)) {
        this.measurements.set(name, [])
      }

      this.measurements.get(name)!.push(duration)
    }
  }

  getMeasurements(name: string): {
    count: number
    average: number
    min: number
    max: number
    last: number
  } | null {
    const times = this.measurements.get(name)
    if (!times || times.length === 0) return null

    const count = times.length
    const sum = times.reduce((a, b) => a + b, 0)
    const average = sum / count
    const min = Math.min(...times)
    const max = Math.max(...times)
    const last = times[times.length - 1]

    return { count, average, min, max, last }
  }

  clearMeasurements(name?: string): void {
    if (name) {
      this.measurements.delete(name)
    } else {
      this.measurements.clear()
    }
  }

  getAllMeasurements(): Record<string, {
    count: number
    average: number
    min: number
    max: number
    last: number
  }> {
    const result: Record<string, any> = {}

    for (const [name, times] of this.measurements) {
      result[name] = this.getMeasurements(name)
    }

    return result
  }
}
