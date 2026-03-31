<template>
  <div class="warning-page">
    <!-- 顶部标题 -->
    <div class="header">
      <h2>预警通知中心</h2>
      <p class="tip">包含异常提醒与邮箱通知记录</p>
    </div>

    <!-- 预警列表 -->
    <van-cell-group inset class="list-group">
      <van-cell
        v-for="item in warningList"
        :key="item.id"
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

    <!-- 状态为空 -->
    <van-empty description="暂无预警通知" />

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
import { ref } from 'vue'

// 空数组(或放一两组数据)
const warningList = ref([
  {
    id:1,
    title:'用药超时未服用',
    content:'老人降压药已超时30分钟未服用，请及时查看',
    type:'alert',
    time:'2026-03-31 20:30'
  },
  {
     id:2,
     title:'邮箱通知已发送',
     content:'已向紧急联系人发送用药异常邮件通知',
     type:'email',
     time:'2026-03-31 20:31'
  }
])

// 弹窗状态
const showDetail = ref(false)
const currentDetail = ref(null)

// 查看详情（保留逻辑，后续接口直接用）
const goDetail = (item) => {
  currentDetail.value = item
  showDetail.value = true
}
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