import { defineStore } from 'pinia'
import { api } from '@/services/api'

type CacheItem<T> = { ts: number; data: T }
const TTL = 10 * 60 * 1000 // 10 min

export const useDictStore = defineStore('dict', {
  state: () => ({
    teachers: new Map<string, CacheItem<{ label: string; value: string }[]>>(),
    groups: new Map<string, CacheItem<{ label: string; value: string }[]>>(),
    subjects: new Map<string, CacheItem<{ label: string; value: string }[]>>(),
    rooms: new Map<string, CacheItem<{ label: string; value: string }[]>>()
  }),
  actions: {
    async searchTeachers(q: string) {
      const now = Date.now()
      const c = this.teachers.get(q)
      if (c && now - c.ts < TTL) return c.data
      const data = await api.dictTeachers(q)
      this.teachers.set(q, { ts: now, data })
      return data
    },
    async searchGroups(q: string) {
      const now = Date.now()
      const c = this.groups.get(q)
      if (c && now - c.ts < TTL) return c.data
      const data = await api.dictGroups(q)
      this.groups.set(q, { ts: now, data })
      return data
    },
    async searchSubjects(q: string) {
      const now = Date.now()
      const c = this.subjects.get(q)
      if (c && now - c.ts < TTL) return c.data
      const data = await api.dictSubjects(q)
      this.subjects.set(q, { ts: now, data })
      return data
    },
    async searchRooms(q: string) {
      const now = Date.now()
      const c = this.rooms.get(q)
      if (c && now - c.ts < TTL) return c.data
      const data = await api.dictRooms(q)
      this.rooms.set(q, { ts: now, data })
      return data
    }
  }
})
