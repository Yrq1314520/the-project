<template>
  <div class="elder-profile">
    <h2>我的档案</h2>
    <van-cell-group inset>
      <van-field v-model="info.name" label="姓名" readonly />
      <van-field v-model="info.age" label="年龄" readonly />
      <van-field v-model="info.gender" label="性别" readonly />
      <van-field v-model="info.phone" label="电话" readonly />
      <van-field v-model="info.illness" label="病史" type="textarea" readonly />
    </van-cell-group>

    <div style="padding:16px;margin-top:20px">
      <van-button type="primary" block @click="goEdit">
        修改档案
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getElderInfoByUserId } from '@/api/elderInfo'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const info = ref({})

onMounted(async () => {
  const res = await getElderInfoByUserId(userStore.userInfo.id)
  info.value = res.data || {}
})

const goEdit = () => {
  router.push('/elder/profile-edit')
}
</script>

<style scoped>
.elder-profile {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>