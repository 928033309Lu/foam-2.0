import httpService from './http.service'
// import envConfig from '@/config/env-config'
const setting = '/api/scheme-service/setting/'

export default {
  // 获取全局设置信息
  getStatus (scheme_id) {
    return httpService.post(setting+ `getStatus?scheme_id=`+scheme_id, {}, true)
  },
  getNoiseData (scheme_id) {
    return httpService.post(setting + `countNoise?scheme_id=`+scheme_id, {}, true)
  },
  getCreditData (scheme_id) {
    return httpService.post(setting + `performCredit?scheme_id=`+scheme_id, {}, true)
  },
}
