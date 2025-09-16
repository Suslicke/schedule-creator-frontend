<template>
  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        :class="{
          'bg-green-100 text-green-800': variant==='green',
          'bg-yellow-100 text-yellow-800': variant==='yellow',
          'bg-gray-100 text-gray-800': variant==='gray',
          'bg-purple-100 text-purple-800': variant==='purple',
          'bg-blue-100 text-blue-800': variant==='blue',
        }"><slot /></span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'green'|'yellow'|'gray'|'purple'|'blue' }>(), { variant: 'gray' })
</script>

