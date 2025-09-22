<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 overflow-auto">
      <h3 class="text-sm font-semibold mb-2">{{ t('progress.summaryTitle') }}</h3>
      <table class="min-w-full text-sm">
        <thead><tr class="text-left text-gray-600"><th class="py-1 pr-4">{{ t('progress.key') }}</th><th class="py-1 pr-4">{{ t('progress.total') }}</th><th class="py-1 pr-4">{{ t('status.approved') }}</th><th class="py-1 pr-4">{{ t('status.pending') }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, i) in summary" :key="i" class="border-t">
            <td class="py-1 pr-4">{{ row.key }}</td>
            <td class="py-1 pr-4">{{ row.total_hours }}</td>
            <td class="py-1 pr-4">{{ row.approved_hours }}</td>
            <td class="py-1 pr-4">{{ row.pending_hours }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card p-4">
      <h3 class="text-sm font-semibold mb-3">{{ t('progress.timeseriesTitle') }}</h3>
      <div class="w-full overflow-x-auto">
        <svg v-if="points.length" :width="Math.max(600, points.length * 40)" height="200">
          <polyline :points="polyPoints" fill="none" stroke="#2563eb" stroke-width="2" />
        </svg>
        <div v-else class="text-sm text-gray-500">{{ t('common.noData') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'
import type { ProgressSummary, TimeseriesPoint } from '@/types/schedule'

const summary = ref<ProgressSummary[]>([])
const points = ref<TimeseriesPoint[]>([])
const { t } = useI18n()

onMounted(async () => {
  summary.value = await api.progressSummary()
  points.value = await api.progressTimeseries({})
})

const maxY = computed(() => Math.max(1, ...points.value.map(p => p.hours)))
const polyPoints = computed(() => points.value.map((p, i) => {
  const x = 30 + i * 40
  const y = 180 - (p.hours / maxY.value) * 160
  return `${x},${y}`
}).join(' '))
</script>
