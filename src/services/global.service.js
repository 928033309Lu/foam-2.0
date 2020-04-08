import httpService from './http.service';

const baseUrl = '/api/scheme-service'

export default {
    //获取全局数据
    getSetting() {
        return httpService.get(baseUrl + `/setting/getSetting`, {}, true);
    },
    //保存全局设置
    settingUpdate(data) {
        return httpService.post(baseUrl + `/setting/update`, data, true);
    },
}
