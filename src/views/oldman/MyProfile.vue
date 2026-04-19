<template>
  <div class="elder-profile">
    <h2>我的档案</h2>
    
    <van-cell-group inset v-if="hasProfile">
      <van-field v-model="profile.name" label="姓名" readonly />
      <van-field v-model="profile.genderText" label="性别" readonly />
      <van-field v-model="profile.age" label="年龄" readonly />
      <van-field v-model="profile.medicalHistory" label="病史" type="textarea" readonly />
      <van-field v-model="profile.allergy" label="过敏史" readonly />
      <van-field v-model="profile.address" label="居住地址" readonly />
      <van-field v-model="profile.height" label="身高(cm)" readonly />
      <van-field v-model="profile.weight" label="体重(kg)" readonly />
      <van-field v-model="profile.emergencyContact" label="紧急联系人" readonly />
      <van-field v-model="profile.emergencyPhone" label="紧急联系人电话" readonly />
    </van-cell-group>
    
    <div v-else class="empty-profile">
      <van-icon name="records-o" size="48" color="#999" />
      <p>暂无档案信息</p>
      <p class="sub">请点击下方按钮创建您的档案</p>
    </div>

    <div style="padding:16px;margin-top:20px; display: flex; gap: 12px; flex-direction: column;">
      <van-button type="primary" block @click="goEdit">
        {{ hasProfile ? '修改档案' : '创建档案' }}
      </van-button>
      <van-button v-if="hasProfile" type="danger" block plain @click="handleDelete">
        删除档案
      </van-button>
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

const hasProfile = computed(() => {
  return profile.value && (profile.value.id || profile.value.age)
})

// 加载档案信息
const loadProfile = async () => {
  try {
    const res = await getElderInfoByUserId(userStore.userInfo.id)
    console.log('获取档案返回:', res)
    if (res.code === 200 && res.data) {
      let data = res.data
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }
      if (!data) {
        profile.value = {}
        return
      }
      console.log('完整档案数据:', data)
    
      let genderText = ''
      if (data.gender === 1 || data.gender === '男') genderText = '男'
      else if (data.gender === 2 || data.gender === '女') genderText = '女'
      else genderText = data.gender || ''
      
      profile.value = {
        id: data.id,  // 保存档案ID，用于删除
        name: data.name || '',
        genderText: genderText,
        age: data.age || '',
        medicalHistory: data.medicalHistory || data.illness || '',
        allergy: data.allergy || '',
        address: data.address || '',
        height: data.height || '',
        weight: data.weight || '',
        emergencyContact: data.emergencyContact || '',
        emergencyPhone: data.emergencyPhone || '',
      }
    } else {
      profile.value = {}
    }
  } catch (err) {
    console.error('获取档案失败', err)
    profile.value = {}
    showToast('加载档案失败，请稍后重试')
  }
}

const goEdit = () => {
  router.push('/oldman/profile-edit')
}

// 删除档案
const handleDelete = () => {
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
        // 清空档案信息，显示空状态
        profile.value = {}
        // 可选：跳转到创建档案页面或停留在当前页
        // router.push('/oldman/profile-edit')
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
.elder-profile {
  padding: 16px;
  background: var(--bg-color);
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
}
.empty-profile {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  margin: 20px 0;
}
.empty-profile p {
  margin: 12px 0;
  color: var(--text-secondary);
}
.empty-profile .sub {
  font-size: 14px;
}
</style>