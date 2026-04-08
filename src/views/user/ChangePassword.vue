<template>
  <div class="change-password-page">
    <div class="header">
      <h2>修改密码</h2>
    </div>
    
    <!-- 修改密码表单 -->
    <van-form @submit="onChangeSubmit" ref="formRef" class="password-form">
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
          v-model="form.email"
          label="邮箱"
          type="email"
          placeholder="请输入注册邮箱"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱地址' }
          ]"
        />
        
        <van-field
          v-model="form.verifyCode"
          label="验证码"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button 
              size="small" 
              :disabled="counting" 
              @click="sendVerifyCode"
            >
              {{ counting ? `${countdown}s后重新获取` : '获取验证码' }}
            </van-button>
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
import { changePasswordApi, sendEmailCodeApi } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 密码可见
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 验证码相关
const counting = ref(false)
const countdown = ref(60)
let countdownTimer = null

// 表单数据
const form = reactive({
  oldPassword: '',
  email: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (value) => {
  return value === form.newPassword
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!form.email) {
    showToast('请输入邮箱')
    return
  }
  
  try {
    const res = await sendEmailCodeApi({
      email: form.email,
      type: 3 // 3 = 修改密码
    })
    
    if (res.success === 200) {
      showToast('验证码发送成功')
      startCountdown()
    } else {
      showToast(res.errorMsg || '验证码发送失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  }
}

// 开始倒计时
const startCountdown = () => {
  counting.value = true
  countdown.value = 60
  
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      counting.value = false
    }
  }, 1000)
}

// 修改密码提交
const onChangeSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    const res = await changePasswordApi({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
      verifyCode: form.verifyCode
    })
    
    console.log('修改密码结果:', res)
    if (res.success === 200) {
      showToast('密码修改成功')
      router.push('/user/profile')
    } else {
      showToast(res.errorMsg || '密码修改失败')
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
  margin-bottom: 20px;
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
