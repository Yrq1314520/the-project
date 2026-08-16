<template>
  <div class="emergency-help">
    <div class="header">
      <h2>紧急求助</h2>
    </div>
    
    <div class="emergency-content">
      <!-- 紧急求助按钮 -->
      <div class="emergency-button-container">
        <div class="emergency-button" @click="sendEmergencyHelp">
          <van-icon name="warning" size="64" />
          <h3>紧急求助</h3>
          <p>点击发送求助信息</p>
        </div>
      </div>
      
      <!-- 紧急联系人 -->
      <div class="contact-section">
        <h3>紧急联系人</h3>
        <van-cell-group inset>
          <van-cell 
            v-for="contact in emergencyContacts" 
            :key="contact.id"
            :title="contact.name"
            :value="contact.phone"
            is-link
            @click="callContact(contact.phone)"
          >
            <template #icon>
              <van-icon name="phone-o" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <!-- 求助记录 -->
      <div class="history-section">
        <h3>求助记录</h3>
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell 
            v-for="item in helpHistory" 
            :key="item.id"
            :title="`求助时间: ${item.time}`"
            :value="item.status"
          >
            <template #right-icon>
              <van-icon :name="item.status === '已处理' ? 'success' : 'clock-o'" />
            </template>
          </van-cell>
        </van-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { sendEmergencyHelpApi } from '@/api/family'

// TODO: 以下接口尚未在 api 层定义，暂时使用本地占位实现
async function getEmergencyContactsApi(): Promise<any> {
  // TODO: 替换为真实接口
  return { success: 200, data: [] }
}

async function getHelpHistoryApi(params: Record<string, any>): Promise<any> {
  // TODO: 替换为真实接口
  return { success: 200, data: { list: [] } }
}

const loading = ref(false)
const finished = ref(false)
const emergencyContacts = ref<Record<string, any>[]>([])
const helpHistory = ref<Record<string, any>[]>([])

// 加载紧急联系人
const loadEmergencyContacts = async () => {
  try {
    const res = await getEmergencyContactsApi()
    if (res && res.success === 200) {
      emergencyContacts.value = res.data || []
    }
  } catch (err) {
    showToast('加载联系人失败')
  }
}

// 加载求助记录
const onLoad = async () => {
  loading.value = true
  try {
    const res = await getHelpHistoryApi({ page: 1, pageSize: 10 })
    if (res && res.success === 200) {
      helpHistory.value = res.data?.list || []
      finished.value = true
    }
  } catch (err) {
    showToast('加载求助记录失败')
  } finally {
    loading.value = false
  }
}

// 发送紧急求助
const sendEmergencyHelp = async () => {
  await showConfirmDialog({
    title: '确认求助',
    message: '确定要发送紧急求助信息吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  
  try {
    const res = await sendEmergencyHelpApi()
    if (res && res.success === 200) {
      showToast('求助信息已发送')
      // 重新加载求助记录
      helpHistory.value = []
      finished.value = false
      onLoad()
    } else {
      showToast('发送求助信息失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  }
}

// 拨打电话
const callContact = (phone: any) => {
  window.location.href = `tel:${phone}`
}

// 初始化
onMounted(() => {
  loadEmergencyContacts()
  onLoad()
})
</script>

<style scoped>
.emergency-help {
  padding: 20px;
  background-color: var(--bg-color);
  min-height: 100vh;
}
.header {
  margin-bottom: 30px;
}
.header h2 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
}
.emergency-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.emergency-button-container {
  display: flex;
  justify-content: center;
}
.emergency-button {
  width: 220px;
  height: 220px;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(232, 106, 106, 0.4);
  transition: transform 0.3s ease;
}
.emergency-button:active {
  transform: scale(0.95);
}
.emergency-button h3 {
  font-size: 28px;
  font-weight: 600;
  margin: 16px 0 8px;
}
.emergency-button p {
  font-size: 15px;
  opacity: 0.9;
  margin: 0;
}
.contact-section h3,
.history-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}
.van-cell-group--inset .van-cell {
  font-size: 18px;
}
</style>