import request from '@/utils/request'

// 老人端,查询药品详情/列表
export function getOldDrugListApi(params) {
  return request({
    url: '/old/drug/list',
    method: 'get',
    params
  })
}

// 老人端,查询本人用药提醒
export function getOldRemindListApi(params) {
  return request({
    url: '/old/remind/list',
    method: 'get',
    params
  })
}