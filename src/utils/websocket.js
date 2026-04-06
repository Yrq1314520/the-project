// WebSocket 连接工具
//连接 WebSocket 服务器，处理消息接收和发送
export const useWebSocket = (url, onMessageCallback) => {
  let socket = null
  let isConnected = false
  const reconnectInterval = 3000 //3秒重新连

  //连接
  const connect = () => {
    socket = new WebSocket(url)

    socket.onopen = () => {
      console.log('WebSocket 连接成功')
      isConnected = true
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessageCallback(data) //收到消息时调用外部回调
    }

    socket.onerror = (err) => {
      console.error('WebSocket 连接错误', err)
    }

    socket.onclose = () => {
      console.log('WebSocket 连接关闭')
      isConnected = false
      setTimeout(connect, reconnectInterval) //自动重连
    }
  }

  //发送消息
  const send = (data) => {
    if (isConnected && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data))
    }
  }

  //关闭连接
  const close = () => {
    if (socket) {
      socket.close()
    }
  }

  connect()
  return { send, close }
}