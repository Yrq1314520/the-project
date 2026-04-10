<template>
  <div class="profile-page page-container">
    <div class="header">
      <h2>老人档案管理</h2>
      <van-button type="primary" round @click="openAddDialog" size="large">
        <van-icon name="plus" style="margin-right: 8px" />
        新增档案
      </van-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-field
        v-model="searchKeyword"
        placeholder="搜索老人姓名"
        clearable
        @keyup.enter="onSearch"
      >
        <template #left-icon>
          <van-icon name="search" />
        </template>
        <template #button>
          <van-button size="small" type="primary" round @click="onSearch">搜索</van-button>
        </template>
      </van-field>
    </div>

    <!-- 档案列表 -->
    <div v-if="list.length > 0" class="profile-list">
      <div v-for="item in list" :key="item.id" class="profile-card">
        <div class="profile-header">
          <div class="profile-info">
            <div class="profile-name">{{ item.name || '未命名' }}</div>
            <div class="profile-basic">
              <span v-if="!item.noProfile">{{ item.age }}岁</span>
              <span v-if="!item.noProfile" class="gender-tag" :class="{ 'male': item.gender === 1, 'female': item.gender === 2 }">
                {{ item.gender === 1 ? '男' : item.gender === 2 ? '女' : '' }}
              </span>
            </div>
          </div>
          <div v-if="item.noProfile" class="no-profile-tag">
            <van-tag type="danger">无档案</van-tag>
          </div>
        </div>
        
        <div v-if="!item.noProfile" class="profile-details">
          <div v-if="item.medicalHistory" class="medical-history">
            <van-tag type="warning">{{ item.medicalHistory }}</van-tag>
          </div>
          <div v-if="item.relation" class="relation">
            关系：{{ item.relation }}
          </div>
        </div>
        
        <div v-if="item.noProfile" class="no-profile-message">
          {{ item.errorMsg }}
        </div>
        
        <div class="profile-footer">
          <span class="create-time">{{ item.createTime || '未知时间' }}</span>
          <div class="btn-group">
            <template v-if="item.noProfile">
              <van-button size="small" type="primary" round @click="openAddDialogForUser(item)">
                添加档案
              </van-button>
            </template>
            <template v-else>
              <van-button size="small" type="primary" round @click="openViewDialog(item)">
                查看
              </van-button>
              <van-button size="small" type="success" round @click="openEditDialog(item)">
                编辑
              </van-button>
              <van-button size="small" type="danger" round @click="onDelete(item.id)">
                删除
              </van-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="list.length === 0 && !loading" class="empty-state">
      <van-icon name="profile" size="48" color="#ccc" />
      <p>暂无老人档案</p>
      <p class="empty-hint">请搜索老人姓名或点击新增档案</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" color="#1989fa" />
      <p>加载中...</p>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showDialog" position="bottom" style="height: 85%">
      <div class="dialog-content">
        <h3>{{ isEdit ? '编辑老人档案' : '新增老人档案' }}</h3>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <!-- 基本信息 -->
            <van-field
              v-model="form.userId"
              label="用户ID"
              placeholder="请输入老人用户ID"
              :rules="rules.userId"
              required
              type="number"
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
              :model-value="form.gender === 1 ? '男' : form.gender === 2 ? '女' : ''"
              label="性别"
              placeholder="请选择性别"
              :rules="rules.gender"
              required
              readonly
              @click="showGenderPicker = true"
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
            <van-field
              v-model="form.medicalHistory"
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
              v-model="form.emergencyContact"
              label="紧急联系人"
              placeholder="请输入紧急联系人"
            />
            <van-field
              v-model="form.emergencyPhone"
              label="紧急联系电话"
              placeholder="请输入紧急联系电话"
            />
            <van-field
              v-model="form.address"
              label="居住地址"
              placeholder="请输入居住地址"
              type="textarea"
              rows="2"
            />
            <van-field
              v-model="form.relation"
              label="关系"
              placeholder="请输入关系，如：子女"
            />
          </van-cell-group>
          <div style="margin: 20px 0;">
            <van-button type="primary" block native-type="submit" :loading="submitLoading" size="large">
              {{ isEdit ? '保存修改' : '提交' }}
            </van-button>
            <van-button style="margin-top: 12px" block @click="showDialog = false" size="large">
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
        <div v-if="currentProfile" class="profile-detail-content">
          <div class="detail-item">
            <span class="detail-label">用户ID</span>
            <span class="detail-value">{{ currentProfile.userId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">年龄</span>
            <span class="detail-value">{{ currentProfile.age + '岁' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">性别</span>
            <span class="detail-value">{{ currentProfile.gender === 1 ? '男' : currentProfile.gender === 2 ? '女' : '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">身高</span>
            <span class="detail-value">{{ currentProfile.height ? currentProfile.height + 'cm' : '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">体重</span>
            <span class="detail-value">{{ currentProfile.weight ? currentProfile.weight + 'kg' : '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">基础病史</span>
            <span class="detail-value">{{ currentProfile.medicalHistory || '无' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">过敏史</span>
            <span class="detail-value">{{ currentProfile.allergy || '无' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">紧急联系人</span>
            <span class="detail-value">{{ currentProfile.emergencyContact || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">紧急联系电话</span>
            <span class="detail-value">{{ currentProfile.emergencyPhone || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">居住地址</span>
            <span class="detail-value">{{ currentProfile.address || '未填写' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">关系</span>
            <span class="detail-value">{{ currentProfile.relation || '未填写' }}</span>
          </div>
        </div>
        <div style="margin: 20px 0;">
          <van-button block @click="showViewDialog = false" size="large">关闭</van-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import {
  addOldmanProfileApi,
  updateOldmanProfileApi,
  deleteOldmanProfileApi,
  searchElderByUsernameApi,  // 搜索
  getElderProfileByUserIdApi
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

// 选择器数据
const genderColumns = [
  { text: '男', value: 1 },
  { text: '女', value: 2 }
]

// 表单数据
const form = reactive({
  id: '',
  userId: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  medicalHistory: '',
  allergy: '',
  emergencyContact: '',
  emergencyPhone: '',
  address: '',
  relation: ''
})

// 表单验证规则
const rules = {
  userId: [
    { required: true, message: '请输入用户ID' },
    { pattern: /^\d+$/, message: '用户ID必须是数字' }
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { pattern: /^\d+$/, message: '年龄必须是数字' }
  ],
  gender: [
    { required: true, message: '请选择性别' }
  ]
}


// 加载列表
const onLoad = async () => {
  if (!searchKeyword.value) {
    loading.value = false
    finished.value = true
    list.value = []
    return
  }

  loading.value = true
  try {
    // 暂时使用搜索接口作为替代
    const res = await searchElderByUsernameApi({
      username: searchKeyword.value
    })
    console.log('加载列表:', res)
    
    if (res.success !== 200) {
      showToast(res.errorMsg || '搜索失败')
      list.value = []
      finished.value = true
      return
    }
    
    const users = res.data || []
    const profiles = []
    
    for (const user of users) {
      try {
        const profileRes = await getElderProfileByUserIdApi(user.id)
        console.log(`用户 ${user.username} 的档案查询结果:`, profileRes)
        
        if (profileRes.success === 200 && profileRes.data) {
          const profileData = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data
          if (profileData) {
            profiles.push({
              ...profileData,
              name: user.username || user.nickname
            })
          }
        } else {
          // 没有档案时，显示用户信息并提示无档案
          profiles.push({
            id: user.id,
            userId: user.id,
            name: user.username || user.nickname,
            age: '暂无',
            gender: 0,
            noProfile: true,
            errorMsg: profileRes.errorMsg || '无这个用户的档案信息'
          })
        }
      } catch (err) {
        console.error('获取档案失败', err)
        profiles.push({
          id: user.id,
          userId: user.id,
          name: user.username || user.nickname,
          age: '暂无',
          gender: 0,
          noProfile: true,
          errorMsg: '网络异常，请稍后重试'
        })
      }
    }
    
    list.value = profiles
    finished.value = true
  } catch (err) {
    showToast('加载失败')
    console.error(err)
    list.value = []
    finished.value = true
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
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  showDialog.value = true
}

// 为指定用户打开新增弹窗
const openAddDialogForUser = (item) => {
  isEdit.value = false
  currentId.value = ''
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  form.userId = item.userId
  showDialog.value = true
}

// 打开编辑弹窗
const openEditDialog = async (item) => {
  isEdit.value = true
  currentId.value = item.id
  Object.assign(form, item)
  showDialog.value = true
}

// 打开查看弹窗
const openViewDialog = async (item) => {
  currentProfile.value = item
  showViewDialog.value = true
}


// 提交表单（对接真实后端）
const onSubmit = async () => {
  try {
    submitLoading.value = true

    if (isEdit.value) {
      // 编辑
      const res = await updateOldmanProfileApi(form)
      console.log('编辑结果:', res)
      if (res.success === 200) {
        showToast('修改成功')
        showDialog.value = false
        onSearch()
      } else {
        showToast(res.errorMsg || '修改失败')
      }
    } else {
      // 新增
      const res = await addOldmanProfileApi(form)
      console.log('新增结果:', res)
      if (res.success === 200) {
        showToast('添加成功')
        showDialog.value = false
        onSearch()
      } else {
        showToast(res.errorMsg || '添加失败')
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
      message: '确定要删除这条老人档案吗？'
    })
    const res = await deleteOldmanProfileApi(id)
    console.log('删除结果:', res)
    if (res.success === 200) {
      showToast('删除成功')
      onSearch()
    } else {
      showToast(res.errorMsg || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') showToast('删除失败')
  }
}

// 性别选择
const onGenderConfirm = (selectedOptions, selectedIndexes) => {
  if (selectedOptions && selectedOptions.length > 0) {
    form.gender = selectedOptions[0].value
  }
  showGenderPicker.value = false
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.profile-page {
  background: var(--bg-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar .van-field {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s;
}

.profile-card:active {
  transform: scale(0.98);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.profile-basic {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gender-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.gender-tag.male {
  background: #E6F7FF;
  color: var(--primary-color);
}

.gender-tag.female {
  background: #FFF1F0;
  color: #F5222D;
}

.no-profile-tag {
  margin-left: 12px;
}

.profile-details {
  margin-bottom: 12px;
}

.medical-history {
  margin-bottom: 8px;
}

.relation {
  font-size: 14px;
  color: var(--text-secondary);
}

.no-profile-message {
  font-size: 14px;
  color: #F5222D;
  margin-bottom: 12px;
}

.profile-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.create-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.btn-group {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  margin-top: 30px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px !important;
  opacity: 0.8;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.loading-state p {
  margin-top: 12px;
  font-size: 14px;
}

.dialog-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.dialog-content h3 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-detail-content {
  background: var(--bg-color);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: var(--text-secondary);
  flex: 1;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  flex: 2;
  text-align: right;
  word-break: break-all;
}
</style>