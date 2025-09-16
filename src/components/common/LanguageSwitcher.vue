<template>
  <div class="flex items-center gap-1">
    <button v-for="opt in langs" :key="opt"
            class="px-2 py-1 text-xs rounded-md hover:bg-gray-100"
            :class="{ 'bg-gray-200 font-semibold': current === opt }"
            @click="change(opt)">{{ opt.toUpperCase() }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { i18n, setLocale } from '@/i18n'

const langs = ['ru', 'kk', 'en'] as const
const current = computed(() => i18n.global.locale.value as 'ru' | 'kk' | 'en')
function change(l: 'ru'|'kk'|'en') { setLocale(l) }
</script>

