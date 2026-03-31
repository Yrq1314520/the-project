import request from '@/utils/request'

// 用户登录
export function loginApi(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 获取邮箱验证码
export function sendEmailCodeApi(email) {
  return request({
    url: '/user/sendEmailCode',
    method: 'post',
    data: { email }
  })
}

// 用户注销
export function logoutApi() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}