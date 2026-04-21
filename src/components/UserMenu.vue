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

    <!-- 查看个人信息弹窗 -->
    <van-popup v-model:show="showInfoPopup" round position="bottom" :style="{ height: '60%' }">
      <div class="info-popup">
        <h3>个人信息</h3>
        <div v-if="userDetail" class="info-list">
          <div class="info-item"><span class="label">用户ID：</span><span>{{ userDetail.id }}</span></div>
          <div class="info-item"><span class="label">用户名：</span><span>{{ userDetail.username }}</span></div>
          <div class="info-item"><span class="label">昵称：</span><span>{{ userDetail.nickname || '未设置' }}</span></div>
          <div class="info-item"><span class="label">手机号：</span><span>{{ userDetail.phone || '未绑定' }}</span></div>
          <div class="info-item"><span class="label">邮箱：</span><span>{{ userDetail.email || '未绑定' }}</span></div>
          <div class="info-item"><span class="label">角色：</span><span>{{ userDetail.role || '用户' }}</span></div>
        </div>
        <div v-else class="loading-tip">加载中...</div>
        <van-button block round @click="showInfoPopup = false">关闭</van-button>
      </div>
    </van-popup>

    <!-- 修改个人信息弹窗 -->
    <van-popup v-model:show="showEditPopup" round position="bottom" :style="{ height: '70%' }">
      <div class="edit-popup">
        <h3>修改个人信息</h3>
        <van-form @submit="onSubmitEdit">
          <van-field
            v-model="editForm.nickname"
            label="昵称"
            placeholder="请输入昵称"
          />
          <van-field
            v-model="editForm.phone"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
          />
          <van-field
            v-model="editForm.email"
            label="邮箱"
            placeholder="请输入邮箱"
            type="email"
          />
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit" :loading="editLoading">
              保存修改
            </van-button>
            <van-button round block plain style="margin-top: 12px;" @click="showEditPopup = false">
              取消
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { changePasswordApi, cancelAccountApi, getUserInfoApi, updateProfileApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const showMenu = ref(false)

const userInfo = computed(() => userStore.userInfo)

// 查看个人信息
const showInfoPopup = ref(false)
const userDetail = ref(null)

// 修改个人信息
const showEditPopup = ref(false)
const editLoading = ref(false)
const editForm = ref({
  nickname: '',
  phone: '',
  email: ''
})

const actions = [
  { name: '查看个人信息', key: 'viewInfo' },
  { name: '修改个人信息', key: 'editInfo' },
  { name: '修改密码', key: 'changePassword' },
  { name: '注销账号', key: 'cancelAccount', color: '#ee0a24' }
]

// 获取最新用户信息
const fetchUserInfo = async () => {
  const userId = userStore.userInfo?.id
  if (!userId) return
  try {
    const res = await getUserInfoApi(userId)
    if (res.code === 200) {
      userDetail.value = res.data
      // 可选：同步到 store
      userStore.setUserInfo(res.data)
    } else {
      showToast(res.msg || '获取信息失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常')
  }
}

const onSelect = async (action) => {
  showMenu.value = false
  switch (action.key) {
    case 'viewInfo':
      await fetchUserInfo()
      showInfoPopup.value = true
      break
    case 'editInfo':
      // 预填当前信息
      editForm.value = {
        nickname: userInfo.value?.nickname || '',
        phone: userInfo.value?.phone || '',
        email: userInfo.value?.email || ''
      }
      showEditPopup.value = true
      break
    case 'changePassword':
      router.push('/user/change-password')
      break
    case 'cancelAccount':
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
      break
  }
}

// 提交修改个人信息
const onSubmitEdit = async () => {
  editLoading.value = true
  try {
    const data = {
      nickname: editForm.value.nickname,
      phone: editForm.value.phone,
      email: editForm.value.email
    }
    const res = await updateProfileApi(data)
    if (res.code === 200) {
      showToast('修改成功')
      await fetchUserInfo() 
      showEditPopup.value = false
    } else {
      showToast(res.msg || res.errorMsg || '修改失败')
    }
  } catch (err) {
    console.error(err)
    showToast('网络异常')
  } finally {
    editLoading.value = false
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
.info-popup, .edit-popup {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.info-popup h3, .edit-popup h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
}
.info-list {
  flex: 1;
  margin-bottom: 20px;
}
.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  font-size: 16px;
}
.info-item .label {
  width: 100px;
  color: #6C7A89;
}
.loading-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>