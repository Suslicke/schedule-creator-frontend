import { createI18n } from 'vue-i18n'

const STORAGE_KEY = 'locale'

const messages = {
  ru: {
    brand: 'Расписание',
    nav: { day: 'На день', teacher: 'Преподаватель', group: 'Группа' },
    common: {
      date: 'Дата',
      teacher: 'Преподаватель',
      subject: 'Предмет',
      group: 'Группа',
      show: 'Показать',
      loading: 'Загрузка…',
      room: 'Аудитория',
      backToStart: 'К выбору',
      noData: 'Нет данных',
      fallbackWeekly: 'Внимание: используется недельное расписание (fallback)'
    },
    admin: {
      title: 'Админ',
      nav: {
        dayPlan: 'План дня',
        dayEditor: 'Редактор дня',
        upload: 'Загрузка',
        progress: 'Прогресс',
        analytics: 'Аналитика',
        bulk: 'Массовые',
        settings: 'Токен'
      },
      debug: {
        apiBase: 'API base:',
        devProxy: 'Dev proxy:',
        envHint: 'Проверьте .env: VITE_API_BASE_URL и VITE_DEV_PROXY_TARGET'
      },
      settings: {
        title: 'Настройки администратора',
        token: 'Admin Token',
        tokenPlaceholder: 'Введите X-Admin-Token',
        save: 'Сохранить',
        clear: 'Очистить',
        note: 'Хранится в sessionStorage и будет отправляться как X-Admin-Token для /admin и защищённых POST.',
        saved: 'Токен сохранён'
      }
    },
    dayPlan: {
      title: 'Планирование дня',
      build: 'Построить план',
      openGrid: 'Открыть сетку дня',
      result: 'Результат',
      time: 'Время',
      status: 'Статус'
    },
    dayDetail: {
      refreshReport: 'Обновить отчёт',
      lookupDate: 'Дата для загрузки записей',
      load: 'Загрузить',
      loadingEntries: 'Загрузка записей…',
      manualEdit: 'Ручная правка',
      apply: 'Применить'
    },
    bulk: {
      title: 'Правки списком',
      dayId: 'Day ID',
      loadEntries: 'Загрузить записи',
      entryId: 'entry_id',
      field: 'поле (например room_name)',
      newValue: 'новое значение',
      add: 'Добавить',
      changes: 'изменений',
      dryRun: 'Dry-run',
      apply: 'Применить',
      diff: 'Diff'
    },
    upload: {
      title: 'Загрузка расписания (Excel)',
      upload: 'Загрузить',
      uploading: 'Загрузка…',
      done: 'Готово',
      fileUploaded: 'Файл загружен'
    },
    report: {
      title: 'Отчёт дня',
      blockers: 'Блокеры',
      warnings: 'Предупреждения',
      none: 'Нет'
    },
    analytics: {
      title: 'Аналитика',
      onlyApproved: 'Только утверждённые',
      refresh: 'Обновить',
      clear: 'Сбросить фильтры',
      totalPlanAH: 'План, часов AH (итого)',
      load: 'Загрузка',
      dimension: 'Измерение',
      namePlaceholder: 'Имя (например, Иванов И.И.)',
      slot: 'Слот',
      tabs: { teachers: 'Преподаватели', groups: 'Группы', rooms: 'Аудитории', heatmap: 'Heatmap', timeseries: 'Timeseries', distribution: 'Распределение' }
    },
    editor: {
      title: 'Редактор дня',
      optional: 'опционально',
      groupPlaceholder: 'Напр. Т25-1',
      build: 'Сформировать день',
      refresh: 'Обновить',
      approve: 'Утвердить',
      export: 'Экспорт Excel',
      autoVacant: 'Автозамена вакансий',
      fromPlan: 'из недельного плана',
      noGaps: 'без окон',
      allowRepeats: 'повтор предметов',
      maxRepeats: 'макс. повторов',
      pairsPerDay: 'пар/день',
      bothShifts: 'две смены',
      showOnlyDiffs: 'Только с отличиями',
      autoBuild: 'Автосборка',
      showBars: 'Показывать бары',
      differences: 'Отличия',
      noDiffs: 'Без отличий',
      added: 'Добавлено',
      removed: 'Удалено',
      changed: 'Изменено',
      same: 'Без изменений',
      addedShort: 'добавлено',
      removedShort: 'удалено',
      diff: { added: 'добавлено', removed: 'удалено', changed: 'изменено', same: 'без изменений' },
      actual: 'Фактическое',
      plan: 'План',
      noPlan: 'Нет эталона',
      totals: 'Итоги',
      pairs: 'Пары',
      reasons: 'Причины',
      groupsSummary: 'Сводка по группам',
      subjectsSummary: 'Сводка по предметам',
      replace: 'Заменить',
      replaceTitle: 'Замена',
      teachersTab: 'Преподаватели',
      roomsTab: 'Аудитории',
      search: 'Поиск',
      noTeachers: 'Нет рекомендаций',
      noRooms: 'Нет свободных',
      close: 'Закрыть',
      freeRoomTitle: 'Освобождение аудитории',
      roomIsFree: 'Аудитория свободна — будет применена напрямую.',
      conflicts: 'Конфликтов',
      autoResolve: 'Авторазрешение',
      possible: 'возможно',
      no: 'нет',
      alternatives: 'Альтернативы',
      preview: 'Предпросмотр',
      previewList: 'Предпросмотр изменений:',
      auto: 'Автозамена'
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
      date: 'Күн',
      teacher: 'Оқытушы',
      subject: 'Пән',
      group: 'Топ',
      show: 'Көрсету',
      loading: 'Жүктелуде…',
      room: 'Аудитория',
      backToStart: 'Таңдауға оралу',
      noData: 'Деректер жоқ',
      fallbackWeekly: 'Ескерту: апталық кесте (уақытша)'
    },
    admin: {
      title: 'Әкімші',
      nav: {
        dayPlan: 'Күн жоспары',
        dayEditor: 'Күн редакторы',
        upload: 'Жүктеу',
        progress: 'Ілгерілеу',
        analytics: 'Аналитика',
        bulk: 'Жаппай',
        settings: 'Токен'
      },
      debug: {
        apiBase: 'API base:',
        devProxy: 'Dev proxy:',
        envHint: '.env файлын тексеріңіз: VITE_API_BASE_URL және VITE_DEV_PROXY_TARGET'
      },
      settings: {
        title: 'Әкімші параметрлері',
        token: 'Admin Token',
        tokenPlaceholder: 'X-Admin-Token енгізіңіз',
        save: 'Сақтау',
        clear: 'Тазалау',
        note: 'sessionStorage ішінде сақталады және /admin және қорғалған POST үшін X-Admin-Token ретінде жіберіледі.',
        saved: 'Токен сақталды'
      }
    },
    dayPlan: {
      title: 'Күнді жоспарлау',
      build: 'Жоспар құру',
      openGrid: 'Күн торын ашу',
      result: 'Нәтиже',
      time: 'Уақыт',
      status: 'Күйі'
    },
    dayDetail: {
      refreshReport: 'Есепті жаңарту',
      lookupDate: 'Жазбаларды жүктеу күні',
      load: 'Жүктеу',
      loadingEntries: 'Жазбалар жүктелуде…',
      manualEdit: 'Қолмен түзету',
      apply: 'Қолдану'
    },
    bulk: {
      title: 'Тізіммен түзетулер',
      dayId: 'Day ID',
      loadEntries: 'Жазбаларды жүктеу',
      entryId: 'entry_id',
      field: 'өріс (мысалы room_name)',
      newValue: 'жаңа мән',
      add: 'Қосу',
      changes: 'өзгеріс',
      dryRun: 'Dry-run',
      apply: 'Қолдану',
      diff: 'Айырмашылық'
    },
    upload: {
      title: 'Кестені жүктеу (Excel)',
      upload: 'Жүктеу',
      uploading: 'Жүктелуде…',
      done: 'Дайын',
      fileUploaded: 'Файл жүктелді'
    },
    report: {
      title: 'Күн есебі',
      blockers: 'Блоктаушылар',
      warnings: 'Ескертулер',
      none: 'Жоқ'
    },
    analytics: {
      title: 'Аналитика',
      onlyApproved: 'Тек бекітілген',
      refresh: 'Жаңарту',
      clear: 'Фильтрлерді тазалау',
      totalPlanAH: 'Жоспар, AH сағ (барлығы)',
      load: 'Жүктеме',
      dimension: 'Өлшем',
      namePlaceholder: 'Атауы (мысалы, Иванов И.И.)',
      slot: 'Слот',
      tabs: { teachers: 'Оқытушылар', groups: 'Топтар', rooms: 'Аудиториялар', heatmap: 'Heatmap', timeseries: 'Timeseries', distribution: 'Бөлу' }
    },
    editor: {
      title: 'Күн редакторы',
      optional: 'міндетті емес',
      groupPlaceholder: 'Мысалы, Т25-1',
      build: 'Күнді қалыптастыру',
      refresh: 'Жаңарту',
      approve: 'Бекіту',
      export: 'Excel экспорт',
      autoVacant: 'Бос орындарды авто алмастыру',
      fromPlan: 'апталық жоспардан',
      noGaps: 'аралықсыз',
      allowRepeats: 'пәнді қайталауға рұқсат',
      maxRepeats: 'макс. қайталау',
      pairsPerDay: 'жұп/күн',
      bothShifts: 'екі ауысым',
      showOnlyDiffs: 'Тек айырмашылықтары бар',
      autoBuild: 'Автожинақ',
      showBars: 'Бағандарды көрсету',
      differences: 'Айырмашылықтар',
      noDiffs: 'Айырмашылық жоқ',
      added: 'Қосылды',
      removed: 'Өшірілді',
      changed: 'Өзгертілді',
      same: 'Өзгеріссіз',
      addedShort: 'қосылды',
      removedShort: 'өшірілді',
      diff: { added: 'қосылды', removed: 'өшірілді', changed: 'өзгертілді', same: 'өзгеріссіз' },
      actual: 'Нақты',
      plan: 'Жоспар',
      noPlan: 'Эталон жоқ',
      totals: 'Қорытынды',
      pairs: 'Жұптар',
      reasons: 'Себептер',
      groupsSummary: 'Топтар бойынша қорытынды',
      subjectsSummary: 'Пәндер бойынша қорытынды',
      replace: 'Ауыстыру',
      replaceTitle: 'Ауыстыру',
      teachersTab: 'Оқытушылар',
      roomsTab: 'Аудиториялар',
      search: 'Іздеу',
      noTeachers: 'Ұсынымдар жоқ',
      noRooms: 'Бос аудитория жоқ',
      close: 'Жабу',
      freeRoomTitle: 'Аудиторияны босату',
      roomIsFree: 'Аудитория бос — бірден қолданылады.',
      conflicts: 'Қақтығыстар',
      autoResolve: 'Автошешім',
      possible: 'мүмкін',
      no: 'жоқ',
      alternatives: 'Альтернативалар',
      preview: 'Алдын ала қарау',
      previewList: 'Өзгерістерді алдын ала қарау:',
      auto: 'Автоауыстыру'
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
      subject: 'Subject',
      group: 'Group',
      show: 'Show',
      loading: 'Loading…',
      room: 'Room',
      backToStart: 'Back to selection',
      noData: 'No data',
      fallbackWeekly: 'Warning: weekly timetable fallback'
    },
    admin: {
      title: 'Admin',
      nav: {
        dayPlan: 'Day Plan',
        dayEditor: 'Day Editor',
        upload: 'Upload',
        progress: 'Progress',
        analytics: 'Analytics',
        bulk: 'Bulk',
        settings: 'Token'
      },
      debug: {
        apiBase: 'API base:',
        devProxy: 'Dev proxy:',
        envHint: 'Check .env: VITE_API_BASE_URL and VITE_DEV_PROXY_TARGET'
      },
      settings: {
        title: 'Admin settings',
        token: 'Admin Token',
        tokenPlaceholder: 'Enter X-Admin-Token',
        save: 'Save',
        clear: 'Clear',
        note: 'Stored in sessionStorage and sent as X-Admin-Token for /admin and protected POST.',
        saved: 'Token saved'
      }
    },
    dayPlan: {
      title: 'Day planning',
      build: 'Build plan',
      openGrid: 'Open day grid',
      result: 'Result',
      time: 'Time',
      status: 'Status'
    },
    dayDetail: {
      refreshReport: 'Refresh report',
      lookupDate: 'Date to load entries',
      load: 'Load',
      loadingEntries: 'Loading entries…',
      manualEdit: 'Manual edit',
      apply: 'Apply'
    },
    bulk: {
      title: 'Edits in bulk',
      dayId: 'Day ID',
      loadEntries: 'Load entries',
      entryId: 'entry_id',
      field: 'field (e.g. room_name)',
      newValue: 'new value',
      add: 'Add',
      changes: 'changes',
      dryRun: 'Dry-run',
      apply: 'Apply',
      diff: 'Diff'
    },
    upload: {
      title: 'Upload schedule (Excel)',
      upload: 'Upload',
      uploading: 'Uploading…',
      done: 'Done',
      fileUploaded: 'File uploaded'
    },
    report: {
      title: 'Day report',
      blockers: 'Blockers',
      warnings: 'Warnings',
      none: 'None'
    },
    analytics: {
      title: 'Analytics',
      onlyApproved: 'Only approved',
      refresh: 'Refresh',
      clear: 'Clear filters',
      totalPlanAH: 'Plan, hours AH (total)',
      load: 'Load',
      dimension: 'Dimension',
      namePlaceholder: 'Name (e.g., John Doe)',
      slot: 'Slot',
      tabs: { teachers: 'Teachers', groups: 'Groups', rooms: 'Rooms', heatmap: 'Heatmap', timeseries: 'Timeseries', distribution: 'Distribution' }
    },
    editor: {
      title: 'Day Editor',
      optional: 'optional',
      groupPlaceholder: 'e.g., T25-1',
      build: 'Build day',
      refresh: 'Refresh',
      approve: 'Approve',
      export: 'Export Excel',
      autoVacant: 'Auto replace vacancies',
      fromPlan: 'from weekly plan',
      noGaps: 'no gaps',
      allowRepeats: 'allow repeats',
      maxRepeats: 'max repeats',
      pairsPerDay: 'pairs/day',
      bothShifts: 'both shifts',
      showOnlyDiffs: 'Show only differences',
      autoBuild: 'Auto build',
      showBars: 'Show bars',
      differences: 'Differences',
      noDiffs: 'No differences',
      added: 'Added',
      removed: 'Removed',
      changed: 'Changed',
      same: 'Unchanged',
      addedShort: 'added',
      removedShort: 'removed',
      diff: { added: 'added', removed: 'removed', changed: 'changed', same: 'same' },
      actual: 'Actual',
      plan: 'Plan',
      noPlan: 'No plan baseline',
      totals: 'Totals',
      pairs: 'Pairs',
      reasons: 'Reasons',
      groupsSummary: 'Group summary',
      subjectsSummary: 'Subject summary',
      replace: 'Replace',
      replaceTitle: 'Replacement',
      teachersTab: 'Teachers',
      roomsTab: 'Rooms',
      search: 'Search',
      noTeachers: 'No recommendations',
      noRooms: 'No free rooms',
      close: 'Close',
      freeRoomTitle: 'Free up room',
      roomIsFree: 'Room is free — will be applied directly.',
      conflicts: 'Conflicts',
      autoResolve: 'Auto resolve',
      possible: 'possible',
      no: 'no',
      alternatives: 'Alternatives',
      preview: 'Preview',
      previewList: 'Preview of changes:',
      auto: 'Auto apply'
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
