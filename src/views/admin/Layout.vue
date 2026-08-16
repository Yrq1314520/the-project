<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="admin-sidebar">
      <div class="logo">
        <h3>智能养老管理系统</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        router
        @select="handleMenuSelect"
      >
        <el-sub-menu index="dashboard">
          <template #title>
            <el-icon name="el-icon-s-home" />
            <span>系统概览</span>
          </template>
          <el-menu-item index="/admin">
            <el-icon name="el-icon-s-data" />
            <span>仪表盘</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="user">
          <template #title>
            <el-icon name="el-icon-user" />
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/user-manage">
            <el-icon name="el-icon-user" />
            <span>用户列表</span>
          </el-menu-item>
          <el-menu-item index="/admin/role-manage">
            <el-icon name="el-icon-s-grid" />
            <span>角色管理</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="oldman">
          <template #title>
            <el-icon name="el-icon-s-custom" />
            <span>老人管理</span>
          </template>
          <el-menu-item index="/admin/oldman-manage">
            <el-icon name="el-icon-document" />
            <span>老人档案</span>
          </el-menu-item>
          <el-menu-item index="/admin/health-data">
            <el-icon name="el-icon-data-line" />
            <span>健康数据</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="drug">
          <template #title>
            <el-icon name="el-icon-s-tools" />
            <span>药品管理</span>
          </template>
          <el-menu-item index="/admin/drug-manage">
            <el-icon name="el-icon-s-goods" />
            <span>药品库</span>
          </el-menu-item>

        </el-sub-menu>
        
        <el-sub-menu index="warning">
          <template #title>
            <el-icon name="el-icon-warning" />
            <span>预警管理</span>
          </template>
          <el-menu-item index="/admin/warning-manage">
            <el-icon name="el-icon-s-warning" />
            <span>预警记录</span>
          </el-menu-item>
          <el-menu-item index="/admin/notification">
            <el-icon name="el-icon-message" />
            <span>通知管理</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="analysis">
          <template #title>
            <el-icon name="el-icon-data-line" />
            <span>数据分析</span>
          </template>
          <el-menu-item index="/admin/health-analysis">
            <el-icon name="el-icon-s-data" />
            <span>健康分析</span>
          </el-menu-item>
          <el-menu-item index="/admin/system-analysis">
            <el-icon name="el-icon-data-analysis" />
            <span>系统分析</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system">
          <template #title>
            <el-icon name="el-icon-setting" />
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/system-setting">
            <el-icon name="el-icon-setting" />
            <span>系统参数</span>
          </el-menu-item>
          <el-menu-item index="/admin/log-manage">
            <el-icon name="el-icon-view" />
            <span>日志管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部工具栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-button link @click="toggleSidebar">
            <el-icon name="el-icon-menu" />
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar || ''">{{ userInfo.nickname?.[0] || '管' }}</el-avatar>
              <span class="username">{{ userInfo.nickname || '管理员' }}</span>
              <el-icon class="el-icon--right" name="el-icon-arrow-down" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">
                  <el-icon name="el-icon-user" />
                  <span>个人信息</span>
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  <el-icon name="el-icon-switch-button" />
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="admin-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 侧边栏展开状态
const sidebarOpened = ref(true)

// 计算属性：用户信息
const userInfo = computed(() => userStore.userInfo)

// 计算属性：当前激活的菜单
const activeMenu = computed(() => {
  const path = route.path
  if (path === '/admin') return 'dashboard'
  if (path.includes('/user-manage') || path.includes('/role-manage')) return 'user'
  if (path.includes('/oldman-manage') || path.includes('/health-data')) return 'oldman'
  if (path.includes('/drug-manage')) return 'drug'
  if (path.includes('/warning-manage') || path.includes('/notification')) return 'warning'
  if (path.includes('/health-analysis') || path.includes('/system-analysis')) return 'analysis'
  if (path.includes('/system-setting') || path.includes('/log-manage')) return 'system'
  return 'dashboard'
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpened.value = !sidebarOpened.value
}

// 菜单选择
const handleMenuSelect = (key: any, keyPath: any) => {

}

// 个人信息
const handleProfile = () => {
  router.push('/user/profile')
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  background-color: #ffffff;
  color: #303133;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #e4e7ed;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
  background-color: #409eff;
}

.logo h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.el-menu-vertical-demo {
  border-right: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.el-menu {
  background-color: #ffffff;
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 0 10px;
  border-radius: 8px;
  color: #606266;
}

.el-menu-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 600;
  border-left: 3px solid #409eff;
}

.el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  color: #606266;
}

.el-sub-menu__title:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.el-sub-menu__title.is-active {
  color: #409eff;
  font-weight: 600;
}

.admin-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.admin-content {
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>