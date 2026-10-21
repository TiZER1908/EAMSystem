<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import type { User } from '@/services/models.ts'

import IconEdit from '@/assets/icons/edit.svg?component'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore

const currentUserRole = computed(() => authStore.user.role)
const currentUserId = computed(() => authStore.user.id)

const profile = ref<User | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const targetUserId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : currentUserId.value
})

const isOwnProfile = computed(() => targetUserId.value === currentUserId.value)
const canView = computed(() => {
  if (isOwnProfile.value) return true
  return currentUserRole.value === 'ADMIN'
})

async function loadProfile() {
  if (!canView.value) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  try {
    profile.value = await userService.getUserById(targetUserId.value)
  } catch {
    error.value = 'Пользователь не найден'
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)

function goToEdit() {
  router.push('/profile/edit')
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'Администратор',
    MASTER: 'Мастер',
    TECHNICIAN: 'Механик',
    REQUESTER: 'Заявитель',
  }
  return map[role] ?? role
}

function statusLabel(status: string): string {
  return status === 'ACTIVE' ? 'Активен' : 'Заблокирован'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="profile">
    <div v-if="!canView" class="no-access">У вас нет доступа к просмотру чужого профиля.</div>

    <div v-else-if="loading" class="profile__loading">Загрузка профиля...</div>

    <div v-else-if="error" class="profile__error">
      {{ error }}
    </div>

    <template v-else-if="profile">
      <div class="profile__header">
        <div class="profile__avatar">
          {{ profile.fullName.charAt(0).toUpperCase() }}
        </div>
        <div class="profile__title-block">
          <h1 class="profile__name">{{ profile.fullName }}</h1>
          <div class="profile__meta">
            <span class="badge" :class="`badge--role-${profile.role.toLowerCase()}`">
              {{ roleLabel(profile.role) }}
            </span>
            <span
              class="badge"
              :class="
                profile.status === 'ACTIVE' ? 'badge--status-active' : 'badge--status-blocked'
              "
            >
              {{ statusLabel(profile.status) }}
            </span>
          </div>
        </div>
        <button v-if="isOwnProfile" class="btn btn--primary" @click="goToEdit">
          <IconEdit class="btn-icon" />
          Редактировать
        </button>
      </div>

      <div class="profile__layout">
        <div class="panel">
          <div class="panel__header">
            <h2 class="panel__title">Основная информация</h2>
          </div>
          <div class="panel__body">
            <div class="info-row">
              <span class="info-label">Логин</span>
              <span class="info-value">{{ profile.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ profile.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ФИО</span>
              <span class="info-value">{{ profile.fullName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Роль</span>
              <span class="info-value">{{ roleLabel(profile.role) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Дата регистрации</span>
              <span class="info-value">{{ formatDate(profile.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-if="isOwnProfile" class="panel">
          <div class="panel__header">
            <h2 class="panel__title">Безопасность</h2>
          </div>
          <div class="panel__body">
            <div class="info-row">
              <span class="info-label">Пароль</span>
              <span class="info-value">••••••••</span>
            </div>
            <div class="panel__action">
              <button class="btn btn--outline">Сменить пароль</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.no-access,
.profile__error {
  padding: 40px;
  text-align: center;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 16px;
}

.profile__loading {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 16px;
}

.profile__header {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.profile__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  flex-shrink: 0;
}

.profile__title-block {
  flex: 1;
}

.profile__name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.profile__meta {
  display: flex;
  gap: 8px;
}

.profile__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 768px) {
  .profile__layout {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.panel__header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.panel__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 14px;
  color: #64748b;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.panel__action {
  margin-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease;
  font-family: inherit;
}

.btn--primary {
  background: #3b82f6;
  color: #fff;
}

.btn--primary:hover {
  background: #2563eb;
}

.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}

.btn--outline:hover {
  background: #f8fafc;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge--role-admin {
  background: #fee2e2;
  color: #991b1b;
}
.badge--role-master {
  background: #dbeafe;
  color: #1e40af;
}
.badge--role-technician {
  background: #fef3c7;
  color: #92400e;
}
.badge--role-requester {
  background: #f1f5f9;
  color: #64748b;
}

.badge--status-active {
  background: #d1fae5;
  color: #065f46;
}
.badge--status-blocked {
  background: #f1f5f9;
  color: #64748b;
  text-decoration: line-through;
}
</style>
