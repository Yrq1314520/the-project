import request from '@/utils/request'
import type { ResponseData } from '@/utils/request'

// 家属查询所有绑定老人的药品
export const getDrugListApi = (params: Record<string, any>): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/list`,
    method: 'get',
    params
  })
}

// 老人查询自己所有的药品
export const getMyDrugListApi = (params: Record<string, any>): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/my-list`,
    method: 'get',
    params
  })
}

// 根据老人档案ID查询药品
export const getDrugListByElderIdApi = (
  elderId: number | string,
  params: Record<string, any>
): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/list/elder/${elderId}`,
    method: 'get',
    params
  })
}

// 获取药品详情
export const getDrugDetailApi = (id: number | string): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/${id}`,
    method: 'get'
  })
}

// 搜索药品
export const searchDrugApi = (keyword: string): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/search`,
    method: 'get',
    params: { keyword }
  })
}

// 模糊查询药品信息
export const fuzzySearchDrugApi = (data: Record<string, any>): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/list`,
    method: 'post',
    data
  })
}

// 家属查询所有绑定老人的药品
export const getFamilyBindElderDrugListApi = (data: Record<string, any>): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/list`,
    method: 'post',
    data
  })
}

// 添加药品
export const addDrugApi = (data: Record<string, any>): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/add`,
    method: 'post',
    data
  })
}

// 编辑药品
export const updateDrugApi = (
  id: number | string,
  data: Record<string, any>
): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/update`,
    method: 'post',
    data: {
      id,
      medicineName: data.medicineName,
      quantity: data.quantity
    }
  })
}

// 删除药品
export const deleteDrugApi = (id: number | string): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/delete/${id}`,
    method: 'delete'
  })
}

// 更改药品状态
export const updateDrugStatusApi = (
  id: number | string,
  status: number | string
): Promise<ResponseData> => {
  return request({
    url: `/v1/medicine/status/${id}`,
    method: 'patch',
    data: { status }
  })
}

// 查看该用户的所有药品提醒（老人/家属都可以）
export function getAllRemindsApi(): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/my-list`,
    method: 'get'
  })
}

//添加药品提醒
export function addMedicineRemindsApi(data: Record<string, any>): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind`,
    method: 'post',
    data
  })
}

//修改药品提醒
export function updataMedicineRemindsApi(
  id: number | string,
  data: Record<string, any>
): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/${id}`,
    method: 'put',
    data
  })
}

//删除药品提醒
export function deleteMedicineRemindsApi(id: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/${id}`,
    method: 'delete'
  })
}

//根据老人ID查询提醒
export function searchMedicineRemindsApi(elderId: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/elder/${elderId}`,
    method: 'get'
  })
}

//查询老人服药记录
export function getMedicineRecordsApi(elderId: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/elders/${elderId}/records`,
    method: 'get'
  })
}

//老人按钮确认已服药
export function confirmMedicineApi(): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/records/take`,
    method: 'get'
  })
}

//服药记录操作（确认/漏服）
export function takingMedicineApi(
  params: Record<string, any>,
  data: Record<string, any>
): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/records/action`,
    method: 'post',
    params,
    data
  })
}

//查询老人服药统计
export function getTakingMedicineApi(elderId: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/elders/${elderId}/statistics`,
    method: 'get'
  })
}

//查询待服药记录
export function getPendingMedicineApi(elderId: number | string): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/elder/${elderId}/pending`,
    method: 'get'
  })
}

//创建服药记录
export function setMedicineRecordsApi(): Promise<ResponseData> {
  return request({
    url: `/v1/medicine-remind/trigger`,
    method: 'post'
  })
}
