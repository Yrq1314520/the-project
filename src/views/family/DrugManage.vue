<template>
  <div class="family-drug-page">
    <div class="page-header">
      <h2 class="page-title">药品管理</h2>
      <van-button type="primary" @click="openAddDialog">添加药品</van-button>
    </div>

    <!-- 搜索栏：药品名称 + 类型筛选 -->
    <div class="search-wrapper">
      <van-search v-model="searchKey" placeholder="输入药品名称搜索" @search="onSearch" />
      <div class="type-filter">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedType" :options="typeFilterOptions" title="类型" />
        </van-dropdown-menu>
      </div>
    </div>

    <!-- 药品列表 -->
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多药品" @load="loadData">
      <van-cell v-for="item in drugList" :key="item.id" :title="item.medicineName"
        :desc="`类型：${item.type || '暂无'} | 数量：${item.quantity || '暂无'}`">
        <template #right-icon>
          <van-button type="primary" size="small" @click="openEditDialog(item)">编辑</van-button>
          <van-button type="danger" size="small" @click="handleDelete(item)">删除</van-button>
        </template>
      </van-cell>
    </van-list>

    <van-empty v-if="!loading && drugList.length === 0" description="暂无药品信息" />

    <!-- 添加药品对话框 -->
    <van-popup v-model:show="showDialog" position="bottom" round>
      <div class="dialog-content">
        <h3 class="dialog-title">{{ isEdit ? '修改药品' : '添加药品' }}</h3>
        <van-form @submit="handleSubmit">
          <van-field v-if="!isEdit" v-model="drugForm.elderId" label="老人档案ID" type="number" required />
          <van-field v-model="drugForm.medicineName" label="药品名称" required />
          <van-field v-model="drugForm.quantity" label="数量" type="number" required />
          <template v-if="!isEdit">
            <van-field v-model="drugForm.type" label="类型" readonly required @click="showTypePicker = true" />
            <van-field v-model="drugForm.expiryDate" label="有效期" readonly required @click="showDatePicker = true" />
            <van-field v-model="drugForm.remark" label="备注" type="textarea" />
          </template>
          <div class="dialog-buttons">
            <van-button type="default" @click="showDialog = false">取消</van-button>
            <van-button type="primary" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker v-model="datePickerValue" title="选择日期" @confirm="onDateConfirm" @cancel="showDatePicker = false" />
    </van-popup>

    <!-- 类型选择器（修复：使用对象数组） -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker :columns="typeOptionsObj" @confirm="onTypeConfirm" @cancel="showTypePicker = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getDrugListByElderIdApi, addDrugApi, updateDrugApi, deleteDrugApi, fuzzySearchDrugApi } from '@/api/medicine'

const props = defineProps({
  elderInfoId: {
    type: [String, Number],
    default: ''
  }
})

const currentElderId = ref('')
const searchKey = ref('')
const selectedType = ref('')
const drugList = ref([])
const loading = ref(false)
const finished = ref(false)

const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const drugForm = reactive({ elderId: '', medicineName: '', expiryDate: '', type: '', quantity: '', remark: '' })
const editForm = reactive({ id: '', medicineName: '', quantity: '' })

// 日期选择器
const showDatePicker = ref(false)
const datePickerValue = ref(['2025', '01', '01'])
const onDateConfirm = (value) => {
  const [year, month, day] = value.selectedValues
  drugForm.expiryDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 类型选项（字符串数组，用于下拉筛选）
const typeOptions = ref(['感冒发烧', '肠胃消化', '咳嗽咽痛', '皮肤骨科', '慢病用药', '儿童用药', '未分类'])
const typeFilterOptions = ref([{ text: '全部', value: '' }, ...typeOptions.value.map(t => ({ text: t, value: t }))])

// 类型选择器（对象数组，用于 van-picker）
const typeOptionsObj = ref(typeOptions.value.map(t => ({ text: t, value: t })))

const showTypePicker = ref(false)
const onTypeConfirm = (value) => {
  // 兼容 Vant 4 的返回格式
  let selected = ''
  if (value && value.selectedValues && value.selectedValues.length > 0) {
    selected = value.selectedValues[0]
  } else if (value && typeof value === 'string') {
    selected = value
  } else if (Array.isArray(value) && value.length > 0) {
    selected = value[0]
  }
  drugForm.type = selected
  showTypePicker.value = false
}

// 重置添加表单
const resetDrugForm = () => {
  drugForm.elderId = currentElderId.value || ''
  drugForm.medicineName = ''
  drugForm.expiryDate = ''
  drugForm.type = ''
  drugForm.quantity = ''
  drugForm.remark = ''
}

// 加载药品列表
const loadData = async () => {
  if (!currentElderId.value) {
    finished.value = true
    return
  }
  loading.value = true
  try {
    const elderIdNum = Number(currentElderId.value)
    let res
    if (searchKey.value || selectedType.value) {
      res = await fuzzySearchDrugApi({
        medicineName: searchKey.value.trim(),
        type: selectedType.value,
        elderId: elderIdNum
      })
    } else {
      res = await getDrugListByElderIdApi(elderIdNum)
    }
    if (res.success === 200) {
      drugList.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
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

const onSearch = () => {
  if (!currentElderId.value) {
    showToast('请先选择老人')
    return
  }
  drugList.value = []
  finished.value = false
  loadData()
}

watch(selectedType, () => {
  if (currentElderId.value) onSearch()
})

// 打开添加弹窗
const openAddDialog = () => {
  if (!currentElderId.value) {
    showToast('请先选择老人')
    return
  }
  isEdit.value = false
  resetDrugForm()
  showDialog.value = true
}

// 打开编辑弹窗
const openEditDialog = (item) => {
  isEdit.value = true
  currentId.value = item.id
  editForm.medicineName = item.medicineName || ''
  editForm.quantity = item.quantity || ''
  showDialog.value = true
}

// 提交添加/编辑
const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      const res = await updateDrugApi(currentId.value, { medicineName: editForm.medicineName, quantity: Number(editForm.quantity) })
      if (res.success === 200) {
        showToast('修改成功')
        showDialog.value = false
        loadData()
      } else {
        showToast(res.errorMsg || '修改失败')
      }
    } else {
      if (!drugForm.medicineName || !drugForm.quantity) {
        showToast('请填写药品名称和数量')
        return
      }
      const submitData = {
        elderId: Number(drugForm.elderId),
        medicineName: drugForm.medicineName,
        quantity: Number(drugForm.quantity),
        expiryDate: drugForm.expiryDate,
        type: drugForm.type,
        remark: drugForm.remark
      }
      const res = await addDrugApi(submitData)
      if (res.success === 200) {
        showToast('添加成功')
        showDialog.value = false
        loadData()
      } else {
        showToast(res.errorMsg || '添加失败')
      }
    }
  } catch (err) {
    console.error('操作失败', err)
    showToast('操作失败，请稍后重试')
  }
}

// 删除药品
const handleDelete = (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除药品"${item.medicineName}"吗？`
  }).then(async () => {
    try {
      const res = await deleteDrugApi(item.id)
      if (res.success === 200) {
        showToast('删除成功')
        loadData()
      } else {
        showToast(res.errorMsg || '删除失败')
      }
    } catch (err) {
      showToast('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  if (props.elderInfoId) {
    currentElderId.value = props.elderInfoId
    loadData()
  }
})
</script>

<style scoped>
/* 样式保持不变 */
.family-drug-page {
  padding: 16px;
  background: var(--bg-color);
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}
.page-header .van-button {
  background: var(--primary-color);
  border-radius: 30px;
  padding: 8px 20px;
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
.van-cell {
  font-size: 18px;
  padding: 16px;
}
.van-cell__title {
  font-weight: 600;
}
.dialog-content {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}
.dialog-title {
  font-size: 18px;
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
}
</style>