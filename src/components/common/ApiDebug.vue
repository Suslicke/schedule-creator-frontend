<template>
  <div class="text-xs text-gray-600 space-y-1">
    <div>{{ t('admin.debug.apiBase') }} <code class="px-1 py-0.5 bg-gray-100 rounded">{{ base }}</code></div>
    <div v-if="proxy">{{ t('admin.debug.devProxy') }} <code class="px-1 py-0.5 bg-gray-100 rounded">{{ proxy }}</code></div>
    <div class="text-gray-500">{{ t('admin.debug.envHint') }}</div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const base = import.meta.env.VITE_API_BASE_URL || '/api'
const proxy = import.meta.env.VITE_DEV_PROXY_TARGET || ''
</script>
