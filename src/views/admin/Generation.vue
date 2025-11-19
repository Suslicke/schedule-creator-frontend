<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Generate Semester Schedule</h1>

    <div class="card p-6 max-w-2xl">
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Semester Name</label>
          <input v-model="form.semester" type="text" class="input-text mt-1" placeholder="e.g. Fall 2025" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input v-model="form.start_date" type="date" class="input-text mt-1" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input v-model="form.end_date" type="date" class="input-text mt-1" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Min Pairs/Day</label>
            <input v-model.number="form.min_pairs_per_day" type="number" class="input-text mt-1" min="1" max="8" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Max Pairs/Day</label>
            <input v-model.number="form.max_pairs_per_day" type="number" class="input-text mt-1" min="1" max="8" />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input v-model="form.async_mode" type="checkbox" id="async" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <label for="async" class="text-sm text-gray-700">Run in background (Async)</label>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="loading">Starting...</span>
          <span v-else>Start Generation</span>
        </button>
      </form>
    </div>

    <div v-if="jobId" class="card p-6 max-w-2xl">
      <h2 class="text-lg font-semibold mb-2">Generation Status</h2>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">Job ID:</span>
          <span class="font-mono text-sm">{{ jobId }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Status:</span>
          <span :class="statusColor">{{ status }}</span>
        </div>
        <div v-if="stats" class="mt-4 p-4 bg-gray-50 rounded">
          <h3 class="font-medium text-sm text-gray-700 mb-2">Statistics</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>Total Pairs: {{ stats.total_pairs }}</div>
            <div>Warnings: {{ stats.warnings_count }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { api } from '@/services/api'

const loading = ref(false)
const jobId = ref('')
const status = ref('')
const stats = ref<any>(null)
let pollInterval: any = null

const form = ref({
  semester: '',
  start_date: '',
  end_date: '',
  min_pairs_per_day: 3,
  max_pairs_per_day: 4,
  async_mode: true,
  holidays: []
})

const statusColor = computed(() => {
  switch (status.value) {
    case 'completed': return 'text-green-600 font-bold'
    case 'failed': return 'text-red-600 font-bold'
    case 'in_progress': return 'text-blue-600 font-bold'
    default: return 'text-gray-600'
  }
})

async function submit() {
  loading.value = true
  try {
    const res = await api.generateSemester(form.value)
    if (res.job_id) {
      jobId.value = res.job_id
      status.value = res.status
      startPolling()
    } else {
      alert('Generation started (sync mode)')
    }
  } catch (e) {
    console.error(e)
    alert('Failed to start generation')
  } finally {
    loading.value = false
  }
}

function startPolling() {
  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(async () => {
    try {
      const res = await api.getGenerationStatus(jobId.value)
      status.value = res.status
      stats.value = res.total_statistics
      if (['completed', 'failed'].includes(res.status)) {
        clearInterval(pollInterval)
      }
    } catch (e) {
      console.error('Polling failed', e)
    }
  }, 2000)
}

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
