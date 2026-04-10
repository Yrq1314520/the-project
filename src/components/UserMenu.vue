<template>
  <div class="user-menu">
    <div class="user-info" @click="showMenu = true">
      <span>{{ userInfo.nickname || userInfo.username || '用户' }}</span>
      <van-icon name="arrow-down" size="14" />
    </div>
    <van-action-sheet
      v-model:show="showMenu"
      :actions="actions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { changePasswordApi, cancelAccountApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const showMenu = ref(false)

const userInfo = computed(() => userStore.userInfo)

const actions = [
  { name: '修改密码', key: 'changePassword' },
  { name: '注销账号', key: 'cancelAccount', color: '#ee0a24' }
]

const onSelect = async (action) => {
  showMenu.value = false
  if (action.key === 'changePassword') {
    router.push('/user/change-password')
  } else if (action.key === 'cancelAccount') {
    // 二次
    try {
      await showConfirmDialog({
        title: '注销账号',
        message: '注销后所有数据将被清除，且无法恢复，确定继续吗？',
        confirmButtonColor: '#ee0a24'
      })
      const res = await cancelAccountApi()
      if (res.code === 200) {
        showToast('账号已注销')
        userStore.logout()
        router.replace('/login')
      } else {
        showToast(res.msg || res.errorMsg || '注销失败')
      }
    } catch (err) {
      if (err !== 'cancel') {
        showToast('操作失败')
      }
    }
  }
}
</script>

<style scoped>
.user-menu {
  display: inline-block;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}
.user-info:active {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>