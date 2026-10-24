import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import AppLayout from '@/components/layout/AppLayout.vue'

const DashboardView = () => import('@/views/DashboardView.vue')
const AssetsListView = () => import('@/views/AssetsListView.vue')
const RequestsListView = () => import('@/views/RequestsListView.vue')
const WorkOrdersListView = () => import('@/views/WorkOrdersListView.vue')
const SparePartsListView = () => import('@/views/SparePartsListView.vue')
const EventsView = () => import('@/views/EventsView.vue')
const ReportsView = () => import('@/views/ReportsView.vue')
const MonitoringView = () => import('@/views/MonitoringView.vue')
const AdminUsersView = () => import('@/views/AdminUsersView.vue')
const AdminDictionariesView = () => import('@/views/AdminDictionariesView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')
const AssetDetailView = () => import('@/views/AssetDetailView.vue')
const AssetEditView = () => import('@/views/AssetEditView.vue')
const RequestDetailView = () => import('@/views/RequestDetailView.vue')
const RequestCreateView = () => import('@/views/RequestCreateView.vue')
const WorkOrderDetailView = () => import('@/views/WorkOrderDetailView.vue')
const AssetCreateView = () => import('@/views/AssetCreateView.vue')
const WorkOrderCreateView = () => import('@/views/WorkOrderCreateView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
  },

  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Дашборд', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
      {
        path: 'assets',
        name: 'assets',
        component: AssetsListView,
        meta: { title: 'Активы', roles: ['ADMIN', 'MASTER', 'TECHNICIAN'] },
      },
      {
        path: 'assets/new',
        name: 'asset-create',
        component: AssetCreateView,
        meta: { title: 'Новый актив', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'assets/:id',
        name: 'asset-detail',
        component: AssetDetailView,
        meta: { title: 'Карточка актива', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
      {
        path: 'assets/:id/edit',
        name: 'asset-edit',
        component: AssetEditView,
        meta: { title: 'Редактирование актива', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'requests',
        name: 'requests',
        component: RequestsListView,
        meta: { title: 'Заявки', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
      {
        path: 'requests/:id',
        name: 'request-delail',
        component: RequestDetailView,
        meta: { title: 'Карточка заявки', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
      {
        path: 'requests/new',
        name: 'request-new',
        component: RequestCreateView,
        meta: { title: 'Новая заявка', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
      {
        path: 'work-orders',
        name: 'work-orders',
        component: WorkOrdersListView,
        meta: { title: 'Наряды', roles: ['ADMIN', 'MASTER', 'TECHNICIAN'] },
      },
      {
        path: 'work-orders/new',
        name: 'work-order-create',
        component: WorkOrderCreateView,
        meta: { title: 'Создание наряда', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'work-orders/:id',
        name: 'work-order-detail',
        component: WorkOrderDetailView,
        meta: { title: 'Карточка наряда', roles: ['ADMIN', 'MASTER', 'TECHNICIAN'] },
      },
      {
        path: 'spare-parts',
        name: 'spare-parts',
        component: SparePartsListView,
        meta: { title: 'Запчасти', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'events',
        name: 'events',
        component: EventsView,
        meta: { title: 'Журнал событий', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsView,
        meta: { title: 'Отчёты', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'monitoring',
        name: 'monitoring',
        component: MonitoringView,
        meta: { title: 'Мониторинг', roles: ['ADMIN'] },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: AdminUsersView,
        meta: { title: 'Пользователи', roles: ['ADMIN'] },
      },
      {
        path: 'admin/dictionaries',
        name: 'admin-dictionaries',
        component: AdminDictionariesView,
        meta: { title: 'Справочники', roles: ['ADMIN'] },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { title: 'Профиль', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
      {
        path: 'users/:id',
        name: 'user-profile',
        component: ProfileView,
        meta: { title: 'Профиль пользователя', roles: ['ADMIN', 'MASTER'] },
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: { title: 'Настройки', roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'] },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  // TODO: раскомментировать, когда будет authStore
  // const authStore = useAuthStore()
  //
  // // Проверка авторизации
  // if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
  //   return next('/login')
  // }
  //
  // // Проверка роли
  // if (to.meta.roles && !authStore.hasRole(to.meta.roles as any)) {
  //   return next('/dashboard')
  // }

  next()
})

router.afterEach((to) => {
  const title = (to.meta.title as string) ?? 'EAM System'
  document.title = `${title} | EAM System`
})

export default router
