<template>
  <div class="card p-4 hover:shadow-md transition-shadow border-l-4 transition-transform duration-200 hover:-translate-y-0.5" :class="statusBorder">
    <div class="space-y-2">
      <div class="text-lg font-semibold leading-snug break-words">{{ entry.subject_name }}</div>
      <div class="flex flex-wrap gap-2 text-sm">
        <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
          <span class="text-gray-500">{{ t('common.teacher') }}:</span>
          <span class="font-medium break-words">{{ entry.teacher_name }}</span>
        </span>
        <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
          <span class="text-gray-500">{{ t('common.group') }}:</span>
          <span class="font-medium break-words">{{ entry.group_name }}</span>
        </span>
        <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
          <span class="text-gray-500">{{ t('common.room') }}:</span>
          <span class="font-medium break-words">{{ entry.room_name }}</span>
        </span>
      </div>
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-2">
          <Badge :variant="entry.origin==='day_plan' ? 'green' : 'yellow'">{{ originLabel }}</Badge>
          <Badge v-if="entry.is_override" variant="blue">{{ t('tags.override') }}</Badge>
        </div>
        <Badge :variant="statusColor">{{ statusLabel }}</Badge>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import Badge from '@/components/common/Badge.vue'
import type { ScheduleEntry } from '@/types/schedule'

const props = defineProps<{ entry: ScheduleEntry }>()
function statusKey(raw: string | null | undefined) {
  const s = (raw || 'planned').toString()
  return s
}
const statusColor = computed(() => {
  const s = statusKey(props.entry.approval_status)
  if (s === 'approved') return 'green'
  if (s === 'replaced_manual') return 'blue'
  if (s === 'replaced_auto') return 'teal'
  if (s.startsWith('replaced')) return 'blue'
  return 'gray'
})
const statusBorder = computed(() => {
  const s = statusKey(props.entry.approval_status)
  if (s === 'approved') return 'border-green-500'
  if (s === 'replaced_manual') return 'border-blue-500'
  if (s === 'replaced_auto') return 'border-teal-500'
  if (s.startsWith('replaced')) return 'border-blue-500'
  return 'border-gray-300'
})
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const statusLabel = computed(() => {
  const raw = (props.entry.approval_status || 'planned').toString()
  const key = `status.${raw}`
  const tr = t(key)
  if (tr !== key) return tr
  return raw.replace(/_/g, ' ')
})
const originLabel = computed(() => t(`origin.${props.entry.origin === 'day_plan' ? 'day_plan' : 'weekly'}`))
</script>
