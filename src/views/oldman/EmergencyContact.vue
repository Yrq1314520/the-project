<template>
  <div class="emergency-setup">
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
          placeholder="如：儿子、女儿、邻居"
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
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { getElderInfoByUserId, updateElderInfo } from '@/api/elderInfo'

const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)

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

// 加载已有的紧急联系人信息,if
const loadEmergencyContact = async () => {
  try {
    const res = await getElderInfoByUserId(userStore.userInfo.id)
    if (res.code === 200 && res.data) {
      form.name = res.data.emergencyName || ''
      form.phone = res.data.emergencyPhone || ''
      form.relation = res.data.emergencyRelation || ''
    }
  } catch (err) {
    console.error('加载紧急联系人失败', err)
  }
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const updateData = {
      userId: userStore.userInfo.id,
      emergencyName: form.name,
      emergencyPhone: form.phone,
      emergencyRelation: form.relation
    }
    
    const res = await updateElderInfo(updateData)
    if (res.code === 200) {
      showToast('设置成功')
      // 清空表单
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
  loadEmergencyContact()
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