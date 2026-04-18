<template>
  <div class="family-home page-container">
    <div class="header">
      <h2>家庭端</h2>
      <user-menu/>
    </div>
    
    <!-- 功能网格 -->
    <div class="function-grid">
      <h3 class="grid-title">功能管理</h3>
      <van-grid :column-num="2" :gutter="16">
        <van-grid-item icon="user-o" text="绑定老人" to="/family/bind-oldman" />
        <van-grid-item icon="records" text="老人档案" to="/family/oldman-profile" />
        <van-grid-item icon="medal-o" text="药品管理" to="/family/drug-manage" />
        <van-grid-item icon="bell-o" text="预警通知" to="/family/warning" />
        <van-grid-item icon="warning-o" text="实时预警" to="/family/real-warning" />
        <van-grid-item icon="friends-o" text="紧急联系人" to="/family/emergency-contact" />
        <van-grid-item icon="chat-o" text="问答记录" to="/family/questions-records" />
      </van-grid>
    </div>
    
    <!-- 安全检测模块 -->
    <div class="safety-section">
      <div class="section-header">
        <h3>安全检测</h3>
        <span class="more-link" @click="goToSafetyDetection">详细检测</span>
      </div>
      <div class="safety-card">
        <div class="safety-item">
          <van-icon name="success" color="#52c41a" />
          <span>老人状态正常</span>
        </div>
        <div class="safety-item">
          <van-icon name="clock-o" />
          <span>上次检测：刚刚</span>
        </div>
      </div>
    </div>
    
    <!-- 注销按钮 -->
    <div class="logout-section">
      <van-button type="danger" block @click="handleLogout">
        <van-icon name="delete" style="margin-right: 8px" />
        用户注销
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { logoutApi } from '@/api/user'
import UserMenu from '../../components/UserMenu.vue'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = async () => {
  await showDialog({
    title: '确认注销',
    message: '确定要注销当前账号吗？此操作不可恢复。'
  })
  try {
    await logoutApi()
    userStore.logout()
    showToast('注销成功')
    router.push('/login')
  } catch (err) {
    showToast('注销失败，请重试')
    console.error(err)
  }
}

const goToSafetyDetection = () => {
  router.push('/family/safety-detection')
}
</script>

<style scoped>
.family-home {
  background: var(--bg-color);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}
.function-grid {
  margin-bottom: 30px;
}
.grid-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding: 0 8px;
}
.function-grid .van-grid-item {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 20px 0;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s;
}
.function-grid .van-grid-item:active {
  transform: scale(0.98);
}
.safety-section {
  margin-bottom: 30px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  padding: 0 8px;
}
.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.more-link {
  font-size: 14px;
  color: var(--primary-color);
  cursor: pointer;
}
.safety-card {
  background: linear-gradient(135deg, #E6F7FF 0%, #F6FFED 100%);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #B7EB8F;
}
.safety-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
}
.logout-section {
  margin-top: 40px;
  margin-bottom: 20px;
}
.logout-section .van-button {
  background: var(--danger-color);
  border: none;
  font-size: 16px;
  height: 52px;
  border-radius: var(--border-radius-lg);
}
</style>