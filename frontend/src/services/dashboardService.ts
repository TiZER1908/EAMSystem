import { type Component } from 'vue'
import IconAssets from '@/assets/icons/assets.svg?component'
import IconRequests from '@/assets/icons/requests.svg?component'
import IconWorkOrders from '@/assets/icons/work-orders.svg?component'
import IconAlert from '@/assets/icons/alert.svg?component'

export interface KpiCard {
  id: string
  label: string
  value: number
  subtitle: string
  icon: Component
  color: 'blue' | 'orange' | 'green' | 'red'
  roles: string[]
}

export interface RecentRequest {
  id: number
  asset: string
  author: string
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  time: string
}

export interface EventItem {
  id: number
  icon: string
  text: string
  time: string
  type: 'success' | 'info' | 'warning' | 'error'
}

export interface SystemStatusItem {
  name: string
  status: 'up' | 'warning' | 'down'
  value: string
}

export const dashboardService = {
  async getKpiCards(): Promise<KpiCard[]> {
    // return api.get('/dashboard/kpi')
    await new Promise((r) => setTimeout(r, 200))

    return [
      {
        id: 'assets',
        label: 'Активы',
        value: 247,
        subtitle: 'всего на балансе',
        icon: IconAssets,
        color: 'blue',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN'],
      },
      {
        id: 'requests',
        label: 'Открытые заявки',
        value: 12,
        subtitle: 'ожидают обработки',
        icon: IconRequests,
        color: 'orange',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN', 'REQUESTER'],
      },
      {
        id: 'work-orders',
        label: 'Наряды в работе',
        value: 8,
        subtitle: 'выполняются сейчас',
        icon: IconWorkOrders,
        color: 'green',
        roles: ['ADMIN', 'MASTER', 'TECHNICIAN'],
      },
      {
        id: 'overdue',
        label: 'Просрочено',
        value: 3,
        subtitle: 'требуют внимания',
        icon: IconAlert,
        color: 'red',
        roles: ['ADMIN', 'MASTER'],
      },
    ]
  },

  async getRecentRequests(): Promise<RecentRequest[]> {
    // return api.get('/requests?limit=5')
    await new Promise((r) => setTimeout(r, 200))

    return [
      {
        id: 42,
        asset: 'Станок ЧПУ-3',
        author: 'Петров П.',
        status: 'NEW',
        priority: 'HIGH',
        time: '5 мин назад',
      },
      {
        id: 41,
        asset: 'Компрессор К-1',
        author: 'Сидоров С.',
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        time: '1 час назад',
      },
      {
        id: 40,
        asset: 'Сервер Dell R740',
        author: 'Иванов И.',
        status: 'NEW',
        priority: 'HIGH',
        time: '2 часа назад',
      },
      {
        id: 39,
        asset: 'Конвейер Л-2',
        author: 'Кузнецов К.',
        status: 'CLOSED',
        priority: 'LOW',
        time: '3 часа назад',
      },
      {
        id: 38,
        asset: 'Насос Н-5',
        author: 'Морозов М.',
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        time: 'вчера',
      },
    ]
  },

  async getEvents(): Promise<EventItem[]> {
    // return api.get('/dashboard/events')
    await new Promise((r) => setTimeout(r, 200))

    return [
      {
        id: 1,
        icon: '',
        text: 'Иванов закрыл наряд №42 (Станок ЧПУ-3)',
        time: '10 мин назад',
        type: 'success',
      },
      {
        id: 2,
        icon: '',
        text: 'Петров подал заявку на ремонт (Компрессор К-1)',
        time: '25 мин назад',
        type: 'info',
      },
      {
        id: 3,
        icon: '',
        text: 'Failover кластера БД выполнен успешно',
        time: '1 час назад',
        type: 'warning',
      },
      {
        id: 4,
        icon: '',
        text: 'Добавлен новый пользователь: master2',
        time: '2 часа назад',
        type: 'info',
      },
      {
        id: 5,
        icon: '',
        text: 'Списано 2 шт. запчасти "Подшипник 6204"',
        time: '3 часа назад',
        type: 'info',
      },
    ]
  },

  async getSystemStatus(): Promise<SystemStatusItem[]> {
    // return api.get('/monitoring/status')
    await new Promise((r) => setTimeout(r, 200))

    return [
      { name: 'Backend Spring Boot', status: 'up', value: 'работает' },
      { name: 'Кластер PostgreSQL', status: 'up', value: '3/3 узла' },
      { name: 'HAProxy', status: 'up', value: 'активен' },
      { name: 'Лаг репликации', status: 'warning', value: '12 МБ' },
    ]
  },
}
