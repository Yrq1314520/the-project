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
      <div style="padding:16px">
        <van-button type="primary" block native-type="submit">
          搜索老人
        </van-button>
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
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import {
  searchElderByUsernameApi,
  bindElderAccountApi
} from '@/api/family'

const searchForm = reactive({
  username: ''
})
const elderList = ref([])

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