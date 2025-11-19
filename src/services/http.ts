import axios, { AxiosError, AxiosInstance } from 'axios'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

let http: AxiosInstance | null = null
const lastGetCache = new Map<string, any>()

export function getHttp(): AxiosInstance {
  if (!http) throw new Error('HTTP not initialized')
  return http
}

// Cache invalidation helpers for GET cache (query-key like)
export function invalidateCacheByPrefix(prefix: string) {
  // Remove any cached GET whose full URL contains the prefix
  const keys = Array.from(lastGetCache.keys())
  for (const k of keys) {
    if (k.includes(prefix)) lastGetCache.delete(k)
  }
}

export function invalidateCacheWhere(predicate: (key: string) => boolean) {
  const keys = Array.from(lastGetCache.keys())
  for (const k of keys) {
    if (predicate(k)) lastGetCache.delete(k)
  }
}

export function setupHttp(pinia: Pinia, router: Router, hooks: { onError: (msg: string) => void, onAuthRequired: () => void }) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  const debug = (import.meta as any).env?.VITE_HTTP_DEBUG === 'true'
  const noCache = (import.meta as any).env?.VITE_HTTP_NO_CACHE === 'true'
  http = axios.create({
    baseURL,
    withCredentials: false,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 304
  })

  http.interceptors.request.use((config) => {
    const auth = useAuthStore(pinia)
    // Determine path for admin detection even when absolute URL
    let path = ''
    try {
      const full = new URL(config.url || '', (config as any).baseURL || baseURL)
      path = full.pathname
    } catch { path = config.url || '' }
    // Disable browser cache in dev without polluting query params
    if (noCache && (config.method || 'get').toLowerCase() === 'get') {
      config.headers = config.headers || {}
      ;(config.headers as any)['Cache-Control'] = 'no-cache'
      ;(config.headers as any)['Pragma'] = 'no-cache'
    }
    // Compute cache key for GETs
    if ((config.method || 'get').toLowerCase() === 'get') {
      try {
        const finalUrl = buildUrl(config.url || '', (config as any).baseURL || baseURL, config.params)
        ;(config as any)._cacheKey = finalUrl
      } catch { /* ignore */ }
    }
    // Always attach admin token if present (backend may require it for non-/admin and for GET)
    if (auth.adminToken) {
      config.headers = config.headers || {}
      ;(config.headers as any)['X-Admin-Token'] = auth.adminToken
    }
    if (debug) console.debug('[HTTP]', config.method?.toUpperCase(), path || config.url, 'base:', (config as any).baseURL || baseURL)
    return config
  })

  http.interceptors.response.use(
    (resp) => {
      const method = (resp.config.method || 'get').toLowerCase()
      if (method === 'get') {
        const key = (resp.config as any)._cacheKey as string | undefined
        if (key) {
          if (resp.status === 200) {
            lastGetCache.set(key, resp.data)
          } else if (resp.status === 304 && lastGetCache.has(key)) {
            if (debug) console.debug('[HTTP] 304 -> using cached data for', key)
            ;(resp as any).data = lastGetCache.get(key)
          }
        }
      }
      return resp
    },
    (error: AxiosError<any>) => {
      const status = error.response?.status
      const method = (error.config?.method || 'get').toLowerCase()
      const detail = (error.response?.data as any)?.detail || error.message
      if (debug) console.error('[HTTP ERROR]', status, detail)
      // Silent 404s for GET requests (used for existence checks like day lookup)
      if (status === 404 && method === 'get') {
        return Promise.reject(error)
      }
      // If 304 still came as error, try to serve cached data
      if (status === 304) {
        const cfg: any = error.config || {}
        const key = cfg._cacheKey as string | undefined
        if (key && lastGetCache.has(key)) {
          if (debug) console.debug('[HTTP] 304(error) -> using cached data for', key)
          return Promise.resolve({ ...(error.response as any), data: lastGetCache.get(key) })
        }
      }
      if (status === 401 || status === 403) {
        hooks.onError(detail || 'Требуется админ-токен')
        hooks.onAuthRequired()
      } else if (status === 400) {
        hooks.onError(detail || 'Некорректный запрос')
      } else {
        hooks.onError(detail || 'Ошибка сети')
      }
      return Promise.reject(error)
    }
  )
}

function toSearchParams(params: any): URLSearchParams {
  if (!params) return new URLSearchParams()
  if (params instanceof URLSearchParams) return new URLSearchParams(params)
  return new URLSearchParams(params)
}

function buildUrl(url: string, base: string, params: any): string {
  const u = new URL(url || '', base)
  const search = toSearchParams(params)
  search.forEach((v, k) => u.searchParams.set(k, v))
  return u.toString()
}
