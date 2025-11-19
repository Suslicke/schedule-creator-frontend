<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Practice Management</h1>

    <div class="card p-6 max-w-2xl">
      <h2 class="text-lg font-semibold mb-4">Add Practice Period</h2>
      <form @submit.prevent="create" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Practice Name</label>
          <input v-model="form.name" type="text" class="input-text mt-1" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input v-model="form.start_date" type="date" class="input-text mt-1" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input v-model="form.end_date" type="date" class="input-text mt-1" required />
          </div>
        </div>
        <button type="submit" class="btn-primary w-full">Add Practice</button>
      </form>
    </div>

    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-4">Existing Practices</h2>
      <div v-if="loading" class="text-gray-500">Loading...</div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.start_date }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.end_date }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button @click="remove(item.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">No practice periods found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const loading = ref(false)
const items = ref<any[]>([])
const form = ref({
  name: '',
  start_date: '',
  end_date: ''
})

async function fetch() {
  loading.value = true
  try {
    items.value = await api.getPractice()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function create() {
  try {
    await api.createPractice(form.value)
    form.value = { name: '', start_date: '', end_date: '' }
    fetch()
  } catch (e) {
    alert('Failed to create practice')
  }
}

async function remove(id: number) {
  if (!confirm('Delete this practice period?')) return
  try {
    await api.deletePractice(id)
    fetch()
  } catch (e) {
    alert('Failed to delete practice')
  }
}

onMounted(fetch)
</script>
