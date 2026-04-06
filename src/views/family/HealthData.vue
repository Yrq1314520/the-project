<template>
  <div class="health-data">
    <div class="header">
      <h2>健康数据管理</h2>
    </div>
    
    <!-- 数据输入表单 -->
    <div class="input-section">
      <h3>输入健康数据</h3>
      <van-form @submit="onSubmit" ref="formRef" class="health-form">
        <van-cell-group inset>
          <van-field
            v-model="form.date"
            label="日期"
            type="date"
            placeholder="请选择日期"
            :rules="[{ required: true, message: '请选择日期' }]"
          />
          <van-field
            v-model="form.time"
            label="时间"
            type="time"
            placeholder="请选择时间"
            :rules="[{ required: true, message: '请选择时间' }]"
          />
          <van-field
            v-model="form.bloodPressure"
            label="血压"
            placeholder="如: 120/80"
            :rules="[{ required: true, message: '请输入血压' }]"
          />
          <van-field
            v-model="form.bloodSugar"
            label="血糖"
            placeholder="如: 5.6"
            type="number"
            :rules="[{ required: true, message: '请输入血糖' }]"
          />
          <van-field
            v-model="form.heartRate"
            label="心率"
            placeholder="如: 72"
            type="number"
            :rules="[{ required: true, message: '请输入心率' }]"
          />
          <van-field
            v-model="form.remark"
            label="备注"
            type="textarea"
            placeholder="其他说明"
          />
        </van-cell-group>
        
        <div style="margin: 16px">
          <van-button type="primary" block native-type="submit" :loading="loading">
            提交数据
          </van-button>
        </div>
      </van-form>
    </div>
    
    <!-- 数据列表 -->
    <div class="list-section">
      <h3>历史数据</h3>
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-card
          v-for="item in healthDataList"
          :key="item.id"
          :title="`${item.date} ${item.time}`"
          :desc="`血压: ${item.bloodPressure} | 血糖: ${item.bloodSugar}mmol/L | 心率: ${item.heartRate}次/分`"
        >
          <template #footer>
            <div class="card-footer">
              <span v-if="item.remark" class="remark">{{ item.remark }}</span>
              <div class="btn-group">
                <van-button size="small" type="primary" @click="openEditDialog(item)">
                  编辑
                </van-button>
                <van-button size="small" type="danger" @click="onDelete(item.id)">
                  删除
                </van-button>
              </div>
            </div>
          </template>
        </van-card>
      </van-list>
    </div>
    
    <!-- 编辑弹窗 -->
    <van-popup v-model:show="showDialog" position="bottom" style="height: 80%">
      <div class="dialog-content">
        <h3>编辑健康数据</h3>
        <van-form @submit="onEditSubmit">
          <van-cell-group>
            <van-field
              v-model="editForm.date"
              label="日期"
              type="date"
              placeholder="请选择日期"
              :rules="[{ required: true, message: '请选择日期' }]"
            />
            <van-field
              v-model="editForm.time"
              label="时间"
              type="time"
              placeholder="请选择时间"
              :rules="[{ required: true, message: '请选择时间' }]"
            />
            <van-field
              v-model="editForm.bloodPressure"
              label="血压"
              placeholder="如: 120/80"
              :rules="[{ required: true, message: '请输入血压' }]"
            />
            <van-field
              v-model="editForm.bloodSugar"
              label="血糖"
              placeholder="如: 5.6"
              type="number"
              :rules="[{ required: true, message: '请输入血糖' }]"
            />
            <van-field
              v-model="editForm.heartRate"
              label="心率"
              placeholder="如: 72"
              type="number"
              :rules="[{ required: true, message: '请输入心率' }]"
            />
            <van-field
              v-model="editForm.remark"
              label="备注"
              type="textarea"
              placeholder="其他说明"
            />
          </van-cell-group>
          <div style="margin: 16px">
            <van-button type="primary" block native-type="submit">
              保存修改
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { addHealthDataApi, getHealthDataListApi, updateHealthDataApi, deleteHealthDataApi } from '@/api/family'

const formRef = ref(null)
const loading = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const showDialog = ref(false)
const healthDataList = ref([])
const page = ref(1)

// 表单数据
const form = reactive({
  date: '',
  time: '',
  bloodPressure: '',
  bloodSugar: '',
  heartRate: '',
  remark: ''
})

// 编辑表单数据
const editForm = reactive({
  id: null,
  date: '',
  time: '',
  bloodPressure: '',
  bloodSugar: '',
  heartRate: '',
  remark: ''
})

// 初始化
onMounted(() => {
  // 设置默认日期为今天
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  form.date = `${year}-${month}-${day}`
  
  // 加载数据列表
  onLoad()
})

// 提交数据
const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const res = await addHealthDataApi(form)
    if (res && res.success === 200) {
      showToast('数据提交成功')
      // 重置表单
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
      // 重新加载列表
      healthDataList.value = []
      page.value = 1
      finished.value = false
      onLoad()
    } else {
      showToast(res?.errorMsg || '数据提交失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loading.value = false
  }
}

// 加载数据列表
const onLoad = async () => {
  listLoading.value = true
  try {
    const res = await getHealthDataListApi({ page: page.value, pageSize: 10 })
    if (res && res.success === 200) {
      healthDataList.value.push(...res.data?.list || [])
      page.value++
      if (healthDataList.value.length >= res.data?.total) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast('加载数据失败')
  } finally {
    listLoading.value = false
  }
}

// 打开编辑弹窗
const openEditDialog = (item) => {
  showDialog.value = true
  Object.assign(editForm, item)
}

// 提交编辑
const onEditSubmit = async () => {
  try {
    const res = await updateHealthDataApi(editForm)
    if (res && res.success === 200) {
      showToast('修改成功')
      showDialog.value = false
      // 重新加载列表
      healthDataList.value = []
      page.value = 1
      finished.value = false
      onLoad()
    } else {
      showToast(res?.errorMsg || '修改失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  }
}

// 删除数据
const onDelete = async (id) => {
  await showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这条健康数据吗？'
  })
  
  try {
    const res = await deleteHealthDataApi(id)
    if (res && res.success === 200) {
      showToast('删除成功')
      // 重新加载列表
      healthDataList.value = []
      page.value = 1
      finished.value = false
      onLoad()
    } else {
      showToast(res?.errorMsg || '删除失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  }
}
</script>

<style scoped>
.health-data {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.input-section,
.list-section {
  margin-bottom: 30px;
}

.input-section h3,
.list-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.health-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.van-card {
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.remark {
  color: #666;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.dialog-content {
  padding: 20px;
}

.dialog-content h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>