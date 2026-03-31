<template>
  <div class="medicine-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <h2>用药提醒管理</h2>
      <van-button type="primary" @click="openAddDialog">
        + 新增提醒
      </van-button>
    </div>

    <!--提醒列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-card
        v-for="item in list"
        :key="item.id"
        :title="item.medicineName"
        :desc="`用药时间: ${item.takeTime} | 剂量: ${item.dosage}`"
      >
        <template #footer>
          <div class="card-footer">
            <span class="time">周期: {{ item.cycle }}</span>
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

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showDialog" position="bottom" style="height: 80%">
      <div class="dialog-content">
        <h3>{{ isEdit ? '编辑用药提醒' : '新增用药提醒' }}</h3>
        <van-form @submit="onSubmit">
          <van-cell-group>
            <van-field
              v-model="form.medicineName"
              label="药品名称"
              placeholder="请输入药品名称"
              required
            />
            <van-field
              v-model="form.takeTime"
              label="用药时间"
              placeholder="如: 08:00, 12:00"
              required
            />
            <van-field
              v-model="form.dosage"
              label="用药剂量"
              placeholder="如: 1片/次"
              required
            />
            <van-field
              v-model="form.cycle"
              label="用药周期"
              placeholder="如: 每日/每周一三五"
              required
            />
            <van-field
              v-model="form.remark"
              label="备注"
              type="textarea"
              placeholder="其他说明"
            />
          </van-cell-group>
          <div style="margin: 16px">
            <van-button type="primary" block native-type="submit">
              {{ isEdit ? '保存修改' : '提交' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import {
  getMedicineListApi,
  addMedicineApi,
  updateMedicineApi,
  deleteMedicineApi
} from '@/api/medicine'

// 列表数据
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

// 弹窗状态
const showDialog = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: null,
  medicineName: '',
  takeTime: '',
  dosage: '',
  cycle: '',
  remark: ''
})

// 加载列表
const onLoad = async () => {
  loading.value = true
  try {
    const res = await getMedicineListApi({ page: page.value, pageSize: 10 })
    if (res.code === 200) {
      list.value.push(...res.data.list)
      page.value++
      if (list.value.length >= res.data.total) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  // 清空表单
  Object.keys(form).forEach(key => {
    form[key] = key === 'id' ? null : ''
  })
  showDialog.value = true
}

// 打开编辑弹窗
const openEditDialog = (item) => {
  isEdit.value = true
  // 回填数据
  Object.assign(form, item)
  showDialog.value = true
}

// 提交表单（新增/编辑）
const onSubmit = async () => {
  if (!form.medicineName || !form.takeTime || !form.dosage || !form.cycle) {
    showToast('请填写必填项')
    return
  }

  try {
    if (isEdit.value) {
      await updateMedicineApi(form)
      showToast('修改成功')
    } else {
      await addMedicineApi(form)
      showToast('添加成功')
    }
    showDialog.value = false
    // 刷新列表
    list.value = []
    page.value = 1
    finished.value = false
    onLoad()
  } catch (err) {
    showToast('操作失败')
  }
}

// 删除提醒
const onDelete = async (id) => {
  await showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这条用药提醒吗？'
  })

  try {
    await deleteMedicineApi(id)
    showToast('删除成功')
    // 刷新列表
    list.value = []
    page.value = 1
    finished.value = false
    onLoad()
  } catch (err) {
    showToast('删除失败')
  }
}
</script>

<style scoped>
.medicine-page {
  padding: 16px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
h2 {
  font-size: 20px;
  font-weight: 600;
}
.van-card {
  margin-bottom: 12px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.time {
  color: #666;
  font-size: 14px;
}
.btn-group {
  display: flex;
  gap: 8px;
}
.dialog-content {
  padding: 20px;
}
h3 {
  text-align: center;
  margin-bottom: 20px;
}
</style>