import { defineStore } from 'pinia'

/** 用户信息结构 */
export interface UserInfo {
  id?: number
  userId?: number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
  role?: number
  elderInfoId?: number
  elderId?: number
  [key: string]: any
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}') as UserInfo,
  }),

  actions: {
    // 登录成功保存信息
    setLoginInfo(token: string, userInfo: UserInfo) {
      this.token = token
      // 保存用户信息（包含用户名、头像、邮箱等信息）
      this.userInfo = userInfo
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    // 注销
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
