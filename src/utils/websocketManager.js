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

  //初始化连接
  init(url, token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }
    this.url = url
    this.token = token
    this.connect()
  }

  connect() {
    if (!this.url || !this.token) {
      console.error('WebSocket url or token missing')
      return
    }
    const wsUrl = `${this.url}?token=${this.token}`
    this.socket = new WebSocket(wsUrl)

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
      } catch (e) {
        data = { raw: event.data }
      }
      this.messageHandlers.forEach(handler => handler(data))
      if (data.type === 'warning' || data.isEmergency) {
        Notify({
          type: 'warning',
          message: data.title || '紧急预警',
          duration: 5000,
          onClick: () => {
            //跳转到预警中心
            window.location.href = '/family/warning'
          }
        })
      }
    }

    this.socket.onerror = (err) => {
      console.error('WebSocket 错误', err)
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket 关闭', event.code, event.reason)
      this.isConnected.value = false
      this.stopHeartbeat()
      this.socket = null
      this.scheduleReconnect()
    }
  }

  // 发送消息
  send(data) {
    if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  // 订阅消息
  subscribe(handler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  // 关闭
  close() {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.isConnected.value = false
    this.reconnectAttempts = 0
  }

  // 重连
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket 重连次数已达上限')
      return
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`WebSocket 第 ${this.reconnectAttempts} 次重连...`)
      this.connect()
    }, this.reconnectInterval)
  }

  // 防止连接被断开
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
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