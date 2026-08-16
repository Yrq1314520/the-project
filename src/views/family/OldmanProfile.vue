<template>
  <div class="profile-page page-container">
    <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
    <div class="header">
      <h2>老人档案管理</h2>
    </div>
    <van-cell-group inset>
      <van-field
        v-model="manualUserId"
        label="老人用户ID"
        placeholder="输入ID后点击查询"
        type="number"
      />
      <div style="padding: 12px;">
        <van-button type="primary" block @click="onManualSearch">查询档案</van-button>
      </div>
    </van-cell-group>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" color="#1989fa" />
      <p>加载中...</p>
    </div>

    <!-- 显示档案信息 -->
    <div v-else-if="profileData && !noProfile" class="elder-card">
      <div class="elder-avatar">
        <van-icon name="user-o" size="48" />
      </div>
      <div class="elder-info">
        <div class="elder-username">{{ profileData.name || '未命名' }}</div>
        <div class="elder-phone">
          {{ profileData.age }}岁
          <span class="gender-tag" :class="{ 'male': profileData.gender === 1, 'female': profileData.gender === 2 }">
            {{ profileData.gender === 1 ? '男' : profileData.gender === 2 ? '女' : '' }}
          </span>
          <span v-if="profileData.relation" class="relation">关系：{{ profileData.relation }}</span>
        </div>
      </div>
      <div class="btn-group">
        <van-button size="small" type="primary" round @click="openViewDialog(profileData)">查看</van-button>
        <van-button size="small" type="success" round @click="openEditDialog(profileData)">编辑</van-button>
        <van-button size="small" type="danger" round @click="onDelete(profileData.id)">删除</van-button>
      </div>
    </div>

    <!-- 无档案时就显示新增按钮 -->
    <div v-else-if="searched && noProfile" class="empty-state">
      <van-icon name="profile" size="48" color="#ccc" />
      <p>未找到该老人的档案</p>
      <van-button size="small" type="primary" round @click="openAddDialog">新增档案</van-button>
    </div>

    <div v-else-if="!searched" class="empty-state">
      <van-icon name="search" size="48" color="#ccc" />
      <p>请输入老人用户ID查询</p>
    </div>

  
    <van-popup v-model:show="showDialog" position="bottom" style="height: 85%">
      <div class="dialog-content">
        <h3>{{ isEdit ? '编辑老人档案' : '新增老人档案' }}</h3>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field v-model="form.userId" label="用户ID" type="number" required :readonly="!!bindUserId" />
            <van-field v-model="form.name" label="姓名" required />
            <van-field v-model="form.age" label="年龄" type="number" required />
            <van-field v-model="form.genderText" label="性别" readonly required @click="showGenderPicker = true" />
            <van-field v-model="form.height" label="身高(cm)" type="number" />
            <van-field v-model="form.weight" label="体重(kg)" type="number" />
            <van-field v-model="form.medicalHistory" label="基础病史" type="textarea" rows="2" />
            <van-field v-model="form.allergy" label="过敏史" />
            <van-field v-model="form.emergencyContact" label="紧急联系人" />
            <van-field v-model="form.emergencyPhone" label="紧急联系电话" />
            <van-field v-model="form.address" label="居住地址" type="textarea" rows="2" />
            <van-field v-model="form.relation" label="关系" />
          </van-cell-group>
          <div style="margin: 20px 0;">
            <van-button type="primary" block native-type="submit" :loading="submitLoading" size="large">
              {{ isEdit ? '保存修改' : '提交' }}
            </van-button>
            <van-button style="margin-top: 12px" block @click="showDialog = false" size="large">取消</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 查看档案 -->
<van-popup v-model:show="showViewDialog" position="bottom" round style="height: 85%">
  <div class="dialog-content">
    <h3>档案详情</h3>
    <div class="profile-detail-content" v-if="currentProfile">
      <div class="detail-item">
        <span class="detail-label">用户ID</span>
        <span class="detail-value">{{ currentProfile.userId || currentProfile.elderuserId || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">姓名</span>
        <span class="detail-value">{{ currentProfile.name || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">年龄</span>
        <span class="detail-value">{{ currentProfile.age || '-' }}岁</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">性别</span>
        <span class="detail-value">{{ currentProfile.gender === 1 ? '男' : currentProfile.gender === 2 ? '女' : '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">身高</span>
        <span class="detail-value">{{ currentProfile.height ? currentProfile.height + 'cm' : '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">体重</span>
        <span class="detail-value">{{ currentProfile.weight ? currentProfile.weight + 'kg' : '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">居住地址</span>
        <span class="detail-value">{{ currentProfile.address || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">基础病史</span>
        <span class="detail-value">{{ currentProfile.medicalHistory || '无' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">过敏史</span>
        <span class="detail-value">{{ currentProfile.allergy || '无' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">紧急联系人</span>
        <span class="detail-value">{{ currentProfile.emergencyContact || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">紧急联系电话</span>
        <span class="detail-value">{{ currentProfile.emergencyPhone || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">关系</span>
        <span class="detail-value">{{ currentProfile.relation || '-' }}</span>
      </div>
    </div>
    <div style="margin: 20px 0;">
      <van-button block @click="showViewDialog = false">关闭</van-button>
    </div>
  </div>
</van-popup>


    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker :columns="[{ text: '男', value: 1 }, { text: '女', value: 2 }]" @confirm="onGenderConfirm" @cancel="showGenderPicker = false" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/user'
import {
  addOldmanProfileApi,
  updateOldmanProfileApi,
  deleteOldmanProfileApi,
  getElderProfileByUserIdApi,
  bindElderAccountApi
} from '@/api/family'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentUserId = ref('')
const manualUserId = ref('')
const profileData = ref<Record<string, any> | null>(null)
const noProfile = ref(false)
const searched = ref(false)
const loading = ref(false)

const showDialog = ref(false)
const showViewDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const currentProfile = ref<Record<string, any> | null>(null)
const currentId = ref('')
const showGenderPicker = ref(false)

const goBack = () => router.back()

const form = reactive({
  id: '',
  userId: '',
  name: '',
  age: '',
  genderText: '',
  gender: '',
  height: '',
  weight: '',
  medicalHistory: '',
  allergy: '',
  emergencyContact: '',
  emergencyPhone: '',
  address: '',
  relation: ''
})

const bindUserId = ref<any>(null)

const loadProfile = async (userId: any) => {
  if (!userId) return
  loading.value = true
  searched.value = true
  try {
    const res = await getElderProfileByUserIdApi(userId)
    if (res.success === 200 && res.data && res.data.length > 0) {
      const profile = res.data[0]
      profileData.value = {
        ...profile,
        userId: userId
      }
      noProfile.value = false
    } else {
      profileData.value = null
      noProfile.value = true
    }
  } catch (err) {
    profileData.value = null
    noProfile.value = true
  } finally {
    loading.value = false
  }
}

const onManualSearch = () => {
  if (!manualUserId.value) {
    showToast('请输入用户ID')
    return
  }
  currentUserId.value = manualUserId.value
  loadProfile(currentUserId.value)
}

const openAddDialog = () => {
  const userId = bindUserId.value || currentUserId.value
  if (!userId) {
    showToast('无法获取用户ID')
    return
  }
  isEdit.value = false
  Object.keys(form).forEach(key => { (form as any)[key] = '' })
  form.userId = userId
  showDialog.value = true
}

const openEditDialog = (item: any) => {
  isEdit.value = true
  currentId.value = item.id
  Object.assign(form, item)
  form.genderText = item.gender === 1 ? '男' : item.gender === 2 ? '女' : ''
  showDialog.value = true
}

const openViewDialog = (item: any) => {
  currentProfile.value = item
  showViewDialog.value = true
}

const onGenderConfirm = (value: any) => {
  const selected = value.selectedValues[0]
  form.genderText = selected === 1 ? '男' : '女'
  form.gender = selected
  showGenderPicker.value = false
}

const onSubmit = async () => {
  try {
    if (!form.userId) return showToast('请输入用户ID')
    if (!form.name) return showToast('请输入姓名')
    if (!form.age) return showToast('请输入年龄')
    if (!form.gender) return showToast('请选择性别')
    
    submitLoading.value = true
    const submitData = {
      userId: Number(form.userId),
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
      medicalHistory: form.medicalHistory || '',
      allergy: form.allergy || '',
      emergencyContact: form.emergencyContact || '',
      emergencyPhone: form.emergencyPhone || '',
      address: form.address || '',
      relation: form.relation || ''
    }

    if (isEdit.value) {
      ;(submitData as any).id = currentId.value
      const res = await updateOldmanProfileApi(submitData)
      if (res.success === 200) {
        showToast('修改成功')
        showDialog.value = false
        loadProfile(currentUserId.value)
      } else {
        showToast(res.errorMsg || '修改失败')
      }
    } else {
      const res = await addOldmanProfileApi(submitData)
      if (res.success === 200) {
        showToast('添加成功')
        showDialog.value = false
        const newId = res.data?.id
        if (newId) {
          let localElders = JSON.parse(localStorage.getItem('localElders') || '[]')
          const existing = localElders.find((e: any) => e.userId == form.userId)
          if (existing) {
            existing.elderInfoId = newId
          } else {
            localElders.push({
              name: form.name,
              username: form.name,
              userId: form.userId,
              elderInfoId: newId
            })
          }
          localStorage.setItem('localElders', JSON.stringify(localElders))
        }
        
        // 如果是通过绑定页面跳转过来的就自动绑定
        if (route.query.isFamilyBinding === 'true') {
          const elderInfoId = res.data?.id
          if (elderInfoId) {
            const bindRes = await bindElderAccountApi({
              elderInfoId: elderInfoId,
              elderuserId: userStore.userInfo.id   // 家属自己的userId
            })
            if (bindRes.success === 200) {
              showToast('绑定成功')
              router.push('/family')
            } else {
              showToast(bindRes.errorMsg || '绑定失败，请手动绑定')
              router.push('/family')
            }
          } else {
            showToast('获取档案ID失败，请手动绑定')
            router.push('/family')
          }
        } else {
          loadProfile(currentUserId.value)
        }
      } else {
        showToast(res.errorMsg || '添加失败')
      }
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常，请重试')
  } finally {
    submitLoading.value = false
  }
}

const onDelete = async (id: any) => {
  try {
    await showConfirmDialog({ title: '确认删除', message: '确定要删除这条老人档案吗？' })
    const res = await deleteOldmanProfileApi(id)
    if (res.success === 200) {
      showToast('删除成功')
      let localElders = JSON.parse(localStorage.getItem('localElders') || '[]')
      localElders = localElders.filter((e: any) => e.elderInfoId != id)
      localStorage.setItem('localElders', JSON.stringify(localElders))
      profileData.value = null
      noProfile.value = true
      searched.value = true
    } else {
      showToast(res.errorMsg || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') showToast('删除失败')
  }
}

onMounted(() => {
  if (route.query.userId) {
    bindUserId.value = route.query.userId as string
    currentUserId.value = route.query.userId as string
    manualUserId.value = route.query.userId as string
    if (route.query.isFamilyBinding === 'true') {
      openAddDialog()
      if (route.query.username) form.name = decodeURIComponent(route.query.username as string)
    } else {
      loadProfile(currentUserId.value)
    }
  }
})
</script>

<style scoped>
.profile-page {
  background: var(--bg-color);
}
.header {
  margin-bottom: 30px;
}
.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0;
}
.elder-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: var(--card-shadow);
  margin-top: 20px;
}
.elder-avatar {
  margin-right: 16px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #5F9DB5 0%, #3B7C9E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.elder-info {
  flex: 1;
}
.elder-username {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.elder-phone {
  font-size: 14px;
  color: var(--text-secondary);
}
.gender-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
}
.gender-tag.male {
  background: #e6f7ff;
  color: #1890ff;
}
.gender-tag.female {
  background: #fff1f0;
  color: #ff4d4f;
}
.relation {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}
.btn-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  margin-top: 30px;
}
.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}
.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}
.loading-state p {
  margin-top: 12px;
  font-size: 14px;
}
.dialog-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
.dialog-content h3 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.profile-detail-content {
  background: var(--bg-color);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.detail-item:last-child {
  border-bottom: none;
}
.detail-label {
  font-size: 14px;
  color: var(--text-secondary);
  flex: 1;
}
.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  flex: 2;
  text-align: right;
  word-break: break-all;
}
</style>