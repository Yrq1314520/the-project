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
    path: '/oldman',
    component: () => import('@/views/oldman/index.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/oldman/drug',
    component: () => import('@/views/oldman/DrugList.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  // 老人端我的档案
  {
    path: '/oldman/profile',
    component: () => import('@/views/oldman/MyProfile.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/oldman/chat',
    component: () => import('@/views/oldman/Chat.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/oldman/emergency',
    component: () => import('@/views/oldman/EmergencyHelp.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/oldman/emergency-contact',
    component: () => import('@/views/oldman/EmergencyContact.vue'),
    meta: { requiresAuth: true, role: '1' }
  },
  {
    path: '/oldman/profile-edit',
    component: () => import('@/views/oldman/ProfileEdit.vue'),
    meta: { requiresAuth: true, role: '1' }
  },


  // 重定向旧路由
  { path: '/medicine', redirect: '/family/drug-manage' },
  { path: '/waring', redirect: '/family/warning' },

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

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo')
  let userRole = null

  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      userRole = userInfo.role
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }

  if (to.meta.requiresAuth) {
    if (!token) {
      next('/login')
      return
    }

    if (to.meta.role) {
      const requiredRole = Number(to.meta.role)  // 关键：转为数字
      const userRoleNum = Number(userRole)

      if (userRoleNum !== requiredRole) {
        // 角色不匹配，跳转到对应角色的首页
        if (userRoleNum === 1) {
          next('/oldman')
        } else if (userRoleNum === 2) {
          next('/family')
        } else if (userRoleNum === 3) {
          next('/admin')
        } else {
          next('/login')
        }
        return
      }
    }
  }
  next()
})

export default router