<template>
  <div class="questions-records">
    <div class="header">
      <h2>老人问答记录</h2>
      <p class="tip">老人与智能助手的对话记录</p>
    </div>

    <!-- 问答记录列表 -->
    <div v-if="list.length === 0 && !loading" class="empty-tip">暂无问答记录</div>
    <div v-for="record in list" :key="record.id" class="record-card">
      <div class="record-header">
        <span>{{ record.time }}</span>
        <span class="record-type">提问</span>
      </div>
      <div class="record-question">问：{{ record.question }}</div>
      <div class="record-answer" v-if="record.answer">答：{{ record.answer }}</div>
      <div class="record-answer" v-else>暂无回复</div>
    </div>
    <div v-if="loading" class="loading-tip">加载中...</div>
    <div v-if="finished && list.length > 0" class="finished-tip">没有更多记录了</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { getAllQuestionsRecordsApi } from '@/api/family'

const props = defineProps({
  userId: {
    type: [String, Number],
    default: ''
  }
})

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

// 加载问答记录
const loadMore = async (isFirst = false) => {
  if (!props.userId) {
    finished.value = true
    return
  }
  if (loading.value) return
  if (finished.value && !isFirst) return

  loading.value = true
  try {
    const params = {
      page: page.value,
      size: pageSize,
      userId: props.userId   // 使用传入的 userId
    }
    const res = await getAllQuestionsRecordsApi(params)
    if (res.code === 200) {
      const newList = res.data?.list || []
      list.value.push(...newList)
      if (newList.length < pageSize) {
        finished.value = true
      } else {
        page.value++
      }
    } else {
      showToast(res.msg || '加载失败')
      finished.value = true
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常，请重试')
    finished.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.userId) {
    loadMore(true)
  }
})
</script>

<style scoped>
.questions-records {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
.header {
  margin-bottom: 20px;
}
.header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px;
}
.tip {
  font-size: 14px;
  color: #666;
  margin: 0;
}
.record-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
}
.record-type {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 12px;
}
.record-question,
.record-answer {
  font-size: 14px;
  line-height: 1.5;
  margin-top: 8px;
  color: #333;
}
.empty-tip,
.loading-tip,
.finished-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>