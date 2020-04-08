import httpService from '@/services/http.service'
import {
    pacFormData
} from '@/config/network.config'

const fiveUrl = process.env.NODE_ENV==='development'?'/gis' :'/api/gis';
const schemetUrl = '/api/scheme-service/';

export default {
    //上传dxf
    upMap({
        dxf,
        coord_type,
        zone_type,
        zone
    },opa) {
        return httpService.post(fiveUrl+`/upload`, pacFormData({
            dxf,
            coord_type,
            zone_type,
            zone
        }), true,opa);

    },
    refresh_extent(map, width) {
        return httpService.get(fiveUrl+`/extent`, {
            map,
            width
        }, true);
    },
    shift_adjust_li(map,offsetx,offsety){
        return httpService.get(fiveUrl+`/shift`, {
            map,
            offsetx,
            offsety
        }, true);
    },
    autoadjust(map){
        return httpService.get(fiveUrl+`/autoadjust`, {
            map,
        }, true);
    },
    dianJiao(gcps,map){
        return httpService.get(fiveUrl+`/adjust`, {
            map,
            gcps
        }, true);
    },
    //缓冲距离
    refresh_outline(width,map){
        return httpService.get(fiveUrl+`/outline`, {
            map,
            width
        }, true);
    },
    //下载校正插补结果
    downloadFixData(width,map){
        return httpService.get(fiveUrl+`/genresult`, {
            map,
            width
        }, true);
    },
    //应用到项目
    applyProject(
        project_id,
        map,
        width,
    ) {
        return httpService.post(schemetUrl+`map/${project_id}/wind-artisan`, pacFormData({
            map,
            width,
        }), true);

    },
}