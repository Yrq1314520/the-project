import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'

//老人，家属公用
// 添加档案
export function addElderInfo(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/elderInfo/add',
    method: 'post',
    data
  })
}

// 修改档案，老人/家属
export function updateElderInfo(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/elderInfo/update',
    method: 'post',
    data
  })
}

// 删除档案，家属、老人端用
export function deleteElderInfo(id: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/elderInfo/delete/${id}`,
    method: 'delete'
  })
}

// 家属绑定老人账号（家属端绑定页使用）
export function bindElderAccount(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/elderInfo/bind-account',
    method: 'post',
    data
  })
}

// 通过用户名查询用户信息
export function searchUserByUsername(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/elderInfo/search/byusername',
    method: 'post',
    data
  })
}

// 根据用户id查询档案（老人 / 家属都可用）
export function getElderInfoByUserId(userId: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/elderInfo/user/${userId}`,
    method: 'post'
  })
}

//  老人端专属接口
// 设置紧急联系人（老人端）
export function setEmergencyContactForElder(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/elderInfo/update',
    method: 'post',
    data
  })
}

// 获取老人档案列表（家属端）
export function getElderListApi(): Promise<ResponseData> {
  return request({
    url: '/v1/elderInfo/list',
    method: 'get'
  })
}
