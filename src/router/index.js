import path from 'node:path'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  // 登录页
  { path: '/login', component: () => import('@/views/user/index.vue') },

  // 家属页 
  {
    path: '/family',
    component: () => import('@/views/family/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/drug-manage',
    component: () => import('@/views/family/DrugManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/warning',
    component: () => import('@/views/family/WarningNotify.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/real-warning',
    component: () => import('@/views/family/RealTimeWarning.vue'),
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
    path: '/elder/profile',
    component: () => import('@/views/elder/MyProfile.vue'),
    meta: { requiresAuth: true, role: 'elder' }
  },

  // 重定向旧路由
  { path: '/medicine', redirect: '/family/drug-manage' },
  { path: '/waring', redirect: '/family/warning' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫,未登录不能进需要权限的页面
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router