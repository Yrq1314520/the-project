<template>
  <div class="warning-page">
    <!-- 顶部标题 -->
    <div class="header">
      <h2>预警通知中心</h2>
      <p class="tip">包含异常提醒与邮箱通知记录</p>
    </div>

    <!-- 预警列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadWarningList"
      class="list-group"
    >
      <van-cell-group inset v-for="item in warningList" :key="item.id">
        <van-cell
          :title="item.title"
          :desc="item.content"
          is-link
          @click="goDetail(item)"
        >
          <template #right-icon>
            <span :class="['tag', item.type === 'email' ? 'email-tag' : 'alert-tag']">
              {{ item.type === 'email' ? '邮箱通知' : '系统预警' }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>

    <!-- 状态为空 -->
    <van-empty v-if="warningList.length === 0" description="暂无预警通知" />

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetail" position="bottom" style="height: 80%">
      <div class="detail-content">
        <h3>通知详情</h3>
        <van-cell-group v-if="currentDetail">
          <van-cell label="标题" :value="currentDetail.title" />
          <van-cell label="类型" :value="currentDetail.type === 'email' ? '邮箱通知' : '预警通知'" />
          <van-cell label="内容" :value="currentDetail.content" />
          <van-cell label="时间" :value="currentDetail.time" />
        </van-cell-group>

        <div style="padding: 20px">
          <van-button block @click="showDetail = false">关闭</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showLoading } from 'vant'
import { getWarningNotifyApi } from '@/api/family'

// 预警列表数据
const warningList = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

// 弹窗状态
const showDetail = ref(false)
const currentDetail = ref(null)

// 加载预警列表
const loadWarningList = async () => {
  try {
    loading.value = true
    const res = await getWarningNotifyApi({ page: page.value, pageSize: 10 })
    if (res.code === 200) {
      warningList.value.push(...res.data.list)
      page.value++
      if (warningList.value.length >= res.data.total) {
        finished.value = true
      }
    } else {
      showToast(res.msg || '加载失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 查看详情
const goDetail = (item) => {
  currentDetail.value = item
  showDetail.value = true
}

// 页面加载时获取预警列表
onMounted(() => {
  loadWarningList()
})
</script>

<style scoped>
.warning-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
.header {
  margin-bottom: 20px;
}
.header h2 {
  font-size: 22px;
  margin: 0 0 6px 0;
}
.tip {
  font-size: 14px;
  color: #666;
  margin: 0;
}
.list-group {
  margin-bottom: 20px;
}
.tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
}
.email-tag {
  background: #1976d2;
}
.alert-tag {
  background: #ff5252;
}
.detail-content {
  padding: 20px;
}
.detail-content h3 {
  text-align: center;
  margin-bottom: 20px;
}
</style>