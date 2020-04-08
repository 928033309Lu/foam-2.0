import axios from 'axios';
import {
    jsonToParams
} from '../config/network.config'
import {
    Message
} from 'element-ui';

const defaultToken = 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnb2xkd2luZCIsImlkIjoiMSIsInVzZXJuYW1lIjoiYWRtaW4iLCJyZWFsTmFtZSI6Iuezu-e7n-euoeeQhuWRmCIsImVudGVycHJpc2VJZCI6MCwidGVsZXBob25lIjoiMTIzIiwiZW1haWwiOiJhZG1pbkBnb2xkd2luZC5jb20uY24iLCJ0aW1lU3RhbXAiOjE1NjQxMTAyODMzNzQsImlzQWRtaW4iOjJ9.rRe46YZdHkXI-sH_FU1fxswo3DP6lp6ENGaQ9FXNzi0';

function get(url, data, auth = false, options = {}) {
    let token = localStorage.getItem('token') || '';
    let config = {};
    url = url + jsonToParams(data);
    if (auth) {
        config = Object.assign({}, options);
        config.headers = (config.headers) ? config.headers : {};
        config.headers['token'] = token;
    }
    return axios.get(url, config)
        .then((res) => responseHandler(res))
        .catch((err) => responseError(err));
}

function post(url, data, auth = false, options = {}) {
    let token = localStorage.getItem('token');
    let config = options;
    if (auth) {
        if (!config.headers) {
            config.headers = {}
        }
        config.headers.token = token
        // config = Object.assign(options, {
        //   headers: {'token': token}
        // });
    } else {
        config = options;
    }

    return axios.post(url, data, config)
        .then((res) => responseHandler(res))
        .catch((err) => responseError(err));
}

function deleteOut(url, data, auth = false, options = {}) {
    url = url + jsonToParams(data);
    let token = localStorage.getItem('token');
    let config = {};
    if (auth) {
        config = Object.assign(options, {
            headers: {
                'token': token
            }
        });
    }
    return axios.delete(url, config)
        .then((res) => responseHandler(res))
        .catch((err) => responseError(err));
}

function deleteput(url, data, auth = false) {
    let token = localStorage.getItem('token');
    let config = {};
    if (auth) {
        config = Object.assign({
            data: data
        }, {
            headers: {
                'token': token
            }
        });
    }
    return axios.delete(url, config)
        .then((res) => responseHandler(res))
        .catch((err) => responseError(err));
}

function put(url, data, auth = false, options = {}) {
    let token = localStorage.getItem('token');
    let config = {};
    if (auth) {
        config = Object.assign(options, {
            headers: {
                'token': token
            }
        });
    }
    return axios.put(url, data, config)
        .then((res) => responseHandler(res))
        .catch((err) => responseError(err));
}

function responseHandler(res) {
    // debugger
    if (res.data.code === 401) {
        let userInfo = localStorage.getItem('userInfo');
        let isadmin = userInfo ? JSON.parse(userInfo).isadmin : 0;
        let type = isadmin == 0 ? 'common' : (isadmin == 1 ? 'enterAdminLogin' : 'sysAdminLogin');
        localStorage.clear();
        location.href = `/login/${type}`;
        return;
    }
    if (res.status === 200) {

        if (res.data.status == '-1') {
            Message.error({
                message: res.data.message,
                showClose: true,
                duration: 0,
                center: true
            });
            return Promise.reject(res.data);
        }
        if (!res.data.code) {
            return Promise.resolve(res.data);
        } else if (res.data.code === 200) {
            return Promise.resolve(res.data.data);
        } else if (res.data.code == 400 || res.data.code == 1) {
            if(res.config.url.indexOf('/goldlab/exporters/sendToFoam/tim')==-1){
                Message({
                    message: res.data.msg,
                    showClose: true,
                    duration: 0,
                    center: true
                });
            }
            return Promise.reject(res.data);
        } else {
            Message({
                message: res.data.msg,
                showClose: true,
                duration: 0,
                center: true
            });
            return Promise.reject(res.data);
        }
    } else {
        Message({
            showClose: true,
            duration: 0,
            message: res.data.msg,
            center: true
        });
        return Promise.reject(res.data);
    }

}

function responseError(err) {
    // debugger
    if (err.response && err.response.status === 401) {
        if (!_.includes(location.pathname, '/login')) {
            let userInfo = localStorage.getItem('userInfo');
            let isadmin = userInfo ? JSON.parse(userInfo).isadmin : 0;
            let type = isadmin == 0 ? 'common' : (isadmin == 1 ? 'enterAdminLogin' : 'sysAdminLogin');
            localStorage.clear();
            location.href = `/login/${type}`;
        }
    }
    if (err.response && err.response.status === 500 && err.response.data.msg) {
        Message.error({
            showClose: true,
            duration: 0,
            message: err.response.data.msg,
            center: true
        });
    }
    if (location.href.indexOf('project/windMaker')>-1 && typeof(err.response.data)=='string' && err.response.data.includes('<!DOCTYPE')) {

        Message.error({
            showClose: true,
            duration: 0,
            message: '地图模块数据处理异常',
            center: true
        });
    }
    if (err.response && err.response.status === 403) {
        Message.error({
            showClose: true,
            duration: 0,
            message: err.response.data.msg,
            center: true
        });
    }
    if (err.response && err.response.status > 500) {
        Message.error({
            showClose: true,
            duration: 0,
            message: '网络错误，请重试',
            center: true
        });
    }
    console.log(err)
    return Promise.reject(err);
}

export default {
    get,
    post,
    deleteOut,
    deleteput,
    put
}
