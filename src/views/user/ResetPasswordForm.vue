<template>
  <van-form @submit="onResetPassword" ref="formRef" class="form">
    <van-cell-group inset>
      <van-field
        v-model="form.email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="rules.email"
      />

      <van-field
        v-model="form.verifyCode"
        label="验证码"
        placeholder="请输入验证码"
        :rules="rules.code"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :loading="loadingCode"
            :disabled="countdown > 0"
            @click="sendVerifyCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '发送' }}
          </van-button>
        </template>
      </van-field>

      <van-field
        v-model="form.newPassword"
        label="新密码"
        :type="showPassword ? 'text' : 'password'"
        placeholder="请设置新密码"
        :rules="rules.newPassword"
      >
        <template #right-icon>
          <van-icon 
            :name="showPassword ? 'eye' : 'eye-o'" 
            class="password-toggle-icon" 
            @click="togglePassword"
          />
        </template>
      </van-field>
    </van-cell-group>

    <div style="margin: 16px">
      <van-button
        type="primary"
        block
        native-type="submit"
        :loading="loading"
        class="action-btn"
      >
        重置密码
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import { resetPasswordApi, sendEmailCodeApi } from '@/api/user'

const formRef = ref(null)

// 重置密码表单
const form = reactive({
  email: '',
  verifyCode: '',
  newPassword: ''
})

const loading = ref(false)

// 密码可见性
const showPassword = ref(false)

// 验证码相关
const loadingCode = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 表单验证
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字' }
  ],
  newPassword: [
    { required: true, message: '请设置新密码' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
  ]
}

// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!form.email) {
    showToast('请输入邮箱')
    return
  }

  try {
    loadingCode.value = true
    // 忘记密码使用type=2
    const res = await sendEmailCodeApi({
      email: form.email,
      type: 2
    })
    console.log(res)
    if (res.success === 200) {
      showToast('验证码已发送')
      startCountdown()
    } else {
      showToast(res.errorMsg || '发送失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loadingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

// 重置密码
const onResetPassword = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const res = await resetPasswordApi({
      email: form.email,
      verifyCode: form.verifyCode,
      newPassword: form.newPassword
    })
    console.log(res)
    if (res.success === 200) {
      showToast('密码重置成功')
      // 清空
      form.email = ''
      form.verifyCode = ''
      form.newPassword = ''
      // 切换到登录选项卡
      emit('switchToLogin')
    } else {
      showToast(res.errorMsg || '重置失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loading.value = false
  }
}


const emit = defineEmits(['switchToLogin'])
</script>

<style scoped>
.form {
  padding: 20px;
}
.action-btn {
  margin-top: 20px;
  --van-button-height: 50px;
  font-size: 18px;
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