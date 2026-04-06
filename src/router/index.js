import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  // 基础路由
  { path: '/', redirect: '/login' },
  // 登录页 - 包含登录、注册、忘记密码功能
  { 
    path: '/login', 
    component: () => import('@/views/user/index.vue'),
    meta: { requiresAuth: false } // 无需登录即可访问
  },


  // ======================================
  // 用户中心
  // ======================================
  // 个人信息修改
  {
    path: '/user/profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 密码修改
  {
    path: '/user/change-password',
    component: () => import('@/views/user/ChangePassword.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },


  // ======================================
  // 家属端
  // ======================================
  // 家属端首页
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
  // 药品管理
  {
    path: '/family/drug-manage',
    component: () => import('@/views/family/DrugManage.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },

  // 预警通知
  {
    path: '/family/warning',
    component: () => import('@/views/family/WarningNotify.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 实时预警
  {
    path: '/family/real-warning',
    component: () => import('@/views/family/RealTimeWarning.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 健康数据管理
  {
    path: '/family/health-data',
    component: () => import('@/views/family/HealthData.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 健康数据分析
  {
    path: '/family/health-analysis',
    component: () => import('@/views/family/HealthAnalysis.vue'),
    meta: { 
      requiresAuth: true // 需要登录才能访问
    }
  },
  // 安全检测
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


  // ======================================
  // 老人端
  // ======================================
  // 老人端首页
  {
    path: '/oldman',
    component: () => import('@/views/oldman/index.vue'),
    meta: { 
      requiresAuth: true, // 需要登录才能访问
      role: 1 // 仅限老人角色访问 (1:老人)
    }
  },
  // 药品列表
  {
    path: '/oldman/drug',
    component: () => import('@/views/oldman/DrugList.vue'),
    meta: { 
      requiresAuth: true, // 需要登录才能访问
      role: 1 // 仅限老人角色访问
    }
  },

  // 紧急求助
  {
    path: '/oldman/emergency',
    component: () => import('@/views/oldman/EmergencyHelp.vue'),
    meta: { 
      requiresAuth: true, // 需要登录才能访问
      role: 1 // 仅限老人角色访问
    }
  },
  // 紧急联系人
  {
    path: '/oldman/emergency-contact',
    component: () => import('@/views/oldman/EmergencyContact.vue'),
    meta: { 
      requiresAuth: true, // 需要登录才能访问
      role: 1 // 仅限老人角色访问
    }
  },


  // ======================================
  // 管理端
  // ======================================
  // 管理端布局
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { 
      requiresAuth: true, // 需要登录才能访问
      role: 3 // 仅限管理员角色访问 (3:管理员)
    },
    children: [
      // 管理端首页
      {
        path: '',
        component: () => import('@/views/admin/index.vue')
      },
      // 用户管理
      {
        path: 'user-manage',
        component: () => import('@/views/admin/UserManage.vue')
      },
      {
        path: 'role-manage',
        component: () => import('@/views/admin/RoleManage.vue')
      },
      // 老人管理
      {
        path: 'oldman-manage',
        component: () => import('@/views/admin/OldmanManage.vue')
      },
      {
        path: 'health-data',
        component: () => import('@/views/admin/HealthData.vue')
      },
      // 药品管理
      {
        path: 'drug-manage',
        component: () => import('@/views/admin/DrugManage.vue')
      },

      // 预警管理
      {
        path: 'warning-manage',
        component: () => import('@/views/admin/WarningManage.vue')
      },
      {
        path: 'notification',
        component: () => import('@/views/admin/Notification.vue')
      },
      // 数据分析
      {
        path: 'health-analysis',
        component: () => import('@/views/admin/HealthAnalysis.vue')
      },
      {
        path: 'system-analysis',
        component: () => import('@/views/admin/SystemAnalysis.vue')
      },
      // 系统设置
      {
        path: 'system-setting',
        component: () => import('@/views/admin/SystemSetting.vue')
      },
      {
        path: 'log-manage',
        component: () => import('@/views/admin/LogManage.vue')
      }
    ]
  },


  // ======================================
  // 重定向路由
  // ======================================
  // 旧路由重定向到新路由
  { path: '/medicine', redirect: '/family/drug-manage' }, // 药品管理旧路由
  { path: '/waring', redirect: '/family/warning' } // 预警通知旧路由
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：控制页面访问权限
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