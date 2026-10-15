<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore
// =============================================

const isProfileMenuOpen = ref(false)

// Уведомления (заглушка)
const notifications = ref([
  { id: 1, text: 'Новая заявка на ремонт', time: '5 мин назад', unread: true },
  { id: 2, text: 'Наряд №42 просрочен', time: '1 час назад', unread: true },
])

const unreadCount = ref(notifications.value.filter((n) => n.unread).length)

function toggleProfileMenu() {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

function handleLogout() {
  authStore.logout()
}

function closeProfileMenu() {
  isProfileMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <!-- Левая часть: заголовок / breadcrumbs -->
    <div class="header__left">
      <h1 class="header__page-title">Панель управления</h1>
    </div>

    <!-- Правая часть: уведомления + профиль -->
    <div class="header__right">
      <!-- Уведомления -->
      <button class="header__icon-btn" title="Уведомления">
        <span class="header__icon">🔔</span>
        <span v-if="unreadCount > 0" class="header__badge">{{ unreadCount }}</span>
      </button>

      <!-- Профиль -->
      <div class="header__profile" @click.stop>
        <button class="header__profile-btn" @click="toggleProfileMenu">
          <div class="header__avatar">
            {{ authStore.user?.username?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <div class="header__user-info">
            <div class="header__user-name">{{ authStore.user?.fullName ?? 'Гость' }}</div>
            <div class="header__user-role">{{ authStore.user?.role ?? '—' }}</div>
          </div>
          <span class="header__chevron" :class="{ 'header__chevron--open': isProfileMenuOpen }"
            >▾</span
          >
        </button>

        <!-- Выпадающее меню -->
        <div v-if="isProfileMenuOpen" class="header__dropdown">
          <router-link to="/profile" class="header__dropdown-item" @click="closeProfileMenu">
            <span class="header__dropdown-icon">👤</span>
            Профиль
          </router-link>
          <router-link to="/settings" class="header__dropdown-item" @click="closeProfileMenu">
            <span class="header__dropdown-icon">⚙️</span>
            Настройки
          </router-link>
          <div class="header__dropdown-divider"></div>
          <button class="header__dropdown-item header__dropdown-item--danger" @click="handleLogout">
            <span class="header__dropdown-icon">🚪</span>
            Выйти
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay для закрытия меню кликом вне -->
    <div v-if="isProfileMenuOpen" class="header__overlay" @click="closeProfileMenu"></div>
  </header>
</template>

<style scoped>
.header {
  --sidebar-width: 260px;
  --header-height: 64px;
  --header-bg: #ffffff;
  --header-border: #e2e8f0;
  --header-text: #1e293b;
  --header-text-muted: #64748b;
  --header-hover: #f1f5f9;
  --header-accent: #3b82f6;
  --header-danger: #ef4444;

  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--header-height);
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 90;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ====== Левая часть ====== */
.header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--header-text);
  margin: 0;
}

/* ====== Правая часть ====== */
.header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ====== Иконка-кнопка (уведомления) ====== */
.header__icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.header__icon-btn:hover {
  background: var(--header-hover);
}

.header__icon {
  font-size: 20px;
  line-height: 1;
}

.header__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--header-danger);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* ====== Профиль ====== */
.header__profile {
  position: relative;
}

.header__profile-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
}

.header__profile-btn:hover {
  background: var(--header-hover);
}

.header__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--header-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
}

.header__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.header__user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--header-text);
  line-height: 1.2;
  white-space: nowrap;
}

.header__user-role {
  font-size: 11px;
  color: var(--header-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.header__chevron {
  font-size: 12px;
  color: var(--header-text-muted);
  transition: transform 0.15s ease;
}

.header__chevron--open {
  transform: rotate(180deg);
}

/* ====== Выпадающее меню ====== */
.header__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: #fff;
  border: 1px solid var(--header-border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 6px;
  z-index: 100;
}

.header__dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  color: var(--header-text);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  text-align: left;
}

.header__dropdown-item:hover {
  background: var(--header-hover);
}

.header__dropdown-item--danger {
  color: var(--header-danger);
}

.header__dropdown-item--danger:hover {
  background: #fef2f2;
}

.header__dropdown-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.header__dropdown-divider {
  height: 1px;
  background: var(--header-border);
  margin: 6px 4px;
}

/* ====== Overlay для закрытия меню ====== */
.header__overlay {
  position: fixed;
  inset: 0;
  z-index: 89;
  background: transparent;
}
</style>
