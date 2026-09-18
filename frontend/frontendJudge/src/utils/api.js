import axios from 'axios'
import { store } from './appStore'
import { logout } from './authSlice'

// Shared axios instance: attaches the JWT from the Redux store to every request
// and clears the session when the API rejects the token.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const { token } = store.getState().auth
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 from an authenticated session means the token is invalid/expired.
    // Logging out flips isAuthenticated, so ProtectedRoute redirects on its own.
    if (error.response?.status === 401 && store.getState().auth.isAuthenticated) {
      store.dispatch(logout())
    }
    return Promise.reject(error)
  }
)

export default api
