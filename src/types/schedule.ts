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
  // Advanced options
  allow_repeated_subjects?: boolean
  max_repeats_per_subject?: number
  max_pairs_per_day?: number
  use_both_shifts?: boolean
}

export type DayPlanResponse = { id: number; entries: (ScheduleEntry & { status?: string })[] }

export type DayReport = { blockers: string[]; warnings: string[]; issues?: DayIssue[] }

export type DayIssue = {
  code?: string
  severity: 'blocker' | 'warning' | string
  message: string
  entry_ids?: number[]
  group_name?: string
  teacher_name?: string
  room_name?: string
}

export type BulkChange = { entry_id: number; field: string; new_value: string }
export type BulkDiffRow = { entry_id: number; field: string; old_value: string; new_value: string }

export type ProgressSummary = { key: string; total_hours: number; approved_hours: number; pending_hours: number }
export type TimeseriesPoint = { date: string; hours: number; cumulative?: number }

// Day details (Actual vs Plan) and diffs
export type DayDiffType = 'added' | 'removed' | 'changed' | 'same'
export type DayDifference = {
  group_name: string
  start_time: string
  type: DayDiffType
  plan_subject?: string
  actual_subject?: string
  plan_teacher?: string
  actual_teacher?: string
  plan_room?: string
  actual_room?: string
}

export type DiffCounters = { added: number; removed: number; changed: number; same: number }

export type GroupHoursSummary = {
  group_name: string
  actual_pairs: number
  plan_pairs: number
  delta_pairs: number
  actual_hours_AH: number
  plan_hours_AH: number
  delta_hours_AH: number
}

export type SubjectHoursSummary = {
  group_name: string
  subject_name: string
  actual_pairs: number
  plan_pairs: number
  delta_pairs: number
  actual_hours_AH: number
  plan_hours_AH: number
  delta_hours_AH: number
}

export type DayData = {
  id: number
  date: string
  status?: string
  entries: (ScheduleEntry & { status?: string })[]
  plan_entries: (ScheduleEntry & { status?: string })[]
  differences: DayDifference[]
  diff_counters: DiffCounters
  planned_pairs: number
  approved_pairs: number
  planned_hours: number
  approved_hours: number
  group_hours_summary: GroupHoursSummary[]
  subject_hours_summary: SubjectHoursSummary[]
  reasons?: string[]
}

// Entry options for manual replace
export type EntryOptions = {
  entry_id: number
  date: string
  group_name: string
  subject_name: string
  start_time: string
  end_time: string
  teachers: {
    teacher_name: string
    source?: 'group_subject_mapping' | 'group_mapping' | 'free' | 'busy' | string
    busy?: boolean
    conflicts_count?: number
    busy_groups?: string[]
    conflicts?: { entry_id: number; group_name: string; subject_name: string; room_name: string }[]
  }[]
  rooms: {
    room_name: string
    capacity?: number
    busy?: boolean
    conflicts_count?: number
    used?: number
    occupied_by?: { entry_id: number; group_name: string; subject_name: string; teacher_name: string }[]
  }[]
}

// Room swap planning
export type RoomSwapPlan = {
  entry_id: number
  desired_room_name: string
  is_free: boolean
  can_auto_resolve?: boolean
  conflicts?: {
    entry_id: number
    group_name: string
    subject_name: string
    teacher_name: string
    room_name: string
    alternatives: string[]
  }[]
}

export type SwapRoomChoice = { entry_id: number; room_name: string }
export type SwapRoomRequest = { desired_room_name: string; choices?: SwapRoomChoice[]; dry_run?: boolean }
export type SwapRoomResponse = { changed: { entry_id: number; old_room: string; new_room: string }[]; report?: any }

// Teacher swap planning
export type TeacherSwapPlan = {
  entry_id: number
  date?: string
  start_time?: string
  end_time?: string
  desired_teacher_name: string
  desired_subject_name?: string
  is_free: boolean
  can_auto_resolve?: boolean
  conflicts?: {
    entry_id: number
    group_name: string
    subject_name: string
    teacher_name: string
    alternatives: string[]
  }[]
}

export type SwapTeacherChoice = { entry_id: number; teacher_name: string }
export type SwapTeacherRequest = { desired_teacher_name: string; choices?: SwapTeacherChoice[]; dry_run?: boolean }
export type SwapTeacherResponse = { changed: { entry_id: number; old_teacher: string | null; new_teacher: string }[]; report?: any; dry_run?: boolean }

// Analytics types
export type AnalyticsFilters = {
  start_date: string
  end_date: string
  teachers?: string[]
  groups?: string[]
  subjects?: string[]
  rooms?: string[]
  only_approved?: boolean
}

export type TeacherSummaryItem = {
  teacher_name: string
  group_name?: string
  subject_name?: string
  planned_pairs?: number
  planned_hours_AH?: number
  actual_pairs?: number
  actual_hours_AH?: number
  total_plan_hours_AH?: number
  percent_assigned?: number
  percent_actual?: number
  manual_completed_hours_AH?: number
  effective_hours_AH?: number
  percent_effective?: number
}

export type GroupSummaryItem = {
  group_name: string
  subject_name?: string
  planned_pairs?: number
  planned_hours_AH?: number
  actual_pairs?: number
  actual_hours_AH?: number
  total_plan_hours_AH?: number
  percent_assigned?: number
  percent_actual?: number
  manual_completed_hours_AH?: number
  effective_hours_AH?: number
  percent_effective?: number
}

export type RoomSummaryItem = {
  room_name: string
  planned_pairs?: number
  planned_hours_AH?: number
  actual_pairs?: number
  actual_hours_AH?: number
}

export type HeatmapResponse = {
  days: string[]
  slots: string[]
  matrix: number[][]
  totals_by_day?: number[]
  totals_by_slot?: number[]
}

export type DistributionItem = { name: string; planned_pairs?: number; planned_hours_AH?: number; actual_pairs?: number; actual_hours_AH?: number }
export type TimeseriesAnalyticsPoint = { date: string; planned_pairs?: number; planned_hours_AH?: number; actual_pairs?: number; actual_hours_AH?: number }
