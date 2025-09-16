<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
      <button class="btn-secondary" @click="goStart">← {{ t('common.backToStart') }}</button>
      <div class="text-lg font-semibold">{{ mode==='week' ? t('home.weeklyTitle') : t('home.dailyTitle') }}</div>
      <div class="w-28" />
    </div>
    <div class="card p-6">
      <div class="flex flex-col items-center gap-4">
        <h1 class="text-xl font-semibold">{{ t('start.title') }}</h1>
        <div class="flex gap-2">
          <button :class="['px-3 py-1 rounded-full transition', mode==='day' ? 'bg-blue-600 text-white' : 'bg-gray-100']" @click="setMode('day')">{{ t('start.day') }}</button>
          <button :class="['px-3 py-1 rounded-full transition', mode==='week' ? 'bg-blue-600 text-white' : 'bg-gray-100']" @click="setMode('week')">{{ t('start.week') }}</button>
        </div>
        <div class="flex gap-2">
          <button :class="['px-3 py-1 rounded-full transition', target==='group' ? 'bg-blue-600 text-white' : 'bg-gray-100']" @click="setTarget('group')">{{ t('start.group') }}</button>
          <button :class="['px-3 py-1 rounded-full transition', target==='teacher' ? 'bg-blue-600 text-white' : 'bg-gray-100']" @click="setTarget('teacher')">{{ t('start.teacher') }}</button>
        </div>
        <div class="w-full flex flex-col md:flex-row gap-3 items-center">
          <div class="w-full md:w-56">
            <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
            <DatePicker v-model="date" />
          </div>
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0 -translate-y-1">
            <div v-if="target==='teacher'" class="w-full md:flex-1">
              <label class="text-xs text-gray-600">{{ t('common.teacher') }}</label>
              <SearchSelect :fetch-options="fetchTeachers" :placeholder="t('common.teacher')" v-model="teacher" @select="onTeacher" />
            </div>
          </Transition>
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0 -translate-y-1">
            <div v-if="target==='group'" class="w-full md:flex-1">
              <label class="text-xs text-gray-600">{{ t('common.group') }}</label>
              <SearchSelect :fetch-options="fetchGroups" :placeholder="t('common.group')" v-model="group" @select="onGroup" />
            </div>
          </Transition>
          <button class="btn-primary mt-2 md:mt-6" @click="refresh">{{ t('common.show') }}</button>
        </div>
      </div>
    </div>

    <div v-if="mode==='week'" class="text-sm text-gray-600">{{ t('home.period') }}: <span class="font-medium">{{ period.start }}</span> — <span class="font-medium">{{ period.end }}</span></div>

    <WarningBanner v-if="showWeeklyWarning" />

    <div v-if="loading" class="text-base text-gray-500">{{ t('common.loading') }}</div>
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-[0.99]" enter-to-class="opacity-100 scale-100">
      <div v-if="!loading">
        <ScheduleWeekGrid v-if="mode==='week'" :entries="entries" />
        <ScheduleGrid v-else :entries="entries" />
        <div v-if="!entries.length" class="text-center text-base text-gray-500 py-8">{{ t('common.noData') }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DatePicker from '@/components/common/DatePicker.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import ScheduleGrid from '@/components/schedule/ScheduleGrid.vue'
import ScheduleWeekGrid from '@/components/schedule/ScheduleWeekGrid.vue'
import WarningBanner from '@/components/common/WarningBanner.vue'
import { useDictStore } from '@/stores/dict'
import { useScheduleStore } from '@/stores/schedule'
import { todayYMD, weekRange } from '@/utils/format'
import { useI18n } from 'vue-i18n'

const dict = useDictStore()
const router = useRouter()
const sched = useScheduleStore()
const { t } = useI18n()

const date = computed({ get: () => sched.date || todayYMD(), set: (v: string) => sched.setDate(v) })
const teacher = computed({ get: () => sched.teacher_name, set: (v: string) => sched.setTeacher(v) })
const group = computed({ get: () => sched.group_name, set: (v: string) => sched.setGroup(v) })
const entries = computed(() => sched.entries)
const loading = computed(() => sched.loading)
const mode = computed(() => sched.mode)
const target = ref<'group' | 'teacher'>('group')

const hasWeeklyAny = computed(() => entries.value.some(e => e.origin === 'weekly'))
const hasDayPlanAny = computed(() => entries.value.some(e => e.origin === 'day_plan'))
const showWeeklyWarning = computed(() => mode.value === 'day' && hasWeeklyAny.value && !hasDayPlanAny.value)
const period = computed(() => {
  if (mode.value !== 'week') return { start: '', end: '' }
  const base = date.value
  const { start, end } = weekRange(base)
  return { start, end }
})

async function fetchTeachers(q: string) { return dict.searchTeachers(q) }
async function fetchGroups(q: string) { return dict.searchGroups(q) }

function onTeacher() { if (teacher.value) group.value = '' }
function onGroup() { if (group.value) teacher.value = '' }

function refresh() { sched.fetch() }
onMounted(() => { if (!sched.date) sched.setDate(todayYMD()); refresh() })
// Избегаем авто-рефреша при наборе текста; используем кнопку "Показать".

function goStart() { sched.reset(); router.push({ name: 'start' }) }

function setMode(m: 'day' | 'week') { sched.setMode(m) }
function setTarget(t: 'group' | 'teacher') { target.value = t; if (t==='group') teacher.value=''; else group.value='' }
</script>
