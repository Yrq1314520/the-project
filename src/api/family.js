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

