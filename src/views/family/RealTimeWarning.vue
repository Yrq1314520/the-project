<template>
  <div class="real-warning-page">
    <div class="header">
      <h2>实时预警接收</h2>
      <p class="tip">设备异常 → 实时推送到家属端</p>
      <div class="status-tag" :class="wsConnected ? 'online' : 'offline'">
        {{ wsConnected ? '已连接 · 实时接收中' : '断开连接 · 重连中' }}
      </div>
    </div>

    <van-cell-group inset v-for="item in warningList" :key="item.id">
      <van-cell :title="item.title" :desc="item.content" is-link @click="openDetail(item)">
        <template #right-icon>
          <span class="real-tag">实时预警</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-empty v-if="warningList.length === 0" description="暂无实时预警" />

    <van-popup v-model:show="showDetail" position="bottom" style="height: 70%">
      <div class="detail">
        <h3>预警详情</h3>
        <van-cell-group v-if="currentDetail">
          <van-cell title="标题" :value="currentDetail.title" />
          <van-cell title="内容" :value="currentDetail.content" />
          <van-cell title="时间" :value="currentDetail.time" />
        </van-cell-group>
        <van-button block @click="showDetail = false">关闭</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { useWebSocket } from '@/utils/websocket'

const warningList = ref([])
const wsConnected = ref(false)
const showDetail = ref(false)
const currentDetail = ref(null)
let ws = null

const onMessage = (data) => {
  wsConnected.value = true
  warningList.value.unshift({
    id: Date.now(),
    title: data.title,
    content: data.content,
    time: new Date().toLocaleString()
  })
  showToast(`实时预警：${data.title}`)
}

onMounted(() => {
  ws = useWebSocket('ws://localhost:8080/warning', onMessage)
})

onUnmounted(() => {
  ws?.close()
})

const openDetail = (item) => {
  currentDetail.value = item
  showDetail.value = true
}
</script>

<style scoped>
.real-warning-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
.header { margin-bottom: 16px; }
.header h2 { margin: 0 0 6px; }
.tip { font-size: 14px; color: #666; margin: 0 0 8px; }
.status-tag { font-size: 12px; padding: 2px 8px; border-radius: 12px; }
.online { background: #e6f7ff; color: #1890ff; }
.offline { background: #fff2f0; color: #ff4d4f; }
.real-tag { background: #ff4d4f; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.detail { padding: 20px; }
</style>