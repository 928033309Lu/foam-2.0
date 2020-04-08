import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    mapMode: 'leaflet',
    routeList: [],
    wx_token: localStorage.getItem("wx_token"),
    file_token: localStorage.getItem("file_token") || 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnb2xkd2luZCIsInVzZXJJZCI6IkFLSUFQSFg1U1UyUUg3S1FCRk1BIiwidGltZVN0YW1wIjoxNTYzMzMyODg1ODYwfQ.dMmyDeo1ZOqhCaWiW4I3ySKVOcygQ2pNfmwD3TN_RKQ',
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {},
    screenWidth: document.body.clientWidth,
    curProjectId: localStorage.getItem('curProjectId') || '',
    projectCanWrite: localStorage.getItem('projectCanWrite') && Number(localStorage.getItem('projectCanWrite')) || 0,
    firstId:'',
  },
  getters:{
    getFirstId(state){
      sessionStorage.setItem("firstId", state.firstId);
      return state.firstId;
    }
  },
  mutations: {
    setMapMode(state, value) {
      state.mapMode = value
    },
    setRouteList(state, value) {
      state.routeList.push(value);
    },
    clearRouteList(state) {
      state.routeList = [];
    },
    delRouteList(state, index) {
      state.routeList.splice(index, 1)
    },
    replaceRouteList(state, obj) {
      state.routeList[obj.index] = obj.value;
    },
    setWxToken(state, token) {
      state.wx_token = token
    },
    setFileToken(state, token) {
      state.file_token = token
    },
    setUserInfo(state, obj) {
      state.userInfo = obj
    },
    setScreenWidth(state, arg) {
      state.screenWidth = arg;
    },
    setCurProjectId(state, curProjectId) {
      state.curProjectId = curProjectId;
    },
    setProjectCanWrite(state, projectCanWrite) {
      state.projectCanWrite = projectCanWrite;
    },
    setFirstId(state, value) {
      state.firstId = value;
    }
  },
  actions: {}
})
