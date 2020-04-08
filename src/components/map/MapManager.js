// import L from 'leaflet'
// import { TiledMapLayer } from 'esri-leaflet'
// require("leaflet.chinesetmsproviders")
import { getChinaBounGeoJSON } from '../../services/baseMap'
import cfd from '../../config/cfd.config'
import router from '@/router'
import store from '@/store'
import { EventBus } from "@/config/event-bus.js";

import 'leaflet/dist/leaflet-src.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import "leaflet.featuregroup.subgroup";
/**
 * 基础地图相关代码
 */
class MapManager {

  /**
   * 构造函数
   * @param {String} mapcontiner 地图容器div
   * @param {Object} mapconfig 地图配置信息
   * @param {Object} options 配置信息
   */
  constructor(mapcontiner, mapconfig, options = {}) {
    this._map = null
    this._baseLayerGroup = null
    this._orderLayers = []
    this._regionLayerGroup = null
    this._countryFeatureGroup = null
    this._FeatureGroup = null


    this._mapconfig = mapconfig;
    this._initMap(mapcontiner, mapconfig);

    if (options && options.enableZoomLinsten)
      this._initMapLinstener();
  }

  /**
   * Leaflet地图对象
   */
  get map() {
    return this._map;
  }

  /**
   * 加载互联网地图作为底图
   */
  loadBaseLayers() {
    if (!this._baseLayerGroup) {
      this._baseLayerGroup = L.featureGroup().addTo(this._map);
    }
    this._baseLayerGroup.clearLayers();

    if (!this._mapconfig.baseMap) return;
    // let baselayer=new TiledMapLayer({url:this._mapconfig.baseMap});
    let baselayer = L.tileLayer(this._mapconfig.baseMap, {
      minZoom: this._mapconfig.minZoom || 1,
      maxZoom: this._mapconfig.maxZoom || 18,
    });
    this._baseLayerGroup.addLayer(baselayer).bringToBack();
  }

  /**
   * 加载互联网地图作为底图
   */
  loadGoogleLayers() {
    if (!this._baseLayerGroup) {
      this._baseLayerGroup = L.featureGroup().addTo(this._map);
    }
    this._baseLayerGroup.clearLayers();

    let imgLayer = L.tileLayer(this._mapconfig.Google.Satellite.Map, {
      minZoom: this._mapconfig.minZoom || 1,
      maxZoom: this._mapconfig.maxZoom || 18,
    });
    let annoLayer = L.tileLayer(this._mapconfig.Google.Satellite.Annotion, {
      minZoom: this._mapconfig.minZoom || 1,
      maxZoom: this._mapconfig.maxZoom || 18,
    });
    // this._baseLayerGroup.addLayer(annoLayer).bringToBack(); // 添加地址标识
    this._baseLayerGroup.addLayer(imgLayer).bringToBack();
  }

  // add地图底图
  changeTileLayer (provider){
    let layer = L.tileLayer.chinaProvider(provider, {
      subdomains: []
    })
    this._map.addLayer(layer);
  }

  /*
  * 绘制国界
  * */
  loadCountryRegionData() {
    getChinaBounGeoJSON().then(result => {
      if (!result.data) {
        console.log('获取国界数据失败：' + JSON.stringify(result));
        return;
      }
      this._countryFeatureGroup = L.geoJSON(result.data, {
        style: () => {
          return {color: "#545659", opacity: 0, weight: 2, fillColor: "#fff", fillOpacity: 0.3}
        }
      }).addTo(this._regionLayerGroup);
    }).catch(function (reason) {
      console.log('获取国界数据失败：' + reason);
    });
  }

  /*
  * 添加marker
  * */
  addMarker(point) {
    let marker = L.marker([point.latitude, point.longitude],
      { icon: this._getMarkerIcon(point.status || 0), riseOnHover: true })
      .on('click', (e) => {
        sessionStorage.setItem("detail", JSON.stringify(point));
        sessionStorage.setItem("projectName", point.projectName);
        sessionStorage.setItem("status", point.status);
        localStorage.setItem('curProjectId', point.projectId)
        let projectCanWrite = 1;
        (point.userId || point.userId === 0) && (projectCanWrite = point.userId == store.state.userInfo.userid && 1 || 0)
        localStorage.setItem('projectCanWrite', projectCanWrite)
        store.commit('setCurProjectId', point.projectId)
        store.commit('setProjectCanWrite', projectCanWrite)
        EventBus.$emit("addition", {
          projectName: sessionStorage.getItem("projectName"),
          status: point.status,
        });
        router.push({ name: point.status <=2 && 'calculate' || 'planList', params: { projectId: point.projectId, projectName: point.projectName,}, query:{status: point.status}})
      })
      // .addTo(this._FeatureGroup)
      .bindTooltip('<div class="basemap-farm-icon-tooltip-div">' +
        '<div class="basemap-farm-icon-tooltip-lefttop-div"></div>' +
        '<div class="basemap-farm-icon-tooltip-leftbottom-div"></div>' +
        '<div class="basemap-farm-icon-tooltip-righttop-div"></div>' +
        '<div class="basemap-farm-icon-tooltip-rightbottom-div"></div>' +
        '<div class="basemap-farm-icon-tooltip-textdiv title">' + point.projectName + '</div>' +
        '<div class="basemap-farm-icon-tooltip-textdiv">' +
        '<span>位置：</span>' + (point.province || "") + (point.city || "") + (point.town || "") +'</div>' +
        '<div class="basemap-farm-icon-tooltip-textdiv">' +
        '<span>状态：</span>' + cfd.projectStatus[point.status] + '</div>' +
        '</div>', {
        direction: "right",
        className: 'basemap-farm-icon-tooltip',
        opacity: 0.9,
        offset: new L.point(15, -10)
      });
    return marker
  }
  /**
   * 获取点位Marker样式
   * @param {Number} type 样式类型
   */
  _getMarkerIcon (type, cluster, firstIcon) {
    var markerIcon = null;
    switch (type) {
      case 3:
        markerIcon = L.divIcon({
          html: "<div style='text-align: center;'><img src='/icon/farm.png' class='basemap-farm-icon-img'></img></div>",
          iconSize: [42, 52],
          iconAnchor: [21, 52],
          className: 'basemap-farm-icon-img',
          icon: 'farm'
        });
        return markerIcon;
      case 'cluster':
        markerIcon = L.divIcon({
          html: "<div style='text-align: center;'><img src='/icon/" + (firstIcon || "farm") + ".png' class='basemap-farm-icon-img'></img><span class='num'>"+cluster+"</span></div>",
          iconSize: [42, 52],
          iconAnchor: [21, 52],
          className: 'basemap-farm-icon-img'
        });
        return markerIcon;
      default:
        markerIcon = L.divIcon({
          html: "<div style='text-align: center;'><img src='/icon/farmActive.png' class='basemap-farm-icon-img'></img></div>",
          iconSize: [42, 52],
          iconAnchor: [21, 52],
          className: 'basemap-farm-icon-img',
          icon: 'farmActive'
        });
        return markerIcon;
    }
    // return null;
  }
  /**
   * 移除底图
   */
  removeBaseLayers() {
    if (!this._baseLayerGroup) return;
    this._baseLayerGroup.clearLayers();
    this._baseLayerGroup.removeFrom(this._map);
    this._baseLayerGroup = null;
  }

  /**
   * 将图层添加到orderLayers中
   * @param {Layer} layer 图层
   */
  addOrderLayer(layer) {
    if (!layer) return;
    this._orderLayers.push(layer);
  }

  /**
   * 重置orderLayers图层的叠加顺序，图层顺序为其添加到的orderLayers次序
   */
  reorderLayer() {
    this._orderLayers.forEach(layer => {
      if (!layer) return;
      if (layer.getLayers()) {
        layer.getLayers().forEach(sublayer => {
          if (!sublayer) return;
          if (sublayer.bringToBack)
            sublayer.bringToBack();
        });
      }
      if (layer.bringToBack)
        layer.bringToBack();
    });
  }

  //地图缩放
  zoom(zoomin) {
    if (zoomin)
      this._map.zoomIn();
    else
      this._map.zoomOut();
  }


  /**
   * 初始化地图
   * @param {String} mapcontiner 地图容器div
   * @param {Object} mapconfig 地图配置信息
   */
  _initMap(mapcontiner, mapconfig) {
    this._map = L.map(mapcontiner, {
      // crs:L.CRS.EPSG4326,
      center: new L.LatLng(mapconfig.centerlat || 35, mapconfig.centerlon || 109),
      zoom: mapconfig.initZoom || 4,
      minZoom: mapconfig.minZoom || 1,
      maxZoom: mapconfig.maxZoom || 18,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this._map)
    this._regionLayerGroup = L.layerGroup().addTo(this._map);
    this._FeatureGroup = L.featureGroup().addTo(this._map);
  }

  _initMapLinstener() {
    if (!this._map) return;

    if (!this._mapZoomEnd) {
      let that = this;
      this._mapZoomEnd = (e) => {
        that.reorderLayer();
      };
    }
    this._map.on("zoomend", this._mapZoomEnd);
  }

  _removeMapLinstener() {
    if (!this._map) return;
    this._map.off("zoomend", this._mapZoomEnd);
  }

  addGroup(markers){
    let parentGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      iconCreateFunction: cluster => {
        // 获取当前组第一个icon的图片，赋值到组合的icon
        let firstIcon = cluster.getAllChildMarkers()[0].getIcon().options.icon
        return this._getMarkerIcon('cluster', cluster.getChildCount(), firstIcon)
      }
    });
    let subGroup = L.featureGroup.subGroup(parentGroup)

    parentGroup.addTo(this._map)
    markers.forEach(v=>{
      v.addTo(subGroup)
    })
    subGroup.addTo(this._map)
  }
}

export {MapManager}
