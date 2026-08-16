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
        <h3>{{ userInfo.nickname || userInfo.username }}</h3>
        <p>{{ userInfo.username || userInfo.phone }}</p>
      </div>
      
      <!-- 信息表单 -->
      <van-form @submit="onSave" ref="formRef" class="info-form">
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
      
      <!-- 修改等操作 -->
      <div class="action-buttons">
        <van-button type="warning" block @click="goToChangePwd">
          修改密码
        </van-button>
        <van-button type="danger" block @click="onLogout">
          退出登录
        </van-button>
        <van-button type="default" block @click="goToCancel">
          注销账号
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { updateProfileApi, getUserInfoApi, logoutApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<any>(null)
const loading = ref(false)
const defaultAvatar = 'https://img.yzcdn.cn/vant/logo.png'

const userInfo = computed(() => userStore.userInfo)

// 表单绑定数据
const form = reactive({
  nickname: '',
  email: ''
})

const userId = computed(() => userInfo.value?.id || userInfo.value?.userId)

// 拉取最新用户信息
const fetchUserInfo = async () => {
  if (!userId.value) return
  try {
    const res = await getUserInfoApi(userId.value)
    if (res.code === 200 && res.data) {
      userStore.setLoginInfo(userStore.token, res.data)
      form.nickname = res.data.nickname || ''
      form.email = res.data.email || ''
    } else {
      showToast(res.msg || '获取用户信息失败')
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
  }
}

// 初始化
onMounted(() => {
  if (userInfo.value) {
    form.nickname = userInfo.value.nickname || ''
    form.email = userInfo.value.email || ''
  }
  fetchUserInfo()
})

// 保存修改
const onSave = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const res = await updateProfileApi({
      nickname: form.nickname,
      email: form.email
    })
    if (res.code === 200) {
      await fetchUserInfo()
      showToast('修改成功')
    } else {
      showToast(res.msg || '修改失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loading.value = false
  }
}

// 跳转修改密码页
const goToChangePwd = () => {
  router.push('/user/change-password')
}

// 跳转注销账号页
const goToCancel = () => {
  router.push('/user/cancel-account')
}

// 退出登录
const onLogout = async () => {
  try {
    if (userStore.token) {
      await logoutApi({ token: userStore.token })
    }
  } catch (err) {
    console.error('退出接口调用失败', err)
  } finally {
    userStore.logout()
    router.push('/login')
    showToast('已退出登录')
  }
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