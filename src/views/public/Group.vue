<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <div class="md:col-span-2">
        <label class="text-xs text-gray-600">{{ t('common.group') }}</label>
        <SearchSelect :fetch-options="fetchGroups" :placeholder="t('common.group')" v-model="group" @select="onGroup" />
      </div>
      <div>
        <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
        <DatePicker v-model="start" />
      </div>
      <div>
        <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
        <DatePicker v-model="end" />
      </div>
      <div>
        <button class="btn-primary w-full" @click="refresh">{{ t('common.show') }}</button>
      </div>
    </div>
    <div v-if="loading" class="text-sm text-gray-500">{{ t('common.loading') }}</div>
    <ScheduleGrid v-else :entries="entries" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import DatePicker from '@/components/common/DatePicker.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import ScheduleGrid from '@/components/schedule/ScheduleGrid.vue'
import { useDictStore } from '@/stores/dict'
import { useScheduleStore } from '@/stores/schedule'
import { todayYMD } from '@/utils/format'
import { useI18n } from 'vue-i18n'

const dict = useDictStore()
const sched = useScheduleStore()
const { t } = useI18n()

const group = computed({ get: () => sched.group_name, set: (v: string) => sched.setGroup(v) })
const start = computed({ get: () => sched.start_date || todayYMD(), set: (v: string) => sched.setRange(v, end.value) })
const end = computed({ get: () => sched.end_date || todayYMD(), set: (v: string) => sched.setRange(start.value, v) })
const entries = computed(() => sched.entries)
const loading = computed(() => sched.loading)

async function fetchGroups(q: string) { return dict.searchGroups(q) }
function onGroup() {}

function refresh() { sched.setTeacher(''); sched.fetch() }
onMounted(() => { if (!sched.start_date || !sched.end_date) sched.setRange(todayYMD(), todayYMD()); refresh() })
</script>
