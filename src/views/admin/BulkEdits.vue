<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 flex flex-wrap items-end gap-3">
      <div>
        <label class="text-xs text-gray-600">{{ t('bulk.dayId') }}</label>
        <input v-model.number="dayId" class="input w-40" placeholder="123" />
      </div>
      <div>
        <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
        <DatePicker v-model="date" />
      </div>
      <button class="btn-secondary" :disabled="!date" @click="load">{{ t('bulk.loadEntries') }}</button>
    </div>

    <div class="card p-4 space-y-3">
      <h3 class="text-sm font-semibold">{{ t('bulk.title') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input v-model.number="change.entry_id" class="input" :placeholder="t('bulk.entryId')" />
        <input v-model="change.field" class="input" :placeholder="t('bulk.field')" />
        <input v-model="change.new_value" class="input" :placeholder="t('bulk.newValue')" />
        <button class="btn-secondary" @click="addChange">{{ t('bulk.add') }}</button>
      </div>
      <div v-if="changes.length" class="text-xs text-gray-700">{{ changes.length }} {{ t('bulk.changes') }}</div>
      <div class="flex gap-2">
        <button class="btn-primary" :disabled="!changes.length || !dayId" @click="dryRun">{{ t('bulk.dryRun') }}</button>
        <button class="btn-danger" :disabled="!changes.length || !dayId" @click="apply">{{ t('bulk.apply') }}</button>
      </div>
    </div>

    <div v-if="diff.length">
      <h3 class="text-sm font-semibold">{{ t('bulk.diff') }}</h3>
      <BulkEditor :diff="diff" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DatePicker from '@/components/common/DatePicker.vue'
import BulkEditor from '@/components/bulk/BulkEditor.vue'
import { api } from '@/services/api'
import type { BulkChange, BulkDiffRow } from '@/types/schedule'
import { useDebounce } from '@/composables/useDebounce'

const date = ref('')
const dayId = ref<number | null>(null)
const changes = ref<BulkChange[]>([])
const change = ref<BulkChange>({ entry_id: 0, field: '', new_value: '' })
const diff = ref<BulkDiffRow[]>([])
const { t } = useI18n()

async function load() {
  if (!date.value) return
  await api.entryLookup(date.value)
}

function addChange() {
  if (!change.value.entry_id || !change.value.field) return
  changes.value.push({ ...change.value })
  change.value = { entry_id: 0, field: '', new_value: '' }
}

async function dryRun() {
  if (!dayId.value) return
  const res = await api.bulkUpdateStrict(dayId.value, changes.value, true)
  diff.value = res.diff
}
async function apply() {
  if (!dayId.value) return
  const res = await api.bulkUpdateStrict(dayId.value, changes.value, false)
  diff.value = res.diff || []
}

// Auto-load lookup when date changes (debounced)
const debouncedLoad = useDebounce(() => load(), 400)
watch(() => date.value, () => debouncedLoad())
</script>
