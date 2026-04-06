import request from '@/utils/request'

// 用户登录
export function loginApi(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data: {
      phone: data.phone,
      password: data.password
    }
  })
}

// 获取邮箱验证码
export function sendEmailCodeApi(data) {
  return request({
    url: '/v1/users/sendEmailCode',
    method: 'post',
    data
  })
}

// 用户注册
export function registerApi(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

// 密码重置（需要邮箱验证码或手机短信）
export function resetPasswordApi(data) {
  return request({
    url: '/users/resetPassword',
    method: 'post',
    data: {
      ...data,
      password: data.newPassword.trim()
    }
  })
}

// 修改个人信息（需要登录后才能实现）
export function updateProfileApi(data) {
  return request({
    url: '/users/updateProfile',
    method: 'post',
    data
  })
}

// 用户注销（需要登录后才能实现）
export function logoutApi(data) {
  return request({
    url: '/users/logout',
    method: 'post',
    data
  })
}

// 密码修改（需要登录后才能实现）
export function changePasswordApi(data) {
  return request({
    url: '/users/changePassword',
    method: 'post',
    data
  })
}