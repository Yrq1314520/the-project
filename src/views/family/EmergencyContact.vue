<template>
  <div class="contact-page">
    <h2>紧急联系人设置</h2>
    <van-list v-model:loading="loading" finished-text="已全部加载" @load="onLoad">
      <van-cell v-for="item in contactList" :key="item.id" :title="item.name" :desc="item.phone">
        <template #right-icon>
          <van-button size="small" type="danger" @click="onDelete(item.id)">删除</van-button>
        </template>
      </van-cell>
    </van-list>
    <div style="padding: 16px;">
      <van-button type="primary" block @click="showAdd = true">添加联系人</van-button>
    </div>

    <van-popup v-model:show="showAdd" position="bottom" style="height: 50%;">
      <div style="padding: 20px;">
        <h3>添加紧急联系人</h3>
        <van-form @submit="onAdd">
          <van-cell-group>
            <van-field v-model="newContact.name" label="姓名" required />
            <van-field v-model="newContact.phone" label="电话" required />
          </van-cell-group>
          <div style="margin-top: 20px;">
            <van-button type="primary" block native-type="submit">保存</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getEmergencyContactApi, addEmergencyContactApi, deleteEmergencyContactApi } from '@/api/family'

const loading = ref(false)
const contactList = ref([])
const showAdd = ref(false)
const newContact = reactive({ name: '', phone: '' })

// 加载联系人列表
const loadContactList = async () => {
  try {
    loading.value = true
    const res = await getEmergencyContactApi()
    if (res.code === 200) {
      contactList.value = res.data
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

// 加载更多（保持与 van-list 兼容）
const onLoad = () => {
  loading.value = false
}

// 添加联系人
const onAdd = async () => {
  if (!newContact.name || !newContact.phone) {
    showToast('请填写完整')
    return
  }

  try {
    loading.value = true
    const res = await addEmergencyContactApi(newContact)
    if (res.code === 200) {
      contactList.value.push(res.data)
      showToast('添加成功')
      showAdd.value = false
      newContact.name = ''
      newContact.phone = ''
    } else {
      showToast(res.msg || '添加失败')
    }
  } catch (err) {
    showToast('网络异常，请重试')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 删除联系人
const onDelete = async (id) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个联系人吗？'
    })

    loading.value = true
    showLoading('删除中...')
    const res = await deleteEmergencyContactApi(id)
    if (res.code === 200) {
      contactList.value = contactList.value.filter(i => i.id !== id)
      showToast('已删除')
    } else {
      showToast(res.msg || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      showToast('网络异常，请重试')
      console.error(err)
    }
  } finally {
    loading.value = false
  }
}

// 页面加载时获取联系人列表
onMounted(() => {
  loadContactList()
})
</script>

<style scoped>
.contact-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>