<template>
  <div class="family-drug-page">
    <div class="page-header">
      <h2 class="page-title">药品管理</h2>
      <van-button type="primary" @click="showAddDialog = true">
        添加药品
      </van-button>
    </div>

    <!-- 输入老人ID -->
    <van-cell-group inset>
      <van-field
        v-model="elderIdInput"
        label="老人档案ID"
        placeholder="请输入老人档案ID"
        type="number"
        @keyup.enter="onConfirmElderId"
      />
      <div style="padding: 12px;">
        <van-button type="primary" block @click="onConfirmElderId">
          确认
        </van-button>
      </div>
    </van-cell-group>

    <!-- 搜索 -->
    <van-search
      v-model="searchKey"
      placeholder="输入药品名称搜索"
      @search="onSearch"
    />

    <!-- 列表 -->
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
        <template #right>
          <van-button type="primary" size="small" @click="handleEdit(item)">
            编辑
          </van-button>
          <van-button type="danger" size="small" @click="handleDelete(item)">
            删除
          </van-button>
        </template>
      </van-cell>
    </van-list>

    <van-empty v-if="!loading && drugList.length === 0" description="暂无药品信息" />

    <!-- 添加药品对话框 -->
    <van-popup v-model:show="showAddDialog" position="bottom" round>
      <div class="dialog-content">
        <h3 class="dialog-title">添加药品</h3>
        <van-form @submit="handleSubmit">
          <van-field
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
            v-model="drugForm.expiryDate"
            label="有效期"
            placeholder="请输入有效期，如2025-12-31"
            required
          />
          <van-field
            v-model="drugForm.type"
            label="类型"
            placeholder="请输入药品类型，如感冒发烧"
            required
          />
          <van-field
            v-model="drugForm.quantity"
            label="数量"
            type="number"
            placeholder="请输入数量"
            required
          />
          <van-field
            v-model="drugForm.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注，如饭后服用"
          />
          <div class="dialog-buttons">
            <van-button type="default" @click="showAddDialog = false">取消</van-button>
            <van-button type="primary" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 编辑药品对话框 -->
    <van-popup v-model:show="showEditDialog" position="bottom" round>
      <div class="dialog-content">
        <h3 class="dialog-title">编辑药品</h3>
        <van-form @submit="handleEditSubmit">
          <van-field
            v-model="editForm.medicineName"
            label="药品名称"
            placeholder="请输入药品名称"
            required
          />
          <van-field
            v-model="editForm.expiryDate"
            label="有效期"
            placeholder="请输入有效期，如2025-12-31"
            required
          />
          <van-field
            v-model="editForm.type"
            label="类型"
            placeholder="请输入药品类型，如感冒发烧"
            required
          />
          <van-field
            v-model="editForm.quantity"
            label="数量"
            type="number"
            placeholder="请输入数量"
            required
          />
          <van-field
            v-model="editForm.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注，如饭后服用"
          />
          <div class="dialog-buttons">
            <van-button type="default" @click="showEditDialog = false">取消</van-button>
            <van-button type="primary" native-type="submit">确定</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getDrugListByElderIdApi, addDrugApi, updateDrugApi, deleteDrugApi, fuzzySearchDrugApi } from '@/api/medicine'

const searchKey = ref('')
const drugList = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const showAddDialog = ref(false)
const showEditDialog = ref(false)

const elderIdInput = ref('')
const currentElderId = ref('')

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
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

const onConfirmElderId = () => {
  if (!elderIdInput.value) {
    showToast('请输入老人档案ID')
    return
  }
  currentElderId.value = elderIdInput.value
  drugList.value = []
  page.value = 1
  finished.value = false
  loadData()
}

const loadData = async () => {
  if (!currentElderId.value) {
    loading.value = false
    finished.value = true
    return
  }

  loading.value = true
  try {
    let res
    if (searchKey.value) {
      res = await fuzzySearchDrugApi({
        medicineName: searchKey.value,
        elderId: currentElderId.value
      })
    } else {
      res = await getDrugListByElderIdApi(currentElderId.value)
    }

    if (res.success === 200 && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.list || [])
      drugList.value = page.value === 1 ? list : [...drugList.value, ...list]
      page.value++
      if (list.length < pageSize) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast('加载失败，请稍后重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  drugList.value = []
  page.value = 1
  finished.value = false
  loadData()
}

const handleSubmit = async () => {
  if (!drugForm.elderId) {
    showToast('请输入老人档案ID')
    return
  }

  try {
    const res = await addDrugApi(drugForm)
    if (res.success === 200) {
      showToast('添加成功')
      showAddDialog.value = false
      Object.assign(drugForm, {
        elderId: '',
        medicineName: '',
        expiryDate: '',
        type: '',
        quantity: '',
        remark: ''
      })
      if (currentElderId.value) {
        drugList.value = []
        page.value = 1
        finished.value = false
        loadData()
      }
    } else {
      showToast(res.errorMsg || '添加失败')
    }
  } catch (err) {
    showToast('添加失败，请稍后重试')
    console.error(err)
  }
}

const handleEdit = (item) => {
  Object.assign(editForm, {
    id: item.id,
    medicineName: item.medicineName || '',
    expiryDate: item.expiryDate || '',
    type: item.type || '',
    quantity: item.quantity || '',
    remark: item.remark || ''
  })
  showEditDialog.value = true
}

const handleEditSubmit = async () => {
  try {
    const { id, ...updateData } = editForm
    const res = await updateDrugApi(id, updateData)
    if (res.success === 200) {
      showToast('修改成功')
      showEditDialog.value = false
      if (currentElderId.value) {
        drugList.value = []
        page.value = 1
        finished.value = false
        loadData()
      }
    } else {
      showToast(res.errorMsg || '修改失败')
    }
  } catch (err) {
    showToast('修改失败，请稍后重试')
    console.error(err)
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
        if (currentElderId.value) {
          drugList.value = []
          page.value = 1
          finished.value = false
          loadData()
        }
      } else {
        showToast(res.errorMsg || '删除失败')
      }
    } catch (err) {
      showToast('删除失败，请稍后重试')
      console.error(err)
    }
  })
  .catch(() => {})
}
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
  text-align: center;
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
