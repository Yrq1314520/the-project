import request from '@/utils/request'
//老人，家属公用
// 添加档案
export function addElderInfo(data) {
  return request({
    url: '/elderInfo/add',
    method: 'post',
    data
  })
}

// 修改档案，老人/家属
export function updateElderInfo(data) {
  return request({
    url: '/elderInfo/update',
    method: 'post',
    data
  })
}

// 删除档案，家属端用
export function deleteElderInfo(id) {
  return request({
    url: `/elderInfo/delete/${id}`,
    method: 'post'
  })
}

// 家属绑定老人账号（家属端绑定页使用）
export function bindElderAccount(data) {
  return request({
    url: '/elderInfo/bind-account',
    method: 'post',
    data
  })
}

// 通过用户名查询用户信息
export function searchUserByUsername(data) {
  return request({
    url: '/elderInfo/search/byusername',
    method: 'post',
    data
  })
}

// 根据用户id查询档案（老人 / 家属都可用）
export function getElderInfoByUserId(userId) {
  return request({
    url: `/elderInfo/user/${userId}`,
    method: 'post'
  })
}

//  老人端专属接口 
// 设置紧急联系人（老人端）
export function setEmergencyContactForElder(data) {
  return request({
    url: '/elderInfo/update',
    method: 'post',
    data
  })
}