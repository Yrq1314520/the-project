import { componentSizeMap, roleTypes } from 'element-plus'
import path from 'node:path'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/views/user/Login.vue') },
  {
    path: '/family',
    component: () => import('@/views/family/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medicine',
    component: () => import('@/views/family/MedicineReminder.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/waring',
    component: () => import('@/views/family/WaringNotify.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/oldman/drug',
    component: () => import('@/views/oldman/DrugList.vue'),
    meta: { requiresAuth: true, role: oldman }
  },
  {
    path: '/oldman/remind',
    component: () => import('@/views/oldman/RemindList.vue'),
    meta: { requiresAuth: true, role: oldman }
  },
  {
    path: '/family/real-warning',
    component: () => import('@views/family/RealTimeWarning.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/bind-oldman',
    component: () => import('@/views/family/BindOldman.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/oldman-profile',
    component: () => import('@/views/family/OldmanProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/emergency-contact',
    component: () => import('@/views/family/EmergencyContact.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录不能进家属页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router