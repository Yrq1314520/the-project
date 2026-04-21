<template>
  <div class="elder-home">
    <!-- 顶部区域 -->
    <div class="header">
      <div class="logo-area">
        <h1>翼护银发</h1>
      </div>
        <user-menu />
    </div>

    <!-- 导航栏-->
    <div class="nav-bar">
      <div class="nav-item" @click="handleNavClick('assistant')">
        <van-icon name="chat-o" size="28" />
        <span>智能助手</span>
      </div>
      <div class="nav-item" @click="handleNavClick('profile')">
        <van-icon name="user-o" size="28" />
        <span>我的档案</span>
      </div>
      <div class="nav-item" @click="handleNavClick('drugs')">
        <van-icon name="shop-o" size="28" />
        <span>药品信息</span>
      </div>
      <div class="nav-item" @click="handleNavClick('emergency')">
        <van-icon name="warning-o" size="28" />
        <span>紧急联系人</span>
      </div>
    </div>

    <!-- 轮播图 + 用药提醒区域-->
    <div class="info-row">
      <div class="swipe-area">
        <van-swipe class="my-swipe" :autoplay="3000" indicator-color="#5F9DB5">
          <van-swipe-item v-for="(img, idx) in bannerList" :key="idx">
            <img :src="img" alt="banner" class="banner-img" />
          </van-swipe-item>
        </van-swipe>
      </div>

      <!-- 右侧用药提醒列表 + 管理按钮 -->
      <div class="reminder-area">
  <div class="section-title-small">
    <van-icon name="clock-o" size="20" />
    <span>今日用药提醒</span>
    <van-button size="normal"  type="success" plain round @click="openReminderManage">管理</van-button>
  </div>
  <div class="reminder-list">
    <div
      v-for="reminder in reminderList"
      :key="reminder.id"
      class="reminder-item"
    >
      <div class="reminder-info">
        <div class="drug-name">{{ reminder.medicineName }}</div>
        <div class="drug-detail-row">
          <span class="detail-label">剂量：</span>{{ reminder.dosage }}
          <span class="detail-label">用法：</span>{{ reminder.usage }}
        </div>
        <div class="drug-time-row">
          <van-icon name="clock-o" size="14" />
          <span>{{ reminder.remindTime }}</span>
          <span class="detail-label">周期：</span>
          <span>{{ formatRemindDays(reminder.remindDays) }}</span>
        </div>
      </div>
      <van-tag
        :type="reminder.taken ? 'success' : 'warning'"
        plain
        size="medium"
        @click.stop="markReminderTaken(reminder.id)"
      >
        {{ reminder.taken ? '已服用' : '未服用' }}
      </van-tag>
    </div>
    <div v-if="reminderList.length === 0 && !reminderLoading" class="empty-tip">
      暂无用药提醒
    </div>
    <div v-if="reminderLoading" class="loading-tip">加载提醒中...</div>
  </div>
</div>
    </div>

    <!-- 药品信息区域 -->
    <div class="drug-section" ref="drugSectionRef">
      <div class="section-header">
        <h2 class="section-title">💊 我的药品</h2>
        <van-button type="primary" size="big" round @click="goToDrugManage" class="manage-btn">
          管理药品
        </van-button>
      </div>
      <div class="drug-list">
        <div v-for="drug in drugList" :key="drug.id" class="drug-card">
          <div class="drug-info">
            <div class="drug-name-main">{{ drug.medicineName }}</div>
            <div class="drug-detail">
              <span>类型：{{ drug.type || '未分类' }}</span>
              <span>数量：{{ drug.quantity || '—' }}</span>
              <span v-if="drug.expiryDate">有效期：{{ drug.expiryDate }}</span>
              <span v-if="drug.remark">备注：{{ drug.remark }}</span>
            </div>
          </div>
        </div>
        <div v-if="drugList.length === 0 && !drugLoading" class="empty-tip">
          暂无药品信息，点击右上角“管理药品”添加
        </div>
        <div v-if="drugLoading" class="loading-tip">
          <van-loading size="24px" /> 加载中...
        </div>
      </div>
    </div>

    <!-- 紧急联系人区域（设置/修改按钮） -->
    <div class="emergency-section" ref="emergencySectionRef">
      <div class="section-header">
        <h2 class="section-title">📞 紧急联系人</h2>
        <van-button size="normal" color="#ff9800"  round plain @click="goToSetEmergency">设置/修改</van-button>
      </div>
      <div class="emergency-card" v-if="emergencyContact.name">
        <van-icon name="contact" size="32" color="#E86A6A" />
        <div class="emergency-info">
          <div class="contact-name">{{ emergencyContact.name }}</div>
          <div class="contact-phone">{{ emergencyContact.phone }}</div>
          <div class="contact-relation">关系：{{ emergencyContact.relation || '家人' }}</div>
        </div>
        <van-button round size="small" type="danger" plain @click="callEmergency">拨打</van-button>
      </div>
      <div v-else class="empty-emergency">
        <van-icon name="warning-o" size="32" color="#ccc" />
        <span>暂未设置紧急联系人</span>
        <van-button size="small" round @click="goToSetEmergency" style="margin-left: 12px;">去设置</van-button>
      </div>
    </div>

    <!-- 用药提醒管理弹窗（添加/编辑/删除） -->
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
                <span>时间：{{ item.remindTime }}</span>
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
          <van-field label="提醒周期" readonly :value="remindDaysText" @click="showWeekPicker = true" required />
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

    <div class="bottom-placeholder"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/user'
import { getMyDrugListApi } from '@/api/medicine'
import { getElderInfoByUserId } from '@/api/elderInfo'
import { getAllRemindsApi, addMedicineRemindsApi, updataMedicineRemindsApi, deleteMedicineRemindsApi } from '@/api/medicine'
import img5 from '@/assets/woman.jpg'
import img6 from '@/assets/man.jpg'

const router = useRouter()
const userStore = useUserStore()

// 用户名称
const userName = computed(() => userStore.userInfo?.name || userStore.userInfo?.username || '用户')

// 轮播图
const bannerList = ref([img5, img6])


const reminderList = ref([])        
const allReminders = ref([])        
const reminderLoading = ref(false)

// 加载所有提醒
const loadReminders = async () => {
  reminderLoading.value = true
  try {
    const res = await getAllRemindsApi()
    if (res.success === 200 && Array.isArray(res.data)) {
      allReminders.value = res.data
      reminderList.value = res.data.map(item => ({
        id: item.id,
        medicineName: item.medicineName,
        remindTime: item.remindTime,
        dosage: item.dosage ,      
        usage: item.usage ,        
        remindDays: item.remindDays ,
        taken: false  
      }))
    } else {
      allReminders.value = []
      reminderList.value = []
    }
  } catch (err) {
    console.error('加载用药提醒失败', err)
    showToast('加载提醒失败')
  } finally {
    reminderLoading.value = false
  }
}

// 标记已服用,目前前实现
const markReminderTaken = (id) => {
  const item = reminderList.value.find(r => r.id === id)
  if (item && !item.taken) {
    item.taken = true
    showToast(`已记录：${item.medicineName} 已服用`)
  } else if (item && item.taken) {
    showToast('今日已标记过啦')
  }
}

//  药品管理 
const drugSectionRef = ref(null)
const drugList = ref([])
const drugLoading = ref(false)

const loadDrugList = async () => {
  drugLoading.value = true
  try {
    const res = await getMyDrugListApi()
    if (res.success === 200) {
      let list = []
      if (Array.isArray(res.data)) {
        list = res.data
      } else if (res.data && Array.isArray(res.data.list)) {
        list = res.data.list
      }
      drugList.value = list.slice(0, 5)
    } else {
      drugList.value = []
    }
  } catch (err) {
    console.error('加载药品列表失败', err)
    drugList.value = []
  } finally {
    drugLoading.value = false
  }
}

const goToDrugManage = () => {
  router.push('/oldman/drug')
}

// 紧急联系人 
const emergencySectionRef = ref(null)
const emergencyContact = ref({ name: '', phone: '', relation: '' })

const loadEmergencyContact = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) return
    const res = await getElderInfoByUserId(userId)
    if (res.code === 200 && res.data) {
      let data = res.data
      if (Array.isArray(data) && data.length > 0) data = data[0]
      if (data) {
        emergencyContact.value = {
          name: data.emergencyContact || data.emergencyName || '',
          phone: data.emergencyPhone || '',
          relation: data.relation || ''
        }
      } else {
        emergencyContact.value = { name: '', phone: '', relation: '' }
      }
    } else {
      emergencyContact.value = { name: '', phone: '', relation: '' }
    }
  } catch (err) {
    console.error('加载紧急联系人失败', err)
  }
}

const callEmergency = () => {
  if (emergencyContact.value.phone) {
    window.location.href = `tel:${emergencyContact.value.phone}`
  } else {
    showToast('没有可用的紧急联系电话')
  }
}

const goToSetEmergency = () => {
  router.push('/oldman/emergency-contact')
}

// 用药提醒管理
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

const openReminderManage = () => {
  loadReminders()
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
  reminderForm.value = {
    medicineName: item.medicineName,
    dosage: item.dosage,
    usage: item.usage,
    remindTime: item.remindTime,
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
  const { medicineName, dosage, usage, remindTime, remindDays } = reminderForm.value
  if (!medicineName || !dosage || !usage || !remindTime || !remindDays) {
    showToast('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    const data = {
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
      await loadReminders()   
      if (showReminderDialog.value) {
      }
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
        await loadReminders()
      } else {
        showToast(res.errorMsg || '删除失败')
      }
    } catch (err) {
      showToast('网络异常')
    }
  }).catch(() => {})
}

const goToAssistant = () => router.push('/oldman/chat')
const goToMyProfile = () => router.push('/oldman/profile')

const scrollToSection = (refElement) => {
  if (refElement.value) {
    refElement.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleNavClick = (type) => {
  switch (type) {
    case 'assistant': goToAssistant(); break
    case 'profile': goToMyProfile(); break
    case 'drugs': scrollToSection(drugSectionRef); break
    case 'emergency': scrollToSection(emergencySectionRef); break
  }
}

onMounted(() => {
  loadDrugList()
  loadEmergencyContact()
  loadReminders()
})
</script>

<style scoped>
.elder-home {
  min-height: 100vh;
  background: #F7F9FC;
  padding: 16px 16px 32px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24px;
  padding: 0 4px;
}
.logo-area h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2C5F7A;
  margin: 0;
  letter-spacing: 1px;
}
.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(95, 157, 181, 0.12);
  padding: 6px 12px;
  border-radius: 40px;
}
.username {
  font-size: 18px;
  font-weight: 500;
  color: #2C5F7A;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: 32px;
  padding: 12px 8px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #3E6B7E;
  cursor: pointer;
  padding: 8px 0;
  flex: 1;
  transition: all 0.2s;
}
.nav-item:active {
  transform: scale(0.96);
  background: #F0F4F8;
  border-radius: 24px;
}
.nav-item span {
  font-size: 16px;
}
.nav-item .van-icon {
  font-size: 28px;
}

.info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: stretch;  
  flex-wrap: wrap;
}

.swipe-area {
  flex: 1.2;
  min-width: 140px;
  border-radius: 24px;
  overflow: hidden;
  background: #E9F0F5;
  display: flex;
  flex-direction: column;
}

.my-swipe {
  width: 100%;
  height: 100%;
  flex: 1;
}

:deep(.van-swipe) {
  height: 100%;
}
:deep(.van-swipe__track) {
  height: 100%;
}
:deep(.van-swipe-item) {
  width: 100%;
  height: 100%;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain; 
  object-position: center;
  background: #E9F0F5;
  display: block;
}
.reminder-area {
  flex: 1.8;
  background: white;
  border-radius: 24px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.section-title-small {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2C5F7A;
  margin-bottom: 12px;
  border-left: 5px solid #5F9DB5;
  padding-left: 12px;
}
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FCFE;
  padding: 12px 12px;
  border-radius: 20px;
  transition: background 0.2s;
}
.reminder-info {
  flex: 1;
}
.drug-name {
  font-size: 17px;
  font-weight: 600;
  color: #2C3E50;
}
.drug-time {
  font-size: 14px;
  color: #E86A6A;
  margin-top: 4px;
}
.reminder-item .van-tag {
  font-size: 14px;
  padding: 6px 12px;
  cursor: pointer;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.section-title {
  font-size: 22px;
  font-weight: 600;
  color: #2C5F7A;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.manage-btn {
  background: #5F9DB5;
  border: none;
  padding: 6px 18px;
  font-size: 15px;
  border-radius: 30px;
  font-weight: 500;
}

.drug-section {
  background: white;
  border-radius: 28px;
  padding: 20px 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.drug-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.drug-card {
  background: #F8FBFD;
  border-radius: 20px;
  padding: 14px 16px;
  transition: 0.2s;
  border: 1px solid #E9F0F5;
}
.drug-name-main {
  font-size: 18px;
  font-weight: 600;
  color: #2C5F7A;
  margin-bottom: 6px;
}
.drug-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 15px;
  color: #6C8EA0;
}
.drug-detail span {
  background: #F0F5F9;
  padding: 2px 10px;
  border-radius: 20px;
}


.emergency-section {
  background: white;
  border-radius: 28px;
  padding: 20px 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.emergency-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #FFF5F5;
  border-radius: 24px;
  padding: 18px 20px;
  border-left: 6px solid #E86A6A;
}
.emergency-info {
  flex: 1;
}
.contact-name {
  font-size: 20px;
  font-weight: 700;
  color: #C0392B;
}
.contact-phone {
  font-size: 18px;
  color: #2C3E50;
  margin: 6px 0;
  letter-spacing: 1px;
}
.contact-relation {
  font-size: 15px;
  color: #8F9EA8;
}
.empty-emergency {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  background: #F9F9F9;
  border-radius: 20px;
  font-size: 16px;
  color: #889BAA;
  flex-wrap: wrap;
}
.empty-tip {
  text-align: center;
  padding: 24px 12px;
  color: #8DA0AB;
  font-size: 16px;
}
.loading-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #5F9DB5;
}
.bottom-placeholder {
  height: 20px;
}

@media (max-width: 480px) {
  .nav-item span {
    font-size: 14px;
  }
  .drug-name-main {
    font-size: 17px;
  }
  .contact-name {
    font-size: 18px;
  }
  .contact-phone {
    font-size: 16px;
  }
  .section-title {
    font-size: 20px;
  }
}

.reminder-area .section-title-small {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.van-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}
.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FCFE;
  padding: 12px;
  border-radius: 20px;
  transition: background 0.2s;
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
</style>