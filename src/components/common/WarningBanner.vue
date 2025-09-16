<template>
  <div class="border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-md">
    <slot>{{ t('common.fallbackWeekly') }}</slot>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
