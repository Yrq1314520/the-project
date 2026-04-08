<template>
  <div class="family-home page-container">
    <div class="header">
      <h2>家庭端</h2>
      <div class="user-info">
        <span>{{ userInfo.nickname || '家属' }}</span>
      </div>
    </div>
    
    <!-- 已绑定老人信息 -->
    <div class="elder-info-section">
      <div class="section-header">
        <h3>已绑定老人</h3>
        <span class="more-link" @click="goToBindOldman">查看全部</span>
      </div>
      <div class="elder-list">
        <div v-if="elderList.length === 0" class="empty-elder">
          <van-icon name="user-o" size="32" color="#ccc" />
          <p>还未绑定老人</p>
          <van-button size="small" type="primary" @click="goToBindOldman">立即绑定</van-button>
        </div>
        <div v-for="elder in elderList" :key="elder.id" class="elder-card">
          <div class="elder-avatar">
            <van-icon name="user-o" size="40" />
          </div>
          <div class="elder-info">
            <div class="elder-name">{{ elder.name || '老人' }}</div>
            <div class="elder-id">{{ elder.username }}</div>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
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
import { computed, ref } from 'vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 已绑定老人数据（后续从API获取）
const elderList = ref([])

// 注销功能
const handleLogout = async () => {
  // 弹出确认框，防止误点
  await showDialog({
    title: '确认注销',
    message: '确定要注销当前账号吗？此操作不可恢复。'
  })

  try {
    // 调用后端注销接口
    await logoutApi()
    // 清除本地状态
    userStore.logout()
    showToast('注销成功')
    // 跳转到登录页
    router.push('/login')
  } catch (err) {
    showToast('注销失败，请重试')
    console.error(err)
  }
}

// 跳转到绑定老人页面
const goToBindOldman = () => {
  router.push('/family/bind-oldman')
}

// 跳转到安全检测页面
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

.user-info {
  font-size: 16px;
  color: var(--text-secondary);
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

.elder-info-section {
  margin-bottom: 30px;
}

.elder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.elder-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: transform 0.2s;
}

.elder-card:active {
  transform: scale(0.98);
}

.elder-avatar {
  margin-right: 16px;
  width: 60px;
  height: 60px;
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

.elder-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.elder-id {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-elder {
  text-align: center;
  padding: 40px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
}

.empty-elder p {
  margin: 8px 0 16px;
  font-size: 14px;
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