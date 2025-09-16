<template>
  <div class="text-xs text-gray-600 space-y-1">
    <div>API base: <code class="px-1 py-0.5 bg-gray-100 rounded">{{ base }}</code></div>
    <div v-if="proxy">Dev proxy: <code class="px-1 py-0.5 bg-gray-100 rounded">{{ proxy }}</code></div>
    <div class="text-gray-500">Проверьте .env: VITE_API_BASE_URL и VITE_DEV_PROXY_TARGET</div>
  </div>
</template>

<script setup lang="ts">
const base = import.meta.env.VITE_API_BASE_URL || '/api'
const proxy = import.meta.env.VITE_DEV_PROXY_TARGET || ''
</script>

