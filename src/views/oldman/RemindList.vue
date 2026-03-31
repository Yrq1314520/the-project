<template>
  <div class="old-remind-page">
    <h2 class="page-title">我的用药提醒</h2>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多提醒"
      @load="loadRemindData"
    >
      <van-card
        v-for="item in remindList"
        :key="item.id"
        :title="item.drugName"
        :desc="`用药时间：${item.takeTime} | 剂量：${item.dosage}`"
      >
        <template #footer>
          <div class="card-footer">
            <span>周期：{{ item.cycle || '每日' }}</span>
            <span style="color:#666;font-size:12px">{{ item.createTime || '' }}</span>
          </div>
        </template>
      </van-card>
    </van-list>

    <van-empty v-if="!loading && remindList.length === 0" description="暂无用药提醒" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { getOldRemindListApi } from '@/api/oldMedicine'

const remindList = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const loadRemindData = async () => {
  loading.value = true
  try {
    const res = await getOldRemindListApi({
      page: page.value,
      pageSize
    })
    if (res.code === 200) {
      remindList.value.push(...res.data.list)
      page.value++
      if (remindList.value.length >= res.data.total) {
        finished.value = true
      }
    }
  } catch (err) {
    showToast("加载失败")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.old-remind-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
.page-title {
  font-size: 22px;
  text-align: center;
  margin: 10px 0 20px;
}
.van-card {
  margin-bottom: 12px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #333;
}
</style>