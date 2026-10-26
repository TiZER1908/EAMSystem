<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import type { UserRole } from '@/services/models'

import IconBack from '@/assets/icons/logout.svg?component'

const router = useRouter()
const authStore = useAuthStore

const role = computed(() => authStore.user.role)
const canEdit = computed(() => role.value === 'ADMIN')

const form = ref({
  username: '',
  email: '',
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  role: 'REQUESTER' as UserRole,
  password: '',
})

const saving = ref(false)
const error = ref<string | null>(null)

async function handleSave() {
  error.value = null
  if (
    !form.value.username.trim() ||
    !form.value.email.trim() ||
    !form.value.lastName.trim() ||
    !form.value.firstName.trim() ||
    !form.value.password.trim()
  ) {
    error.value = 'Заполните обязательные поля'
    return
  }

  saving.value = true
  try {
    await userService.createUser(form.value)
    alert('Пользователь успешно создан!')
    router.push('/admin/users')
  } catch {
    error.value = 'Ошибка при создании пользователя'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="user-create">
    <div v-if="!canEdit" class="no-access">У вас нет доступа к созданию пользователей.</div>

    <template v-else>
      <div class="page-header">
        <button class="btn-back" @click="router.back()">
          <IconBack class="icon-sm" />
          Назад
        </button>
        <h1 class="page-title">Новый пользователь</h1>
      </div>

      <div class="create-card">
        <form @submit.prevent="handleSave" class="form">
          <div class="form__row">
            <div class="form__field">
              <label class="form__label">Логин <span class="req">*</span></label>
              <input
                v-model="form.username"
                type="text"
                class="form__input"
                placeholder="username"
                required
              />
            </div>
            <div class="form__field">
              <label class="form__label">Email <span class="req">*</span></label>
              <input
                v-model="form.email"
                type="email"
                class="form__input"
                placeholder="user@example.com"
                required
              />
            </div>
          </div>

          <div class="form__row">
            <div class="form__field">
              <label class="form__label">Фамилия <span class="req">*</span></label>
              <input v-model="form.lastName" type="text" class="form__input" required />
            </div>
            <div class="form__field">
              <label class="form__label">Имя <span class="req">*</span></label>
              <input v-model="form.firstName" type="text" class="form__input" required />
            </div>
          </div>

          <div class="form__row">
            <div class="form__field">
              <label class="form__label">Отчество</label>
              <input v-model="form.middleName" type="text" class="form__input" />
            </div>
            <div class="form__field">
              <label class="form__label">Телефон</label>
              <input
                v-model="form.phone"
                type="tel"
                class="form__input"
                placeholder="+7 (___) ___-__-__"
              />
            </div>
          </div>

          <div class="form__row">
            <div class="form__field">
              <label class="form__label">Роль <span class="req">*</span></label>
              <select v-model="form.role" class="form__select" required>
                <option value="REQUESTER">Заявитель</option>
                <option value="TECHNICIAN">Механик</option>
                <option value="MASTER">Мастер</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
            <div class="form__field">
              <label class="form__label">Временный пароль <span class="req">*</span></label>
              <input
                v-model="form.password"
                type="text"
                class="form__input"
                placeholder="Например: 12345678"
                required
              />
            </div>
          </div>

          <div v-if="error" class="form__error">{{ error }}</div>

          <div class="form__actions">
            <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
            <button type="submit" class="btn btn--primary" :disabled="saving">
              {{ saving ? 'Создание...' : 'Создать пользователя' }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<style scoped>
.user-create {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  padding: 4px 0;
}
.btn-back:hover {
  color: #1e293b;
}

.create-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 600px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form__label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
.req {
  color: #ef4444;
}

.form__input,
.form__select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.form__input:focus,
.form__select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form__error {
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
}
.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
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
.btn--primary:hover:not(:disabled) {
  background: #2563eb;
}
.btn--primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}
.btn--outline:hover {
  background: #f8fafc;
}
.icon-sm {
  width: 16px;
  height: 16px;
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
</style>
