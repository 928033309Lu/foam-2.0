import dataProcess from '@/views/dataProcess.vue'
import windParameterResults from '@/views/windParameterResults.vue'
import dataDownload from '@/views/dataProcess/dataDownload.vue'

export default {
    path: '/project',
    component: () => import('@/views/root.vue'),
    children: [
        {
            path: '/',
            redirect: 'list'
        },
        {
            path: 'list',
            name: 'list',
            meta: {
                title: '项目列表',
                show: true,
                dir:'project',
            },
            component: resolve => require(['@/views/list.vue'], resolve)
        },
        {
            path: '/bill',
            name: "bill",
            meta: {
                title: '用户账单',
                show: true,
            },
            component: resolve => require(['@/views/user-bill.vue'], resolve)
        }, {
            path: '/globalSettings',
            name: "global-settings",
            meta: {
                title: '全局设置',
                show: true,
            },
            component: resolve => require(['@/views/global-settings.vue'], resolve)
        }, {
            path: '/project/bill/:projectId',
            name: "user-bill",
            meta: {
                title: '用户账单',
                isTag: true,
            },
            component: resolve => require(['@/views/user-bill.vue'], resolve)
        }, {
            path: '/project/globalSettings/:projectId',
            name: "settings",
            meta: {
                title: '全局设置',
                isTag: true,
            },
            component: resolve => require(['@/views/global-settings.vue'], resolve)
        }, {
            path: 'calculate/:projectId',
            name: 'calculate',
            meta: {
                title: '定向计算',
                dir: 'calculate',
                isTag: true,
                keepAlive: false
            },
            component: resolve => require(['@/views/calculate.vue'], resolve)
        },
        {
            path: 'wrfTable/:projectId',
            name: 'wrfTable',
            meta: {
                title: '气象仿真',
                dir: 'wrf',
                isTag: true,
                keepAlive: false
            },
            component: resolve => require(['@/views/wrfs/wrf-table.vue'], resolve)
        },{
            path: 'srtm/:projectId',
            name: 'srtm',
            meta: {
                title: 'srtm数据',
                dir: 'srtm',
                isTag: true,
                keepAlive: false
            },
            component: resolve => require(['@/views/srtm/srtm.vue'], resolve)
        }, {
            path: 'windMaker/:projectId',
            name: 'windMaker',
            component: resolve => require(['@/components/windMaker/index.vue'], resolve),
            meta: {
                title: '地图处理',
                isTag: true,
                keepAlive: false,
                dir: 'windMaker'
            },
        }, {
            path: 'planList/:projectId',
            name: 'planList',
            meta: {
                title: '方案列表',
                dir: '2',
                isTag: true,
                keepAlive: false
            },
            component: resolve => require(['@/views/plan-list.vue'], resolve)
        }, {
            path: 'plan/:projectId/:id',
            name: 'plan',
            meta: {
                title: '项目方案',
                dir: '2',
                isTag: true,
                keepAlive: false
            },
            component: resolve => require(['@/views/plan.vue'], resolve)
        }, {
            path: 'planInput/:projectId/:id',
            name: 'plan-input',
            meta: {
                title: '综合方案',
                dir: '2',
                isTag: true,
                keepAlive: false,
            },
            component: resolve => require(['@/views/plan-input.vue'], resolve)
        }, {
            path: 'planResult/:projectId/:id',
            name: 'planResult',
            meta: {
                title: '综合结果',
                dir: '2',
                isTag: true,
                keepAlive: true
            },
            component: resolve => require(['@/views/plan-result.vue'], resolve)
        }, {
            path: 'storehouse',
            name: 'storehouse',
            meta: {
                title: '企业库',
                show: true,
                dir: 'house',
                keepAlive: false
            },
            component: resolve => require(['@/views/storehouse.vue'], resolve)
        },
        {
            path: 'personalhouse',
            name: 'personalHouse',
            meta: {
                title: '个人库',
                show: true,
                dir: 'house',
                keepAlive: false
            },
            component: resolve => require(['@/views/personal-house.vue'], resolve)
        },
        {
            path: 'dataProcess',
            name: 'dataProcess',
            component: dataProcess,
            children: [{
                path: 'upload/:projectId',
                name: 'upload',
                component: resolve => require(['@/views/dataProcess/upload.vue'], resolve),
                meta: {
                    title: '数据上传',
                    isTag: true,
                    dir: 'upload',
                    keepAlive: false
                }
            }, {
                path: 'dataMarking/:projectId',
                name: 'dataMarking',
                component: resolve => require(['@/views/dataProcess/dataMarking.vue'], resolve),
                meta: {
                    title: '数据标记',
                    dir: 'dataMarking',
                    isTag: true
                }
            }, {
                path: 'dataDownload/:projectId',
                name: 'dataDownload',
                component: resolve => require(['@/views/dataProcess/dataDownload.vue'], resolve),
                meta: {
                    title: '结果导出',
                    dir: 'dataDownload',
                    isTag: true
                }
            }]
        },
        {
            path: 'windParameterResults',
            name: 'windParameterResults',
            component: windParameterResults,
            children: [{
                path: 'windParameter/:projectId',
                name: 'windParameter',
                component: resolve => require(['@/views/windParameterResults/windParameter.vue'], resolve),
                meta: {
                    title: '风参展示',
                    dir: 'windParameter',
                    isTag: true
                }
            }]
        }
    ]
}
