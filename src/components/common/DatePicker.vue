<template>
  <input type="date" class="input" :value="modelValue" @input="onInput" />
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>
