<template>
  <div class="change-password-page">
    <div class="header">
      <h2>修改密码</h2>
    </div>
    
    <van-form @submit="onSubmit" ref="formRef" class="password-form">
      <van-cell-group inset>
        <van-field
          v-model="form.oldPassword"
          label="原密码"
          :type="showOldPassword ? 'text' : 'password'"
          placeholder="请输入原密码"
          :rules="[{ required: true, message: '请输入原密码' }]"
        >
          <template #right-icon>
            <van-icon 
              :name="showOldPassword ? 'eye' : 'eye-o'" 
              class="password-toggle-icon" 
              @click="showOldPassword = !showOldPassword"
            />
          </template>
        </van-field>
        
        <van-field
          v-model="form.newPassword"
          label="新密码"
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="请输入新密码"
          :rules="[
            { required: true, message: '请输入新密码' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
          ]"
        >
          <template #right-icon>
            <van-icon 
              :name="showNewPassword ? 'eye' : 'eye-o'" 
              class="password-toggle-icon" 
              @click="showNewPassword = !showNewPassword"
            />
          </template>
        </van-field>
        
        <van-field
          v-model="form.confirmPassword"
          label="确认密码"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
          ]"
        >
          <template #right-icon>
            <van-icon 
              :name="showConfirmPassword ? 'eye' : 'eye-o'" 
              class="password-toggle-icon" 
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </van-field>
      </van-cell-group>
      
      <div style="margin: 16px">
        <van-button type="primary" block native-type="submit" :loading="loading">
          确认修改
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { changePasswordApi } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 密码可见
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单数据
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (value) => {
  return value === form.newPassword
}

// 提交修改，只传oldPassword和newPassword
const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const res = await changePasswordApi({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    if (res.code === 200) {
      showToast('密码修改成功')
      router.push('/user/profile')
    } else {
      showToast(res.msg || '密码修改失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-page {
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

.password-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.password-toggle-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 10px;
}

.password-toggle-icon:hover {
  color: #1976d2;
}
</style>