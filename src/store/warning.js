import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWarningStore = defineStore('warning', () => {
  const warningList = ref([])      // 所有预警
  const unreadCount = ref(0)

  // 添加新预警
  function addWarning(warning) {
    const newWarning = {
      id: Date.now(),
      title: warning.title || '预警通知',
      content: warning.content || '',
      time: new Date().toLocaleString(),
      type: warning.type || 'alert',
      isRead: false
    }
    this.warningList.unshift(newWarning)
    this.unreadCount++
  }

  // 标记为已读
  function markAsRead(id) {
    const item = warningList.value.find(w => w.id === id)
    if (item && !item.isRead) {
      item.isRead = true
      unreadCount.value--
    }
  }

  // 清空
  function clearAll() {
    warningList.value = []
    unreadCount.value = 0
  }

  return { warningList, unreadCount, addWarning, markAsRead, clearAll }
})
