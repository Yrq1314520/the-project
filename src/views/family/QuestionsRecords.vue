<template>
  <div class="questions-records">
    <div class="header">
      <h2>老人问答记录</h2>
      <p class="tip">老人与智能助手的对话记录</p>
    </div>

    <!-- 老人选择器：使用原生 select 避免 Vant 组件错误 -->
    <div class="selector-wrapper">
      <label class="label">选择老人：</label>
      <select v-model="selectedElderName" @change="onSelectChange" class="select-input">
        <option v-for="name in elderOptions" :key="name" :value="name">{{ name }}</option>
      </select>
    </div>

    <!-- 手动输入老人用户ID -->
    <div class="manual-input-wrapper">
      <label class="label">老人用户ID：</label>
      <input v-model="manualUserId" type="number" placeholder="请输入老人ID" class="text-input" />
      <button class="query-btn" @click="loadByManualId">查询记录</button>
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
import { getAllQuestionsRecordsApi, getBoundEldersApi } from '@/api/family'

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const elderOptions = ref([])
const selectedElderName = ref('')
const manualUserId = ref('')
const currentUserId = ref('')

// 加载绑定老人列表（仅姓名）
const loadBoundElders = async () => {
  try {
    const res = await getBoundEldersApi()
    console.log('绑定老人接口返回:', res)
    if (res.success === 200) {
      let elders = res.data || []
      if (Array.isArray(elders) && elders.length > 0 && typeof elders[0] === 'string') {
        elderOptions.value = [...new Set(elders)]
        if (elderOptions.value.length > 0) {
          selectedElderName.value = elderOptions.value[0]
          showToast('请手动输入该老人的用户ID')
        }
      } else if (Array.isArray(elders) && elders.length > 0 && typeof elders[0] === 'object') {
        // 如果后端返回对象数组，提取姓名并提示输入ID
        elderOptions.value = elders.map(e => e.name || e.username)
        if (elderOptions.value.length > 0) {
          selectedElderName.value = elderOptions.value[0]
          showToast('请手动输入老人用户ID')
        }
      } else {
        console.warn('未预期的数据格式', elders)
      }
    } else {
      showToast(res.errorMsg || '获取绑定老人列表失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常')
  }
}

// 选择老人变化时（仅用于显示，实际查询需要手动输入ID）
const onSelectChange = () => {
  showToast(`请手动输入“${selectedElderName.value}”的用户ID`)
  manualUserId.value = ''
}

// 手动输入ID查询
const loadByManualId = () => {
  if (!manualUserId.value) {
    showToast('请输入老人用户ID')
    return
  }
  currentUserId.value = manualUserId.value
  console.log('开始查询，用户ID:', currentUserId.value)
  // 重置列表
  list.value = []
  page.value = 1
  finished.value = false
  loadMore(true)
}

// 加载问答记录
const loadMore = async (isFirst = false) => {
  if (!currentUserId.value) {
    console.warn('currentUserId 为空，无法加载')
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
      elderUserId: currentUserId.value  
    }
    console.log('请求参数:', params)
    const res = await getAllQuestionsRecordsApi(params)
    console.log('问答记录响应:', res)
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
  loadBoundElders()
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
.selector-wrapper,
.manual-input-wrapper {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 12px;
  border-radius: 12px;
}
.label {
  font-size: 14px;
  color: #333;
  width: 80px;
}
.select-input,
.text-input {
  flex: 1;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}
.query-btn {
  background: #3B7C9E;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
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