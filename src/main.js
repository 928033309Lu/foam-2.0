import Vue from 'vue'
import App from './App.vue'
import router from './router/index';

import store from './store'
import moment from 'moment'
Vue.prototype.moment=moment
Vue.filter('moment', function (value, formatString) {
  formatString = formatString || 'YYYY-MM-DD HH:mm:ss';
  if(value == 0 || value == null || value == ""){
    return '-'
  }else{
    return moment(value).format(formatString);
  }
})

import filters from '@/utils/filter'

Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

//复制到粘贴板插件
import VueClipboard from 'vue-clipboard2'
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)

import $ from 'jquery'
import Highcharts from 'highcharts/highstock';
// 引入element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { Message } from 'element-ui';

Vue.use(ElementUI)

import {toast} from "./utils/toast";

import echarts from 'echarts'

Vue.prototype.$echarts = echarts

import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'swiper/dist/css/swiper.css';


Vue.use(Leaflet);
import '@/assets/js/common'
// 引入接口
import {projectHttps} from '@/services/project.service'

Vue.prototype.projectHttps = new projectHttps();
import {caculateHttps} from '@/services/caculate.service'

Vue.prototype.caculateHttps = new caculateHttps();
import {planHttps} from '@/services/plan.service'

Vue.prototype.planHttps = new planHttps();
import {https} from './services/http'

Vue.prototype.https = new https();

Vue.config.productionTip = false

window._ = require('lodash');
window._toast = toast;
window.$ = $;
window.joda = require('js-joda');
window.Highcharts = Highcharts;
window.echarts = require('echarts')

if (location.pathname == "/") {
    if (!JSON.parse(localStorage.getItem('userInfo'))) {
        location.href = '/login/common';
    }
    let isadmin = JSON.parse(localStorage.getItem('userInfo')).isadmin;
    let path = isadmin == 0 ? '/project/list' : isadmin == 1 ? '/customer/personList' : '/customer/list';
    location.href = path;
}

router.beforeEach((to, from, next) => { 
    Message.closeAll();
    let ind = store.state.routeList.findIndex((item) => to.name === item.name);
    if (ind === -1 && to.name != 'shou' && to.meta.isTag) {
        store.commit('setRouteList', to);
    } else {
        store.commit('replaceRouteList', {value:to,index:ind});
    }
    if (!to.meta.isTag) {
        store.commit('clearRouteList');
    }
    next();
})


//chunk错误的时候处理方法
router.onError((error) => {
    const pattern = /Loading chunk chunk-(\w)+ failed/g;
    const isChunkLoadFailed = error.message.match(pattern);
    const targetPath = router.history.pending.fullPath;
    if (isChunkLoadFailed) {
        router.replace(targetPath);
    }
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
