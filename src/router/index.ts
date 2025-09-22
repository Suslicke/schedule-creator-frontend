import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/public/Home.vue'
import Start from '@/views/public/Start.vue'
import Teacher from '@/views/public/Teacher.vue'
import Group from '@/views/public/Group.vue'
import AdminShell from '@/views/admin/AdminShell.vue'
import AdminSettings from '@/views/admin/AdminSettings.vue'
import Upload from '@/views/admin/Upload.vue'
import DayPlan from '@/views/admin/DayPlan.vue'
import DayDetail from '@/views/admin/DayDetail.vue'
import DayEditor from '@/views/admin/DayEditor.vue'
import Progress from '@/views/admin/Progress.vue'
import Analytics from '@/views/admin/Analytics.vue'
import BulkEdits from '@/views/admin/BulkEdits.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'start', component: Start, meta: { fullscreen: true } },
  { path: '/schedule', name: 'schedule', component: Home, meta: { fullscreen: true } },
  { path: '/teacher', name: 'teacher', component: Teacher },
  { path: '/group', name: 'group', component: Group },
  {
    path: '/admin',
    component: AdminShell,
    children: [
      { path: '', redirect: { name: 'admin-day-plan' } },
      { path: 'settings', name: 'admin-settings', component: AdminSettings },
      { path: 'upload', name: 'admin-upload', component: Upload, meta: { requiresAdmin: true } },
      { path: 'day/plan', name: 'admin-day-plan', component: DayPlan, meta: { requiresAdmin: true } },
      { path: 'day/editor', name: 'admin-day-editor', component: DayEditor, meta: { requiresAdmin: true } },
      { path: 'day/:dayId', name: 'admin-day-detail', component: DayDetail, meta: { requiresAdmin: true } },
      { path: 'progress', name: 'admin-progress', component: Progress, meta: { requiresAdmin: true } },
      { path: 'analytics', name: 'admin-analytics', component: Analytics, meta: { requiresAdmin: true } },
      { path: 'bulk', name: 'admin-bulk', component: BulkEdits, meta: { requiresAdmin: true } }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    const auth = useAuthStore()
    if (!auth.adminToken) {
      return { name: 'admin-settings', query: { next: to.fullPath } }
    }
  }
})

export default router
