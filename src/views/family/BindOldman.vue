<template>
  <div class="bind-page">
    <h2>绑定老人账号</h2>

    <van-form @submit="onSearch">
      <van-cell-group inset class="search-box">
        <van-field
          v-model="searchForm.username"
          label="用户名"
          placeholder="输入老人用户名搜索"
          required
        />
      </van-cell-group>
      <div style="padding: 16px;">
        <van-button type="primary" block native-type="submit" :loading="loading">绑定</van-button>
      </div>
    </van-form>

    <!-- 搜索结果 -->
    <div v-if="elderList.length > 0" class="result-list">
      <van-cell-group inset>
        <van-cell
          v-for="item in elderList"
          :key="item.id"
          :title="item.username"
          :sub-title="item.phone || '暂无手机号'"
        >
          <template #right-icon>
            <van-button
              size="small"
              type="success"
              @click="onBind(item)"
            >
              绑定
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
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
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.search-box {
  margin-bottom: 10px;
}
.result-list {
  margin-top: 20px;
}
</style>