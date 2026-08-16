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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { showToast } from 'vant'
import { getAllQuestionsRecordsApi } from '@/api/family'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const props = defineProps({
  elderId: { type: [String, Number], default: '' }
})

const timeOptions = [
  { label: '一天', value: 'day', days: 1 },
  { label: '一个月', value: 'month', days: 30 },
  { label: '一个季度', value: 'quarter', days: 90 }
]
const selectedTime = ref('month')

const loading = ref(false)
const allRecords = ref<any[]>([])
const statsData = ref<any[]>([])

// 定义症状关键词与标准疾病名称的映射（口语化，服务于老人）
const symptomMapping = [
  { keywords: ['心脏', '心痛', '心悸', '心慌', '胸闷', '胸痛', '冠心病', '心脏病'], disease: '心脏病', drugs: ['硝酸甘油', '速效救心丸', '阿司匹林'] },
  { keywords: ['高血压', '血压高'], disease: '高血压', drugs: ['氨氯地平', '厄贝沙坦', '美托洛尔'] },
  { keywords: ['糖尿病', '血糖高'], disease: '糖尿病', drugs: ['二甲双胍', '格列美脲'] },
  { keywords: ['肚子痛', '肚子疼', '胃痛', '腹痛', '腹泻', '拉肚子', '胃胀', '消化不良'], disease: '消化系统不适', drugs: ['奥美拉唑', '蒙脱石散', '多潘立酮'] },
  { keywords: ['咳嗽', '咳痰', '喉咙痛', '感冒', '发烧', '发热'], disease: '呼吸道感染', drugs: ['氨溴索口服液', '布洛芬', '对乙酰氨基酚'] },
  { keywords: ['头晕', '头痛', '眩晕'], disease: '头晕/头痛', drugs: ['茶苯海明', '布洛芬'] },
  { keywords: ['摔倒', '摔伤', '撞伤', '扭伤'], disease: '外伤', drugs: ['碘伏', '云南白药气雾剂', '创可贴'] },
  { keywords: ['呕吐', '恶心'], disease: '恶心呕吐', drugs: ['甲氧氯普胺', '维生素B6'] },
  { keywords: ['乏力', '疲劳', '没精神'], disease: '疲劳乏力', drugs: ['复合维生素B'] },
  { keywords: ['失眠', '睡不好'], disease: '失眠', drugs: ['褪黑素', '安神补脑液'] },
  { keywords: ['心力衰竭'], disease: '心力衰竭', drugs: ['呋塞米', '螺内酯', '美托洛尔'] },
  { keywords: ['动脉粥样硬化'], disease: '动脉粥样硬化', drugs: ['阿司匹林', '阿托伐他汀'] },
  { keywords: ['胃食管反流'], disease: '胃食管反流病', drugs: ['奥美拉唑', '多潘立酮'] },
  { keywords: ['便秘'], disease: '便秘', drugs: ['乳果糖', '聚乙二醇4000'] },
  { keywords: ['尿路感染'], disease: '尿路感染', drugs: ['左氧氟沙星', '头孢呋辛'] },
  { keywords: ['前列腺增生'], disease: '良性前列腺增生', drugs: ['坦索罗辛', '非那雄胺'] },
  { keywords: ['贫血'], disease: '贫血', drugs: ['硫酸亚铁', '叶酸'] },
  { keywords: ['血脂异常'], disease: '血脂异常', drugs: ['阿托伐他汀', '非诺贝特'] },
  { keywords: ['骨关节炎'], disease: '骨关节炎', drugs: ['塞来昔布', '氨基葡萄糖'] },
  { keywords: ['骨质疏松'], disease: '骨质疏松', drugs: ['碳酸钙D3', '阿仑膦酸钠'] },
  { keywords: ['帕金森'], disease: '帕金森病', drugs: ['多巴丝肼'] },
  { keywords: ['阿尔茨海默'], disease: '阿尔茨海默病', drugs: ['多奈哌齐'] }
]

// 查找词库，进行统计
const getDiseaseFromQuestion = (question: any) => {
  for (const item of symptomMapping) {
    for (const kw of item.keywords) {
      if (question.includes(kw)) {
        return { disease: item.disease, drugs: item.drugs }
      }
    }
  }
  return null
}

const parseAskTime = (askTime: any) => {
  if (!askTime || !Array.isArray(askTime) || askTime.length < 6) return new Date(0)
  const [year, month, day, hour, minute, second = 0] = askTime
  return new Date(year, month - 1, day, hour, minute, second)
}

// 加载问答记录
const loadRecords = async () => {
  if (!props.elderId) return
  loading.value = true
  try {
    const res = await getAllQuestionsRecordsApi({ page: 1, size: 200, elderId: props.elderId })
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

const computeStats = () => {
  const now = new Date()
  const days = timeOptions.find(t => t.value === selectedTime.value)?.days || 30
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const filtered = allRecords.value.filter(record => {
    const recordTime = parseAskTime(record.askTime)
    return recordTime >= startDate && recordTime <= now
  })

  const symptomCount: Record<string, number> = {}
  filtered.forEach(record => {
    const question = record.question || ''
    const matched = getDiseaseFromQuestion(question)
    if (matched) {
      const disease = matched.disease
      symptomCount[disease] = (symptomCount[disease] || 0) + 1
    }
  })

  const stats = Object.entries(symptomCount).map(([symptom, count]: [string, number]) => ({ symptom, count }))
  stats.sort((a, b) => (b.count as number) - (a.count as number))
  statsData.value = stats.slice(0, 6)
}

// 用药建议，基于统计结果的前3个症状
const drugSuggestions = computed(() => {
  const topSymptoms = statsData.value.slice(0, 3)
  return topSymptoms.map(item => {
    const mapping = symptomMapping.find(m => m.disease === item.symptom)
    return {
      disease: item.symptom,
      drugs: mapping ? mapping.drugs : ['请咨询医生']
    }
  })
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

watch(() => props.elderId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) loadRecords()
})

onMounted(() => {
  if (props.elderId) loadRecords()
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