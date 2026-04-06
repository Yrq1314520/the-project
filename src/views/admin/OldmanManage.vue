<template>
  <div class="oldman-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>老人管理</h2>
      <el-button type="primary" @click="handleAddOldman">
        <el-icon name="el-icon-plus" />
        添加老人
      </el-button>
    </div>
    
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="searchForm.gender" placeholder="请选择性别">
            <el-option label="全部" value="" />
            <el-option label="男" value="1" />
            <el-option label="女" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
            <el-option label="异常" value="0" />
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
    
    <!-- 老人列表 -->
    <el-card class="oldman-list-card">
      <el-table :data="oldmanList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            {{ scope.row.gender === '1' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="手机号" width="180" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewProfile(scope.row)">
              <el-icon name="el-icon-view" />
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEditOldman(scope.row)">
              <el-icon name="el-icon-edit" />
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteOldman(scope.row.id)">
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
    
    <!-- 添加/编辑老人对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑老人' : '添加老人'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="1" />
            <el-option label="女" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="form.age" type="number" placeholder="请输入年龄" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="紧急联系人" prop="emergencyContact">
          <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" />
        </el-form-item>
        <el-form-item label="紧急联系电话" prop="emergencyPhone">
          <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" />
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
  name: '',
  gender: '',
  status: ''
})

// 分页
const page = reactive({
  current: 1,
  size: 10
})

// 数据
const oldmanList = ref([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: '',
  name: '',
  gender: '1',
  age: '',
  phone: '',
  address: '',
  idCard: '',
  emergencyContact: '',
  emergencyPhone: '',
  status: '1'
})

// 表单验证
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', message: '请输入正确的年龄', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' }
  ],
  emergencyContact: [
    { required: true, message: '请输入紧急联系人', trigger: 'blur' }
  ],
  emergencyPhone: [
    { required: true, message: '请输入紧急联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref(null)

// 加载老人列表
const loadOldmanList = () => {
  // 模拟数据
  oldmanList.value = [
    {
      id: 1,
      name: '张三',
      gender: '1',
      age: 75,
      phone: '13800138001',
      address: '北京市朝阳区',
      idCard: '110101195101011234',
      emergencyContact: '李四',
      emergencyPhone: '13800138002',
      status: '1',
      createTime: '2026-04-01 10:00:00'
    },
    {
      id: 2,
      name: '王五',
      gender: '0',
      age: 70,
      phone: '13800138003',
      address: '上海市浦东新区',
      idCard: '310101195601011234',
      emergencyContact: '赵六',
      emergencyPhone: '13800138004',
      status: '1',
      createTime: '2026-04-02 14:30:00'
    },
    {
      id: 3,
      name: '钱七',
      gender: '1',
      age: 80,
      phone: '13800138005',
      address: '广州市天河区',
      idCard: '440101194601011234',
      emergencyContact: '孙八',
      emergencyPhone: '13800138006',
      status: '0',
      createTime: '2026-04-03 09:15:00'
    }
  ]
  total.value = oldmanList.value.length
}

// 搜索
const handleSearch = () => {
  page.current = 1
  loadOldmanList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.gender = ''
  searchForm.status = ''
  page.current = 1
  loadOldmanList()
}

// 分页
const handleSizeChange = (size) => {
  page.size = size
  loadOldmanList()
}

const handleCurrentChange = (current) => {
  page.current = current
  loadOldmanList()
}

// 添加老人
const handleAddOldman = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    name: '',
    gender: '1',
    age: '',
    phone: '',
    address: '',
    idCard: '',
    emergencyContact: '',
    emergencyPhone: '',
    status: '1'
  })
  dialogVisible.value = true
}

// 编辑老人
const handleEditOldman = (oldman) => {
  isEdit.value = true
  Object.assign(form, oldman)
  dialogVisible.value = true
}

// 删除老人
const handleDeleteOldman = (id) => {
  ElMessage.confirm('确定要删除该老人档案吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    ElMessage.success('删除成功')
    loadOldmanList()
  }).catch(() => {})
}

// 查看档案
const handleViewProfile = (oldman) => {
  // 跳转到老人档案详情页
  console.log('查看老人档案:', oldman)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    // 模拟提交
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    dialogVisible.value = false
    loadOldmanList()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 初始化
onMounted(() => {
  loadOldmanList()
})
</script>

<style scoped>
.oldman-manage {
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

.oldman-list-card {
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