Schedule Creator Frontend

Stack
- Vue 3 + Vite + TypeScript
- Pinia, Vue Router
- Tailwind CSS (+ Headless UI for modal)
- axios with X-Admin-Token interceptor
- vue-i18n (ru/kk/en)

Getting started
- Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
- Install deps: `npm install`
- Start dev server: `npm run dev`

Dev proxy (optional)
- If your API doesn’t run at the same origin, set `VITE_DEV_PROXY_TARGET=http://localhost:8080` and leave `VITE_API_BASE_URL=/api`. Vite will proxy `/api/*` to the target during dev.

Key routes
- `/` — расписание на день (фильтры: дата, преподаватель/группа; бейдж источника day_plan/weekly)
- `/teacher` — поиск по ФИО + диапазон дат
- `/group` — поиск по группе + диапазон дат
- Admin lives under its own shell with dedicated navbar (open directly by link):
  - `/admin/settings` — ввод admin token (sessionStorage)
  - `/admin/upload` — загрузка Excel
  - `/admin/day/plan` — построение плана дня
  - `/admin/day/:dayId` — сетка дня: автозамена, отчёт, approve, ручные правки
  - `/admin/bulk` — массовые правки с dry-run
  - `/admin/progress` — сводка и простой график

Internationalization
- Языки: русский (ru), казахский (kk), английский (en). Переключатель в шапке справа.
- Добавить новые ключи/переводы: `src/i18n/index.ts`.

Notes
- Interceptor добавляет `X-Admin-Token` для всех POST и всех `*/admin/*` запросов. 401/403 переадресуют на `/admin/settings`.
- Справочники кэшируются на 10 минут, поиск дебаунсится (300 мс).
- Компонент `SearchSelect` поддерживает простую виртуализацию выпадающего списка.
- Ссылки на админку убраны из публичной навигации — переход только по прямым URL.
- В `Admin Settings` отображается текущая конфигурация API (для отладки окружения).
