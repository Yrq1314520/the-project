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
          v-model="form.genderText"
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
          v-model="form.address"
          label="居住地址"
          placeholder="请输入居住地址"
          type="textarea"
          rows="2"
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
        <van-field
          v-model="form.emergencyContact"
          label="紧急联系人"
          placeholder="请输入紧急联系人姓名"
        />
        <van-field
          v-model="form.emergencyPhone"
          label="紧急联系电话"
          placeholder="请输入紧急联系电话"
        />
        <van-field
          v-model="form.relation"
          label="与本人关系"
          placeholder="如：配偶、子女"
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
const elderInfoId = ref(null)   // 档案主键

// 性别选择器（显示用中文）
const genderColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]

// 表单数据
const form = reactive({
  name: '',
  genderText: '',     
  age: '',
  phone: '',
  address: '',
  medicalHistory: '',
  allergy: '',
  height: '',
  weight: '',
  emergencyContact: '',
  emergencyPhone: '',
  relation: ''
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
    if (res.success === 200 && res.data) {
      let data = res.data
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }
      if (data && data.id) {
        isEdit.value = true
        elderInfoId.value = data.id
        let genderText = ''
        if (data.gender === 1) genderText = '男'
        else if (data.gender === 2) genderText = '女'
        else genderText = data.gender || ''
        
        form.name = data.name || ''
        form.genderText = genderText
        form.age = data.age || ''
        form.phone = data.phone || ''
        form.address = data.address || ''
        form.medicalHistory = data.medicalHistory || data.illness || ''
        form.allergy = data.allergy || ''
        form.height = data.height || ''
        form.weight = data.weight || ''
        form.emergencyContact = data.emergencyContact || ''
        form.emergencyPhone = data.emergencyPhone || ''
        form.relation = data.relation || ''
      } else {
        elderInfoId.value = null
        isEdit.value = false
      }
    } else {
      elderInfoId.value = null
      isEdit.value = false
    }
  } catch (err) {
    console.error('加载档案失败', err)
    elderInfoId.value = null
    isEdit.value = false
  }
}

// 性别选择确认
const onGenderConfirm = ({ selectedOptions }) => {
  if (selectedOptions && selectedOptions.length > 0) {
    form.genderText = selectedOptions[0].text
  }
  showGenderPicker.value = false
}

// 提交表单
const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    const submitData = {
      name: form.name,           
      age: Number(form.age),
      gender: form.genderText === '男' ? 1 : 2,
      height: form.height ? Number(form.height) : null,
      weight: form.weight ? Number(form.weight) : null,
      medicalHistory: form.medicalHistory || '',
      allergy: form.allergy || '',
      address: form.address || '',
      emergencyContact: form.emergencyContact || '',
      emergencyPhone: form.emergencyPhone || '',
      relation: form.relation || ''
    }

    let res
    if (isEdit.value && elderInfoId.value) {
      submitData.id = elderInfoId.value
      res = await updateElderInfo(submitData)
    } else {
      res = await addElderInfo(submitData)
    }

    if (res.code === 200) {
      showToast(isEdit.value ? '修改成功' : '创建成功')
      router.push('/oldman/profile')
    } else {
      showToast(res.msg || res.errorMsg || '保存失败')
    }
  } catch (err) {
    console.error('保存档案失败', err)
    showToast('网络异常，请重试')
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