<template>
  <div class="notification">
    <h2>通知管理</h2>
    <el-card>
      <el-button type="primary" @click="handleSendNotification">
        <el-icon name="el-icon-send" />
        发送通知
      </el-button>
      <el-table :data="notificationList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="通知标题" width="200" />
        <el-table-column prop="content" label="通知内容" />
        <el-table-column prop="type" label="通知类型" width="120">
          <template #default="scope">
            {{ getTypeText(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发送时间" width="200" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              <el-icon name="el-icon-view" />
              查看
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteNotification(scope.row.id)">
              <el-icon name="el-icon-delete" />
              删除
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

const notificationList = ref([
  { id: 1, title: '系统更新', content: '系统将于今晚进行更新维护', type: 'system', createTime: '2026-04-01 10:00:00' },
  { id: 2, title: '健康提醒', content: '请及时录入老人健康数据', type: 'health', createTime: '2026-04-01 11:00:00' },
  { id: 3, title: '预警通知', content: '有新的预警信息需要处理', type: 'warning', createTime: '2026-04-01 12:00:00' }
])

const getTypeText = (type: any) => {
  const typeMap = {
    system: '系统通知',
    health: '健康提醒',
    warning: '预警通知'
  }
  return (typeMap as any)[type] || '未知'
}

const handleSendNotification = () => {
  ElMessage.info('发送通知功能开发中')
}

const handleViewDetail = (notification: any) => {
  ElMessage.info('查看详情功能开发中')
}

const handleDeleteNotification = (id: any) => {
  (ElMessage as any).confirm('确定要删除该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.notification {
  padding: 20px;
}

.notification h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}
</style>