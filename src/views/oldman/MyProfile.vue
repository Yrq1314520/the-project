<template>
  <div class="my-profile-page">
    <div class="nav-bar">
      <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
      <div class="nav-title">我的档案</div>
      <div style="width: 80px;"></div>
    </div>
    <div class="profile-content">
      <!-- 简历卡片 -->
      <div v-if="hasProfile" class="resume-card">
        <div class="resume-header">
          <div class="avatar">
            <van-icon name="user-o" size="56" />
          </div>
          <div class="basic-info">
            <h2>{{ profile.name || '未命名' }}</h2>
            <p>用户ID: {{ userId }} | 档案ID: {{ profile.id || '无' }}</p>
          </div>
        </div>
        <!-- 紧急联系人 -->
        <div class="emergency-info">
          <div class="emergency-item">
            <span class="label">紧急联系人</span>
            <span class="value">{{ profile.emergencyContact || '未设置' }}</span>
          </div>
          <div class="emergency-item">
            <span class="label">紧急联系电话</span>
            <span class="value">{{ profile.emergencyPhone || '未设置' }}</span>
          </div>
          <div class="emergency-item">
            <span class="label">与本人关系</span>
            <span class="value">{{ profile.relation || '未设置' }}</span>
          </div>
        </div>
        <!-- 简历 -->
        <div class="resume-details">
          <div class="detail-item"><span class="label">姓名</span><span class="value">{{ profile.name || '未填写' }}</span></div>
          <div class="detail-item"><span class="label">性别</span><span class="value">{{ profile.genderText || '未填写' }}</span></div>
          <div class="detail-item"><span class="label">年龄</span><span class="value">{{ profile.age ? profile.age + '岁' : '未填写' }}</span></div>
          <div class="detail-item"><span class="label">身高</span><span class="value">{{ profile.height ? profile.height + 'cm' : '未填写' }}</span></div>
          <div class="detail-item"><span class="label">体重</span><span class="value">{{ profile.weight ? profile.weight + 'kg' : '未填写' }}</span></div>
          <div class="detail-item full-width"><span class="label">居住地址</span><span class="value">{{ profile.address || '未填写' }}</span></div>
          <div class="detail-item full-width"><span class="label">基础病史</span><span class="value">{{ profile.medicalHistory || '无' }}</span></div>
          <div class="detail-item full-width"><span class="label">过敏史</span><span class="value">{{ profile.allergy || '无' }}</span></div>
        </div>
        <div class="action-buttons">
          <van-button class="edit-btn" size="medium" round @click="goEdit">修改档案</van-button>
          <van-button type="danger" size="medium" round @click="openDeleteModal">删除档案</van-button>
        </div>
      </div>
      <div v-else-if="!loading" class="empty-profile">
        <van-icon name="records-o" size="48" color="#ccc" />
        <p>暂无档案信息</p>
        <p class="sub">请点击下方按钮创建您的档案</p>
        <van-button class="edit-btn" round @click="goEdit" style="margin-top: 20px;">创建档案</van-button>
      </div>
      <div v-if="loading" class="loading-tip">加载中...</div>
      <div v-if="error" class="error-tip">{{ error }}</div>
    </div>
    <div v-if="showDeleteModal" class="modal-mask" @click.self="closeDeleteModal">
      <div class="modal-box">
        <div class="modal-title">确认删除档案</div>
        <div class="modal-content">
          删除后档案将永久清除，无法恢复，确定要继续吗？
        </div>
        <div class="modal-footer">
          <button class="footer-btn cancel" @click="closeDeleteModal">取消</button>
          <button class="footer-btn confirm" @click="confirmDelete" :disabled="deleteLoading">
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { getElderInfoByUserId, deleteElderInfo } from '@/api/elderInfo'

const router = useRouter()
const userStore = useUserStore()

const profile = ref({})
const loading = ref(false)
const error = ref('')
const userId = computed(() => userStore.userInfo?.id || '')

// 删除弹窗控制
const showDeleteModal = ref(false)
const deleteLoading = ref(false)

const hasProfile = computed(() => {
  return profile.value && (profile.value.id || profile.value.name)
})

// 返回
const goBack = () => {
  router.back()
}

// 加载档案
const loadProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const uid = userId.value
    if (!uid) {
      profile.value = {}
      return
    }
    const res = await getElderInfoByUserId(uid)
    if (res.code === 200 && res.data) {
      let data = res.data
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }
      if (!data) {
        profile.value = {}
        return
      }
      let genderText = ''
      if (data.gender === 1 || data.gender === '男') genderText = '男'
      else if (data.gender === 2 || data.gender === '女') genderText = '女'
      else genderText = data.gender || ''
      
      profile.value = {
        id: data.id,
        name: data.name || data.eldername || '',
        genderText: genderText,
        age: data.age || '',
        address: data.address || '',
        medicalHistory: data.medicalHistory || data.illness || '',
        allergy: data.allergy || '',
        height: data.height || '',
        weight: data.weight || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
        relation: data.relation || ''
      }
    } else {
      profile.value = {}
    }
  } catch (err) {
    console.error('获取档案失败', err)
    error.value = '加载档案失败，请稍后重试'
    showToast('网络异常，请重试')
    profile.value = {}
  } finally {
    loading.value = false
  }
}

// 跳转编辑
const goEdit = () => {
  router.push('/oldman/profile-edit')
}

// 删除
const openDeleteModal = () => {
  if (!profile.value.id) {
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
    const res = await deleteElderInfo(profile.value.id)
    if (res.code === 200) {
      showToast('删除成功')
      profile.value = {}
    } else {
      showToast(res.msg || res.errorMsg || '删除失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常，请重试')
  } finally {
    deleteLoading.value = false
    closeDeleteModal()
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.my-profile-page {
  background: #F5F7FA;
  min-height: 100vh;
  padding-bottom: 30px;
  position: relative;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #EDF2F7;
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav-title {
  font-size: 22px;
  font-weight: 600;
  color: #1E2A32;
}
.profile-content {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.resume-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
}
.resume-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EDF2F7;
}
.avatar {
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, #5F9DB5 0%, #3B7C9E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 24px;
}
.basic-info h2 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 600;
  color: #1E2A32;
}
.basic-info p {
  margin: 0;
  color: #6C7A89;
  font-size: 16px;
}
.emergency-info {
  background: #F8F9FC;
  border-radius: 20px;
  padding: 16px 20px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.emergency-item {
  display: flex;
  gap: 12px;
  font-size: 16px;
}
.emergency-item .label {
  color: #6C7A89;
  font-weight: 500;
}
.emergency-item .value {
  font-weight: 600;
  color: #1E2A32;
  font-size: 16px;
}
.resume-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 24px;
  margin-bottom: 32px;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #F0F2F5;
  padding-bottom: 12px;
}
.detail-item.full-width {
  grid-column: span 2;
}
.detail-item .label {
  color: #6C7A89;
  font-weight: 500;
  font-size: 16px;
}
.detail-item .value {
  color: #1E2A32;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
  max-width: 65%;
  font-size: 16px;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
}
.action-buttons .van-button {
  min-width: 120px;
  font-size: 16px;
  padding: 8px 20px;
}

.edit-btn {
  background-color: #1989fa !important;
  border-color: #1989fa !important;
  color: #fff !important;
}

.empty-profile {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  margin-top: 20px;
}
.empty-profile p {
  margin: 12px 0;
  color: #6C7A89;
  font-size: 16px;
}
.empty-profile .sub {
  font-size: 15px;
}
.loading-tip, .error-tip {
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 16px;
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