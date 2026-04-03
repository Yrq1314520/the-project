<template>
  <div class="profile-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <h2>老人档案管理</h2>
      <van-button type="primary" @click="openAddDialog">
        + 新增档案
      </van-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-field
        v-model="searchKeyword"
        placeholder="搜索姓名"
        clearable
        @keyup.enter="onSearch"
      >
        <template #button>
          <van-button size="small" type="primary" @click="onSearch">搜索</van-button>
        </template>
      </van-field>
    </div>

    <!-- 档案列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-card
        v-for="item in list"
        :key="item.id"
        :title="item.name"
        :desc="`年龄: ${item.age}岁 | 电话: ${item.phone}`"
      >
        <template #tags>
          <van-tag v-if="item.gender" :type="item.gender === '男' ? 'primary' : 'danger'" class="gender-tag">
            {{ item.gender }}
          </van-tag>
          <van-tag v-if="item.illness" type="warning" class="illness-tag">
            {{ item.illness }}
          </van-tag>
        </template>
        <template #footer>
          <div class="card-footer">
            <span class="time">{{ item.updateTime || item.createTime }}</span>
            <div class="btn-group">
              <van-button size="small" type="primary" @click="openViewDialog(item)">
                查看
              </van-button>
              <van-button size="small" type="success" @click="openEditDialog(item)">
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

    <!-- 空状态 -->
    <van-empty v-if="list.length === 0 && !loading" description="暂无老人档案" />

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showDialog" position="bottom" style="height: 85%">
      <div class="dialog-content">
        <h3>{{ isEdit ? '编辑老人档案' : '新增老人档案' }}</h3>
        <van-form @submit="onSubmit">
          <van-cell-group>
            <!-- 基本信息 -->
            <van-field
              v-model="form.name"
              label="姓名"
              placeholder="请输入姓名"
              :rules="rules.name"
              required
            />
            <van-field
              v-model="form.gender"
              label="性别"
              placeholder="请选择性别"
              :rules="rules.gender"
              required
              readonly
              @click="showGenderPicker = true"
            />
            <van-field
              v-model="form.age"
              label="年龄"
              placeholder="请输入年龄"
              :rules="rules.age"
              required
              type="number"
            />
            <van-field
              v-model="form.phone"
              label="联系电话"
              placeholder="请输入联系电话"
              :rules="rules.phone"
              required
            />
            <van-field
              v-model="form.idCard"
              label="身份证号"
              placeholder="请输入身份证号"
            />
            <van-field
              v-model="form.address"
              label="居住地址"
              placeholder="请输入居住地址"
              type="textarea"
              rows="2"
            />
            
            <!-- 健康信息 -->
            <van-field
              v-model="form.illness"
              label="基础病史"
              placeholder="如：高血压、糖尿病等"
              type="textarea"
              rows="2"
            />
            <van-field
              v-model="form.allergy"
              label="过敏史"
              placeholder="请输入过敏史"
            />
            <van-field
              v-model="form.bloodType"
              label="血型"
              placeholder="请选择血型"
              readonly
              @click="showBloodTypePicker = true"
            />
            <van-field
              v-model="form.height"
              label="身高(cm)"
              placeholder="请输入身高"
              type="number"
            />
            <van-field
              v-model="form.weight"
              label="体重(kg)"
              placeholder="请输入体重"
              type="number"
            />
          </van-cell-group>
          <div style="margin: 16px">
            <van-button type="primary" block native-type="submit" :loading="submitLoading">
              {{ isEdit ? '保存修改' : '提交' }}
            </van-button>
            <van-button style="margin-top: 10px" block @click="showDialog = false">
              取消
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showViewDialog" position="bottom" style="height: 80%">
      <div class="dialog-content">
        <h3>老人档案详情</h3>
        <van-cell-group v-if="currentProfile">
          <van-cell title="姓名" :value="currentProfile.name" />
          <van-cell title="性别" :value="currentProfile.gender" />
          <van-cell title="年龄" :value="currentProfile.age + '岁'" />
          <van-cell title="联系电话" :value="currentProfile.phone" />
          <van-cell title="身份证号" :value="currentProfile.idCard || '未填写'" />
          <van-cell title="居住地址" :value="currentProfile.address || '未填写'" />
          <van-cell title="基础病史" :value="currentProfile.illness || '无'" />
          <van-cell title="过敏史" :value="currentProfile.allergy || '无'" />
          <van-cell title="血型" :value="currentProfile.bloodType || '未填写'" />
          <van-cell title="身高" :value="currentProfile.height ? currentProfile.height + 'cm' : '未填写'" />
          <van-cell title="体重" :value="currentProfile.weight ? currentProfile.weight + 'kg' : '未填写'" />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button block @click="showViewDialog = false">关闭</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 血型选择器 -->
    <van-popup v-model:show="showBloodTypePicker" position="bottom">
      <van-picker
        :columns="bloodTypeColumns"
        @confirm="onBloodTypeConfirm"
        @cancel="showBloodTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import {
  getOldmanProfileListApi,
  getOldmanProfileDetailApi,
  addOldmanProfileApi,
  updateOldmanProfileApi,
  deleteOldmanProfileApi
} from '@/api/family'

// 列表数据
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const searchKeyword = ref('')

// 弹窗状态
const showDialog = ref(false)
const showViewDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const currentProfile = ref(null)
const currentId = ref('')

// 选择器状态
const showGenderPicker = ref(false)
const showBloodTypePicker = ref(false)

// 选择器数据
const genderColumns = ['男', '女']
const bloodTypeColumns = ['A型', 'B型', 'AB型', 'O型', 'RH阳性', 'RH阴性']

// 表单数据
const form = reactive({
  name: '',
  gender: '',
  age: '',
  phone: '',
  idCard: '',
  address: '',
  illness: '',
  allergy: '',
  bloodType: '',
  height: '',
  weight: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名' },
    { max: 20, message: '姓名不超过20个字符' }
  ],
  gender: [
    { required: true, message: '请选择性别' }
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { pattern: /^\d+$/, message: '年龄必须是数字' }
  ],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ]
}

// 加载列表
const onLoad = async () => {
  loading.value = true
  try {
    const res = await getOldmanProfileListApi({ 
      page: page.value, 
      pageSize: 10,
      keyword: searchKeyword.value 
    })
    if (res.code === 200) {
      list.value.push(...res.data.list)
      page.value++
      if (list.value.length >= res.data.total) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast('加载失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 搜索
const onSearch = () => {
  list.value = []
  page.value = 1
  finished.value = false
  onLoad()
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  currentId.value = ''
  // 清空表单
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  showDialog.value = true
}

// 打开编辑弹窗
const openEditDialog = async (item) => {
  isEdit.value = true
  currentId.value = item.id
  try {
    const res = await getOldmanProfileDetailApi(item.id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      showDialog.value = true
    } else {
      showToast(res.msg || '加载失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  }
}

// 打开查看弹窗
const openViewDialog = async (item) => {
  try {
    const res = await getOldmanProfileDetailApi(item.id)
    if (res.code === 200) {
      currentProfile.value = res.data
      showViewDialog.value = true
    } else {
      showToast(res.msg || '加载失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  }
}

// 提交表单（新增/编辑）
const onSubmit = async () => {
  try {
    submitLoading.value = true
    
    if (isEdit.value) {
      const res = await updateOldmanProfileApi(currentId.value, form)
      if (res.code === 200) {
        showToast('修改成功')
        showDialog.value = false
        // 刷新列表
        list.value = []
        page.value = 1
        finished.value = false
        onLoad()
      } else {
        showToast(res.msg || '修改失败')
      }
    } else {
      const res = await addOldmanProfileApi(form)
      if (res.code === 200) {
        showToast('添加成功')
        showDialog.value = false
        // 刷新列表
        list.value = []
        page.value = 1
        finished.value = false
        onLoad()
      } else {
        showToast(res.msg || '添加失败')
      }
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

// 删除档案
const onDelete = async (id) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条老人档案吗？此操作不可恢复。'
    })

    const res = await deleteOldmanProfileApi(id)
    if (res.code === 200) {
      showToast('删除成功')
      // 刷新列表
      list.value = []
      page.value = 1
      finished.value = false
      onLoad()
    } else {
      showToast(res.msg || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      showToast('网络异常，请重试')
      console.error(err)
    }
  }
}

// 性别选择确认
const onGenderConfirm = (value) => {
  form.gender = value
  showGenderPicker.value = false
}

// 血型选择确认
const onBloodTypeConfirm = (value) => {
  form.bloodType = value
  showBloodTypePicker.value = false
}

// 页面加载时获取列表
onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.profile-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.search-bar {
  margin-bottom: 16px;
}

.van-card {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
}

.gender-tag {
  margin-right: 8px;
}

.illness-tag {
  margin-right: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.time {
  color: #999;
  font-size: 12px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.dialog-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.dialog-content h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}
</style>
