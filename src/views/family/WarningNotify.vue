<template>
  <div class="warning-page">
    <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
    <div class="header">
      <h2>预警通知中心</h2>
      <p class="tip">包含异常提醒与邮箱通知记录</p>
    </div>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadMore"
    >
      <van-cell-group inset v-for="item in displayList" :key="item.id">
        <van-cell :title="item.title" :desc="item.content" is-link @click="goDetail(item)">
          <template #right-icon>
            <span :class="['tag', item.type === 'email' ? 'email-tag' : 'alert-tag']">
              {{ item.type === 'email' ? '邮箱通知' : '系统预警' }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>

    <van-empty v-if="warningStore.warningList.length === 0" description="暂无预警通知" />

    <van-popup v-model:show="showDetail" position="bottom" style="height: 80%">
      <div class="detail-content">
        <h3>通知详情</h3>
        <van-cell-group v-if="currentDetail">
          <van-cell label="标题" :value="currentDetail.title" />
          <van-cell label="类型" :value="currentDetail.type === 'email' ? '邮箱通知' : '预警通知'" />
          <van-cell label="内容" :value="currentDetail.content" />
          <van-cell label="时间" :value="currentDetail.time" />
        </van-cell-group>
        <div style="padding: 20px">
          <van-button block @click="showDetail = false">关闭</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWarningStore } from '@/store/warning'

const router = useRouter()
const warningStore = useWarningStore()
const goBack = () => router.back()

const pageSize = 10
const currentPage = ref(1)
const loading = ref(false)
const finished = ref(false)

const displayList = computed(() => {
  return warningStore.warningList.slice(0, currentPage.value * pageSize)
})

const loadMore = () => {
  loading.value = true
  setTimeout(() => {
    if (displayList.value.length >= warningStore.warningList.length) {
      finished.value = true
    } else {
      currentPage.value++
    }
    loading.value = false
  }, 500)
}

const showDetail = ref(false)
const currentDetail = ref(null)

const goDetail = (item) => {
  currentDetail.value = item
  showDetail.value = true
  warningStore.markAsRead(item.id)
}
</script>

<style scoped>
.warning-page {
  padding: 16px;
  background-color: var(--bg-color);
  min-height: 100vh;
}
.header {
  margin-bottom: 16px;
}
.header h2 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
}
.tip {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}
.list-group {
  background-color: transparent;
}
.list-group .van-cell-group {
  margin-bottom: 12px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}
.tag {
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
}
.email-tag {
  background-color: #E8F4FD;
  color: var(--primary-color);
}
.alert-tag {
  background-color: #FFEFEF;
  color: var(--danger-color);
}
.detail-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}
.detail-content h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}
</style>