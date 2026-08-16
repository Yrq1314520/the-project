<template>
  <div id="app">
    <transition name="slide-up" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { wsManager } from '@/utils/websocketManager'
import { useWarningStore } from '@/store/warning'

const userStore = useUserStore()
const warningStore = useWarningStore()
let unsubscribe: (() => void) | null = null

onMounted(() => {
  const token = userStore.token   
  const wsUrl = 'ws://118.195.215.81/yiguardsilverfa/api/ws/warning'

  if (token) {
    // 将 token 作为子协议传入
    wsManager.init(wsUrl, token)
  } else {
    console.warn('未获取到 token，WebSocket 可能无法认证')
    // 仍然尝试连接但不传 token
    wsManager.init(wsUrl, null)
  }

  unsubscribe = wsManager.subscribe((message) => {
  console.log('App 收到消息:', message)   
  warningStore.addWarning(message)
})
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(-10%);
  opacity: 0;
}
</style>