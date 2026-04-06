import request from '@/utils/request'

// 添加老人档案
export function addOldmanProfileApi(data) {
  return request({
    url: '/elderInfo/add',
    method: 'post',
    data
  })
}

// 修改老人档案
export function updateOldmanProfileApi(data) {
  return request({
    url: '/elderInfo/update',
    method: 'post',
    data
  })
}

// 删除老人档案
export function deleteOldmanProfileApi(id) {
  return request({
    url: `/elderInfo/delete/${id}`,
    method: 'post'
  })
}

// 绑定老人账号
// 通过 username 模糊查询老人信息
export function searchElderByUsernameApi(data) {
  return request({
<<<<<<< HEAD
    url: '/elderInfo/search/byusername',
=======
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
>>>>>>> 51676807013fff7e6e441f3ab3bed229d165f305
    method: 'post',
    data
  })
}

<<<<<<< HEAD
// 家属绑定查询到的老人账号
export function bindElderAccountApi(data) {
=======
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
>>>>>>> 51676807013fff7e6e441f3ab3bed229d165f305
  return request({
    url: '/elderInfo/bind-account',
    method: 'post',
    data
  })
}

// 设置紧急联系人
// 获取紧急联系人列表
export function setEmergencyContactForElder(data) {
  return request({
    url: '/elderInfo/update',
    method: 'post',
    data
  })
}