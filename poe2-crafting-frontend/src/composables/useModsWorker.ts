import { ref, onBeforeUnmount } from 'vue'

type Pending = { resolve: (v: any) => void; reject: (e: any) => void }

export function useModsWorker() {
  const worker = new Worker(new URL('../workers/modsWorker.ts', import.meta.url), { type: 'module' })
  const seq = ref(0)
  const pendings = new Map<number, Pending>()

  worker.onmessage = (ev: MessageEvent) => {
    const { id, ok, result, error } = (ev.data || {}) as { id: number; ok: boolean; result?: any; error?: string }
    const p = pendings.get(id)
    if (!p) return
    pendings.delete(id)
    ok ? p.resolve(result) : p.reject(new Error(error))
  }

  const call = <T>(type: string, payload?: any): Promise<T> =>
    new Promise((resolve, reject) => {
      const id = seq.value + 1
      seq.value = id
      pendings.set(id, { resolve, reject })
      worker.postMessage({ id, type, payload })
    })

  const load = () => call('load')
  const search = (query: string) => call<any[]>('search', { query })
  const applicable = (baseName: string, opts?: { affix?: 'prefix' | 'suffix'; mtypeId?: number; ilvl?: number; source?: 'base'|'desecrated'|'essence' }) =>
    call<any[]>('applicable', { baseName, opts })
  const ev = (payload: { successRate: number; attemptCost: number; targetSellPrice: number; attempts?: number }) =>
    call<{ evPerAttempt: number; attempts: number; totalEV: number }>('ev', payload)
  const tierStats = (payload: { modId: number; ilvl: number; method: 'base'|'desecrated'|'essence'; attemptCost: number }) =>
    call<{ tier:number; p:number; attempts:number; cost:number }[]>('tierStats', payload)

  onBeforeUnmount(() => {
    worker.terminate()
    pendings.clear()
  })

  return { load, search, applicable, ev, tierStats }
}
