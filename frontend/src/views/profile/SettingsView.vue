<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import type { User } from '@/services/models.ts'

const authStore = useAuthStore

const profileForm = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  email: '',
  phone: '',
})
const profileLoading = ref(true)
const profileSaving = ref(false)
const profileMessage = ref<string | null>(null)
const profileError = ref<string | null>(null)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordSaving = ref(false)
const passwordMessage = ref<string | null>(null)
const passwordError = ref<string | null>(null)

onMounted(async () => {
  try {
    const user = await userService.getUserById(authStore.user.id)
    profileForm.value = {
      lastName: user.lastName,
      firstName: user.firstName,
      middleName: user.middleName || '',
      email: user.email,
      phone: user.phone || '',
    }
  } catch {
    profileError.value = 'Не удалось загрузить данные профиля'
  } finally {
    profileLoading.value = false
  }
})

async function handleSaveProfile() {
  profileMessage.value = null
  profileError.value = null

  if (
    !profileForm.value.lastName.trim() ||
    !profileForm.value.firstName.trim() ||
    !profileForm.value.email.trim()
  ) {
    profileError.value = 'Заполните обязательные поля (Фамилия, Имя, Email)'
    return
  }

  profileSaving.value = true
  try {
    await userService.updateProfile(authStore.user.id, {
      lastName: profileForm.value.lastName,
      firstName: profileForm.value.firstName,
      middleName: profileForm.value.middleName || null,
      email: profileForm.value.email,
      phone: profileForm.value.phone || null,
    } as Partial<User>)
    profileMessage.value = 'Данные профиля успешно обновлены'
  } catch {
    profileError.value = 'Ошибка при сохранении профиля'
  } finally {
    profileSaving.value = false
  }
}

async function handleChangePassword() {
  passwordMessage.value = null
  passwordError.value = null

  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordError.value = 'Заполните все поля'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Пароли не совпадают'
    return
  }

  passwordSaving.value = true
  try {
    await userService.changePassword(authStore.user.id, {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordMessage.value = 'Пароль успешно изменён'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch {
    passwordError.value = 'Ошибка при смене пароля'
  } finally {
    passwordSaving.value = false
  }
}
</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1 class="settings__title">Настройки профиля</h1>
    </div>

    <div class="settings__layout">
      <section class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Личные данные</h2>
        </div>
        <div class="panel__body">
          <div v-if="profileLoading" class="loading-text">Загрузка...</div>
          <form v-else @submit.prevent="handleSaveProfile" class="form">
            <div class="form__field">
              <label class="form__label">Фамилия <span class="req">*</span></label>
              <input v-model="profileForm.lastName" type="text" class="form__input" required />
            </div>
            <div class="form__field">
              <label class="form__label">Имя <span class="req">*</span></label>
              <input v-model="profileForm.firstName" type="text" class="form__input" required />
            </div>
            <div class="form__field">
              <label class="form__label">Отчество</label>
              <input v-model="profileForm.middleName" type="text" class="form__input" />
            </div>
            <div class="form__field">
              <label class="form__label">Email <span class="req">*</span></label>
              <input v-model="profileForm.email" type="email" class="form__input" required />
            </div>
            <div class="form__field">
              <label class="form__label">Телефон</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                class="form__input"
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div v-if="profileMessage" class="form__message form__message--success">
              {{ profileMessage }}
            </div>
            <div v-if="profileError" class="form__message form__message--error">
              {{ profileError }}
            </div>

            <div class="form__actions">
              <button type="submit" class="btn btn--primary" :disabled="profileSaving">
                {{ profileSaving ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Безопасность</h2>
        </div>
        <div class="panel__body">
          <form @submit.prevent="handleChangePassword" class="form">
            <div class="form__field">
              <label class="form__label">Текущий пароль</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                class="form__input"
                placeholder="••••••••"
                required
              />
            </div>
            <div class="form__field">
              <label class="form__label">Новый пароль</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="form__input"
                placeholder="••••••••"
                required
              />
            </div>
            <div class="form__field">
              <label class="form__label">Подтверждение пароля</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="form__input"
                placeholder="••••••••"
                required
              />
            </div>

            <div v-if="passwordMessage" class="form__message form__message--success">
              {{ passwordMessage }}
            </div>
            <div v-if="passwordError" class="form__message form__message--error">
              {{ passwordError }}
            </div>

            <div class="form__actions">
              <button type="submit" class="btn btn--primary" :disabled="passwordSaving">
                {{ passwordSaving ? 'Сохранение...' : 'Сменить пароль' }}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.settings__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.settings__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
}

@media (min-width: 1024px) {
  .settings__layout {
    grid-template-columns: 1fr 1fr;
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
}

.loading-text {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form__input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.form__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form__actions {
  margin-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
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

.form__message {
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
}

.form__message--success {
  background: #d1fae5;
  color: #065f46;
}

.form__message--error {
  background: #fef2f2;
  color: #991b1b;
}
</style>
