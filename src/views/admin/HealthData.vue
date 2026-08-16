<template>
  <div class="health-data">
    <h2>健康数据管理</h2>
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="老人姓名">
          <el-input v-model="searchForm.name" placeholder="请输入老人姓名" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="searchForm.type" placeholder="请选择数据类型">
            <el-option label="全部" value="" />
            <el-option label="血压" value="bloodPressure" />
            <el-option label="血糖" value="bloodSugar" />
            <el-option label="心率" value="heartRate" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon name="el-icon-search" />
            搜索
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="healthDataList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="oldmanName" label="老人姓名" width="120" />
        <el-table-column prop="type" label="数据类型" width="120">
          <template #default="scope">
            {{ getTypeText(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="value" label="数据值" width="120" />
        <el-table-column prop="recordTime" label="记录时间" width="200" />
        <el-table-column prop="recordBy" label="记录人" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              <el-icon name="el-icon-view" />
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = ref({
  name: '',
  type: ''
})

const healthDataList = ref([
  { id: 1, oldmanName: '张三', type: 'bloodPressure', value: '120/80', recordTime: '2026-04-01 10:00:00', recordBy: '李四' },
  { id: 2, oldmanName: '李四', type: 'bloodSugar', value: '5.6', recordTime: '2026-04-01 11:00:00', recordBy: '王五' },
  { id: 3, oldmanName: '张三', type: 'heartRate', value: '72', recordTime: '2026-04-01 12:00:00', recordBy: '李四' }
])

const getTypeText = (type: any) => {
  const typeMap = {
    bloodPressure: '血压',
    bloodSugar: '血糖',
    heartRate: '心率'
  }
  return (typeMap as any)[type] || '未知'
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleViewDetail = (data: any) => {
  ElMessage.info('查看详情功能开发中')
}
</script>

<style scoped>
.health-data {
  padding: 20px;
}

.health-data h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}
</style>