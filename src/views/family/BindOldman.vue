<template>
  <div class="bind-page page-container">
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
        <van-button type="primary" block native-type="submit" :loading="loading" size="large">
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
            已绑定
          </van-button>
          <van-button
            v-else-if="item.elderInfoId"
            size="small"
            type="success"
            round
            @click="onBind(item)"
          >
            绑定
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

    <!-- 空状态 -->
    <div v-if="elderList.length === 0 && searchForm.username && !loading" class="empty-state">
      <van-icon name="search" size="48" color="#ccc" />
      <p>未找到匹配的老人账号</p>
      <p class="empty-hint">请检查用户名是否正确</p>
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

const router = useRouter()
const searchForm = reactive({ username: '' })
const elderList = ref([])
const loading = ref(false)
const boundElders = ref([])  // 已绑定的老人姓名列表

// 加载已绑定老人列表
const loadBoundElders = async () => {
  try {
    const res = await getBoundEldersApi()
    if (res.success === 200) {
      let names = res.data || []
      // 如果返回的是字符串数组，直接去重
      if (Array.isArray(names) && names.length > 0 && typeof names[0] === 'string') {
        boundElders.value = [...new Set(names)]
      } 
      // 如果返回的是对象数组（例如 [{ name: '真真', userId: 6 }]），根据 userId 去重
      else if (Array.isArray(names) && names.length > 0 && typeof names[0] === 'object') {
        const uniqueMap = new Map()
        names.forEach(item => {
          if (item.userId && !uniqueMap.has(item.userId)) {
            uniqueMap.set(item.userId, item.name || item.username)
          }
        })
        boundElders.value = Array.from(uniqueMap.values())
      } else {
        boundElders.value = names
      }
    } else {
      console.warn('获取绑定列表失败', res.errorMsg)
    }
  } catch (err) {
    console.error('加载绑定列表失败', err)
  }
}

// 搜索老人账号
const onSearch = async () => {
  if (!searchForm.username) {
    showToast('请输入老人用户名')
    return
  }

  try {
    loading.value = true
    const res = await searchElderByUsernameApi({ username: searchForm.username })
    if (res.success === 200) {
      const data = res.data
      const users = Array.isArray(data) ? data : (data ? [data] : [])
      const elderItems = []
      // 将已绑定姓名转为 Set 便于快速判断
      const boundSet = new Set(boundElders.value)
      for (const user of users) {
        if (!user || !user.id) continue
        // 判断是否已绑定（通过用户名匹配）
        const isBound = boundSet.has(user.username)
        // 查询档案是否存在
        let elderInfoId = null
        try {
          const profileRes = await getElderProfileByUserIdApi(user.id)
          // 注意：返回的 data 是数组，取第一个元素的 id
          if (profileRes.success === 200 && profileRes.data && profileRes.data.length > 0) {
            elderInfoId = profileRes.data[0].id
          }
        } catch (err) {
          console.error('查询档案失败', err)
        }
        elderItems.push({
          ...user,
          elderuserId: user.id,
          elderInfoId: elderInfoId,
          isBound: isBound
        })
      }
      elderList.value = elderItems
    } else {
      showToast(res.errorMsg || '搜索失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 跳转到老人档案管理页面，携带 userId 用于新增档案后自动绑定
const goToAddProfile = (item) => {
  router.push({
    path: '/family/oldman-profile',
    query: { userId: item.elderuserId }
  })
}

// 绑定已有档案的老人
const onBind = async (elderItem) => {
  try {
    loading.value = true
    const res = await bindElderAccountApi({
      elderInfoId: elderItem.elderInfoId,
      elderuserId: elderItem.elderuserId
    })
    if (res.success === 200) {
      showToast('绑定成功')
      // 重新加载绑定列表，并清空搜索结果（可选）
      await loadBoundElders()
      elderList.value = []
      searchForm.username = ''
    } else {
      showToast(res.errorMsg || '绑定失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBoundElders()
})
</script>

<style scoped>
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
.bound-section {
  margin-bottom: 30px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: 16px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.result-count {
  font-size: 14px;
  color: var(--text-secondary);
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
.bound-card .van-icon {
  margin-right: 4px;
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
  background: linear-gradient(135deg, #5F9DB5 0%, #3B7C9E 100%);
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
  color: var(--text-primary);
  margin-bottom: 4px;
}
.elder-phone {
  font-size: 14px;
  color: var(--text-secondary);
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  margin-top: 30px;
}
.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}
.empty-hint {
  font-size: 14px !important;
  opacity: 0.8;
}
</style>