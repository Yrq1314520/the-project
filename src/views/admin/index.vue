<template>
  <div class="admin-dashboard">
    <!-- 欢迎信息 -->
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎回来，{{ userInfo.nickname || '管理员' }}</span>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon name="el-icon-refresh" />
            刷新数据
          </el-button>
        </div>
      </template>
      <div class="welcome-content">
        <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
        <p>系统运行状态：<span class="status-normal">正常</span></p>
      </div>
    </el-card>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon blue">
            <el-icon name="el-icon-user" />
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.onlineUsers }}</h3>
            <p class="stat-label">在线用户</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon green">
            <el-icon name="el-icon-s-custom" />
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.oldmanCount }}</h3>
            <p class="stat-label">老人数量</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon orange">
            <el-icon name="el-icon-warning" />
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.todayWarnings }}</h3>
            <p class="stat-label">今日预警</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon purple">
            <el-icon name="el-icon-sunny" />
          </div>
          <div class="stat-info">
            <h3 class="stat-value">{{ stats.systemStatus }}</h3>
            <p class="stat-label">系统状态</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 最近活动 -->
    <el-card class="activity-card">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
          <el-button link size="small" @click="viewAllActivities">
            查看全部
          </el-button>
        </div>
      </template>
      <el-table :data="recentActivities" style="width: 100%">
        <el-table-column prop="activity" label="活动内容" width="600" />
        <el-table-column prop="time" label="时间" width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getActivityTypeTag(scope.row.type)">
              {{ getActivityTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 系统概览 -->
    <div class="overview-grid">
      <el-card class="overview-card">
        <template #header>
          <span>预警类型分布</span>
        </template>
        <div class="chart-container">
          <!-- 这里可以集成 ECharts -->
          <div class="chart-placeholder">
            <el-icon class="chart-icon" name="el-icon-data-line" />
            <p>预警类型分布图</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="overview-card">
        <template #header>
          <span>健康数据趋势</span>
        </template>
        <div class="chart-container">
          <!-- 这里可以集成 ECharts -->
          <div class="chart-placeholder">
            <el-icon class="chart-icon" name="el-icon-data-line" />
            <p>健康数据趋势图</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 计算属性：用户信息
const userInfo = computed(() => userStore.userInfo)

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 系统统计数据
const stats = ref({
  onlineUsers: 12,
  oldmanCount: 35,
  todayWarnings: 2,
  systemStatus: '正常'
})

// 最近活动
const recentActivities = ref([
  { id: 1, activity: '用户 138****8888 登录系统', time: '2026-04-06 14:30', type: 'login' },
  { id: 2, activity: '老人 张三 紧急求助', time: '2026-04-06 13:45', type: 'emergency' },
  { id: 3, activity: '家属 李四 更新健康数据', time: '2026-04-06 12:20', type: 'data' },
  { id: 4, activity: '系统自动备份', time: '2026-04-06 10:00', type: 'system' }
])

// 获取活动类型标签
const getActivityTypeTag = (type) => {
  const typeMap = {
    login: 'success',
    emergency: 'danger',
    data: 'primary',
    system: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取活动类型文本
const getActivityTypeText = (type) => {
  const typeMap = {
    login: '登录',
    emergency: '紧急',
    data: '数据',
    system: '系统'
  }
  return typeMap[type] || '其他'
}

// 刷新数据
const refreshData = () => {
  // 模拟刷新数据

}

// 查看全部活动
const viewAllActivities = () => {
  // 跳转到活动日志页面

}

// 初始化
onMounted(() => {
  // 加载数据

})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  padding: 20px 0;
}

.status-normal {
  color: #67c23a;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
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
  color: #fff;
}

.stat-icon.blue {
  background-color: #409eff;
}

.stat-icon.green {
  background-color: #67c23a;
}

.stat-icon.orange {
  background-color: #e6a23c;
}

.stat-icon.purple {
  background-color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.activity-card {
  margin-bottom: 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.overview-card {
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chart-placeholder p {
  margin: 0;
  font-size: 14px;
}
</style>