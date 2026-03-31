<template>
  <div class="family-home">
    <van-cell-group>
      <van-cell title="用户注销" icon="delete" is-link @click="handleLogout" />
    </van-cell-group>
    <van-grid column-num="2" :gutter="12">
      <van-grid-item icon="user-o" text="绑定老人" to="/family/bind-oldman" />
      <van-grid-item icon="records" text="老人档案" to="/family/oldman-profile" />
      <van-grid-item icon="medal-o" text="药品管理" to="/family/drug-manage" />
      <van-grid-item icon="bell-o" text="预警通知" to="/family/warning" />
      <van-grid-item icon="warning-o" text="实时预警" to="/family/real-warning" />
      <van-grid-item icon="friends-o" text="紧急联系人" to="/family/emergency-contact" />
    </van-grid>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { logoutApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 注销功能
const handleLogout = async () => {
  // 弹出确认框，防止误点
  await showDialog({
    title: '确认注销',
    message: '确定要注销当前账号吗？此操作不可恢复。'
  })

  try {
    // 调用后端注销接口
    await logoutApi()
    // 清除本地状态
    userStore.logout()
    showToast('注销成功')
    // 跳转到登录页
    router.push('/login')
  } catch (err) {
    showToast('注销失败，请重试')
    console.error(err)
  }
}
</script>

<style scoped>
.family-home {
  padding: 20px;
}
</style>