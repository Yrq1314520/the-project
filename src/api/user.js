import request from '@/utils/request'

// 用户登录
export function loginApi(data) {
  return request({
    url: '/v1/users/login',
    method: 'post',
    data: {
      phone: data.phone,
      password: data.password
    }
  })
}

// 获取邮箱验证码，找回密码，修改密码
export function sendEmailCodeApi(email) {
  return request({
    url: '/v1/codes',
    method: 'post',
    data
  })
}

// 用户注册
export function registerApi(data) {
  return request({
    url: '/v1/users',
    method: 'post',
    data
  })
}

//获取验证码注册
export function getCodeApi(data) {
  return request({
    url: '/v1/codes/email',
    method: 'post',
    data: {
      email: data.email,
      type: data.type || 1
    }
  })
}

//修改用户密码，登录状态下
export function updatePasswordApi(userId, data) {
  return request({
    url: `/v1/users/${userId}/password`,
    method: 'post',
    data
  })
}

//找回密码，密码重置
export function resetPasswordApi(data) {
  return request({
    url: '/v1/password-reset',
    method: 'post',
    data
  })
}

//文字提问，语音回答
export function voiceChatApi(data) {
  return request({
    url: '/v1/voice/chat/text',
    method: 'post',
    data
  })
}

// 修改个人信息（需要登录后才能实现）
export function updateProfileApi(data) {
  return request({
    url: '/v1/users/info',
    method: 'post',
    data
  })
}

// 查询当前登录信息
export function getUserInfoApi(userId) {
  return request({
    url: `/v1/users/${userId}`,
    method: 'get'
  })
}

// 退出登录
export function logoutApi(data) {
  return request({
    url: '/v1/users/logout',
    method: 'post',
    data
  })
}

// 注销账号
export function cancelAccountApi() {
  return request({
    url: '/v1/users/canel',
    method: 'delete'
  })
}


// 密码修改（需要登录后才能实现）
export function changePasswordApi(data) {
  return request({
    url: '/v1/users/changePassword',
    method: 'post',
    data
  })
}