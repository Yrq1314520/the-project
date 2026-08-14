import { ref, type Ref } from 'vue'
import { Notify } from 'vant'

/** Notify 可调用选项 */
interface NotifyOptions {
  type?: 'primary' | 'success' | 'warning' | 'danger'
  message?: string
  duration?: number
  onClick?: () => void
}

// Vant 的 Notify 运行时是可调用函数，但 TS 类型定义将其标记为组件
const showNotify = Notify as unknown as (options: NotifyOptions) => void

/** WebSocket 推送的消息结构 */
export interface WsMessage {
  type?: string
  content?: string
  elderName?: string
  elderId?: number | string
  eventId?: string | number
  time?: string
  raw?: string
  [key: string]: any
}

/** 消息处理回调类型 */
type MessageHandler = (data: WsMessage) => void

class WebSocketManager {
  private socket: WebSocket | null = null
  private isConnected: Ref<boolean> = ref(false)
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectInterval = 3000
  private url: string | null = null
  private token: string | null = null
  private messageHandlers = new Set<MessageHandler>()
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  init(url: string, token: string | null): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }
    this.url = url
    this.token = token
    this.connect()
  }

  private connect(): void {
    if (!this.url) {
      console.error('WebSocket url missing')
      return
    }

    const wsUrl = this.token ? `${this.url}?token=${this.token}` : this.url
    console.log('Connecting WebSocket to', wsUrl)
    this.socket = new WebSocket(wsUrl)

    this.socket.onopen = () => {
      console.log('WebSocket 连接成功')
      this.isConnected.value = true
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.socket.onmessage = (event: MessageEvent) => {
      let data: WsMessage
      try {
        data = JSON.parse(event.data)
        console.log('收到消息:', data)
      } catch (e) {
        console.warn('解析消息失败，作为原始文本处理:', event.data)
        data = { raw: event.data }
      }

      try {
        this.messageHandlers.forEach(handler => handler(data))
      } catch (handlerErr) {
        console.error('消息订阅处理错误:', handlerErr)
      }

      const isEmergency = data.type && (data.type.includes('emergency') || data.type === 'warning')
      if (isEmergency) {
        try {
          const elderName = data.elderName || '老人'
          const content = data.content || '紧急预警'
          showNotify({
            type: 'warning',
            message: `【${elderName}】${content}`,
            duration: 5000,
            onClick: () => {
              window.location.href = '/family/warning'
            }
          })
        } catch (notifyErr) {
          console.error('Notify 调用失败:', notifyErr)
        }
      }
    }

    this.socket.onerror = (err: Event) => {
      console.error('WebSocket 错误', err)
    }

    this.socket.onclose = (event: CloseEvent) => {
      console.log('WebSocket 关闭', event.code, event.reason)
      this.isConnected.value = false
      this.stopHeartbeat()
      this.socket = null
      if (event.code !== 1000) {
        this.scheduleReconnect()
      }
    }
  }

  send(data: any): void {
    if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  close(): void {
    this.stopHeartbeat()
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.socket) {
      this.socket.close(1000, '主动关闭')
      this.socket = null
    }
    this.isConnected.value = false
    this.reconnectAttempts = 0
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket 重连次数已达上限，停止重连')
      try {
        showNotify({ type: 'danger', message: '预警服务连接失败，请刷新页面重试', duration: 3000 })
      } catch (e) { /* 忽略 */ }
      return
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`WebSocket 第 ${this.reconnectAttempts} 次重连...`)
      this.connect()
    }, this.reconnectInterval)
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected.value && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
        console.log('发送心跳 ping')
      }
    }, 30000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

export const wsManager = new WebSocketManager()
