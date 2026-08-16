<template>
  <div class="medicine-reminder">
    <div class="panel-buttons">
      <button :class="['btn', { active: currentPanel === 'reminders' }]" @click="currentPanel = 'reminders'">提醒列表</button>
      <button :class="['btn', { active: currentPanel === 'records' }]" @click="currentPanel = 'records'">服药记录</button>
      <button :class="['btn', { active: currentPanel === 'statistics' }]" @click="currentPanel = 'statistics'">服药统计</button>
    </div>

    <!-- 提醒列表 -->
    <div v-show="currentPanel === 'reminders'">
      <div class="reminder-header">
        <button class="add-btn" @click="openAddForm">+ 添加提醒</button>
      </div>
      <div v-if="reminders.length === 0" class="empty-tip">暂无用药提醒，点击上方按钮添加</div>
      <div v-for="item in reminders" :key="item.id" class="reminder-card">
        <div class="reminder-info">
          <div class="drug-name">{{ item.medicineName }}</div>
          <div class="drug-detail">剂量：{{ item.dosage }} &nbsp; 用法：{{ item.usage }}</div>
          <div class="remind-time">提醒时间：{{ item.remindTime }}</div>
          <div class="remind-days">重复周期：{{ formatDays(item.remindDays) }}</div>
        </div>
        <div class="reminder-actions">
          <label class="status-switch">
            <input type="checkbox" v-model="item.status" true-value="1" false-value="0" @change="toggleStatus(item)" />
            <span>{{ item.status == 1 ? '已启用' : '已禁用' }}</span>
          </label>
          <button class="edit-btn" @click="openEditForm(item)">编辑</button>
          <button class="delete-btn" @click="openDeleteModal(item)">删除</button>
        </div>
      </div>
    </div>

    <!-- 服药记录 -->
    <div v-show="currentPanel === 'records'">
      <div class="date-filter">
        <label>选择日期：</label>
        <input type="date" v-model="selectedDate" @change="loadRecords" />
      </div>
      <div v-if="records.length === 0" class="empty-tip">暂无服药记录</div>
      <div v-for="rec in records" :key="rec.id" class="record-card">
        <div class="record-info">
          <div class="record-name">{{ rec.medicineName }}</div>
          <div class="record-time">提醒时间：{{ rec.remindTime }}</div>
          <div class="record-dosage">剂量：{{ rec.dosage }} | 用法：{{ rec.usage }}</div>
        </div>
        <div class="record-status">
          <span :class="['status-tag', rec.status === 1 ? 'taken' : 'missed']">
            {{ rec.status === 1 ? '已服用' : '未服用' }}
          </span>
          <div v-if="rec.status !== 1" class="action-buttons">
            <button class="take-btn" @click="markTaken(rec)">标记已服</button>
            <button class="miss-btn" @click="markMissed(rec)">标记漏服</button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="currentPanel === 'statistics'">
      <div v-if="statistics" class="statistics-card">
        <div class="stat-title">📊 服药统计（近7天）</div>
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
            <span class="stat-label">按时率</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-tip">暂无统计数据</div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <h3>{{ isEditMode ? '编辑提醒' : '添加提醒' }}</h3>
        <div class="form-field">
          <label>药品名称</label>
          <input type="text" v-model="formData.medicineName" placeholder="请输入药品名称" />
        </div>
        <div class="form-field">
          <label>剂量</label>
          <input type="text" v-model="formData.dosage" placeholder="如：1片" />
        </div>
        <div class="form-field">
          <label>用法</label>
          <input type="text" v-model="formData.usage" placeholder="如：口服" />
        </div>
        <div class="form-field">
          <label>提醒时间</label>
          <input type="time" v-model="formData.remindTime" />
        </div>
        <div class="form-field">
          <label>重复周期</label>
          <div class="week-checkbox-group">
            <label v-for="opt in weekOptions" :key="opt.value" class="week-checkbox">
              <input type="checkbox" :value="opt.value" v-model="formData.remindDaysList" />
              {{ opt.text }}
            </label>
          </div>
        </div>
        <div class="modal-buttons">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="submit-btn" @click="submitForm" :disabled="submitting">{{ submitting ? '提交中...' : '确定' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-mask" @click.self="closeDeleteModal">
      <div class="modal-box">
        <div class="modal-title">确认删除提醒</div>
        <div class="modal-content">
          删除后将永久清除，无法恢复，确定要删除【{{ deleteTargetName }}】吗？
        </div>
        <div class="modal-footer">
          <button class="footer-btn cancel" @click="closeDeleteModal">取消</button>
          <button class="footer-btn confirm" @click="confirmDeleteReminder" :disabled="deleteLoading">
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { showToast } from 'vant'
import {
  searchMedicineRemindsApi,
  addMedicineRemindsApi,
  updataMedicineRemindsApi,
  deleteMedicineRemindsApi,
  getMedicineRecordsApi,
  getTakingMedicineApi,
  takingMedicineApi
} from '@/api/medicine'

const props = defineProps({
  elderId: { type: [Number, String], required: true }
})

const currentPanel = ref('reminders')
const reminders = ref<any[]>([])
const records = ref<any[]>([])
const statistics = ref<Record<string, any> | null>(null)
const selectedDate = ref(new Date().toISOString().slice(0, 10))

const showModal = ref(false)
const isEditMode = ref(false)
const currentEditId = ref<any>(null)
const submitting = ref(false)

const formData = reactive({
  medicineName: '',
  dosage: '',
  usage: '',
  remindTime: '',
  remindDaysList: [] as any[]
})

// 星期选项
const weekOptions = [
  { text: '周一', value: '1' },
  { text: '周二', value: '2' },
  { text: '周三', value: '3' },
  { text: '周四', value: '4' },
  { text: '周五', value: '5' },
  { text: '周六', value: '6' },
  { text: '周日', value: '7' }
]


const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const deleteTargetId = ref<any>(null)
const deleteTargetName = ref('')

const openDeleteModal = (item: any) => {
  deleteTargetId.value = item.id
  deleteTargetName.value = item.medicineName
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteTargetId.value = null
  deleteTargetName.value = ''
}

const confirmDeleteReminder = async () => {
  if (!deleteTargetId.value) return
  deleteLoading.value = true
  try {
    const res = await deleteMedicineRemindsApi(deleteTargetId.value)
    if (res.success === 200) {
      showToast('删除成功')
      await loadReminders()
    } else {
      showToast(res.errorMsg || '删除失败')
    }
  } catch (err) {
    showToast('网络异常')
  } finally {
    deleteLoading.value = false
    closeDeleteModal()
  }
}


const formatDays = (daysStr: any) => {
  if (!daysStr) return '不重复'
  const map: Record<string, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '日' }
  return daysStr.split(',').map((d: any) => map[d] || d).join('、')
}

// 打开添加弹窗
const openAddForm = () => {
  isEditMode.value = false
  currentEditId.value = null
  formData.medicineName = ''
  formData.dosage = ''
  formData.usage = ''
  formData.remindTime = ''
  formData.remindDaysList = []
  showModal.value = true
}

// 打开编辑弹窗
const openEditForm = (item: any) => {
  isEditMode.value = true
  currentEditId.value = item.id
  formData.medicineName = item.medicineName
  formData.dosage = item.dosage
  formData.usage = item.usage
  formData.remindTime = item.remindTime
  formData.remindDaysList = item.remindDays ? item.remindDays.split(',') : []
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  const { medicineName, dosage, usage, remindTime, remindDaysList } = formData
  if (!medicineName || !dosage || !usage || !remindTime || remindDaysList.length === 0) {
    showToast('请填写完整信息')
    return
  }
  const remindDays = remindDaysList.join(',')
  submitting.value = true
  try {
    const data = {
      elderId: Number(props.elderId),
      medicineName,
      dosage,
      usage,
      remindTime,
      remindDays
    }
    let res
    if (isEditMode.value) {
      res = await updataMedicineRemindsApi(currentEditId.value, data)
    } else {
      res = await addMedicineRemindsApi(data)
    }
    if (res.success === 200) {
      showToast(isEditMode.value ? '修改成功' : '添加成功')
      closeModal()
      await loadReminders()
    } else {
      showToast(res.errorMsg || '操作失败')
    }
  } catch (err) {
    showToast('网络异常')
  } finally {
    submitting.value = false
  }
}

// 加载提醒
const loadReminders = async () => {
  if (!props.elderId) return
  try {
    const res = await searchMedicineRemindsApi(props.elderId)
    if (res.success === 200 && Array.isArray(res.data)) {
      reminders.value = res.data
    } else {
      reminders.value = []
    }
  } catch {
    showToast('加载提醒失败')
  }
}

// 加载服药记录
const loadRecords = async () => {
  if (!props.elderId) return
  try {
    const res = await getMedicineRecordsApi(props.elderId)
    if (res.success === 200 && Array.isArray(res.data)) {
      records.value = res.data.filter((r: any) => (r.recordDate || r.date) === selectedDate.value)
    } else {
      records.value = []
    }
  } catch {
    showToast('加载服药记录失败')
  }
}

// 加载统计
const loadStatistics = async () => {
  if (!props.elderId) return
  try {
    const res = await getTakingMedicineApi(props.elderId)
    if (res.success === 200) statistics.value = res.data
    else statistics.value = null
  } catch {
    showToast('加载统计数据失败')
  }
}

// 切换状态
const toggleStatus = async (item: any) => {
  const original = item.status
  try {
    const res = await updataMedicineRemindsApi(item.id, { status: item.status })
    if (res.success !== 200) {
      item.status = original
      showToast(res.errorMsg || '状态修改失败')
    }
  } catch {
    item.status = original
    showToast('网络异常')
  }
}

// 标记已服
const markTaken = (record: any) => {
  showToast('已标记为已服用')
  takingMedicineApi({ type: 'take' }, { remindId: record.id }).then(() => {
    loadRecords()
    loadStatistics()
  })
}

// 标记漏服
const markMissed = (record: any) => {
  showToast('已标记为漏服')
  takingMedicineApi({ type: 'miss' }, { remindId: record.id }).then(() => {
    loadRecords()
    loadStatistics()
  })
}

onMounted(() => {
  loadReminders()
  loadRecords()
  loadStatistics()
})
</script>

<style scoped>

.medicine-reminder {
  background: white;
  border-radius: 24px;
  padding: 16px;
  margin-top: 16px;
  position: relative;
}

.panel-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: center;
}
.btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 20px;
  font-size: 14px;
}
.btn.active {
  background: #1989fa;
  color: white;
  border-color: #1989fa;
}

.reminder-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.add-btn {
  background: #07c160;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.reminder-card {
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
.reminder-info {
  flex: 1;
}
.drug-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.drug-detail {
  font-size: 13px;
  color: #6C7A89;
  margin-bottom: 4px;
}
.remind-time {
  font-size: 14px;
  color: #2A7F6E;
  margin-bottom: 4px;
}
.remind-days {
  font-size: 13px;
  color: #6C7A89;
}
.reminder-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.status-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.edit-btn, .delete-btn {
  border: none;
  padding: 4px 10px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
}
.edit-btn {
  background: #1989fa;
  color: white;
}
.delete-btn {
  background: #ee0a24;
  color: white;
}

.date-filter {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.record-card {
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
.record-info {
  flex: 1;
}
.record-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}
.record-time {
  font-size: 14px;
  color: #2A7F6E;
  margin-bottom: 4px;
}
.record-dosage {
  font-size: 13px;
  color: #6C7A89;
}
.record-status {
  text-align: right;
}
.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 8px;
}
.status-tag.taken {
  background: #d9f0e3;
  color: #07c160;
}
.status-tag.missed {
  background: #ffe1e1;
  color: #ee0a24;
}
.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.take-btn, .miss-btn {
  border: none;
  padding: 4px 10px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
}
.take-btn {
  background: #07c160;
  color: white;
}
.miss-btn {
  background: #ff976a;
  color: white;
}

.statistics-card {
  background: linear-gradient(135deg, #E8F4F8 0%, #D9EAF0 100%);
  border-radius: 20px;
  padding: 16px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.modal-container h3 {
  margin-top: 0;
  text-align: center;
}
.form-field {
  margin-bottom: 16px;
}
.form-field label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}
.form-field input[type="text"],
.form-field input[type="time"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  box-sizing: border-box;
}
.week-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}
.week-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.cancel-btn, .submit-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
}
.submit-btn {
  background: #1989fa;
  color: white;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  width: 280px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.modal-title {
  padding: 20px 15px 10px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: #333;
}
.modal-content {
  padding: 0 20px 20px;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  border-top: 1px solid #eee;
  height: 48px;
  line-height: 48px;
}
.footer-btn {
  flex: 1;
  font-size: 16px;
  border: none;
  background: #fff;
  cursor: pointer;
}
.footer-btn.cancel {
  color: #666;
  border-right: 1px solid #eee;
}
.footer-btn.confirm {
  color: #ee0a24;
  font-weight: 500;
}
.footer-btn:disabled {
  opacity: 0.6;
}
</style>