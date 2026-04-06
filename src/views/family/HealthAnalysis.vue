<template>
  <div class="health-analysis">
    <div class="header">
      <h2>健康数据分析</h2>
    </div>
    
    <!-- 时间范围选择 -->
    <div class="time-selector">
      <van-button-group>
        <van-button 
          v-for="item in timeOptions" 
          :key="item.value"
          :type="selectedTime === item.value ? 'primary' : 'default'"
          @click="selectedTime = item.value"
        >
          {{ item.label }}
        </van-button>
      </van-button-group>
    </div>
    
    <!-- 健康数据概览 -->
    <div class="overview-section">
      <van-grid :column-num="3" gap="16">
        <van-grid-item>
          <div class="overview-card">
            <h3>平均血压</h3>
            <p class="value">{{ avgBloodPressure }}</p>
            <p class="status" :class="bloodPressureStatus">{{ bloodPressureStatusText }}</p>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-card">
            <h3>平均血糖</h3>
            <p class="value">{{ avgBloodSugar }} mmol/L</p>
            <p class="status" :class="bloodSugarStatus">{{ bloodSugarStatusText }}</p>
          </div>
        </van-grid-item>
        <van-grid-item>
          <div class="overview-card">
            <h3>平均心率</h3>
            <p class="value">{{ avgHeartRate }} 次/分</p>
            <p class="status" :class="heartRateStatus">{{ heartRateStatusText }}</p>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
    
    <!-- 数据趋势图表 -->
    <div class="chart-section">
      <h3>血压趋势</h3>
      <div class="chart-container" ref="bloodPressureChart"></div>
    </div>
    
    <div class="chart-section">
      <h3>血糖趋势</h3>
      <div class="chart-container" ref="bloodSugarChart"></div>
    </div>
    
    <div class="chart-section">
      <h3>心率趋势</h3>
      <div class="chart-container" ref="heartRateChart"></div>
    </div>
    
    <!-- 健康建议 -->
    <div class="advice-section">
      <h3>健康建议</h3>
      <van-card>
        <div class="advice-content">
          <ul>
            <li v-for="(advice, index) in healthAdvice" :key="index">
              {{ advice }}
            </li>
          </ul>
        </div>
      </van-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import { getHealthDataListApi } from '@/api/family'

const selectedTime = ref('week')
const bloodPressureChart = ref(null)
const bloodSugarChart = ref(null)
const heartRateChart = ref(null)
const healthData = ref([])

// 时间选项
const timeOptions = [
  { label: '最近7天', value: 'week' },
  { label: '最近30天', value: 'month' },
  { label: '最近90天', value: 'quarter' }
]

// 计算属性：平均血压
const avgBloodPressure = computed(() => {
  if (healthData.value.length === 0) return '0/0'
  
  const systolicValues = healthData.value.map(item => {
    const bp = item.bloodPressure.split('/')
    return parseInt(bp[0])
  })
  
  const diastolicValues = healthData.value.map(item => {
    const bp = item.bloodPressure.split('/')
    return parseInt(bp[1])
  })
  
  const avgSystolic = Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length)
  const avgDiastolic = Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length)
  
  return `${avgSystolic}/${avgDiastolic}`
})

// 计算属性：平均血糖
const avgBloodSugar = computed(() => {
  if (healthData.value.length === 0) return '0'
  
  const values = healthData.value.map(item => parseFloat(item.bloodSugar))
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
})

// 计算属性：平均心率
const avgHeartRate = computed(() => {
  if (healthData.value.length === 0) return '0'
  
  const values = healthData.value.map(item => parseInt(item.heartRate))
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
})

// 血压状态
const bloodPressureStatus = computed(() => {
  const bp = avgBloodPressure.value.split('/')
  const systolic = parseInt(bp[0])
  const diastolic = parseInt(bp[1])
  
  if (systolic < 90 || diastolic < 60) return 'low'
  if (systolic < 120 && diastolic < 80) return 'normal'
  if (systolic < 140 && diastolic < 90) return 'high-normal'
  return 'high'
})

const bloodPressureStatusText = computed(() => {
  switch (bloodPressureStatus.value) {
    case 'low': return '偏低'
    case 'normal': return '正常'
    case 'high-normal': return '正常高值'
    case 'high': return '偏高'
    default: return '未知'
  }
})

// 血糖状态
const bloodSugarStatus = computed(() => {
  const sugar = parseFloat(avgBloodSugar.value)
  if (sugar < 3.9) return 'low'
  if (sugar < 6.1) return 'normal'
  if (sugar < 7.0) return 'high-normal'
  return 'high'
})

const bloodSugarStatusText = computed(() => {
  switch (bloodSugarStatus.value) {
    case 'low': return '偏低'
    case 'normal': return '正常'
    case 'high-normal': return '正常高值'
    case 'high': return '偏高'
    default: return '未知'
  }
})

// 心率状态
const heartRateStatus = computed(() => {
  const rate = parseInt(avgHeartRate.value)
  if (rate < 60) return 'low'
  if (rate < 100) return 'normal'
  return 'high'
})

const heartRateStatusText = computed(() => {
  switch (heartRateStatus.value) {
    case 'low': return '偏低'
    case 'normal': return '正常'
    case 'high': return '偏高'
    default: return '未知'
  }
})

// 健康建议
const healthAdvice = computed(() => {
  const advice = []
  
  // 根据血压状态生成建议
  if (bloodPressureStatus.value === 'high') {
    advice.push('血压偏高，建议减少盐分摄入，保持适量运动')
  } else if (bloodPressureStatus.value === 'low') {
    advice.push('血压偏低，建议适当增加盐分摄入，避免长时间站立')
  }
  
  // 根据血糖状态生成建议
  if (bloodSugarStatus.value === 'high') {
    advice.push('血糖偏高，建议控制碳水化合物摄入，增加运动量')
  } else if (bloodSugarStatus.value === 'low') {
    advice.push('血糖偏低，建议随身携带糖果，定时进食')
  }
  
  // 根据心率状态生成建议
  if (heartRateStatus.value === 'high') {
    advice.push('心率偏高，建议避免剧烈运动，保持情绪稳定')
  } else if (heartRateStatus.value === 'low') {
    advice.push('心率偏低，建议定期检查，避免过度劳累')
  }
  
  // 通用建议
  advice.push('保持规律作息，充足睡眠')
  advice.push('均衡饮食，多吃蔬菜水果')
  advice.push('定期监测健康数据，及时调整生活方式')
  
  return advice
})

// 加载健康数据
const loadHealthData = async () => {
  try {
    const res = await getHealthDataListApi({ page: 1, pageSize: 100 })
    if (res && res.success === 200) {
      healthData.value = res.data?.list || []
      // 按时间排序
      healthData.value.sort((a, b) => {
        return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
      })
      // 过滤时间范围
      filterDataByTimeRange()
    }
  } catch (err) {
    showToast('加载数据失败')
  }
}

// 根据时间范围过滤数据
const filterDataByTimeRange = () => {
  const now = new Date()
  let startDate
  
  switch (selectedTime.value) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
  }
  
  // 过滤数据
  const filteredData = healthData.value.filter(item => {
    const itemDate = new Date(`${item.date} ${item.time}`)
    return itemDate >= startDate
  })
  
  // 渲染图表
  renderCharts(filteredData)
}

// 渲染图表
const renderCharts = (data) => {
  // 简化实现，实际项目中可以使用 ECharts 等图表库
  if (bloodPressureChart.value) {
    bloodPressureChart.value.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">血压趋势图表：共 ${data.length} 条数据</div>`
  }
  
  if (bloodSugarChart.value) {
    bloodSugarChart.value.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">血糖趋势图表：共 ${data.length} 条数据</div>`
  }
  
  if (heartRateChart.value) {
    heartRateChart.value.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">心率趋势图表：共 ${data.length} 条数据</div>`
  }
}

// 监听时间范围变化
watch(selectedTime, () => {
  filterDataByTimeRange()
})

// 初始化
onMounted(() => {
  loadHealthData()
})
</script>

<style scoped>
.health-analysis {
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

.time-selector {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.overview-section {
  margin-bottom: 30px;
}

.overview-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.overview-card h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.overview-card .value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.overview-card .status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.status.normal {
  background-color: #f0f9eb;
  color: #52c41a;
}

.status.low {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status.high-normal {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status.high {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.chart-section {
  margin-bottom: 30px;
}

.chart-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.chart-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.advice-section {
  margin-bottom: 30px;
}

.advice-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.advice-content ul {
  padding-left: 20px;
  margin: 0;
}

.advice-content li {
  margin-bottom: 8px;
  color: #666;
  line-height: 1.5;
}
</style>