<template>
  <div class="bind-page">
    <h2>绑定老人账号</h2>
    <van-form @submit="onBind">
      <van-cell-group inset>
        <van-field
          v-model="bindForm.account"
          label="老人账号"
          placeholder="请输入老人手机号/账号"
          type="tel"
          clearable
          :rules="[
            { required: true, message: '请输入老人账号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
          ]"
          required
        />
      </van-cell-group>
      <div style="padding: 16px;">
        <van-button type="primary" block native-type="submit" :loading="loading">绑定</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { bindOldmanApi } from '@/api/family'

const router = useRouter()
const bindForm = reactive({
  account: ''
})
const loading = ref(false)

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
  color: #323233;
  font-size: 20px;
  font-weight: 500;
}
:deep(.van-cell-group) {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}
:deep(.van-field__label) {
  color: #646566;
}
:deep(.van-field__control) {
  font-size: 14px;
}
</style>