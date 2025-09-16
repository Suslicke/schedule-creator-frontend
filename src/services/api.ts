import { getHttp } from './http'
import type { ScheduleEntry, DayReport, DayPlanRequest, DayPlanResponse, BulkChange, BulkDiffRow, ProgressSummary, TimeseriesPoint } from '@/types/schedule'

export const api = {
  // Public schedule queries
  async scheduleQuery(params: { date?: string; start_date?: string; end_date?: string; group_name?: string; teacher_name?: string; }): Promise<ScheduleEntry[]> {
    const { data } = await getHttp().get('/schedule/query', { params })
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items as ScheduleEntry[]
  },
  // Dicts
  async dictTeachers(q: string) {
    const { data } = await getHttp().get('/dict/teachers', { params: { q } })
    return normalizeOptions(data)
  },
  async dictGroups(q: string) {
    const { data } = await getHttp().get('/dict/groups', { params: { q } })
    return normalizeOptions(data)
  },
  // Admin: upload
  async uploadSchedule(file: File) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await getHttp().post('/admin/upload/schedule', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data
  },
  // Admin: day plan
  async dayPlan(payload: DayPlanRequest): Promise<DayPlanResponse> {
    const { data } = await getHttp().post('/admin/day/plan', payload)
    return data
  },
  async replaceVacantAuto(dayId: number) {
    const { data } = await getHttp().post(`/admin/day/${dayId}/replace_vacant_auto`)
    return data
  },
  async dayReport(dayId: number): Promise<DayReport> {
    const { data } = await getHttp().get(`/schedule/day/${dayId}/report`)
    return data
  },
  async updateEntryManual(payload: { entry_id: number; changes: Record<string, any> }) {
    // Backend expects flat fields per OpenAPI: { entry_id, teacher_name?, subject_name?, room_name? }
    const out: Record<string, any> = { entry_id: payload.entry_id }
    const c = payload.changes || {}
    if (c.teacher_name) out.teacher_name = c.teacher_name
    if (c.subject_name) out.subject_name = c.subject_name
    if (c.room_name) out.room_name = c.room_name
    const { data } = await getHttp().post('/admin/day/update_entry_manual', out)
    return data
  },
  async approveDay(dayId: number, params: { group_name?: string; enforce_no_blockers?: boolean }) {
    const { data } = await getHttp().post(`/admin/day/${dayId}/approve`, null, { params })
    return data
  },
  // Admin: bulk strict
  async entryLookup(date: string) {
    const { data } = await getHttp().get('/schedule/day/entry_lookup', { params: { date } })
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items as ScheduleEntry[]
  },
  async bulkUpdateStrict(dayId: number, changes: BulkChange[], dry_run = true) {
    const { data } = await getHttp().post(`/admin/day/${dayId}/bulk_update_strict`, { changes, dry_run })
    return data as { diff: BulkDiffRow[]; result?: any }
  },
  // Admin: progress
  async progressSummary(): Promise<ProgressSummary[]> {
    const { data } = await getHttp().get('/progress/summary')
    return (data?.items ?? []) as ProgressSummary[]
  },
  async progressTimeseries(params: { group_name?: string; subject_name?: string; teacher_name?: string; start_date?: string; end_date?: string }): Promise<TimeseriesPoint[]> {
    const { data } = await getHttp().get('/progress/timeseries', { params })
    const points = (data?.points ?? []) as any[]
    return points.map(p => ({ date: p.date, hours: p.hours, cumulative: p.cumulative_hours }))
  },
}

function normalizeOptions(data: any): { label: string; value: string }[] {
  if (!data) return []
  if (Array.isArray(data)) {
    // If objects already have label/value, normalize value to a string name
    if (data.length && typeof data[0] === 'object' && 'label' in data[0]) {
      return (data as any[]).map((x) => {
        const label = String(x.label ?? x.name ?? x.title ?? '')
        const value = String(x.name ?? x.title ?? label)
        return { label, value }
      })
    }
    // Backend returns { id, name }
    if (data.length && typeof data[0] === 'object' && ('name' in data[0] || 'title' in data[0])) {
      return (data as any[]).map((x) => {
        const label = (x.name ?? x.title ?? x.label ?? '').toString()
        // For our filters, value should be the name string, not id
        const value = (x.name ?? x.title ?? label).toString()
        return { label, value }
      })
    }
    // Array of strings
    if (data.length && typeof data[0] === 'string') return (data as string[]).map((s) => ({ label: s, value: s }))
  }
  return []
}
