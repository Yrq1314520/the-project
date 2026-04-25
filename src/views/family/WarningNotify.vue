<template>
  <div class="warning-page">
    <div class="header">
      <van-button icon="arrow-left" type="default" size="small" plain @click="goBack" class="back-btn">
        返回
      </van-button>
      <h2>预警通知中心</h2>
      <p class="tip">老人与智能助手的紧急求助</p>
    </div>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadMore"
      class="warning-list"
    >
      <div v-if="displayList.length === 0 && !loading" class="empty-tip">暂无预警通知</div>
      <div
        v-for="item in displayList"
        :key="item.id"
        class="warning-card"
        :class="{ 'unread': !item.isRead }"
        @click="markAsReadAndScroll(item)"
      >
        <div class="card-icon" :class="item.type === 'alert' ? 'alert-icon' : 'email-icon'">
          <van-icon :name="item.type === 'alert' ? 'warning' : 'envelop-o'" size="24" />
        </div>
        <div class="card-content">
          <div class="card-header">
            <div class="title-wrapper">
              <span class="title">{{ item.title }}</span>
              <span v-if="!item.isRead" class="unread-badge">新</span>
            </div>
            <span class="type-tag" :class="item.type === 'alert' ? 'tag-alert' : 'tag-email'">
              {{ item.type === 'alert' ? '系统预警' : '邮箱通知' }}
            </span>
          </div>
          <div class="content-text">{{ item.content }}</div>
          <div class="time">{{ item.time }}</div>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useWarningStore } from '@/store/warning'

const router = useRouter()
const warningStore = useWarningStore()
const goBack = () => router.back()

// 分页配置
const pageSize = 10
const currentPage = ref(1)
const loading = ref(false)
const finished = ref(false)

// 当前显示列表
const displayList = computed(() => {
  return warningStore.warningList.slice(0, currentPage.value * pageSize)
})

// 加载更多
const loadMore = () => {
  if (loading.value || finished.value) return
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


const markAsReadAndScroll = (item) => {
  if (!item.isRead) {
    warningStore.markAsRead(item.id)
  }
}
</script>

<style scoped>
.warning-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 16px;
}

.header {
  margin-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  border: none;
  background: transparent;
  color: #5a6e7a;
  font-size: 14px;
}

.header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e4e;
  margin: 8px 0 4px;
}

.tip {
  font-size: 14px;
  color: #7e8c8d;
  margin-top: 4px;
}

.warning-list {
  margin-top: 8px;
}

.warning-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
  cursor: pointer;
  border-left: 4px solid transparent;
}

.warning-card.unread {
  border-left-color: #e76f51;
  background-color: #fffbf8;
}

.card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.alert-icon {
  background-color: #ffe8e4;
  color: #e76f51;
}

.email-icon {
  background-color: #e8f0fe;
  color: #4a7c59;
}

.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2c3a;
}

.unread-badge {
  background-color: #e76f51;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.type-tag {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 30px;
  font-weight: 500;
}

.tag-alert {
  background-color: #fdede9;
  color: #b84a2c;
}

.tag-email {
  background-color: #e0f0e5;
  color: #2d6a4f;
}

.content-text {
  font-size: 14px;
  color: #4b5e6c;
  line-height: 1.5;
  margin: 8px 0;
  word-break: break-word;
}

.time {
  font-size: 12px;
  color: #9aaebf;
  margin-top: 8px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #9aaebf;
  font-size: 14px;
}


:deep(.van-list__finished-text),
:deep(.van-list__loading) {
  color: #9aaebf;
  padding: 16px;
}
</style>