<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <template v-for="(group, idx) in groups" :key="idx">
        <div class="space-y-2">
          <div class="text-lg font-semibold text-gray-800">{{ group.time }}</div>
          <TransitionGroup name="fade-move" tag="div" class="space-y-2">
            <EntryCard v-for="(e, i) in group.items" :key="entryKey(e, i)" :entry="e" />
          </TransitionGroup>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScheduleEntry } from '@/types/schedule'
import EntryCard from './EntryCard.vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ entries?: ScheduleEntry[] }>(), { entries: () => [] })

const groups = computed(() => {
  const byTime = new Map<string, ScheduleEntry[]>()
  const src = Array.isArray(props.entries) ? props.entries : []
  const sorted = [...src]
    .filter((e): e is ScheduleEntry => !!e && typeof e.start_time === 'string' && typeof e.end_time === 'string')
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  for (const e of sorted) {
    const key = `${e.start_time ?? ''}–${e.end_time ?? ''}`
    if (!byTime.has(key)) byTime.set(key, [])
    byTime.get(key)!.push(e)
  }
  return [...byTime.entries()].map(([time, items]) => ({ time, items }))
})

function entryKey(e: ScheduleEntry, i: number) {
  return e.entry_id ?? `${e.date}-${e.start_time}-${e.end_time}-${e.group_name}-${e.subject_name}-${i}`
}
</script>

<style scoped>
.fade-move-enter-active, .fade-move-leave-active, .fade-move-move { transition: all 0.25s ease; }
.fade-move-enter-from, .fade-move-leave-to { opacity: 0; transform: translateY(4px); }
</style>
