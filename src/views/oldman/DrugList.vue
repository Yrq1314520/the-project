<template>
  <div class="old-drug-page">
    <div class="page-header">
      <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
      <h2 class="page-title">药品信息管理</h2>
      <van-button type="primary" @click="openAddDialog">
        添加药品
      </van-button>
    </div>

    <!-- 搜索栏：药品名称还有类型筛选 -->
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
      <!-- 药品详细信息 -->
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
          <!-- 有效期 -->
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
            <van-button class="custom-edit-btn" native-type="submit">确定</van-button>
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
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getMyDrugListApi, addDrugApi, updateDrugApi, deleteDrugApi, fuzzySearchDrugApi } from '@/api/medicine'

// 搜索
const searchKey = ref('')
const selectedType = ref('')

// 列表
const drugList = ref<Record<string, any>[]>([])
const loading = ref(false)
const finished = ref(false)

// 弹窗
const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref<any>(null)

// 路由
const router = useRouter()
const goBack = () => {
  router.back()
}

// 表单
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
const onDateConfirm = (value: any) => {
  const year = value.selectedValues[0]
  const month = value.selectedValues[1]
  const day = value.selectedValues[2]
  form.expiryDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 类型
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
const onTypeConfirm = ({ selectedOptions }: any) => {
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

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await (getMyDrugListApi as any)()
    if (res.success === 200) {
      let list = []
      if (Array.isArray(res.data)) {
        list = res.data
      } else if (res.data && Array.isArray(res.data.list)) {
        list = res.data.list
      }
      drugList.value = list
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

// 搜索
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
      if (drugList.value.length === 0) showToast('未找到相关药品')
    } else {
      drugList.value = []
      showToast(res.errorMsg || '搜索失败')
    }
  } catch (err) {
    console.error('搜索失败', err)
    showToast('网络异常，请重试')
    drugList.value = []
  } finally {
    loading.value = false
    finished.value = true
  }
}

const onSearch = () => {
  fuzzySearch()
}

watch(selectedType, () => {
  fuzzySearch()
})

// 添加/编辑
const openAddDialog = () => {
  resetForm()
  showDialog.value = true
}

const openEditDialog = (item: any) => {
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
      fuzzySearch()
    } else {
      showToast(res.errorMsg || (isEdit.value ? '修改失败' : '添加失败'))
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

// 打开删除
const openDeleteModal = (item: any) => {
  deleteTargetId.value = item.id
  deleteTargetName.value = item.medicineName
  showDeleteModal.value = true
}

// 关闭删除
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
      fuzzySearch()
    } else {
      showToast(res.errorMsg || '删除失败')
    }
  } catch (err) {
    console.error('删除失败', err)
    showToast('删除失败，请稍后重试')
  } finally {
    deleteLoading.value = false
    closeDeleteModal()
  }
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
  position: relative;
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
/* 药品卡片 */
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