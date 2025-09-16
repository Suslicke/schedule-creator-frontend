import { defineStore } from 'pinia'

const KEY = 'admin_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    adminToken: (typeof window !== 'undefined' ? sessionStorage.getItem(KEY) : '') || ''
  }),
  actions: {
    setToken(t: string) {
      this.adminToken = t
      if (typeof window !== 'undefined') sessionStorage.setItem(KEY, t)
    },
    clearToken() {
      this.adminToken = ''
      if (typeof window !== 'undefined') sessionStorage.removeItem(KEY)
    }
  }
})

