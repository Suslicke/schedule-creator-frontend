export type ScheduleEntry = {
  date: string
  day: string
  start_time: string
  end_time: string
  subject_name: string
  teacher_name: string
  room_name: string
  group_name: string
  origin: string
  approval_status?: string | null
  is_override?: boolean
  day_id: number | null
  entry_id: number | null
}

export type DayPlanRequest = {
  date: string
  group_name?: string
  from_plan?: boolean
  auto_vacant_remove?: boolean
  debug?: boolean
  enforce_no_gaps?: boolean
}

export type DayPlanResponse = { id: number; entries: (ScheduleEntry & { status?: string })[] }

export type DayReport = { blockers: string[]; warnings: string[] }

export type BulkChange = { entry_id: number; field: string; new_value: string }
export type BulkDiffRow = { entry_id: number; field: string; old_value: string; new_value: string }

export type ProgressSummary = { key: string; total_hours: number; approved_hours: number; pending_hours: number }
export type TimeseriesPoint = { date: string; hours: number; cumulative?: number }
