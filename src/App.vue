<template>
  <div class="min-h-screen flex flex-col bg-soft-gradient">
    <header v-if="!fullscreen" class="border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-semibold text-brand">{{ t('brand') }}</h1>
          <nav class="hidden md:flex items-center gap-3 text-sm">
            <RouterLink class="hover:text-brand" :to="{ name: 'schedule' }">{{ t('nav.day') }}</RouterLink>
            <RouterLink class="hover:text-brand" :to="{ name: 'teacher' }">{{ t('nav.teacher') }}</RouterLink>
            <RouterLink class="hover:text-brand" :to="{ name: 'group' }">{{ t('nav.group') }}</RouterLink>
          </nav>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
    <main class="flex-1">
      <RouterView />
    </main>
    <ToastContainer />
  </div>
  
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import ToastContainer from './components/common/ToastContainer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const { t } = useI18n()
const route = useRoute()
const fullscreen = computed(() => route.meta?.fullscreen === true)
</script>
