<template>
  <div class="old-drug-page">
    <div class="page-header">
      <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
      <h2 class="page-title">药品信息管理</h2>
      <van-button type="primary" @click="openAddDialog">
        添加药品
      </van-button>
    </div>

    <!-- 搜索栏：药品名称 + 类型筛选 -->
    <div class="search-wrapper">
      <van-search
        v-model="searchKey"
        placeholder="输入药品名称搜索"
        @search="onSearch"
      />
      <div class="type-filter">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedType" :options="typeFilterOptions" title="类型" />
        </van-dropdown-menu>
      </div>
    </div>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多药品"
      @load="loadData"
    >
      <!-- 自定义药品卡片，显示详细信息 -->
      <div v-for="item in drugList" :key="item.id" class="drug-card">
        <div class="drug-card-header">
          <div class="drug-name">{{ item.medicineName }}</div>
          <div class="card-actions">
            <van-button type="primary" size="small" @click="openEditDialog(item)">编辑</van-button>
            <van-button type="danger" size="small" @click="handleDelete(item)">删除</van-button>
          </div>
        </div>
        <div class="drug-detail-list">
          <div class="detail-row">
            <span class="label">类型：</span>
            <span class="value">{{ item.type || '暂无' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">数量：</span>
            <span class="value">{{ item.quantity || '暂无' }}</span>
          </div>
          <div class="detail-row" v-if="item.expiryDate">
            <span class="label">有效期：</span>
            <span class="value">{{ item.expiryDate }}</span>
          </div>
          <div class="detail-row" v-if="item.remark">
            <span class="label">备注：</span>
            <span class="value">{{ item.remark }}</span>
          </div>
        </div>
      </div>
    </van-list>

    <van-empty v-if="!loading && drugList.length === 0" description="暂无药品信息" />

    <!-- 添加/编辑药品对话框 -->
    <van-popup v-model:show="showDialog" position="bottom" round>
      <div class="dialog-content">
        <h3 class="dialog-title">{{ isEdit ? '修改药品' : '添加药品' }}</h3>
        <van-form @submit="handleSubmit">
          <!-- 药品名称 -->
          <van-field
            v-model="form.medicineName"
            label="药品名称"
            placeholder="请输入药品名称"
            required
          />
          <!-- 数量 -->
          <van-field
            v-model="form.quantity"
            label="数量"
            type="number"
            placeholder="请输入数量"
            required
          />
          <!-- 有效期（添加和编辑都显示） -->
          <van-field
            v-model="form.expiryDate"
            label="有效期"
            placeholder="请选择有效期"
            readonly
            @click="showDatePicker = true"
          />
          <!-- 类型 -->
          <van-field
            v-model="form.type"
            label="类型"
            placeholder="请选择药品类型"
            readonly
            @click="showTypePicker = true"
          />
          <!-- 备注 -->
          <van-field
            v-model="form.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注"
          />

          <div class="dialog-buttons">
            <van-button type="default" @click="showDialog = false">取消</van-button>
            <van-button type="primary" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="datePickerValue"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeOptions"
        :swipe-duration="500"
        :visible-item-count="5"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getMyDrugListApi, addDrugApi, updateDrugApi, deleteDrugApi, fuzzySearchDrugApi } from '@/api/medicine'

// 搜索关键词
const searchKey = ref('')
const selectedType = ref('')

// 药品列表数据
const drugList = ref([])
const loading = ref(false)
const finished = ref(false)

// 弹窗控制
const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

//返回按钮
const router = useRouter()
const goBack = () => {
  router.back()
}
// 表单数据
const form = reactive({
  medicineName: '',
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

// 日期选择器
const showDatePicker = ref(false)
const datePickerValue = ref(['2025', '01', '01'])

const onDateConfirm = (value) => {
  const year = value.selectedValues[0]
  const month = value.selectedValues[1]
  const day = value.selectedValues[2]
  form.expiryDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 药品类型选项
const typeOptions = ref([
  { text: '感冒发烧', value: '感冒发烧' },
  { text: '肠胃消化', value: '肠胃消化' },
  { text: '咳嗽咽痛', value: '咳嗽咽痛' },
  { text: '皮肤骨科', value: '皮肤骨科' },
  { text: '慢病用药', value: '慢病用药' },
  { text: '儿童用药', value: '儿童用药' },
  { text: '未分类', value: '未分类' }
])

// 类型筛选下拉选项
const typeFilterOptions = ref([
  { text: '全部', value: '' },
  ...typeOptions.value
])

const showTypePicker = ref(false)
const onTypeConfirm = ({ selectedOptions }) => {
  form.type = selectedOptions[0].value
  showTypePicker.value = false
}

const resetForm = () => {
  form.medicineName = ''
  form.expiryDate = ''
  form.type = ''
  form.quantity = ''
  form.remark = ''
  currentId.value = null
  isEdit.value = false
}

// 加载全部药品列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getMyDrugListApi()
    if (res.success === 200) {
      let list = []
      if (Array.isArray(res.data)) {
        list = res.data
      } else if (res.data && Array.isArray(res.data.list)) {
        list = res.data.list
      }
      drugList.value = list
      finished.value = true
    } else {
      drugList.value = []
      finished.value = true
      showToast(res.errorMsg || '查询不到药品信息')
    }
  } catch (err) {
    console.error('加载药品失败', err)
    showToast('加载失败，请稍后重试')
    drugList.value = []
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 模糊搜索
const fuzzySearch = async () => {
  const keyword = searchKey.value.trim()
  const type = selectedType.value
  if (!keyword && !type) {
    loadData()
    return
  }
  loading.value = true
  try {
    const res = await fuzzySearchDrugApi({
      medicineName: keyword,
      type: type
    })
    if (res.success === 200) {
      drugList.value = res.data || []
      finished.value = true
      if (drugList.value.length === 0) {
        showToast('未找到相关药品')
      }
    } else {
      drugList.value = []
      finished.value = true
      showToast(res.errorMsg || '搜索失败')
    }
  } catch (err) {
    console.error('搜索失败', err)
    showToast('网络异常，请重试')
    drugList.value = []
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  fuzzySearch()
}
watch(selectedType, () => {
  fuzzySearch()
})

const openAddDialog = () => {
  resetForm()
  showDialog.value = true
}

const openEditDialog = (item) => {
  isEdit.value = true
  currentId.value = item.id
  form.medicineName = item.medicineName || ''
  form.quantity = item.quantity || ''
  form.expiryDate = item.expiryDate || ''
  form.type = item.type || ''
  form.remark = item.remark || ''
  showDialog.value = true
}

const handleSubmit = async () => {
  try {
    const baseData = {
      medicineName: form.medicineName,
      quantity: Number(form.quantity),
      expiryDate: form.expiryDate,
      type: form.type,
      remark: form.remark
    }
    let res
    if (isEdit.value) {
      res = await updateDrugApi(currentId.value, baseData)
    } else {
      res = await addDrugApi(baseData)
    }
    if (res.success === 200) {
      showToast(isEdit.value ? '修改成功' : '添加成功')
      showDialog.value = false
      resetForm()
      fuzzySearch() // 刷新列表
    } else {
      showToast(res.errorMsg || (isEdit.value ? '修改失败' : '添加失败'))
    }
  } catch (err) {
    console.error('操作失败', err)
    showToast('操作失败，请稍后重试')
  }
}

const handleDelete = (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除药品"${item.medicineName}"吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(async () => {
      try {
        const res = await deleteDrugApi(item.id)
        if (res.success === 200) {
          showToast('删除成功')
          fuzzySearch()
        } else {
          showToast(res.errorMsg || '删除失败')
        }
      } catch (err) {
        console.error('删除失败', err)
        showToast('删除失败，请稍后重试')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.old-drug-page {
  padding: 16px;
  background: #F7F9FC;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header .van-button:first-child {
  margin-right: auto;
  background-color: #fff;
}
.page-title {
  flex: 1;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}
.page-header .van-button {
  background: #5F9DB5;
  border-radius: 30px;
  padding: 8px 20px;
  font-size: 16px;
}
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.search-wrapper .van-search {
  flex: 1;
  padding: 0;
}
.type-filter {
  width: 100px;
}

/* 药品卡片样式 */
.drug-card {
  background: white;
  border-radius: 20px;
  margin-bottom: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.drug-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EDF2F7;
}
.drug-name {
  font-size: 20px;
  font-weight: 600;
  color: #1E2A32;
}
.card-actions {
  display: flex;
  gap: 12px;
}
.card-actions .van-button {
  font-size: 14px;
  padding: 4px 12px;
}
.drug-detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-row {
  display: flex;
  font-size: 16px;
  line-height: 1.4;
}
.detail-row .label {
  width: 70px;
  color: #6C7A89;
  font-weight: 500;
}
.detail-row .value {
  flex: 1;
  color: #1E2A32;
  font-weight: 500;
  word-break: break-word;
}

.dialog-content {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}
.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}
.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 20px;
}
.dialog-buttons .van-button {
  flex: 1;
  font-size: 16px;
}
</style>