<template>
  <div
    class="map-container small"
    :class="{'crosshair': mapEditMode=='rect', 'pointer': mapEditMode=='wt' || mapEditMode=='mast'}"
  >
    <div class="map-block" :style="backStyle" id="map-container"></div>
    <div class="action-button" v-if="true">
      <slot></slot>
      <div class="info">坐标系统：{{system.projectionSystem}} {{system.coordinateSystem}} {{system.zone}}</div>
      <!--<div class="zoom-btn">-->
      <!--<i class="iconfont el-icon-plus" @click="zoomOut(index)"></i>-->
      <!--<i class="iconfont el-icon-minus" @click="zoomIn(index)"></i>-->
      <!--</div>-->
      <!--<div class="layer-change">-->
      <!--<div :class="curLayer.includes('terrain') && 'active'" @click="toggleMapLayer('terrain')"><i class="iconfont iconmap1"></i><span>地形图</span></div>-->
      <!--<div :class="curLayer.includes('roughness') && 'active'" @click="toggleMapLayer('roughness')"><i class="iconfont iconcucaodu"></i><span>粗糙度</span></div>-->
      <!--</div>-->
      <div class="mark-change">
        <i
          class="iconfont iconfengji1"
          :class="{'active': layerShow.wt}"
          @click="toggleLayer('wt')"
        ></i>
        <i
          class="iconfont icongaoyadianta"
          :class="{'active': layerShow.mast}"
          @click="toggleLayer('mast')"
        ></i>
        <!--<i class="iconfont iconquyu" :class="{'active': layerShow.rect}" @click="toggleLayer('rect')"></i>-->
        <img
          :src="'/icon/'+ (layerShow.rect ? 'icon-areaA' : 'icon-area') + '.png'"
          class="iconfont iconquyu"
          @click="toggleLayer('rect')"
        >
      </div>
      <div class="mark-change" style="top: 95px; height: 56px;">
        <i class="iconfont" @click="toggleMapLayer('terrain')" title="地形图">
          <img
            :src="'/icon/'+ (curLayer.includes('terrain') ? 'icon-dixingA' : 'icon-dixing') + '.png'"
            class="iconfont dixing"
            :style="{opacity: (curLayer.includes('terrain') ? 1 : 0.7)}"
          >
        </i>
        <i
          class="iconfont iconcucaodu"
          title="粗糙度"
          :class="{'active': curLayer.includes('roughness')}"
          @click="toggleMapLayer('roughness')"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
// import L from 'leaflet'
import "proj4leaflet";
import { mapOptions, crsdef, leafletProj } from "@/config/map.config";
import cfd from "@/config/cfd.config";
export default {
  name: "map-caontainer1",
  data() {
    return {
      cfd: cfd,
      map: "",
      width: mapOptions.width,
      height: this.mapH,
      mleft: 0,
      mTop: 0,
      wtWidth: mapOptions.wtWidth,
      mastWidth: mapOptions.mastWidth,
      projectId: this.$route.params.projectId || 1,
      backStyle: {
        top: 0,
        left: 0,
        // width: mapOptions.width+'px',
        width: "100%",
        height: this.mapH + "px"
      },
      editMode: this.mapEditMode, // 当前允许编辑模式
      layerShow: {
        wt: true,
        mast: true,
        rect: true
      },
      cor: {},
      curLayer: [],
      wmslayer: "", //地形图
      roughnessLayer: "", //粗糙度图层
      rectangle: "",
      rectNoteW: "", // 矩形注释
      rectNoteH: "", // 矩形注释
      circle: "",
      greatCircle: "",
      calArea: "", // 计算区 图层
      markers: {
        wt: [],
        mast: []
      },
      mastMarkers: [],
      wtMarkers: [],
      flag: false,
      curPointIndex: "", // 当前激活的点信息
      safeDistance: 500, // 地图边界缓冲区
      rectOverflow: false, // 兴趣区域是否超过地形图
      rectLessThanMin: false, // 兴趣区域边长是否小于最小值
      mouseHandleEle: "",
      ind: null,
      groups: [],
      notes: [],
      heartslat: [],
      heartslng: [],
      heartsmlat: [],
      heartsmlng: [],
      maxRectangle:null,//最大矩形
    };
  },
  props: {
    mapEditMode: {
      //当前编辑模式 wt mast rect
      default: ""
    },
    mapH: {
      default: mapOptions.height
    },
    terrain: {},
    mastList: {},
    wtList: {},
    mesh: {}, // 兴趣区域坐标
    angles: null,
    epsgNum: {},
    system: {}, //坐标系统
    roughness: {}
  },
  computed: {},
  created() {},
  mounted() {
    this.initMap();
  },
  methods: {
    selectStyle(index) {
      if (this.groups[index]) {
        this.groups[index].setStyle({
          color: "red",
          fillColor: "red"
        });
      }
    },
    outStyle(index) {
      if (this.groups[index]) {
        this.groups[index].setStyle({
          color: "#009FFF",
          fillColor: "#002C46"
        });
      }
    },
    initMap() {
      this.terrain.leafLetCor = [
        this.coorToLeaflet([this.terrain.xMin, this.terrain.yMax]),
        this.coorToLeaflet([this.terrain.xMax, this.terrain.yMin])
      ];
      // this.terrain.leafLetCor = [
      //   [-37.7, -72.7],
      //   [-37.5, -72.5]
      // ];
      // 初始化地图
      this.map = L.map("map-container", {
        attributionControl: false,
        dragging: true,
        zoomControl: false
      });
      L.control
        .zoom({
          position: "bottomright"
        })
        .addTo(this.map);
      this.setTerrainLayer();
      this.addRectangle();
      this.mapRedraw();
    },
    //缩放到配置的中心点
    mapFitBounds() {
      this.map.invalidateSize(true);
      this.map.fitBounds(this.terrain.leafLetCor, {
        paddingTopLeft: [-30, -30]
      });
      this.mapRedraw();
    },
    fitBounds(LatLngBounds) {
      let vm = this;
      this.map.invalidateSize(true);
      LatLngBounds.length &&
        (LatLngBounds = LatLngBounds.map(v => {
          return vm.coorToLeaflet(v);
        }));
      LatLngBounds = LatLngBounds.concat(vm.terrain.leafLetCor);
      this.map.fitBounds(LatLngBounds, {
        paddingTopLeft: [100, 100],
        paddingBottomRight: [100, 100]
      });
      this.mapRedraw();
    },
    // 初始化绘制功能
    addRectangle() {
      let vm = this;
      let beginLog = [];
      let moveLog = [];
      let endLog = [];
      let bounds = [];
      this.map.on({
        mousedown: function(e) {
          if (vm.mouseHandleEle == "marker") return; //避免marker触发
          if (vm.editMode != "rect") return;
          vm.layerShow["rect"] = true;
          vm.flag = false;
          vm.map.dragging.disable(); //鼠标移入禁止leaflet 拖拽事件
          beginLog = [e.latlng.lat, e.latlng.lng];
          vm.positions = e.latlng.lng + "," + e.latlng.lat + ";";
        },
        mousemove: function(e) {
          if (vm.editMode != "rect") return;
          if (vm.flag) return;
          vm.map.dragging.disable(); //鼠标移入禁止leaflet 拖拽事件
          moveLog = [e.latlng.lat, e.latlng.lng];
          if (beginLog.length == 0) return;
          if (moveLog == beginLog) return;

          if (vm.ind === null) {
            vm.rectangle && vm.rectangle.remove();
            // vm.circle && vm.circle.remove();
            bounds = [beginLog, moveLog];
            vm.rectangle = L.rectangle(bounds, {
              color: "#009FFF",
              weight: 2,
              fillColor: "#002C46"
            });
            vm.map.addLayer(vm.rectangle);
            vm.drawCircle(false, null);
            vm.addRectNote();
          } else {
            vm.groups[vm.ind] && vm.groups[vm.ind].remove();
            // vm.circle && vm.circle.remove();
            bounds = [beginLog, moveLog];
            let rectangle = L.rectangle(bounds, {
              color: "#009FFF",
              weight: 2,
              fillColor: "#002C46"
            });
            // L.layerGroup(rectangle).addTo(vm.map);
            vm.groups[vm.ind] = rectangle;
            vm.map.addLayer(vm.groups[vm.ind]);
            // vm.map.addLayer(rectangle);

            vm.drawCircle(false, rectangle);
            vm.addRectNote(rectangle);
          }
        },
        mouseup: function(e) {
          if (vm.editMode != "rect") return;
          if (vm.flag) return;
          vm.flag = true;
          vm.map.dragging.enable(); //鼠标移入禁止leaflet 拖拽事件
          endLog = [e.latlng.lat, e.latlng.lng];
          if (endLog[0] == beginLog[0] && endLog[1] == beginLog[1]) return;
          if (vm.ind === null) {
            vm.rectangle && vm.rectangle.remove();
            // vm.positions = vm.positions+e.latlng.lng+','+e.latlng.lat;
            bounds = [beginLog, endLog];
            // if(beginLog[0]>=endLog[0]){
            //   vm.onFilePoints.latMax = beginLog[0];
            //   vm.onFilePoints.latMin = endLog[0];
            // }else{
            //   vm.onFilePoints.latMax = endLog[0];
            //   vm.onFilePoints.latMin = beginLog[0];
            // }
            // if(beginLog[1]>=endLog[1]){
            //   vm.onFilePoints.lonMax = beginLog[1];
            //   vm.onFilePoints.lonMin = endLog[1];
            // }else{
            //   vm.onFilePoints.lonMax = endLog[1];
            //   vm.onFilePoints.lonMin = beginLog[1];
            // }
            vm.saveBonds = [beginLog, endLog];
            vm.rectangle = L.rectangle(bounds, {
              color: "#009FFF",
              weight: 2,
              fillColor: "#002C46"
            });
            vm.map.addLayer(vm.rectangle);
            vm.drawCircle(true);
            vm.addRectNote();
          } else {
            vm.groups[vm.ind] && vm.groups[vm.ind].remove();
            // vm.circle && vm.circle.remove();
            bounds = [beginLog, moveLog];
            let rectangle = L.rectangle(bounds, {
              color: "#009FFF",
              weight: 2,
              fillColor: "#002C46"
            });
            // L.layerGroup(rectangle).addTo(vm.map);
            vm.groups[vm.ind] = rectangle;
            vm.map.addLayer(vm.groups[vm.ind]);
            vm.drawCircle(true, rectangle);
            vm.addRectNote(rectangle);
          }

          vm.$emit("update", vm.areaCoor([beginLog, endLog]), vm.ind); // 更新父组件参数
          beginLog = [];
          moveLog = [];
          endLog = [];
          bounds = [];
          // vm.transforming();
        },
        click: e => {
          if (vm.editMode == "wt" || vm.editMode == "mast") {
            vm.drawPoint(vm.editMode, e.latlng);
            vm.$emit(
              "setPointXY",
              vm.editMode,
              vm.coorToProjection([e.latlng.lat, e.latlng.lng])
            );
          }
        }
      });
    },
    // 切换控制图层显示隐藏
    toggleMapLayer(layer) {
      if (this.curLayer.includes(layer)) {
        if (layer == "terrain" && this.wmslayer) {
          this.wmslayer.remove();
          this.wmsBorder.remove();
        }
        layer == "roughness" &&
          this.roughnessLayer &&
          this.roughnessLayer.remove();
        this.curLayer.splice(this.curLayer.indexOf(layer), 1);
      } else {
        if (layer == "terrain") {
          this.setTerrainLayer();
        } else {
          this.setRoughnessLayer();
        }
      }
    },
    // 获取粗糙度文件信息
    getFileRoughness() {
      this.caculateHttps.getFileRoughness(this.projectId).then(res => {
        this.$emit("update:roughness", res);
        this.$nextTick(() => {
          this.setRoughnessLayer();
        });
      });
    },
    // 添加地形图 图层
    setTerrainLayer() {
      // debugger
      if (this.wmslayer) {
        this.wmslayer.addTo(this.map);
        this.wmsBorder.addTo(this.map);
        this.curLayer.push("terrain");
        return;
      }
      if (this.terrain.wmsUrl) {  
        if(this.terrain.wmsUrl.indexOf('.map')>=0){
          this.map.remove();
          let crs_code = "EPSG:" + this.terrain.epsgNum;
      // 初始化地图
      this.map = L.map("map-container", {
        attributionControl: false,
        crs: new L.Proj.CRS(
          crs_code,
          crsdef[crs_code],
          {
            resolutions: [320, 160, 80, 40, 20, 10, 5, 2, 1] 
          }
        ),
        dragging: true,
        zoomControl: false
      });
      L.control
        .zoom({
          position: "bottomright"
        })
        .addTo(this.map);
        //   this.wmslayer = L.tileLayer
        // .wms(this.terrain.wmsUrl, {
        //   className: "terrain-wms",
        //   layers: "uploadcontour",
        //   format: "image/png",
        //   transparent: true,
        //   timestamp: Date.parse(new Date())
        // })
        // .addTo(this.map);
        this.wmslayer = L.tileLayer
        .wms(this.terrain.wmsUrl, {
          layers: "uploadcontour",
          format: "image/png",
          transparent: true
        })
        .addTo(this.map);
        }else{
          this.wmslayer = L.tileLayer
          .wms(this.terrain.wmsUrl, {
            className: "terrain-wms",
            layers: "contour",
            transparent: true,
            format: "image/png",
            timestamp: Date.parse(new Date()) //添加自定义参数，避免使用更新前的地图缓存
          })
          .addTo(this.map);
        }
        
        
        this.map.fitBounds(this.terrain.leafLetCor, {
          paddingTopLeft: [-30, -30]
        });
        this.wmsBorder = L.rectangle(this.terrain.leafLetCor, {
          color: "rgba(43, 103, 139, .4)",
          weight: 1
        }).addTo(this.map);

        this.curLayer.push("terrain");
      }
    },
    // 添加粗糙度 图层
    setRoughnessLayer() {
      if (this.roughnessLayer) {
        this.roughnessLayer.addTo(this.map);
        this.curLayer.push("roughness");
        return;
      }
      if (this.roughness && this.roughness.roughnessInfo) {
        let roughnessInfo = JSON.parse(this.roughness.roughnessInfo);
        if (roughnessInfo.type == "FeatureCollection") {
          this.roughnessLayer = L.geoJSON(roughnessInfo, {
            style: () => {
              return {
                color: "#a588ff",
                weight: 1,
                opacity: 0.8
              };
            }
          });
          this.roughnessLayer.addTo(this.map);
          this.curLayer.push("roughness");
          // this.map.fitBounds(this.roughnessLayer.getBounds())
        }
      } else {
        this.getFileRoughness();
      }
    },
    // 坐标转换至leaflet(输出是lat, lng)
    coorToLeaflet(lnglat) {
      return proj4(
        crsdef["EPSG:" + this.epsgNum],
        leafletProj,
        lnglat
      ).reverse();
    },
    // 坐标转换至投影系坐标(输出是lng, lat)
    coorToProjection(latLng) {
      return proj4(
        leafletProj,
        crsdef["EPSG:" + this.epsgNum],
        latLng.reverse()
      );
    },
    // 获取兴趣区域投影坐标
    areaCoor([beginLog, endLog]) {
      //绘制的矩形经纬度（投影系）
      let start = this.coorToProjection(beginLog);
      let end = this.coorToProjection(endLog);
      return {
        start_x: start[0],
        start_y: start[1],
        end_x: end[0],
        end_y: end[1]
      };
    },
    // 绘制点
    drawPoint(type, latlng, index) {
      let vm = this;
      vm.restoreIcon().then(() => {
        if (this[type + "Markers"].length === 0) return;
        let i = index !== undefined ? index : this.curPointIndex;
        this[type + "Markers"][i].remove();
        let mark = L.marker(latlng, {
          icon: vm.setDivIcon(
            vm[type + "List"][i].tag,
            type + (index !== undefined ? "" : "A")
          ),
          title: vm[type + "List"][i].tag,
          zIndexOffset: 1000
        })
          .on(vm.getMarkerOnEvent())
          .addTo(this.map);
        this[type + "Markers"][i] = mark;
      });
    },
    getMarkerOnEvent() {
      let vm = this;
      return {
        // 'mouseover': () => {
        //   vm.map.dragging.disable()
        // },
        mousedown: () => {
          vm.mouseHandleEle = "marker";
        },
        // 'mouseout': () =>{
        //   vm.map.dragging.enable()
        // },
        mouseup: () => {
          vm.mouseHandleEle = "";
        }
      };
    },
    setDivIcon(tag, name) {
      return L.divIcon({
        // html:
        //   "<div class='div-icon'><label>"+ tag +"</label><img src='/icon/"+name+".png' style='width: 24px;height: 30px;'/></div>",
        html:
          "<div class='div-icon'><img src='/icon/m-" +
          name +
          ".png' style='width: 24px;height: 30px;'/><label>" +
          tag +
          "</label></div>",
        iconSize: [24, 30],
        iconAnchor: [12, 28]
      });
    },
    // 设置当前激活状态的点索引
    setCurEditPoint(type, pointIndex) {
      this.layerShow[type] = true;
      this.restoreIcon().then(() => {
        this.editMode = type;
        this.curPointIndex = pointIndex;
        this[type + "Markers"][pointIndex]
          .setIcon(
            this.setDivIcon(
              this[type + "List"][this.curPointIndex].tag,
              type + "A"
            )
          )
          .setZIndexOffset(1000);
      });
    },
    // 恢复之前高亮点样式
    restoreIcon() {
      let p = new Promise(resolve => {
        this.mastMarkers.forEach(v => {
          v.setIcon(this.setDivIcon(v.options.title, "mast")).setZIndexOffset(
            1
          );
        });
        this.wtMarkers.forEach(v => {
          v.setIcon(this.setDivIcon(v.options.title, "wt")).setZIndexOffset(1);
        });
        resolve();
      });
      return p;
    },
    // 父组件修改坐标触发地图点位置更新
    movePoint(type, pointIndex) {
      this.drawPoint(
        type,
        this.coorToLeaflet([
          this[type + "List"][pointIndex].x,
          this[type + "List"][pointIndex].y
        ]),
        pointIndex
      );
    },
    // 绘制测风塔
    drawMast() {
      let vm = this;
      vm.mastMarkers.forEach((v, i) => {
        v.remove();
      });
      vm.mastMarkers = [];
      this.mastList &&
        this.mastList.length &&
        this.mastList.map((v, i) => {
          let mark = L.marker(vm.coorToLeaflet([v.x, v.y]), {
            icon: vm.setDivIcon(v.tag, "mast"),
            title: v.tag,
            riseOnHover: true
          })
            .on(vm.getMarkerOnEvent())
            .addTo(vm.map);
          vm.mastMarkers.push(mark);
        });
    },
    // 绘制风机
    drawWt() {
      let vm = this;
      vm.wtMarkers.forEach(v => {
        v.remove();
      });
      vm.wtMarkers = [];
      if (this.wtList && this.wtList.length) {
        vm.drawWt100(vm);
      }
    },
    // 绘制风机
    drawWt100(vm) {
      var idx0 = vm.wtMarkers.length;
      var idx1 = Math.min(idx0 + 100, vm.wtList.length);
      for (var i = idx0; i < idx1; i++) {
        let v = vm.wtList[i];
        if (!v) {
          continue;
        }
        let mark = L.marker(vm.coorToLeaflet([v.x, v.y]), {
          icon: vm.setDivIcon(v.tag, "wt"),
          title: v.tag,
          riseOnHover: true
        })
          .on(vm.getMarkerOnEvent())
          .addTo(vm.map);
        vm.wtMarkers.push(mark);
      }
      if (vm.wtMarkers.length < vm.wtList.length) {
        // 释放CPU 100ms 避免2000个点位等数量超多100%占用, 暂时撤销修改，原有不明，修改无效
        setTimeout(() => {
          vm.drawWt100(vm);
        }, 100);
      }
    },
    // 地图中的marker点击事件
    markerClick(type, i) {
      /*if(this.editMode == 'rect') return;
        this.editMode = type
        let vm = this;
        vm.restoreIcon().then(()=>{
          // vm[type+'Markers'][i].setIcon(L.icon({
          //   iconUrl: '/icon/'+type+'A.png',
          // }))
          vm[type+'Markers'][i].setIcon(this.setDivIcon(vm[type+'List'][i].tag, type+'A'))
          vm.editMode = type;
          vm.curPointIndex = i;
          vm.$emit('setActiveMarker', type, i)
        });*/
    },
    // 绘制多区域
    drawRect1() {
      for (let index = 0; index < this.angles.length; index++) {
        this.groups[index] && this.groups[index].remove();
        let bounds = [
          this.coorToLeaflet([
            this.angles[index].minX,
            this.angles[index].maxY
          ]),
          this.coorToLeaflet([this.angles[index].maxX, this.angles[index].minY])
        ];

        let rectangle = L.rectangle(bounds, {
          color: "#009FFF",
          weight: 2,
          fillColor: "#002C46"
        });
        this.groups[index] = rectangle;
        this.map.addLayer(this.groups[index]);

        this.addRectNote1(index, rectangle);
        this.drawCircle1(index, false, rectangle);
      }
    },
    // 绘制区域
    drawRect(index = null) {
      if (index === null) {
        this.rectangle && this.rectangle.remove();
        if (!this.mesh.minX) return;
        let bounds = [
          this.coorToLeaflet([this.mesh.minX, this.mesh.maxY]),
          this.coorToLeaflet([this.mesh.maxX, this.mesh.minY])
        ];
        this.rectangle = L.rectangle(bounds, {
          color: "#009FFF",
          weight: 2,
          fillColor: "#002C46"
        });
        this.map.addLayer(this.rectangle);
        this.addRectNote();
        this.drawCircle(false, null);
      } else {
        this.groups[index] && this.groups[index].remove();
        let bounds = [
          this.coorToLeaflet([
            this.angles[index].minX,
            this.angles[index].maxY
          ]),
          this.coorToLeaflet([this.angles[index].maxX, this.angles[index].minY])
        ];
        let rectangle = L.rectangle(bounds, {
          color: "#009FFF",
          weight: 2,
          fillColor: "#002C46"
        });
        this.groups[index] = rectangle;
        this.map.addLayer(this.groups[index]);
        this.addRectNote1(index, rectangle);
        this.drawCircle1(index, false, rectangle);
      }
    },
    // 给兴趣区域添加说明
    addRectNote1(index = null, rectangle = null) {
      let vm = this;

      let bounds = rectangle.getBounds();
      let w = Number(
        this.map
          .distance(bounds._northEast, [
            bounds._northEast.lat,
            bounds._southWest.lng
          ])
          .toFixed(1)
      );
      let h = Number(
        this.map
          .distance(bounds._northEast, [
            bounds._southWest.lat,
            bounds._northEast.lng
          ])
          .toFixed(1)
      );
      this.notes[index] || (this.notes[index] = {});
      this.notes[index] &&
        this.notes[index].rectNoteW &&
        this.notes[index].rectNoteW.remove();
      this.notes[index] &&
        this.notes[index].rectNoteH &&
        this.notes[index].rectNoteH.remove();
      // if (w < this.cfd.minRectLength || h < this.cfd.minRectLength) {
      //   this.rectLessThanMin = true;
      // } else {
      //   this.rectLessThanMin = false;
      // }
      this.notes[index].rectNoteW = L.marker(
        [
          bounds._northEast.lat,
          (bounds._southWest.lng + bounds._northEast.lng) / 2
        ],
        {
          icon: L.divIcon({
            className: "rect-note-w",
            html: "<p>" + vm.distanceFormat(w) + "</p>"
          })
        }
      ).addTo(this.map);
      this.notes[index].rectNoteH = L.marker(
        [
          (bounds._northEast.lat + bounds._southWest.lat) / 2,
          bounds._northEast.lng
        ],
        {
          icon: L.divIcon({
            className: "rect-note-h",
            html: "<p> " + vm.distanceFormat(h) + "</p>"
          })
        }
      ).addTo(this.map);
    },
    // 给兴趣区域添加说明
    addRectNote(rectangle = null) {
      let vm = this;
      if (vm.ind === null) {
        let bounds = this.rectangle.getBounds();
        let w = Number(
          this.map
            .distance(bounds._northEast, [
              bounds._northEast.lat,
              bounds._southWest.lng
            ])
            .toFixed(1)
        );
        let h = Number(
          this.map
            .distance(bounds._northEast, [
              bounds._southWest.lat,
              bounds._northEast.lng
            ])
            .toFixed(1)
        );
        this.rectNoteW && this.rectNoteW.remove();
        this.rectNoteH && this.rectNoteH.remove();
        // if (w < this.cfd.minRectLength || h < this.cfd.minRectLength) {
        //   this.rectLessThanMin = true;
        // } else {
        //   this.rectLessThanMin = false;
        // }
        this.rectNoteW = L.marker(
          [
            bounds._northEast.lat,
            (bounds._southWest.lng + bounds._northEast.lng) / 2
          ],
          {
            icon: L.divIcon({
              className: "rect-note-w",
              html: "<p>" + vm.distanceFormat(w) + "</p>"
            })
          }
        ).addTo(this.map);
        this.rectNoteH = L.marker(
          [
            (bounds._northEast.lat + bounds._southWest.lat) / 2,
            bounds._northEast.lng
          ],
          {
            icon: L.divIcon({
              className: "rect-note-h",
              html: "<p> " + vm.distanceFormat(h) + "</p>"
            })
          }
        ).addTo(this.map);
      } else {
        let bounds = rectangle.getBounds();
        let w = Number(
          this.map
            .distance(bounds._northEast, [
              bounds._northEast.lat,
              bounds._southWest.lng
            ])
            .toFixed(1)
        );
        let h = Number(
          this.map
            .distance(bounds._northEast, [
              bounds._southWest.lat,
              bounds._northEast.lng
            ])
            .toFixed(1)
        );
        this.notes[this.ind] || (this.notes[this.ind] = {});
        this.notes[this.ind] &&
          this.notes[this.ind].rectNoteW &&
          this.notes[this.ind].rectNoteW.remove();
        this.notes[this.ind] &&
          this.notes[this.ind].rectNoteH &&
          this.notes[this.ind].rectNoteH.remove();
        // if (w < this.cfd.minRectLength || h < this.cfd.minRectLength) {
        //   this.rectLessThanMin = true;
        // } else {
        //   this.rectLessThanMin = false;
        // }
        this.notes[this.ind].rectNoteW = L.marker(
          [
            bounds._northEast.lat,
            (bounds._southWest.lng + bounds._northEast.lng) / 2
          ],
          {
            icon: L.divIcon({
              className: "rect-note-w",
              html: "<p>" + vm.distanceFormat(w) + "</p>"
            })
          }
        ).addTo(this.map);
        this.notes[this.ind].rectNoteH = L.marker(
          [
            (bounds._northEast.lat + bounds._southWest.lat) / 2,
            bounds._northEast.lng
          ],
          {
            icon: L.divIcon({
              className: "rect-note-h",
              html: "<p> " + vm.distanceFormat(h) + "</p>"
            })
          }
        ).addTo(this.map);
      }
    },
    distanceFormat(distance) {
      if (distance > 1000) {
        let num = String(distance / 1000);
        let index = num.indexOf(".");
        return Number(num.substring(0, index + 2)) + "km";
      } else {
        return distance + "m";
      }
    },
    // 绘制加密区圆
    drawCircle1(index, isUp, rectangle) {
      
      // let bounds = this.rectangle.getBounds();
      // let center = this.rectangle.getCenter();
      // let r = this.map.distance(bounds._northEast, bounds._southWest) / 2;
      if (rectangle&&rectangle.getBounds()._southWest.lng&&rectangle.getBounds()._southWest.lat) {
        this.heartslng[index] = rectangle.getBounds()._northEast.lng;
        this.heartslat[index] = rectangle.getBounds()._northEast.lat;
        this.heartsmlng[index] = rectangle.getBounds()._southWest.lng;
        this.heartsmlat[index] = rectangle.getBounds()._southWest.lat;
      }
      let maxlng = Math.max(...this.heartslng);
      let maxlat = Math.max(...this.heartslat);
      let minlng = Math.min(...this.heartsmlng);
      let minlat = Math.min(...this.heartsmlat);
      if(!isFinite(maxlng)||!isFinite(maxlat)||!isFinite(minlng)||!isFinite(minlat)){
        return;
      }
      //画最大的矩形
      this.maxRectangle && this.maxRectangle.remove();
       let bounds = L.latLngBounds(L.latLng(maxlat, maxlng), L.latLng(minlat, minlng));
        this.maxRectangle = L.rectangle(bounds, {
          color: "#FF4640",
          weight: 1,
          fillColor: "white",
          dashArray: "4, 3"
        });
        this.map.addLayer(this.maxRectangle);
        //
      let h = Number(
        this.map
          .distance(L.latLng(maxlat, maxlng), L.latLng(minlat, maxlng))
          .toFixed(1)
      );
      let w = Number(
        this.map
          .distance(L.latLng(maxlat, maxlng), L.latLng(maxlat, minlng))
          .toFixed(1)
      );
      if (w < this.cfd.minRectLength || h < this.cfd.minRectLength) {
        this.rectLessThanMin = true;
      } else {
        this.rectLessThanMin = false;
      }
      let heart = L.latLngBounds(
        L.latLng(maxlat, maxlng),
        L.latLng(minlat, minlng)
      ).getCenter();
      let heartR =
        this.map.distance(L.latLng(maxlat, maxlng), L.latLng(minlat, minlng)) /
        2;

      this.drawGreatCircle(heart, heartR, isUp);
    },
    // 绘制加密区圆
    drawCircle(isUp, rectangle) {
      if (rectangle&&rectangle.getBounds()._southWest.lng&&rectangle.getBounds()._southWest.lat) {
        this.heartslng[this.ind] = rectangle.getBounds()._northEast.lng;
        this.heartslat[this.ind] = rectangle.getBounds()._northEast.lat;
        this.heartsmlng[this.ind] = rectangle.getBounds()._southWest.lng;
        this.heartsmlat[this.ind] = rectangle.getBounds()._southWest.lat;
      }
      let maxlng = Math.max(...this.heartslng);
      let maxlat = Math.max(...this.heartslat);
      let minlng = Math.min(...this.heartsmlng);
      let minlat = Math.min(...this.heartsmlat);
      //画最大的矩形
      this.maxRectangle && this.maxRectangle.remove();
        let bounds = L.latLngBounds(L.latLng(maxlat, maxlng), L.latLng(minlat, minlng));
         this.maxRectangle = L.rectangle(bounds, {
          color: "#FF4640",
          weight: 1,
          fillColor: "white",
          dashArray: "4, 3"
        });
        this.map.addLayer(this.maxRectangle);
        //


      let h = Number(
        this.map
          .distance(L.latLng(maxlat, maxlng), L.latLng(minlat, maxlng))
          .toFixed(1)
      );
      let w = Number(
        this.map
          .distance(L.latLng(maxlat, maxlng), L.latLng(maxlat, minlng))
          .toFixed(1)
      );
      if (w < this.cfd.minRectLength || h < this.cfd.minRectLength) {
        this.rectLessThanMin = true;
      } else {
        this.rectLessThanMin = false;
      }
      let heart = L.latLngBounds(
        L.latLng(maxlat, maxlng),
        L.latLng(minlat, minlng)
      ).getCenter();
      let heartR =
        this.map.distance(L.latLng(maxlat, maxlng), L.latLng(minlat, minlng)) /
        2;

      this.drawGreatCircle(heart, heartR, isUp);
    },
    // 绘制计算区圆
    drawGreatCircle(center, r, isUp) {
      let R = r * 1.2 * Math.sqrt(2);
      let Dleft = this.map.distance(center, [
        center.lat,
        this.terrain.leafLetCor[0][1]
      ]);
      let DRight = this.map.distance(center, [
        center.lat,
        this.terrain.leafLetCor[1][1]
      ]);
      let DTop = this.map.distance(center, [
        this.terrain.leafLetCor[0][0],
        center.lng
      ]);
      let DBtm = this.map.distance(center, [
        this.terrain.leafLetCor[1][0],
        center.lng
      ]);
      let minD = Math.min(Dleft, DRight, DTop, DBtm);
      this.greatCircle && this.greatCircle.remove();
      this.greatCircle = L.circle(center, {
        radius: R,
        color:
          (R - this.safeDistance > minD && "#ff0000") ||
          (R > minD && "#ff5b00") ||
          "#333",
        weight: 1,
        fill: false,
        dashArray: "4, 3"
      }).addTo(this.map);

      if (isUp && R - this.safeDistance > minD) {
        let boud = this.greatCircle.getBounds();
      }
      (R - this.safeDistance > minD && (this.rectOverflow = true)) ||
        (this.rectOverflow = false);

      let bounds = this.greatCircle.getBounds();
      this.calArea && this.calArea.remove();
      this.calArea = L.marker(
        [
          bounds._northEast.lat,
          (bounds._southWest.lng + bounds._northEast.lng) / 2
        ],
        {
          icon: L.divIcon({
            className: "cal-area",
            html: "<p>计算区</p>"
          })
        }
      ).addTo(this.map);
    },
    mapRedraw() {
      this.drawMast();
      this.drawWt();
      this.drawRect1();
    },
    toggleLayer(type) {
      let vm = this;
      this.layerShow[type] = !this.layerShow[type];
      if (!this.layerShow[type]) {
        if (type === "rect") {
          // vm.rectangle && vm.rectangle.remove();
          // // vm.circle && vm.circle.remove();
          // vm.greatCircle && vm.greatCircle.remove();
          // vm.calArea && vm.calArea.remove();
          // this.rectNoteW && this.rectNoteW.remove();
          // this.rectNoteH && this.rectNoteH.remove();
          vm.groups.forEach((v,index) => {
              v.remove();
              vm.notes[index].rectNoteW.remove();
              vm.notes[index].rectNoteH.remove();
            });
            vm.maxRectangle.remove();
            vm.greatCircle.remove();
            vm.calArea.remove();
          // vm.groups[vm.ind] && vm.groups[vm.ind].remove();
        } else {
          if (type === "mast") {
            vm.mastMarkers.forEach(v => {
              v.remove();
            });
          } else {
            vm.wtMarkers.forEach(v => {
              v.remove();
            });
          }
        }
      } else {
        if (type === "rect") {
          vm.groups.forEach((v,index) => {
              v.addTo(vm.map);
              vm.notes[index].rectNoteW.addTo(vm.map);
              vm.notes[index].rectNoteH.addTo(vm.map);
            });
          vm.maxRectangle.addTo(vm.map);
          vm.greatCircle.addTo(vm.map);
          vm.calArea.addTo(vm.map);
        } else {
          if (type === "mast") {
            vm.mastMarkers.forEach(v => {
              v.addTo(vm.map);
            });
          } else {
            vm.wtMarkers.forEach(v => {
              v.addTo(vm.map);
            });
          }
        }
      }
    },
    //若该图层隐藏，则修改状态为显示
    showLayer(type, index) {
      !this.layerShow[type] && this.toggleLayer(type);
      this.ind = index;
    },
    mouseover(type, index, tag) {
      this[type + "Markers"][index] &&
        this[type + "Markers"][index]
          .setIcon(this.setDivIcon(tag, type + "A"))
          .setZIndexOffset(1000);
    },
    mouseout(type, index, tag) {
      this[type + "Markers"][index] &&
        this[type + "Markers"][index]
          .setIcon(this.setDivIcon(tag, type))
          .setZIndexOffset(1);
    },
    //删除框选区域
    delRect(index) {
      this.groups[index] &&
        this.groups[index].remove() &&
        this.groups.splice(index, 1);
      this.notes[index] &&
        this.notes[index].rectNoteW &&
        this.notes[index].rectNoteW.remove();
      this.notes[index] &&
        this.notes[index].rectNoteH &&
        this.notes[index].rectNoteH.remove() &&
        this.notes.splice(index, 1);
      this.heartslat.splice(index, 1);
      this.heartslng.splice(index, 1);
      this.heartsmlat.splice(index, 1);
      this.heartsmlng.splice(index, 1);
      this.drawCircle1();
    }
  },
  watch: {
    mapEditMode(n, old) {
      this.editMode = n;
      if (!n || n == "rect") {
        this.curPointIndex = "";
        this.restoreIcon();
      }
    },
    mapH(n) {    
      this.height = n;
      this.backStyle.height = n + "px";
    },
   
    roughness(v) {
      if (!(this.roughness && Object.keys(this.roughness).length)) {
        if (this.curLayer.includes("roughness")) {
          this.roughnessLayer && this.roughnessLayer.remove();
          this.curLayer.splice(this.curLayer.indexOf("roughness"), 1);
        }
        this.roughnessLayer = "";
      }
    }
  }
};
</script>

<style lang="less" rel="stylesheet/less">
.map-container.small {
  /*width: 630px;*/
  width: 100%;
  position: relative;
  background-color: #034972;
  border: 1px solid #2b678b;
  /*.action-button{*/
  /*position: relative;*/
  /*left: 0;*/
  /*top: 0;*/
  /*}*/
  &.crosshair {
    * {
      cursor: crosshair;
    }
    .leaflet-marker-icon {
      .div-icon > * {
        cursor: auto;
      }
    }
  }
  &.pointer {
    * {
      cursor: pointer;
      /*cursor: url("/icon/position.ico"), pointer;*/
    }
  }
  .rectangle {
    position: absolute;
    top: 0;
    left: 0;
  }
  .map-block {
    overflow: hidden;
    position: relative;
  }
  .top-icon,
  .bottom-icon {
    .iconfont {
      line-height: 24px;
      font-size: 24px;
      color: #fff;
      cursor: pointer;
    }
  }
  .back-img {
    width: 660px;
    height: 495px;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: contain;
    z-index: 10000;
  }
  #canvas {
    position: absolute;
  }

  .mark-change {
    position: absolute;
    right: 5px;
    top: 9px;
    width: 28px;
    height: 84px;
    background-color: rgba(0, 44, 70, 1);
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
    z-index: 500;
    i {
      position: relative;
      width: 28px;
      height: 28px;
      background-color: rgba(0, 44, 70, 1);
      text-align: center;
      line-height: 28px;
      cursor: pointer;
      &:not(:last-child):after {
        content: "";
        position: absolute;
        left: 5px;
        bottom: 0;
        width: 18px;
        border-top: 1px solid #2b678b;
      }
      &.active {
        color: @highColor;
      }
    }
    img {
      width: 14px;
      height: 14px;
      margin-top: 6px;
      &.dixing {
        margin-top: 7px;
        height: 15px;
      }
    }
  }
  .layer-change {
    position: absolute;
    right: 5px;
    bottom: 26px;
    width: 90px;
    height: 40px;
    background-color: rgba(0, 44, 70, 0.7);
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
    z-index: 500;
    div {
      width: 50%;
      height: 40px;
      padding-top: 4px;
      float: left;
      cursor: pointer;
    }
    &:before,
    &:after {
      display: table-cell;
      clear: both;
      content: "";
    }
    span {
      display: inline-block;
      transform: scale(0.8);
    }
    i {
      display: block;
      font-size: 14px;
      line-height: 14px;
      text-align: center;
      margin-bottom: 2px;
    }
    .active {
      color: @highColor;
      border: 1px solid @highColor;
    }
  }
  .info {
    position: absolute;
    left: 0;
    bottom: 0;
    width: calc(100% - 40px);
    height: 24px;
    padding: 0 18px;
    line-height: 24px;
    font-size: 12px;
    font-weight: 300;
    color: #333;
    text-shadow: 0px 0px 3px rgb(255, 255, 255);
    z-index: 501;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .zoom-btn {
    position: absolute;
    right: 5px;
    bottom: 110px;
    background-color: @sideBlack;
    width: 28px;
    border-radius: 2px;
    i {
      position: relative;
      width: 28px;
      height: 28px;
      color: @highColor;
      text-align: center;
      line-height: 28px;
      cursor: pointer;
      &:first-child:after {
        content: "";
        position: absolute;
        left: 5px;
        bottom: 0;
        width: 18px;
        border-top: 1px solid #2b678b;
      }
    }
  }
  .leaflet-right {
    right: 5px;
  }
  .leaflet-bottom {
    bottom: 6px;
  }
  .leaflet-control-zoom {
    margin: 0;
    a,
    a:hover {
      display: block;
      width: 28px !important;
      height: 28px !important;
      line-height: 28px !important;
      color: @highColor !important;
      font-size: 18px;
      background-color: @sideBlack !important;
      &:first-child:after {
        width: 18px;
        left: 5px;
        border-top: 1px solid #2b678b;
      }
      &.leaflet-disabled {
        color: rgba(255, 255, 255, 0.4) !important;
        cursor: not-allowed;
      }
    }
  }
  .marker-title {
    .leaflet-popup-content-wrapper,
    .leaflet-popup-tip {
      background-color: transparent;
      box-shadow: none;
      color: #333;
      text-align: center;
      text-shadow: 0px 0px 3px #fff;
    }
  }
  .leaflet-div-icon {
    background-color: transparent;
    border-color: transparent;
    text-align: center;
    label {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 60px;
      text-align: left;
      margin-top: -20px;
      margin-left: 20px;
      text-shadow: 0 0 3px #fff;
    }
  }
  .rect-note-w,
  .cal-area {
    width: 100px !important;
    height: 20px !important;
    text-align: center;
    text-shadow: 0 0 3px #fff;
    margin-left: -50px !important;
    margin-top: -19px !important;
  }
  .cal-area {
    margin-top: 8px !important;
    /*color: @error;*/
    font-size: 16px;
  }
  .rect-note-h {
    margin-left: 5px !important;
  }
}
</style>
