<template>
  <div class="elder-profile">
    <h2>我的档案</h2>
    
    <!-- 有档案显示 -->
    <van-cell-group inset v-if="hasProfile">
      <van-field v-model="info.name" label="姓名" readonly />
      <van-field v-model="info.age" label="年龄" readonly />
      <van-field v-model="info.gender" label="性别" readonly />
      <van-field v-model="info.phone" label="电话" readonly />
      <van-field v-model="info.illness" label="病史" type="textarea" readonly />
      <van-field v-model="info.allergy" label="过敏史" readonly />
      <van-field v-model="info.address" label="居住地址" readonly />
    </van-cell-group>
    
    <!-- 无档案提示 -->
    <div v-else class="empty-profile">
      <van-icon name="records-o" size="48" color="#999" />
      <p>暂无档案信息</p>
      <p class="sub">请点击下方按钮完善您的档案</p>
    </div>

    <div style="padding:16px;margin-top:20px">
      <van-button type="primary" block @click="goEdit">
        {{ hasProfile ? '修改档案' : '创建档案' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getElderInfoByUserId } from '@/api/elderInfo'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const info = ref({})

const hasProfile = computed(() => {
  return info.value && Object.keys(info.value).length > 0 && info.value.name
})

onMounted(async () => {
  try {
    const res = await getElderInfoByUserId(userStore.userInfo.id)
    if (res.code === 200 && res.data) {
      info.value = res.data
    } else {
      info.value = {}
    }
  } catch (err) {
    console.error('获取档案失败', err)
    info.value = {}
  }
})

const goEdit = () => {
  // 统一使用 /oldman/profile-edit 路由
  router.push('/oldman/profile-edit')
}
</script>

<style scoped>
.elder-profile {
  padding: 16px;
  background: var(--bg-color);
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
}
.empty-profile {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  margin: 20px 0;
}
.empty-profile p {
  margin: 12px 0;
  color: var(--text-secondary);
}
.empty-profile .sub {
  font-size: 14px;
}
</style>