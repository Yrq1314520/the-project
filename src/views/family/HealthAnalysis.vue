<template>
  <div class="health-analysis">
    <div class="time-switch">
      <van-button
        v-for="item in timeOptions"
        :key="item.value"
        :type="selectedTime === item.value ? 'primary' : 'default'"
        size="small"
        @click="selectedTime = item.value"
        style="margin-right: 8px; margin-bottom: 8px;"
      >
        {{ item.label }}
      </van-button>
    </div>

    <div v-if="loading" class="loading-tip">加载中...</div>
    <div v-else-if="statsData.length === 0" class="empty-tip">暂无问答记录，无法分析</div>
    <template v-else>
      <div class="chart-container">
        <!-- 修复：使用 statsData.length 作为显示条件，而不是未定义的 chartData -->
        <v-chart :option="chartOption" autoresize />
      </div>
      <div class="suggestions-section">
        <h3>💊 用药建议</h3>
        <div class="suggestions-list">
          <div v-for="item in drugSuggestions" :key="item.disease" class="suggestion-card">
            <div class="disease-name">{{ item.disease }}</div>
            <div class="drugs">推荐药品：{{ item.drugs.join('、') }}</div>
            <div class="note">请咨询医生或药师后使用，不可自行增减剂量</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { showToast } from 'vant'
import { getAllQuestionsRecordsApi } from '@/api/family'

// ECharts 注册
use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const props = defineProps({
  userId: { type: [String, Number], default: '' }
})

// 时间选项
const timeOptions = [
  { label: '一天', value: 'day', days: 1 },
  { label: '一个月', value: 'month', days: 30 },
  { label: '一个季度', value: 'quarter', days: 90 }
]
const selectedTime = ref('month')

const loading = ref(false)
const allRecords = ref([])       // 所有问答记录
const statsData = ref([])        // 症状统计 [{ symptom, count }]

// 疾病关键词库（扩展）
const diseaseKeywords = [
  '高血压', '糖尿病', '冠心病', '心脏病', '心力衰竭', '动脉粥样硬化', '胃食管反流病', '消化性溃疡',
  '便秘', '腹泻', '尿路感染', '良性前列腺增生', '贫血', '血脂异常', '骨关节炎', '骨质疏松',
  '帕金森病', '阿尔茨海默病', '癫痫', '慢性支气管炎', '慢性阻塞性肺疾病', '肺炎', '支气管哮喘',
  '急性上呼吸道感染', '肺癌', '肺结核', '肝硬化', '胆道疾病', '尿石症', '老年性白内障', '青光眼',
  '摔倒', '摔伤', '扭伤', '头晕', '胸闷', '心痛', '心悸', '咳嗽', '发热'
]

// 疾病 → 推荐药品映射
const diseaseMedicineMap = {
  '急性上呼吸道感染': ['布洛芬', '对乙酰氨基酚', '氯雷他定'],
  '慢性支气管炎': ['沙丁胺醇气雾剂', '氨溴索口服溶液'],
  '慢性阻塞性肺疾病': ['噻托溴铵吸入剂', '布地奈德福莫特罗'],
  '肺炎': ['阿莫西林', '头孢克肟'],
  '支气管哮喘': ['布地奈德气雾剂', '孟鲁司特'],
  '心力衰竭': ['呋塞米', '螺内酯', '美托洛尔'],
  '高血压': ['氨氯地平', '厄贝沙坦', '美托洛尔'],
  '动脉粥样硬化': ['阿司匹林', '阿托伐他汀'],
  '冠心病': ['硝酸甘油', '阿司匹林'],
  '心脏病': ['硝酸甘油', '阿司匹林'],
  '胃食管反流病': ['奥美拉唑', '多潘立酮'],
  '消化性溃疡': ['雷贝拉唑', '铝碳酸镁'],
  '便秘': ['乳果糖', '聚乙二醇4000'],
  '腹泻': ['蒙脱石散', '双歧杆菌三联'],
  '尿路感染': ['左氧氟沙星', '头孢呋辛'],
  '良性前列腺增生': ['坦索罗辛', '非那雄胺'],
  '贫血': ['硫酸亚铁', '叶酸+维生素B12'],
  '糖尿病': ['二甲双胍', '格列美脲', '甘精胰岛素'],
  '血脂异常': ['阿托伐他汀', '非诺贝特'],
  '骨关节炎': ['塞来昔布', '氨基葡萄糖'],
  '骨质疏松': ['碳酸钙D3', '阿仑膦酸钠'],
  '帕金森病': ['多巴丝肼'],
  '阿尔茨海默病': ['多奈哌齐'],
  '癫痫': ['丙戊酸钠'],
  '摔倒': ['碘伏', '创可贴', '云南白药气雾剂'],
  '扭伤': ['云南白药气雾剂', '布洛芬'],
  '头晕': ['茶苯海明', '眩晕停'],
  '胸闷': ['硝酸甘油', '速效救心丸'],
  '咳嗽': ['氨溴索口服液', '右美沙芬']
}

// 解析 askTime 数组为 Date 对象
const parseAskTime = (askTime) => {
  if (!askTime || !Array.isArray(askTime) || askTime.length < 6) return new Date(0)
  const [year, month, day, hour, minute, second = 0] = askTime
  return new Date(year, month - 1, day, hour, minute, second)
}

// 加载所有问答记录
const loadRecords = async () => {
  if (!props.userId) return
  loading.value = true
  try {
    const res = await getAllQuestionsRecordsApi({ page: 1, size: 200, userId: props.userId })
    if (res.code === 200 || res.success === 200) {
      let records = []
      if (Array.isArray(res.data)) {
        records = res.data
      } else if (res.data && Array.isArray(res.data.list)) {
        records = res.data.list
      }
      allRecords.value = records
      computeStats()
    } else {
      showToast(res.msg || '加载问答记录失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常')
  } finally {
    loading.value = false
  }
}

// 根据时间范围过滤并统计症状
const computeStats = () => {
  const now = new Date()
  const days = timeOptions.find(t => t.value === selectedTime.value)?.days || 30
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const filtered = allRecords.value.filter(record => {
    const recordTime = parseAskTime(record.askTime)
    return recordTime >= startDate && recordTime <= now
  })

  const symptomCount = {}
  filtered.forEach(record => {
    const question = record.question || ''
    diseaseKeywords.forEach(disease => {
      if (question.includes(disease)) {
        symptomCount[disease] = (symptomCount[disease] || 0) + 1
      }
    })
  })

  const stats = Object.entries(symptomCount).map(([symptom, count]) => ({ symptom, count }))
  stats.sort((a, b) => b.count - a.count)
  statsData.value = stats.slice(0, 6)
}

// 用药建议
const drugSuggestions = computed(() => {
  const topSymptoms = statsData.value.slice(0, 3)
  return topSymptoms.map(item => ({
    disease: item.symptom,
    drugs: diseaseMedicineMap[item.symptom] || ['请咨询医生']
  }))
})

// 图表配置
const chartOption = computed(() => ({
  title: { text: '常见不适症状频率统计', left: 'center', top: 0, textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '10%', right: '5%', top: '15%', bottom: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: statsData.value.map(item => item.symptom),
    axisLabel: { rotate: 30, interval: 0, fontSize: 11 }
  },
  yAxis: { type: 'value', name: '出现次数' },
  series: [{
    name: '频次',
    type: 'bar',
    data: statsData.value.map(item => item.count),
    itemStyle: { borderRadius: [6, 6, 0, 0], color: '#3B7C9E' },
    label: { show: true, position: 'top' }
  }]
}))

watch(selectedTime, () => {
  computeStats()
  showToast(`已切换到${timeOptions.find(t => t.value === selectedTime.value)?.label}`)
})

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.health-analysis {
  padding: 8px 0;
}
.time-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.loading-tip, .empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}
.chart-container {
  background: white;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 24px;
  height: 360px;
}
.suggestions-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.suggestion-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border-left: 4px solid #3B7C9E;
}
.disease-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}
.drugs {
  font-size: 14px;
  color: #2A7F6E;
  margin-bottom: 6px;
}
.note {
  font-size: 12px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 8px;
}
</style>