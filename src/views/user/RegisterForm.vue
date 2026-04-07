<template>
  <van-form @submit="onRegister" ref="formRef" class="form">
    <van-cell-group inset>
      <van-field
        v-model="registerForm.account"
        label="账号"
        placeholder="请输入手机号/账号"
        :rules="rules.account"
      />

      <van-field
        v-model="registerForm.password"
        label="密码"
        :type="showRegisterPassword ? 'text' : 'password'"
        placeholder="请设置密码"
        :rules="rules.password"
      >
        <template #right-icon>
          <van-icon 
            :name="showRegisterPassword ? 'eye' : 'eye-o'" 
            class="password-toggle-icon" 
            @click="toggleRegisterPassword"
          />
        </template>
      </van-field>

      <van-field
        v-model="registerForm.confirmPassword"
        label="确认密码"
        :type="showRegisterConfirmPassword ? 'text' : 'password'"
        placeholder="请确认密码"
        :rules="rules.confirmPassword"
      >
        <template #right-icon>
          <van-icon 
            :name="showRegisterConfirmPassword ? 'eye' : 'eye-o'" 
            class="password-toggle-icon" 
            @click="toggleRegisterConfirmPassword"
          />
        </template>
      </van-field>

      <van-field
        v-model="registerForm.email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="rules.email"
      />

      <van-field
        v-model="registerForm.code"
        label="验证码"
        placeholder="请输入验证码"
        :rules="rules.code"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :loading="loadingRegisterCode"
            :disabled="registerCount > 0"
            @click="sendRegisterCode"
          >
            {{ registerCount > 0 ? `${registerCount}s` : '发送' }}
          </van-button>
        </template>
      </van-field>
    </van-cell-group>

    <div style="margin: 16px">
      <van-button
        type="primary"
        block
        native-type="submit"
        :loading="registerLoading"
        class="action-btn"
      >
        注册
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { registerApi, sendEmailCodeApi } from '@/api/user'

const formRef = ref(null)

// 注册表单
const registerForm = ref({
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  code: ''
})

// 加载
const registerLoading = ref(false)

// 密码可见
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)

// 验证码相关
const loadingRegisterCode = ref(false)
const registerCount = ref(0)
let registerTimer = null

// 表单验证
const rules = {
  account: [
    { required: true, message: '请输入账号' },
    { pattern: /^1[3-9]\d{9}$|^[a-zA-Z0-9_]{4,16}$/, message: '账号必须是手机号或4-16位字母数字下划线' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' }
  ],
  code: [
    { required: true, message: '请输入验证码' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (value) => {
        if (value !== registerForm.value.password) {
          return '两次密码输入不一致'
        }
        return true
      }
    }
  ]
}

// 切换密码可见
const toggleRegisterPassword = () => {
  showRegisterPassword.value = !showRegisterPassword.value
}

const toggleRegisterConfirmPassword = () => {
  showRegisterConfirmPassword.value = !showRegisterConfirmPassword.value
}

// 发送注册验证码（修正 API 调用）
const sendRegisterCode = async () => {
  if (!registerForm.value.email) {
    showToast('请输入邮箱')
    return
  }

  try {
    loadingRegisterCode.value = true
    // API 只接收 email
    const res = await sendEmailCodeApi(registerForm.value.email)
    if (res.code === 200) {
      showToast('验证码已发送')
      startRegisterCountdown()
    } else {
      showToast(res.msg || '发送失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loadingRegisterCode.value = false
  }
}

// 注册验证码倒计时
const startRegisterCountdown = () => {
  registerCount.value = 60
  clearInterval(registerTimer)
  registerTimer = setInterval(() => {
    if (registerCount.value > 0) {
      registerCount.value--
    } else {
      clearInterval(registerTimer)
    }
  }, 1000)
}

// 注册
const onRegister = async () => {
  try {
    await formRef.value?.validate()
    registerLoading.value = true

    // 移除 confirmPassword 字段
    const { confirmPassword, ...registerData } = registerForm.value
    const res = await registerApi(registerData)
    if (res.code === 200) {
      showToast('注册成功')
      // 清空注册表单
      registerForm.value = {
        account: '',
        password: '',
        confirmPassword: '',
        email: '',
        code: ''
      }
      // 切换到登录选项卡
      emit('switchToLogin')
    } else {
      showToast(res.msg || '注册失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    registerLoading.value = false
  }
}

// 定义事件
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