import request from '@/utils/request'
import { url } from 'node:inspector'
//查询绑定信息
export function queryOldManInfoApi(account) {
  return request({
    url: '/family/queryOldMan',//后端实际路径
    method: 'post',
    data: { account }
  })
}

//执行绑定操作
export function bindOldManApi(oldManId, account) {
  return request({
    url: '/family/bind',
    method: 'post',
    data: { oldManId, account }
  })
}