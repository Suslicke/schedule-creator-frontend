<template>
  <div class="max-w-lg mx-auto p-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ t('admin.settings.title') }}</h2>
      <ApiDebug />
      <label class="text-xs text-gray-600">{{ t('admin.settings.token') }}</label>
      <input type="text" v-model="token" class="input" :placeholder="t('admin.settings.tokenPlaceholder')" />
      <div class="flex gap-2">
        <button class="btn-primary" @click="save">{{ t('admin.settings.save') }}</button>
        <button class="btn-secondary" @click="clear">{{ t('admin.settings.clear') }}</button>
      </div>
      <p class="text-xs text-gray-500">{{ t('admin.settings.note') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useRoute, useRouter } from 'vue-router'
import ApiDebug from '@/components/common/ApiDebug.vue'

const auth = useAuthStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const token = ref(auth.adminToken)
const { t } = useI18n()

function save() {
  auth.setToken(token.value || '')
  toast.success(t('admin.settings.saved'))
  const next = route.query.next as string | undefined
  if (next) router.replace(next)
}
function clear() {
  auth.clearToken(); token.value = ''
}
</script>
