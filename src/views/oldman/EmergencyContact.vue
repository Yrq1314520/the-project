<template>
  <div class="emergency-contact">
    <div class="header">
      <h2>紧急联系人</h2>
    </div>
    
    <div class="contact-content">
      <!-- 联系人列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-card
          v-for="item in contactList"
          :key="item.id"
          :title="item.name"
          :desc="`电话: ${item.phone}`"
        >
          <template #footer>
            <div class="card-footer">
              <span class="relation">{{ item.relation }}</span>
              <div class="btn-group">
                <van-button size="small" type="primary" @click="callContact(item.phone)">
                  拨打电话
                </van-button>
              </div>
            </div>
          </template>
        </van-card>
      </van-list>
      
      <!-- 提示信息 -->
      <div v-if="contactList.length === 0 && !loading" class="empty-tip">
        <van-icon name="info-o" size="48" />
        <p>暂无紧急联系人</p>
        <p class="sub-tip">请联系家属添加紧急联系人</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { getEmergencyContactsApi } from '@/api/family'

const loading = ref(false)
const finished = ref(false)
const contactList = ref([])

// 加载联系人列表
const onLoad = async () => {
  loading.value = true
  try {
    const res = await getEmergencyContactsApi()
    if (res && res.success === 200) {
      contactList.value = res.data || []
      finished.value = true
    }
  } catch (err) {
    showToast('加载联系人失败')
  } finally {
    loading.value = false
  }
}

// 拨打电话
const callContact = (phone) => {
  window.location.href = `tel:${phone}`
}

// 初始化
onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.emergency-contact {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.contact-content {
  min-height: 60vh;
}

.van-card {
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.relation {
  color: #666;
  font-size: 14px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-tip p {
  font-size: 16px;
  color: #666;
  margin: 16px 0 8px;
}

.sub-tip {
  font-size: 14px;
  color: #999;
}
</style>