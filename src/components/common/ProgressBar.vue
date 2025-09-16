<template>
  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
    <div class="h-2 bg-brand" :style="{ width: percent + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ percent: number }>(), { percent: 0 })
</script>

