<template>
  <div class="cancel-account-page">
    <div class="header">
      <h2>注销账号</h2>
    </div>
    
    <div class="warning-content">
      <van-icon name="warning-o" size="48" color="#ee0a24" />
      <h3>注销后将无法恢复</h3>
      <p>您的所有个人数据将被永久删除，且无法找回。</p>
      <p>确定要继续吗？</p>
    </div>
    
    <div class="action-buttons">
      <van-button type="danger" block @click="handleCancelAccount" :loading="loading">
        确认注销
      </van-button>
      <van-button type="default" block @click="goBack">
        再想想
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { cancelAccountApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const handleCancelAccount = async () => {
  try {
    // 二次确认
    await showConfirmDialog({
      title: '注销账号',
      message: '注销后所有数据将被清除，且无法恢复，确定继续吗？',
      confirmButtonColor: '#ee0a24'
    })
    
    loading.value = true
    const res = await cancelAccountApi()
    if (res.code === 200) {
      showToast('账号已注销')
      userStore.logout()
      router.replace('/login')
    } else {
      showToast(res.msg || '注销失败，请稍后重试')
    }
  } catch (err) {
    if (err !== 'cancel') {
      showToast('操作失败')
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.cancel-account-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

.warning-content {
  text-align: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 32px 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.warning-content h3 {
  margin: 16px 0 12px;
  font-size: 20px;
  color: #ee0a24;
}

.warning-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>