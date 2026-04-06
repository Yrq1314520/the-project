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
<<<<<<< HEAD
      <div style="padding:16px">
        <van-button type="primary" block native-type="submit">
          搜索老人
        </van-button>
=======
      <div style="padding: 16px;">
        <van-button type="primary" block native-type="submit" :loading="loading">绑定</van-button>
>>>>>>> 51676807013fff7e6e441f3ab3bed229d165f305
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
              @click="onBind(item.id)"
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
<<<<<<< HEAD
import { ref, reactive } from 'vue'
=======
import { reactive, ref } from 'vue'
>>>>>>> 51676807013fff7e6e441f3ab3bed229d165f305
import { showToast } from 'vant'
import {
  searchElderByUsernameApi,
  bindElderAccountApi
} from '@/api/family'

<<<<<<< HEAD
const searchForm = reactive({
  username: ''
=======
const router = useRouter()
const bindForm = reactive({
  account: ''
>>>>>>> 51676807013fff7e6e441f3ab3bed229d165f305
})
const elderList = ref([])

<<<<<<< HEAD
// 搜索老人
const onSearch = async () => {
  if (!searchForm.username) {
    showToast('请输入用户名')
    return
  }
  const res = await searchElderByUsernameApi(searchForm)
  if (res.code === 200) {
    elderList.value = res.data || []
  } else {
    showToast('查询失败')
  }
}

// 绑定老人
const onBind = async (elderId) => {
  const res = await bindElderAccountApi({ elderId })
  if (res.code === 200) {
    showToast('绑定成功')
  } else {
    showToast(res.msg || '绑定失败')
=======
const onBind = async () => {
  if (!bindForm || !bindForm.code) {
    showToast('请输入绑定码')
    return
  }

  try {
    loading.value = true
    const res = await bindOldmanApi({ code: bindForm.code })
    if (res.code === 200) {
      showToast('绑定成功')
      // 跳转到老人档案页面
      router.push('/family/oldman-profile')
    } else {
      showToast(res.msg || '绑定失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  } finally {
    loading.value = false
>>>>>>> 51676807013fff7e6e441f3ab3bed229d165f305
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