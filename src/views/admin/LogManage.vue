<template>
  <div class="log-manage">
    <h2>日志管理</h2>
    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.username" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择操作类型">
            <el-option label="全部" value="" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="添加" value="add" />
            <el-option label="编辑" value="edit" />
            <el-option label="删除" value="delete" />
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
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon name="el-icon-refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="logList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="type" label="操作类型" width="120">
          <template #default="scope">
            {{ getTypeText(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="操作内容" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="createTime" label="操作时间" width="200" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              <el-icon name="el-icon-view" />
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = ref({
  username: '',
  type: '',
  dateRange: []
})

const page = ref({
  current: 1,
  size: 10
})

const total = ref(100)

const logList = ref([
  { id: 1, username: 'admin', type: 'login', content: '用户登录', ip: '192.168.1.1', createTime: '2026-04-01 10:00:00' },
  { id: 2, username: 'admin', type: 'add', content: '添加老人档案', ip: '192.168.1.1', createTime: '2026-04-01 10:30:00' },
  { id: 3, username: 'admin', type: 'edit', content: '编辑药品信息', ip: '192.168.1.1', createTime: '2026-04-01 11:00:00' },
  { id: 4, username: 'admin', type: 'delete', content: '删除预警记录', ip: '192.168.1.1', createTime: '2026-04-01 11:30:00' },
  { id: 5, username: 'admin', type: 'logout', content: '用户登出', ip: '192.168.1.1', createTime: '2026-04-01 12:00:00' }
])

const getTypeText = (type: any) => {
  const typeMap = {
    login: '登录',
    logout: '登出',
    add: '添加',
    edit: '编辑',
    delete: '删除'
  }
  return (typeMap as any)[type] || '未知'
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleReset = () => {
  searchForm.value = {
    username: '',
    type: '',
    dateRange: []
  }
}

const handleSizeChange = (size: any) => {
  page.value.size = size
  ElMessage.info('分页功能开发中')
}

const handleCurrentChange = (current: any) => {
  page.value.current = current
  ElMessage.info('分页功能开发中')
}

const handleViewDetail = (log: any) => {
  ElMessage.info('查看详情功能开发中')
}
</script>

<style scoped>
.log-manage {
  padding: 20px;
}

.log-manage h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>