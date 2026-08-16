<template>
  <div class="role-manage">
    <h2>角色管理</h2>
    <el-card>
      <el-button type="primary" @click="handleAddRole">
        <el-icon name="el-icon-plus" />
        添加角色
      </el-button>
      <el-table :data="roleList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="180" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditRole(scope.row)">
              <el-icon name="el-icon-edit" />
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteRole(scope.row.id)">
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

const roleList = ref([
  { id: 1, name: '老人', description: '老人角色，只能访问老人端功能' },
  { id: 2, name: '家属', description: '家属角色，只能访问家属端功能' },
  { id: 3, name: '管理员', description: '管理员角色，可以访问所有功能' }
])

const handleAddRole = () => {
  ElMessage.info('添加角色功能开发中')
}

const handleEditRole = (role: any) => {
  ElMessage.info('编辑角色功能开发中')
}

const handleDeleteRole = (id: any) => {
  (ElMessage as any).confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.role-manage {
  padding: 20px;
}

.role-manage h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}
</style>