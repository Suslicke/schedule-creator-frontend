<template>
  <div class="card p-4">
    <h3 class="text-sm font-semibold mb-2">Отчёт дня</h3>
    <div v-if="loading" class="text-sm text-gray-500">Загрузка отчёта…</div>
    <div v-else class="space-y-2">
      <div>
        <div class="text-xs font-semibold text-red-700">Блокеры</div>
        <ul class="list-disc list-inside text-sm text-red-800" v-if="report.blockers?.length">
          <li v-for="(b, i) in report.blockers" :key="i">{{ b }}</li>
        </ul>
        <div v-else class="text-xs text-gray-500">Нет</div>
      </div>
      <div>
        <div class="text-xs font-semibold text-yellow-700">Предупреждения</div>
        <ul class="list-disc list-inside text-sm text-yellow-800" v-if="report.warnings?.length">
          <li v-for="(w, i) in report.warnings" :key="i">{{ w }}</li>
        </ul>
        <div v-else class="text-xs text-gray-500">Нет</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { DayReport } from '@/types/schedule'
import { api } from '@/services/api'

const props = defineProps<{ dayId?: number }>()
const report = ref<DayReport>({ blockers: [], warnings: [] })
const loading = ref(false)

async function load() {
  if (!props.dayId) return
  loading.value = true
  try { report.value = await api.dayReport(props.dayId) } finally { loading.value = false }
}
onMounted(load)
watch(() => props.dayId, load)
</script>

