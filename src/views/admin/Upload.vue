<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ t('upload.title') }}</h2>
      <input type="file" accept=".xlsx,.xls" @change="onFile" />
      <div class="flex gap-2 items-center">
        <button class="btn-primary" :disabled="!file || loading" @click="upload">{{ t('upload.upload') }}</button>
        <span v-if="loading" class="text-sm text-gray-500">{{ t('upload.uploading') }}</span>
      </div>
      <div v-if="result" class="text-sm text-green-700">{{ t('upload.done') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const file = ref<File | null>(null)
const loading = ref(false)
const result = ref('')
const toast = useToast()

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  file.value = f
  if (file.value) upload()
}
async function upload() {
  if (!file.value) return
  loading.value = true
  try {
    const res = await api.uploadSchedule(file.value)
    result.value = 'ok'
    toast.success(t('upload.fileUploaded'))
  } finally {
    loading.value = false
  }
}
</script>
