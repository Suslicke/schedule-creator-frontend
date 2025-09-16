<template>
  <div class="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 sm:p-6">
    <transition-group name="toast" tag="div" class="w-full sm:w-auto space-y-2">
      <div v-for="t in list" :key="t.id" class="pointer-events-auto card px-4 py-3 border-l-4"
        :class="{
          'border-l-green-500': t.type==='success',
          'border-l-red-500': t.type==='error',
          'border-l-blue-500': t.type==='info',
        }">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm" v-text="t.message" />
          <button class="text-gray-400 hover:text-gray-600" @click="remove(t.id)">×</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { list, remove } = useToast()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>

