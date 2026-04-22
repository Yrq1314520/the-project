<template>
  <div class="medicine-reminder">
    <div class="reminder-header">
      <h3>用药提醒列表</h3>
      <van-button type="primary" size="small" round @click="openAddReminder">+ 添加提醒</van-button>
    </div>

    <div v-if="filteredReminderList.length > 0" class="reminder-list">
      <div v-for="item in filteredReminderList" :key="item.id" class="reminder-card">
        <div class="reminder-info">
          <div class="drug-name">{{ item.medicineName }}</div>
          <div class="drug-detail">
            <span>剂量：{{ item.dosage || '—' }}</span>
            <span>用法：{{ item.usage || '—' }}</span>
          </div>
          <div class="remind-time">
            <van-icon name="clock-o" />
            {{ formatRemindTime(item.remindTime) }}
          </div>
          <div class="remind-days">
            <span>重复：</span>
            <span class="days-badge" v-for="day in parseRemindDays(item.remindDays)" :key="day">{{ day }}</span>
          </div>
        </div>
        <div class="reminder-actions">
          <van-switch v-model="item.status" :active-value="1" :inactive-value="0" size="20px" @change="toggleStatus(item)" />
          <van-button size="small" type="primary" plain @click="openEditReminder(item)">编辑</van-button>
          <van-button size="small" type="danger" plain @click="deleteReminder(item)">删除</van-button>
        </div>
      </div>
    </div>
    <van-empty v-else description="暂无用药提醒，点击上方按钮添加" />

    <!-- 添加/编辑弹窗 -->
    <van-popup v-model:show="showDialog" position="bottom" round style="height: 85%">
      <div class="dialog-content">
        <h3>{{ isEdit ? '编辑提醒' : '添加提醒' }}</h3>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field v-model="form.medicineName" label="药品名称" placeholder="请输入药品名称" required />
            <van-field v-model="form.dosage" label="剂量" placeholder="如：1片" required />
            <van-field v-model="form.usage" label="用法" placeholder="如：口服" required />
            <van-field v-model="form.remindTime" label="提醒时间" type="time" required />
            <van-field label="提醒周期" readonly v-model="displayRemindDays" placeholder="请选择重复周期" required @click="openWeekPicker" />
          </van-cell-group>
          <div class="dialog-buttons">
            <van-button type="default" @click="showDialog = false">取消</van-button>
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
            <van-checkbox v-for="opt in weekOptions" :key="opt.value" :name="opt.value" shape="square">{{ opt.text }}</van-checkbox>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getAllRemindsApi, addMedicineRemindsApi, updataMedicineRemindsApi, deleteMedicineRemindsApi } from '@/api/medicine'

const props = defineProps({
  elderId: { type: [Number, String], required: true }
})

const allReminders = ref([])
const loading = ref(false)

// 格式化提醒时间
const formatRemindTime = (time) => {
  if (time == null || time === '') return ''
  let timeStr = String(time)
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr
  if (/^\d{2},\d{2}$/.test(timeStr)) return timeStr.replace(',', ':')
  if (Array.isArray(time) && time.length >= 2) {
    const hour = String(time[0]).padStart(2, '0')
    const minute = String(time[1]).padStart(2, '0')
    return `${hour}:${minute}`
  }
  // 尝试提取数字
  const match = timeStr.match(/(\d{1,2})[^\d](\d{1,2})/)
  if (match) {
    const hour = match[1].padStart(2, '0')
    const minute = match[2].padStart(2, '0')
    return `${hour}:${minute}`
  }
  return timeStr
}

// 过滤当前老人的提醒
const filteredReminderList = computed(() => {
  if (!props.elderId) return []
  return allReminders.value.filter(item => item.elderId == props.elderId)
})

// 弹窗相关
const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const submitting = ref(false)

const form = reactive({
  medicineName: '',
  dosage: '',
  usage: '',
  remindTime: '',
  remindDays: ''
})

const showWeekPicker = ref(false)
const selectedWeekValues = ref([])
const weekOptions = [
  { text: '周一', value: '1' }, { text: '周二', value: '2' }, { text: '周三', value: '3' },
  { text: '周四', value: '4' }, { text: '周五', value: '5' }, { text: '周六', value: '6' }, { text: '周日', value: '7' }
]
const displayRemindDays = ref('请选择')

const updateDisplayRemindDays = () => {
  if (!form.remindDays) { displayRemindDays.value = '请选择'; return }
  const days = form.remindDays.split(',')
  const names = days.map(d => weekOptions.find(w => w.value === d)?.text || d)
  displayRemindDays.value = names.join('、')
}

const parseRemindDays = (daysStr) => {
  if (!daysStr) return []
  return daysStr.split(',').map(d => weekOptions.find(w => w.value === d)?.text || d)
}

// 加载所有提醒
const loadReminders = async () => {
  if (!props.elderId) return
  loading.value = true
  try {
    const res = await getAllRemindsApi()
    if (res.success === 200 && Array.isArray(res.data)) {
      allReminders.value = res.data
    } else if (res.code === 200 && Array.isArray(res.data)) {
      allReminders.value = res.data
    } else {
      allReminders.value = []
    }
  } finally {
    loading.value = false
  }
}

const openAddReminder = () => {
  isEdit.value = false
  currentId.value = null
  form.medicineName = ''; form.dosage = ''; form.usage = ''; form.remindTime = ''; form.remindDays = ''
  updateDisplayRemindDays()
  showDialog.value = true
}

const openEditReminder = (item) => {
  isEdit.value = true
  currentId.value = item.id
  form.medicineName = item.medicineName
  form.dosage = item.dosage
  form.usage = item.usage
  let remindTime = item.remindTime
  if (remindTime) {
    const formatted = formatRemindTime(remindTime)
    if (formatted && formatted.includes(':')) {
      form.remindTime = formatted
    } else {
      form.remindTime = remindTime
    }
  } else {
    form.remindTime = ''
  }
  form.remindDays = item.remindDays || ''
  updateDisplayRemindDays()
  showDialog.value = true
}

const openWeekPicker = () => {
  selectedWeekValues.value = form.remindDays ? form.remindDays.split(',') : []
  showWeekPicker.value = true
}

const confirmWeekSelect = () => {
  form.remindDays = selectedWeekValues.value.join(',')
  updateDisplayRemindDays()
  showWeekPicker.value = false
}

const onSubmit = async () => {
  if (!form.medicineName || !form.dosage || !form.usage || !form.remindTime || !form.remindDays) {
    showToast('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    let remindTime = form.remindTime
    if (remindTime && !remindTime.includes(':')) {
      remindTime = remindTime.replace(',', ':')
    }
    const data = {
      elderId: Number(props.elderId),
      medicineName: form.medicineName,
      dosage: form.dosage,
      usage: form.usage,
      remindTime: remindTime,
      remindDays: form.remindDays
    }
    let res
    if (isEdit.value) {
      res = await updataMedicineRemindsApi(currentId.value, data)
    } else {
      res = await addMedicineRemindsApi(data)
    }
    if (res.success === 200) {
      showToast(isEdit.value ? '修改成功' : '添加成功')
      showDialog.value = false
      await loadReminders()
    } else {
      showToast(res.errorMsg || '操作失败')
    }
  } catch (err) {
    console.error('提交失败', err)
    showToast('网络异常，请重试')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (item) => {
  const originalStatus = item.status
  try {
    const res = await updataMedicineRemindsApi(item.id, { status: item.status })
    if (res.success !== 200) {
      item.status = originalStatus
      showToast(res.errorMsg || '状态修改失败')
    }
  } catch (err) {
    item.status = originalStatus
    showToast('网络异常')
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
        await loadReminders()
      } else {
        showToast(res.errorMsg || '删除失败')
      }
    } catch (err) {
      showToast('网络异常')
    }
  }).catch(() => {})
}

onMounted(() => {
  if (props.elderId) loadReminders()
})
</script>

<style scoped>
.medicine-reminder {
  background: white;
  border-radius: 24px;
  padding: 16px;
  margin-top: 16px;
}
.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.reminder-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reminder-card {
  background: #F8F9FC;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.reminder-info {
  flex: 1;
}
.drug-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.drug-detail {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6C7A89;
  margin-bottom: 6px;
}
.remind-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #2A7F6E;
  margin-bottom: 4px;
}
.remind-days {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.days-badge {
  background: #E9F0F5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.reminder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dialog-content {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}
.dialog-content h3 {
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
  padding-bottom: 8px;
  border-bottom: 1px solid #EDF2F7;
}
.week-picker-header span {
  font-size: 16px;
  font-weight: 500;
}
.week-options {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}
.van-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}
.van-checkbox {
  margin: 0;
}
</style>