import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    oldmanInfo: null // 绑定的老人信息
  }),
  actions: {
    // 保存登录信息
    setLoginInfo(token, userInfo) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = {}
      this.oldmanInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})