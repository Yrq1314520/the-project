<template>
  <div class="emergency-setup">
    <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
    <h2>设置紧急联系人</h2>
    
    <van-form @submit="onSubmit" ref="formRef">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          label="联系人姓名"
          placeholder="请输入紧急联系人姓名"
          :rules="rules.name"
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
          v-model="form.relation"
          label="关系"
          placeholder="如：儿子、女儿、护工"
          :rules="rules.relation"
          required
        />
      </van-cell-group>
      
      <div style="margin: 16px">
        <van-button type="primary" block native-type="submit" :loading="submitting">
          保存设置
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { getElderInfoByUserId, updateElderInfo } from '@/api/elderInfo'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)

const goBack = () => {
  router.back()
}

// 档案主键
const elderInfoId = ref(null)

const form = reactive({
  name: '',
  phone: '',
  relation: ''
})

const rules = {
  name: [{ required: true, message: '请输入联系人姓名' }],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ],
  relation: [{ required: true, message: '请填写与您的关系' }]
}

const loadElderInfo = async () => {
  try {
    const res = await getElderInfoByUserId(userStore.userInfo.id)
    if (res.code === 200 && res.data) {
      let data = res.data
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      }
      if (data && data.id) {
        elderInfoId.value = data.id
        form.name = data.emergencyContact || data.emergencyName || ''
        form.phone = data.emergencyPhone || ''
        form.relation = data.relation || ''
      } else {
        showToast('未找到档案，请先创建档案')
      }
    } else {
      showToast('未找到档案，请先创建档案')
    }
  } catch (err) {
    console.error('加载档案失败', err)
    showToast('加载档案失败，请稍后重试')
  }
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    if (!elderInfoId.value) {
      showToast('档案不存在，请先创建档案')
      return
    }
    submitting.value = true

    const submitData = {
      id: elderInfoId.value,
      emergencyContact: form.name,
      emergencyPhone: form.phone,
      relation: form.relation,
      userId: userStore.userInfo.id
    }
    
    console.log('更新紧急联系人:', submitData)
    const res = await updateElderInfo(submitData)
    console.log('提交结果:', res)

    if (res.code === 200) {
      showToast('设置成功')
      // 清空
      form.name = ''
      form.phone = ''
      form.relation = ''
      formRef.value?.resetValidation()
    } else {
      showToast(res.msg || res.errorMsg || '保存失败')
    }
  } catch (err) {
    console.error('保存紧急联系人失败', err)
    showToast('网络异常，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadElderInfo()
})
</script>

<style scoped>
.emergency-setup {
  padding: 20px;
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