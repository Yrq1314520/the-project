<template>
  <div class="user-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="handleAddUser">
        <el-icon name="el-icon-plus" />
        添加用户
      </el-button>
    </div>
    
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色">
            <el-option label="全部" value="" />
            <el-option label="老人" value="1" />
            <el-option label="家属" value="2" />
            <el-option label="管理员" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
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
    </el-card>
    
    <!-- 用户列表 -->
    <el-card class="user-list-card">
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="nickname" label="昵称" width="180" />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column prop="phone" label="手机号" width="180" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch 
              v-model="scope.row.status" 
              active-value="1" 
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)">
              <el-icon name="el-icon-edit" />
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.id)">
              <el-icon name="el-icon-delete" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
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
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            v-if="!isEdit"
          />
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="留空表示不修改" 
            v-else
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="老人" value="1" />
            <el-option label="家属" value="2" />
            <el-option label="管理员" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  status: ''
})

// 分页
const page = reactive({
  current: 1,
  size: 10
})

// 数据
const userList = ref([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  role: '2',
  status: '1'
})

// 表单验证
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 表单引用
const formRef = ref(null)

// 获取角色标签类型
const getRoleTagType = (role) => {
  const typeMap = {
    '1': 'success',
    '2': 'primary',
    '3': 'warning'
  }
  return typeMap[role] || 'info'
}

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    '1': '老人',
    '2': '家属',
    '3': '管理员'
  }
  return roleMap[role] || '未知'
}

// 加载用户列表
const loadUserList = () => {
  // 模拟数据
  userList.value = [
    {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      role: '3',
      status: '1',
      createTime: '2026-04-01 10:00:00'
    },
    {
      id: 2,
      username: 'family1',
      nickname: '家属1',
      email: 'family1@example.com',
      phone: '13800138001',
      role: '2',
      status: '1',
      createTime: '2026-04-02 14:30:00'
    },
    {
      id: 3,
      username: 'oldman1',
      nickname: '老人1',
      email: 'oldman1@example.com',
      phone: '13800138002',
      role: '1',
      status: '1',
      createTime: '2026-04-03 09:15:00'
    }
  ]
  total.value = userList.value.length
}

// 搜索
const handleSearch = () => {
  page.current = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.role = ''
  searchForm.status = ''
  page.current = 1
  loadUserList()
}

// 分页
const handleSizeChange = (size) => {
  page.size = size
  loadUserList()
}

const handleCurrentChange = (current) => {
  page.current = current
  loadUserList()
}

// 添加用户
const handleAddUser = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    username: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    role: '2',
    status: '1'
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (user) => {
  isEdit.value = true
  Object.assign(form, user)
  dialogVisible.value = true
}

// 删除用户
const handleDeleteUser = (id) => {
  ElMessage.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    ElMessage.success('删除成功')
    loadUserList()
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (user) => {
  // 模拟状态变更
  ElMessage.success(user.status === '1' ? '启用成功' : '禁用成功')
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    // 模拟提交
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    dialogVisible.value = false
    loadUserList()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 初始化
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-manage {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-list-card {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>