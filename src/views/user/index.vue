<template>
  <div class="login-container">
    <!-- bgp -->
    <div class="bg-image" :style="{ backgroundImage: `url(${img7})` }"></div>
    <div class="form-wrapper">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ResetPasswordForm from './ResetPasswordForm.vue'
import img7 from '@/assets/bgp.png'

const activeTab = ref(0)
// 切换到登录
const switchToLogin = () => {
  activeTab.value = 0
}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  z-index: 0;
}

.form-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  margin-left: auto;        
  margin-right: 5%;         
  min-height: 100vh;
  padding: 40px 28px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: transparent;
  box-shadow: none;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.brand-name {
  font-size: 36px;
  font-weight: 600;
  color: #1A4D66;  
  letter-spacing: 2px;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(255,255,255,0.3);
}
.brand-slogan {
  font-size: 14px;
  color: #2C5F7A;
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
  margin-bottom: 20px;
}
.login-tabs :deep(.van-tabs__nav) {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
}
.login-tabs :deep(.van-tab) {
  font-size: 18px;
  font-weight: 500;
  color: #1E4A63;   
  padding-bottom: 10px;
}
.login-tabs :deep(.van-tab--active) {
  color: #0D3B52;
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

:deep(.login-submit-btn),
:deep(.register-submit-btn),
:deep(.reset-submit-btn) {
  background-color: #1989fa !important;
  border-color: #1989fa !important;
  color: #fff !important;
}

:deep(.van-button--primary) {
  background-color: #1989fa;
  border-color: #1989fa;
}

.footer-copyright {
  margin-top: 40px;
  font-size: 12px;
  color: #4A6F82;
  text-align: center;
}

@media (max-width: 768px) {
  .form-wrapper {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 30px 20px 40px;
    background: transparent;
  }
  .brand-name {
    font-size: 30px;
  }
}
</style>