<template>
  <div class="chat-page page-container oldman">
    <van-nav-bar
      title="智能助手"
      left-text="返回"
      left-arrow
      @click-left="goBack"
      fixed
      placeholder
    />

    <div class="chat-content" ref="chatContentRef">
      <div v-if="messages.length === 0" class="empty-chat">
        <van-icon name="chat-o" size="56" color="#6DA3B8" />
        <p>您好，我是您的健康管家</p>
        <p>可以问我关于用药、健康、饮食等问题</p>
      </div>
      <div v-else class="message-list">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['message-item', msg.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="message-bubble">
            <div class="message-text">{{ msg.content }}</div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>
        <div v-if="isLoading" class="message-item assistant-message">
          <div class="message-bubble loading-bubble">
            <van-loading size="20px" type="spinner" />
            <span class="loading-text">思考中...</span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-bar">
      <van-field
        v-model="inputText"
        type="textarea"
        placeholder="输入您的问题..."
        autosize
        rows="1"
        class="chat-input"
        @keyup.enter="sendMessage"
      />
      <van-button
        type="primary"
        :loading="isLoading"
        :disabled="!inputText.trim()"
        @click="sendMessage"
        class="send-btn"
      >
        发送
      </van-button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'   

const router = useRouter()
const userStore = useUserStore()
const chatContentRef = ref<HTMLElement | null>(null)
const inputText = ref('')
const isLoading = ref(false)
const messages = ref<Record<string, any>[]>([])

const goBack = () => router.back()

const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
  }
}

// 获取当前老人的档案id
const getElderId = () => {

  const id = userStore.userInfo?.elderInfoId || 
             userStore.userInfo?.elderId ||
             (userStore as any).elderInfoId ||
             localStorage.getItem('elderInfoId') ||
             localStorage.getItem('elderId')
  return id ? Number(id) : null
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({
    role: 'user',
    content: text,
    time: getCurrentTime()
  })
  inputText.value = ''
  scrollToBottom()

  // 获取老人档案ID
  const elderId = getElderId()
  if (!elderId) {
    console.error('未获取到老人档案ID，无法关联预警')
    showToast('请重新登录后再试')
    return
  }

  isLoading.value = true
  try {
    const res = await request({
      url: '/v1/voice/chat/text',
      method: 'post',
      data: { 
        question: text,
        elderId: elderId   // 关键：携带 elderId
      }
    })
    if (res.code === 200 && res.data) {
      const reply = res.data.answer || res.data.reply || res.data
      messages.value.push({
        role: 'assistant',
        content: typeof reply === 'string' ? reply : JSON.stringify(reply),
        time: getCurrentTime()
      })
    } else {
      showToast(res.msg || '服务繁忙，请稍后再试')
      messages.value.push({
        role: 'assistant',
        content: '抱歉，我暂时无法回答，请稍后再试。',
        time: getCurrentTime()
      })
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常，请检查连接')
    messages.value.push({
      role: 'assistant',
      content: '网络开小差了，请稍后再试试。',
      time: getCurrentTime()
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

onMounted(() => {
  if (!getElderId()) {
    console.warn('未获取到老人档案ID，预警功能将无法关联')
    showToast({ message: '请重新登录以关联健康档案', type: 'warning' as any, duration: 3000 })
  }
  if (messages.value.length === 0) {
    messages.value.push({
      role: 'assistant',
      content: '您好！我是您的智慧康养助手。您可以问我关于药品用法、健康建议、饮食营养等问题。',
      time: getCurrentTime()
    })
  }
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color);
  padding: 0;
}
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  padding-bottom: 20px;
}
.empty-chat {
  text-align: center;
  margin-top: 40%;
  color: var(--text-secondary);
}
.empty-chat p {
  margin: 12px 0;
  font-size: 16px;
}
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.message-item {
  display: flex;
  width: 100%;
}
.user-message {
  justify-content: flex-end;
}
.assistant-message {
  justify-content: flex-start;
}
.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  word-wrap: break-word;
}
.user-message .message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}
.assistant-message .message-bubble {
  background-color: #f0f2f5;
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}
.message-text {
  font-size: 17px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.message-time {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.6;
  text-align: right;
}
.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}
.assistant-message .message-time {
  color: var(--text-secondary);
}
.loading-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f2f5;
}
.loading-text {
  font-size: 15px;
  color: var(--text-secondary);
}
.input-bar {
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border-light);
  gap: 10px;
}
.chat-input {
  flex: 1;
  background-color: #f5f7fa;
  border-radius: 24px;
  --van-field-label-width: 0;
}
.chat-input :deep(.van-field__control) {
  font-size: 16px;
  padding: 10px 16px;
}
.send-btn {
  border-radius: 30px;
  padding: 0 18px;
  height: 44px;
  background-color: var(--primary-color);
  border: none;
  font-weight: 500;
}
.send-btn:active {
  background-color: var(--primary-dark);
}
.send-btn:disabled {
  background-color: #bdd4de;
  opacity: 0.6;
}
</style>