<template>
  <div class="bind-page page-container">
     <van-button icon="arrow-left" type="default" @click="goBack">返回</van-button>
    <div class="header">
      <h2>绑定老人账号</h2>
    </div>

    <!-- 已绑定老人列表 -->
    <div v-if="boundElders.length > 0" class="bound-section">
      <div class="section-header">
        <h3>已绑定老人</h3>
        <span class="result-count">{{ boundElders.length }} 人</span>
      </div>
      <div class="elder-list">
        <div v-for="(name, idx) in boundElders" :key="idx" class="bound-card">
          <van-icon name="user-o" size="32" />
          <span>{{ name }}</span>
        </div>
      </div>
    </div>

    <!-- 搜索表单 -->
    <van-form @submit="onSearch" class="search-form">
      <van-cell-group inset>
        <van-field
          v-model="searchForm.username"
          label="用户名"
          placeholder="输入老人用户名搜索"
          :rules="[{ required: true, message: '请输入老人用户名' }]"
        >
          <template #left-icon>
            <van-icon name="search" />
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 20px 0;">
        <van-button type="primary" block native-type="submit" :loading="searching" size="large">
          搜索
        </van-button>
      </div>
    </van-form>

    <!-- 搜索结果 -->
    <div v-if="elderList.length > 0" class="result-list">
      <div class="section-header">
        <h3>搜索结果</h3>
        <span class="result-count">{{ elderList.length }} 个结果</span>
      </div>
      <div class="elder-list">
        <div v-for="item in elderList" :key="item.id" class="elder-card">
          <div class="elder-avatar">
            <van-icon name="user-o" size="48" />
          </div>
          <div class="elder-info">
            <div class="elder-username">{{ item.username }}</div>
            <div class="elder-phone">{{ item.phone || '暂无手机号' }}</div>
          </div>
          <van-button
            v-if="item.isBound"
            size="small"
            type="info"
            round
            disabled
          >
            绑定
          </van-button>
          <van-button
            v-else-if="item.elderInfoId"
            size="small"
            type="default"
            round
            @click="onBind(item)"
          >
            已绑定
          </van-button>
          <van-button
            v-else
            size="small"
            type="primary"
            round
            @click="goToAddProfile(item)"
          >
            添加档案并绑定
          </van-button>
        </div>
      </div>
    </div>

    <!-- 未找到老人 -->
    <div v-if="notFound && searchForm.username && !searching" class="not-found">
      <van-icon name="warning-o" size="48" color="#F4A261" />
      <p>未找到该老人账号</p>
      <p class="hint">是否直接为该老人创建档案？（无需老人账号）</p>
      <van-button type="primary" round @click="goToCreateProfile">创建档案</van-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import {
  searchElderByUsernameApi,
  getElderProfileByUserIdApi,
  bindElderAccountApi,
  getBoundEldersApi
} from '@/api/family'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const searchForm = reactive({ username: '' })
const elderList = ref([])
const searching = ref(false)
const notFound = ref(false)
const boundElders = ref([])
const goBack = () => router.back()
// 加载已绑定老人列表
const loadBoundElders = async () => {
  try {
    const res = await getBoundEldersApi()
    if (res.success === 200) {
      let names = res.data || []
      if (Array.isArray(names) && names.length > 0 && typeof names[0] === 'string') {
        boundElders.value = [...new Set(names)]
      } else if (Array.isArray(names) && names.length > 0 && typeof names[0] === 'object') {
        boundElders.value = names.map(item => item.name || item.username)
      } else {
        boundElders.value = names
      }
    }
  } catch (err) {
    console.error(err)
  }
}

// 搜索老人账号
const onSearch = async () => {
  if (!searchForm.username) {
    showToast('请输入老人用户名')
    return
  }
  notFound.value = false
  searching.value = true
  try {
    const res = await searchElderByUsernameApi({ username: searchForm.username })
    if (res.success === 200 && res.data && (Array.isArray(res.data) ? res.data.length > 0 : true)) {
      const users = Array.isArray(res.data) ? res.data : [res.data]
      const boundRes = await getBoundEldersApi()
      const boundNames = boundRes.success === 200 ? (boundRes.data || []) : []
      const boundSet = new Set(boundNames)
      const elderItems = []
      for (const user of users) {
        if (!user || !user.id) continue
        const isBound = boundSet.has(user.username)
        let elderInfoId = null
        try {
          const profileRes = await getElderProfileByUserIdApi(user.id)
          if (profileRes.success === 200 && profileRes.data && profileRes.data.length > 0) {
            elderInfoId = profileRes.data[0].id
          }
        } catch (err) {}
        elderItems.push({
          ...user,
          elderuserId: user.id,
          elderInfoId,
          isBound
        })
      }
      elderList.value = elderItems
      if (elderItems.length === 0) notFound.value = true
    } else {
      elderList.value = []
      notFound.value = true
    }
  } catch (err) {
    elderList.value = []
    notFound.value = true
  } finally {
    searching.value = false
  }
}

// 绑定已有档案的老人
const onBind = async (elderItem) => {
  try {
    const res = await bindElderAccountApi({
      elderInfoId: elderItem.elderInfoId,
      elderuserId: elderItem.elderuserId
    })
    if (res.success === 200) {
      showToast('绑定成功')
      const elderInfo = {
        name: elderItem.username,
        username: elderItem.username,
        userId: elderItem.elderuserId,
        elderInfoId: elderItem.elderInfoId
      }
      let localElders = JSON.parse(localStorage.getItem('localElders') || '[]')
      if (!localElders.some(e => e.userId === elderInfo.userId)) {
        localElders.push(elderInfo)
        localStorage.setItem('localElders', JSON.stringify(localElders))
      }
      router.push('/family')
    } else {
      showToast(res.errorMsg || '绑定失败')
    }
  } catch (err) {
    showToast('网络异常')
  }
}

// 跳转到档案页面（已有账号的老人）
const goToAddProfile = (item) => {
  router.push({
    path: '/family/oldman-profile',
    query: { userId: item.elderuserId }
  })
}

// 未找到老人时就直接创建档案（使用家属的 userId）
const goToCreateProfile = () => {
  const familyUserId = userStore.userInfo?.id
  if (!familyUserId) {
    showToast('无法获取当前用户信息，请重新登录')
    return
  }
  router.push({
    path: '/family/oldman-profile',
    query: { userId: familyUserId, isFamilyBinding: true, username: searchForm.username }
  })
}

onMounted(() => {
  loadBoundElders()
})
</script>


<style scoped>

.bound-section {
  margin-bottom: 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 16px;
}
.bound-card {
  display: inline-flex;
  align-items: center;
  background: var(--bg-color);
  border-radius: 30px;
  padding: 6px 12px;
  margin: 0 8px 8px 0;
  font-size: 14px;
}
.bind-page {
  background: var(--bg-color);
}
.header {
  margin-bottom: 30px;
}
.header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0;
}
.search-form {
  margin-bottom: 30px;
}
.search-form .van-field {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}
.search-form .van-button {
  height: 52px;
  font-size: 16px;
  border-radius: var(--border-radius-lg);
}
.result-list {
  margin-top: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}
.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.result-count {
  font-size: 14px;
  color: var(--text-secondary);
}
.elder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.elder-card {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: var(--card-shadow);
}
.elder-avatar {
  margin-right: 16px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #42c1f3 0%, #4bbefc 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.elder-info {
  flex: 1;
}
.elder-username {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}
.elder-phone {
  font-size: 14px;
  color: var(--text-secondary);
}
.not-found {
  text-align: center;
  padding: 40px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  margin-top: 30px;
}
.not-found p {
  margin: 12px 0;
  font-size: 16px;
  color: var(--text-secondary);
}
.not-found .hint {
  font-size: 14px;
  color: #F4A261;
}
</style>