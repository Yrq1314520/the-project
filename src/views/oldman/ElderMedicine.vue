<template>
  <div class="elder-reminder-panel">
    <!-- 统计卡片 -->
    <div v-if="statistics" class="statistics-card">
      <div class="stat-title">📊 本周服药统计</div>
      <div class="stat-content">
        <div class="stat-item">
          <span class="stat-value">{{ statistics.totalDays || 0 }}</span>
          <span class="stat-label">统计天数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ statistics.takenTimes || 0 }}</span>
          <span class="stat-label">已服次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ statistics.missedTimes || 0 }}</span>
          <span class="stat-label">漏服次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ statistics.complianceRate || 0 }}%</span>
          <span class="stat-label">依从率</span>
        </div>
      </div>
    </div>

    <!-- 今日用药提醒标题栏 -->
    <div class="reminder-header">
      <div class="section-title-small">
        <van-icon name="clock-o" size="20" />
        <span>今日用药提醒</span>
      </div>
      <van-button size="normal" type="success" plain round @click="openReminderManage">
        管理
      </van-button>
    </div>

    <!-- 今日提醒列表 -->
    <div class="reminder-list">
      <div
        v-for="record in recordList"
        :key="record.id"
        class="reminder-item"
      >
        <div class="reminder-info">
          <div class="drug-name">{{ record.medicineName }}</div>
          <div class="drug-detail-row">
            <span class="detail-label">剂量：</span>{{ record.dosage || '—' }}
            <span class="detail-label">用法：</span>{{ record.usage || '—' }}
          </div>
          <div class="drug-time-row">
            <van-icon name="clock-o" size="14" />
            <span>{{ formatRemindTime(record.remindTime) }}</span>
            <span class="detail-label">周期：</span>
            <span>{{ formatRemindDays(record.remindDays) }}</span>
          </div>
        </div>
        <van-tag
          :type="record.taken ? 'success' : 'warning'"
          plain
          size="medium"
          @click.stop="handleTakeMedicine(record)"
        >
          {{ record.taken ? '已服用' : '未服用' }}
        </van-tag>
      </div>
      <div v-if="recordList.length === 0 && !recordsLoading" class="empty-tip">
        今日暂无用药提醒
      </div>
      <div v-if="recordsLoading" class="loading-tip">
        <van-loading size="20px" /> 加载中...
      </div>
    </div>

    <!-- 提醒管理弹窗 -->
    <van-popup v-model:show="showReminderDialog" position="bottom" round style="height: 85%">
      <div class="reminder-manage">
        <div class="manage-header">
          <h3>用药提醒管理</h3>
          <van-button type="primary" size="small" round @click="openAddReminder">+ 添加提醒</van-button>
        </div>
        <div class="reminder-manage-list">
          <div v-for="item in allReminders" :key="item.id" class="reminder-manage-item">
            <div class="reminder-manage-info">
              <div class="reminder-name">{{ item.medicineName }}</div>
              <div class="reminder-detail">
                <span>剂量：{{ item.dosage || '—' }}</span>
                <span>用法：{{ item.usage || '—' }}</span>
                <span>时间：{{ formatRemindTime(item.remindTime) }}</span>
                <span>周期：{{ formatRemindDays(item.remindDays) }}</span>
              </div>
            </div>
            <div class="reminder-manage-actions">
              <van-button size="small" type="primary" plain @click="openEditReminder(item)">编辑</van-button>
              <van-button size="small" type="danger" plain @click="deleteReminder(item)">删除</van-button>
            </div>
          </div>
          <div v-if="allReminders.length === 0" class="empty-tip">暂无提醒，点击上方添加</div>
        </div>
      </div>
    </van-popup>

    <!-- 添加/编辑提醒表单弹窗 -->
    <van-popup v-model:show="showFormDialog" position="bottom" round style="height: 85%">
      <div class="form-content">
        <h3>{{ isEdit ? '编辑提醒' : '添加提醒' }}</h3>
        <van-form @submit="onSubmitReminder">
          <van-field v-model="reminderForm.medicineName" label="药品名称" required />
          <van-field v-model="reminderForm.dosage" label="剂量" placeholder="如：1片" required />
          <van-field v-model="reminderForm.usage" label="用法" placeholder="如：口服" required />
          <van-field v-model="reminderForm.remindTime" label="提醒时间" type="time" required />
          <van-field label="提醒周期" readonly :value="remindDaysText" @click="openWeekPicker" required />
          <div class="dialog-buttons">
            <van-button type="default" @click="showFormDialog = false">取消</van-button>
            <van-button type="primary" native-type="submit" :loading="submitting">确定</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 星期选择器 -->
    <van-popup v-model:show="showWeekPicker" position="bottom" round>
      <div class="week-picker">
        <div class="week-picker-header">
          <span>选择重复周期（可多选）</span>
          <van-button type="primary" size="small" @click="confirmWeekSelect">确定</van-button>
        </div>
        <div class="week-options">
          <van-checkbox-group v-model="selectedWeekValues" direction="horizontal">
            <van-checkbox v-for="opt in weekOptions" :key="opt.value" :name="opt.value" shape="square">
              {{ opt.text }}
            </van-checkbox>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import request from '@/utils/request'  
import {
  searchMedicineRemindsApi,
  getMedicineRecordsApi,
  getTakingMedicineApi,
  addMedicineRemindsApi,
  updataMedicineRemindsApi,
  deleteMedicineRemindsApi
} from '@/api/medicine'

const props = defineProps({
  elderId: {
    type: [Number, String],
    required: true
  }
})

// 统计数据
const statistics = ref(null)
// 今日服药记录列表
const recordList = ref([])
const recordsLoading = ref(false)

// 所有提醒配置（用于管理弹窗）
const allReminders = ref([])

// 加载统计数据
const loadStatistics = async () => {
  if (!props.elderId) return
  try {
    const res = await getTakingMedicineApi(props.elderId)
    if (res.success === 200) {
      statistics.value = res.data
    } else {
      statistics.value = null
    }
  } catch (err) {
    console.error('加载统计失败', err)
  }
}

// 加载服药记录并过滤今日
const loadTodayRecords = async () => {
  if (!props.elderId) return
  recordsLoading.value = true
  try {
    const res = await getMedicineRecordsApi(props.elderId)
    if (res.success === 200 && Array.isArray(res.data)) {
      const today = new Date().toISOString().slice(0, 10)
      recordList.value = res.data
        .filter(item => {
          const recordDate = item.recordDate || item.date || ''
          return recordDate === today
        })
        .map(item => ({
          ...item,
          taken: item.status === 1
        }))
    } else {
      recordList.value = []
    }
  } catch (err) {
    console.error('加载服药记录失败', err)
    showToast('加载提醒失败')
  } finally {
    recordsLoading.value = false
  }
}

// 老人确认服药/漏服操作
const handleTakeMedicine = async (record) => {
  if (record.taken) {
    showToast('今日已确认过服药')
    return
  }
  try {
    await showConfirmDialog({
      title: '确认服药',
      message: `请确认已服用“${record.medicineName}”吗？`,
      confirmButtonText: '已服用',
      cancelButtonText: '漏服'
    })
    await submitTakeAction(record.id, 'take')
  } catch (error) {
    if (error === 'cancel') {
      showConfirmDialog({
        title: '标记漏服',
        message: `确认“${record.medicineName}”漏服吗？`,
        confirmButtonText: '确认漏服',
        cancelButtonText: '再想想'
      }).then(async () => {
        await submitTakeAction(record.id, 'miss')
      }).catch(() => {})
    }
  }
}

// 提交服药操作
const submitTakeAction = async (recordId, action) => {
  try {
    const res = await request({
      url: `/v1/medicine-remind/records/action`,
      method: 'post',
      params: { type: action === 'take' ? 'take' : 'miss' },
      data: { remindId: recordId }
    })
    if (res.success === 200) {
      showToast(action === 'take' ? '服药记录成功' : '已标记漏服')
      await loadTodayRecords()
      await loadStatistics()
    } else {
      showToast(res.errorMsg || '操作失败')
    }
  } catch (err) {
    console.error('提交服药状态失败', err)
    showToast('网络异常，请重试')
  }
}

// ========== 提醒管理相关 ==========
const showReminderDialog = ref(false)
const showFormDialog = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const submitting = ref(false)

const reminderForm = ref({
  medicineName: '',
  dosage: '',
  usage: '',
  remindTime: '',
  remindDays: ''
})

// 星期选择
const showWeekPicker = ref(false)
const selectedWeekValues = ref([])
const weekOptions = [
  { text: '周一', value: '1' },
  { text: '周二', value: '2' },
  { text: '周三', value: '3' },
  { text: '周四', value: '4' },
  { text: '周五', value: '5' },
  { text: '周六', value: '6' },
  { text: '周日', value: '7' }
]

const remindDaysText = computed(() => {
  if (!reminderForm.value.remindDays) return '请选择'
  const days = reminderForm.value.remindDays.split(',')
  const names = days.map(d => weekOptions.find(w => w.value === d)?.text || d)
  return names.join('、')
})

const formatRemindDays = (daysStr) => {
  if (!daysStr) return '不重复'
  const days = daysStr.split(',')
  const names = days.map(d => {
    const opt = weekOptions.find(w => w.value === d)
    return opt ? opt.text : d
  })
  return names.join('、')
}

const formatRemindTime = (time) => {
  if (!time) return ''
  const timeStr = String(time)
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr
  if (/^\d{2},\d{2}$/.test(timeStr)) return timeStr.replace(',', ':')
  const match = timeStr.match(/(\d{1,2})[^\d](\d{1,2})/)
  if (match) {
    const hour = match[1].padStart(2, '0')
    const minute = match[2].padStart(2, '0')
    return `${hour}:${minute}`
  }
  return timeStr
}

// 加载所有提醒配置
const loadAllReminders = async () => {
  if (!props.elderId) return
  try {
    const res = await searchMedicineRemindsApi(props.elderId)
    if (res.success === 200 && Array.isArray(res.data)) {
      allReminders.value = res.data
    } else {
      allReminders.value = []
    }
  } catch (err) {
    console.error('加载提醒配置失败', err)
  }
}

const openReminderManage = () => {
  loadAllReminders()
  showReminderDialog.value = true
}

const openAddReminder = () => {
  isEdit.value = false
  currentId.value = null
  reminderForm.value = { medicineName: '', dosage: '', usage: '', remindTime: '', remindDays: '' }
  showFormDialog.value = true
}

const openEditReminder = (item) => {
  isEdit.value = true
  currentId.value = item.id
  let remindTime = item.remindTime
  if (remindTime && typeof remindTime === 'string') {
    remindTime = formatRemindTime(remindTime)
  }
  reminderForm.value = {
    medicineName: item.medicineName,
    dosage: item.dosage,
    usage: item.usage,
    remindTime: remindTime,
    remindDays: item.remindDays || ''
  }
  showFormDialog.value = true
}

const openWeekPicker = () => {
  if (reminderForm.value.remindDays) {
    selectedWeekValues.value = reminderForm.value.remindDays.split(',')
  } else {
    selectedWeekValues.value = []
  }
  showWeekPicker.value = true
}

const confirmWeekSelect = () => {
  reminderForm.value.remindDays = selectedWeekValues.value.join(',')
  showWeekPicker.value = false
}

const onSubmitReminder = async () => {
  let { medicineName, dosage, usage, remindTime, remindDays } = reminderForm.value
  if (!medicineName || !dosage || !usage || !remindTime || !remindDays) {
    showToast('请填写完整信息')
    return
  }
  remindTime = formatRemindTime(remindTime)
  submitting.value = true
  try {
    const data = {
      elderId: props.elderId,
      medicineName,
      dosage,
      usage,
      remindTime,
      remindDays
    }
    let res
    if (isEdit.value) {
      res = await updataMedicineRemindsApi(currentId.value, data)
    } else {
      res = await addMedicineRemindsApi(data)
    }
    if (res.success === 200) {
      showToast(isEdit.value ? '修改成功' : '添加成功')
      showFormDialog.value = false
      await loadAllReminders()
      await loadTodayRecords()
    } else {
      showToast(res.errorMsg || '操作失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常')
  } finally {
    submitting.value = false
  }
}

const deleteReminder = (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除提醒"${item.medicineName}"吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await deleteMedicineRemindsApi(item.id)
      if (res.success === 200) {
        showToast('删除成功')
        await loadAllReminders()
        await loadTodayRecords()
      } else {
        showToast(res.errorMsg || '删除失败')
      }
    } catch (err) {
      showToast('网络异常')
    }
  }).catch(() => {})
}

// 加载全部数据
const loadAllData = () => {
  if (props.elderId) {
    loadStatistics()
    loadTodayRecords()
    loadAllReminders()
  }
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.elder-reminder-panel {
  background: white;
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.statistics-card {
  background: linear-gradient(135deg, #E8F4F8 0%, #D9EAF0 100%);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
}
.stat-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C5F7A;
  margin-bottom: 12px;
}
.stat-content {
  display: flex;
  justify-content: space-around;
  text-align: center;
}
.stat-item {
  flex: 1;
}
.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2C5F7A;
}
.stat-label {
  font-size: 13px;
  color: #6C8EA0;
}
.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title-small {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2C5F7A;
  border-left: 5px solid #5F9DB5;
  padding-left: 12px;
}
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}
.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FCFE;
  padding: 12px;
  border-radius: 20px;
}
.reminder-info {
  flex: 1;
}
.drug-name {
  font-size: 17px;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 6px;
}
.drug-detail-row {
  font-size: 14px;
  color: #6C7A89;
  margin-bottom: 4px;
}
.drug-time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2A7F6E;
  flex-wrap: wrap;
}
.detail-label {
  font-weight: 500;
  color: #8F9EA8;
  margin-right: 2px;
}
.empty-tip, .loading-tip {
  text-align: center;
  padding: 24px;
  color: #8DA0AB;
}
.loading-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.reminder-manage {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EDF2F7;
}
.manage-header h3 {
  font-size: 18px;
  margin: 0;
}
.reminder-manage-list {
  flex: 1;
  overflow-y: auto;
}
.reminder-manage-item {
  background: #F8F9FC;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.reminder-manage-info {
  flex: 1;
}
.reminder-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
}
.reminder-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #6C7A89;
}
.reminder-manage-actions {
  display: flex;
  gap: 8px;
}
.form-content {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}
.form-content h3 {
  text-align: center;
  margin-bottom: 20px;
}
.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 12px;
}
.dialog-buttons .van-button {
  flex: 1;
}
.week-picker {
  background: white;
  border-radius: 20px;
  padding: 16px;
}
.week-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #EDF2F7;
  padding-bottom: 8px;
}
.week-options {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}
:deep(.van-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}
:deep(.reminder-manage-actions .van-button--primary.plain) {
  background-color: #1989fa !important;
  border-color: #1989fa !important;
  color: #ffffff !important;
}
</style>