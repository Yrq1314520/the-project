import request from '@/utils/request'

// 获取药品列表（通用）
export const getDrugListApi = (params) => {
  return request({
    url: '/v1/medicine/list',
    method: 'get',
    params
  })
}

// 老人查询自己所有的药品
export const getMyDrugListApi = (params) => {
  return request({
    url: '/v1/medicine/my-list',
    method: 'get',
    params
  })
}

// 根据老人档案ID查询药品
export const getDrugListByElderIdApi = (elderId, params) => {
  return request({
    url: `/v1/medicine/list/elder/${elderId}`,
    method: 'get',
    params
  })
}

// 获取药品详情
export const getDrugDetailApi = (id) => {
  return request({
    url: `/v1/medicine/${id}`,
    method: 'get'
  })
}

// 搜索药品
export const searchDrugApi = (keyword) => {
  return request({
    url: '/v1/medicine/search',
    method: 'get',
    params: { keyword }
  })
}

// 模糊查询药品信息
export const fuzzySearchDrugApi = (data) => {
  return request({
    url: '/v1/medicine/list',
    method: 'post',
    data
  })
}

// 家属查询所有绑定老人的药品
export const getFamilyBindElderDrugListApi = (data) => {
  return request({
    url: '/v1/medicine/list',
    method: 'post',
    data
  })
}

// 添加药品
export const addDrugApi = (data) => {
  return request({
    url: '/v1/medicine/add',
    method: 'post',
    data
  })
}

// 编辑药品
export const updateDrugApi = (id, data) => {
  return request({
    url: `/v1/medicine/update/${id}`,
    method: 'put',
    data
  })
}

// 删除药品
export const deleteDrugApi = (id) => {
  return request({
    url: `/v1/medicine/delete/${id}`,
    method: 'delete'
  })
}

// 更改药品状态
export const updateDrugStatusApi = (id, status) => {
  return request({
    url: `/v1/medicine/status/${id}`,
    method: 'patch',
    data: { status }
  })
}

