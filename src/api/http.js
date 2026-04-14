import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(
  (config) => {
    config.headers['X-Request-Id'] = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      '请求失败'
    if (!error.config?.silent) {
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  },
)

export default http
