import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    const data = res.data
    if (data && typeof data.success !== 'undefined') {
      data.code = data.success
      data.msg = data.errorMsg || (data.success === 200 ? '成功' : '失败')
    }
    return data
  },
  (error) => {
    const msg = error.response?.data?.errorMsg || error.response?.data?.msg || '请求失败'
    showToast(msg)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default service