<template>
  <van-form @submit="onLogin" ref="formRef" class="form">
    <van-cell-group inset>
      <van-field
        v-model="loginForm.phone"
        label="手机号"
        placeholder="请输入手机号"
        :rules="rules.phone"
      />

      <van-field
        v-model="loginForm.password"
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
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { loginApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)

const loginForm = reactive({
  phone: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)


const rules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ],
  password: [

    { required: true, message: '请输入密码' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
  ]
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 调用接口登录
const onLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    const res = await loginApi(loginForm)
    console.log(res)
    if (res && res.success === 200 && res.data) {
      userStore.setLoginInfo(res.data.token, res.data)
      showToast('登录成功')

      // 根据角色跳转不同的页面：
      // 1.老人
      // 2.家庭成员
      // 3.管理员
      if(res.data.role === 1){
        router.push('/oldman')
      } else if(res.data.role === 2){
        router.push('/family')
      } else if(res.data.role === 3){
        router.push('/admin')
      }
    } else {
      showToast(res?.errorMsg || '登录失败')
    }
  } catch (err) {
    showToast('登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
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
</style>
