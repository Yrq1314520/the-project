<template>
  <div class="safety-detection">
    <div class="header">
      <h2>安全检测</h2>
    </div>
    
    <!-- 实时状态 -->
    <div class="status-section">
      <h3>实时状态</h3>
      <div class="status-cards">
        <van-card>
          <template #title>
            老人状态
          </template>
          <div class="status-info">
            <div class="status-item">
              <span class="label">当前状态</span>
              <span class="value" :class="老人状态 ? 'normal' : 'abnormal'">
                {{老人状态 ? '正常' : '异常'}}
              </span>
            </div>
            <div class="status-item">
              <span class="label">位置</span>
              <span class="value">{{老人位置}}</span>
            </div>
            <div class="status-item">
              <span class="label">最后更新</span>
              <span class="value">{{最后更新时间}}</span>
            </div>
          </div>
        </van-card>
        
        <van-card>
          <template #title>
            环境监测
          </template>
          <div class="status-info">
            <div class="status-item">
              <span class="label">温度</span>
              <span class="value">{{环境数据.temperature}} °C</span>
            </div>
            <div class="status-item">
              <span class="label">湿度</span>
              <span class="value">{{环境数据.humidity}} %</span>
            </div>
            <div class="status-item">
              <span class="label">MQ-9气体</span>
              <span class="value" :class="环境数据.gasLevel === '正常' ? 'normal' : 'abnormal'">
                {{环境数据.gasLevel}}
              </span>
            </div>
          </div>
        </van-card>
      </div>
    </div>
    
    <!-- 视频监控 -->
    <div class="video-section">
      <h3>视频监控</h3>
      <div class="video-container">
        <div class="video-placeholder">
          <van-icon name="play-circle-o" size="48" />
          <p>视频监控画面</p>
          <p class="sub-text">点击播放</p>
        </div>
      </div>
    </div>
    
    <!-- 活动记录 -->
    <div class="activity-section">
      <h3>活动记录</h3>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell 
          v-for="item in activityList" 
          :key="item.id"
          :title="item.activity"
          :value="item.time"
        >
          <template #icon>
            <van-icon :name="item.type === 'normal' ? 'success' : 'warning'" />
          </template>
        </van-cell>
      </van-list>
    </div>
    
    <!-- 安全设置 -->
    <div class="settings-section">
      <h3>安全设置</h3>
      <van-cell-group inset>
        <van-cell title="紧急联系人通知" is-link>
          <template #default>
            <van-switch v-model="settings.emergencyContact" />
          </template>
        </van-cell>
        <van-cell title="异常状态提醒" is-link>
          <template #default>
            <van-switch v-model="settings.abnormalAlert" />
          </template>
        </van-cell>
        <van-cell title="环境异常提醒" is-link>
          <template #default>
            <van-switch v-model="settings.environmentAlert" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { getSafetyStatusApi, getActivityRecordApi } from '@/api/family'

const loading = ref(false)
const finished = ref(false)
const activityList = ref([])
const 老人状态 = ref(true)
const 老人位置 = ref('客厅')
const 最后更新时间 = ref('2026-04-06 14:30:00')

// 环境数据
const 环境数据 = reactive({
  temperature: 25.5,
  humidity: 45,
  gasLevel: '正常'
})

// 安全设置
const settings = reactive({
  emergencyContact: true,
  abnormalAlert: true,
  environmentAlert: true
})

// 加载活动记录
const onLoad = async () => {
  loading.value = true
  try {
    const res = await getActivityRecordApi({ page: 1, pageSize: 10 })
    if (res && res.success === 200) {
      activityList.value = res.data?.list || []
      finished.value = true
    }
  } catch (err) {
    showToast('加载活动记录失败')
  } finally {
    loading.value = false
  }
}

// 加载安全状态
const loadSafetyStatus = async () => {
  try {
    const res = await getSafetyStatusApi()
    if (res && res.success === 200) {
      const data = res.data
      老人状态.value = data.status === 'normal'
      老人位置.value = data.location
      最后更新时间.value = data.updateTime
      环境数据.temperature = data.environment.temperature
      环境数据.humidity = data.environment.humidity
      环境数据.gasLevel = data.environment.gasLevel
    }
  } catch (err) {
    showToast('加载安全状态失败')
  }
}

// 模拟实时数据更新
let updateInterval

const startRealTimeUpdate = () => {
  updateInterval = setInterval(() => {
    // 模拟数据更新
    最后更新时间.value = new Date().toLocaleString('zh-CN')
    环境数据.temperature = (25 + Math.random() * 2).toFixed(1)
    环境数据.humidity = Math.floor(40 + Math.random() * 10)
  }, 5000)
}

// 初始化
onMounted(() => {
  loadSafetyStatus()
  onLoad()
  startRealTimeUpdate()
})

// 清理
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.safety-detection {
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

.status-section,
.video-section,
.activity-section,
.settings-section {
  margin-bottom: 30px;
}

.status-section h3,
.video-section h3,
.activity-section h3,
.settings-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-item .label {
  font-size: 14px;
  color: #666;
}

.status-item .value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.value.normal {
  color: #52c41a;
}

.value.abnormal {
  color: #ff4d4f;
}

.video-container {
  background-color: #000;
  border-radius: 8px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.video-placeholder {
  text-align: center;
  color: #fff;
  z-index: 1;
}

.video-placeholder p {
  margin: 8px 0;
  font-size: 16px;
}

.sub-text {
  font-size: 14px;
  opacity: 0.7;
}

.van-cell {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
}
</style>