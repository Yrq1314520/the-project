<template>
  <div class="profile-page">
    <div class="header">
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <!-- 头像 -->
      <div class="avatar-section">
        <div class="avatar">
          <img :src="userInfo.avatar || defaultAvatar" alt="头像">
        </div>
        <h3>{{ userInfo.nickname }}</h3>
        <p>{{ userInfo.username }}</p>
      </div>
      
      <!-- 个人信息表单 -->
      <van-form @submit="onSubmit" ref="formRef" class="info-form">
        <van-cell-group inset>
          <van-field
            v-model="form.nickname"
            label="昵称"
            placeholder="请输入昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
          />
          <van-field
            v-model="form.email"
            label="邮箱"
            placeholder="请输入邮箱"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式' }
            ]"
          />
        </van-cell-group>
        
        <div style="margin: 16px">
          <van-button type="primary" block native-type="submit" :loading="loading">
            保存修改
          </van-button>
        </div>
      </van-form>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="warning" block @click="goToChangePassword">
          修改密码
        </van-button>
        <van-button type="danger" block @click="onLogout">
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { updateProfileApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/logo.png'

// 计算属性：用户信息
const userInfo = computed(() => userStore.userInfo)

// 表单数据
const form = reactive({
  nickname: '',
  email: ''
})

// 初始化表单数据
onMounted(() => {
  form.nickname = userInfo.value.nickname || ''
  form.email = userInfo.value.email || ''
})

// 提交修改
const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const res = await updateProfileApi(form)
    if (res && res.success === 200) {
      // 更新 store 中的用户信息
      userStore.setLoginInfo(userStore.token, {
        ...userInfo.value,
        ...form
      })
      showToast('修改成功')
    } else {
      showToast(res?.errorMsg || '修改失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loading.value = false
  }
}

// 跳转到修改密码页面
const goToChangePassword = () => {
  router.push('/user/change-password')
}

// 退出登录
const onLogout = () => {
  userStore.logout()
  router.push('/login')
  showToast('已退出登录')
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 16px;
  border: 2px solid #e0e0e0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.avatar-section p {
  font-size: 14px;
  color: #666;
  margin-bottom: 0;
}

.info-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>