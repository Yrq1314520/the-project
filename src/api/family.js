import request from '@/utils/request'

// 绑定老人
export function bindOldmanApi(data) {
  return request({
    url: '/api/v1/elderInfo/bind',
    method: 'post',
    data
  })
}

// 获取老人档案列表
export function getOldmanProfileListApi(params) {
  return request({
    url: '/api/v1/elderInfo/list',
    method: 'get',
    params
  })
}

// 获取老人档案详情
export function getOldmanProfileDetailApi(id) {
  return request({
    url: `/api/v1/elderInfo/${id}`,
    method: 'get'
  })
}

// 添加老人档案
export function addOldmanProfileApi(data) {
  return request({
    url: '/api/v1/elderInfo/add',
    method: 'post',
    data
  })
}

// 更新老人档案
export function updateOldmanProfileApi(id, data) {
  return request({
    url: `/api/v1/elderInfo/update/${id}`,
    method: 'put',
    data
  })
}

// 删除老人档案
export function deleteOldmanProfileApi(id) {
  return request({
    url: `/api/v1/elderInfo/delete/${id}`,
    method: 'delete'
  })
}

// 获取预警通知列表
export function getWarningNotifyApi(params) {
  return request({
    url: '/family/warning-notify',
    method: 'get',
    params
  })
}

// 获取紧急联系人列表
export function getEmergencyContactApi() {
  return request({
    url: '/family/emergency-contact',
    method: 'get'
  })
}

// 管理紧急联系人
export function manageEmergencyContactApi(data) {
  return request({
    url: '/family/emergency-contact',
    method: 'post',
    data
  })
}

// 获取紧急联系人列表
export function getEmergencyContactsApi() {
  return request({
    url: '/family/emergency-contact/list',
    method: 'get'
  })
}

// 发送紧急求助
export function sendEmergencyHelpApi() {
  return request({
    url: '/family/emergency-help',
    method: 'post'
  })
}

// 获取求助记录
export function getHelpHistoryApi(params) {
  return request({
    url: '/family/help-history',
    method: 'get',
    params
  })
}

// 添加健康数据
export function addHealthDataApi(data) {
  return request({
    url: '/family/health-data',
    method: 'post',
    data
  })
}

// 获取健康数据列表
export function getHealthDataListApi(params) {
  return request({
    url: '/family/health-data/list',
    method: 'get',
    params
  })
}

// 更新健康数据
export function updateHealthDataApi(data) {
  return request({
    url: '/family/health-data',
    method: 'put',
    data
  })
}

// 删除健康数据
export function deleteHealthDataApi(id) {
  return request({
    url: `/family/health-data/${id}`,
    method: 'delete'
  })
}

// 获取安全状态
export function getSafetyStatusApi() {
  return request({
    url: '/family/safety-status',
    method: 'get'
  })
}

// 获取活动记录
export function getActivityRecordApi(params) {
  return request({
    url: '/family/activity-record',
    method: 'get',
    params
  })
}

// 删除紧急联系人
export function deleteEmergencyContactApi(id) {
  return request({
    url: `/family/emergency-contact/${id}`,
    method: 'delete'
  })
}
