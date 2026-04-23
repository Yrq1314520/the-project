<template>
  <div id="app">
    <transition name="slide-up" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { wsManager } from '@/utils/websocketManager'
import { useWarningStore } from '@/store/warning'

const userStore = useUserStore()
const warningStore = useWarningStore()

let unsubscribe = null

onMounted(() => {
  const token = userStore.token  
  if (token) {
    wsManager.init('ws://118.195.215.81/yiguardsilverfa/ws/warning', token)
    // 消息存入store
    unsubscribe = wsManager.subscribe((message) => {
      if (message.type === 'warning' || message.isEmergency) {
        warningStore.addWarning({
          title: message.title || '紧急预警',
          content: message.content || '请及时查看',
          type: 'alert'
        })
      }
    })
  }
})

onUnmounted(() => {
  //页面注销关闭
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