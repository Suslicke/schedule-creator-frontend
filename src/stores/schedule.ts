import { defineStore } from 'pinia'
import type { ScheduleEntry } from '@/types/schedule'
import { api } from '@/services/api'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    date: '',
    start_date: '',
    end_date: '',
    group_name: '',
    teacher_name: '',
    mode: 'day' as 'day' | 'week',
    loading: false,
    entries: [] as ScheduleEntry[]
  }),
  getters: {
    isRange: (s) => s.mode === 'week'
  },
  actions: {
    setDate(d: string) { this.date = d },
    setMode(m: 'day' | 'week') { this.mode = m },
    setRange(a: string, b: string) { this.start_date = a; this.end_date = b },
    setGroup(g: string) { this.group_name = normalize(g); this.teacher_name = '' },
    setTeacher(t: string) { this.teacher_name = normalize(t); this.group_name = '' },
    reset() {
      this.date = ''
      this.start_date = ''
      this.end_date = ''
      this.group_name = ''
      this.teacher_name = ''
      this.mode = 'day'
      this.entries = []
    },
    async fetch() {
      this.loading = true
      try {
        const params: Record<string, string> = {}
        if (this.mode === 'week') {
          const base = this.date || new Date().toISOString().slice(0, 10)
          const { start, end } = weekRange(base)
          params.start_date = start
          params.end_date = end
        } else {
          if (this.date) params.date = this.date
        }
        if (this.group_name) params.group_name = normalize(this.group_name)
        if (this.teacher_name) params.teacher_name = normalize(this.teacher_name)
        this.entries = await api.scheduleQuery(params)
      } finally {
        this.loading = false
      }
    }
  }
})

function normalize(s: string) {
  return (s || '').normalize('NFC').replace(/\s+/g, ' ').trim()
}
