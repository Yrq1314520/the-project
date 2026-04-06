<template>
  <div class="health-analysis">
    <h2>健康数据分析</h2>
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="老人姓名">
          <el-input v-model="searchForm.name" placeholder="请输入老人姓名" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="searchForm.type" placeholder="请选择数据类型">
            <el-option label="血压" value="bloodPressure" />
            <el-option label="血糖" value="bloodSugar" />
            <el-option label="心率" value="heartRate" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon name="el-icon-search" />
            查询
          </el-button>
        </el-form-item>
      </el-form>
      <div class="chart-container">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>健康数据趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon class="chart-icon" name="el-icon-data-analysis" />
            <p>健康数据趋势图表</p>
          </div>
        </el-card>
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>健康状态分布</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon class="chart-icon" name="el-icon-s-data" />
            <p>健康状态分布图表</p>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = ref({
  name: '',
  type: 'bloodPressure',
  dateRange: []
})

const handleSearch = () => {
  ElMessage.info('查询功能开发中')
}
</script>

<style scoped>
.health-analysis {
  padding: 20px;
}

.health-analysis h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.chart-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.chart-placeholder p {
  color: #909399;
  font-size: 16px;
}

@media (max-width: 768px) {
  .chart-container {
    grid-template-columns: 1fr;
  }
}
</style>