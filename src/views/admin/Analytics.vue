<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ t('analytics.title') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div>
          <label class="text-xs text-gray-600">{{ t('home.period') }}</label>
          <div class="flex gap-2">
            <DatePicker v-model="filters.start_date" />
            <DatePicker v-model="filters.end_date" />
          </div>
        </div>
        <div>
          <SearchSelect :fetch-options="fetchTeachers" :placeholder="t('common.teacher')" v-model="teacher" />
        </div>
        <div>
          <SearchSelect :fetch-options="fetchGroups" :placeholder="t('common.group')" v-model="group" />
        </div>
        <div>
          <SearchSelect :fetch-options="fetchSubjects" :placeholder="t('common.subject')" v-model="subject" />
        </div>
        <div>
          <SearchSelect :fetch-options="fetchRooms" :placeholder="t('common.room')" v-model="room" />
        </div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="filters.only_approved" /> <span class="text-sm">{{ t('analytics.onlyApproved') }}</span></div>
      </div>
      <div class="flex gap-2">
        <button class="btn-primary" @click="refreshAll">{{ t('analytics.refresh') }}</button>
        <button class="btn-secondary" @click="clearFilters">{{ t('analytics.clear') }}</button>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex gap-2 border-b mb-3">
        <button :class="tabClass('teachers')" @click="tab='teachers'">{{ t('analytics.tabs.teachers') }}</button>
        <button :class="tabClass('groups')" @click="tab='groups'">{{ t('analytics.tabs.groups') }}</button>
        <button :class="tabClass('rooms')" @click="tab='rooms'">{{ t('analytics.tabs.rooms') }}</button>
        <button :class="tabClass('heatmap')" @click="tab='heatmap'">{{ t('analytics.tabs.heatmap') }}</button>
        <button :class="tabClass('timeseries')" @click="tab='timeseries'">{{ t('analytics.tabs.timeseries') }}</button>
        <button :class="tabClass('distribution')" @click="tab='distribution'">{{ t('analytics.tabs.distribution') }}</button>
      </div>

      <div v-if="tab==='teachers'" class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600">
              <th class="py-1 pr-4">{{ t('common.teacher') }}</th>
              <th class="py-1 pr-4">{{ t('common.group') }}</th>
              <th class="py-1 pr-4">{{ t('common.subject') }}</th>
              <th class="py-1 pr-4">plan (pairs/AH)</th>
              <th class="py-1 pr-4">actual (pairs/AH)</th>
              <th class="py-1 pr-4">{{ t('analytics.totalPlanAH') }}</th>
              <th class="py-1 pr-4">%assigned / %actual</th>
              <th class="py-1 pr-4">manual AH</th>
              <th class="py-1 pr-4">effective AH / %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in teacherRows" :key="i" class="border-t">
              <td class="py-1 pr-4">{{ r.teacher_name }}</td>
              <td class="py-1 pr-4">{{ r.group_name }}</td>
              <td class="py-1 pr-4">{{ r.subject_name }}</td>
              <td class="py-1 pr-4">{{ r.planned_pairs || 0 }} / {{ r.planned_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.actual_pairs || 0 }} / {{ r.actual_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.total_plan_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ pct(r.percent_assigned) }} / {{ pct(r.percent_actual) }}</td>
              <td class="py-1 pr-4">{{ r.manual_completed_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.effective_hours_AH || 0 }} / {{ pct(r.percent_effective) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="tab==='groups'" class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600">
              <th class="py-1 pr-4">{{ t('common.group') }}</th>
              <th class="py-1 pr-4">{{ t('common.subject') }}</th>
              <th class="py-1 pr-4">plan (pairs/AH)</th>
              <th class="py-1 pr-4">actual (pairs/AH)</th>
              <th class="py-1 pr-4">{{ t('analytics.totalPlanAH') }}</th>
              <th class="py-1 pr-4">%assigned / %actual</th>
              <th class="py-1 pr-4">manual AH</th>
              <th class="py-1 pr-4">effective AH / %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in groupRows" :key="i" class="border-t">
              <td class="py-1 pr-4">{{ r.group_name }}</td>
              <td class="py-1 pr-4">{{ r.subject_name }}</td>
              <td class="py-1 pr-4">{{ r.planned_pairs || 0 }} / {{ r.planned_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.actual_pairs || 0 }} / {{ r.actual_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.total_plan_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ pct(r.percent_assigned) }} / {{ pct(r.percent_actual) }}</td>
              <td class="py-1 pr-4">{{ r.manual_completed_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.effective_hours_AH || 0 }} / {{ pct(r.percent_effective) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="tab==='rooms'" class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead><tr class="text-left text-gray-600"><th class="py-1 pr-4">{{ t('common.room') }}</th><th class="py-1 pr-4">plan (pairs/AH)</th><th class="py-1 pr-4">actual (pairs/AH)</th><th class="py-1 pr-4">{{ t('analytics.load') }}</th></tr></thead>
          <tbody>
            <tr v-for="(r,i) in roomRowsSorted" :key="i" class="border-t">
              <td class="py-1 pr-4">{{ r.room_name }}</td>
              <td class="py-1 pr-4">{{ r.planned_pairs || 0 }} / {{ r.planned_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">{{ r.actual_pairs || 0 }} / {{ r.actual_hours_AH || 0 }}</td>
              <td class="py-1 pr-4">
                <div class="w-64 bg-gray-100 rounded h-3 overflow-hidden"><div class="h-3 bg-blue-500" :style="{ width: Math.min(100, (r.actual_pairs||0) * 10) + '%' }"></div></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="tab==='heatmap'" class="overflow-auto">
        <div class="flex items-center gap-2 mb-2">
          <label class="text-xs text-gray-600">{{ t('analytics.dimension') }}</label>
          <select v-model="dimension" class="input w-48">
            <option value="teacher">{{ t('common.teacher') }}</option>
            <option value="group">{{ t('common.group') }}</option>
            <option value="room">{{ t('common.room') }}</option>
          </select>
          <input v-model="dimName" class="input w-56" :placeholder="t('analytics.namePlaceholder')" />
          <button class="btn-secondary" @click="loadHeatmap">{{ t('analytics.refresh') }}</button>
        </div>
        <div v-if="!heatmap" class="text-sm text-gray-500">{{ t('common.noData') }}</div>
        <div v-else class="space-y-2">
          <div class="text-xs text-gray-600">{{ heatmap.days.join(' • ') }}</div>
          <div class="overflow-auto">
            <table class="text-xs border-collapse">
              <thead>
                <tr>
                  <th class="px-2 py-1 text-left">{{ t('analytics.slot') }}</th>
                  <th v-for="(d,i) in heatmap.days" :key="i" class="px-2 py-1 text-left">{{ d }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(slot, si) in heatmap.slots" :key="si">
                  <td class="px-2 py-1 text-gray-600">{{ slot }}</td>
                  <td v-for="(d,i) in heatmap.days" :key="i" class="px-1 py-1">
                    <div class="w-8 h-5 rounded" :style="{ backgroundColor: heatColor(heatmap.matrix[si]?.[i] || 0) }"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="tab==='timeseries'" class="overflow-x-auto">
        <svg v-if="tsPoints.length" :width="Math.max(600, tsPoints.length * 40)" height="220">
          <polyline :points="poly(tsPoints.map(p=>p.planned_pairs||0))" fill="none" stroke="#10b981" stroke-width="2" />
          <polyline :points="poly(tsPoints.map(p=>p.actual_pairs||0))" fill="none" stroke="#2563eb" stroke-width="2" />
        </svg>
        <div v-else class="text-sm text-gray-500">{{ t('common.noData') }}</div>
      </div>

      <div v-else class="overflow-x-auto">
        <svg v-if="distribution.length" :width="Math.max(600, distribution.length * 40)" height="220">
          <g v-for="(it,i) in distribution" :key="i">
            <rect :x="20 + i*40" :y="200 - scale(it.planned_pairs||0, maxDist)" width="12" :height="scale(it.planned_pairs||0, maxDist)" fill="#9ca3af" />
            <rect :x="34 + i*40" :y="200 - scale(it.actual_pairs||0, maxDist)" width="12" :height="scale(it.actual_pairs||0, maxDist)" fill="#2563eb" />
          </g>
        </svg>
        <div v-else class="text-sm text-gray-500">{{ t('common.noData') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DatePicker from '@/components/common/DatePicker.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import { api } from '@/services/api'
import type { TeacherSummaryItem, GroupSummaryItem, RoomSummaryItem, HeatmapResponse, DistributionItem, TimeseriesAnalyticsPoint, AnalyticsFilters } from '@/types/schedule'
import { todayYMD } from '@/utils/format'
import { useDebounce } from '@/composables/useDebounce'

const { t } = useI18n()
const filters = reactive<AnalyticsFilters>({ start_date: todayYMD(), end_date: todayYMD(), only_approved: false })
const teacher = ref<string>('')
const group = ref<string>('')
const subject = ref<string>('')
const room = ref<string>('')

function buildFilters(): AnalyticsFilters {
  const f: AnalyticsFilters = { ...filters }
  if (teacher.value) f.teachers = [teacher.value]
  if (group.value) f.groups = [group.value]
  if (subject.value) f.subjects = [subject.value]
  if (room.value) f.rooms = [room.value]
  return f
}

// Tab management
const tab = ref<'teachers'|'groups'|'rooms'|'heatmap'|'timeseries'|'distribution'>('teachers')
function tabClass(x: typeof tab.value) { return ['px-3 py-1 rounded-md text-sm', tab.value===x ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'] }

// Data
const teacherRows = ref<TeacherSummaryItem[]>([])
const groupRows = ref<GroupSummaryItem[]>([])
const roomRows = ref<RoomSummaryItem[]>([])
const roomRowsSorted = computed(() => [...roomRows.value].sort((a,b) => (b.actual_pairs||0) - (a.actual_pairs||0)))
const heatmap = ref<HeatmapResponse | null>(null)
const tsPoints = ref<TimeseriesAnalyticsPoint[]>([])
const distribution = ref<DistributionItem[]>([])

async function refreshAll() {
  const f = buildFilters()
  teacherRows.value = await api.analyticsTeacherSummary(f)
  groupRows.value = await api.analyticsGroupSummary(f)
  roomRows.value = await api.analyticsRoomSummary(f)
  tsPoints.value = await api.analyticsTimeseries(f)
  distribution.value = await api.analyticsDistribution('subject', f)
}

// Heatmap controls
const dimension = ref<'teacher'|'group'|'room'>('teacher')
const dimName = ref('')
async function loadHeatmap() { if (!dimName.value) { heatmap.value = null; return } heatmap.value = await api.analyticsHeatmap(dimension.value, dimName.value, buildFilters()) }

// Dict search
async function fetchTeachers(q: string) { return api.dictTeachers(q) }
async function fetchGroups(q: string) { return api.dictGroups(q) }
async function fetchSubjects(q: string) { return api.dictSubjects(q) }
async function fetchRooms(q: string) { return api.dictRooms(q) }

function pct(v?: number) { return (v ?? 0).toFixed(0) + '%' }
function scale(v: number, max: number) { const h = 180; if (max <= 0) return 0; return Math.max(0, Math.min(h, (v / max) * h)) }
const maxDist = computed(() => Math.max(1, ...distribution.value.map(d => Math.max(d.planned_pairs||0, d.actual_pairs||0))))
function poly(values: number[]) {
  const max = Math.max(1, ...values)
  return values.map((v, i) => `${30 + i*40},${200 - (v/max)*160}`).join(' ')
}
function heatColor(v: number) {
  const clamped = Math.max(0, Math.min(1, v / 6))
  const r = Math.round(255 * clamped)
  const g = Math.round(200 * (1 - clamped))
  return `rgb(${r},${g},120)`
}

function clearFilters() {
  teacher.value = ''
  group.value = ''
  subject.value = ''
  room.value = ''
}

// initial load
refreshAll()

// Auto-refresh on filters change (debounced)
const debouncedRefresh = useDebounce(() => refreshAll(), 500)
watch(filters, () => debouncedRefresh(), { deep: true })
watch(() => teacher.value, () => debouncedRefresh())
watch(() => group.value, () => debouncedRefresh())
watch(() => subject.value, () => debouncedRefresh())
watch(() => room.value, () => debouncedRefresh())

// Auto-refresh heatmap on controls (debounced)
const debouncedHeat = useDebounce(() => loadHeatmap(), 500)
watch(() => dimension.value, () => debouncedHeat())
watch(() => dimName.value, () => debouncedHeat())
</script>
