<template>
  <van-form @submit="onResetPassword" ref="formRef" class="form">
    <van-cell-group inset>
      <van-field
        v-model="resetForm.account"
        label="账号"
        placeholder="请输入手机号/账号"
        :rules="rules.account"
      />

      <van-field
        v-model="resetForm.email"
        label="邮箱"
        placeholder="请输入邮箱"
        :rules="rules.email"
      />

      <van-field
        v-model="resetForm.code"
        label="验证码"
        placeholder="请输入验证码"
        :rules="rules.code"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :loading="loadingResetCode"
            :disabled="resetCount > 0"
            @click="sendResetCode"
          >
            {{ resetCount > 0 ? `${resetCount}s` : '发送' }}
          </van-button>
        </template>
      </van-field>

      <van-field
        v-model="resetForm.newPassword"
        label="新密码"
        :type="showResetPassword ? 'text' : 'password'"
        placeholder="请设置新密码"
        :rules="rules.newPassword"
      >
        <template #right-icon>
          <van-icon 
            :name="showResetPassword ? 'eye' : 'eye-o'" 
            class="password-toggle-icon" 
            @click="toggleResetPassword"
          />
        </template>
      </van-field>
    </van-cell-group>

    <div style="margin: 16px">
      <van-button
        type="primary"
        block
        native-type="submit"
        :loading="resetLoading"
        class="action-btn"
      >
        重置密码
      </van-button>
    </div>
  </van-form>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { resetPasswordApi, sendEmailCodeApi } from '@/api/user'

const formRef = ref(null)

// 重置密码表单
const resetForm = ref({
  account: '',
  email: '',
  code: '',
  newPassword: ''
})

// 加载状态
const resetLoading = ref(false)

// 密码可见性
const showResetPassword = ref(false)

// 验证码相关
const loadingResetCode = ref(false)
const resetCount = ref(0)
let resetTimer = null

// 表单验证规则
const rules = {
  account: [
    { required: true, message: '请输入账号' },
    { pattern: /^1[3-9]\d{9}$|^[a-zA-Z0-9_]{4,16}$/, message: '账号必须是手机号或4-16位字母数字下划线' }
  ],
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
const toggleResetPassword = () => {
  showResetPassword.value = !showResetPassword.value
}

// 发送重置密码验证码
const sendResetCode = async () => {
  if (!resetForm.value.email) {
    showToast('请输入邮箱')
    return
  }

  try {
    loadingResetCode.value = true
    const res = await sendEmailCodeApi({
      email: resetForm.value.email,
      type: 'reset'
    })
    if (res.code === 200) {
      showToast('验证码已发送')
      startResetCountdown()
    } else {
      showToast(res.msg || '发送失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loadingResetCode.value = false
  }
}

// 重置密码验证码倒计时
const startResetCountdown = () => {
  resetCount.value = 60
  clearInterval(resetTimer)
  resetTimer = setInterval(() => {
    if (resetCount.value > 0) {
      resetCount.value--
    } else {
      clearInterval(resetTimer)
    }
  }, 1000)
}

// 重置密码
const onResetPassword = async () => {
  try {
    await formRef.value?.validate()
    resetLoading.value = true

    const res = await resetPasswordApi(resetForm.value)
    if (res.code === 200) {
      showToast('密码重置成功')
      // 清空重置密码表单
      resetForm.value = {
        account: '',
        email: '',
        code: '',
        newPassword: ''
      }
      // 触发切换到登录选项卡
      emit('switchToLogin')
    } else {
      showToast(res.msg || '重置失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    resetLoading.value = false
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

/* 密码切换图标样式 */
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
