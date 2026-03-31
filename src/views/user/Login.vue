<template>
  <div class="login-page">
    <h2 class="title">翼护银发 登录</h2>

    <van-form @submit="onLogin" ref="formRef" class="form">
      <van-cell-group inset>
        <van-field
          v-model="form.account"
          label="账号"
          placeholder="请输入手机号/账号"
          :rules="[{ required: true, message: '请输入账号' }]"
        />

        <van-field
          v-model="form.password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />

        <!-- 邮箱验证码区域（找回密码用） -->
        <van-field
          v-model="form.email"
          label="邮箱"
          placeholder="请输入邮箱"
        />
        <van-field
          v-model="form.code"
          label="验证码"
          placeholder="请输入验证码"
        >
          <template #right-icon>
            <van-button
              size="small"
              type="primary"
              plain
              @click="sendCode"
              :disabled="loadingCode"
            >
              {{ loadingCode ? `${count}秒后重发` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button
          type="primary"
          block
          native-type="submit"
          :loading="loading"
          class="login-btn"
        >
          登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { loginApi, sendEmailCodeApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)

// 表单
const form = ref({
  account: '',
  password: '',
  email: '',
  code: ''
})

// 加载状态
const loading = ref(false)
const loadingCode = ref(false)
const count = ref(60)
let timer = null

// 登录
const onLogin = async () => {
  try {
    await formRef.value?.validate()
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

// 获取邮箱验证码
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
  margin-bottom: 60px;
}
.form {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
}
.login-btn {
  margin-top: 20px;
  --van-button-height: 50px;
  font-size: 18px;
}
</style>