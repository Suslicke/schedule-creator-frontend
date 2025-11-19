<template>
  <div class="max-w-[1200px] mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ t('dayPlan.title') }}</h2>
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
          <button class="btn-primary" :disabled="building" @click="buildPlan">{{ t('dayPlan.build') }}</button>
          <RouterLink v-if="day?.id" class="btn-secondary" :to="{ name: 'admin-day-editor' }">{{ t('dayPlan.openGrid') }}</RouterLink>
        </div>
        <div class="md:col-span-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.from_plan" /> <span class="text-sm">{{ t('editor.fromPlan') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.enforce_no_gaps" /> <span class="text-sm">{{ t('editor.noGaps') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.allow_repeated_subjects" /> <span class="text-sm">{{ t('editor.allowRepeats') }}</span></div>
          <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.maxRepeats') }}</label><input v-model.number="opts.max_repeats_per_subject" class="input w-24" type="number" min="1" /></div>
          <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.pairsPerDay') }}</label><input v-model.number="opts.max_pairs_per_day" class="input w-24" type="number" min="1" /></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.use_both_shifts" /> <span class="text-sm">{{ t('editor.bothShifts') }}</span></div>
        </div>
      </div>
      <div v-if="building" class="flex items-center gap-2 text-sm text-gray-500">
        <Spinner :inline="true" :size="18" :label="t('common.loading') as string" />
      </div>
    </div>

    <div v-if="dayData" class="space-y-3">
      <div class="card p-4">
        <div class="flex flex-wrap gap-2 items-center">
          <div>Day ID: <b>{{ dayData.id }}</b></div>
          <span class="badge bg-green-100 text-green-700">{{ t('editor.added') }}: {{ dayData.diff_counters?.added ?? 0 }}</span>
          <span class="badge bg-red-100 text-red-700">{{ t('editor.removed') }}: {{ dayData.diff_counters?.removed ?? 0 }}</span>
          <span class="badge bg-yellow-100 text-yellow-700">{{ t('editor.changed') }}: {{ dayData.diff_counters?.changed ?? 0 }}</span>
          <span class="badge bg-gray-100 text-gray-700">{{ t('editor.same') }}: {{ dayData.diff_counters?.same ?? 0 }}</span>
          <label class="ml-auto inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="onlyApproved" /> {{ t('analytics.onlyApproved') }}
          </label>
        </div>
      </div>
      <div class="card p-4 overflow-auto">
        <h3 class="text-sm font-semibold mb-2">{{ t('dayPlan.result') }}</h3>
        <table class="min-w-full text-sm">
          <thead><tr class="text-left text-gray-600"><th class="py-1 pr-4">{{ t('dayPlan.time') }}</th><th class="py-1 pr-4">{{ t('common.subject') }}</th><th class="py-1 pr-4">{{ t('common.group') }}</th><th class="py-1 pr-4">{{ t('dayPlan.status') }}</th></tr></thead>
          <TransitionGroup tag="tbody" name="fade-move">
            <tr v-for="(e, i) in entriesView" :key="i" class="border-t transition duration-200 hover:bg-gray-50">
              <td class="py-1 pr-4">{{ e.start_time }}–{{ e.end_time }}</td>
              <td class="py-1 pr-4">{{ e.subject_name }}</td>
              <td class="py-1 pr-4">{{ e.group_name }}</td>
              <td class="py-1 pr-4">
                <span :class="['px-2 py-0.5 rounded text-xs font-medium', statusClass(e.approval_status || e.status || 'planned')]">
                  {{ statusLabel(e.approval_status || e.status || 'planned') }}
                </span>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { api } from '@/services/api'
import DatePicker from '@/components/common/DatePicker.vue'
import type { DayPlanRequest, DayData } from '@/types/schedule'
import { todayYMD } from '@/utils/format'
import { useI18n } from 'vue-i18n'
import { useDebounce } from '@/composables/useDebounce'
import Spinner from '@/components/common/Spinner.vue'
const { t } = useI18n()

const date = ref(todayYMD())
const groupName = ref('')
const building = ref(false)
const dayData = ref<DayData | null>(null)
const opts = reactive({ from_plan: true, enforce_no_gaps: true, allow_repeated_subjects: true, max_repeats_per_subject: 3, max_pairs_per_day: 4, use_both_shifts: false })
const onlyApproved = ref(false)

async function buildPlan() {
  if (!date.value) return
  building.value = true
  try {
    const payload: DayPlanRequest = { date: date.value, group_name: groupName.value || undefined, from_plan: opts.from_plan, enforce_no_gaps: opts.enforce_no_gaps, allow_repeated_subjects: opts.allow_repeated_subjects, max_repeats_per_subject: opts.max_repeats_per_subject, max_pairs_per_day: opts.max_pairs_per_day, use_both_shifts: opts.use_both_shifts }
    await api.scheduleDayPlan(payload)
    dayData.value = await api.getDay({ date: date.value, group_name: groupName.value || undefined })
  } finally { building.value = false }
}

// Auto build on any param change (debounced)
const debouncedBuild = useDebounce(buildPlan, 600)
watch(() => date.value, () => debouncedBuild())
watch(() => groupName.value, () => debouncedBuild())
watch(opts, () => debouncedBuild(), { deep: true })

// Initial auto-build
buildPlan()

function statusClass(raw: string | null | undefined) {
  const s = (raw || '').toString()
  if (s === 'approved') return 'bg-green-100 text-green-700'
  if (s === 'replaced_manual') return 'bg-blue-100 text-blue-700'
  if (s === 'replaced_auto') return 'bg-teal-100 text-teal-700'
  if (s.startsWith('replaced')) return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}
function statusLabel(raw: string | null | undefined) {
  const key = `status.${(raw || 'planned').toString()}`
  const tr = t(key)
  return tr !== key ? tr : (raw || 'planned')
}

const entriesView = computed(() => {
  const list = dayData.value?.entries || []
  if (!onlyApproved.value) return list
  return list.filter(e => (e.approval_status || '').toString() === 'approved')
})
</script>

<style scoped>
.badge { @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium; }
.fade-move-enter-active, .fade-move-leave-active, .fade-move-move { transition: all 0.25s ease; }
.fade-move-enter-from, .fade-move-leave-to { opacity: 0; transform: translateY(4px); }
</style>
