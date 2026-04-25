<template>
  <div class="family-home">
    <!-- 导航栏 -->
    <div class="navbar">
      <div class="logo">翼护银发</div>
      <div class="nav-actions">
        <div class="elder-selector">
          <select v-model="selectedElderValue" @change="onElderChange" class="elder-select">
            <option value="" disabled selected>选择老人</option>
            <option v-for="opt in elderOptions" :key="opt.value" :value="opt.value">
              {{ opt.text }}
            </option>
          </select>
        </div>
        <div class="nav-btn" @click="goToBindOldman">
          <van-icon name="add-o" size="20" />
          <span>绑定老人</span>
        </div>
        <user-menu />
      </div>
    </div>

    <!-- 轮播 -->
     <van-swipe class="my-swipe" :autoplay="2500" indicator-color="white" loop>
      <van-swipe-item v-for="(item, index) in swipeList" :key="index">
        <div class="swipe-bg" :style="{ backgroundImage: `url(${item.img})` }">
          <div class="tip-overlay"></div>
          <div class="tip-text" :class="{ 'tip-right': item.textPosition === 'right' }">
            <p>{{ item.text }}</p>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 注销按钮 -->
    <div class="logout-wrapper">
      <van-button plain type="danger" block round @click="handleLogout">注销账号</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/store/user'
import { logoutApi } from '@/api/user'
import { getBoundEldersApi } from '@/api/family'
import UserMenu from '@/components/UserMenu.vue'
import img4 from '@/assets/picture.jpg'
import img8 from '@/assets/garden.png'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const elderOptions = ref([])
const selectedElderValue = ref('')
const warningSection = ref(null)


// 加载已绑定老人
const loadBoundElders = async () => {
  try {
    const res = await getBoundEldersApi()
    if (res.success === 200 && res.data && res.data.length > 0) {
      const elders = res.data
      const options = elders.map(item => ({
        text: item.username,
        value: item.elderInfoId,
        elderInfoId: item.elderInfoId,
        userId: item.userId
      }))
      elderOptions.value = options
    } else {
      const localElders = JSON.parse(localStorage.getItem('localElders') || '[]')
      if (localElders.length > 0) {
        elderOptions.value = localElders.map(e => ({
          text: e.name,
          value: e.elderInfoId || e.id,
          elderInfoId: e.elderInfoId || e.id,
          userId: e.userId
        }))
        showToast({ message: '当前显示本地暂存老人', type: 'warning', duration: 2000 })
      } else {
        elderOptions.value = []
      }
    }
  } catch (err) {
    console.error(err)
    const localElders = JSON.parse(localStorage.getItem('localElders') || '[]')
    if (localElders.length > 0) {
      elderOptions.value = localElders.map(e => ({
        text: e.name,
        value: e.elderInfoId || e.id,
        elderInfoId: e.elderInfoId || e.id,
        userId: e.userId
      }))
      showToast({ message: '网络异常，显示本地暂存老人', type: 'warning', duration: 2000 })
    } else {
      elderOptions.value = []
    }
  }
}

const onElderChange = (event) => {
  const selectedValue = event.target.value
  if (!selectedValue) return
  const selected = elderOptions.value.find(opt => opt.value == selectedValue)
  if (selected && selected.elderInfoId && selected.userId) {
    router.push(`/family/elder-detail?elderId=${selected.elderInfoId}&userId=${selected.userId}`)
  } else {
    showToast('无法获取该老人的档案ID或用户ID，请重新绑定')
  }
}

const goToBindOldman = () => router.push('/family/bind-oldman')
const scrollToWarning = () => {
  if (warningSection.value) {
    warningSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
const goToWarningDetail = () => router.push('/family/warning')

//轮播
const swipeList = ref([
  {
    img: img4,
    text: '老年人身体机能减弱，肝肾功能代谢慢，用药一定要格外谨慎。首先要严格遵从医嘱，不要自行加药、减药或停药，避免多种药物混用带来风险。平时帮老人整理好药品，做好服药提醒，防止漏服、重复服用。用药期间多观察老人反应，若出现头晕、乏力、肠胃不适等情况，要及时停药并就医。同时不要轻信偏方保健品，确保用药安全、简单、有效，守护好老人健康。',
    textPosition: 'left'
  },
  {
    img: img8,
    text: '老年人需要陪伴，作为子女多陪伴家中老人，耐心倾听、温柔相伴，能缓解孤独焦虑，舒缓身心压力，愉悦心情，有效增进身心健康，让老人晚年温暖又安心。日常多用心陪伴家中老人，耐心倾听他们的心声，温柔耐心相伴左右。用心关怀、暖心陪伴，既能化解老人的孤独与焦虑，舒缓身心疲惫，滋养情绪，更能守护身心健康。',
    textPosition: 'right'
  }
])

// 点击可跳转
const handleWarningClick = (item) => {
  if (!item.isRead) {
    warningStore.markAsRead(item.id)
  }
  router.push('/family/warning')
}

const handleLogout = async () => {
  await showConfirmDialog({
    title: '确认注销',
    message: '注销后需重新登录，确定继续吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  try {
    await logoutApi()
    userStore.logout()
    showToast('已注销')
    router.push('/login')
  } catch (err) {
    showToast('注销失败')
  }
}

watch(() => route.path, (newPath) => {
  if (newPath === '/family') loadBoundElders()
})

onMounted(() => {
  loadBoundElders()
})
</script>

<style scoped>
.family-home {
  width: 100%;
  margin: 0 auto;
  background-color: #F5F7FA;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgb(239, 252, 251);
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.logo {
  font-size: 22px;
  font-weight: 600;
  color: #2A7F6E;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.elder-selector {
  min-width: 120px;
  width: auto;
}
.elder-select {
  background: #F8F9FC;
  border: none;
  border-radius: 40px;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #2A7F6E;
  cursor: pointer;
  outline: none;
  font-family: inherit;
}
.elder-select:hover {
  background: #E8ECF0;
}
.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 40px;
  background: #F8F9FC;
  border-radius: 40px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #2A7F6E;
}
.nav-btn:hover {
  background: #E8ECF0;
}
.nav-warning {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 40px;
  background: #F8F9FC;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #2A7F6E;
}

.my-swipe {
  width: 100%;
  margin: 0;
  aspect-ratio: 16 / 9;
  background-color: #e9ecef;
}

.swipe-bg {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: right center;
  background-repeat: no-repeat;
}

.tip-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}


.tip-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 55%;
  height: 100%;
  display: flex;
  color: #fff;
  align-items: center;
  padding: 0 40px;
  box-sizing: border-box;
  z-index: 2;
}


.tip-text.tip-right {
  left: auto;
  right: 0;
  text-align: right;
  justify-content: flex-end;
}


.tip-text.tip-right p {
  text-align: right;
}


@media (max-width: 768px) {
  .tip-text {
    width: 70%;
    padding: 0 20px;
  }
  .tip-text p {
    font-size: 14px;
  }
}


.warning-section {
  background: white;
  border-radius: 0;
  padding: 20px;
  margin: 0 0 24px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.more-link {
  font-size: 14px;
  color: #2A7F6E;
  cursor: pointer;
}
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.warning-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F8F9FC;
  border-radius: 0;
  cursor: pointer;
  transition: background 0.2s;
}
.warning-card:hover {
  background: #E8ECF0;
}
.warning-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.warning-icon.alert {
  background: #FFEFEF;
  color: #E76F51;
}
.warning-icon.email {
  background: #E8F4FD;
  color: #2A7F6E;
}
.warning-info {
  flex: 1;
}
.warning-title {
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #E76F51;
  border-radius: 50%;
}
.warning-desc {
  font-size: 14px;
  color: #6C7A89;
  margin-top: 2px;
}
.warning-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.empty-warning {
  text-align: center;
  padding: 40px;
  color: #999;
}
.logout-wrapper {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 40px;
}
.logout-wrapper .van-button {
  width: 100%;
}
</style>