<template>
  <div class="elder-detail">
    <div class="nav-bar">
      <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
      <div class="nav-title">老人详情</div>
      <div style="width: 80px;"></div>
    </div>
    <van-tabs v-model:active="currentTab" class="tabs" sticky>
      <van-tab title="老人档案">
        <div v-if="profileData" class="resume-card">
          <div class="resume-header">
            <div class="avatar"><van-icon name="user-o" size="48" /></div>
            <div class="basic-info">
              <h2>{{ profileData.name || profileData.username || '未命名' }}</h2>
              <p>档案ID: {{ profileData.id || '无' }} | 用户ID: {{ profileData.userId || profileData.id }}</p>
            </div>
          </div>
          <div class="emergency-info">
            <div class="emergency-item"><span class="label">紧急联系人</span><span class="value">{{ profileData.emergencyContact || '未设置' }}</span></div>
            <div class="emergency-item"><span class="label">紧急联系电话</span><span class="value">{{ profileData.emergencyPhone || '未设置' }}</span></div>
            <div class="emergency-item"><span class="label">关系</span><span class="value">{{ profileData.relation || '未设置' }}</span></div>
          </div>
          <div class="resume-details">
            <div class="detail-item"><span class="label">姓名</span><span class="value">{{ profileData.name || '未填写' }}</span></div>
            <div class="detail-item"><span class="label">年龄</span><span class="value">{{ profileData.age }}岁</span></div>
            <div class="detail-item"><span class="label">性别</span><span class="value">{{ profileData.gender === 1 ? '男' : profileData.gender === 2 ? '女' : '未填写' }}</span></div>
            <div class="detail-item"><span class="label">基础病史</span><span class="value">{{ profileData.medicalHistory || '无' }}</span></div>
            <div class="detail-item"><span class="label">过敏史</span><span class="value">{{ profileData.allergy || '无' }}</span></div>
            <div class="detail-item"><span class="label">居住地址</span><span class="value">{{ profileData.address || '未填写' }}</span></div>
          </div>
          <div class="action-buttons">
            <van-button class="custom-edit-btn" size="small" round @click="openEditDialog">修改档案</van-button>
            <van-button type="danger" size="small" round @click="openDeleteModal">解除绑定</van-button>
          </div>
        </div>
        <div v-else-if="loading" class="loading-tip">加载中...</div>
        <div v-else-if="error" class="empty-tip">{{ error }}</div>
      </van-tab>
      <van-tab title="药品管理">
        <DrugManage :elderInfoId="elderId" />
      </van-tab>
      <van-tab title="问答记录">
        <QuestionsRecords v-if="elderId" :elder-id="elderId" />
      </van-tab>
      <van-tab title="健康分析">
        <HealthAnalysis v-if="elderId" :elder-id="elderId" />
      </van-tab>
     <van-tab title="用药提醒">
     <div v-if="elderId">
      <MedicineReminder :key="elderId" :elder-id="elderId" />
     </div>
   </van-tab>
    </van-tabs>

    <!-- 编辑弹窗 -->
    <van-popup v-model:show="showEditDialog" position="bottom" round style="height: 85%">
      <div class="dialog-content">
        <h3>修改档案</h3>
        <van-form @submit="onEditSubmit">
          <van-cell-group inset>
            <van-field v-model="editForm.name" label="姓名" required />
            <van-field v-model="editForm.age" label="年龄" type="number" required />
            <van-field v-model="editForm.genderText" label="性别" readonly required @click="showGenderPicker = true" />
            <van-field v-model="editForm.height" label="身高(cm)" type="number" />
            <van-field v-model="editForm.weight" label="体重(kg)" type="number" />
            <van-field v-model="editForm.medicalHistory" label="基础病史" type="textarea" rows="2" />
            <van-field v-model="editForm.allergy" label="过敏史" />
            <van-field v-model="editForm.address" label="居住地址" type="textarea" rows="2" />
            <van-field v-model="editForm.emergencyContact" label="紧急联系人" />
            <van-field v-model="editForm.emergencyPhone" label="紧急联系电话" />
            <van-field v-model="editForm.relation" label="关系" />
          </van-cell-group>
          <div style="margin: 16px">
            <van-button  class="custom-edit-btn" block native-type="submit" :loading="editLoading">保存修改</van-button>
            <van-button style="margin-top: 12px" block @click="showEditDialog = false">取消</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onGenderConfirm" @cancel="showGenderPicker = false" />
    </van-popup>
    <div v-if="showDeleteModal" class="modal-mask" @click.self="closeDeleteModal">
      <div class="modal-box">
        <div class="modal-title">确认解除绑定吗</div>
        <div class="modal-content">
          解绑后需重新绑定老人档案，请问还要继续吗
        </div>
        <div class="modal-footer">
          <button class="footer-btn cancel" @click="closeDeleteModal">取消</button>
          <button class="footer-btn confirm" @click="confirmDelete" :disabled="deleteLoading">
            {{ deleteLoading ? '解绑中...' : '确认解绑' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getElderProfileByUserIdApi, updateOldmanProfileApi, deleteOldmanProfileApi } from '@/api/family'
import DrugManage from './DrugManage.vue'
import QuestionsRecords from './QuestionsRecords.vue'
import HealthAnalysis from './HealthAnalysis.vue'
import MedicineReminder from './MedicineReminder.vue'

const route = useRoute()
const router = useRouter()

const userId = ref('')
const elderId = ref('')
const profileData = ref(null)
const loading = ref(false)
const error = ref('')
const currentTab = ref(0)

const showEditDialog = ref(false)
const editLoading = ref(false)
const editForm = ref({
  id: '',
  userId: '',
  name: '',
  age: '',
  genderText: '',
  gender: '',
  phone: '',
  height: '',
  weight: '',
  medicalHistory: '',
  allergy: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  relation: ''
})
const showGenderPicker = ref(false)

const showDeleteModal = ref(false)
const deleteLoading = ref(false)

const goBack = () => router.back()

const loadProfile = async () => {
  if (!userId.value || !elderId.value) {
    error.value = '缺少必要参数'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await getElderProfileByUserIdApi(userId.value)
    if (res.success === 200 && res.data && res.data.length > 0) {
      const matched = res.data.find(item => (item.id || item.elderInfoId) == elderId.value)
      if (matched) {
        const archiveId = matched.id || matched.elderInfoId
        profileData.value = {
          ...matched,
          id: archiveId,
          userId: userId.value,
          username: matched.username || matched.name
        }
      } else {
        error.value = '未找到该老人的档案'
      }
    } else {
      error.value = '未找到老人档案'
    }
  } catch (err) {
    console.error(err)
    error.value = '网络异常，请重试'
  } finally {
    loading.value = false
  }
}

const openEditDialog = () => {
  if (!profileData.value) return
  const data = profileData.value
  const archiveId = data.id
  if (!archiveId) {
    showToast('无法获取档案ID，请刷新页面重试')
    return
  }
  editForm.value = {
    id: archiveId,
    userId: data.userId,
    name: data.name || '',
    age: data.age || '',
    genderText: data.gender === 1 ? '男' : data.gender === 2 ? '女' : '',
    gender: data.gender || '',
    height: data.height || '',
    weight: data.weight || '',
    medicalHistory: data.medicalHistory || '',
    allergy: data.allergy || '',
    address: data.address || '',
    emergencyContact: data.emergencyContact || '',
    emergencyPhone: data.emergencyPhone || '',
    relation: data.relation || ''
  }
  showEditDialog.value = true
}

const onGenderConfirm = (value) => {
  const selectedValue = value.selectedValues[0]
  editForm.value.genderText = selectedValue === 1 ? '男' : '女'
  editForm.value.gender = selectedValue
  showGenderPicker.value = false
}

const onEditSubmit = async () => {
  if (!editForm.value.name || !editForm.value.age || !editForm.value.gender) {
    showToast('请填写完整信息')
    return
  }
  editLoading.value = true
  try {
    const submitData = {
      id: editForm.value.id,
      userId: Number(editForm.value.userId),
      name: editForm.value.name,
      age: Number(editForm.value.age),
      gender: editForm.value.gender,
      height: editForm.value.height ? Number(editForm.value.height) : null,
      weight: editForm.value.weight ? Number(editForm.value.weight) : null,
      medicalHistory: editForm.value.medicalHistory || '',
      allergy: editForm.value.allergy || '',
      address: editForm.value.address || '',
      emergencyContact: editForm.value.emergencyContact || '',
      emergencyPhone: editForm.value.emergencyPhone || '',
      relation: editForm.value.relation || ''
    }
    const res = await updateOldmanProfileApi(submitData)
    if (res.success === 200) {
      showToast('修改成功')
      showEditDialog.value = false
      await loadProfile()
    } else {
      showToast(res.errorMsg || '修改失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常，请重试')
  } finally {
    editLoading.value = false
  }
}

// 打开删除弹窗
const openDeleteModal = () => {
  if (!profileData.value || !profileData.value.id) {
    showToast('无法获取档案ID')
    return
  }
  showDeleteModal.value = true
}

// 关闭删除弹窗
const closeDeleteModal = () => {
  showDeleteModal.value = false
}

// 确认删除
const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    const res = await deleteOldmanProfileApi(profileData.value.id)
    if (res.success === 200) {
      showToast('删除成功')
      router.push('/family')
    } else {
      showToast(res.errorMsg || '删除失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常')
  } finally {
    deleteLoading.value = false
    closeDeleteModal()
  }
}

onMounted(() => {
  const rawUserId = route.query.userId
  const rawElderId = route.query.elderId
  if (rawUserId && rawElderId) {
    userId.value = rawUserId
    elderId.value = rawElderId
    loadProfile()
  } else {
    error.value = '缺少用户ID或老人档案ID参数'
  }
})
</script>

<style scoped>
.elder-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #F5F7FA;
  min-height: 100vh;
  position: relative;
}
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.nav-title {
  font-size: 20px;
  font-weight: 600;
  color: #1E2A32;
}
.tabs {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 8px;
  margin-bottom: 0;
}
:deep(.van-tabs__nav) {
  background: transparent;
}
:deep(.van-tab) {
  font-size: 16px;
  font-weight: 500;
  color: #6C7A89;
}
:deep(.van-tab--active) {
  color: #2A7F6E;
}
:deep(.van-tabs__line) {
  background-color: #2A7F6E;
}
.resume-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.resume-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EDF2F7;
}
.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #5F9DB5 0%, #3B7C9E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
}
.basic-info h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
}
.basic-info p {
  margin: 0;
  color: #6C7A89;
}
.emergency-info {
  background: #F8F9FC;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.emergency-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}
.emergency-item .label {
  color: #6C7A89;
}
.emergency-item .value {
  font-weight: 500;
  color: #1E2A32;
}
.resume-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #F0F2F5;
  padding-bottom: 8px;
}
.label {
  color: #6C7A89;
  font-weight: 500;
}
.value {
  color: #1E2A32;
  font-weight: 500;
  text-align: right;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
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
.loading-tip, .empty-tip {
  text-align: center;
  padding: 60px;
  color: #999;
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
.custom-edit-btn {
  background-color: #1989fa !important;
  border: 1px solid #1989fa !important;
  color: #ffffff !important;
}

.custom-edit-btn:active,
.custom-edit-btn:disabled {
  background-color: #1989fa !important;
  border-color: #1989fa !important;
  opacity: 0.9;
}
</style>