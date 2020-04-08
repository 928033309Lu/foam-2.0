import Vue from 'vue';
import Router from 'vue-router';
import projectRouter from './project';
import userRouter from './user';

const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  if(originalPush.call(this, location)){
    return originalPush.call(this, location).catch(err => err)
  }
  
}
Vue.use(Router);


const routes = [
    {
        path: '/',
        redirect: '/project/list',
    },
    {
        path: '/map',
        name: 'shou',
        component: () => import('@/views/root.vue'),
        meta: {
            title: '首页',
            show: true,
        },
    },
    {
        path: '/login/:type',
        component: () => import('@/views/login.vue')
    },
    {
        path: '/register/:step',
        component: () => import('@/views/register.vue')
    },
    {
        path: '/resetPwd/:step',
        component: () => import('@/views/resetPwd.vue')
    },
    {
        path: '/form',
        component: () => import('@/views/form.vue')
    },
    // 页面重定向 必须保留
    {
        path: 'redirect/:route*',
        name: 'redirect',
        hidden: true,
        component: {
            beforeRouteEnter(to, from, next) {
                next(vm => vm.$router.replace(JSON.parse(from.params.route)))
            },
            render: h => h()
        }
    },
    projectRouter,
    userRouter
];

export default new Router({
    routes: routes,
    mode: 'history',
    base: process.env.BASE_URL,
})
