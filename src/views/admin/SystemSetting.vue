<template>
  <div class="system-setting">
    <h2>系统设置</h2>
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicSettings" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicSettings.version" disabled />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input v-model="basicSettings.description" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="是否开启预警">
              <el-switch v-model="basicSettings.enableWarning" />
            </el-form-item>
            <el-form-item label="预警通知方式">
              <el-checkbox-group v-model="basicSettings.notificationMethods">
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
                <el-checkbox value="wechat">微信</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securitySettings" label-width="120px">
            <el-form-item label="密码复杂度">
              <el-select v-model="securitySettings.passwordComplexity">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="密码有效期（天）">
              <el-input v-model.number="securitySettings.passwordExpireDays" type="number" />
            </el-form-item>
            <el-form-item label="登录失败次数限制">
              <el-input v-model.number="securitySettings.loginFailLimit" type="number" />
            </el-form-item>
            <el-form-item label="登录超时时间（分钟）">
              <el-input v-model.number="securitySettings.loginTimeout" type="number" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="接口设置" name="api">
          <el-form :model="apiSettings" label-width="120px">
            <el-form-item label="API基础地址">
              <el-input v-model="apiSettings.baseUrl" />
            </el-form-item>
            <el-form-item label="API超时时间（秒）">
              <el-input v-model.number="apiSettings.timeout" type="number" />
            </el-form-item>
            <el-form-item label="WebSocket地址">
              <el-input v-model="apiSettings.wsUrl" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveApi">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

const basicSettings = ref({
  systemName: '智能养老管理系统',
  version: '1.0.0',
  description: '为老人提供全方位的健康监测和管理服务',
  enableWarning: true,
  notificationMethods: ['email', 'wechat']
})

const securitySettings = ref({
  passwordComplexity: 'medium',
  passwordExpireDays: 90,
  loginFailLimit: 5,
  loginTimeout: 30
})

const apiSettings = ref({
  baseUrl: '/api/v1',
  timeout: 10,
  wsUrl: 'ws://localhost:8080'
})

const handleSaveBasic = () => {
  ElMessage.success('基本设置保存成功')
}

const handleSaveSecurity = () => {
  ElMessage.success('安全设置保存成功')
}

const handleSaveApi = () => {
  ElMessage.success('接口设置保存成功')
}
</script>

<style scoped>
.system-setting {
  padding: 20px;
}

.system-setting h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.el-form {
  padding: 20px 0;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>