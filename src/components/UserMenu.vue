<template>
  <div class="user-menu" ref="userMenuRef">
    <div class="user-info" @click.stop="toggleDropdown">
      <span>{{ displayName }}</span>
      <van-icon name="arrow-down" size="14" />
    </div>
    <transition name="fade">
      <div v-show="showDropdown" class="dropdown-menu" ref="dropdownRef">
        <div class="dropdown-item" @click="goToPersonalCenter">个人中心</div>
        <div class="dropdown-item" @click="handleLogout">退出登录</div>
      </div>
    </transition>
    <div v-if="showConfirmModal" class="modal-overlay" @click="cancelConfirm">
      <div class="confirm-modal" @click.stop>
        <div class="modal-title">退出登录</div>
        <div class="modal-desc">确定要退出登录吗？</div>
        <div class="modal-btn-row">
          <div class="modal-btn cancel-btn" @click="cancelConfirm">取消</div>
          <div class="modal-btn confirm-btn" @click="confirmLogout">确定</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { logoutApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const showDropdown = ref(false)
const userMenuRef = ref(null)
const dropdownRef = ref(null)

// 控制自定义居中弹窗显示
const showConfirmModal = ref(false)

const userInfo = computed(() => userStore.userInfo)
const displayName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '用户')

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false
}

// 跳转到个人中心页面
const goToPersonalCenter = () => {
  closeDropdown()
  router.push('/user/center')
}

// 点击退出登录：打开居中弹窗
const handleLogout = () => {
  closeDropdown()
  showConfirmModal.value = true
}

// 取消弹窗
const cancelConfirm = () => {
  showConfirmModal.value = false
}

// 确认退出登录 真正执行接口逻辑
const confirmLogout = async () => {
  showConfirmModal.value = false
  try {
    const res = await logoutApi()
    if (res.code === 200) {
      showToast('已退出登录')
      userStore.logout()
      router.replace('/login')
    } else {
      showToast(res.msg || res.errorMsg || '退出失败')
    }
  } catch (err) {
    showToast('操作失败')
  }
}

// 当点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (!showDropdown.value) return
  const target = event.target
  const isInsideMenu = userMenuRef.value?.contains(target)
  const isInsideDropdown = dropdownRef.value?.contains(target)
  if (!isInsideMenu && !isInsideDropdown) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-menu {
  position: relative;
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
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
.user-info:active {
  background-color: rgba(0, 0, 0, 0.05);
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 130px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}
.dropdown-item {
  padding: 12px 16px;
  text-align: center;
  font-size: 15px;
  color: #323233;
  transition: background 0.2s;
  cursor: pointer;
}
.dropdown-item:active {
  background-color: #f2f3f5;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.confirm-modal {
  width: 320px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.modal-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  padding: 30px 20px 10px;
  color: #000000;
}

.modal-desc {
  font-size: 14px;
  text-align: center;
  padding: 0 20px 30px;
  color: #999999;
}

.modal-btn-row {
  display: flex;
  border-top: 1px solid #eee;
}

.modal-btn {
  flex: 1;
  padding: 16px 0;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
}

.cancel-btn {
  color: #000000;
  border-right: 1px solid #eee;
}

.confirm-btn {
  color: #1989fa;
  font-weight: 500;
}

.modal-btn:active {
  background-color: #f5f5f5;
}
</style>