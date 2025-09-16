<template>
  <div class="card p-4 overflow-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left text-gray-600">
          <th class="py-2 pr-4">Entry ID</th>
          <th class="py-2 pr-4">Field</th>
          <th class="py-2 pr-4">Old</th>
          <th class="py-2 pr-4">New</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in diff" :key="i" class="border-t">
          <td class="py-2 pr-4">{{ row.entry_id }}</td>
          <td class="py-2 pr-4">{{ row.field }}</td>
          <td class="py-2 pr-4 text-gray-500">{{ row.old_value }}</td>
          <td class="py-2 pr-4 text-brand font-medium">{{ row.new_value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { BulkDiffRow } from '@/types/schedule'
defineProps<{ diff: BulkDiffRow[] }>()
</script>

