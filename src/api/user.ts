import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'

// 用户登录
export function loginApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/users/login',
    method: 'post',
    data
  })
}

// 获取邮箱验证码，找回密码，修改密码
export function sendEmailCodeApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/codes/email',
    method: 'post',
    data
  })
}

// 用户注册
export function registerApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/users',
    method: 'post',
    data
  })
}

//修改用户密码，登录状态下
export function updatePasswordApi(
  userId: number | string,
  data: Record<string, any>
): Promise<ResponseData> {
  return request({
    url: `/v1/users/${userId}/password`,
    method: 'post',
    data
  })
}

//找回密码，密码重置
export function resetPasswordApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/password-reset',
    method: 'post',
    data
  })
}

//文字提问
export function voiceChatApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/voice/chat/text',
    method: 'post',
    data
  })
}

// 修改个人信息（需要登录后才能实现）
export function updateProfileApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/users/info',
    method: 'post',
    data
  })
}

// 查询当前登录信息
export function getUserInfoApi(userId: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/users/${userId}`,
    method: 'get'
  })
}

// 退出登录
export function logoutApi(data?: Record<string, any>): Promise<ResponseData> {
  return request({
    url: '/v1/users/logout',
    method: 'post',
    data
  })
}

// 注销账号
export function cancelAccountApi(): Promise<ResponseData> {
  return request({
    url: '/v1/users/canel',
    method: 'delete'
  })
}

// 密码修改（需要登录后才能实现）
export function changePasswordApi(
  userId: number | string,
  data: Record<string, any>
): Promise<ResponseData> {
  return request({
    url: `/v1/users/${userId}/password`,
    method: 'post',
    data
  })
}
