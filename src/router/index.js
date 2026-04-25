import path from 'node:path'
import { createRouter, createWebHashHistory } from 'vue-router'
import UserCenter from '@/views/user/UserCenter.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/views/user/index.vue') },
  {
    path: '/user/center',
    name: 'UserCenter',
    component: UserCenter,
    meta: { requiresAuth: true }
  },
  {
    path: '/family',
    component: () => import('@/views/family/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/bind-oldman',
    component: () => import('@/views/family/BindOldman.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/oldman-profile',
    component: () => import('@/views/family/OldmanProfile.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/drug-manage',
    component: () => import('@/views/family/DrugManage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/warning',
    component: () => import('@/views/family/WarningNotify.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/safety-detection',
    component: () => import('@/views/family/SafetyDetection.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/realtime-warning',
    component: () => import('@/views/family/RealTimeWarning.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/family/emergency-contact',
    component: () => import('@/views/family/EmergencyContact.vue'),
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/oldman',
    component: () => import('@/views/oldman/index.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/drug',
    component: () => import('@/views/oldman/DrugList.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/profile',
    component: () => import('@/views/oldman/MyProfile.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/chat',
    component: () => import('@/views/oldman/Chat.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/emergency',
    component: () => import('@/views/oldman/EmergencyHelp.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/emergency-contact',
    component: () => import('@/views/oldman/EmergencyContact.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/profile-edit',
    component: () => import('@/views/oldman/ProfileEdit.vue'),
    meta: { requiresAuth: true, role: 1 }
  },
  {
    path: '/oldman/elder-medicine',
    component: () => import('@/views/oldman/ElderMedicine.vue'),
    meta: { requiresAuth: true, role: 1 }
  },


  { path: '/medicine', redirect: '/family/drug-manage' },
  { path: '/waring', redirect: '/family/warning' },

  // 家庭端健康分析路由
  {
    path: '/family/health-analysis',
    component: () => import('@/views/family/HealthAnalysis.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/family/elder-detail',
    name: 'ElderDetail',
    component: () => import('@/views/family/ElderDetail.vue'),
    meta: { requiresAuth: true }
  },
  // 家属端老人问答记录
  {
    path: '/family/questions-records',
    component: () => import('@/views/family/QuestionsRecords.vue'),
    meta: { requiresAuth: true }
  },
  //家属端药品提醒
  {
    path: '/family/medicine-reminder',
    component: () => import('@/views/family/MedicineReminder.vue'),
    meta: { requiresAuth: true }
  },
  // 用户相关路由
  {
    path: '/user/cancel-account',
    name: 'CancelAccount',
    component: () => import('@/views/user/CancelAccount.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/user/ChangePassword.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

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
      const requiredRole = Number(to.meta.role)
      const userRoleNum = Number(userRole)

      if (userRoleNum !== requiredRole) {
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
