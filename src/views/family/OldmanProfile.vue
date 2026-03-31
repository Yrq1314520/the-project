<template>
  <div class="profile-page">
    <h2>老人档案</h2>
    <van-cell-group inset>
      <van-field v-model="profile.name" label="姓名" readonly />
      <van-field v-model="profile.gender" label="性别" readonly />
      <van-field v-model="profile.age" label="年龄" readonly />
      <van-field v-model="profile.phone" label="联系电话" readonly />
      <van-field v-model="profile.illness" label="基础病史" readonly />
    </van-cell-group>
    <div style="padding: 16px;">
      <van-button type="primary" block @click="showEdit = true">编辑档案</van-button>
    </div>

    <van-popup v-model:show="showEdit" position="bottom" style="height: 70%;">
      <div style="padding: 20px;">
        <h3>编辑老人档案</h3>
        <van-form @submit="onSave">
          <van-cell-group>
            <van-field v-model="profile.name" label="姓名" required />
            <van-field v-model="profile.gender" label="性别" required />
            <van-field v-model="profile.age" label="年龄" required />
            <van-field v-model="profile.phone" label="联系电话" required />
            <van-field v-model="profile.illness" label="基础病史" />
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

const showEdit = ref(false)
const profile = reactive({
  name: '',
  gender: '',
  age: '',
  phone: '',
  illness: ''
})

const onSave = () => {
  //保存接口
  showToast('档案已保存')
  showEdit.value = false
}
</script>

<style scoped>
.profile-page {
  padding: 16px;
  background: #f8f9fa;
  min-height: 100vh;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>