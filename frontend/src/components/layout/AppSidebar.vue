<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore

interface MenuItem {
  path: string
  label: string
  icon: string
  roles: string[]
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

// Все пункты меню с ролями, которым они доступны
const allGroups: MenuGroup[] = [
  {
    title: 'Основное',
    items: [
      {
        path: '/dashboard',
        label: 'Дашборд',
        icon: '📊',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'],
      },
      {
        path: '/assets',
        label: 'Активы',
        icon: '🏭',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN'],
      },
      {
        path: '/requests',
        label: 'Заявки',
        icon: '📝',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'],
      },
      {
        path: '/work-orders',
        label: 'Наряды',
        icon: '🔧',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN'],
      },
      {
        path: '/spare-parts',
        label: 'Запчасти',
        icon: '📦',
        roles: ['ADMIN', 'MASTER'],
      },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      {
        path: '/reports',
        label: 'Отчёты',
        icon: '📈',
        roles: ['ADMIN', 'MASTER'],
      },
      {
        path: '/monitoring',
        label: 'Мониторинг',
        icon: '🔍',
        roles: ['ADMIN'],
      },
    ],
  },
  {
    title: 'Администрирование',
    items: [
      {
        path: '/admin/users',
        label: 'Пользователи',
        icon: '👥',
        roles: ['ADMIN'],
      },
      {
        path: '/admin/dictionaries',
        label: 'Справочники',
        icon: '📚',
        roles: ['ADMIN'],
      },
    ],
  },
]

const visibleGroups = computed<MenuGroup[]>(() => {
  const role = authStore.user?.role ?? 'REQUESTER'
  return allGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)
})

// Проверяем, активен ли пункт (учитываем вложенные маршруты)
const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <aside class="sidebar">
    <!-- Логотип / название -->
    <div class="sidebar__brand">
      <span class="sidebar__logo">⚙️</span>
      <span class="sidebar__title">EAM System</span>
    </div>

    <!-- Навигация -->
    <nav class="sidebar__nav">
      <div v-for="group in visibleGroups" :key="group.title" class="sidebar__group">
        <div class="sidebar__group-title">{{ group.title }}</div>

        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(item.path) }"
        >
          <span class="sidebar__icon">{{ item.icon }}</span>
          <span class="sidebar__label">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Футер сайдбара -->
    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__user-avatar">
          {{ authStore.user?.username?.charAt(0).toUpperCase() ?? '?' }}
        </div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{{ authStore.user?.username ?? 'Гость' }}</div>
          <div class="sidebar__user-role">{{ authStore.user?.role ?? '—' }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ====== Общие параметры ====== */
.sidebar {
  --sidebar-width: 260px;
  --sidebar-bg: #1e293b;
  --sidebar-bg-hover: #334155;
  --sidebar-bg-active: #3b82f6;
  --sidebar-text: #cbd5e1;
  --sidebar-text-active: #ffffff;
  --sidebar-group-title: #64748b;
  --sidebar-border: #334155;

  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--sidebar-border);
  overflow-y: auto;
  z-index: 100;
}

/* ====== Логотип ====== */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px 20px;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.sidebar__logo {
  font-size: 24px;
  line-height: 1;
}

.sidebar__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--sidebar-text-active);
  letter-spacing: 0.3px;
}

/* ====== Навигация ====== */
.sidebar__nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.sidebar__group {
  margin-bottom: 8px;
}

.sidebar__group-title {
  padding: 8px 20px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--sidebar-group-title);
}

/* ====== Пункт меню ====== */
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  margin: 2px 8px;
  border-radius: 6px;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 14px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  cursor: pointer;
}

.sidebar__item:hover {
  background: var(--sidebar-bg-hover);
  color: var(--sidebar-text-active);
}

.sidebar__item--active {
  background: var(--sidebar-bg-active);
  color: var(--sidebar-text-active);
  font-weight: 500;
}

.sidebar__icon {
  font-size: 18px;
  line-height: 1;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== Футер сайдбара ====== */
.sidebar__footer {
  border-top: 1px solid var(--sidebar-border);
  padding: 12px 16px;
  flex-shrink: 0;
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar__user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--sidebar-bg-active);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}

.sidebar__user-info {
  overflow: hidden;
}

.sidebar__user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--sidebar-text-active);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 11px;
  color: var(--sidebar-group-title);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ====== Скроллбар (опционально) ====== */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
