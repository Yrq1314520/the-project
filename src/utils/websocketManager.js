import { ref } from 'vue'
import { Notify } from 'vant'

class WebSocketManager {
  constructor() {
    this.socket = null
    this.isConnected = ref(false)
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectInterval = 3000
    this.url = null
    this.token = null
    this.messageHandlers = new Set()
    this.heartbeatTimer = null
  }

  // 初始化连接，传入 token
  init(url, token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }
    this.url = url
    this.token = token
    this.connect()
  }

  // 建立 WebSocket 连接
  connect() {
    if (!this.url) {
      console.error('WebSocket url missing')
      return
    }

    // 将 token 作为子协议传递
    let protocols = undefined
    if (this.token) {
      protocols = [this.token]   // token 放在子协议数组
      console.log('Connecting WebSocket with token as subprotocol')
    } else {
      console.log('Connecting WebSocket without token')
    }

    this.socket = new WebSocket(this.url, protocols)

    this.socket.onopen = () => {
      console.log('WebSocket 连接成功')
      this.isConnected.value = true
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.socket.onmessage = (event) => {
      let data
      try {
        data = JSON.parse(event.data)
        console.log('收到消息:', data)
      } catch (e) {
        console.warn('解析失败:', event.data)
        data = { raw: event.data }
      }
      this.messageHandlers.forEach(handler => handler(data))

      // 紧急预警全局通知
      const isEmergency = data.type && (data.type.includes('emergency') || data.type === 'warning')
      if (isEmergency) {
        const elderName = data.elderName || '老人'
        const content = data.content || '紧急预警'
        Notify({
          type: 'warning',
          message: `【${elderName}】${content}`,
          duration: 5000,
          onClick: () => {
            window.location.href = '/family/warning'
          }
        })
      }
    }

    this.socket.onerror = (err) => {
      console.error('WebSocket 错误', err)
      if (this.socket) console.log('readyState:', this.socket.readyState)
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket 关闭', event.code, event.reason)
      this.isConnected.value = false
      this.stopHeartbeat()
      this.socket = null
      if (event.code !== 1000) {
        this.scheduleReconnect()
      }
    }
  }

  send(data) {
    if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  subscribe(handler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  close() {
    this.stopHeartbeat()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.socket) {
      this.socket.close(1000, '主动关闭')
      this.socket = null
    }
    this.isConnected.value = false
    this.reconnectAttempts = 0
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket 重连次数已达上限，停止重连')
      Notify({
        type: 'danger',
        message: '预警服务连接失败，请刷新页面重试',
        duration: 3000
      })
      return
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`WebSocket 第 ${this.reconnectAttempts} 次重连...`)
      this.connect()
    }, this.reconnectInterval)
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
        console.log('发送心跳 ping')
      }
    }, 30000)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

export const wsManager = new WebSocketManager()