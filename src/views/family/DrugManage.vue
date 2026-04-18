<template>
  <div class="family-drug-page">
    <div class="page-header">
      <h2 class="page-title">药品管理</h2>
      <van-button type="primary" @click="openAddDialog">
        添加药品
      </van-button>
    </div>

    <!-- 输入老人档案ID -->
    <van-cell-group inset>
      <van-field
        v-model="elderIdInput"
        label="老人档案ID"
        placeholder="请输入老人档案ID"
        type="number"
        required
        @keyup.enter="onConfirmElderId"
      />
      <div style="padding: 12px;">
        <van-button type="primary" block @click="onConfirmElderId">
          确认
        </van-button>
      </div>
    </van-cell-group>

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
      <van-cell
        v-for="item in drugList"
        :key="item.id"
        :title="item.medicineName"
        :desc="`类型：${item.type || '暂无'} | 数量：${item.quantity || '暂无'}`"
      >
        <template #right-icon>
          <van-button type="primary" size="small" @click="openEditDialog(item)">
            编辑
          </van-button>
          <van-button type="danger" size="small" @click="handleDelete(item)">
            删除
          </van-button>
        </template>
      </van-cell>
    </van-list>

    <van-empty v-if="!loading && drugList.length === 0" description="暂无药品信息" />

    <!-- 添加/编辑药品对话框 -->
   <van-popup v-model:show="showDialog" position="bottom" round>
   <div class="dialog-content">
    <h3 class="dialog-title">{{ isEdit ? '修改药品' : '添加药品' }}</h3>
    <van-form @submit="handleSubmit">
      <!-- 添加时显示老人档案ID -->
      <van-field
        v-if="!isEdit"
        v-model="drugForm.elderId"
        label="老人档案ID"
        placeholder="请输入老人档案ID"
        type="number"
        required
      />
      <van-field
        v-model="drugForm.medicineName"
        label="药品名称"
        placeholder="请输入药品名称"
        required
      />
      <van-field
        v-model="drugForm.quantity"
        label="数量"
        type="number"
        placeholder="请输入数量"
        required
      />
      <template v-if="!isEdit">
        <van-field
        v-model="drugForm.type"
        label="类型"
        placeholder="请选择药品类型"
        readonly
        required
        class="rounded-field"
        @click="showTypePicker = true"
      />
        <van-field
          v-model="drugForm.expiryDate"
          label="有效期"
          placeholder="请选择有效期"
          readonly
          required
          @click="showDatePicker = true"
        />
        <van-field
          v-model="drugForm.remark"
          label="备注"
          type="textarea"
          placeholder="请输入备注"
        />
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
import { ref, reactive, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getDrugListByElderIdApi, addDrugApi, updateDrugApi, deleteDrugApi, fuzzySearchDrugApi } from '@/api/medicine'

// 老人档案ID输入
const elderIdInput = ref('')
const currentElderId = ref('')

// 搜索关键词和类型筛选
const searchKey = ref('')
const selectedType = ref('')

// 药品列表
const drugList = ref([])
const loading = ref(false)
const finished = ref(false)

// 弹窗控制
const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

// 添加药品表单
const drugForm = reactive({
  elderId: '',
  medicineName: '',
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

// 编辑药品表单（不包含档案ID）
const editForm = reactive({
  id: '',
  medicineName: '',
  quantity: ''
})

// 日期选择器
const showDatePicker = ref(false)
const datePickerValue = ref(['2025', '01', '01'])

const onDateConfirm = (value) => {
  const year = value.selectedValues[0]
  const month = value.selectedValues[1]
  const day = value.selectedValues[2]
  drugForm.expiryDate = `${year}-${month}-${day}`
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

const typeFilterOptions = ref([
  { text: '全部', value: '' },
  ...typeOptions.value
])

const showTypePicker = ref(false)
const onTypeConfirm = ({ selectedOptions }) => {
  drugForm.type = selectedOptions[0].value
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

// 确认档案ID
const onConfirmElderId = () => {
  if (!elderIdInput.value) {
    showToast('请输入老人档案ID')
    return
  }
  currentElderId.value = elderIdInput.value
  // 重置列表并重新加载
  drugList.value = []
  finished.value = false
  loadData()
}

// 加载药品列表
const loadData = async () => {
  if (!currentElderId.value) {
    finished.value = true
    return
  }
  loading.value = true
  try {
    let res
    if (searchKey.value || selectedType.value) {
      res = await fuzzySearchDrugApi({
        medicineName: searchKey.value.trim(),
        type: selectedType.value,
        elderId: currentElderId.value
      })
    } else {
      res = await getDrugListByElderIdApi(currentElderId.value)
    }
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

// 搜索事件
const onSearch = () => {
  if (!currentElderId.value) {
    showToast('请先输入老人档案ID并确认')
    return
  }
  drugList.value = []
  finished.value = false
  loadData()
}

// 监听类型变化自动搜索
watch(selectedType, () => {
  if (currentElderId.value) {
    onSearch()
  }
})

// 打开添加弹窗
const openAddDialog = () => {
  if (!currentElderId.value) {
    showToast('请先输入老人档案ID并确认')
    return
  }
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
      // 编辑
      const submitData = {
        medicineName: editForm.medicineName,
        quantity: Number(editForm.quantity)
      }
      const res = await updateDrugApi(currentId.value, submitData)
      if (res.success === 200) {
        showToast('修改成功')
        showDialog.value = false
        // 刷新列表
        loadData()
      } else {
        showToast(res.errorMsg || '修改失败')
      }
    } else {
      // 添加
      if (!drugForm.elderId) {
        showToast('请输入老人档案ID')
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
        // 如果添加的档案ID与当前搜索的ID一致，刷新列表；否则提示用户
        if (drugForm.elderId === currentElderId.value) {
          loadData()
        } else {
          showToast('药品已添加，请切换档案ID查看')
        }
      } else {
        showToast(res.errorMsg || '添加失败')
      }
    }
  } catch (err) {
    console.error('操作失败', err)
    showToast('操作失败，请稍后重试')
  } finally {
    // 重置编辑状态
    isEdit.value = false
    currentId.value = null
    editForm.medicineName = ''
    editForm.quantity = ''
  }
}

// 删除药品
const handleDelete = (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除药品"${item.medicineName}"吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
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
      console.error('删除失败', err)
      showToast('删除失败，请稍后重试')
    }
  }).catch(() => {})
}
</script>

<style scoped>
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
  height: inherit;
  width: 100px;
  background-color: #f7f8fa;
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
.rounded-field .van-field__control {
  border-radius: 30px;
}
</style>