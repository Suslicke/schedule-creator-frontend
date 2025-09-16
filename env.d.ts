/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEV_PROXY_TARGET?: string
  readonly VITE_HTTP_DEBUG?: string
  readonly VITE_HTTP_NO_CACHE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
