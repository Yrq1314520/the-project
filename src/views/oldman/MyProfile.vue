<template>
  <div class="my-profile-page">
    <!-- 自定义导航栏：返回按钮 、 标题 -->
    <div class="nav-bar">
      <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
      <div class="nav-title">我的档案</div>
      <div style="width: 80px;"></div>
    </div>

    <div class="profile-content">
      <!-- 简历卡片 -->
      <div v-if="hasProfile" class="resume-card">
        <!-- 头像 + 基本信息 -->
        <div class="resume-header">
          <div class="avatar">
            <van-icon name="user-o" size="56" />
          </div>
          <div class="basic-info">
            <h2>{{ profile.name || '未命名' }}</h2>
            <p>用户ID: {{ userId }} | 档案ID: {{ profile.id || '无' }}</p>
          </div>
        </div>

        <!-- 紧急联系人专区（突出显示） -->
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

        <!-- 两列简历详情（字体放大） -->
        <div class="resume-details">
          <div class="detail-item"><span class="label">姓名</span><span class="value">{{ profile.name || '未填写' }}</span></div>
          <div class="detail-item"><span class="label">性别</span><span class="value">{{ profile.genderText || '未填写' }}</span></div>
          <div class="detail-item"><span class="label">年龄</span><span class="value">{{ profile.age ? profile.age + '岁' : '未填写' }}</span></div>
          <!-- <div class="detail-item"><span class="label">联系电话</span><span class="value">{{ profile.phone || '未填写' }}</span></div> -->
          <div class="detail-item"><span class="label">身高</span><span class="value">{{ profile.height ? profile.height + 'cm' : '未填写' }}</span></div>
          <div class="detail-item"><span class="label">体重</span><span class="value">{{ profile.weight ? profile.weight + 'kg' : '未填写' }}</span></div>
          <div class="detail-item full-width"><span class="label">居住地址</span><span class="value">{{ profile.address || '未填写' }}</span></div>
          <div class="detail-item full-width"><span class="label">基础病史</span><span class="value">{{ profile.medicalHistory || '无' }}</span></div>
          <div class="detail-item full-width"><span class="label">过敏史</span><span class="value">{{ profile.allergy || '无' }}</span></div>
        </div>

        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <van-button type="primary" size="medium" round @click="goEdit">修改档案</van-button>
          <van-button type="danger" size="medium" round @click="handleDelete">删除档案</van-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-profile">
        <van-icon name="records-o" size="48" color="#ccc" />
        <p>暂无档案信息</p>
        <p class="sub">请点击下方按钮创建您的档案</p>
        <van-button type="primary" round @click="goEdit" style="margin-top: 20px;">创建档案</van-button>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-tip">加载中...</div>
      <div v-if="error" class="error-tip">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/user'
import { getElderInfoByUserId, deleteElderInfo } from '@/api/elderInfo'

const router = useRouter()
const userStore = useUserStore()

const profile = ref({})
const loading = ref(false)
const error = ref('')

// 用户ID（从 store 获取）
const userId = computed(() => userStore.userInfo?.id || '')

const hasProfile = computed(() => {
  return profile.value && (profile.value.id || profile.value.name)
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载档案信息
const loadProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const uid = userId.value
    if (!uid) {
      console.warn('用户未登录')
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
      // 性别文本转换
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
    if (err.response?.status === 404) {
      showToast('未找到档案，请先创建')
    } else {
      showToast('网络异常，请重试')
    }
    profile.value = {}
  } finally {
    loading.value = false
  }
}

// 跳转编辑/创建页面
const goEdit = () => {
  router.push('/oldman/profile-edit')
}

// 删除档案
const handleDelete = () => {
  if (!profile.value.id) {
    showToast('无法获取档案ID')
    return
  }
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除您的档案吗？此操作不可恢复。',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
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
    }
  }).catch(() => {})
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
}

/* 顶部导航栏 */
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

/* 内容区域 - 全宽无居中限制 */
.profile-content {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 简历卡片 - 占满宽度 */
.resume-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
}

/* 头部 */
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

/* 紧急联系人专区 */
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

/* 两列简历详情 - 字体放大 */
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

/* 操作按钮 */
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

/* 空状态 */
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
</style>