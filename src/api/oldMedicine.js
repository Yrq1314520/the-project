import request from './request'

// 获取老人药品列表
export const getOldDrugListApi = (params) => {
  return request({
    url: '/api/oldman/drug/list',
    method: 'get',
    params
  })
}

// 获取药品详情
export const getDrugDetailApi = (id) => {
  return request({
    url: `/api/oldman/drug/${id}`,
    method: 'get'
  })
}

// 搜索药品
export const searchDrugApi = (keyword) => {
  return request({
    url: '/api/oldman/drug/search',
    method: 'get',
    params: { keyword }
  })
}

// 添加药品信息
export const addDrugApi = (data) => {
  return request({
    url: '/api/oldman/drug',
    method: 'post',
    data
  })
}

// 修改药品信息
export const updateDrugApi = (id, data) => {
  return request({
    url: `/api/oldman/drug/${id}`,
    method: 'put',
    data
  })
}

// 删除药品信息
export const deleteDrugApi = (id) => {
  return request({
    url: `/api/oldman/drug/${id}`,
    method: 'delete'
  })
}