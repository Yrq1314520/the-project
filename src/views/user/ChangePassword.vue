<template>
  <div class="change-pwd-page">
    <div class="header">
      <h2>修改密码</h2>
    </div>
    
    <van-form @submit="onChangePwd" ref="formRef" class="pwd-form">
      <van-cell-group inset>
        <van-field
          v-model="form.oldPwd"
          label="原密码"
          :type="showOld ? 'text' : 'password'"
          placeholder="请输入原密码"
          :rules="[{ required: true, message: '请输入原密码' }]"
        >
          <template #right-icon>
            <van-icon 
              :name="showOld ? 'eye' : 'eye-o'" 
              class="pwd-toggle-icon" 
              @click="showOld = !showOld"
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
              @click="sendCode"
            >
              {{ counting ? `${countDown}s后重新获取` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        
        <van-field
          v-model="form.newPwd"
          label="新密码"
          :type="showNew ? 'text' : 'password'"
          placeholder="请输入新密码"
          :rules="[
            { required: true, message: '请输入新密码' },
            { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
          ]"
        >
          <template #right-icon>
            <van-icon 
              :name="showNew ? 'eye' : 'eye-o'" 
              class="pwd-toggle-icon" 
              @click="showNew = !showNew"
            />
          </template>
        </van-field>
        
        <van-field
          v-model="form.confirmPwd"
          label="确认密码"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="请再次输入新密码"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: checkConfirmPwd, message: '两次输入的密码不一致' }
          ]"
        >
          <template #right-icon>
            <van-icon 
              :name="showConfirm ? 'eye' : 'eye-o'" 
              class="pwd-toggle-icon" 
              @click="showConfirm = !showConfirm"
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
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { changePasswordApi, sendEmailCodeApi } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 密码可见
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// 验证码相关
const counting = ref(false)
const countDown = ref(60)
let countDownTimer = null

// 表单数据
const form = reactive({
  oldPwd: '',
  email: '',
  verifyCode: '',
  newPwd: '',
  confirmPwd: ''
})

// 确认密码校验
const checkConfirmPwd = (val) => {
  return val === form.newPwd
}

// 发送验证码 (type=3 表示修改密码)
const sendCode = async () => {
  if (!form.email) {
    showToast('请输入邮箱')
    return
  }
  
  try {
    const res = await sendEmailCodeApi({
      email: form.email,
      type: 3
    })
    
    if (res.code === 200) {   
      showToast('验证码发送成功')
      startCountDown()
    } else {
      showToast(res.msg || res.errorMsg || '验证码发送失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常，请重试')
  }
}

// 倒计时开始
const startCountDown = () => {
  counting.value = true
  countDown.value = 60
  
  if (countDownTimer) clearInterval(countDownTimer)
  
  countDownTimer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(countDownTimer)
      counting.value = false
    }
  }, 1000)
}

// 修改密码提交
const onChangePwd = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const userId = userStore.userInfo?.id
    const userEmail = userStore.userInfo?.email || form.email
    
    if (!userId) {
      showToast('无法获取用户信息，请重新登录')
      return
    }
    if (!userEmail) {
      showToast('无法获取邮箱，请重新登录')
      return
    }

    const res = await changePasswordApi(userId, {
      email: userEmail,
      oldPassword: form.oldPwd,
      newPassword: form.newPwd,
      verifyCode: form.verifyCode
    })

    if (res.code === 200 || res.success === 200) {
      showToast('修改成功，请重新登录')
      userStore.logout()
      router.push('/login')
    } else {
      showToast(res.msg || res.errorMsg || '修改失败')
    }
  } catch (err) {
    showToast('网络异常')
  } finally {
    loading.value = false
  }
}

// 清理掉定时器
onUnmounted(() => {
  if (countDownTimer) clearInterval(countDownTimer)
})
</script>

<style scoped>
.change-pwd-page {
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
.pwd-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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