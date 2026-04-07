<template>
  <div class="old-drug-page">
    <div class="page-header">
      <h2 class="page-title">药品信息管理</h2>
      <van-button type="primary" @click="showAddDialog = true">
        添加药品
      </van-button>
    </div>

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
        :title="item.drugName"
        :desc="`规格：${item.spec || '暂无'} | 功效：${item.effect || '暂无'}`"
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
import { getMyDrugListApi, addDrugApi, updateDrugApi, deleteDrugApi } from '@/api/medicine'

// 搜索
const searchKey = ref('')

// 药品列表
const drugList = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

// 添加药品
const showAddDialog = ref(false)
const drugForm = reactive({
  medicineName: '',
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

// 编辑药品
const showEditDialog = ref(false)
const editForm = reactive({
  id: '',
  medicineName: '',
  expiryDate: '',
  type: '',
  quantity: '',
  remark: ''
})

// 加载药品列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getMyDrugListApi()
    console.log(res)
    if (res.code === 200) {
      drugList.value.push(...res.data.list)
      page.value++
      if (drugList.value.length >= res.data.total) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索
const onSearch = () => {
  drugList.value = []
  page.value = 1
  finished.value = false
  loadData()
}

// 添加药品
const handleSubmit = async () => {
  try {
    const res = await addDrugApi(drugForm)
    if (res.code === 200) {
      showToast('添加成功')
      showAddDialog.value = false
      // 重置表单
      Object.assign(drugForm, {
        medicineName: '',
        expiryDate: '',
        type: '',
        quantity: '',
        remark: ''
      })
      // 重新加载数据
      drugList.value = []
      page.value = 1
      finished.value = false
      loadData()
    } else {
      showToast('添加失败')
    }
  } catch (err) {
    showToast('添加失败，请稍后重试')
  }
}

// 编辑药品
const handleEdit = (item) => {
  // 填充编辑表单
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

// 提交编辑
const handleEditSubmit = async () => {
  try {
    const { id, ...updateData } = editForm
    const res = await updateDrugApi(id, updateData)
    if (res.code === 200) {
      showToast('修改成功')
      showEditDialog.value = false
      // 重新加载数据
      drugList.value = []
      page.value = 1
      finished.value = false
      loadData()
    } else {
      showToast('修改失败')
    }
  } catch (err) {
    showToast('修改失败，请稍后重试')
  }
}

// 删除药品
const handleDelete = (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除药品"${item.drugName}"吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  .then(async () => {
    try {
      const res = await deleteDrugApi(item.id)
      if (res.code === 200) {
        showToast('删除成功')
        // 重新加载数据
        drugList.value = []
        page.value = 1
        finished.value = false
        loadData()
      } else {
        showToast('删除失败')
      }
    } catch (err) {
      showToast('删除失败，请稍后重试')
    }
  })
  .catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.old-drug-page {
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
  gap: 12px;
}
.dialog-buttons .van-button {
  flex: 1;
}
</style>