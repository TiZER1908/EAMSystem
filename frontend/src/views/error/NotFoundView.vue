<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function goHome() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__content">
      <div class="not-found__code">404</div>
      <h1 class="not-found__title">Страница не найдена</h1>
      <p class="not-found__text">
        Возможно, страница была удалена, перемещена или вы ввели неверный адрес.
      </p>

      <div class="not-found__actions">
        <button class="btn btn--outline" @click="goBack">← Назад</button>
        <button class="btn btn--primary" @click="goHome">На главную</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  padding: 24px;
}

.not-found__content {
  text-align: center;
  max-width: 500px;
}

.not-found__code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: #cbd5e1;
  letter-spacing: -4px;
  margin-bottom: 16px;
  user-select: none;
}

.not-found__title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px;
}

.not-found__text {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 32px;
}

.not-found__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ====== Кнопки ====== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  font-family: inherit;
  border: 1px solid transparent;
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
  border-color: #cbd5e1;
}
</style>
