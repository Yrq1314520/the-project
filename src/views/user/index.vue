<template>
  <div class="login-container">
    <div class="login-header">
      <div class="brand-name">翼护银发</div>
      <div class="brand-slogan">智慧康养 · 安心相伴</div>
      <div class="brand-decoration"></div>
    </div>

    <van-tabs v-model:active="activeTab" class="login-tabs" sticky>
      <van-tab title="登录">
        <LoginForm @switch-to-login="switchToLogin" />
      </van-tab>
      <van-tab title="注册">
        <RegisterForm @switch-to-login="switchToLogin" />
      </van-tab>
      <van-tab title="忘记密码">
        <ResetPasswordForm @switch-to-login="switchToLogin" />
      </van-tab>
    </van-tabs>

    <div class="footer-copyright">
      <span>© 2026 翼护银发 | 让科技更有温度</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ResetPasswordForm from './ResetPasswordForm.vue'

const activeTab = ref(0)
const switchToLogin = () => {
  activeTab.value = 0
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(145deg, #F5F9FF 0%, #EAF3F5 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}
.brand-name {
  font-size: 36px;
  font-weight: 600;
  color: #2C5A73;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.brand-slogan {
  font-size: 14px;
  color: #6DA3B8;
  margin-bottom: 16px;
}
.brand-decoration {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #3B7C9E, #B8D4E3);
  margin: 0 auto;
  border-radius: 3px;
}

.login-tabs {
  width: 100%;
  max-width: 480px;
}
.login-tabs :deep(.van-tabs__nav) {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  margin: 0 12px;
}
.login-tabs :deep(.van-tab) {
  font-size: 18px;
  font-weight: 500;
  color: #5F7F8C;
  padding-bottom: 10px;
}
.login-tabs :deep(.van-tab--active) {
  color: #3B7C9E;
  font-weight: 600;
}
.login-tabs :deep(.van-tabs__line) {
  background: linear-gradient(90deg, #3B7C9E, #6DA3B8);
  height: 3px;
  border-radius: 3px;
  bottom: 0;
}
.login-tabs :deep(.van-tabs__content) {
  background: transparent;
  padding: 8px 0;
}

.footer-copyright {
  margin-top: 40px;
  font-size: 12px;
  color: #9BB7C4;
  text-align: center;
}
</style>