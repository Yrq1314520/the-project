<template>
  <div class="system-analysis">
    <h2>系统分析</h2>
    <el-card>
      <div class="stats-grid">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon name="el-icon-user" />
            </div>
            <div class="stat-info">
              <h3 class="stat-value">{{ stats.totalUsers }}</h3>
              <p class="stat-label">总用户数</p>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon name="el-icon-sold-out" />
            </div>
            <div class="stat-info">
              <h3 class="stat-value">{{ stats.totalOldman }}</h3>
              <p class="stat-label">老人数量</p>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-icon yellow">
              <el-icon name="el-icon-alarm-clock" />
            </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.totalReminders }}</h3>
            <p class="stat-label">用药提醒</p>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-icon red">
              <el-icon name="el-icon-warning" />
            </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.totalWarnings }}</h3>
            <p class="stat-label">预警数量</p>
          </div>
        </el-card>
      </div>
      <div class="chart-container">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon class="chart-icon" name="el-icon-data-analysis" />
            <p>用户活跃度图表</p>
          </div>
        </el-card>
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>预警类型分布</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon class="chart-icon" name="el-icon-s-data" />
            <p>预警类型分布图表</p>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  totalUsers: 128,
  totalOldman: 56,
  totalReminders: 234,
  totalWarnings: 45
})
</script>

<style scoped>
.system-analysis {
  padding: 20px;
}

.system-analysis h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stat-icon.blue {
  background-color: #409eff;
}

.stat-icon.green {
  background-color: #67c23a;
}

.stat-icon.yellow {
  background-color: #e6a23c;
}

.stat-icon.red {
  background-color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin: 0;
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

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .chart-container {
    grid-template-columns: 1fr;
  }
}
</style>