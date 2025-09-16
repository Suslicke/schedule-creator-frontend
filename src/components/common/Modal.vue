<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="onClose">
      <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0 translate-y-2" enter-to="opacity-100 translate-y-0" leave="ease-in duration-150" leave-from="opacity-100 translate-y-0" leave-to="opacity-0 translate-y-2">
            <DialogPanel class="card w-full max-w-lg p-4">
              <DialogTitle v-if="title" class="text-base font-semibold mb-2">{{ title }}</DialogTitle>
              <div class="text-sm"><slot /></div>
              <div class="mt-4 flex justify-end gap-2">
                <slot name="actions" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits<{ 'close': [] }>()
function onClose() { emit('close') }
</script>

