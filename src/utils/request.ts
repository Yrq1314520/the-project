import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse
} from 'axios'
import { showToast } from 'vant'
import router from '@/router'

/** 后端统一响应结构 */
export interface ResponseData<T = any> {
  success?: number
  errorMsg?: string
  code?: number
  msg?: string
  data?: T
  [key: string]: any
}

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
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

/**
 * 发送请求（响应拦截器已将返回值改为 res.data）
 * @param config axios 请求配置
 * @returns Promise<T>，默认 T = ResponseData
 */
function request<T = ResponseData>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as unknown as Promise<T>
}

export default request
