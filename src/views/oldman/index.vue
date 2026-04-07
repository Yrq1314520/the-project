<template>
  <div class="oldman-home page-container oldman">
    <div class="header">
      <h2>老人端</h2>
      <div class="user-info">
        <span>{{ userInfo.nickname || '老人' }}</span>
      </div>
    </div>
    
    <div class="voice-section">
      <div class="voice-card" @click="startVoiceQnA">
        <div class="voice-icon pulse">
          <van-icon name="microphone" size="56" />
        </div>
        <h3>语音问答</h3>
        <p>按住说话，方言也懂您</p>
      </div>
    </div>
    
    <div class="function-grid">
      <van-grid :column-num="2" gap="16">
        <van-grid-item icon="chat-o" text="智能助手" to="/oldman/chat" />
        <van-grid-item icon="medicine-box" text="药品信息" to="/oldman/drug" />
        <van-grid-item icon="user-o" text="我的档案" to="/oldman/profile" />
        <van-grid-item icon="contacts" text="紧急联系人" to="/oldman/emergency-contact" />
      </van-grid>
    </div>
    
    <!-- 用药提醒模块 -->
    <div class="reminder-section">
      <div class="section-header">
        <h3>用药提醒</h3>
        <span class="more-link" @click="goToDrugList">全部药品</span>
      </div>
      <div class="reminder-list">
        <div v-if="reminderList.length === 0" class="empty-reminder">
          <van-icon name="medal-o" size="32" color="#ccc" />
          <p>暂无用药提醒</p>
        </div>
        <div v-for="item in reminderList" :key="item.id" class="reminder-card">
          <div class="reminder-info">
            <div class="drug-name">{{ item.drugName }}</div>
            <div class="drug-spec">{{ item.specification }}</div>
            <div class="reminder-time">
              <van-icon name="clock-o" />
              <span>{{ item.time }}</span>
            </div>
          </div>
          <div class="reminder-action">
            <van-button size="small" type="primary" plain @click="markTaken(item.id)">
              已服用
            </van-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="emergency-button">
      <van-button type="danger" block size="large" @click="goToEmergency">
        <van-icon name="warning" style="margin-right: 8px" />
        紧急求助
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

// 用药提醒数据，后期替换
const reminderList = ref([
  {
    id: 1,
    drugName: '阿司匹林肠溶片',
    specification: '100mg',
    time: '08:00 早餐后',
    taken: false
  },
  {
    id: 2,
    drugName: '硝苯地平缓释片',
    specification: '30mg',
    time: '12:30 午餐后',
    taken: false
  },
  {
    id: 3,
    drugName: '二甲双胍片',
    specification: '0.5g',
    time: '18:00 晚餐后',
    taken: false
  }
])

// 标记已服用
const markTaken = (id) => {
  const item = reminderList.value.find(i => i.id === id)
  if (item) {
    item.taken = true
    showToast(`已记录：${item.drugName} 已服用`)
  }
}

// 跳转到药品列表页
const goToDrugList = () => {
  router.push('/oldman/drug')
}

// 开始语音问答
const startVoiceQnA = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    showToast('请开始说话...')
    recognition.start()
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      showToast(`您说：${transcript}`)
      handleVoiceCommand(transcript)
    }
    recognition.onerror = () => {
      showToast('语音识别失败，请重试')
    }
  } else {
    showToast('您的浏览器不支持语音识别')
  }
}

// 处理语音命令
const handleVoiceCommand = (command) => {
  command = command.toLowerCase()
  if (command.includes('药品') || command.includes('吃药')) {
    router.push('/oldman/drug')
  } else if (command.includes('档案')) {
    router.push('/oldman/profile')
  } else if (command.includes('健康') || command.includes('数据')) {
    router.push('/oldman/health-data')
  } else if (command.includes('联系人') || command.includes('电话')) {
    router.push('/oldman/emergency-contact')
  } else {
    showToast('抱歉，我不太理解您的意思')
  }
}

// 跳转到紧急求助
const goToEmergency = () => {
  router.push('/oldman/emergency')
}

onMounted(() => {
  // 接口获取用药提醒列表
})
</script>

<style scoped>
.oldman-home {
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
.voice-section {
  margin-bottom: 30px;
}
.voice-card {
  background: linear-gradient(135deg, #5F9DB5 0%, #3B7C9E 100%);
  border-radius: 28px;
  padding: 32px 20px;
  text-align: center;
  color: white;
  box-shadow: 0 8px 20px rgba(59, 124, 158, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
}
.voice-card:active {
  transform: scale(0.98);
}
.pulse {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  70% { transform: scale(1.08); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}
.voice-icon {
  margin-bottom: 16px;
}
.voice-card h3 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}
.voice-card p {
  font-size: 15px;
  opacity: 0.9;
}
.function-grid {
  margin-bottom: 30px;
}
.reminder-section {
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
.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reminder-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--card-shadow);
}
.reminder-info {
  flex: 1;
}
.drug-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.drug-spec {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.reminder-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--warning-color);
}
.reminder-action .van-button {
  border-radius: 30px;
  padding: 0 16px;
  height: 36px;
}
.empty-reminder {
  text-align: center;
  padding: 40px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
}
.empty-reminder p {
  margin-top: 8px;
  font-size: 14px;
}
.emergency-button {
  margin-top: 20px;
}
.emergency-button .van-button {
  background: var(--danger-color);
  border: none;
  font-size: 18px;
  font-weight: bold;
  height: 56px;
  border-radius: 40px;
}
</style>