import path from 'node:path'
import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  // 基础路由
  { path: '/', redirect: '/login' },
  // 登录页
  { path: '/login', component: () => import('@/views/user/index.vue') },

  // 家属页 
  {
    path: '/family',
    component: () => import('@/views/family/index.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 绑定老人账号
  {
    path: '/family/bind-oldman',
    component: () => import('@/views/family/BindOldman.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 老人档案管理
  {
    path: '/family/oldman-profile',
    component: () => import('@/views/family/OldmanProfile.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/family/drug-manage',
    component: () => import('@/views/family/DrugManage.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/family/warning',
    component: () => import('@/views/family/WarningNotify.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/family/real-warning',
    component: () => import('@/views/family/RealTimeWarning.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/family/safety-detection',
    component: () => import('@/views/family/SafetyDetection.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 紧急联系人管理
  {
    path: '/family/emergency-contact',
    component: () => import('@/views/family/EmergencyContact.vue'),
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },

  // 老人端路由
  {
    path: '/oldman/drug',
    component: () => import('@/views/oldman/DrugList.vue'),
    meta: { requiresAuth: true, role: 'oldman' }
  },
  {
    path: '/oldman/remind',
    component: () => import('@/views/oldman/RemindList.vue'),
    meta: { requiresAuth: true, role: 'oldman' }
  },

  // 新增：老人端我的档案
  {
    path: '/oldman/profile',
    component: () => import('@/views/oldman/MyProfile.vue'),
    meta: { requiresAuth: true, role: 'elder' }
  },

  // 重定向旧路由
  { path: '/medicine', redirect: '/family/drug-manage' },
  { path: '/waring', redirect: '/family/warning' }

// 注销个人账号路由
{
    path: '/user/cancel-account',
    name: 'CancelAccount',
    component: () => import('@/views/user/CancelAccount.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫,未登录不能进需要权限的页面
router.beforeEach((to, from, next) => {
  // 从本地存储获取token和用户信息
  const token = localStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo')
  let userRole = null

  // 解析用户信息，获取角色
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      userRole = userInfo.role
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }

  // 1. 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 未登录，跳转到登录页
    if (!token) {
      next('/login')
      return
    }

    // 2. 检查角色权限
    if (to.meta.role) {
      const requiredRole = to.meta.role
      // 确保角色是数字类型
      const userRoleNum = Number(userRole)

      // 角色不匹配，根据用户角色跳转到对应首页
      if (userRoleNum !== requiredRole) {
        switch (userRoleNum) {
          case 1: // 老人
            next('/oldman')
            break
          case 2: // 家属
            next('/family')
            break
          case 3: // 管理员
            next('/admin')
            break
          default: // 未知角色
            next('/login')
            break
        }
        return
      }
    }
  }

  // 权限验证通过，继续访问
  next()
})

export default router