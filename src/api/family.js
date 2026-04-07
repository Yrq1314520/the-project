import request from '@/utils/request'

// 添加老人档案
export function addOldmanProfileApi(data) {
  return request({
    url: '/v1/elderInfo/add',
    method: 'post',
    data
  })
}

// 修改老人档案
export function updateOldmanProfileApi(data) {
  return request({
    url: '/v1/elderInfo/update',
    method: 'post',
    data
  })
}

// 删除老人档案
export function deleteOldmanProfileApi(id) {
  return request({
    url: `/v1/elderInfo/delete/${id}`,
    method: 'post'
  })
}

// 绑定老人账号
// 通过 username 模糊查询老人信息
export function searchElderByUsernameApi(data) {
  return request({
    url: '/v1/elderInfo/search/byusername',
    method: 'post',
    data
  })
}

// 家属绑定查询到的老人账号
export function bindElderAccountApi(data) {
  return request({
    url: '/v1/elderInfo/bind-account',
    method: 'post',
    data
  })
}

// 设置紧急联系人
// 获取紧急联系人列表
export function setEmergencyContactForElder(data) {
  return request({
    url: '/v1/elderInfo/update',
    method: 'post',
    data
  })
}

// 根据用户ID查询档案
export function getElderProfileByUserIdApi(userId) {
  return request({
    url: `/v1/elderInfo/user/${userId}`,
    method: 'post',
    data: { userId }
  })
}

// 紧急求助
export function sendEmergencyHelpApi() {
  return request({
    url: '/v1/elderInfo/update',
    method: 'post'
  })
}

// 模拟健康数据存储
let mockHealthDataList = [
  {
    id: 1,
    date: '2025-04-07',
    time: '08:30',
    bloodPressure: '118/76',
    bloodSugar: '5.2',
    heartRate: '72',
    remark: '空腹'
  },
  {
    id: 2,
    date: '2025-04-07',
    time: '18:00',
    bloodPressure: '122/80',
    bloodSugar: '6.1',
    heartRate: '78',
    remark: '餐后2小时'
  },
  {
    id: 3,
    date: '2025-04-08',
    time: '07:50',
    bloodPressure: '120/78',
    bloodSugar: '5.4',
    heartRate: '70',
    remark: ''
  }
]
let nextId = 4

// 获取健康数据列表M
export function getHealthDataListApi(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = [...mockHealthDataList]
      list.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`)
        const dateB = new Date(`${b.date} ${b.time}`)
        return dateB - dateA
      })
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const start = (page - 1) * pageSize
      const pagedList = list.slice(start, start + pageSize)
      resolve({
        code: 200,
        data: {
          list: pagedList,
          total: list.length,
          page,
          pageSize
        }
      })
    }, 300)
  })
}

// 添加健康数据M
export function addHealthDataApi(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRecord = {
        id: nextId++,
        date: data.date,
        time: data.time,
        bloodPressure: data.bloodPressure,
        bloodSugar: data.bloodSugar,
        heartRate: data.heartRate,
        remark: data.remark || ''
      }
      mockHealthDataList.push(newRecord)
      resolve({
        code: 200,
        msg: '添加成功',
        data: newRecord
      })
    }, 300)
  })
}

// 更新健康数据M
export function updateHealthDataApi(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockHealthDataList.findIndex(item => item.id === data.id)
      if (index === -1) {
        reject({ code: 404, msg: '记录不存在' })
        return
      }
      mockHealthDataList[index] = { ...mockHealthDataList[index], ...data }
      resolve({
        code: 200,
        msg: '更新成功',
        data: mockHealthDataList[index]
      })
    }, 300)
  })
}

// 删除健康数据M
export function deleteHealthDataApi(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockHealthDataList.findIndex(item => item.id === id)
      if (index === -1) {
        reject({ code: 404, msg: '记录不存在' })
        return
      }
      mockHealthDataList.splice(index, 1)
      resolve({
        code: 200,
        msg: '删除成功'
      })
    }, 300)
  })
}