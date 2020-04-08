import httpService from './http.service';
import axios from 'axios';

const regionDataBaseUrl = '/regiondata/'
const baseUrl = '/apis/'

function getChinaBounGeoJSON () {
    return axios.get(regionDataBaseUrl + "china.json");
}

function searchList () {
    return httpService.post(baseUrl + "api/project/main/searchList", { userId: getUserId() }, true);
}

function getUserId () {
    let userinfo = JSON.parse(sessionStorage.getItem('userinfo'));
    if (!userinfo) return;
    return userinfo.id;
}


export { getChinaBounGeoJSON, searchList }
