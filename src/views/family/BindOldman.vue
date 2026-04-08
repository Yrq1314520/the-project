<template>
  <div class="bind-page page-container">
    <div class="header">
      <h2>绑定老人账号</h2>
    </div>

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
            size="small"
            type="success"
            round
            @click="onBind(item)"
          >
            绑定
          </van-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="elderList.length === 0 && searchForm.username" class="empty-state">
      <van-icon name="search" size="48" color="#ccc" />
      <p>未找到匹配的老人账号</p>
      <p class="empty-hint">请检查用户名是否正确</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import {
  searchElderByUsernameApi,
  bindElderAccountApi,
  getElderProfileByUserIdApi
} from '@/api/family'

const router = useRouter()
const searchForm = reactive({
  username: ''
})
const elderList = ref([])
const loading = ref(false)

// 搜索老人账号
const onSearch = async () => {
  if (!searchForm.username) {
    showToast('请输入老人用户名')
    return
  }

  try {
    loading.value = true
    const res = await searchElderByUsernameApi({ username: searchForm.username })
    console.log('搜索结果:', res)
    if (res.success === 200) {
      const data = res.data
      const users = Array.isArray(data) ? data : (data ? [data] : [])
      // 对每个用户查询档案信息
      const elderItems = []
      for (const user of users) {
        if (!user || !user.id) continue
        
        try {
          const profileRes = await getElderProfileByUserIdApi(user.id)
          console.log('档案信息:', profileRes)
          if (profileRes.success === 200 && profileRes.data) {
            elderItems.push({
              ...user,
              elderUserId: user.id,
              elderInfoId: profileRes.data.id
            })
          }
        } catch (err) {
          console.error('查询档案失败', err)
        }
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

// 绑定老人账号
const onBind = async (elderItem) => {
  try {
    loading.value = true
    console.log(elderItem)
    const res = await bindElderAccountApi({
      elderInfoId: elderItem.elderInfoId,
      elderUserId: elderItem.elderUserId
    })
    console.log(res)
    if (res.success === 200) {
      showToast('绑定成功')
      // 跳转到老人档案页面
      router.push('/family/oldman-profile')
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
  color: var(--text-primary);
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
  transition: transform 0.2s;
}

.elder-card:active {
  transform: scale(0.98);
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