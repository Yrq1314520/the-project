<template>
  <van-form @submit="onResetPwd" ref="formRef" class="form">
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
            :loading="codeLoading"
            :disabled="countDown > 0"
            @click="sendVerifyCode"
          >
            {{ countDown > 0 ? `${countDown}s` : '发送' }}
          </van-button>
        </template>
      </van-field>

      <van-field
        v-model="form.newPassword"
        label="新密码"
        :type="showNewPwd ? 'text' : 'password'"
        placeholder="请设置新密码"
        :rules="rules.newPassword"
      >
        <template #right-icon>
          <van-icon 
            :name="showNewPwd ? 'eye' : 'eye-o'" 
            class="pwd-toggle-icon" 
            @click="toggleNewPwd"
          />
        </template>
      </van-field>
    </van-cell-group>

    <div style="margin: 16px">
      <van-button
        type="primary"
        block
        native-type="submit"
        :loading="submitLoading"
        class="action-btn"
      >
        重置密码
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import { resetPasswordApi, sendEmailCodeApi } from '@/api/user'

const formRef = ref<any>(null)

// 表单数据
const form = reactive({
  email: '',
  verifyCode: '',
  newPassword: ''
})

const submitLoading = ref(false)
const showNewPwd = ref(false)     // 是否显示新密码
const codeLoading = ref(false)
const countDown = ref(0)
let countDownTimer: ReturnType<typeof setInterval> | null = null

// 验证规则
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

// 切换密码可见
const toggleNewPwd = () => {
  showNewPwd.value = !showNewPwd.value
}

// 发送验证码（忘记密码 type=2）
const sendVerifyCode = async () => {
  if (!form.email) {
    showToast('请输入邮箱')
    return
  }

  try {
    codeLoading.value = true
    const res = await sendEmailCodeApi({
      email: form.email,
      type: 2
    })
    if (res.success === 200) {
      showToast('验证码已发送')
      startCountDown()
    } else {
      showToast(res.errorMsg || '发送失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    codeLoading.value = false
  }
}

// 倒计时
const startCountDown = () => {
  countDown.value = 60
  if (countDownTimer) clearInterval(countDownTimer)
  countDownTimer = setInterval(() => {
    if (countDown.value > 0) {
      countDown.value--
    } else {
      if (countDownTimer) clearInterval(countDownTimer)
    }
  }, 1000)
}

// 重置密码提交
const onResetPwd = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    const res = await resetPasswordApi({
      email: form.email,
      verifyCode: form.verifyCode,
      newPassword: form.newPassword
    })
    if (res.success === 200) {
      showToast('密码重置成功')
      // clear form
      form.email = ''
      form.verifyCode = ''
      form.newPassword = ''
      // 切换到登录tab
      emit('switchToLogin')
    } else {
      showToast(res.errorMsg || '重置失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    submitLoading.value = false
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
.pwd-toggle-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 10px;
}
.pwd-toggle-icon:hover {
  color: #1976d2;
}
</style>