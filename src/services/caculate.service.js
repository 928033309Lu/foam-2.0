import httpService from '@/services/http.service'
import fileService from './file.service';

// import { pacFormData } from '@/config/network.config'
const global = '/api/scheme-service/global/';
const cfd = '/api/scheme-service/cfd/';
const cfdRun = '/api/scheme-service/cfd-run/';
const epsgRun = '/api/scheme-service/';
const fileUrl =process.env.NODE_ENV==='development'?'/goldfile/files/' :'/api/goldfile/files/';
const mapUrl = '/api/scheme-service/map/';
class caculateHttps {
  constructor(vueThis) {
    this.vm = vueThis; //vue中的this  也可以不用en
  }
  // GET /global/settings 查询S3的文件存储的信息
  getGlobal() {
    return httpService.get(global +'settings', {}, true);
  }
  // 获取项目定向计算基础配置
  getGlobalSetting(projectId) {
    return httpService.get(cfd + projectId +'/global-setting', {}, true);
  }
  // 更新项目定向计算基础配置
  updateGlobalSetting(param) {
    return httpService.put(cfd + param.projectId +'/base-conf', param.baseConf, true);
  }
  // 获取所有风机列表
  getAllWtList(projectId) {
    return httpService.get(cfd + projectId +'/wt', {}, true);
  }
  // 更新项目定向计算基础配置
  updateTypeList(param) {
    return httpService.put(cfd + param.projectId +'/coordinate?type=' + param.type, param.list, true);
  }
  // 测风塔/风机文件上传
  uploadTypeList(param) {
    return httpService.post(cfd + param.projectId +'/coordinate', param.data, true);
  }
  // 添加加密区
  addAngle(projectId,param) {
    return httpService.post(cfd + projectId +'/refine', param, true);
  }
  // 添加加密区
  coorToLeaflet(param,epsg) {
    return httpService.post(epsgRun + 'coordinate/transfer?epsg='+epsg, param, true);
  }
  // 删除加密区
  delAngle(projectId, index) {
    return httpService.deleteput(cfd + projectId + '/refine?index='+index, {}, true);
  }
  // 更新加密区
  updateAngle(projectId,index,param) {
    return httpService.put(cfd + projectId +'/refine?index='+index, param, true);
  }
  // 获取项目高级参数配置
  getMoreParam(projectId) {
    return httpService.get(cfd + projectId +'/advance-conf', {}, true);
  }
  // 获取项目扇区信息配置
  getSectionInfo(projectId) {
    return httpService.get(cfd + projectId +'/section-info', {}, true);
  }
  // 更新项目高级参数配置
  updateMoreParam(param) {
    return httpService.put(cfd + param.projectId +'/advance-conf', param.advancedConfigure, true);
  }
  // 重置项目高级参数配置
  resetMoreParam(projectId) {
    return httpService.put(cfd + projectId +'/conf-reset', {}, true);
  }
  // 发起定向计算
  caculateRun(projectId) {
    return httpService.post(cfdRun + projectId +'/start', {}, true);
  }
  // 上传地图文件
  uploadMapFile(file, param, onProgress) {
    return fileService.uploadFile(fileUrl +'upload', file, param, onProgress);
  }
  //POST /map/{project_id}/auto-roughness 自动生成地形粗糙度文件
  autoRoughness(projectId){
    return httpService.post(mapUrl + projectId + '/auto-roughness', {}, true);
  }
  // GET /map/{project_id}/roughness 获取粗糙度文件信息
  getFileRoughness(projectId) {
    return httpService.get(mapUrl + projectId + '/roughness', {}, true);
  }
  // GET /map/{project_id}/terrain 获取地形文件信息
  getFileTerrain(projectId) {
    return httpService.get(mapUrl + projectId + '/terrain', {}, true);
  }
  // POST /map/{project_id}/roughness 插入粗糙度文件信息
  setFileRoughness(projectId, fileId) {
    return httpService.post(mapUrl + projectId + '/roughness?fileId=' + fileId, {}, true);
  }
  // POST /map/{project_id}/terrain 插入地形文件信息
  setFileTerrain(projectId, fileId, onProgress) {
    return httpService.post(mapUrl + projectId + '/terrain?fileId=' + fileId, {}, true, {
      onUploadProgress(progressEvent) {
        if (progressEvent.lengthComputable && onProgress) {
          onProgress(progressEvent);
        }
      }
    });
  }
  // DELETE /map/{project_id}/roughness/{roughness_id} 删除地形粗糙度文件
  deleteFileRoughness(projectId, roughness_id) {
    return httpService.deleteput(mapUrl + projectId + '/roughness/' + roughness_id, {}, true);
  }
  // DELETE /map/{project_id}/terrain/{terrain_id} 删除地形文件信息
  deleteFileTerrain(projectId, terrain_id) {
    return httpService.deleteput(mapUrl + projectId + '/terrain/' + terrain_id, {}, true);
  }
  // map/{project_id}/terrain/{terrain_id} 地形文件下载
  downloadTerrain(projectId, terrain_id, onProgress){
    return fileService.downloadFile(mapUrl + projectId + '/terrain/' + terrain_id, {}, onProgress);

    // return httpService.post(mapUrl + projectId + '/terrain/' + terrain_id, {}, true, {
    //   headers: {'Content-Type': 'application/octet-stream'},
    //   responseType: 'blob'
    // });
  }
  // /map/{project_id}/roughness/{roughness_id}  粗糙度文件下载
  downloadRoughness(projectId, roughness_id, onProgress) {
    return fileService.downloadFile(mapUrl + projectId + '/roughness/' + roughness_id, {}, onProgress);
  }
  // /map/{project_id}/srtm 生成SRTM地图数据
  generateSrtm(projectId,data) {
    return httpService.post(mapUrl + projectId + '/srtm', data, true);
  }
  // /map/{project_id}/terrain 插入地形文件信息
  insertSrtm(projectId,data) {
    return httpService.post(mapUrl + projectId + '/terrain', data, true);
  }
  // /map/{project_id}/projection获取项目坐标系信息
  getProjection(projectId) {
    return httpService.get(mapUrl + projectId + '/projection', {}, true);
  }
  // /map/{project_id}/srtm/{file_id} 下载SRTM地图数据
  downloadSrtm(projectId,fileId) {
    return httpService.post(mapUrl + projectId + `/srtm/${fileId}`, {}, true,{
      headers: {'Content-Type': 'application/octet-stream'},
      responseType: 'blob'
    });
  }
  // /epsg/projection-system 获取投影系类别
  getProjectionSystem() {
    return httpService.get(epsgRun + 'epsg/projection-system', {}, true);
  }
  // /epsg/coordinate-system 获取坐标系类别
  getCoordinateSystem(data) {
    return httpService.get(epsgRun + 'epsg/coordinate-system', data, true);
  }
  // epsg/info 获取epsg信息
  getProjectionInfo(data) {
    return httpService.get(epsgRun + 'epsg/info', data, true);
  }
  // /map/srtm/{srtm_record} 获取SRTM地图数据生成状态
  getSrtmRecord(id) {
    return httpService.get(mapUrl + `srtm/${id}`, {}, true);
  }
}

export {
  caculateHttps
}
