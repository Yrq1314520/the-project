<template>
  <div class="user-center">
    <div class="sidebar">
      <div
        v-for="(item, index) in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        @click="activeKey = item.key"
      >
        <van-icon :name="item.icon" size="20" />
        <span>{{ item.title }}</span>
      </div>
    </div>
    <div class="content">
      <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
      <div v-if="activeKey === 'view'" class="panel">
        <h3>个人信息</h3>
        <div class="info-card">
          <div class="row" v-for="(item, idx) in infoRows" :key="idx">
            <label class="label">{{ item.label }}</label>
            <span class="text">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeKey === 'edit'" class="panel">
        <h3>修改个人信息</h3>
        <div class="form-card">
          <div class="form-row">
            <label class="label">昵称</label>
            <input v-model="editForm.nickname" type="text" class="input" placeholder="请输入昵称" />
          </div>
          <div class="form-row">
            <label class="label">手机号</label>
            <input v-model="editForm.phone" type="tel" class="input" placeholder="请输入手机号" />
          </div>
          <div class="form-row">
            <label class="label">邮箱</label>
            <input v-model="editForm.email" type="email" class="input" placeholder="请输入邮箱" />
          </div>
          <div class="btn-center">
            <button @click="onSubmitEdit" class="btn primary" :disabled="editLoading">
              {{ editLoading ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeKey === 'pwd'" class="panel">
        <h3>修改密码</h3>
        <div class="form-card">
          <div class="form-row">
            <label class="label">旧密码</label>
            <input v-model="pwdForm.oldPassword" type="password" class="input" placeholder="请输入旧密码" />
          </div>
          <div class="form-row">
            <label class="label">新密码</label>
            <input v-model="pwdForm.newPassword" type="password" class="input" placeholder="请输入新密码" />
          </div>
          <div class="form-row">
            <label class="label">确认新密码</label>
            <input v-model="pwdForm.confirmPassword" type="password" class="input" placeholder="请再次输入新密码" />
          </div>
          <div class="btn-center">
            <button @click="onChangePassword" class="btn primary" :disabled="pwdLoading">
              {{ pwdLoading ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeKey === 'cancel'" class="panel">
        <h3>注销账号</h3>
        <div class="tip-card">
          <van-icon name="warning-o" size="24" color="#ee0a24" />
          <p>注销后所有数据将被清除，且无法恢复，请谨慎操作。</p>
        </div>
        <div class="btn-center">
          <button @click="openCancelModal" class="btn danger-outline" :disabled="cancelLoading">
            {{ cancelLoading ? '注销中...' : '注销账号' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCancelModal" class="modal-mask" @click.self="closeCancelModal">
      <div class="modal-box">
        <div class="modal-title">确认注销账号</div>
        <div class="modal-content">
          账号注销后所有数据将被清空，无法恢复，确定要继续吗？
        </div>
        <div class="modal-footer">
          <button class="footer-btn cancel" @click="closeCancelModal">取消</button>
          <button class="footer-btn confirm" @click="confirmCancelAccount" :disabled="cancelLoading">
            {{ cancelLoading ? '注销中...' : '确认注销' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import {
  getUserInfoApi,
  updateProfileApi,
  changePasswordApi,
  cancelAccountApi
} from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const goBack = () => router.back()

// 导航菜单
const navItems = [
  { key: 'view', title: '查看个人信息', icon: 'user-o' },
  { key: 'edit', title: '修改个人信息', icon: 'edit' },
  { key: 'pwd', title: '修改密码', icon: 'lock' },
  { key: 'cancel', title: '注销账号', icon: 'delete-o' }
]
const activeKey = ref('view')

// 用户信息
const userDetail = ref<Record<string, any> | null>(null)
const fetchUserInfo = async () => {
  const userId = userStore.userInfo?.id
  if (!userId) return
  try {
    const res = await getUserInfoApi(userId)
    if (res.code === 200 && res.data) {
      userDetail.value = res.data
      userStore.userInfo = { ...userStore.userInfo, ...res.data }
    }
  } catch (err) {
    showToast('网络异常')
  }
}

// 个人信息展示
const infoRows = computed(() => {
  const roleMap = {
    1: '老人',
    2: '家属',
  }

  const roleNum = userDetail.value?.role
  const roleText = (roleMap as any)[roleNum] || '普通用户'

  return [
    { label: '用户ID：', value: userDetail.value?.id || '-' },
    { label: '用户名：', value: userDetail.value?.username || '-' },
    { label: '昵称：', value: userDetail.value?.nickname || '未设置' },
    { label: '角色：', value: roleText },
  ]
})

// 修改信息
const editForm = ref({ nickname: '', phone: '', email: '' })
const editLoading = ref(false)
const onSubmitEdit = async () => {
  editLoading.value = true
  try {
    const res = await updateProfileApi(editForm.value)
    if (res.code === 200) {
      showToast('修改成功')
      fetchUserInfo()
    } else {
      showToast(res.msg || '修改失败')
    }
  } catch (err) {
    showToast('网络异常')
  } finally {
    editLoading.value = false
  }
}

// 修改密码
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdLoading = ref(false)
const onChangePassword = async () => {
  const { oldPassword, newPassword, confirmPassword } = pwdForm.value
  if (!oldPassword || !newPassword || !confirmPassword) return showToast('请填写完整')
  if (newPassword !== confirmPassword) return showToast('两次密码不一致')
  
  pwdLoading.value = true
  try {
    const res = await (changePasswordApi as any)({ oldPassword, newPassword })
    if (res.code === 200) {
      showToast('修改成功，请重新登录')
      userStore.logout()
      router.replace('/login')
    } else {
      showToast(res.msg || '修改失败')
    }
  } catch (err) {
    showToast('网络异常')
  } finally {
    pwdLoading.value = false
  }
}

const showCancelModal = ref(false)
const cancelLoading = ref(false)

// 打开弹窗
const openCancelModal = () => {
  showCancelModal.value = true
}

// 关闭弹窗
const closeCancelModal = () => {
  showCancelModal.value = false
}

// 确认注销
const confirmCancelAccount = async () => {
  cancelLoading.value = true
  try {
    const res = await cancelAccountApi()
    if (res.code === 200) {
      showToast('账号已注销')
      userStore.logout()
      router.replace('/login')
    } else {
      showToast(res.msg || '注销失败')
    }
  } catch (err) {
    showToast('注销失败')
  } finally {
    cancelLoading.value = false
    closeCancelModal()
  }
}

// 同步编辑表单
const syncEditForm = () => {
  if (userDetail.value) {
    editForm.value = {
      nickname: userDetail.value.nickname || '',
      phone: userDetail.value.phone || '',
      email: userDetail.value.email || ''
    }
  }
}

watch(activeKey, (val) => {
  if (val === 'edit') syncEditForm()
})

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-center {
  display: flex;
  height: 100vh;
  background: #f7f8fa;
  position: relative;
}
.sidebar {
  width: 110px;
  background: #fff;
  border-right: 1px solid #ebedf0;
  padding: 20px 0;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  font-size: 13px;
  color: #646566;
  cursor: pointer;
}
.nav-item span { margin-top: 6px; }
.nav-item.active {
  color: #1989fa;
  background: #ecf5ff;
  border-right: 2px solid #1989fa;
}
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.panel h3 {
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 500;
}
.info-card, .form-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  max-width: 480px;
  margin: 0 auto;
}
.label {
  display: inline-block;
  width: 110px;
  text-align: right;
  margin-right: 16px;
  color: #666;
  flex-shrink: 0;
}
.row {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}
.text {
  color: #333;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
}
.input:focus {
  border-color: #1989fa;
}
.btn-center {
  text-align: center;
  margin-top: 10px;
}
.btn {
  padding: 10px 28px;
  border-radius: 50px;
  border: none;
  font-size: 15px;
  cursor: pointer;
}
.btn.primary {
  background: #1989fa;
  color: #fff;
}
.btn.danger {
  background: #ee0a24;
  color: #fff;
}
.btn.danger-outline {
  background: transparent;
  color: #ee0a24;
  border: 1px solid #ee0a24;
}
.btn:disabled {
  opacity: 0.6;
}
.tip-card {
  text-align: center;
  padding: 30px;
  color: #ee0a24;
}
.tip-card p {
  margin-top: 12px;
  color: #666;
}


.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  width: 280px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.modal-title {
  padding: 20px 15px 10px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: #333;
}
.modal-content {
  padding: 0 20px 20px;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  border-top: 1px solid #eee;
  height: 48px;
  line-height: 48px;
}
.footer-btn {
  flex: 1;
  font-size: 16px;
  border: none;
  background: #fff;
  cursor: pointer;
}
.footer-btn.cancel {
  color: #666;
  border-right: 1px solid #eee;
}
.footer-btn.confirm {
  color: #ee0a24;
  font-weight: 500;
}
.footer-btn:disabled {
  opacity: 0.6;
}
</style>