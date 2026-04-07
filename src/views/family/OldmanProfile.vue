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
        :title="item.name || '未命名'"
        :desc="item.noProfile ? item.errorMsg : `年龄: ${item.age}岁`"
      >
        <template #tags>
          <van-tag v-if="item.noProfile" type="danger">
            无档案
          </van-tag>
          <template v-else>
            <van-tag v-if="item.gender" :type="item.gender === 1 ? 'primary' : 'danger'" class="gender-tag">
              {{ item.gender === 1 ? '男' : '女' }}
            </van-tag>
            <van-tag v-if="item.medicalHistory" type="warning" class="illness-tag">
              {{ item.medicalHistory }}
            </van-tag>
          </template>
        </template>
        <template #footer>
          <div class="card-footer">
            <span class="time">{{ item.createTime || '未知时间' }}</span>
            <div class="btn-group">
              <template v-if="item.noProfile">
                <van-button size="small" type="primary" @click="openAddDialogForUser(item)">
                  添加档案
                </van-button>
              </template>
              <template v-else>
                <van-button size="small" type="primary" @click="openViewDialog(item)">
                  查看
                </van-button>
                <van-button size="small" type="success" @click="openEditDialog(item)">
                  编辑
                </van-button>
                <van-button size="small" type="danger" @click="onDelete(item.id)">
                  删除
                </van-button>
              </template>
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
          <van-cell title="用户ID" :value="currentProfile.userId" />
          <van-cell title="年龄" :value="currentProfile.age + '岁'" />
          <van-cell title="性别" :value="currentProfile.gender === 1 ? '男' : currentProfile.gender === 2 ? '女' : '未填写'" />
          <van-cell title="身高" :value="currentProfile.height ? currentProfile.height + 'cm' : '未填写'" />
          <van-cell title="体重" :value="currentProfile.weight ? currentProfile.weight + 'kg' : '未填写'" />
          <van-cell title="基础病史" :value="currentProfile.medicalHistory || '无'" />
          <van-cell title="过敏史" :value="currentProfile.allergy || '无'" />
          <van-cell title="紧急联系人" :value="currentProfile.emergencyContact || '未填写'" />
          <van-cell title="紧急联系电话" :value="currentProfile.emergencyPhone || '未填写'" />
          <van-cell title="居住地址" :value="currentProfile.address || '未填写'" />
          <van-cell title="关系" :value="currentProfile.relation || '未填写'" />
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
    // 这里应该使用获取已绑定老人列表的接口
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
        // 网络错误时，也显示用户信息
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
