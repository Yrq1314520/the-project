import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWarningStore = defineStore('warning', () => {
  const warningList = ref([])
  const unreadCount = ref(0)

  function addWarning(data) {
    if (data.eventId && warningList.value.some(w => w.eventId === data.eventId)) {
      return
    }
    const newWarning = {
      id: data.eventId || Date.now(),
      title: getWarningTitle(data),
      content: data.content || '',
      time: formatTime(data.time),
      type: 'alert',
      isRead: false,
      elderId: data.elderId,
      eventId: data.eventId,
      elderName: data.elderName
    }
    warningList.value.unshift(newWarning)
    unreadCount.value++
  }

  function getWarningTitle(data) {
    const name = data.elderName || '老人'
    switch (data.type) {
      case 'emergency_qa':
        return `紧急求助：${name}`
      case 'fall_detection':
        return `跌倒预警：${name}`
      case 'heart_rate_abnormal':
        return `心率异常：${name}`
      case 'blood_pressure_abnormal':
        return `血压异常：${name}`
      case 'warning':
        return `预警通知：${name}`
      default:
        return `系统预警：${name}`
    }
  }

  function formatTime(isoString) {
    if (!isoString) return new Date().toLocaleString()
    const date = new Date(isoString)
    return date.toLocaleString()
  }

  function markAsRead(id) {
    const item = warningList.value.find(w => w.id === id)
    if (item && !item.isRead) {
      item.isRead = true
      unreadCount.value--
    }
  }

  function clearAll() {
    warningList.value = []
    unreadCount.value = 0
  }

  return {
    warningList,
    unreadCount,
    addWarning,
    markAsRead,
    clearAll
  }
})