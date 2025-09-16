<template>
  <Modal :open="open" :title="title" @close="cancel">
    <p class="text-sm text-gray-700">{{ message }}</p>
    <template #actions>
      <button class="btn-secondary" @click="cancel">Отмена</button>
      <button class="btn-danger" @click="confirm">Подтвердить</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue'

const props = defineProps<{ open: boolean; title?: string; message: string }>()
const emit = defineEmits<{ 'update:open': [boolean], 'confirm': [], 'cancel': [] }>()
function cancel() { emit('update:open', false); emit('cancel') }
function confirm() { emit('update:open', false); emit('confirm') }
</script>

