<template>
  <div class="remind-manage">
    <h2>用药提醒管理</h2>
    <el-card>
      <el-button type="primary" @click="handleAddRemind">
        <el-icon name="el-icon-plus" />
        添加提醒
      </el-button>
      <el-table :data="remindList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="oldmanName" label="老人姓名" width="120" />
        <el-table-column prop="drugName" label="药品名称" width="180" />
        <el-table-column prop="dosage" label="剂量" width="100" />
        <el-table-column prop="time" label="提醒时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditRemind(scope.row)">
              <el-icon name="el-icon-edit" />
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteRemind(scope.row.id)">
              <el-icon name="el-icon-delete" />
              删除
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

const remindList = ref([
  { id: 1, oldmanName: '张三', drugName: '阿司匹林', dosage: '1片', time: '08:00', status: '1' },
  { id: 2, oldmanName: '李四', drugName: '布洛芬', dosage: '1片', time: '12:00', status: '1' },
  { id: 3, oldmanName: '张三', drugName: '降压药', dosage: '1片', time: '18:00', status: '1' }
])

const handleAddRemind = () => {
  ElMessage.info('添加提醒功能开发中')
}

const handleEditRemind = (remind) => {
  ElMessage.info('编辑提醒功能开发中')
}

const handleDeleteRemind = (id) => {
  ElMessage.confirm('确定要删除该提醒吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.remind-manage {
  padding: 20px;
}

.remind-manage h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}
</style>