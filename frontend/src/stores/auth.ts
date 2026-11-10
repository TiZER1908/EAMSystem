import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id?: number
  username: string
  fullName: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const storedUser = localStorage.getItem('eam_user')
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null)

  const token = ref<string | null>(localStorage.getItem('eam_token'))

  const isAuthenticated = computed(() => !!token.value)
  const role = computed(() => user.value?.role || 'REQUESTER')
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isMaster = computed(() => role.value === 'MASTER')
  const isTechnician = computed(() => role.value === 'TECHNICIAN')
  const isRequester = computed(() => role.value === 'REQUESTER')

  function setAuth(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser

    localStorage.setItem('eam_token', newToken)
    localStorage.setItem('eam_user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = null
    user.value = null

    localStorage.removeItem('eam_token')
    localStorage.removeItem('eam_user')

    window.location.href = '/login'
  }

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin,
    isMaster,
    isTechnician,
    isRequester,
    setAuth,
    logout,
  }
})
