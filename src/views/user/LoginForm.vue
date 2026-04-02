<template>
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
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { loginApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)

// 表单数据
const form = ref({
  account: '',
  password: ''
})

// 加载状态
const loading = ref(false)

// 密码可见性
const showPassword = ref(false)

// 表单验证规则
const rules = {
  account: [
    { required: true, message: '请输入账号' },
    // 先不验证手机号格式
    // { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    // 先不验证密码复杂度
    // { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，8-20位' }
  ]
}

// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 登录
const onLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    userStore.setLoginInfo('userStore.setLoginInfo', 'family')
    showToast('登录成功')
    router.push('/old')
    router.push('/family') // 跳转到家庭页面

    // -----------------------------------
    // 后续再调用登录接口
    // const res = await loginApi(form.value)
    // if (res.code === 200) {
    //   userStore.setLoginInfo(res.data.token, res.data.user)
    //   showToast('登录成功')
    //   router.push('/home') // 跳转到主页
    // } else {
    //   showToast(res.msg || '登录失败')
    // }
    // -----------------------------------


  } catch (err) {
    showToast('网络异常，请重试')
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
