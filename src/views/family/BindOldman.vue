<template>
  <div class="bind-page">
    <h2>绑定老人账号</h2>
    <van-form @submit="onBind">
      <van-cell-group inset>
        <van-field
          v-model="bindForm.code"
          label="绑定码"
          placeholder="输入老人设备上的绑定码"
          required
        />
      </van-cell-group>
      <div style="padding: 16px;">
        <van-button type="primary" block native-type="submit">绑定</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { showToast, showLoading } from 'vant'
import { useRouter } from 'vue-router'
import { bindOldmanApi } from '@/api/family'

const router = useRouter()
const bindForm = reactive({
  code: ''
})
const loading = ref(false)

const onBind = async () => {
  if (!bindForm || !bindForm.code) {
    showToast('请输入绑定码')
    return
  }

  try {
    loading.value = true
    showLoading('绑定中...')
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
  }
}
</script>

<style scoped>
.bind-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>