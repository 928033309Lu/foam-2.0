import httpService from '@/services/http.service'
import fileService from './file.service';

// import { pacFormData } from '@/config/network.config'
const scheme = '/api/scheme-service/scheme/';
const cfdRun = '/api/scheme-service/cfd-run/';
const fileUrl = process.env.NODE_ENV==='development'?'/goldfile/files/' :'/api/goldfile/files/';
const mapUrl = '/api/scheme-service/map/';
const climate = '/api/scheme-service/climate-file/'
const turbulence = '/api/scheme-service/turbulence-file/'
const resultUrl = '/api/scheme-service/post-process-result/';

class planHttps {
  constructor(vueThis) {
    this.vm = vueThis; //vue中的this  也可以不用en
  }
  // GET /scheme/{project_id}/{scheme_id} 获取方案详细信息
  getScheme(projectId, scheme_id) {
    return httpService.get(scheme + projectId +'/'+scheme_id, {}, true);
  }
  // PUT /scheme/{project_id}/{scheme_id}/name 方案名称修改
  changeName(projectId, scheme_id, name) {
    return httpService.put(scheme + projectId +'/'+scheme_id + '/name?name=' + name, {}, true);
  }
  // PUT /scheme/{project_id}/{scheme_id}/base-conf 保存方案基础参数
  updateBaseConf(param) {
    return httpService.put(scheme + param.projectId +'/'+param.scheme_id + '/base-conf', param.baseConf, true);
  }
  //  GET /scheme/{project_id}/{scheme_id}/wt 获取方案全部风机点位数据
  getAllWtList(projectId, scheme_id) {
    return httpService.get(`${scheme}${projectId}/${scheme_id}/wt`, {}, true);
  }
  //  PUT /scheme/{project_id}/{scheme_id}/wt 更新方案风机坐标数据
  updateWtList(param) {
    return httpService.put(`${scheme}${param.projectId}/${param.scheme_id}/wt`, param.wts, true);
  }
  //  /scheme/{project_id}/{scheme_id}/run 发起综合计算
  schemeRun(param) {
    return httpService.post(`${scheme}${param.projectId}/${param.scheme_id}/run`, {}, true);
  }
  //  GET /cfd-run/{project_id}/avail 获取当前可用的定向扇区
  getAvail(projectId) {
    return httpService.get(`${cfdRun}${projectId}/avail`, {}, true);
  }
  // PUT /scheme/{project_id}/{scheme_id}/section 更新所选扇区
  updateSection(param) {
    return httpService.put(`${scheme}${param.projectId}/${param.scheme_id}/section`, param.ids, true);
  }
  //  PUT /scheme/{project_id}/{scheme_id}/energy-guarantee 发电量担保恢复为默认信任系数
  resetEnergy(projectId, scheme_id) {
    return httpService.put(`${scheme}${projectId}/${scheme_id}/energy-guarantee`, {}, true);
  }
  //  PUT /scheme/{project_id}/{scheme_id}/turbulence-trust 湍流恢复为默认信任系数
  resetTurbulence(projectId, scheme_id) {
    return httpService.put(`${scheme}${projectId}/${scheme_id}/turbulence-trust`, {}, true);
  }
  // POST /scheme/{project_id}/{scheme_id}/guarantee-trust 创建发电量担保信任系数方案
  // POST  /scheme/{project_id}/{scheme_id}/turbulence-trust 创建湍流信任系数方案
  createTrust(param) {
    return httpService.post(`${scheme}${param.projectId}/${param.scheme_id}/${param.url}?name=${param.name}`, param.trustList, true);
  }
  // PUT /scheme/{project_id}/{scheme_id}/guarantee-trust 创建发电量担保信任系数方案
  // PUT  /scheme/{project_id}/{scheme_id}/turbulence-trust 创建湍流信任系数方案
  updateTrust(param) {
    return httpService.put(`${scheme}${param.projectId}/${param.scheme_id}/${param.url}?sourceName=${param.sourceName}&targetName=${param.targetName} `, param.trustList, true);
  }
  // GET /scheme/{project_id}/{scheme_id}/guarantee-trust 获取发电量担保信任系数方案
  // GET /scheme/{project_id}/{scheme_id}/turbulence-trust  获取湍流信任系数方案
  viewTrust(param) {
    return httpService.get(`${scheme}${param.projectId}/${param.scheme_id}/${param.url}?name=${param.name}`, {}, true);
  }
  // POST /scheme/{project_id}/{scheme_id}/coordinate 解析并保存坐标数据
  uploadTypeList(param) {
    return httpService.post(`${scheme}${param.projectId}/${param.scheme_id}/coordinate`, param.data, true);
  }
  // PUT /scheme/{project_id}/{scheme_id}/mast 更新方案测风塔坐标数据
  uploadMastList(param) {
    return httpService.put(`${scheme}${param.projectId}/${param.scheme_id}/mast`, param.list, true);
  }
  // PUT /scheme/{project_id}/{scheme_id}/wt 更新方案风机坐标数据
  uploadWtList(param) {
    return httpService.put(`${scheme}${param.projectId}/${param.scheme_id}/wt`, param.list, true);
  }
  // GET /scheme/{project_id}/{scheme_id}/wt 获取方案全部风机点位数据
  getMoreParam(projectId, scheme_id) {
    return httpService.get(`${scheme}${projectId}/${scheme_id}/wt`, {}, true);
  }
  // 获取项目扇区信息配置
  getSectionInfo(projectId) {
    return httpService.get(scheme + projectId +'/section-info', {}, true);
  }
  // 更新项目高级参数配置
  updateMoreParam(param) {
    return httpService.put(scheme + param.projectId +'/advance-conf', param.advancedConfigure, true);
  }
  // 重置项目高级参数配置
  resetMoreParam(projectId) {
    return httpService.put(scheme + projectId +'/conf-reset', {}, true);
  }
  // 发起定向计算
  caculateRun(projectId) {
    return httpService.post(cfdRun + projectId +'/start', {}, true);
  }
  // 上传地图文件
  uploadMapFile(file, param, onProgress) {
    return fileService.uploadFile(fileUrl +'upload', file, param, onProgress);
  }

  // GET /map/{project_id}/roughness 获取粗糙度文件信息
  getFileRoughness(projectId) {
    return httpService.get(mapUrl + projectId + '/roughness', {}, true);
  }
  // GET /map/{project_id}/terrain 获取地形文件信息
  getFileTerrain(projectId) {
    return httpService.get(mapUrl + projectId + '/terrain', {}, true);
  }
  // POST /climate-file/{project_id}/personal 插入湍流数据文件记录
  setFileTurbulence(projectId, fileId) {
    return httpService.post(turbulence + projectId + '/personal?fileId=' + fileId, {}, true);
  }
  // POST /turbulence-file/{project_id}/personal 插入气象数据文件记录
  setFileClimate(projectId, fileId) {
    return httpService.post(climate + projectId + '/personal?fileId=' + fileId, {}, true);
  }
  // GET /climate-file/{project_id}/{climate_file_id}/view 获取测风数据文件风参展示数据
  getClimateVIew(projectId, climate_file_id) {
    return httpService.get(climate + projectId + '/' + climate_file_id + '/view', {}, true);
  }
  // DELETE /map/{project_id}/roughness/{roughness_id} 删除地形粗糙度文件
  deleteFileRoughness(projectId, roughness_id) {
    return httpService.deleteput(mapUrl + projectId + '/roughness/' + roughness_id, {}, true);
  }
  // DELETE /map/{project_id}/terrain/{terrain_id} 删除地形文件信息
  deleteFileTerrain(projectId, terrain_id) {
    return httpService.deleteput(mapUrl + projectId + '/terrain/' + terrain_id, {}, true);
  }
  //
  // 发起致动盘计算
  schemeAdmRun(param) {
    return httpService.post(scheme + param.projectId +'/'+param.scheme_id+'/adm', param.ids, true);
  }
  // POST /post-process-result/{project_id}/{scheme_id} 综合结果文件下载
  schemeDownload(param) {
    return httpService.post(resultUrl + param.projectId +'/'+param.scheme_id+'?type='+param.type, {}, true, {
      headers: {'Content-Type': 'application/octet-stream'},
      responseType: 'blob'
    });
  }
}

export {
  planHttps
}
