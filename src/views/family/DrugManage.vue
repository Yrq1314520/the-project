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
        <el-table-column label="操作" width="150" fixed="right">
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
        <el-form-item label="老人档案" prop="elderId" v-if="!isEdit">
          <el-select v-model="form.elderId" placeholder="请选择老人档案">
            <el-option v-for="elder in elderList" :key="elder.id" :label="elder.name" :value="elder.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="药品名称" prop="medicineName">
          <el-input v-model="form.medicineName" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="有效期" prop="expiryDate">
          <el-input v-model="form.expiryDate" placeholder="请输入有效期，如2026-06-30" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入药品类型，如降压药" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input v-model="form.quantity" type="number" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注，如每天一次" />
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
import { getDrugListApi, addDrugApi, updateDrugApi, deleteDrugApi } from '@/api/medicine'
import { getElderListApi } from '@/api/elderInfo'

// 搜索表单
const searchForm = reactive({
  name: '',
  category: ''
})

// 分页
const page = reactive({
  current: 1,
  size: 10
})

// 数据
const drugList = ref([])
const total = ref(0)
const elderList = ref([])

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: '',
  elderId: '',
  medicineName: '',
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

// 表单验证
const rules = {
  elderId: [
    { required: true, message: '请选择老人档案', trigger: 'change' }
  ],
  medicineName: [
    { required: true, message: '请输入药品名称', trigger: 'blur' }
  ],
  expiryDate: [
    { required: true, message: '请输入有效期', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请输入药品类型', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
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

// 加载老人列表
const loadElderList = async () => {
  try {
    const res = await getElderListApi()
    if (res.code === 200) {
      elderList.value = res.data.list
    }
  } catch (error) {
    ElMessage.error('加载老人列表失败')
    console.error('加载老人列表失败', error)
  }
}

// 加载药品列表
const loadDrugList = async () => {
  try {
    const res = await getDrugListApi({
      page: page.current,
      pageSize: page.size,
      name: searchForm.name,
      category: searchForm.category
    })
    if (res.code === 200) {
      drugList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载药品列表失败')
    console.error('加载药品列表失败', error)
  }
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
    elderId: '',
    medicineName: '',
    expiryDate: '',
    type: '',
    quantity: '',
    remark: ''
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
  }).then(async () => {
    try {
      const res = await deleteDrugApi(id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadDrugList()
      }
    } catch (error) {
      ElMessage.error('删除失败')
      console.error('删除药品失败', error)
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    let res
    if (isEdit.value) {
      res = await updateDrugApi(form.id, form)
    } else {
      res = await addDrugApi(form)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      loadDrugList()
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '编辑失败' : '添加失败')
    console.error('表单提交失败', error)
  }
}

// 初始化
onMounted(() => {
  loadDrugList()
  loadElderList()
})
</script>

<style scoped>
.drug-manage {
  background: var(--bg-color);
  padding: 16px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.search-card,
.drug-list-card {
  border-radius: var(--border-radius-lg) !important;
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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
.el-button--small {
  padding: 8px 12px;
}
</style>