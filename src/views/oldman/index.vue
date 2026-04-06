<template>
  <div class="oldman-home">
    <div class="header">
      <h2>老人端</h2>
      <div class="user-info">
        <span>{{ userInfo.nickname || '老人' }}</span>
      </div>
    </div>
    
    <!-- 语音问答入口 -->
    <div class="voice-section">
      <div class="voice-card" @click="startVoiceQnA">
        <div class="voice-icon">
          <van-icon name="microphone" size="48" />
        </div>
        <h3>语音问答</h3>
        <p>点击开始语音交互</p>
      </div>
    </div>
    
    <!-- 功能网格 -->
    <div class="function-grid">
      <van-grid :column-num="2" gap="16">
        <van-grid-item icon="medicine-box" text="药品信息" to="/oldman/drug" />

        <van-grid-item icon="phone-o" text="紧急求助" to="/oldman/emergency" />
        <van-grid-item icon="contacts" text="紧急联系人" to="/oldman/emergency-contact" />
      </van-grid>
    </div>
    
    <!-- 健康状态 -->
    <div class="health-section">
      <h3>健康状态</h3>
      <div class="health-cards">
        <van-card>
          <template #title>
            今日状态
          </template>
          <div class="health-info">
            <div class="health-item">
              <span class="label">血压</span>
              <span class="value">120/80 mmHg</span>
            </div>
            <div class="health-item">
              <span class="label">血糖</span>
              <span class="value">5.6 mmol/L</span>
            </div>
            <div class="health-item">
              <span class="label">心率</span>
              <span class="value">72 次/分</span>
            </div>
          </div>
        </van-card>
      </div>
    </div>
    
    <!-- 紧急求助按钮 -->
    <div class="emergency-button">
      <van-button type="danger" block size="large" @click="goToEmergency">
        <van-icon name="warning" style="margin-right: 8px" />
        紧急求助
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 计算属性：用户信息
const userInfo = computed(() => userStore.userInfo)

// 开始语音问答
const startVoiceQnA = () => {
  // 检查浏览器是否支持语音识别
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
    
    recognition.onerror = (event) => {
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
  } else if (command.includes('求助') || command.includes('帮助')) {
    router.push('/oldman/emergency')
  } else if (command.includes('联系人') || command.includes('电话')) {
    router.push('/oldman/emergency-contact')
  } else {
    showToast('抱歉，我不太理解您的意思')
  }
}

// 跳转到紧急求助页面
const goToEmergency = () => {
  router.push('/oldman/emergency')
}
</script>

<style scoped>
.oldman-home {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
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
  color: #333;
}

.user-info {
  font-size: 16px;
  color: #666;
}

.voice-section {
  margin-bottom: 30px;
}

.voice-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.voice-card:hover {
  transform: translateY(-5px);
}

.voice-icon {
  margin-bottom: 16px;
}

.voice-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.voice-card p {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 0;
}

.function-grid {
  margin-bottom: 30px;
}

.health-section {
  margin-bottom: 30px;
}

.health-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.health-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.health-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.health-item:last-child {
  border-bottom: none;
}

.health-item .label {
  font-size: 14px;
  color: #666;
}

.health-item .value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.emergency-button {
  margin-top: 20px;
}
</style>