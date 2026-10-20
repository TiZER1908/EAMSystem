<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IconLogo from '@/assets/logo.svg?component'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const MOCK_USERS = [
  { username: 'admin', password: 'admin', role: 'ADMIN', fullName: 'Администратор Системы' },
  { username: 'master', password: 'master', role: 'MASTER', fullName: 'Иванов Иван' },
  { username: 'tech', password: 'tech', role: 'TECHNICIAN', fullName: 'Петров Пётр' },
  { username: 'user', password: 'user', role: 'REQUESTER', fullName: 'Сидоров Сидор' },
]

async function handleLogin() {
  error.value = null

  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Заполните все поля'
    return
  }

  loading.value = true

  await new Promise((r) => setTimeout(r, 500))

  const found = MOCK_USERS.find(
    (u) => u.username === username.value && u.password === password.value,
  )

  if (!found) {
    error.value = 'Неверный логин или пароль'
    loading.value = false
    return
  }

  localStorage.setItem(
    'eam_user',
    JSON.stringify({
      id: 1,
      username: found.username,
      fullName: found.fullName,
      role: found.role,
    }),
  )
  localStorage.setItem('eam_token', 'fake-jwt-token')

  loading.value = false
  router.push('/dashboard')
}

function fillDemo(role: string) {
  const user = MOCK_USERS.find((u) => u.role === role)
  if (user) {
    username.value = user.username
    password.value = user.password
  }
}
</script>

<template>
  <div class="login">
    <div class="login__card">
      <div class="login__header">
        <component :is="IconLogo" class="login__logo" />
        <h1 class="login__title">EAM System</h1>
        <p class="login__subtitle">Управление производственными активами</p>
      </div>

      <form class="login__form" @submit.prevent="handleLogin">
        <div class="login__field">
          <label class="login__label" for="username">Логин</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="login__input"
            placeholder="Введите логин"
            autocomplete="username"
            :disabled="loading"
          />
        </div>

        <div class="login__field">
          <label class="login__label" for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="login__input"
            placeholder="Введите пароль"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="login__error">
          <span class="login__error-icon">⚠️</span>
          {{ error }}
        </div>

        <button type="submit" class="login__btn" :disabled="loading">
          <span v-if="loading" class="login__spinner"></span>
          <span v-else>Войти</span>
        </button>
      </form>

      <div class="login__demo">
        <div class="login__demo-title">Демо-доступы:</div>
        <div class="login__demo-buttons">
          <button type="button" class="login__demo-btn" @click="fillDemo('ADMIN')">Админ</button>
          <button type="button" class="login__demo-btn" @click="fillDemo('MASTER')">Мастер</button>
          <button type="button" class="login__demo-btn" @click="fillDemo('TECHNICIAN')">
            Механик
          </button>
          <button type="button" class="login__demo-btn" @click="fillDemo('REQUESTER')">
            Заявитель
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  --login-bg: #f1f5f9;
  --login-card-bg: #ffffff;
  --login-text: #1e293b;
  --login-text-muted: #64748b;
  --login-border: #e2e8f0;
  --login-accent: #3b82f6;
  --login-accent-hover: #2563eb;
  --login-danger: #ef4444;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--login-bg);
  padding: 24px;
}

.login__card {
  width: 100%;
  max-width: 420px;
  background: var(--login-card-bg);
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.login__header {
  text-align: center;
  margin-bottom: 32px;
}

.login__logo {
  width: 50px;
  height: 50px;
  line-height: 1;
  margin-bottom: 12px;
}

.login__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--login-text);
  margin: 0 0 6px;
}

.login__subtitle {
  font-size: 14px;
  color: var(--login-text-muted);
  margin: 0;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--login-text);
}

.login__input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--login-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--login-text);
  background: #fff;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.login__input:focus {
  outline: none;
  border-color: var(--login-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.login__input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.login__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: var(--login-danger);
  font-size: 13px;
}

.login__error-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.login__btn {
  width: 100%;
  padding: 12px;
  background: var(--login-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.login__btn:hover:not(:disabled) {
  background: var(--login-accent-hover);
}

.login__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login__demo {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--login-border);
}

.login__demo-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--login-text-muted);
  margin-bottom: 10px;
  text-align: center;
}

.login__demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.login__demo-btn {
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid var(--login-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--login-text-muted);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  font-family: inherit;
}

.login__demo-btn:hover {
  background: var(--login-accent);
  color: #fff;
  border-color: var(--login-accent);
}
</style>
