<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 flex flex-wrap items-end gap-3">
      <div>
        <label class="text-xs text-gray-600">Day ID</label>
        <input v-model.number="dayId" class="input w-40" placeholder="123" />
      </div>
      <div>
        <label class="text-xs text-gray-600">Дата</label>
        <DatePicker v-model="date" />
      </div>
      <button class="btn-secondary" :disabled="!date" @click="load">Загрузить записи</button>
    </div>

    <div class="card p-4 space-y-3">
      <h3 class="text-sm font-semibold">Правки списком</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input v-model.number="change.entry_id" class="input" placeholder="entry_id" />
        <input v-model="change.field" class="input" placeholder="field (e.g. room_name)" />
        <input v-model="change.new_value" class="input" placeholder="new value" />
        <button class="btn-secondary" @click="addChange">Добавить</button>
      </div>
      <div v-if="changes.length" class="text-xs text-gray-700">{{ changes.length }} изменений</div>
      <div class="flex gap-2">
        <button class="btn-primary" :disabled="!changes.length || !dayId" @click="dryRun">Dry-run</button>
        <button class="btn-danger" :disabled="!changes.length || !dayId" @click="apply">Применить</button>
      </div>
    </div>

    <div v-if="diff.length">
      <h3 class="text-sm font-semibold">Diff</h3>
      <BulkEditor :diff="diff" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/common/DatePicker.vue'
import BulkEditor from '@/components/bulk/BulkEditor.vue'
import { api } from '@/services/api'
import type { BulkChange, BulkDiffRow } from '@/types/schedule'

const date = ref('')
const dayId = ref<number | null>(null)
const changes = ref<BulkChange[]>([])
const change = ref<BulkChange>({ entry_id: 0, field: '', new_value: '' })
const diff = ref<BulkDiffRow[]>([])

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
</script>
