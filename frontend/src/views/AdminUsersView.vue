<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import type { User, UserRole, UserStatus } from '@/services/models.ts'

import IconPlus from '@/assets/icons/users.svg?component'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)
const canView = computed(() => role.value === 'ADMIN')

const users = ref<User[]>([])
const totalElements = ref(0)
const loading = ref(true)

const search = ref('')
const roleFilter = ref<UserRole | 'ALL'>('ALL')
const page = ref(1)
const size = ref(10)

async function loadUsers() {
  loading.value = true
  try {
    const result = await userService.getUsers({
      search: search.value,
      role: roleFilter.value,
      page: page.value,
      size: size.value,
    })
    users.value = result.content
    totalElements.value = result.totalElements
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (canView.value) {
    loadUsers()
  }
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadUsers()
  }, 300)
})

watch(roleFilter, () => {
  page.value = 1
  loadUsers()
})

watch(page, () => {
  loadUsers()
})

const totalPages = computed(() => Math.ceil(totalElements.value / size.value))

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function prevPage() {
  if (page.value > 1) page.value--
}

function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    ADMIN: 'Администратор',
    MASTER: 'Мастер',
    TECHNICIAN: 'Механик',
    REQUESTER: 'Заявитель',
  }
  return map[role]
}

function statusLabel(status: UserStatus): string {
  return status === 'ACTIVE' ? 'Активен' : 'Заблокирован'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

async function toggleBlock(user: User) {
  if (user.username === authStore.user.username) {
    alert('Вы не можете заблокировать собственную учётную запись.')
    return
  }

  if (user.status === 'ACTIVE') {
    await userService.blockUser(user.id)
  } else {
    await userService.unblockUser(user.id)
  }

  loadUsers()
}
</script>

<template>
  <div class="users">
    <div v-if="!canView" class="no-access">У вас нет доступа к управлению пользователями.</div>

    <template v-else>
      <div class="users__header">
        <div>
          <h1 class="users__title">Пользователи</h1>
          <p class="users__subtitle">Всего учётных записей: {{ totalElements }}</p>
        </div>
        <button class="btn btn--primary">
          <IconPlus class="btn-icon" />
          Создать пользователя
        </button>
      </div>

      <div class="users__filters">
        <div class="filter-group">
          <label class="filter-label">Поиск</label>
          <input
            v-model="search"
            type="text"
            class="filter-input"
            placeholder="Поиск по логину, ФИО или email..."
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Роль</label>
          <select v-model="roleFilter" class="filter-select">
            <option value="ALL">Все</option>
            <option value="ADMIN">Администратор</option>
            <option value="MASTER">Мастер</option>
            <option value="TECHNICIAN">Механик</option>
            <option value="REQUESTER">Заявитель</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <div v-if="loading" class="table-loading">Загрузка данных...</div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Логин</th>
              <th>ФИО</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="7" class="table-empty">Пользователи не найдены</td>
            </tr>
            <tr v-for="user in users" :key="user.id" class="table-row">
              <td class="table-cell--mono">{{ user.username }}</td>
              <td class="table-cell--bold">
                <router-link :to="`/users/${user.id}`" class="user-link">
                  {{ [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ') }}
                </router-link>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="`badge--role-${user.role.toLowerCase()}`">
                  {{ roleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="
                    user.status === 'ACTIVE' ? 'badge--status-active' : 'badge--status-blocked'
                  "
                >
                  {{ statusLabel(user.status) }}
                </span>
              </td>
              <td class="table-cell--muted">{{ formatDate(user.createdAt) }}</td>
              <td class="actions-col">
                <button
                  class="action-btn"
                  :disabled="user.username === authStore.user.username"
                  :title="user.status === 'ACTIVE' ? 'Заблокировать' : 'Разблокировать'"
                  @click="toggleBlock(user)"
                >
                  {{ user.status === 'ACTIVE' ? 'Блок' : 'Разблок' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="pagination__btn" :disabled="page === 1" @click="prevPage">← Назад</button>
        <span class="pagination__info">Страница {{ page }} из {{ totalPages }}</span>
        <button class="pagination__btn" :disabled="page === totalPages" @click="nextPage">
          Вперёд →
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.users {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.no-access {
  padding: 40px;
  text-align: center;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 16px;
}

.users__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.users__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.users__subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
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

.btn-icon {
  width: 16px;
  height: 16px;
}

.users__filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
  flex: 1;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input,
.filter-select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.table-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.table-loading,
.table-empty {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table-row:hover {
  background: #f8fafc;
}

.table-cell--mono {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #64748b;
}

.table-cell--bold {
  font-weight: 500;
  color: #1e293b;
}

.table-cell--muted {
  color: #94a3b8;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
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

.actions-col {
  text-align: right;
}

.action-btn {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
}

.action-btn:hover:not(:disabled) {
  background: #f8fafc;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.pagination__btn {
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
}

.pagination__btn:hover:not(:disabled) {
  background: #f8fafc;
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__info {
  font-size: 13px;
  color: #64748b;
}
</style>
