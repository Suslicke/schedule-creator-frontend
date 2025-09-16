<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <div class="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <div class="md:col-span-2">
        <label class="text-xs text-gray-600">{{ t('common.teacher') }}</label>
        <SearchSelect :fetch-options="fetchTeachers" :placeholder="t('common.teacher')" v-model="teacher" @select="onTeacher" />
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

const teacher = computed({ get: () => sched.teacher_name, set: (v: string) => sched.setTeacher(v) })
const start = computed({ get: () => sched.start_date || todayYMD(), set: (v: string) => sched.setRange(v, end.value) })
const end = computed({ get: () => sched.end_date || todayYMD(), set: (v: string) => sched.setRange(start.value, v) })
const entries = computed(() => sched.entries)
const loading = computed(() => sched.loading)

async function fetchTeachers(q: string) { return dict.searchTeachers(q) }
function onTeacher() {}

function refresh() { sched.setGroup(''); sched.fetch() }
onMounted(() => { if (!sched.start_date || !sched.end_date) sched.setRange(todayYMD(), todayYMD()); refresh() })
</script>
