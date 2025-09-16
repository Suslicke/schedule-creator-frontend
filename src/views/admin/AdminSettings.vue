<template>
  <div class="max-w-lg mx-auto p-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">Admin Settings</h2>
      <ApiDebug />
      <label class="text-xs text-gray-600">Admin Token</label>
      <input type="text" v-model="token" class="input" placeholder="Введите X-Admin-Token" />
      <div class="flex gap-2">
        <button class="btn-primary" @click="save">Сохранить</button>
        <button class="btn-secondary" @click="clear">Очистить</button>
      </div>
      <p class="text-xs text-gray-500">Хранится в sessionStorage и будет отправляться как X-Admin-Token для /admin и защищённых POST.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useRoute, useRouter } from 'vue-router'
import ApiDebug from '@/components/common/ApiDebug.vue'

const auth = useAuthStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const token = ref(auth.adminToken)

function save() {
  auth.setToken(token.value || '')
  toast.success('Токен сохранён')
  const next = route.query.next as string | undefined
  if (next) router.replace(next)
}
function clear() {
  auth.clearToken(); token.value = ''
}
</script>
