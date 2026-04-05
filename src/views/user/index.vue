<template>
  <div class="login-container">
    <div class="login-header">
      <h1>翼护银发 登录</h1>
    </div>
    
    <van-tabs v-model="activeTab" class="tabs">
      <van-tab title="登录">
        <LoginForm />
      </van-tab>
      <van-tab title="注册">
        <RegisterForm @switch-to-login="switchToLogin" />
      </van-tab>
      <van-tab title="忘记密码">
        <ResetPasswordForm @switch-to-login="switchToLogin" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ResetPasswordForm from './ResetPasswordForm.vue'

// 当前激活的选项卡
const activeTab = ref(0)

// 切换到登录选项卡
const switchToLogin = () => {
  activeTab.value = 0
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1976d2;
  margin: 0;
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
</style>
