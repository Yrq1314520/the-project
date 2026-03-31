import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'

const service = axios.create({
  baseURL: '/api', // 对应vite代理地址
  timeout: 10000
})

// 请求拦截器：添加token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误
service.interceptors.response.use(
  (res) => res.data,
  (error) => {
    showToast(error.response?.data?.msg || '请求失败')
    // token过期：跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default service