let ws = null
export function initWs(userId) {
  // 后端WebSocket地址
  ws = new WebSocket(`ws://localhost:8080/ws/${userId}`)

  ws.onmessage = (e) => {
    // 接收后端预警数据，可触发全局提示/存储
    const data = JSON.parse(e.data)
    console.log('收到预警：', data)
  }

  ws.onclose = () => {
    // 重连逻辑：3秒后重连
    setTimeout(() => initWs(userId), 3000)
  }
}

export function closeWs() {
  ws?.close()
}