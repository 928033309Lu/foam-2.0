import httpService from './http.service';
import {pacFormData, jsonToParams} from '../config/network.config'
import fileService from './file.service';

var qs = require('qs');

export default {
  uploadTerrainFile(file, onProgress, params) {
    let data = _.pick(params, ['messageCode', 'epsgNum']);
    return fileService.uploadFile(`/uploadFile/${params.projectId}/upload-terrain-file`, file, data, onProgress);
  },
  onlineMap(project_id, maxX, maxY, minX, minY, epsgNum) {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/online/map?maxX=${maxX}&maxY=${maxY}&minX=${minX}&minY=${minY}&epsgNum=${epsgNum}`, {}, true);
  },
  uploadRoughnessFile(file, onProgress, params) {
    let data = _.pick(params, ['messageCode']);
    return fileService.uploadFile(`/uploadFile/${params.projectId}/upload-roughness-file`, file, data, onProgress);
  },
  uploadWeatherFile(file, onProgress, params) {
    return fileService.uploadFile(`/uploadFile/${params.projectId}/${params.postProcessSettingId}/uploadClimateFile`,
      file, {}, onProgress);
  },
  uploadPowerCurveFile(file, onProgress, params) {
    return fileService.uploadFile(`/uploadFile/${params.projectId}/uploadPowerCurve`, file, {}, onProgress);
  },
  uploadFanFile(file, onProgress, params) {
    return this.uploadAnalysisFile(params.projectId, 'wt', file, onProgress, params.messageCode);
  },
  uploadWindTowerFile(file, onProgress, params) {
    return this.uploadAnalysisFile(params.projectId, 'mast', file, onProgress, params.messageCode);
  },
  uploadWindRadarFile(file, onProgress, params) {
    return this.uploadAnalysisFile(params.projectId, 'lidar', file, onProgress, params.messageCode);
  },
  uploadMesoFile(file, onProgress, params) {
    return this.uploadAnalysisFile(params.projectId, 'meso', file, onProgress, params.messageCode);
  },
  uploadAnalysisFile(projectId, fileType, file, onProgress, messageCode) {
    return fileService.uploadFile(`/goldfoam-service-cfdservice/${projectId}/analysis-file`, file, {
      fileType,
      messageCode
    }, onProgress);
  },
  uploadWindTowerCalculate(file, onProgress, params) {
    let data = {
      fileType: 'mast'
    };
    return fileService.uploadFile(`/goldfoam-service-cfdservice/analysis-file`, file, data, onProgress);
  },
  uploadWindCalculate(file, onProgress, params) {
    let data = {
      fileType: 'wt'
    };
    return fileService.uploadFile(`/goldfoam-service-cfdservice/analysis-file`, file, data, onProgress);
  },
  getAreaZone(coordinateSystem, projectionSystem) {
    return httpService.get(`/goldfoam-service-cfdservice/area-zone`, {coordinateSystem, projectionSystem}, true);
  },
  getCoor(projectionSystem) {
    return httpService.get(`/goldfoam-service-cfdservice/projection-system`, {projectionSystem}, true);
  },
  getMeshMap(projectId) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/mesh-map`, {}, true);
  },
  getStu(projectId) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/trrain-check`, {}, true);
  },
  getMapHistory(projectId, type) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/his-map`, {type}, true);
  },
  getCoordinate(projectId) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/coordinate`, {}, true);
  },
  refineData(projectId) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/refine-data`, {}, true);
  },
  saveCoordinate(projectId, coordinateData, messageCode = '') {
    return httpService.post(`/goldfoam-service-cfdservice/${projectId}/coordinate?messageCode=${messageCode}`, coordinateData, true);
  },
  rollbackHistory(projectId, map_id, type, messageCode = '') {
    return httpService.putJson(`/goldfoam-service-cfdservice/${projectId}/his-map`,
      qs.stringify({map_id, type, messageCode}), true);
  },
  getMeshData(projectId) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/mesh-data`, {}, true);
  },
  saveMeshData(projectId, content, delFlag = 0, messageCode = '') {
    return httpService.post(`/goldfoam-service-cfdservice/${projectId}/mesh-data?delFlag=${delFlag}&messageCode=${messageCode}`, content, true);
  },
  gridCalculate(projectId, resourse, messageCode = '') {
    return httpService.post(`/goldfoam-service-cfdservice/${projectId}/mesh-run?messageCode=${messageCode}`, pacFormData({resourse}), true);
  },
  gridProgress(project_id) {
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/mesh-process`, {project_id}, true);
  },
  gridResult(project_id, borderValue = '') {
    let data = {};
    if (borderValue) {
      data.borderValue = borderValue;
    }
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/mesh-run`, data, true);
  },
  gridStop(project_id) {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/mesh-stop`, {}, true);
  },
  sectionStop(project_id, stepRunId) {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/section-stop?stepRunId=${stepRunId}`, {}, true);
  },
  sectionDel(project_id, stepRunId) {
    return httpService.deleteOut(`/goldfoam-service-cfdservice/${project_id}/section/${stepRunId}`, {}, true);
  },
  getCoordinateHistory(projectId, type) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/gen-coordinate`, {type}, true);
  },
  getCfdHistory(projectId, type) {
    return httpService.get(`/goldfoam-service-cfdservice/${projectId}/history-mesh-data`, {type}, true);
  },
  coordinateRollback(projectId, type, history_id, messageCode = '') {
    return httpService.put(`/goldfoam-service-cfdservice/${projectId}/roll-back`, {
      type,
      history_id,
      messageCode
    }, true);
  },
  downloadMapFile(project_id, type, id) {
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/download-map-file`, {type, id}, true, {
      headers: {'Content-Type': 'application/octet-stream'},
      responseType: 'blob'
    });
  },
  sendPhoneCode(project_id) {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/send-mes`, {}, true);
  },
  analysisKmz(file) {
    return fileService.uploadFile(`/goldfoam-service-cfdservice/analysis/kmz`, file, true);
  },
  cfdResource(project_id, sectionCount) {
    let data = sectionCount ? {sectionCount} : {};
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/cfd-calc-resources`, data, true);
  },
  deleteMap(project_id, type, messageCode = '') {
    return httpService.deleteOut(`/goldfoam-service-cfdservice/${project_id}/mesh-map${jsonToParams({
        type,
        messageCode
      })}`,
      {}, true);
  },
  cfdRollback(project_id, type, id, messageCode = '') {
    return httpService.put(`/goldfoam-service-cfdservice/${project_id}/cfd-data-rollback`, {
      type,
      id,
      messageCode
    }, true);
  },
  recalculate(project_id, resources, run, messageCode = '') {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/mesh_recalc?resources=${resources}&messageCode=${messageCode}`,
      run, true);
  },
  addrecalculate(project_id, resources, run, messageCode = '') {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/single-section?resources=${resources}&messageCode=${messageCode}`,
      run, true);
  },
  checkRunning(project_id) {
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/check-running`, {}, true);
  },
  refineCheck(project_id, meshPo, diadom = 5000) {
    return httpService.post(`/goldfoam-service-cfdservice/${project_id}/refine-check?diadom=${diadom}`, meshPo, true);
  },
  getSections(project_id) {
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/sections`, {}, true);
  },
  convergentGraph(project_id, cfdStepSettingId) {
    return httpService.get(`/goldfoam-service-cfdservice/${project_id}/convergent-graph?cfdStepSettingId=${cfdStepSettingId}`, {}, true);
  }

}
