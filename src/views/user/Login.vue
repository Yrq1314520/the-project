<template>
  <div class="login-page">
    <h2 class="title">翼护银发</h2>

    <!-- 功能切换选项卡 -->
    <van-tabs v-model="activeTab" class="tabs">
      <van-tab title="登录">
        <!-- 登录表单 -->
        <van-form @submit="onLogin" ref="formRef" class="form">
          <van-cell-group inset>
            <van-field
              v-model="form.account"
              label="账号"
              placeholder="请输入手机号/账号"
              :rules="rules.account"
            />

            <van-field
              v-model="form.password"
              label="密码"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :rules="rules.password"
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
              登录
            </van-button>
          </div>
        </van-form>
      </van-tab>

      <van-tab title="注册">
        <!-- 注册表单 -->
        <van-form @submit="onRegister" ref="registerFormRef" class="form">
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

            <!-- 确认密码字段用validator验证 -->
            <van-field
              v-model="registerForm.confirmPassword"
              label="确认密码"
              :type="showRegisterConfirmPassword ? 'text' : 'password'"
              placeholder="请确认密码"
              :validator="validateConfirmPassword"
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
              <template #right-icon>
                <van-button
                  size="small"
                  type="primary"
                  plain
                  @click="sendRegisterCode"
                  :disabled="loadingRegisterCode"
                >
                  {{ loadingRegisterCode ? `${registerCount}秒后重发` : '获取验证码' }}
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
      </van-tab>

      <van-tab title="忘记密码">
        <!-- 忘记密码表单 -->
        <van-form @submit="onResetPassword" ref="resetFormRef" class="form">
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
              <template #right-icon>
                <van-button
                  size="small"
                  type="primary"
                  plain
                  @click="sendResetCode"
                  :disabled="loadingResetCode"
                >
                  {{ loadingResetCode ? `${resetCount}秒后重发` : '获取验证码' }}
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
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { loginApi, sendEmailCodeApi, registerApi, resetPasswordApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const registerFormRef = ref(null)
const resetFormRef = ref(null)

// 当前激活的选项卡
const activeTab = ref(0)

// 表单验证规则
const rules = {
  account: [
    { required: true, message: '请输入账号' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
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
  newPassword: [
    { required: true, message: '请设置新密码' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
  ]
}

// 确认密码验证
const validateConfirmPassword = (value) => {
  if (!value) {
    return '请确认密码'
  }
  if (value !== registerForm.value.password) {
    return '两次密码输入不一致'
  }
  return true
}

// 登录表单
const form = ref({
  account: '',
  password: ''
})

// 注册表单
const registerForm = ref({
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  code: ''
})

// 忘记密码表单
const resetForm = ref({
  account: '',
  email: '',
  code: '',
  newPassword: ''
})

// 加载状态
const loading = ref(false)
const registerLoading = ref(false)
const resetLoading = ref(false)

// 密码可见性
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)
const showResetPassword = ref(false)

// 验证码相关
const loadingCode = ref(false)
const loadingRegisterCode = ref(false)
const loadingResetCode = ref(false)
const count = ref(60)
const registerCount = ref(60)
const resetCount = ref(60)
let timer = null
let registerTimer = null
let resetTimer = null

// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleRegisterPassword = () => {
  showRegisterPassword.value = !showRegisterPassword.value
}

const toggleRegisterConfirmPassword = () => {
  showRegisterConfirmPassword.value = !showRegisterConfirmPassword.value
}

const toggleResetPassword = () => {
  showResetPassword.value = !showResetPassword.value
}

// 登录
const onLogin = async () => {
  try {
    await formRef.value?.validate()
    // 防止重复提交
    loading.value = true

    const res = await loginApi(form.value)
    if (res.code === 200) {
      userStore.setLoginInfo(res.data.token, res.data.user)
      showToast('登录成功')
      router.push('/home') // 跳转到主页
    } else {
      showToast(res.msg || '登录失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    loading.value = false
  }
}

// 注册
const onRegister = async () => {
  try {
    await registerFormRef.value?.validate()
    registerLoading.value = true

    // 移除confirmPassword字段，只发送必要字段
    const { confirmPassword, ...registerData } = registerForm.value
    const res = await registerApi(registerData)
    if (res.code === 200) {
      showToast('注册成功')
      activeTab.value = 0 // 切换到登录选项卡
      // 清空注册表单
      registerForm.value = {
        account: '',
        password: '',
        confirmPassword: '',
        email: '',
        code: ''
      }
    } else {
      showToast(res.msg || '注册失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    registerLoading.value = false
  }
}

// 重置密码
const onResetPassword = async () => {
  try {
    await resetFormRef.value?.validate()
    resetLoading.value = true

    const res = await resetPasswordApi(resetForm.value)
    if (res.code === 200) {
      showToast('密码重置成功')
      activeTab.value = 0 // 切换到登录选项卡
      // 清空重置表单
      resetForm.value = {
        account: '',
        email: '',
        code: '',
        newPassword: ''
      }
    } else {
      showToast(res.msg || '重置失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
  } finally {
    resetLoading.value = false
  }
}

// 获取邮箱验证码（登录/忘记密码）
const sendCode = async () => {
  if (!form.value.email) {
    showToast('请输入邮箱')
    return
  }

  loadingCode.value = true
  count.value = 60

  try {
    const res = await sendEmailCodeApi(form.value.email)
    if (res.code === 200) {
      showToast('验证码发送成功')
    } else {
      showToast(res.msg || '发送失败')
    }
  } catch (err) {
    showToast('接口异常，发送失败')
  }

  // 倒计时
  timer = setInterval(() => {
    count.value--
    if (count.value <= 0) {
      clearInterval(timer)
      loadingCode.value = false
    }
  }, 1000)
}

// 获取邮箱验证码（注册）
const sendRegisterCode = async () => {
  if (!registerForm.value.email) {
    showToast('请输入邮箱')
    return
  }

  loadingRegisterCode.value = true
  registerCount.value = 60

  try {
    const res = await sendEmailCodeApi(registerForm.value.email)
    if (res.code === 200) {
      showToast('验证码发送成功')
    } else {
      showToast(res.msg || '发送失败')
    }
  } catch (err) {
    showToast('接口异常，发送失败')
  }

  // 倒计时
  registerTimer = setInterval(() => {
    registerCount.value--
    if (registerCount.value <= 0) {
      clearInterval(registerTimer)
      loadingRegisterCode.value = false
    }
  }, 1000)
}

// 获取邮箱验证码（重置密码）
const sendResetCode = async () => {
  if (!resetForm.value.email) {
    showToast('请输入邮箱')
    return
  }

  loadingResetCode.value = true
  resetCount.value = 60

  try {
    const res = await sendEmailCodeApi(resetForm.value.email)
    if (res.code === 200) {
      showToast('验证码发送成功')
    } else {
      showToast(res.msg || '发送失败')
    }
  } catch (err) {
    showToast('接口异常，发送失败')
  }

  // 倒计时
  resetTimer = setInterval(() => {
    resetCount.value--
    if (resetCount.value <= 0) {
      clearInterval(resetTimer)
      loadingResetCode.value = false
    }
  }, 1000)
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 0 20px;
  background-color: #f8f9fa;
}
.title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 40px;
}
.tabs {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
  overflow: hidden;
}
.form {
  padding: 20px;
}
.action-btn {
  margin-top: 20px;
  --van-button-height: 50px;
  font-size: 18px;
}
/* 调整选项卡样式 */
:deep(.van-tabs__content) {
  min-height: 450px;
}
:deep(.van-tab) {
  font-size: 16px;
  font-weight: 500;
}
:deep(.van-tabs__line) {
  background-color: #1976d2;
  height: 3px;
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