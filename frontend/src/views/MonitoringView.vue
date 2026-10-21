<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { monitoringService } from '@/services/monitoringService'
import type { MonitoringData, MonitoringEvent } from '@/services/models.ts'

import IconRefresh from '@/assets/icons/monitoring.svg?component'
import IconAlert from '@/assets/icons/alert.svg?component'

const authStore = useAuthStore
const role = computed(() => authStore.user.role)
const canView = computed(() => role.value === 'ADMIN')

const data = ref<MonitoringData | null>(null)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    data.value = await monitoringService.getMonitoringData()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (canView.value) {
    loadData()
  }
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}д ${h}ч ${m}м`
}

function eventClass(type: MonitoringEvent['type']): string {
  if (type === 'CRITICAL') return 'event--critical'
  if (type === 'WARNING') return 'event--warning'
  return 'event--info'
}

const heapPercentage = computed(() => {
  if (!data.value) return 0
  return Math.round((data.value.resources.jvmHeapUsedMb / data.value.resources.jvmHeapMaxMb) * 100)
})

const hikariPercentage = computed(() => {
  if (!data.value) return 0
  return Math.round(
    (data.value.resources.hikariActiveConnections / data.value.resources.hikariMaxConnections) *
      100,
  )
})
</script>

<template>
  <div class="monitoring">
    <div v-if="!canView" class="no-access">У вас нет доступа к разделу мониторинга.</div>

    <template v-else>
      <div class="monitoring__header">
        <div>
          <h1 class="monitoring__title">Мониторинг</h1>
          <p class="monitoring__subtitle">Состояние приложения и кластера БД</p>
        </div>
        <button class="btn btn--outline" :disabled="loading" @click="loadData">
          <IconRefresh class="btn-icon" :class="{ spin: loading }" />
          Обновить
        </button>
      </div>

      <div v-if="loading && !data" class="monitoring__loading">Загрузка данных...</div>

      <template v-else-if="data">
        <div class="monitoring__section">
          <h2 class="monitoring__section-title">Кластер БД</h2>
          <div class="monitoring__grid">
            <div class="status-card">
              <div class="status-card__label">Текущий лидер</div>
              <div class="status-card__value status-card__value--primary">
                {{ data.cluster.leader }}
              </div>
              <div class="status-card__hint">Принимает запросы на запись</div>
            </div>

            <div class="status-card">
              <div class="status-card__label">Доступные реплики</div>
              <div class="status-card__value">{{ data.cluster.replicasCount }} из 2</div>
              <div class="status-card__hint">Принимают запросы на чтение</div>
            </div>

            <div
              class="status-card"
              :class="{ 'status-card--warning': data.cluster.maxReplicationLagMb > 10 }"
            >
              <div class="status-card__label">Макс. лаг репликации</div>
              <div class="status-card__value">{{ data.cluster.maxReplicationLagMb }} МБ</div>
              <div class="status-card__hint">Отставание данных на репликах</div>
            </div>

            <div
              class="status-card"
              :class="data.cluster.haproxyStatus === 'DOWN' ? 'status-card--danger' : ''"
            >
              <div class="status-card__label">HAProxy</div>
              <div class="status-card__value">{{ data.cluster.haproxyStatus }}</div>
              <div class="status-card__hint">Балансировщик нагрузки</div>
            </div>
          </div>
        </div>

        <div class="monitoring__section">
          <h2 class="monitoring__section-title">Приложение</h2>
          <div class="monitoring__grid">
            <div
              class="status-card"
              :class="data.app.health === 'DOWN' ? 'status-card--danger' : ''"
            >
              <div class="status-card__label">Состояние Backend</div>
              <div class="status-card__value">{{ data.app.health }}</div>
              <div class="status-card__hint">Версия: {{ data.app.version }}</div>
            </div>

            <div class="status-card">
              <div class="status-card__label">Время работы (Uptime)</div>
              <div class="status-card__value">{{ formatUptime(data.app.uptimeSeconds) }}</div>
              <div class="status-card__hint">Без перезагрузок</div>
            </div>

            <div class="status-card">
              <div class="status-card__label">Запросов в секунду</div>
              <div class="status-card__value">{{ data.app.httpRequestsPerSecond }}</div>
              <div class="status-card__hint">RPS (HTTP)</div>
            </div>

            <div
              class="status-card"
              :class="{ 'status-card--warning': data.app.httpAvgResponseTimeMs > 500 }"
            >
              <div class="status-card__label">Среднее время ответа</div>
              <div class="status-card__value">{{ data.app.httpAvgResponseTimeMs }} мс</div>
              <div class="status-card__hint">Норма &lt; 500 мс</div>
            </div>

            <div
              class="status-card"
              :class="{ 'status-card--danger': data.app.errorRatePercentage > 5 }"
            >
              <div class="status-card__label">Ошибки (Error Rate)</div>
              <div class="status-card__value">{{ data.app.errorRatePercentage }}%</div>
              <div class="status-card__hint">Ответы 4xx и 5xx</div>
            </div>
          </div>
        </div>

        <div class="monitoring__section">
          <h2 class="monitoring__section-title">Ресурсы</h2>
          <div class="monitoring__grid">
            <div class="status-card" :class="{ 'status-card--warning': heapPercentage > 80 }">
              <div class="status-card__label">JVM Heap Memory</div>
              <div class="status-card__value">
                {{ data.resources.jvmHeapUsedMb }} / {{ data.resources.jvmHeapMaxMb }} МБ
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" :style="{ width: heapPercentage + '%' }"></div>
              </div>
              <div class="status-card__hint">Использовано {{ heapPercentage }}%</div>
            </div>

            <div class="status-card">
              <div class="status-card__label">Загрузка CPU</div>
              <div class="status-card__value">{{ data.resources.cpuUsagePercentage }}%</div>
              <div class="status-card__hint">Загрузка процессора JVM</div>
            </div>

            <div
              class="status-card"
              :class="{ 'status-card--warning': data.resources.hikariPendingConnections > 0 }"
            >
              <div class="status-card__label">Соединения с БД (Hikari)</div>
              <div class="status-card__value">
                {{ data.resources.hikariActiveConnections }} /
                {{ data.resources.hikariMaxConnections }}
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" :style="{ width: hikariPercentage + '%' }"></div>
              </div>
              <div class="status-card__hint" v-if="data.resources.hikariPendingConnections > 0">
                Ожидают: {{ data.resources.hikariPendingConnections }}
              </div>
              <div class="status-card__hint" v-else>Нет очереди</div>
            </div>
          </div>
        </div>

        <div class="monitoring__layout">
          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Состояние узлов БД</h2>
            </div>
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Узел</th>
                    <th>Роль</th>
                    <th>Состояние</th>
                    <th>Лаг (МБ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="node in data.cluster.nodes" :key="node.name" class="table-row">
                    <td class="table-cell--mono">{{ node.name }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="node.role === 'Leader' ? 'badge--leader' : 'badge--replica'"
                      >
                        {{ node.role }}
                      </span>
                    </td>
                    <td>
                      <span class="node-state" :class="`node-state--${node.state}`">
                        {{ node.state }}
                      </span>
                    </td>
                    <td :class="{ 'text-warning': node.lagMb > 10 }">{{ node.lagMb }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Лента событий</h2>
            </div>
            <div class="panel__body events">
              <div
                v-for="event in data.events"
                :key="event.id"
                class="event"
                :class="eventClass(event.type)"
              >
                <div class="event__icon">
                  <IconAlert v-if="event.type !== 'INFO'" class="event__svg" />
                  <div v-else class="event__dot"></div>
                </div>
                <div class="event__content">
                  <div class="event__message">{{ event.message }}</div>
                  <div class="event__time">{{ formatDate(event.timestamp) }}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.monitoring {
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

.monitoring__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.monitoring__title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.monitoring__subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.monitoring__loading {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}

.btn:hover:not(:disabled) {
  background: #f8fafc;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.monitoring__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitoring__section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-left: 4px;
  border-left: 3px solid #3b82f6;
}

.monitoring__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.status-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #3b82f6;
}

.status-card--warning {
  border-left-color: #f59e0b;
}

.status-card--danger {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.status-card__label {
  font-size: 13px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.status-card__value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 8px 0 4px;
}

.status-card__value--primary {
  color: #2563eb;
}

.status-card__hint {
  font-size: 12px;
  color: #94a3b8;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.monitoring__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 1024px) {
  .monitoring__layout {
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
  padding: 8px 0;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  text-align: left;
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8fafc;
}

.table td {
  padding: 12px 20px;
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
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge--leader {
  background: #dbeafe;
  color: #1e40af;
}

.badge--replica {
  background: #f1f5f9;
  color: #64748b;
}

.node-state {
  font-size: 13px;
  font-weight: 500;
}

.node-state--running,
.node-state--streaming {
  color: #059669;
}

.node-state--stopped {
  color: #dc2626;
}

.text-warning {
  color: #d97706;
  font-weight: 600;
}

.events {
  display: flex;
  flex-direction: column;
}

.event {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.event:last-child {
  border-bottom: none;
}

.event__icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2px;
}

.event__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  margin-top: 6px;
}

.event__svg {
  width: 18px;
  height: 18px;
}

.event--critical .event__svg {
  color: #ef4444;
}
.event--warning .event__svg {
  color: #f59e0b;
}
.event--info .event__dot {
  background: #3b82f6;
}

.event__content {
  flex: 1;
}

.event__message {
  font-size: 14px;
  color: #334155;
  line-height: 1.4;
}

.event__time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}
</style>
