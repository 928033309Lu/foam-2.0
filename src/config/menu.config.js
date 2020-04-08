let menus = [
  {
    name: '项目',
    link: '/project/list',
    cls: '',
    dir:'project',
    logo: 'iconfont iconshitu',
    type: 0

  }, {
    name: '机型库',
    link: '/project/storehouse',
    cls: 'sub-line',
    dir:'house',
    logo: 'iconfont iconziliaoku',
    type: 0
  },
  // {
  //   name: '统计分析',
  //   link: '/project/direct/field',
  //   cls: 'sub-line',
  //   logo: 'iconfont icontongjifenxi',
  //   type: 0
  // },
  {
    name: '首页',
    link: '/customer/personList',
    cls: 'sub-line',
    logo: '',
    dir:'personList',
    type: 1
  },
  {
    name: '账单管理',
    link: '/customer/bill',
    cls: 'sub-line',
    logo: '',
    type: 1,
    dir:'bill',
  },
  {
    name: '机型库',
    link: '/customer/typeHouse',
    cls: 'sub-line',
    logo: '',
    type: 1
  }
];
export {
  menus
}
