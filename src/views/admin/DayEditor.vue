<template>
  <div class="max-w-[1200px] mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ t('editor.title') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
          <DatePicker v-model="date" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs text-gray-600">{{ t('common.group') }} ({{ t('editor.optional') }})</label>
          <input v-model="groupName" class="input" :placeholder="t('editor.groupPlaceholder')" />
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-primary" :disabled="!date || loading" @click="buildPlan">{{ t('editor.build') }}</button>
          <button class="btn-secondary" :disabled="!date || loading" @click="refresh">{{ t('editor.refresh') }}</button>
        </div>
        <div class="md:col-span-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.from_plan" /> <span class="text-sm">{{ t('editor.fromPlan') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.enforce_no_gaps" /> <span class="text-sm">{{ t('editor.noGaps') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.allow_repeated_subjects" /> <span class="text-sm">{{ t('editor.allowRepeats') }}</span></div>
          <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.maxRepeats') }}</label><input v-model.number="opts.max_repeats_per_subject" class="input w-24" type="number" min="1" /></div>
          <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.pairsPerDay') }}</label><input v-model.number="opts.max_pairs_per_day" class="input w-24" type="number" min="1" /></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.use_both_shifts" /> <span class="text-sm">{{ t('editor.bothShifts') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="autoBuild" /> <span class="text-sm">{{ t('editor.autoBuild') }}</span></div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <button class="btn-success" :disabled="!day?.id || loading" @click="approve">{{ t('editor.approve') }}</button>
        <button class="btn-secondary" :disabled="!day?.id || loading" @click="downloadExcel">{{ t('editor.export') }}</button>
        <button class="btn-secondary" :disabled="!day?.id || loading" @click="replaceVacant">{{ t('editor.autoVacant') }}</button>
        <label class="ml-auto inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="onlyDiffs" /> {{ t('editor.showOnlyDiffs') }}
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="onlyApproved" /> {{ t('analytics.onlyApproved') }}
        </label>
      </div>
    </div>

    <div v-if="day" class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-3">
        <div class="card p-3 flex flex-wrap gap-2 items-center">
          <span class="badge bg-green-100 text-green-700">{{ t('editor.added') }}: {{ day.diff_counters?.added ?? 0 }}</span>
          <span class="badge bg-red-100 text-red-700">{{ t('editor.removed') }}: {{ day.diff_counters?.removed ?? 0 }}</span>
          <span class="badge bg-yellow-100 text-yellow-700">{{ t('editor.changed') }}: {{ day.diff_counters?.changed ?? 0 }}</span>
          <span class="badge bg-gray-100 text-gray-700">{{ t('editor.same') }}: {{ day.diff_counters?.same ?? 0 }}</span>
          <span class="ml-auto text-sm text-gray-600">
            {{ t('editor.pairs') }}: {{ day.planned_pairs }} / {{ day.approved_pairs }} • AH: {{ day.planned_hours }} / {{ day.approved_hours }}
          </span>
        </div>
      </div>
      <div class="xl:col-span-2 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card p-4">
            <h3 class="text-sm font-semibold mb-2">{{ t('editor.actual') }}</h3>
            <div v-if="!day.entries?.length" class="text-sm text-gray-500">{{ t('common.noData') }}</div>
            <TransitionGroup v-else name="fade-move" tag="div" class="space-y-3">
              <div v-for="(e,i) in filteredSorted(day.entries, 'actual')" :key="entryKey(e,i)" class="border rounded-md p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow" :class="entryBoxClass(e, 'actual')">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-600">{{ e.start_time }}–{{ e.end_time }}</div>
                  <div class="flex items-center gap-2">
                    <span v-for="(chip, idx) in chips(e, 'actual')" :key="idx" class="px-2 py-0.5 rounded text-xs font-medium" :class="chip.class">{{ chip.label }}</span>
                    <button class="btn-xs btn-secondary" @click="openReplace(e)">{{ t('editor.replace') }}</button>
                  </div>
                </div>
                <div class="text-base font-semibold">{{ e.subject_name }}</div>
                <div class="text-sm text-gray-700">{{ e.group_name }} • {{ e.teacher_name }} • {{ e.room_name }}</div>
              </div>
            </TransitionGroup>
          </div>
          <div class="card p-4">
            <h3 class="text-sm font-semibold mb-2">{{ t('editor.plan') }}</h3>
            <div v-if="!day.plan_entries?.length" class="text-sm text-gray-500">{{ t('editor.noPlan') }}</div>
            <TransitionGroup v-else name="fade-move" tag="div" class="space-y-3">
              <div v-for="(e,i) in filteredSorted(day.plan_entries, 'plan')" :key="entryKey(e,i)" class="border rounded-md p-3 bg-gray-50 transition duration-200 hover:-translate-y-0.5 hover:shadow" :class="entryBoxClass(e, 'plan')">
                <div class="text-sm text-gray-600">{{ e.start_time }}–{{ e.end_time }}</div>
                <div class="text-base font-semibold">{{ e.subject_name }}</div>
                <div class="text-sm text-gray-700 flex items-center gap-2">
                  <span>{{ e.group_name }} • {{ e.teacher_name }} • {{ e.room_name }}</span>
                  <span v-for="(chip, idx) in chips(e, 'plan')" :key="idx" class="px-2 py-0.5 rounded text-xs font-medium" :class="chip.class">{{ chip.label }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <div class="card p-4">
          <h3 class="text-sm font-semibold mb-3">{{ t('editor.differences') }}</h3>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="badge" :class="'bg-green-100 text-green-700'">{{ t('editor.added') }}: {{ day.diff_counters?.added ?? 0 }}</span>
            <span class="badge" :class="'bg-red-100 text-red-700'">{{ t('editor.removed') }}: {{ day.diff_counters?.removed ?? 0 }}</span>
            <span class="badge" :class="'bg-yellow-100 text-yellow-700'">{{ t('editor.changed') }}: {{ day.diff_counters?.changed ?? 0 }}</span>
            <span class="badge" :class="'bg-gray-100 text-gray-700'">{{ t('editor.same') }}: {{ day.diff_counters?.same ?? 0 }}</span>
          </div>
          <div v-if="!day.differences?.length" class="text-sm text-gray-500">{{ t('editor.noDiffs') }}</div>
          <TransitionGroup v-else name="fade-move" tag="div" class="space-y-2">
            <div v-for="(d,i) in day.differences" :key="i+'-'+d.group_name+'-'+d.start_time" class="text-sm p-2 rounded border transition-colors duration-200"
                 :class="diffClass(d.type)">
              <b>{{ t(`editor.diff.${d.type}`) }}</b> • {{ d.group_name }} • {{ d.start_time }}:
              <span v-if="d.plan_subject || d.actual_subject">
                {{ t('common.subject') || 'Предмет' }} {{ d.plan_subject || '—' }} → {{ d.actual_subject || '—' }};
              </span>
              <span v-if="d.plan_teacher || d.actual_teacher">{{ t('common.teacher') }} {{ d.plan_teacher || '—' }} → {{ d.actual_teacher || '—' }};</span>
              <span v-if="d.plan_room || d.actual_room">{{ t('common.room') }} {{ d.plan_room || '—' }} → {{ d.actual_room || '—' }}</span>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div class="space-y-4">
        <div class="card p-4 space-y-2">
          <h3 class="text-sm font-semibold">{{ t('editor.totals') }}</h3>
          <div class="text-sm text-gray-700">{{ t('editor.pairs') }}: {{ day.planned_pairs }} / {{ day.approved_pairs }}</div>
          <div class="text-sm text-gray-700">AH: {{ day.planned_hours }} / {{ day.approved_hours }}</div>
          <div v-if="day.reasons?.length" class="pt-2">
            <div class="text-xs font-semibold text-gray-600">{{ t('editor.reasons') }}</div>
            <ul class="list-disc list-inside text-xs text-gray-700">
              <li v-for="(r,i) in day.reasons" :key="i">{{ r }}</li>
            </ul>
          </div>
        </div>

        <div class="card p-4 overflow-auto">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold">{{ t('editor.groupsSummary') }}</h3>
            <label class="text-xs text-gray-600 inline-flex items-center gap-2"><input type="checkbox" v-model="showBars" /> {{ t('editor.showBars') }}</label>
          </div>
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-600"><th class="py-1 pr-4">Группа</th><th class="py-1 pr-4">Пары (act/plan/Δ)</th><th class="py-1 pr-4">Часы AH (act/plan/Δ)</th></tr>
            </thead>
            <tbody>
              <tr v-for="(g,i) in day.group_hours_summary" :key="i" class="border-t">
                <td class="py-1 pr-4">{{ g.group_name }}</td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ g.actual_pairs }} / {{ g.plan_pairs }} / {{ g.delta_pairs }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-blue-500" :style="{ width: pctWidth(g.actual_pairs, g.plan_pairs) }"></div></div>
                  </div>
                </td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ g.actual_hours_AH }} / {{ g.plan_hours_AH }} / {{ g.delta_hours_AH }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-emerald-500" :style="{ width: pctWidth(g.actual_hours_AH, g.plan_hours_AH) }"></div></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card p-4 overflow-auto">
          <h3 class="text-sm font-semibold mb-2">{{ t('editor.subjectsSummary') }}</h3>
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-600"><th class="py-1 pr-4">Группа</th><th class="py-1 pr-4">Предмет</th><th class="py-1 pr-4">Пары (act/plan/Δ)</th><th class="py-1 pr-4">Часы AH (act/plan/Δ)</th></tr>
            </thead>
            <tbody>
              <tr v-for="(s,i) in day.subject_hours_summary" :key="i" class="border-t">
                <td class="py-1 pr-4">{{ s.group_name }}</td>
                <td class="py-1 pr-4">{{ s.subject_name }}</td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ s.actual_pairs }} / {{ s.plan_pairs }} / {{ s.delta_pairs }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-blue-500" :style="{ width: pctWidth(s.actual_pairs, s.plan_pairs) }"></div></div>
                  </div>
                </td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ s.actual_hours_AH }} / {{ s.plan_hours_AH }} / {{ s.delta_hours_AH }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-emerald-500" :style="{ width: pctWidth(s.actual_hours_AH, s.plan_hours_AH) }"></div></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Side panel: replacement options -->
    <Modal v-if="showOptions" @close="closeOptions">
      <template #title>{{ t('editor.replaceTitle') }}: {{ entryForOptions?.subject_name }} ({{ entryForOptions?.start_time }}–{{ entryForOptions?.end_time }})</template>
      <div>
        <div class="flex items-center gap-2 border-b mb-3">
          <button :class="tabClass('teachers')" @click="tab='teachers'">{{ t('editor.teachersTab') }}</button>
          <button :class="tabClass('rooms')" @click="tab='rooms'">{{ t('editor.roomsTab') }}</button>
          <input v-model="search" class="input ml-auto w-56" :placeholder="t('editor.search')" />
        </div>
        <div v-if="loadingOptions" class="py-6"><Spinner /></div>
        <Transition name="tab-fade" mode="out-in">
          <div v-if="!loadingOptions && tab==='teachers'" key="t">
            <div v-if="!filteredTeachers.length" class="text-sm text-gray-500">{{ t('editor.noTeachers') }}</div>
            <div v-else class="space-y-2 max-h-72 overflow-auto">
              <button v-for="(tch,i) in filteredTeachers" :key="i" class="btn-secondary w-full justify-start transition-colors duration-200 hover:bg-blue-50" @click="applyTeacher(tch.teacher_name)">
                {{ tch.teacher_name }}
                <span v-if="tch.source" class="ml-2 text-xs text-gray-500">({{ tch.source }})</span>
              </button>
            </div>
          </div>
          <div v-else-if="!loadingOptions && tab==='rooms'" key="r">
            <div v-if="!filteredRooms.length" class="text-sm text-gray-500">{{ t('editor.noRooms') }}</div>
            <div v-else class="space-y-2 max-h-72 overflow-auto">
              <button v-for="(r,i) in filteredRooms" :key="i" class="btn-secondary w-full justify-between transition-colors duration-200 hover:bg-blue-50" @click="tryRoom(r.room_name)">
                <span>{{ r.room_name }}</span>
                <span v-if="r.capacity" class="text-xs text-gray-500">cap={{ r.capacity }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="closeOptions">{{ t('editor.close') }}</button>
      </template>
    </Modal>

    <!-- Modal for room swap plan / auto resolve -->
    <Modal v-if="swapPlan" @close="swapPlan = null">
      <template #title>{{ t('editor.freeRoomTitle') }}: {{ swapPlan?.desired_room_name }}</template>
      <div v-if="swapPlan">
        <div v-if="swapPlan.is_free" class="text-sm text-green-700">{{ t('editor.roomIsFree') }}</div>
        <div v-else>
          <div class="text-sm mb-2" :class="swapPlan.can_auto_resolve ? 'text-yellow-700' : 'text-red-700'">
            {{ t('editor.conflicts') }}: {{ swapPlan.conflicts?.length || 0 }} • {{ t('editor.autoResolve') }}: {{ swapPlan.can_auto_resolve ? t('editor.possible') : t('editor.no') }}
          </div>
          <div class="space-y-2 max-h-64 overflow-auto">
            <div v-for="(c,i) in (swapPlan.conflicts || [])" :key="i" class="border rounded p-2 text-sm">
              <div class="font-medium">entry {{ c.entry_id }} — {{ c.group_name }} • {{ c.subject_name }} • {{ c.teacher_name }} • {{ c.room_name }}</div>
              <div>{{ t('editor.alternatives') }}: {{ c.alternatives?.join(', ') || '—' }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2">
          <button class="btn-secondary" @click="previewSwap" :disabled="!entryForOptions || !swapPlan">{{ t('editor.preview') }}</button>
          <button class="btn-primary" @click="applySwap" :disabled="!entryForOptions || !swapPlan">{{ t('editor.auto') }}</button>
          <button class="btn-secondary" @click="swapPlan = null">{{ t('editor.close') }}</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import DatePicker from '@/components/common/DatePicker.vue'
import Modal from '@/components/common/Modal.vue'
import { api } from '@/services/api'
import type { DayData, ScheduleEntry, EntryOptions, RoomSwapPlan } from '@/types/schedule'
import { todayYMD } from '@/utils/format'
import { useI18n } from 'vue-i18n'
import { useDebounce } from '@/composables/useDebounce'
const { t } = useI18n()

const date = ref<string>(todayYMD())
const groupName = ref<string>('')
const loading = ref(false)
const day = ref<DayData | null>(null)

const opts = reactive({
  from_plan: true,
  enforce_no_gaps: true,
  allow_repeated_subjects: true,
  max_repeats_per_subject: 3,
  max_pairs_per_day: 4,
  use_both_shifts: false,
})
const autoBuild = ref(true)
const showBars = ref(true)

async function refresh() {
  if (!date.value) return
  loading.value = true
  try {
    day.value = await api.getDay({ date: date.value, group_name: groupName.value || undefined })
  } finally { loading.value = false }
}

async function buildPlan() {
  if (!date.value) return
  loading.value = true
  try {
    const payload: any = { date: date.value, group_name: groupName.value || undefined, ...opts }
    await api.scheduleDayPlan(payload)
    await refresh()
  } finally { loading.value = false }
}

async function approve() {
  if (!day.value?.id) return
  loading.value = true
  try {
    await api.approveDayV2(day.value.id, { record_progress: true, enforce_no_blockers: true, group_name: groupName.value || undefined })
    await refresh()
  } finally { loading.value = false }
}

async function downloadExcel() {
  if (!date.value) return
  const blob = await api.exportDay({ date: date.value, groups: groupName.value ? [groupName.value] : undefined })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `day_${date.value}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

function sorted(list: ScheduleEntry[]) {
  return [...(list || [])].sort((a, b) => a.start_time.localeCompare(b.start_time))
}
const onlyDiffs = ref(false)
const onlyApproved = ref(false)
function filteredSorted(list: ScheduleEntry[], mode: 'actual'|'plan') {
  let arr = sorted(list)
  if (onlyApproved.value) arr = arr.filter(e => (e.approval_status || '').toString() === 'approved')
  if (!onlyDiffs.value) return arr
  return arr.filter(e => {
    const d = diffForEntry(e, mode)
    if (!d) return false
    return d.type !== 'same'
  })
}
function diffClass(t: string) {
  if (t === 'added') return 'bg-green-50 border-green-200 text-green-800'
  if (t === 'removed') return 'bg-red-50 border-red-200 text-red-800'
  if (t === 'changed') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  return 'bg-gray-50 border-gray-200 text-gray-700'
}

const diffMap = computed(() => {
  const m = new Map<string, any>()
  const diffs = day.value?.differences || []
  for (const d of diffs) {
    const key = `${d.group_name}__${d.start_time}`
    m.set(key, d)
  }
  return m
})
function diffForEntry(e: ScheduleEntry, mode: 'actual'|'plan') {
  const key = `${e.group_name}__${e.start_time}`
  const d = diffMap.value.get(key)
  if (!d) return null
  return d
}
function entryBoxClass(e: ScheduleEntry, mode: 'actual'|'plan') {
  const d = diffForEntry(e, mode)
  if (!d) return ''
  if (mode === 'actual') {
    if (d.type === 'added') return 'border-green-300'
    if (d.type === 'changed') return 'border-yellow-300'
  } else {
    if (d.type === 'removed') return 'border-red-300'
    if (d.type === 'changed') return 'border-yellow-300'
  }
  return ''
}
function chips(e: ScheduleEntry, mode: 'actual'|'plan') {
  const d = diffForEntry(e, mode)
  const res: { label: string; class: string }[] = []
  if (!d) return res
  const cls = 'bg-yellow-100 text-yellow-700'
  if (d.type === 'added' && mode === 'actual') res.push({ label: t('editor.addedShort'), class: 'bg-green-100 text-green-700' })
  if (d.type === 'removed' && mode === 'plan') res.push({ label: t('editor.removedShort'), class: 'bg-red-100 text-red-700' })
  if (d.type === 'changed') {
    if (d.plan_subject !== d.actual_subject) res.push({ label: t('common.subject'), class: cls })
    if (d.plan_teacher !== d.actual_teacher) res.push({ label: t('common.teacher'), class: cls })
    if (d.plan_room !== d.actual_room) res.push({ label: t('common.room'), class: cls })
  }
  return res
}
function entryKey(e: ScheduleEntry, i: number) {
  return e.entry_id ?? `${e.date}-${e.start_time}-${e.end_time}-${e.group_name}-${e.subject_name}-${i}`
}

// Replacement flow
const showOptions = ref(false)
const entryForOptions = ref<ScheduleEntry | null>(null)
const options = ref<EntryOptions | null>(null)
const tab = ref<'teachers'|'rooms'>('teachers')
const search = ref('')
const filteredTeachers = computed(() => {
  const list = options.value?.teachers || []
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(t => t.teacher_name.toLowerCase().includes(q))
})
const filteredRooms = computed(() => {
  const list = options.value?.rooms || []
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(r => r.room_name.toLowerCase().includes(q))
})

function openReplace(e: ScheduleEntry) {
  entryForOptions.value = e
  showOptions.value = true
  loadOptions()
}
function closeOptions() { showOptions.value = false; entryForOptions.value = null; options.value = null }
function tabClass(x: 'teachers'|'rooms') {
  return ['px-3 py-1 rounded-md text-sm transition-all duration-200', tab.value===x ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-gray-700 hover:bg-gray-100']
}

async function loadOptions() {
  if (!entryForOptions.value?.entry_id) return
  options.value = await api.getEntryOptions(entryForOptions.value.entry_id)
}

async function applyTeacher(name: string) {
  if (!entryForOptions.value?.entry_id) return
  try {
    await api.updateEntryManualV2({ entry_id: entryForOptions.value.entry_id, teacher_name: name })
    await refresh()
    closeOptions()
  } catch (e) {
    alert('Нельзя применить выбранного преподавателя (занят). Попробуйте другой вариант.')
  }
}

// Room selection: try to swap plan if occupied
const swapPlan = ref<RoomSwapPlan | null>(null)
async function tryRoom(roomName: string) {
  if (!entryForOptions.value?.entry_id) return
  // Check plan first
  const plan = await api.getRoomSwapPlan(entryForOptions.value.entry_id, roomName)
  if (plan.is_free) {
    try {
      await api.updateEntryManualV2({ entry_id: entryForOptions.value.entry_id, room_name: roomName })
      await refresh()
      closeOptions()
    } catch (e) { alert('Нельзя поставить в эту аудиторию'); }
    return
  }
  swapPlan.value = plan
}

async function previewSwap() {
  if (!entryForOptions.value?.entry_id || !swapPlan.value) return
  const res = await api.swapRoom(entryForOptions.value.entry_id, { desired_room_name: swapPlan.value.desired_room_name, dry_run: true })
  alert(t('editor.previewList') + '\n' + res.changed.map(c => `${c.entry_id}: ${c.old_room} -> ${c.new_room}`).join('\n'))
}
async function applySwap() {
  if (!entryForOptions.value?.entry_id || !swapPlan.value) return
  await api.swapRoom(entryForOptions.value.entry_id, { desired_room_name: swapPlan.value.desired_room_name })
  await refresh()
  swapPlan.value = null
  closeOptions()
}

onMounted(() => { refresh() })
// React to param changes: either auto-build (POST then GET) or just refresh GET
const debouncedRefresh = useDebounce(() => refresh(), 400)
const debouncedBuild = useDebounce(() => buildPlan(), 600)
watch([date, groupName, () => opts.from_plan, () => opts.enforce_no_gaps, () => opts.allow_repeated_subjects, () => opts.max_repeats_per_subject, () => opts.max_pairs_per_day, () => opts.use_both_shifts, autoBuild], () => {
  if (autoBuild.value) debouncedBuild()
  else debouncedRefresh()
})

async function replaceVacant() {
  if (!day.value?.id) return
  loading.value = true
  try {
    await api.replaceVacantAuto(day.value.id)
    await refresh()
  } finally { loading.value = false }
}

function pctWidth(actual?: number, plan?: number) {
  const a = actual || 0
  const p = plan || 0
  if (p <= 0) return '0%'
  return Math.min(100, Math.round((a / p) * 100)) + '%'
}
</script>

<style scoped>
.badge { @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium; }
.btn-xs { @apply text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200; }
.fade-move-enter-active, .fade-move-leave-active, .fade-move-move { transition: all 0.25s ease; }
.fade-move-enter-from, .fade-move-leave-to { opacity: 0; transform: translateY(4px); }
.tab-fade-enter-active, .tab-fade-leave-active { transition: all 0.2s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; transform: translateY(4px); }
</style>
