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
        is-link
      />
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import { getMyDrugListApi, addDrugApi } from '@/api/medicine'

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
</script>

<style scoped>
.old-drug-page {
  padding: 16px;
  background: #f8f9fa;
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
}

.dialog-buttons van-button {
  flex: 1;
  margin: 0 10px;
}
</style>