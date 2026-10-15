const storedUser = localStorage.getItem('eam_user')
export const useAuthStore = {
  user: storedUser
    ? JSON.parse(storedUser)
    : { id: 0, username: 'Гость', fullName: 'Гость', role: 'REQUESTER' },
  logout: () => {
    localStorage.removeItem('eam_user')
    localStorage.removeItem('eam_token')
    window.location.href = '/login'
  },
}
