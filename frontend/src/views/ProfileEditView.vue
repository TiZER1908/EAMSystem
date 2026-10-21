<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import type { User } from '@/services/models.ts'

const router = useRouter()
const authStore = useAuthStore

const form = ref({
  fullName: '',
  email: '',
  phone: '',
})

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const user = await userService.getUserById(authStore.user.id)
    form.value.fullName = user.fullName
    form.value.email = user.email
    form.value.phone = ''
  } catch {
    error.value = 'Не удалось загрузить данные профиля'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  error.value = null
  if (!form.value.fullName.trim() || !form.value.email.trim()) {
    error.value = 'Заполните обязательные поля'
    return
  }

  saving.value = true
  try {
    await userService.updateProfile(authStore.user.id, {
      fullName: form.value.fullName,
      email: form.value.email,
    } as Partial<User>)
    router.push('/profile')
  } catch {
    error.value = 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="profile-edit">
    <div class="profile-edit__header">
      <h1 class="profile-edit__title">Редактирование профиля</h1>
    </div>

    <div v-if="loading" class="profile-edit__loading">Загрузка...</div>

    <div v-else class="profile-edit__card">
      <form @submit.prevent="handleSave" class="form">
        <div class="form__field">
          <label class="form__label">ФИО <span class="req">*</span></label>
          <input v-model="form.fullName" type="text" class="form__input" required />
        </div>

        <div class="form__field">
          <label class="form__label">Email <span class="req">*</span></label>
          <input v-model="form.email" type="email" class="form__input" required />
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

        <div v-if="error" class="form__error">{{ error }}</div>

        <div class="form__actions">
          <button type="button" class="btn btn--outline" @click="router.back()">Отмена</button>
          <button type="submit" class="btn btn--primary" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.profile-edit__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-edit__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.profile-edit__loading {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.profile-edit__card {
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
  background: #fff;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.form__input:focus {
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

.btn--outline {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}

.btn--outline:hover {
  background: #f8fafc;
}
</style>
