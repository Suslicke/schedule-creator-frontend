<template>
  <div class="space-y-6">
    <div v-for="(day, idx) in days" :key="idx" class="space-y-3">
      <div class="sticky top-0 z-10 bg-white/70 backdrop-blur rounded-md px-3 py-2 ring-1 ring-gray-200 text-lg font-semibold text-gray-900">
        {{ day.label }}
      </div>
      <div class="card p-4">
        <ScheduleGrid :entries="day.items" />
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import type { ScheduleEntry } from '@/types/schedule'
import ScheduleGrid from './ScheduleGrid.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ entries?: ScheduleEntry[] }>()
const { locale } = useI18n()

const days = computed(() => {
  const src = Array.isArray(props.entries) ? props.entries : []
  const byDate = new Map<string, ScheduleEntry[]>()
  for (const e of src) {
    const key = e.date
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(e)
  }
  const ordered = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  return ordered.map(([date, items]) => ({ label: `${formatDay(date, locale.value)} • ${formatDate(date, locale.value)}`, items }))
})

function formatDay(dateStr: string, loc: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return dateStr
  try {
    return new Intl.DateTimeFormat(loc || 'ru', { weekday: 'long' }).format(d)
  } catch { return itemsDayFallback(dateStr, (props.entries||[])) }
}

function itemsDayFallback(dateStr: string, entries: ScheduleEntry[]): string {
  const found = entries.find(e => e.date === dateStr)
  return found?.day || ''
}

function formatDate(dateStr: string, loc: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return dateStr
  try {
    return new Intl.DateTimeFormat(loc || 'ru', { day: '2-digit', month: '2-digit' }).format(d)
  } catch { return dateStr }
}
</script>
