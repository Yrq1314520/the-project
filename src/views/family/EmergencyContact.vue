<template>
  <div class="contact-page">
    <h2>紧急联系人</h2>

    <van-cell-group inset>
      <van-cell
        v-for="item in list"
        :key="item.id"
        :title="item.name"
        :sub-title="item.phone"
      >
        <template #right-icon>
          <van-button
            size="small"
            type="danger"
            @click="del(item.id)"
          >
            删除
          </van-button>
        </template>
      </van-cell>
    </van-cell-group>

    <div style="padding:16px;margin-top:20px">
      <van-button type="primary" block @click="showAdd = true">
        添加联系人
      </van-button>
    </div>

    <!-- 添加弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" :style="{ height: '40%' }">
      <div style="padding:20px">
        <van-field v-model="addForm.name" label="姓名" placeholder="请输入" />
        <van-field v-model="addForm.phone" label="电话" placeholder="请输入" />
        <div style="margin-top:20px">
          <van-button type="primary" block @click="add">确认添加</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'

const list = ref([])
const showAdd = ref(false)
const addForm = ref({ name: '', phone: '' })

onMounted(() => {
  // 这里可以添加初始化逻辑
})

const add = async () => {
  showToast('添加成功')
  showAdd.value = false
}

const del = async (id) => {
  showToast('删除成功')
}
</script>

<style scoped>
.contact-page {
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
</style>