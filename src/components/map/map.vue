<template>
  <div class="map-container">
    <div id="mapdiv"></div>
    <!--<div class="compass"></div>-->
    <div v-if="0" class="positioning"></div>
    <!--<div class="map-change" @click = "$store.commit('setMapMode', 'gaode')"></div>-->
    <div v-if="0" class="map-change" @click = "changeTileLayer"></div>
    <div class="view-change" v-if="$route.path == '/map/'">
      <span @click="$router.push('/project/list')"><i class="iconfont iconliebiao"></i></span>
      <span @click="$router.push({name: 'list', params: {isAdd: true}})"><i class="iconfont iconxinjian"></i></span>
    </div>
  </div>
</template>
<style lang="less">
   #mapdiv{
    width: 100%;
     height: calc(100vh - 50px);
     margin-top: 50px;
  }
  .basemap-farm-icon-img{
    width: 100%;
    .num{
      position: absolute;
      color: #fff;
      background: rgba(255,46,118,1);
      box-shadow: 0px 0px 1px 0px rgba(52,52,57,0.5);
      border-radius: 7px;
      min-width: 14px;
      padding: 0px 2px;
      font-size: 12px;
      line-height: 14px;
      display: block;
      left: 28px;
      top: -3px;
    }
  }
  .view-change{
    position: fixed;
    right: 29px;
    top: 67px;
    z-index: 510;
    background-color: #002C46;
    box-shadow:0px 1px 2px 0px rgba(34,48,52,0.6);
    border-radius: 2px;
    span{
      display: inline-block;
      +span {
        &::before {
          display: inline-block;
          width: 1px;
          height: 16px;
          background-color: #324958;
          position: absolute;
          top: 7px;
          left: 0;
        }
      }
    }
    i{
      display: inline-block;
      width: 30px;
      height: 30px;
      font-size: 16px;
      line-height: 30px;
      text-align: center;
      color: @highColor;
      cursor: pointer;
    }
  }
</style>
<script>
  // import L from 'leaflet'
  import '@/config/leaflet.ChineseTmsProviders.js'
  import '@/assets/less/map.less'
  import { MapConfig } from "@/components/map/MapConfig"
  import { MapManager } from "@/components/map/MapManager"
  export default {
    name: 'mapdiv',
    data() {
      return {
        mapManager: null,
        markers: [
          {lat: '35.5', lng: '105.0'},
          {lat: '40.5', lng: '110.0', type: 1},
          {lat: '37.5', lng: '113.0'},
        ],
        mapType: 'satellite'
      }
    },
    props: [],
    mounted() {
      this.initMap()
      this.getList()
    },
    methods: {
      initMap () {
        // 初始化地图
        this.mapManager = new MapManager("mapdiv", MapConfig, { enableZoomLinsten: false });
        // 加载互联网地图
        this.mapManager.loadGoogleLayers();
        // 绘制国界
        // this.mapManager.loadCountryRegionData();
        // 绘制点
        // this.markers.map((v) => {
        //   this.mapManager.addMarker(v)
        // })
      },
      getList() {
        let vm = this;
        this.projectHttps.getList({
          condition: "PRODATE",
          projectType: "1",
          searchConditions: "",
          order: "",
          page: 1,
          pageSize: 9999
        }).then(res => {
          this.markers = res.data;
          let arr = [], latlngs = []
          this.markers.map((v) => {
            if(v.latitude && v.longitude){
              latlngs.push([v.latitude, v.longitude])
              arr.push(vm.mapManager.addMarker(v))
            }
          })
          this.mapManager.addGroup(arr)
          this.mapManager.map.fitBounds(latlngs)
        }).catch(err=>{
          console.log(err)
        });
      },
      changeTileLayer(){
        let provider = "";
        if(this.mapType == 'normal'){
          this.mapType = 'satellite'
          provider = 'Google.Satellite.Map'
        }else if(this.mapType == 'satellite'){
          this.mapType = 'normal'
          provider = 'Geoq.Normal.PurplishBlue'
        }
        this.mapManager.changeTileLayer(provider)
      }
    },
    watch: {}

  }
</script>
