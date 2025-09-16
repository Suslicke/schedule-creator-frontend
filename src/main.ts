import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/tailwind.css'
import { setupHttp } from './services/http'
import { useToast } from './composables/useToast'
import { i18n } from './i18n'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)

// Init axios interceptors (auth + errors)
setupHttp(pinia, router, {
  onError: (msg) => useToast().error(msg),
  onAuthRequired: () => router.push({ name: 'admin-settings' })
})

app.mount('#app')
