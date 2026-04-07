<template>
  <div class="profile-edit">
    <h2>{{ isEdit ? '修改档案' : '创建档案' }}</h2>
    
    <van-form @submit="onSubmit" ref="formRef">
      <van-cell-group inset>
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
          readonly
          @click="showGenderPicker = true"
          :rules="rules.gender"
          required
        />
        <van-field
          v-model="form.age"
          label="年龄"
          type="number"
          placeholder="请输入年龄"
          :rules="rules.age"
          required
        />
        <van-field
          v-model="form.phone"
          label="联系电话"
          placeholder="请输入手机号"
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
          type="number"
          placeholder="请输入身高"
        />
        <van-field
          v-model="form.weight"
          label="体重(kg)"
          type="number"
          placeholder="请输入体重"
        />
      </van-cell-group>
      
      <div style="margin: 16px">
        <van-button type="primary" block native-type="submit" :loading="submitLoading">
          保存档案
        </van-button>
        <van-button style="margin-top: 10px" block @click="goBack">
          取消
        </van-button>
      </div>
    </van-form>

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
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { getElderInfoByUserId, addElderInfo, updateElderInfo } from '@/api/elderInfo'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const submitLoading = ref(false)
const isEdit = ref(false)
const showGenderPicker = ref(false)
const showBloodTypePicker = ref(false)

// 选择器数据
const genderColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]
const bloodTypeColumns = [
  { text: 'A型', value: 'A型' },
  { text: 'B型', value: 'B型' },
  { text: 'AB型', value: 'AB型' },
  { text: 'O型', value: 'O型' },
  { text: 'RH阳性', value: 'RH阳性' },
  { text: 'RH阴性', value: 'RH阴性' }
]

const form = reactive({
  id: null,
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

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  gender: [{ required: true, message: '请选择性别' }],
  age: [
    { required: true, message: '请输入年龄' },
    { pattern: /^\d+$/, message: '年龄必须是数字' }
  ],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ]
}

// 加载已有档案
const loadProfile = async () => {
  try {
    const res = await getElderInfoByUserId(userStore.userInfo.id)
    if (res.code === 200 && res.data && res.data.name) {
      isEdit.value = true
      Object.assign(form, res.data)
    }
  } catch (err) {
    console.error('加载档案失败', err)
  }
}

// 性别选择确认
const onGenderConfirm = ({ selectedOptions }) => {
  if (selectedOptions && selectedOptions.length > 0) {
    form.gender = selectedOptions[0].text
  }
  showGenderPicker.value = false
}

// 血型选择确认
const onBloodTypeConfirm = ({ selectedOptions }) => {
  if (selectedOptions && selectedOptions.length > 0) {
    form.bloodType = selectedOptions[0].text
  }
  showBloodTypePicker.value = false
}

// 提交表单
const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    const baseData = {
      name: form.name,
      gender: form.gender,
      age: Number(form.age),               // 转为数字
      phone: form.phone,
      idCard: form.idCard || '',
      address: form.address || '',
      illness: form.illness || '',
      allergy: form.allergy || '',
      bloodType: form.bloodType || '',
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
      userId: userStore.userInfo.id
    }

    let submitData
    let res
    if (isEdit.value && form.id) {
      submitData = { ...baseData, id: Number(form.id) }
      res = await updateElderInfo(submitData)
    } else {
      submitData = baseData
      res = await addElderInfo(submitData)
    }

    console.log('提交数据:', submitData)
    console.log('返回结果:', res)

    if (res.code === 200) {
      showToast(isEdit.value ? '修改成功' : '创建成功')
      router.push('/oldman/profile')
    } else {
      const errorMsg = res.msg || res.errorMsg || '保存失败'
      showToast(errorMsg)
    }
  } catch (err) {
    console.error('保存档案失败:', err)
    if (err.response) {
      showToast(err.response.data?.msg || '服务器错误')
    } else {
      showToast('网络异常，请重试')
    }
  } finally {
    submitLoading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-edit {
  padding: 16px;
  background: var(--bg-color);
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
}
</style>