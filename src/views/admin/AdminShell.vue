<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-2 h-6 bg-brand rounded-full"></div>
          <h1 class="text-xl font-semibold">{{ t('admin.title') }}</h1>
        </div>
        <nav class="flex items-center gap-3 text-sm">
          <!-- Hidden: day plan -->
          <!-- <RouterLink class="nav-link" :to="{ name: 'admin-day-plan' }">{{ t('admin.nav.dayPlan') }}</RouterLink> -->
          <RouterLink class="nav-link" :to="{ name: 'admin-day-creator' }">Day Creator</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-day-editor' }">{{ t('admin.nav.dayEditor') }}</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-upload' }">{{ t('admin.nav.upload') }}</RouterLink>
          <!-- Hidden: progress -->
          <!-- <RouterLink class="nav-link" :to="{ name: 'admin-progress' }">{{ t('admin.nav.progress') }}</RouterLink> -->
          <RouterLink class="nav-link" :to="{ name: 'admin-analytics' }">{{ t('admin.nav.analytics') }}</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-generation' }">Generation</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-replacements' }">Replacements</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-practice' }">Practice</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-export' }">Export</RouterLink>
          <!-- Hidden: bulk -->
          <!-- <RouterLink class="nav-link" :to="{ name: 'admin-bulk' }">{{ t('admin.nav.bulk') }}</RouterLink> -->
          <RouterLink class="nav-link" :to="{ name: 'admin-settings' }">{{ t('admin.nav.settings') }}</RouterLink>
        </nav>
      </div>
    </header>
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.nav-link { @apply px-2 py-1 rounded-md hover:bg-gray-100 transition-colors; }
</style>
