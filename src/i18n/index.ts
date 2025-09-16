import { createI18n } from 'vue-i18n'

const STORAGE_KEY = 'locale'

const messages = {
  ru: {
    brand: 'Расписание',
    nav: { day: 'На день', teacher: 'Преподаватель', group: 'Группа' },
    common: {
      date: 'Дата',
      teacher: 'Преподаватель',
      group: 'Группа',
      show: 'Показать',
      loading: 'Загрузка…',
      room: 'Аудитория',
      backToStart: 'К выбору',
      noData: 'Нет данных',
      fallbackWeekly: 'Внимание: используется недельное расписание (fallback)'
    },
    start: {
      title: 'Расписание',
      chooseLang: 'Выберите язык',
      choosePeriod: 'Сначала выберите период',
      chooseTarget: 'Теперь выберите, кого искать',
      day: 'На день',
      week: 'Недельное',
      group: 'Группа',
      teacher: 'Преподаватель',
      show: 'Показать'
    },
    home: {
      dailyTitle: 'Расписание на день',
      weeklyTitle: 'Недельное расписание',
      period: 'Период'
    },
    status: {
      planned: 'запланировано',
      pending: 'в ожидании',
      approved: 'утверждено',
      replaced: 'заменено',
      replaced_auto: 'заменено автоматически',
      replaced_manual: 'заменено вручную'
    },
    origin: {
      day_plan: 'из плана',
      weekly: 'недельное'
    },
    tags: {
      override: 'ручная правка'
    }
  },
  kk: {
    brand: 'Кесте',
    nav: { day: 'Күнге', teacher: 'Оқытушы', group: 'Топ' },
    common: {
      date: 'Күні',
      teacher: 'Оқытушы',
      group: 'Топ',
      show: 'Көрсету',
      loading: 'Жүктелуде…',
      room: 'Аудитория',
      backToStart: 'Таңдауға оралу',
      noData: 'Деректер жоқ',
      fallbackWeekly: 'Назар аударыңыз: апталық кесте (fallback)'
    },
    start: {
      title: 'Кесте',
      chooseLang: 'Тілді таңдаңыз',
      choosePeriod: 'Алдымен кезеңді таңдаңыз',
      chooseTarget: 'Енді кімді іздеу керек екенін таңдаңыз',
      day: 'Күнге',
      week: 'Апталық',
      group: 'Топ',
      teacher: 'Оқытушы',
      show: 'Көрсету'
    },
    home: {
      dailyTitle: 'Күндік кесте',
      weeklyTitle: 'Апталық кесте',
      period: 'Кезең'
    },
    status: {
      planned: 'жоспарланған',
      pending: 'күтілуде',
      approved: 'бекітілген',
      replaced: 'ауыстырылған',
      replaced_auto: 'автоматты алмастырылған',
      replaced_manual: 'қолмен алмастырылған'
    },
    origin: {
      day_plan: 'жоспардан',
      weekly: 'апталық'
    },
    tags: {
      override: 'қолмен түзету'
    }
  },
  en: {
    brand: 'Schedule',
    nav: { day: 'Daily', teacher: 'Teacher', group: 'Group' },
    common: {
      date: 'Date',
      teacher: 'Teacher',
      group: 'Group',
      show: 'Show',
      loading: 'Loading…',
      room: 'Room',
      backToStart: 'Back to selection',
      noData: 'No data',
      fallbackWeekly: 'Warning: weekly timetable fallback'
    },
    start: {
      title: 'Schedule',
      chooseLang: 'Choose language',
      choosePeriod: 'First, pick the period',
      chooseTarget: 'Then, choose who to search',
      day: 'Daily',
      week: 'Weekly',
      group: 'Group',
      teacher: 'Teacher',
      show: 'Show'
    },
    home: {
      dailyTitle: 'Daily schedule',
      weeklyTitle: 'Weekly schedule',
      period: 'Period'
    },
    status: {
      planned: 'planned',
      pending: 'pending',
      approved: 'approved',
      replaced: 'replaced',
      replaced_auto: 'replaced (auto)',
      replaced_manual: 'replaced (manual)'
    },
    origin: {
      day_plan: 'from plan',
      weekly: 'weekly'
    },
    tags: {
      override: 'manual override'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) || 'ru') : 'ru',
  fallbackLocale: 'ru',
  messages,
})

export function setLocale(locale: 'ru' | 'kk' | 'en') {
  i18n.global.locale.value = locale
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, locale)
}
