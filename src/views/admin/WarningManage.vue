<template>
  <div class="warning-manage">
    <h2>预警管理</h2>
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="预警类型">
          <el-select v-model="searchForm.type" placeholder="请选择预警类型">
            <el-option label="全部" value="" />
            <el-option label="健康预警" value="health" />
            <el-option label="安全预警" value="safety" />
            <el-option label="用药预警" value="medicine" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择处理状态">
            <el-option label="全部" value="" />
            <el-option label="未处理" value="0" />
            <el-option label="已处理" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="warningList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="oldmanName" label="老人姓名" width="120" />
        <el-table-column prop="type" label="预警类型" width="120">
          <template #default="scope">
            {{ getTypeText(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="预警内容" />
        <el-table-column prop="createTime" label="预警时间" width="200" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleProcess(scope.row)">
              <el-icon><Edit /></el-icon>
              {{ scope.row.status === '1' ? '查看' : '处理' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Edit } from '@element-plus/icons-vue'

const searchForm = ref({
  type: '',
  status: ''
})

const warningList = ref([
  { id: 1, oldmanName: '张三', type: 'health', content: '血压异常', createTime: '2026-04-01 10:00:00', status: '0' },
  { id: 2, oldmanName: '李四', type: 'safety', content: '长时间未活动', createTime: '2026-04-01 11:00:00', status: '1' },
  { id: 3, oldmanName: '张三', type: 'medicine', content: '未按时服药', createTime: '2026-04-01 12:00:00', status: '0' }
])

const getTypeText = (type) => {
  const typeMap = {
    health: '健康预警',
    safety: '安全预警',
    medicine: '用药预警'
  }
  return typeMap[type] || '未知'
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleProcess = (warning) => {
  ElMessage.info('处理预警功能开发中')
}
</script>

<style scoped>
.warning-manage {
  padding: 20px;
}

.warning-manage h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}
</style>