export default {
  path: '/customer',
  component: () => import('@/views/root.vue'),
  children: [
    {
      path: '/',
      redirect: 'list'
    },
    {
      path: 'list',
      name: 'customer-list',
      meta:{
        title:'企业管理',
        show:true
      },
      component: () => import('@/views/enterprise-list.vue')
    },
    {
      path: 'bill',
      component: () => import('@/views/manager-bill.vue'),
      meta:{
        title:'企业账单',
        show:true,
        dir:'bill',
      },
    },
    {
      path: 'personList',
      name: 'person-list',
      meta:{
        title:'用户管理',
        show:true,
        dir:'personList',
      },
      component: () => import('@/views/person-list.vue')
    },
    {
      path: 'typeHouse',
      name: 'typeHouse',
      meta:{
        title:'管理员机型库',
        show:true
      },
      component: () => import('@/views/typeHouse.vue')
    }
  ]
}
