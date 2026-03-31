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
import { ref, reactive } from 'vue'
import { showToast } from 'vant'

const loading = ref(false)
const contactList = ref([])
const showAdd = ref(false)
const newContact = reactive({ name: '', phone: '' })

const onLoad = () => {
  loading.value = false
}

const onAdd = () => {
  if (!newContact.name || !newContact.phone) {
    showToast('请填写完整')
    return
  }
  contactList.value.push({
    id: Date.now(),
    name: newContact.name,
    phone: newContact.phone
  })
  showToast('添加成功')
  showAdd.value = false
  newContact.name = ''
  newContact.phone = ''
}

const onDelete = (id) => {
  contactList.value = contactList.value.filter(i => i.id !== id)
  showToast('已删除')
}
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