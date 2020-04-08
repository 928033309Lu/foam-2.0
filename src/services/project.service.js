import httpService from '@/services/http.service'
import {
  pacFormData
} from '@/config/network.config'
const projectUrl = '/api/project-service/';
const schemetUrl = '/api/scheme-service/';
// const resulttUrl = '/api/post-process-result/';
const problemUrl = process.env.NODE_ENV==='development'?'/problem/' :'/api/problem/';
class projectHttps {
  constructor(vueThis) {
    this.vm = vueThis; //vue中的this  也可以不用en
  }
  //反馈问题
  problem({
        account,
        app,
        author,
        content,
        name,
        url,
        userInfo,
        screen,
        email,
  }) {
    return httpService.post(problemUrl + `feedback/`,{account,
      app,
      author,
      content,
      name,
      url,
      userInfo,
      email,
      screen}, true);
  }
  //获取用户项目更新时间
  getUserTime(project_id) {
    return httpService.get(projectUrl + `project/getUpdateTime`, {}, true);
  }
  putName(row){
    return httpService.post(projectUrl + `project/updateNameProject?projectId=${row.projectId}&projectName=${encodeURIComponent(row.projectName)}`, {}, true);
  }
  //获取单个项目信息
  getSinProject(project_id) {
    return httpService.get(projectUrl + `project/${project_id}/getProjectAtt`, {}, true);
  }
  //获取项目列表
  getList({
    condition,
    projectType,
    searchConditions,
    order,
    page,
    pageSize=15
  }) {
    return httpService.get(projectUrl + 'project/selectProjectListNew', {
      condition,
      projectType,
      searchConditions:encodeURIComponent(searchConditions),
      order,
      page,
      pageSize
    }, true);
  }
  //复制项目
  copyProject({
    projectId
  }) {
    return httpService.post(projectUrl + `project/copyProjectInfo`, pacFormData({
      projectId
    }), true);
  }
  //删除项目
  delProject({
    projectId
  }) {
    return httpService.put(projectUrl + `project/deleteProjectInfo?projectId=${projectId}`,{}, true);
  }
  //归档项目
  ArchivedProject({
    projectId
  }) {
    return httpService.post(projectUrl + `projectArchived/applyProjectArchived`, {
      projectId
    }, true);
  }
  //新建项目
  newProject(form) {
    return httpService.post(projectUrl + `project/saveProject`, form, true);
  }
  //获取投影系1
  getProjectionSystem() {
    return httpService.get(schemetUrl + 'epsg/projection-system', {}, true);
  }
  //获取投影系2
  getZone(projectionSystem) {
    return httpService.get(schemetUrl + 'epsg/coordinate-system', {projectionSystem}, true);
  }
  //获取投影系3
  getZoneRange(projectionSystem,coordianteSystem) {
    return httpService.get(schemetUrl + 'epsg/info', {projectionSystem,coordianteSystem}, true);
  }
  //获取方案列表
  getPlanList(
    project_id,
    pageIndex,
    pageSize=10
  ) {
    return httpService.get(schemetUrl + `scheme/${project_id}/list`, {
      pageIndex,pageSize
    }, true);
  }
  //新建方案
  newPlan({project_id,schemeName}) {
    return httpService.post(schemetUrl + `scheme/${project_id}`, pacFormData({
      schemeName
    }), true);
  }
  //复制方案
  copyPlan({
    projectId:project_id,
    id:scheme_id
  }) {
    return httpService.post(schemetUrl + `scheme/${project_id}/${scheme_id}/copy`, {}, true);
  }
  //删除方案
  delPlan({
    projectId:project_id,
    id:scheme_id
  }) {
    return httpService.deleteOut(schemetUrl + `scheme/${project_id}/${scheme_id}`, {}, true);
  }
  //获取方案结果
  getPlanResult(
    project_id,
    scheme_id,
    pageIndex,
    pageSize
  ) {
    return httpService.get(schemetUrl + `post-process-result/${project_id}/${scheme_id}`, {
      pageIndex,pageSize
    }, true);
  }
  //获取发电量小时数
  getHour(
    project_id,
    scheme_id,
  ) {
    return httpService.get(schemetUrl + `post-process-result/wakedResult/${project_id}/${scheme_id}`, {}, true);
  }
  //获取发电量图表
  getHourLine(
    project_id,
    scheme_id,
  ) {
    return httpService.get(schemetUrl + `scheme-result/schemeElecResult/${project_id}/${scheme_id}`, {}, true);
  }
  //获取风速分析图表
  getwindSpeed(
    project_id,
    scheme_id,
  ) {
    return httpService.get(schemetUrl + `scheme-result/windSpeed/${project_id}/${scheme_id}`, {}, true);
  }
  //获取风向数据
  getWindDirectionData(
    project_id,
    scheme_id,
  ) {
    return httpService.get(schemetUrl + `scheme-result/windDirection/${project_id}/${scheme_id}`, {}, true);
  }
  //获取湍流图表
  getTurLine(
    project_id,
    scheme_id,
  ) {
    return httpService.get(schemetUrl + `scheme-result/turbulence/${project_id}/${scheme_id}`, {}, true);
  }
  //获取企业机型
  getTypeList() {
    return httpService.get(schemetUrl + `power-curve/enterprise/type-list`, {}, true);
  }
  //获取企业机型和个人机型
  getAllTypeList() {
    return httpService.get(schemetUrl + `power-curve/personal/list`, {}, true);
  }
  //获取企业机型功率曲线
  getPowerList(type_id) {
    return httpService.get(schemetUrl + `power-curve/personal/${type_id}/enter-list`, {}, true);
  }
  //获取管理员企业机型功率曲线
  getEPowerList(type_id) {
    return httpService.get(schemetUrl + `power-curve/enterprise/${type_id}/list`, {}, true);
  }
  //获取企业机型单条功率曲线具体数据
  getSingPower(power_curve_id) {
    return httpService.get(schemetUrl + `power-curve/enterprise/${power_curve_id}`, {}, true);
  }

  //获取个人机型
  getPerTypeList() {
    return httpService.get(schemetUrl + `power-curve/personal/type-list`, {}, true);
  }
  //获取个人机型功率曲线
  getPerPowerList(type_id) {
    return httpService.get(schemetUrl + `power-curve/personal/${type_id}/list`, {}, true);
  }
  //获取个人机型单条功率曲线具体数据
  getPerSingPower(power_curve_id) {
    return httpService.get(schemetUrl + `power-curve/personal/${power_curve_id}`, {}, true);
  }
  //获取全部个人机型单条功率曲线具体数据
  getAllPower(arr) {
    return httpService.get(schemetUrl + `power-curve/personal/list/data?ids=${arr}`, {}, true);
  }
  //引用企业功率曲线数据
  quote(powercurve_type_id) {
    return httpService.post(schemetUrl + `power-curve/personal/${powercurve_type_id}/quote`, {}, true);
  }
  //新建机型
  newType({name,iecVersion,turbulence}) {
    return httpService.post(schemetUrl + `power-curve/personal/type`, pacFormData({name,iecVersion,turbulence}), true);
  }
  //新建企业机型
  newEnterprisType({name,iecVersion,turbulence,manufacturer='金风'}) {
    return httpService.post(schemetUrl + `power-curve/enterprise/type`, pacFormData({name,iecVersion,turbulence,manufacturer}), true);
  }
  //导入WTG文件
  uploadWtg(powercurve_type_id,file,turbulence) {
    return httpService.post(schemetUrl + `power-curve/personal/${powercurve_type_id}/analysis`,  pacFormData({file,turbulence}), true);
  }
  //企业库导入WTG文件
  uploadEnterprisWtg(powercurve_type_id,file,turbulence) {
    return httpService.post(schemetUrl + `power-curve/enterprise/${powercurve_type_id}/wtg`,  pacFormData({file,turbulence}), true);
  }
  //删除功率曲线
  delPower(ids) {
    return httpService.deleteput(schemetUrl + `power-curve/personal`,  ids, true);
  }
  //删除企业功率曲线
  delEnterprisPower(ids) {
    return httpService.deleteput(schemetUrl + `power-curve/enterprise`,  ids, true);
  }
  //删除机型
  delType(type_id) {
    return httpService.deleteput(schemetUrl + `power-curve/personal/type/${type_id}`,  {}, true);
  }
  //删除企业机型
  delEnterprisType(type_id) {
    return httpService.deleteput(schemetUrl + `power-curve/enterprise/type/${type_id}`,  {}, true);
  }
  //修改功率曲线数据
  putPower(row) {
    return httpService.put(schemetUrl + `power-curve/personal/${row.id}`,row, true);
  }
  //修改功率曲线下面的数据
  putPowerData(row,powercurve_type_id,powercurve_id) {
    return httpService.put(schemetUrl + `power-curve/personal/${powercurve_type_id}/${powercurve_id}/data`,[row], true);
  }
  //修改功启用禁用状态
  putEnable({id,isEnabled}) {
    return httpService.put(schemetUrl + `power-curve/enterprise/${id}/enable?isEnabled=${isEnabled}`,{}, true);
  }
  //获取全球坐标信息
  getAllEarth(project_id) {
    return httpService.get(schemetUrl + `/coordinate/system`, {}, true);
  }
//wrf相关接口
//获取wrf列表
    getWrfList(
        project_id,
        pageIndex,
        pageSize=10,
        phase
    ) {
        return httpService.get(schemetUrl + `wrf/${project_id}/list`, {
            pageIndex,pageSize,phase
        }, true);
    }
    //新建wrf
    newWrf(project_id,name) {
        return httpService.post(schemetUrl + `wrf/${project_id}?name=${name}`,{}
        , true);
    }
    //复制wrf
    copyWrf(wrf_id) {
        return httpService.post(schemetUrl + `wrf/${wrf_id}/copy`, {}, true);
    }
    //删除wrf
    delWrf(wrf_id) {
        return httpService.deleteOut(schemetUrl + `/wrf/${wrf_id}`, {}, true);
    }
    //终止wrf
    endWrf(wrf_id) {
        return httpService.post(schemetUrl + `wrf/${wrf_id}/stop`, {}, true);
    }
}

export {
  projectHttps
}
