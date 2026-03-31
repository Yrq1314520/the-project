<template>
  <div class="old-drug-page">
    <h2 class="page-title">药品信息查询</h2>

    <!-- 搜索 -->
    <van-search
      v-model="searchKey"
      placeholder="输入药品名称搜索"
      @search="onSearch"
    />

    <!-- 列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多药品"
      @load="loadData"
    >
      <van-cell
        v-for="item in drugList"
        :key="item.id"
        :title="item.drugName"
        :desc="`规格：${item.spec || '暂无'} | 功效：${item.effect || '暂无'}`"
        is-link
      />
    </van-list>

    <van-empty v-if="!loading && drugList.length === 0" description="暂无药品信息" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { getOldDrugListApi } from '@/api/oldMedicine'

const searchKey = ref('')
const drugList = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOldDrugListApi({
      page: page.value,
      pageSize,
      drugName: searchKey.value
    })
    if (res.code === 200) {
      drugList.value.push(...res.data.list)
      page.value++
      if (drugList.value.length >= res.data.total) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast="加载失败，请稍后重试"
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  drugList.value = []
  page.value = 1
  finished.value = false
  loadData()
}
</script>

<style scoped>
.old-drug-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
.page-title {
  font-size: 22px;
  text-align: center;
  margin: 10px 0 20px;
}
</style>