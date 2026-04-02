import request from '@/utils/request'

// 绑定老人
export function bindOldmanApi(data) {
  return request({
    url: '/family/bind-oldman',
    method: 'post',
    data
  })
}

// 获取老人档案列表
export function getOldmanProfileListApi(params) {
  return request({
    url: '/family/oldman-profile/list',
    method: 'get',
    params
  })
}

// 获取老人档案详情
export function getOldmanProfileDetailApi(id) {
  return request({
    url: `/family/oldman-profile/${id}`,
    method: 'get'
  })
}

// 添加老人档案
export function addOldmanProfileApi(data) {
  return request({
    url: '/family/oldman-profile',
    method: 'post',
    data
  })
}

// 更新老人档案
export function updateOldmanProfileApi(id, data) {
  return request({
    url: `/family/oldman-profile/${id}`,
    method: 'put',
    data
  })
}

// 删除老人档案
export function deleteOldmanProfileApi(id) {
  return request({
    url: `/family/oldman-profile/${id}`,
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

// 添加紧急联系人
export function addEmergencyContactApi(data) {
  return request({
    url: '/family/emergency-contact',
    method: 'post',
    data
  })
}

// 删除紧急联系人
export function deleteEmergencyContactApi(id) {
  return request({
    url: `/family/emergency-contact/${id}`,
    method: 'delete'
  })
}
