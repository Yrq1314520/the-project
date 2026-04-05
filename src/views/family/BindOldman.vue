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
<<<<<<< HEAD
        <van-button 
          type="primary" 
          block 
          native-type="submit" 
          :loading="isLoading"
          loading-text="处理中..."
        >
          查询并绑定
        </van-button>
=======
        <van-button type="primary" block native-type="submit" :loading="loading">绑定</van-button>
>>>>>>> c1e0353f8c67c7d3c7689a3c501b01c46bb0126c
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
<<<<<<< HEAD
import { showToast, showConfirmDialog } from 'vant'
//引入家属端绑定API
import { queryOldManInfoApi, bindOldManApi } from '@/api/family'

//表单数据
=======
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { bindOldmanApi } from '@/api/family'

const router = useRouter()
>>>>>>> c1e0353f8c67c7d3c7689a3c501b01c46bb0126c
const bindForm = reactive({
  account: ''
})
const loading = ref(false)

<<<<<<< HEAD
//加载状态
const isLoading = ref(false)

//主绑定逻辑
const onBind = async () => {
  // 基础校验
  const account = bindForm.account?.trim()
  if (!account) {
    showToast('请输入老人账号')
    return
  }
  //手机号格式校验,可调整
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(account)) {
    showToast('请输入正确的手机号格式')
    return
  }

  //防止重复提交
  if (isLoading.value) return
  isLoading.value = true

  try {
    //调用查询老人信息接口
    const queryRes = await queryOldManInfoApi(account)
    //后端统一返回格式: { code: 200, data: { ... }, message: '' }
    if (queryRes.code !== 200) {
      throw new Error(queryRes.message || '查询老人信息失败')
    }
    const oldManInfo = queryRes.data
    if (!oldManInfo || !oldManInfo.id) {
      throw new Error('未找到该账号对应的老人信息')
    }

    //展示确认弹窗
    const message = `确认绑定以下老人账号吗？\n\n姓名：${oldManInfo.name || '未知'}\n手机号：${oldManInfo.phone || account}\n年龄：${oldManInfo.age || '暂无'}岁\n健康状况：${oldManInfo.healthStatus || '暂无'}`
    await showConfirmDialog({
      title: '确认绑定',
      message,
      confirmButtonText: '确认绑定',
      cancelButtonText: '取消',
      confirmButtonColor: '#1989fa'
    })

    //用户确认后执行绑定
    const bindRes = await bindOldManApi(oldManInfo.id, account)
    if (bindRes.code !== 200) {
      throw new Error(bindRes.message || '绑定失败')
    }

    //绑定成功处理
    showToast({
      message: '绑定成功！',
      type: 'success',
      duration: 2000
    })
    //清空表单
    bindForm.account = ''
  } catch (error) {
    //处理用户取消弹窗的情况（showConfirmDialog 取消时会 reject）
    if (error && (error.message === 'cancel' || error === 'cancel')) {
      //用户主动取消，不做任何提示
      return
    }
    //其他错误统一提示
    const errorMsg = error?.message || '操作失败，请稍后重试'
    showToast(errorMsg)
  } finally {
    isLoading.value = false
=======
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
>>>>>>> c1e0353f8c67c7d3c7689a3c501b01c46bb0126c
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