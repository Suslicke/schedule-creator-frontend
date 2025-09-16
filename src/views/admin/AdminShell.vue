<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-2 h-6 bg-brand rounded-full"></div>
          <h1 class="text-xl font-semibold">Admin</h1>
        </div>
        <nav class="flex items-center gap-3 text-sm">
          <RouterLink class="nav-link" :to="{ name: 'admin-day-plan' }">План дня</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-upload' }">Загрузка</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-progress' }">Прогресс</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-bulk' }">Массовые</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'admin-settings' }">Токен</RouterLink>
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
</script>

<style scoped>
.nav-link { @apply px-2 py-1 rounded-md hover:bg-gray-100 transition-colors; }
</style>

