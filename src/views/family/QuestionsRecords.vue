<template>
  <div class="questions-records">
    <div class="header">
      <h2>老人问答记录</h2>
      <p class="tip">老人与智能助手的对话记录</p>
    </div>

    <div class="filter-bar">
      <div class="date-selector" @click="showPicker = true">
        <span class="label">日期</span>
        <span class="value">{{ selectedDateText || '全部' }}</span>
        <van-icon name="arrow-down" />
      </div>
      <van-button v-if="selectedDateText" size="small" type="default" @click="clearDateFilter">清除</van-button>
    </div>

    <van-popup v-model:show="showPicker" position="bottom" round>
      <van-picker :columns="dateOptions" title="选择日期" @confirm="onDateConfirm" @cancel="showPicker = false" />
    </van-popup>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多记录了"
      @load="loadMore"
      :immediate-check="false"
    >
      <div v-for="(group, dateStr) in groupedList" :key="dateStr">
        <div class="date-group-title">{{ dateStr }}</div>
        <div v-for="record in group" :key="record.id" class="record-card">
          <div class="record-header">
            <span>{{ formatTime(record.askTime) }}</span>
            <span class="record-type">提问</span>
          </div>
          <div class="record-question">问：{{ record.question }}</div>
          <div class="record-answer" v-if="record.answer">答：{{ record.answer }}</div>
          <div class="record-answer" v-else>暂无回复</div>
        </div>
      </div>
      <div v-if="list.length === 0 && !loading" class="empty-tip">暂无问答记录</div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { showToast, List as VanList, Icon as VanIcon, Button as VanButton, Popup as VanPopup, Picker as VanPicker } from 'vant'
import { getAllQuestionsRecordsApi } from '@/api/family'

const props = defineProps({
  elderId: { type: [String, Number], default: '' }
})

const list = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const showPicker = ref(false)
const selectedDate = ref<any>(null)
const selectedDateText = ref('')

const dateOptions = computed(() => {
  const options: any[] = [{ text: '全部', value: null }]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    let text = ''
    if (i === 0) text = '今天'
    else if (i === 1) text = '昨天'
    else text = `${date.getMonth() + 1}月${date.getDate()}日`
    options.push({ text, value: date })
  }
  return options
})

const clearDateFilter = () => {
  selectedDate.value = null
  selectedDateText.value = ''
  resetAndReload()
}

const onDateConfirm = ({ selectedOptions }: any) => {
  const option = selectedOptions[0]
  selectedDate.value = option.value
  selectedDateText.value = option.text === '全部' ? '' : option.text
  showPicker.value = false
  resetAndReload()
}

const formatTime = (askTime: any) => {
  if (!askTime || !Array.isArray(askTime) || askTime.length < 5) return ''
  const [, , , hour, minute] = askTime
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const parseAskTime = (askTime: any) => {
  if (!askTime || !Array.isArray(askTime) || askTime.length < 6) return new Date(0)
  const [year, month, day, hour, minute, second = 0] = askTime
  return new Date(year, month - 1, day, hour, minute, second)
}

const isSameDay = (date1: any, date2: any) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const getDateGroupTitle = (date: any) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, today)) return '今天'
  if (isSameDay(date, yesterday)) return '昨天'
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const groupedList = computed(() => {
  const sortedList = [...list.value].sort((a: any, b: any) => {
    const timeA = parseAskTime(a.askTime)
    const timeB = parseAskTime(b.askTime)
    return timeB.getTime() - timeA.getTime()
  })
  const groups: Record<string, any[]> = {}
  sortedList.forEach((record: any) => {
    const date = parseAskTime(record.askTime)
    const title = getDateGroupTitle(date)
    if (!groups[title]) groups[title] = []
    groups[title].push(record)
  })
  return groups
})

const resetAndReload = () => {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = false
  loadMore()
}

const loadMore = async () => {
  if (!props.elderId) {
    finished.value = true
    return
  }
  if (loading.value || finished.value) return

  loading.value = true
  try {
    const params: Record<string, any> = {
      page: page.value,
      size: pageSize,
      elderId: props.elderId
    }
    if (selectedDate.value) {
      const date = selectedDate.value
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      params.startTime = `${year}-${month}-${day} 00:00:00`
      params.endTime = `${year}-${month}-${day} 23:59:59`
    }

    const res = await getAllQuestionsRecordsApi(params)
    if (res.code === 200 || res.success === 200) {
      let newList: any[] = []

      if (Array.isArray(res.data)) {
        newList = res.data
        finished.value = true
      } else if (res.data && Array.isArray(res.data.list)) {
        newList = res.data.list
        if (newList.length < pageSize) finished.value = true
        else page.value++
      } else {
        newList = []
        finished.value = true
      }
      list.value.push(...newList)
      if (list.value.length === 0) finished.value = true
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

watch(() => props.elderId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) resetAndReload()
})

onMounted(() => {
  if (props.elderId) loadMore()
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
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.date-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}
.date-selector .label {
  font-size: 14px;
  color: #666;
}
.date-selector .value {
  font-size: 14px;
  color: #1989fa;
  font-weight: 500;
}
.date-group-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 16px 0 8px 0;
  padding-left: 4px;
  border-left: 3px solid #1989fa;
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
.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>