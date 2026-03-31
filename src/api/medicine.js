import request from '@/utils/request'

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