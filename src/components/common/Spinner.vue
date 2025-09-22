<template>
  <div :class="wrapperClass">
    <svg :class="iconClass" viewBox="0 0 50 50">
      <circle class="text-gray-200" cx="25" cy="25" r="20" fill="none" stroke-width="6" />
      <circle class="text-blue-500" cx="25" cy="25" r="20" fill="none" stroke-width="6" stroke-linecap="round" :style="dashStyle" />
    </svg>
    <span v-if="label" class="ml-2 text-sm text-gray-600">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ size?: number; label?: string; inline?: boolean }>(), { size: 20, label: '', inline: false })
const dashStyle = computed(() => ({ strokeDasharray: '80', strokeDashoffset: '60', animation: 'spinner-dash 1.2s linear infinite' }))
const iconClass = computed(() => `animate-spin h-[${props.size}px] w-[${props.size}px]`)
const wrapperClass = computed(() => props.inline ? 'inline-flex items-center' : 'flex items-center justify-center')
</script>

<style scoped>
@keyframes spinner-dash { to { stroke-dashoffset: 0; } }
svg { color: transparent; }
circle { stroke: currentColor; }
</style>

