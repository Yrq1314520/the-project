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
import { reactive } from 'vue'
import { showToast } from 'vant'

const bindForm = reactive({
  code: ''
})

const onBind = () => {
  if (!bindForm || !bindForm.code) {
    showToast('请输入绑定码')
    return
  }
  //绑定接口
  showToast('绑定成功（演示）')
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