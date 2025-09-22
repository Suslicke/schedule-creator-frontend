<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 flex flex-wrap gap-3 items-end">
      <div class="text-sm">Day ID: <b>{{ dayId }}</b></div>
      <div class="flex items-center gap-2"><button class="btn-secondary" @click="replaceVacant" :disabled="busy">{{ t('editor.autoVacant') }}</button></div>
      <div class="flex items-center gap-2">
        <button class="btn-primary" @click="loadReport" :disabled="busy">{{ t('dayDetail.refreshReport') }}</button>
        <button class="btn-primary" @click="approve" :disabled="busy">{{ t('editor.approve') }}</button>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-600">{{ t('dayDetail.lookupDate') }}</label>
        <DatePicker v-model="lookupDate" />
        <button class="btn-secondary" @click="loadEntries" :disabled="!lookupDate || busy">{{ t('dayDetail.load') }}</button>
      </div>
      <label class="ml-auto inline-flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="onlyApproved" /> {{ t('analytics.onlyApproved') }}
      </label>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-3">
        <div class="card p-4" v-if="loadingEntries"><Spinner :inline="true" :label="t('dayDetail.loadingEntries') as string" /></div>
        <ScheduleGrid v-else :entries="entriesView" />

        <div class="card p-4 space-y-2">
          <h3 class="text-sm font-semibold">{{ t('dayDetail.manualEdit') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input v-model.number="manual.entry_id" class="input" :placeholder="t('bulk.entryId')" />
            <input v-model="manual.field" class="input" :placeholder="t('bulk.field')" />
            <input v-model="manual.value" class="input" :placeholder="t('bulk.newValue')" />
          </div>
          <button class="btn-primary" @click="applyManual" :disabled="!manual.entry_id || !manual.field">{{ t('dayDetail.apply') }}</button>
        </div>
      </div>
      <DayReportPanel :day-id="dayId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Spinner from '@/components/common/Spinner.vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/api'
import DatePicker from '@/components/common/DatePicker.vue'
import ScheduleGrid from '@/components/schedule/ScheduleGrid.vue'
import DayReportPanel from '@/components/schedule/DayReportPanel.vue'
import type { ScheduleEntry } from '@/types/schedule'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const { t } = useI18n()
const route = useRoute()
const dayId = Number(route.params.dayId)
const lookupDate = ref('')
const entries = ref<ScheduleEntry[]>([])
const onlyApproved = ref(false)
const entriesView = computed(() => {
  if (!onlyApproved.value) return entries.value
  return entries.value.filter(e => (e.approval_status || '').toString() === 'approved')
})
const loadingEntries = ref(false)
const busy = ref(false)

async function loadEntries() {
  if (!lookupDate.value) return
  loadingEntries.value = true
  try {
    const list = await api.entryLookup(lookupDate.value)
    entries.value = list.filter(e => e.day_id === dayId)
  } finally { loadingEntries.value = false }
}

async function replaceVacant() {
  busy.value = true
  try { await api.replaceVacantAuto(dayId); toast.success('Автозамена выполнена'); await loadEntries() } finally { busy.value = false }
}
async function loadReport() { /* DayReportPanel auto-loads */ }
async function approve() {
  busy.value = true
  try { await api.approveDay(dayId, { enforce_no_blockers: true }); toast.success('Утверждено') } finally { busy.value = false }
}

const manual = ref<{ entry_id: number | null; field: string; value: string }>({ entry_id: null, field: '', value: '' })
async function applyManual() {
  if (!manual.value.entry_id || !manual.value.field) return
  busy.value = true
  try {
    await api.updateEntryManual({ entry_id: manual.value.entry_id, changes: { [manual.value.field]: manual.value.value } })
    toast.success('Изменение применено')
    await loadEntries()
  } finally { busy.value = false }
}

// Auto-load entries when lookupDate changes (debounced)
import { useDebounce } from '@/composables/useDebounce'
const debouncedLoad = useDebounce(() => loadEntries(), 400)
watch(() => lookupDate.value, () => debouncedLoad())
</script>
