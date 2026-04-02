import request from '@/utils/request'

// 药品管理接口
// 查询用药提醒列表
export function getMedicineListApi(params) {
  return request({
    url: '/medicine/list',
    method: 'get',
    params
  })
}

// 新增用药提醒
export function addMedicineApi(data) {
  return request({
    url: '/medicine/add',
    method: 'post',
    data
  })
}

// 修改用药提醒
export function updateMedicineApi(data) {
  return request({
    url: '/medicine/update',
    method: 'put',
    data
  })
}

// 删除用药提醒
export function deleteMedicineApi(id) {
  return request({
    url: `/medicine/delete/${id}`,
    method: 'delete'
  })
}

// 添加药品信息
export function addDrugApi(data) {
  return request({
    url: '/drug/add',
    method: 'post',
    data
  })
}

// 查询药品信息列表
export function getDrugListApi(params) {
  return request({
    url: '/drug/list',
    method: 'get',
    params
  })
}

// 删除药品信息
export function deleteDrugApi(id) {
  return request({
    url: `/drug/delete/${id}`,
    method: 'delete'
  })
}

// 修改药品信息
export function updateDrugApi(data) {
  // 打印data
  console.log(data)
  return request({
    url: '/drug/update',
    method: 'put',
    data
  })
}