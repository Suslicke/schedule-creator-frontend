<template>
  <div class="max-w-4xl mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">Планирование дня</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-xs text-gray-600">Дата</label>
          <DatePicker v-model="form.date" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs text-gray-600">Группа (опционально)</label>
          <input v-model="form.group_name" class="input" placeholder="П24-2ЖК" />
        </div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="form.from_plan"/> <span class="text-sm">from_plan</span></div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="form.auto_vacant_remove"/> <span class="text-sm">auto_vacant_remove</span></div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="form.debug"/> <span class="text-sm">debug</span></div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="form.enforce_no_gaps"/> <span class="text-sm">enforce_no_gaps</span></div>
      </div>
      <div class="flex gap-2">
        <button class="btn-primary" :disabled="loading" @click="submit">Построить план</button>
      </div>
    </div>

    <div v-if="day" class="space-y-3">
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <div>Day ID: <b>{{ day.id }}</b></div>
          <RouterLink class="btn-secondary" :to="{ name: 'admin-day-detail', params: { dayId: day.id } }">Открыть сетку дня</RouterLink>
        </div>
      </div>
      <div class="card p-4 overflow-auto">
        <h3 class="text-sm font-semibold mb-2">Результат</h3>
        <table class="min-w-full text-sm">
          <thead><tr class="text-left text-gray-600"><th class="py-1 pr-4">Время</th><th class="py-1 pr-4">Предмет</th><th class="py-1 pr-4">Группа</th><th class="py-1 pr-4">Статус</th></tr></thead>
          <tbody>
            <tr v-for="(e, i) in day.entries" :key="i" class="border-t">
              <td class="py-1 pr-4">{{ e.start_time }}–{{ e.end_time }}</td>
              <td class="py-1 pr-4">{{ e.subject_name }}</td>
              <td class="py-1 pr-4">{{ e.group_name }}</td>
              <td class="py-1 pr-4">{{ e.status || e.approval_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { api } from '@/services/api'
import DatePicker from '@/components/common/DatePicker.vue'
import type { DayPlanRequest, DayPlanResponse } from '@/types/schedule'
import { todayYMD } from '@/utils/format'

const form = reactive<DayPlanRequest>({ date: todayYMD(), group_name: '', from_plan: true, auto_vacant_remove: true, debug: false, enforce_no_gaps: false })
const loading = ref(false)
const day = ref<DayPlanResponse | null>(null)

async function submit() {
  loading.value = true
  try {
    day.value = await api.dayPlan(form)
  } finally {
    loading.value = false
  }
}
</script>
