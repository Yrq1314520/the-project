<template>
  <div class="family-drug-page">
    <div class="page-header">
      <h2 class="page-title">药品管理</h2>
      <van-button type="primary" @click="openAddDialog">添加药品</van-button>
    </div>

    <div class="search-wrapper">
      <van-search v-model="searchKey" placeholder="输入药品名称搜索" @search="onSearch" />
      <div class="type-filter">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedType" :options="typeFilterOptions" title="类型" />
        </van-dropdown-menu>
      </div>
    </div>

    <div v-for="item in drugList" :key="item.id" class="drug-card">
      <div class="drug-card-header">
        <div class="drug-name">{{ item.medicineName }}</div>
        <div class="card-actions">
          <van-button class="custom-edit-btn" size="small" @click="openEditDialog(item)">编辑</van-button>
          <van-button type="danger" size="small" @click="openDeleteModal(item)">删除</van-button>
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
          <span class="value">{{ item.remark || '暂无' }}</span>
        </div>
      </div>
    </div>

    <van-empty v-if="!loading && drugList.length === 0" description="暂无药品信息" />

    <!-- 添加/编辑弹窗 -->
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
            <van-button class="custom-edit-btn" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker v-model="datePickerValue" title="选择日期" @confirm="onDateConfirm" @cancel="showDatePicker = false" />
    </van-popup>

    <!-- 类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker :columns="typeOptionsObj" @confirm="onTypeConfirm" @cancel="showTypePicker = false" />
    </van-popup>

    <div v-if="showDeleteModal" class="modal-mask" @click.self="closeDeleteModal">
      <div class="modal-box">
        <div class="modal-title">确认删除药品</div>
        <div class="modal-content">
          删除后将永久清除，无法恢复，确定要删除【{{ deleteTargetName }}】吗？
        </div>
        <div class="modal-footer">
          <button class="footer-btn cancel" @click="closeDeleteModal">取消</button>
          <button class="footer-btn confirm" @click="confirmDelete" :disabled="deleteLoading">
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import {
  getDrugListByElderIdApi,
  addDrugApi,
  updateDrugApi,
  deleteDrugApi,
  fuzzySearchDrugApi
} from '@/api/medicine'

const props = defineProps({
  elderInfoId: {
    type: [String, Number],
    default: ''
  }
})

const currentElderId = ref('')
const searchKey = ref('')
const selectedType = ref('')
const drugList = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)

const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref<any>(null)

const drugForm = reactive({
  elderId: '',
  medicineName: '',
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

const editForm = reactive({
  id: '',
  medicineName: '',
  quantity: ''
})

// 日期选择器
const showDatePicker = ref(false)
const datePickerValue = ref(['2025', '01', '01'])
const onDateConfirm = (value: any) => {
  const [year, month, day] = value.selectedValues
  drugForm.expiryDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 类型选项
const typeOptions = ref(['感冒发烧', '肠胃消化', '咳嗽咽痛', '皮肤骨科', '慢病用药', '儿童用药', '未分类'])
const typeFilterOptions = ref([
  { text: '全部', value: '' },
  ...typeOptions.value.map(t => ({ text: t, value: t }))
])
const typeOptionsObj = ref(typeOptions.value.map(t => ({ text: t, value: t })))

const showTypePicker = ref(false)
const onTypeConfirm = (value: any) => {
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

// 重置表单
const resetDrugForm = () => {
  drugForm.elderId = currentElderId.value || ''
  drugForm.medicineName = ''
  drugForm.expiryDate = ''
  drugForm.type = ''
  drugForm.quantity = ''
  drugForm.remark = ''
}

// 加载药品
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
      res = await getDrugListByElderIdApi(elderIdNum, {})
    }
    if (res.success === 200) {
      drugList.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
    } else {
      drugList.value = []
      showToast(res.errorMsg || '查询不到药品信息')
    }
  } catch (err) {
    console.error('加载药品失败', err)
    showToast('加载失败，请稍后重试')
    drugList.value = []
  } finally {
    loading.value = false
    finished.value = true
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

// 打开添加
const openAddDialog = () => {
  if (!currentElderId.value) {
    showToast('请先选择老人')
    return
  }
  isEdit.value = false
  resetDrugForm()
  showDialog.value = true
}

// 打开编辑
const openEditDialog = (item: any) => {
  isEdit.value = true
  currentId.value = item.id
  editForm.medicineName = item.medicineName || ''
  editForm.quantity = item.quantity || ''
  showDialog.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      const res = await updateDrugApi(currentId.value, {
        medicineName: editForm.medicineName,
        quantity: Number(editForm.quantity)
      })
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

const showDeleteModal = ref(false)
const deleteLoading = ref(false)
const deleteTargetId = ref<any>(null)
const deleteTargetName = ref('')

// 删除弹窗
const openDeleteModal = (item: any) => {
  deleteTargetId.value = item.id
  deleteTargetName.value = item.medicineName
  showDeleteModal.value = true
}

// 关闭删除弹窗
const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteTargetId.value = null
  deleteTargetName.value = ''
}

// 确认删除
const confirmDelete = async () => {
  if (!deleteTargetId.value) return
  deleteLoading.value = true
  try {
    const res = await deleteDrugApi(deleteTargetId.value)
    if (res.success === 200) {
      showToast('删除成功')
      loadData()
    } else {
      showToast(res.errorMsg || '删除失败')
    }
  } catch (err) {
    showToast('删除失败')
  } finally {
    deleteLoading.value = false
    closeDeleteModal()
  }
}

onMounted(() => {
  if (props.elderInfoId) {
    currentElderId.value = props.elderInfoId as string
    loadData()
  }
})
</script>

<style scoped>
.family-drug-page {
  padding: 16px;
  background: #F7F9FC;
  min-height: 100vh;
  position: relative;
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
  background: #5F9DB5;
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

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  width: 280px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.modal-title {
  padding: 20px 15px 10px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: #333;
}
.modal-content {
  padding: 0 20px 20px;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  border-top: 1px solid #eee;
  height: 48px;
  line-height: 48px;
}
.footer-btn {
  flex: 1;
  font-size: 16px;
  border: none;
  background: #fff;
  cursor: pointer;
}
.footer-btn.cancel {
  color: #666;
  border-right: 1px solid #eee;
}
.footer-btn.confirm {
  color: #ee0a24;
  font-weight: 500;
}
.footer-btn:disabled {
  opacity: 0.6;
}
.custom-edit-btn {
  background-color: #1989fa !important;
  border: 1px solid #1989fa !important;
  color: #ffffff !important;
}

.custom-edit-btn:active,
.custom-edit-btn:disabled {
  background-color: #1989fa !important;
  border-color: #1989fa !important;
  opacity: 0.9;
}
</style>