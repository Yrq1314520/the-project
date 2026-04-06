<template>
  <div class="drug-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>药品管理</h2>
      <el-button type="primary" @click="handleAddDrug">
        <el-icon name="el-icon-plus" />
        添加药品
      </el-button>
    </div>
    
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="药品名称">
          <el-input v-model="searchForm.name" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类">
            <el-option label="全部" value="" />
            <el-option label="处方药" value="1" />
            <el-option label="非处方药" value="2" />
            <el-option label="保健品" value="3" />
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
    
    <!-- 药品列表 -->
    <el-card class="drug-list-card">
      <el-table :data="drugList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="药品名称" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)">
              {{ getCategoryText(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="usage" label="用法用量" width="200" />
        <el-table-column prop="dosage" label="剂量" width="100" />
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditDrug(scope.row)">
              <el-icon name="el-icon-edit" />
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteDrug(scope.row.id)">
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
    
    <!-- 添加/编辑药品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑药品' : '添加药品'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="药品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="处方药" value="1" />
            <el-option label="非处方药" value="2" />
            <el-option label="保健品" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="用法用量" prop="usage">
          <el-input v-model="form.usage" placeholder="请输入用法用量" />
        </el-form-item>
        <el-form-item label="剂量" prop="dosage">
          <el-input v-model="form.dosage" placeholder="请输入剂量" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
  category: '',
  status: ''
})

// 分页
const page = reactive({
  current: 1,
  size: 10
})

// 数据
const drugList = ref([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: '',
  name: '',
  category: '2',
  specification: '',
  usage: '',
  dosage: '',
  remark: '',
  status: '1'
})

// 表单验证
const rules = {
  name: [
    { required: true, message: '请输入药品名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  specification: [
    { required: true, message: '请输入规格', trigger: 'blur' }
  ],
  usage: [
    { required: true, message: '请输入用法用量', trigger: 'blur' }
  ],
  dosage: [
    { required: true, message: '请输入剂量', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref(null)

// 获取分类标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    '1': 'warning',
    '2': 'primary',
    '3': 'success'
  }
  return typeMap[category] || 'info'
}

// 获取分类文本
const getCategoryText = (category) => {
  const categoryMap = {
    '1': '处方药',
    '2': '非处方药',
    '3': '保健品'
  }
  return categoryMap[category] || '未知'
}

// 加载药品列表
const loadDrugList = () => {
  // 模拟数据
  drugList.value = [
    {
      id: 1,
      name: '阿司匹林',
      category: '2',
      specification: '100mg*30片',
      usage: '口服',
      dosage: '1片/次',
      remark: '饭后服用',
      status: '1',
      createTime: '2026-04-01 10:00:00'
    },
    {
      id: 2,
      name: '布洛芬',
      category: '2',
      specification: '200mg*20片',
      usage: '口服',
      dosage: '1片/次',
      remark: '疼痛时服用',
      status: '1',
      createTime: '2026-04-02 14:30:00'
    },
    {
      id: 3,
      name: '降压药',
      category: '1',
      specification: '5mg*28片',
      usage: '口服',
      dosage: '1片/次',
      remark: '每日固定时间服用',
      status: '1',
      createTime: '2026-04-03 09:15:00'
    }
  ]
  total.value = drugList.value.length
}

// 搜索
const handleSearch = () => {
  page.current = 1
  loadDrugList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.status = ''
  page.current = 1
  loadDrugList()
}

// 分页
const handleSizeChange = (size) => {
  page.size = size
  loadDrugList()
}

const handleCurrentChange = (current) => {
  page.current = current
  loadDrugList()
}

// 添加药品
const handleAddDrug = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    name: '',
    category: '2',
    specification: '',
    usage: '',
    dosage: '',
    remark: '',
    status: '1'
  })
  dialogVisible.value = true
}

// 编辑药品
const handleEditDrug = (drug) => {
  isEdit.value = true
  Object.assign(form, drug)
  dialogVisible.value = true
}

// 删除药品
const handleDeleteDrug = (id) => {
  ElMessage.confirm('确定要删除该药品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟删除
    ElMessage.success('删除成功')
    loadDrugList()
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (drug) => {
  // 模拟状态变更
  ElMessage.success(drug.status === '1' ? '启用成功' : '禁用成功')
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    // 模拟提交
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    dialogVisible.value = false
    loadDrugList()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 初始化
onMounted(() => {
  loadDrugList()
})
</script>

<style scoped>
.drug-manage {
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

.drug-list-card {
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