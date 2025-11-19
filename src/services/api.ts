import { getHttp, invalidateCacheByPrefix } from './http'
import type {
  ScheduleEntry,
  DayReport,
  DayPlanRequest,
  DayPlanResponse,
  BulkChange,
  BulkDiffRow,
  ProgressSummary,
  TimeseriesPoint,
  DayData,
  EntryOptions,
  RoomSwapPlan,
  SwapRoomRequest,
  SwapRoomResponse,
  AnalyticsFilters,
  TeacherSummaryItem,
  GroupSummaryItem,
  RoomSummaryItem,
  HeatmapResponse,
  DistributionItem,
  TimeseriesAnalyticsPoint,
} from '@/types/schedule'

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
  async dictSubjects(q: string) {
    const { data } = await getHttp().get('/dict/subjects', { params: { q } })
    return normalizeOptions(data)
  },
  async dictRooms(q: string) {
    const { data } = await getHttp().get('/dict/rooms', { params: { q } })
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
    // Invalidate day and report caches
    invalidateCacheByPrefix('/schedule/day')
    invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
    return data
  },
  // New day flow (spec-compliant)
  async scheduleDayPlan(payload: DayPlanRequest): Promise<DayData> {
    const { data } = await getHttp().post('/schedule/day/plan', payload)
    return data as DayData
  },
  async getDay(params: { date: string; group_name?: string }): Promise<DayData> {
    const { data } = await getHttp().get('/schedule/day', { params })
    return data as DayData
  },
  async getEntryOptions(entryId: number, params?: { limit_teachers?: number; limit_rooms?: number }): Promise<EntryOptions> {
    const { data } = await getHttp().get(`/schedule/day/entry/${entryId}/options`, { params })
    return data as EntryOptions
  },
  async getTeacherSwapPlan(entryId: number, desired_teacher_name: string) {
    // Send both snake_case and camelCase for compatibility
    const params: any = { desired_teacher_name: desired_teacher_name, desiredTeacherName: desired_teacher_name }
    const { data } = await getHttp().get(`/schedule/day/entry/${entryId}/teacher_swap_plan`, { params })
    return data as any
  },
  async swapTeacher(entryId: number, payload: { desired_teacher_name: string; choices?: { entry_id: number; teacher_name: string }[]; dry_run?: boolean }) {
    const body: any = { desiredTeacherName: payload.desired_teacher_name, desired_teacher_name: payload.desired_teacher_name }
    if (payload.dry_run !== undefined) body.dry_run = payload.dry_run
    if (payload.choices?.length) body.choices = payload.choices.map(c => ({ entryId: c.entry_id, entry_id: c.entry_id, teacherName: c.teacher_name, teacher_name: c.teacher_name }))
    const { data } = await getHttp().post(`/schedule/day/entry/${entryId}/swap_teacher`, body)
    // Invalidate on real apply
    if (!payload.dry_run) {
      invalidateCacheByPrefix('/schedule/day')
      invalidateCacheByPrefix(`/schedule/day/${entryId}/report`)
    }
    return data as any
  },
  async getRoomSwapPlan(entryId: number, desired_room_name: string): Promise<RoomSwapPlan> {
    // Send both snake_case and camelCase for compatibility
    const params: any = { desired_room_name: desired_room_name, desiredRoomName: desired_room_name }
    const { data } = await getHttp().get(`/schedule/day/entry/${entryId}/room_swap_plan`, { params })
    return data as RoomSwapPlan
  },
  async swapRoom(entryId: number, payload: SwapRoomRequest): Promise<SwapRoomResponse> {
    const body: any = { desiredRoomName: payload.desired_room_name, desired_room_name: payload.desired_room_name }
    if (payload.dry_run !== undefined) body.dry_run = payload.dry_run
    if (payload.choices?.length) body.choices = payload.choices.map(c => ({ entryId: c.entry_id, entry_id: c.entry_id, roomName: c.room_name, room_name: c.room_name }))
    const { data } = await getHttp().post(`/schedule/day/entry/${entryId}/swap_room`, body)
    if (!payload.dry_run) {
      invalidateCacheByPrefix('/schedule/day')
    }
    return data as SwapRoomResponse
  },
  async clearRoom(entryId: number) {
    // Prefer new clear_room endpoint; fallback to update_entry_manual with empty string
    try {
      const { data } = await getHttp().post(`/schedule/day/entry/${entryId}/clear_room`)
      // Try to invalidate day/report caches if id present
      const dayId = (data?.report?.day_id || data?.day_id) as number | undefined
      invalidateCacheByPrefix('/schedule/day')
      if (dayId) invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
      return data
    } catch (e: any) {
      // Fallback
      const { data } = await getHttp().post('/schedule/day/update_entry_manual', { entry_id: entryId, room_name: '' })
      const dayId = (data?.report?.day_id || data?.day_id) as number | undefined
      invalidateCacheByPrefix('/schedule/day')
      if (dayId) invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
      return data
    }
  },
  async updateEntryManualV2(payload: { entry_id: number; teacher_name?: string; subject_name?: string; room_name?: string }) {
    const out: any = { entry_id: payload.entry_id }
    if (payload.teacher_name !== undefined) { out.teacher_name = payload.teacher_name; out.teacherName = payload.teacher_name }
    if (payload.subject_name !== undefined) { out.subject_name = payload.subject_name; out.subjectName = payload.subject_name }
    if (payload.room_name !== undefined) { out.room_name = payload.room_name; out.roomName = payload.room_name }
    const { data } = await getHttp().post('/schedule/day/update_entry_manual', out)
    invalidateCacheByPrefix('/schedule/day')
    const dayId = (data?.report?.day_id || data?.day_id) as number | undefined
    if (dayId) invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
    invalidateCacheByPrefix(`/schedule/day/entry/${payload.entry_id}`)
    return data
  },
  // Manual add/delete + autofill (new endpoints)
  async addEntryManual(payload: {
    date: string;
    group_name: string;
    start_time: string;
    end_time?: string;
    subject_name: string;
    room_name: string;
    teacher_name?: string;
    ignore_weekly_conflicts?: boolean;
    allow_create_entities?: boolean;
  }) {
    const { data } = await getHttp().post('/schedule/day/add_entry_manual', {
      ignore_weekly_conflicts: true,
      allow_create_entities: true,
      ...payload,
    })
    invalidateCacheByPrefix('/schedule/day')
    const dayId = (data?.report?.day_id || data?.day_id) as number | undefined
    if (dayId) invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
    return data as { entry_id: number; day_id: number; date: string; report?: any }
  },
  async deleteDayEntry(entry_id: number) {
    const { data } = await getHttp().delete(`/schedule/day/entry/${entry_id}`)
    invalidateCacheByPrefix('/schedule/day')
    const dayId = (data?.report?.day_id || data?.day_id) as number | undefined
    if (dayId) invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
    return data as { deleted: boolean; day_id: number; date: string; report?: any }
  },
  async autofillMinPairs(payload: {
    date: string;
    group_name?: string;
    ensure_pairs_per_day?: number;
    allow_repeated_subjects?: boolean;
    max_repeats_per_subject?: number;
    use_both_shifts?: boolean;
    ignore_weekly_conflicts?: boolean;
  }) {
    const { data } = await getHttp().post('/schedule/day/autofill_min_pairs', {
      ignore_weekly_conflicts: true,
      ...payload,
    })
    return data
  },
  async approveDayV2(dayId: number, params: { group_name?: string; record_progress?: boolean; enforce_no_blockers?: boolean }) {
    const { data } = await getHttp().post(`/schedule/day/${dayId}/approve`, null, { params })
    invalidateCacheByPrefix('/schedule/day')
    invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
    return data
  },
  async exportDay(params: { date: string; groups?: string[] }): Promise<Blob> {
    const http = getHttp()
    const { data } = await http.post('/export/day', params, { responseType: 'blob' as any })
    return data as Blob
  },
  // Analytics
  async analyticsTeacherSummary(filters: AnalyticsFilters) {
    const { data } = await getHttp().post('/analytics/teacher/summary', filters)
    return (data?.items ?? []) as TeacherSummaryItem[]
  },
  async analyticsGroupSummary(filters: AnalyticsFilters) {
    const { data } = await getHttp().post('/analytics/group/summary', filters)
    return (data?.items ?? []) as GroupSummaryItem[]
  },
  async analyticsRoomSummary(filters: AnalyticsFilters) {
    const { data } = await getHttp().post('/analytics/room/summary', filters)
    return (data?.items ?? []) as RoomSummaryItem[]
  },
  async analyticsHeatmap(dimension: 'teacher' | 'group' | 'room', name: string, filters: AnalyticsFilters) {
    const { data } = await getHttp().post(`/analytics/heatmap`, filters, { params: { dimension, name } })
    return data as HeatmapResponse
  },
  async analyticsDistribution(dimension: 'teacher' | 'group' | 'subject' | 'room', filters: AnalyticsFilters) {
    const { data } = await getHttp().post('/analytics/distribution', filters, { params: { dimension } })
    return (data?.items ?? []) as DistributionItem[]
  },
  async analyticsTimeseries(filters: AnalyticsFilters) {
    const { data } = await getHttp().post('/analytics/timeseries', filters)
    return (data?.points ?? []) as TimeseriesAnalyticsPoint[]
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
    invalidateCacheByPrefix('/schedule/day')
    invalidateCacheByPrefix(`/schedule/day/${dayId}/report`)
    return data
  },
  // Admin: bulk strict
  async entryLookup(date: string) {
    const { data } = await getHttp().get('/schedule/day/entry_lookup', { params: { date } })
    const items = Array.isArray(data) ? data : (data?.items ?? [])
    return items as ScheduleEntry[]
  },
  async entryLookupParams(params: { date: string; group_name?: string; start_time?: string }) {
    const { data } = await getHttp().get('/schedule/day/entry_lookup', { params })
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
  // Generation
  async generateSemester(payload: any) {
    const { data } = await getHttp().post('/schedule/generate_semester', payload)
    return data
  },
  async getGenerationStatus(jobId: string) {
    const { data } = await getHttp().get(`/schedule/generate_semester/status/${jobId}`)
    return data
  },
  // Replacements
  async replaceTeacher(payload: { from_teacher_id: number; to_teacher_id: number; start_date: string; end_date: string }) {
    const { data } = await getHttp().post('/schedule/replace/teacher', payload)
    return data
  },
  async replaceRoom(payload: { from_room_id: number; to_room_id: number; start_date: string; end_date: string }) {
    const { data } = await getHttp().post('/schedule/replace/room', payload)
    return data
  },
  async replaceSubject(payload: { from_subject_id: number; to_subject_id: number; start_date: string; end_date: string }) {
    const { data } = await getHttp().post('/schedule/replace/subject', payload)
    return data
  },
  // Practice
  async getPractice() {
    const { data } = await getHttp().get('/practice')
    return (data?.items ?? []) as any[]
  },
  async createPractice(payload: { name: string; start_date: string; end_date: string; group_ids?: number[] }) {
    const { data } = await getHttp().post('/practice', payload)
    return data
  },
  async deletePractice(id: number) {
    const { data } = await getHttp().delete(`/practice/${id}`)
    return data
  },
  // Export
  async exportSchedule(payload: { start_date: string; end_date: string; group_ids?: number[]; teacher_ids?: number[] }) {
    const { data } = await getHttp().post('/export/schedule', payload, { responseType: 'blob' as any })
    return data as Blob
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
