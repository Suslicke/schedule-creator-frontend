<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">Загрузка расписания (Excel)</h2>
      <input type="file" accept=".xlsx,.xls" @change="onFile" />
      <div class="flex gap-2 items-center">
        <button class="btn-primary" :disabled="!file || loading" @click="upload">Загрузить</button>
        <span v-if="loading" class="text-sm text-gray-500">Загрузка…</span>
      </div>
      <div v-if="result" class="text-sm text-green-700">{{ result }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'

const file = ref<File | null>(null)
const loading = ref(false)
const result = ref('')
const toast = useToast()

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  file.value = f
}
async function upload() {
  if (!file.value) return
  loading.value = true
  try {
    const res = await api.uploadSchedule(file.value)
    result.value = 'Готово'
    toast.success('Файл загружен')
  } finally {
    loading.value = false
  }
}
</script>

