<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  dashboardService,
  type KpiCard,
  type RecentRequest,
  type EventItem,
  type SystemStatusItem,
} from '@/services/dashboardService'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)

// ====== Состояние ======
const kpiCards = ref<KpiCard[]>([])
const recentRequests = ref<RecentRequest[]>([])
const events = ref<EventItem[]>([])
const systemStatus = ref<SystemStatusItem[]>([])
const loading = ref(true)

// ====== Загрузка данных при монтировании ======
onMounted(async () => {
  loading.value = true
  try {
    const [kpi, requests, evts, status] = await Promise.all([
      dashboardService.getKpiCards(),
      dashboardService.getRecentRequests(),
      dashboardService.getEvents(),
      dashboardService.getSystemStatus(),
    ])

    // Фильтруем KPI-карточки по роли
    kpiCards.value = kpi.filter((card) => card.roles.includes(role.value))

    recentRequests.value = requests
    events.value = evts
    systemStatus.value = status
  } finally {
    loading.value = false
  }
})

// ====== Приветствие по времени суток ======
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
})

const today = computed(() =>
  new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)

// ====== Хелперы для бейджей ======
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'Новая',
    IN_PROGRESS: 'В работе',
    CLOSED: 'Закрыта',
    REJECTED: 'Отклонена',
  }
  return map[status] ?? status
}

function priorityLabel(priority: string): string {
  const map: Record<string, string> = {
    LOW: 'Низкий',
    NORMAL: 'Обычный',
    HIGH: 'Высокий',
    CRITICAL: 'Критичный',
  }
  return map[priority] ?? priority
}
</script>

<template>
  <div class="dashboard">
    <!-- ====== Приветствие ====== -->
    <div class="dashboard__welcome">
      <h1 class="dashboard__greeting">{{ greeting }}, {{ authStore.user.fullName }}!</h1>
      <p class="dashboard__date">{{ today }}</p>
    </div>

    <!-- ====== Загрузка ====== -->
    <div v-if="loading" class="dashboard__loading">Загрузка данных...</div>

    <template v-else>
      <!-- ====== KPI-карточки ====== -->
      <div class="dashboard__kpi-grid">
        <div
          v-for="card in kpiCards"
          :key="card.id"
          class="kpi-card"
          :class="`kpi-card--${card.color}`"
        >
          <div class="kpi-card__icon">{{ card.icon }}</div>
          <div class="kpi-card__body">
            <div class="kpi-card__value">{{ card.value }}</div>
            <div class="kpi-card__label">{{ card.label }}</div>
            <div class="kpi-card__subtitle">{{ card.subtitle }}</div>
          </div>
        </div>
      </div>

      <!-- ====== Две колонки ====== -->
      <div class="dashboard__columns">
        <!-- Последние заявки -->
        <section class="card">
          <div class="card__header">
            <h2 class="card__title">Последние заявки</h2>
            <router-link to="/requests" class="card__link">Все заявки →</router-link>
          </div>

          <div class="card__body">
            <div v-for="req in recentRequests" :key="req.id" class="request-row">
              <div class="request-row__main">
                <div class="request-row__asset">
                  <span class="request-row__id">#{{ req.id }}</span>
                  {{ req.asset }}
                </div>
                <div class="request-row__meta">{{ req.author }} · {{ req.time }}</div>
              </div>

              <div class="request-row__badges">
                <span class="badge" :class="`badge--priority-${req.priority.toLowerCase()}`">
                  {{ priorityLabel(req.priority) }}
                </span>
                <span class="badge" :class="`badge--status-${req.status.toLowerCase()}`">
                  {{ statusLabel(req.status) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Лента событий -->
        <section class="card">
          <div class="card__header">
            <h2 class="card__title">Лента событий</h2>
          </div>

          <div class="card__body">
            <div v-for="event in events" :key="event.id" class="event-row">
              <div class="event-row__icon" :class="`event-row__icon--${event.type}`">
                {{ event.icon }}
              </div>
              <div class="event-row__body">
                <div class="event-row__text">{{ event.text }}</div>
                <div class="event-row__time">{{ event.time }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ====== Состояние системы (только для админа) ====== -->
      <section v-if="role === 'ADMIN'" class="card">
        <div class="card__header">
          <h2 class="card__title">Состояние системы</h2>
          <router-link to="/monitoring" class="card__link">Мониторинг →</router-link>
        </div>

        <div class="card__body">
          <div class="system-grid">
            <div v-for="item in systemStatus" :key="item.name" class="system-item">
              <div class="system-item__status" :class="`system-item__status--${item.status}`"></div>
              <div class="system-item__body">
                <div class="system-item__name">{{ item.name }}</div>
                <div class="system-item__value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.dashboard__welcome {
  margin-bottom: 4px;
}

.dashboard__greeting {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.dashboard__date {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  text-transform: capitalize;
}

.dashboard__loading {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* ====== KPI ====== */
.dashboard__kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #cbd5e1;
}

.kpi-card--blue {
  border-left-color: #3b82f6;
}
.kpi-card--orange {
  border-left-color: #f59e0b;
}
.kpi-card--green {
  border-left-color: #10b981;
}
.kpi-card--red {
  border-left-color: #ef4444;
}

.kpi-card__icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.kpi-card__body {
  flex: 1;
  min-width: 0;
}

.kpi-card__value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.1;
}

.kpi-card__label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-top: 2px;
}

.kpi-card__subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ====== Колонки ====== */
.dashboard__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1024px) {
  .dashboard__columns {
    grid-template-columns: 1fr;
  }
}

/* ====== Карточка ====== */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.card__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card__link {
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.15s ease;
}

.card__link:hover {
  color: #2563eb;
}

.card__body {
  padding: 8px 0;
}

/* ====== Заявка ====== */
.request-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.request-row:last-child {
  border-bottom: none;
}
.request-row:hover {
  background: #f8fafc;
}

.request-row__main {
  flex: 1;
  min-width: 0;
}

.request-row__asset {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-row__id {
  color: #3b82f6;
  font-weight: 600;
  margin-right: 6px;
}

.request-row__meta {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.request-row__badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* ====== Бейджи ====== */
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.badge--priority-low {
  background: #f1f5f9;
  color: #64748b;
}
.badge--priority-normal {
  background: #dbeafe;
  color: #1e40af;
}
.badge--priority-high {
  background: #fef3c7;
  color: #92400e;
}
.badge--priority-critical {
  background: #fee2e2;
  color: #991b1b;
}

.badge--status-new {
  background: #dbeafe;
  color: #1e40af;
}
.badge--status-in_progress {
  background: #fef3c7;
  color: #92400e;
}
.badge--status-closed {
  background: #d1fae5;
  color: #065f46;
}
.badge--status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* ====== Событие ====== */
.event-row {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.event-row:last-child {
  border-bottom: none;
}
.event-row:hover {
  background: #f8fafc;
}

.event-row__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  background: #f1f5f9;
}

.event-row__icon--success {
  background: #d1fae5;
}
.event-row__icon--info {
  background: #dbeafe;
}
.event-row__icon--warning {
  background: #fef3c7;
}
.event-row__icon--error {
  background: #fee2e2;
}

.event-row__body {
  flex: 1;
  min-width: 0;
}

.event-row__text {
  font-size: 13px;
  color: #334155;
  line-height: 1.4;
}

.event-row__time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ====== Состояние системы ====== */
.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  padding: 16px 20px;
}

.system-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.system-item__status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.system-item__status--up {
  background: #10b981;
}
.system-item__status--warning {
  background: #f59e0b;
}
.system-item__status--down {
  background: #ef4444;
}

.system-item__name {
  font-size: 12px;
  color: #64748b;
}

.system-item__value {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  margin-top: 2px;
}
</style>
