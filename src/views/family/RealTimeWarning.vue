<template>
  <div class="real-warning-page">
    <div class="header">
      <h2>实时预警接收</h2>
      <p class="tip">设备异常 → 实时推送到家属端</p>
      <div class="status-tag" :class="wsManager.isConnected.value ? 'online' : 'offline'">
        {{ wsManager.isConnected.value ? '已连接 · 实时接收中' : '断开连接 · 重连中' }}
      </div>
    </div>

    <van-cell-group inset v-for="item in warningStore.warningList" :key="item.id">
      <van-cell :title="item.title" :desc="item.content" is-link @click="openDetail(item)">
        <template #right-icon>
          <span class="real-tag">实时预警</span>
        </template>
      </van-cell>
    </van-cell-group>

    <van-empty v-if="warningStore.warningList.length === 0" description="暂无实时预警" />

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

<script setup lang="ts">
import { ref } from 'vue'
import { wsManager } from '@/utils/websocketManager'
import { useWarningStore } from '@/store/warning'

const warningStore = useWarningStore()
const showDetail = ref(false)
const currentDetail = ref<Record<string, any> | null>(null)

const openDetail = (item: any) => {
  currentDetail.value = item
  showDetail.value = true
  warningStore.markAsRead(item.id)
}
</script>


<style scoped>
.real-warning-page {
  padding: 16px;
  background: var(--bg-color);
  min-height: 100vh;
}
.header {
  margin-bottom: 16px;
}
.header h2 {
  margin: 0 0 6px;
}
.tip {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 8px;
}
.status-tag {
  display: inline-block;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 30px;
  font-weight: 600;
}
.online {
  background: #e0f2e9;
  color: #2e7d64;
}
.offline {
  background: #fff2f0;
  color: #ff4d4f;
}
.real-tag {
  background: var(--danger-color);
  color: #fff;
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
}
.detail {
  padding: 20px;
}
</style>