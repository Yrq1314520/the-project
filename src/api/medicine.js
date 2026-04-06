import request from './request'

// 获取药品列表
export const getDrugListApi = (params) => {
  return request({
    url: '/api/admin/drug/list',
    method: 'get',
    params
  })
}

// 获取药品详情
export const getDrugDetailApi = (id) => {
  return request({
    url: `/api/admin/drug/${id}`,
    method: 'get'
  })
}

// 添加药品
export const addDrugApi = (data) => {
  return request({
    url: '/api/admin/drug',
    method: 'post',
    data
  })
}

// 编辑药品
export const updateDrugApi = (id, data) => {
  return request({
    url: `/api/admin/drug/${id}`,
    method: 'put',
    data
  })
}

// 删除药品
export const deleteDrugApi = (id) => {
  return request({
    url: `/api/admin/drug/${id}`,
    method: 'delete'
  })
}

// 更改药品状态
export const updateDrugStatusApi = (id, status) => {
  return request({
    url: `/api/admin/drug/${id}/status`,
    method: 'patch',
    data: { status }
  })
}