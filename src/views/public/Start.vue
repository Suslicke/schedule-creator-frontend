<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-2xl">
      <div class="card p-10 space-y-8 text-center">
        <h1 class="text-3xl font-semibold">{{ t('start.title') }}</h1>

        <!-- Step 1: language -->
        <div class="space-y-3">
          <div class="text-lg text-gray-600">{{ t('start.chooseLang') }}</div>
          <div class="flex items-center justify-center gap-3">
            <button :class="btn(lang==='ru')" @click="chooseLang('ru')">RU</button>
            <button :class="btn(lang==='kk')" @click="chooseLang('kk')">KK</button>
            <button :class="btn(lang==='en')" @click="chooseLang('en')">EN</button>
          </div>
        </div>

        <!-- Step 2: period -->
        <Transition name="fade-slide" appear>
          <div v-if="step>=2" class="space-y-3">
            <div class="text-lg text-gray-600">{{ t('start.choosePeriod') }}</div>
            <div class="flex items-center justify-center gap-3">
              <button :class="btn(mode==='day')" @click="chooseMode('day')">{{ t('start.day') }}</button>
              <button :class="btn(mode==='week')" @click="chooseMode('week')">{{ t('start.week') }}</button>
            </div>
          </div>
        </Transition>

        <!-- Step 3: target -->
        <Transition name="fade-slide" appear>
          <div v-if="step>=3" class="space-y-3">
            <div class="text-lg text-gray-600">{{ t('start.chooseTarget') }}</div>
            <div class="flex items-center justify-center gap-3">
              <button :class="btn(target==='group')" @click="chooseTarget('group')">{{ t('start.group') }}</button>
              <button :class="btn(target==='teacher')" @click="chooseTarget('teacher')">{{ t('start.teacher') }}</button>
            </div>
          </div>
        </Transition>

        <!-- Step 4: details -->
        <Transition name="fade-slide" appear>
          <div v-if="step>=4" class="space-y-4">
            <div class="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div class="w-full md:w-64">
                <DatePicker v-model="date" />
              </div>
              <div v-if="target==='group'" class="w-full md:flex-1">
                <SearchSelect :fetch-options="fetchGroups" :placeholder="t('common.group')" v-model="group" @select="onGroup" />
              </div>
              <div v-else class="w-full md:flex-1">
                <SearchSelect :fetch-options="fetchTeachers" :placeholder="t('common.teacher')" v-model="teacher" @select="onTeacher" />
              </div>
            </div>
            <div class="pt-1">
              <button class="btn-primary text-lg px-5 py-2.5" :disabled="disabled" @click="go">{{ t('common.show') }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DatePicker from '@/components/common/DatePicker.vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import { useScheduleStore } from '@/stores/schedule'
import { useDictStore } from '@/stores/dict'
import { todayYMD } from '@/utils/format'
import { i18n, setLocale } from '@/i18n'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const sched = useScheduleStore()
const dict = useDictStore()

const mode = ref<'day'|'week'>('day')
const target = ref<'group'|'teacher'>('group')
const step = ref(1)
const lang = ref(i18n.global.locale.value as 'ru'|'kk'|'en')
const { t } = useI18n()
const date = ref(todayYMD())
const group = ref('')
const teacher = ref('')

async function fetchGroups(q: string) { return dict.searchGroups(q) }
async function fetchTeachers(q: string) { return dict.searchTeachers(q) }

function setTarget(t: 'group'|'teacher') { target.value = t; if (t==='group') teacher.value=''; else group.value='' }
function chooseLang(l: 'ru'|'kk'|'en') { lang.value = l; setLocale(l); if (step.value < 2) step.value = 2 }
function chooseMode(m: 'day'|'week') { mode.value = m; if (step.value < 3) step.value = 3 }
function chooseTarget(t: 'group'|'teacher') { setTarget(t); if (step.value < 4) step.value = 4 }
function onGroup() { teacher.value = '' }
function onTeacher() { group.value = '' }

const disabled = computed(() => !date.value || (target.value==='group' ? !group.value : !teacher.value))

function go() {
  sched.setMode(mode.value)
  sched.setDate(date.value)
  if (target.value === 'group') {
    sched.setGroup(group.value.trim())
  } else {
    sched.setTeacher(teacher.value.trim())
  }
  router.push({ name: 'schedule' })
}

function btn(active: boolean) {
  return ['px-4 py-2 rounded-full text-lg transition', active ? 'bg-blue-600 text-white' : 'bg-gray-100']
}
</script>

<style scoped>
.fade-slide-enter-active { transition: all .25s ease-out }
.fade-slide-enter-from { opacity: 0; transform: translateY(-4px) }
.fade-slide-enter-to { opacity: 1; transform: translateY(0) }
</style>
