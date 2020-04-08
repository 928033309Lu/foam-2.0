import httpService from './http.service';
import {pacFormData, jsonToParams} from '../config/network.config'

const baseUrl = '/api/scheme-service'

export default {
  getList(projectId) {
    return httpService.get(baseUrl+`/cfd-run/${projectId}/list`, {}, true);
  },
  stopCalculate(projectId,id) {
    return httpService.put(baseUrl+`/cfd-run/${projectId}/${id}/stop`, {}, true);
  },
  deleteCalculate(projectId,id) {
    return httpService.deleteput(baseUrl+`/cfd-run/${projectId}/${id}`, {}, true);
  },
  reCalculate(projectId,id,data) {
    return httpService.put(baseUrl+`/cfd-run/${projectId}/${id}/recalc`, data, true);
  },
  deleteAllCalculate(projectId,data) {
    return httpService.deleteput(baseUrl+`/cfd-run/${projectId}/stop`, data, true);
  },
  addCalculate(projectId,cfdRuns) {
    return httpService.post(baseUrl+`/cfd-run/${projectId}/single-run`, cfdRuns, true);
  },
  getConvergence(projectId,id) {
    return httpService.get(baseUrl+`/cfd-run/${projectId}/${id}/convergence`, {}, true);
  },
}
