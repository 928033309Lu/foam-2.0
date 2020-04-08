<template>
  <div class="srtm" v-loading.fullscreen="loading" element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="address-box">
      <!--<img class="left-top" src="../../static/images/leftTop.png" alt="">-->
      <!--<img class="" src="../../static/images/rightBottom.png" alt="">-->
      <div class="search">
        <label>项目位置:</label>
        <el-input
          class="address-input"
          type="text"
          v-model="address"
          @change="getLocal"
          @keyup.native.enter="getLocal"
          placeholder="请输入地址，便于定位到项目位置"
        ></el-input>
      </div>
      <div class="local">
        <label>坐标系统:</label>
        <!--<span>{{local}}</span>-->
        <el-cascader
          v-model="localValue"
          :options="options"
          :disabled="fileName!=''"
          @change="handleChange"
        ></el-cascader>
      </div>
      <div class="interest-area">
        <label>地图拐点:</label>
        <div class="angle">
          <el-form
            ref="form"
            :model="form"
            label-width="0px"
            class="local-form"
            label-position="right"
            :show-message="false"
            :rules="rules"
          >
            <el-form-item>
              <div class="west-north">
                <label>西北角</label>
                <el-form-item prop="minX" required>
                  <el-input
                    type="text"
                    v-model.trim="form.minX"
                    ref="minX"
                    @blur="drawRect('minX')"
                    @keyup.enter.native="drawRect('minX')"
                    placeholder="X"
                    :disabled="fileName!=''"
                  ></el-input>
                </el-form-item>
                <el-form-item prop="maxY" required>
                  <el-input
                    type="text"
                    v-model.trim="form.maxY"
                    ref="maxY"
                    @blur="drawRect('maxY')"
                    @keyup.enter.native="drawRect('maxY')"
                    placeholder="Y"
                    :disabled="fileName!=''"
                  ></el-input>
                </el-form-item>
              </div>
              <div class="east-south">
                <label>东南角</label>
                <el-form-item prop="maxX" required>
                  <el-input
                    type="text"
                    v-model.trim="form.maxX"
                    ref="maxX"
                    @blur="drawRect('maxX')"
                    @keyup.enter.native="drawRect('maxX')"
                    placeholder="X"
                    :disabled="fileName!=''"
                  ></el-input>
                </el-form-item>
                <el-form-item prop="minY" required>
                  <el-input
                    type="text"
                    v-model.trim="form.minY"
                    ref="minY"
                    @blur="drawRect('minY')"
                    @keyup.enter.native="drawRect('minY')"
                    placeholder="Y"
                    :disabled="fileName!=''"
                  ></el-input>
                </el-form-item>
              </div>
            </el-form-item>
          </el-form>
          <div class="file-text">
            <p class="area">
              <span>区域面积:</span>
              <span :title="area?(area+'平方千米'):''">{{area?(area+'平方千米'):'-'}}</span>
            </p>
            <div class="filename" v-if="srtmFlag || fileName">
              <p>地图文件:</p>
              <p class="file-info">
                <i v-if="!srtmFlag" class="iconfont iconwenjian"></i>
                <span v-if="!srtmFlag" :title="fileName">{{fileName}}</span>
                <span style="width:100%;text-align:left;" v-if="srtmFlag">地图文件生成中，请稍等...</span>
              </p>
            </div>
            <p
              style="color:#FF2E76;"
              v-if="area.indexOf('-')>-1"
            >您生成的地图区域与项目设置的坐标系统位置不一致，后续计算可能会出现偏差，请核实。</p>
          </div>
          <el-footer v-if="!srtmFlag">
            <el-button size="small" type="primary" v-if="fileName" @click="downloadSrtm">下载文件</el-button>
            <el-button v-if="fileName" size="small" type="primary" @click="insertSrtm">应用到项目</el-button>
            <el-button v-if="fileName" size="small" type="primary" @click="reset">清空</el-button>
            <el-button
              v-if="!fileName"
              size="small"
              type="primary"
              @click="chooseHandle"
            >{{isEdit?'取消选择':'选择范围'}}</el-button>
            <el-button
              size="small"
              type="primary"
              v-if="!fileName"
              :class="[(form.maxY&&form.minX&&form.minY&&form.maxX)?'active':'no-allow']"
              @click="submitForm('form')"
            >确定</el-button>
          </el-footer>
        </div>
      </div>
    </div>
    <div id="map" :class="{'default':isEdit}"></div>
  </div>
</template>

<script>
import axios from "axios";
import "./leaflet.ChineseTmsProviders";
import { addZone } from "@/utils/mixin.js";

const windMakerUrl =
  process.env.NODE_ENV === "development" ? "/china" : "/api/china";

export default {
  name: "srtm",
  mixins: [addZone],
  data() {
    var checkLon = (rule, value, callback) => {
      if (!value && value != 0) {
        return callback(new Error("必填字段"));
      }
      setTimeout(() => {
        if (typeof Number(value) != "number") {
          callback(new Error("请输入数字值"));
        } else {
          if (value > 180 || value < -180) {
            callback(new Error("经度必须在0和180度之间"));
          } else {
            callback();
          }
        }
      }, 300);
    };
    var checkLat = (rule, value, callback) => {
      if (!value && value != 0) {
        return callback(new Error("必填字段"));
      }
      setTimeout(() => {
        if (typeof Number(value) != "number") {
          callback(new Error("请输入数字值"));
        } else {
          if (value > 90 || value < -90) {
            callback(new Error("纬度必须在0和90度之间"));
          } else {
            callback();
          }
        }
      }, 300);
    };
    return {
      loading: false,
      address: "",
      map: null,
      rectangle: "",
      rectNoteW: "", // 矩形注释
      rectNoteH: "", // 矩形注释
      flag: false,
      isEdit: false,
      base_map_url: windMakerUrl + "/mapserver/mapcache",
      location: [],
      form: {
        minX: "",
        maxY: "",
        maxX: "",
        minY: ""
      },
      rules: {
        minX: [
          { required: true, message: "不能为空" },
          { validator: checkLon, trigger: "blur" }
        ],
        maxY: [
          { required: true, message: "不能为空" },
          { validator: checkLat, trigger: "blur" }
        ],
        maxX: [
          { required: true, message: "不能为空" },
          { validator: checkLon, trigger: "blur" }
        ],
        minY: [
          { required: true, message: "不能为空" },
          { validator: checkLat, trigger: "blur" }
        ]
      },
      fileName: "",
      area: "",
      local: "",
      srtmFlag: false,
      bounds: [],
      options: [],
      localValue: [],
      epsgNum: "",
      isFisrt: true,
      zoneNum: null,
      localMarker: null
    };
  },
  watch: {},
  computed: {},
  created() {},
  mounted() {
    this.initMap();
    // this.getProjectionSystem();
    this.getAllEarth();
  },
  methods: {
    handleChange(value) {
      this.getZoneNum();
    },
    getAllEarth() {
      this.projectHttps
        .getAllEarth()
        .then(res => {
          this.options=res;
          this.getProjection();
        })
        .catch(err => {
          console.log(err);
        });
    },
    getZoneNum() {
      _.map(this.options, item => {
        if (item.value == this.localValue[0]) {
          _.map(item.children, son => {
            if (son.value == this.localValue[1]) {
              _.map(son.children, s => {
                if (s.value == this.localValue[2]) {
                  this.zoneNum = Number(s.label.split(" ")[1]);

                  this.drawLine(
                    this.zoneNum,
                    parseInt(item.value.replace(/[^0-9]/gi, ""))
                  );
                }
              });
            }
          });
        }
      });
    },
    chooseHandle() {
      this.isEdit = !this.isEdit;
      if (!this.isEdit) {
        this.reset();
      }
    },
    initMap(obj = {}) {
      this.map = L.map("map", {
        crs: L.CRS.EPSG4326,
        center: new L.LatLng(obj.lat || 37, obj.lng || 104),
        zoom: 3.6,
        minZoom: 1,
        maxZoom: 18,
        zoomSnap: 0.1,
        zoomControl: false,
        dragging: true,
        attributionControl: false
      });
      this.baseMapLayer = L.tileLayer
        .wms(
          "http://gis-internet-server-nx-472631219.cn-northwest-1.elb.amazonaws.com.cn/mapcache_global?",
          {
            layers: "srtmchina_contour_84"
          }
        )
        .addTo(this.map);
      let layer = L.tileLayer.chinaProvider(
        "TianDiTuWMTS4326.Satellite.Annotion",
        {
          token: "2d02a4bf00cfa355abc3f7f7850dfcc7"
        }
      );

      this.map.addLayer(layer);
      // layer = L.tileLayer
      //   .chinaProvider("TianDiTuWMTS4326.BoundLayer.Map", {
      //     maxZoom: 18,
      //     minZoom: 1,
      //     token: "2d02a4bf00cfa355abc3f7f7850dfcc7"
      //   })
      //   this.map.addLayer(layer);
      L.control
        .zoom({
          position: "bottomright"
        })
        .addTo(this.map);

      this.addRectangle();
      // this.map.on("movestart", () => {
      //     if (this.localMarker) {
      //         this.localMarker.remove();
      //         this.localMarker = null;
      //         let myIcon = L.icon({
      //             iconUrl: require('../../../public/icon/local.png'),
      //             iconSize: [30, 35]
      //         });
      //         this.localMarker = L.marker([this.location[0], this.location[1]],
      //             {icon: myIcon}
      //         ).addTo(this.map);
      //     }
      // });
      // this.map.on("moveend", () => {
      //     if (this.localMarker) {
      //         this.localMarker.remove();
      //         this.localMarker = null;
      //         let myIcon = L.icon({
      //             iconUrl: require('../../../public/icon/local.png'),
      //             iconSize: [30, 35]
      //         });
      //         this.localMarker = L.marker([this.location[0], this.location[1]],
      //             {icon: myIcon}
      //         ).addTo(this.map);
      //     }
      // });
    },
    //获取项目度带
    getProjection() {
      this.loading = true;
      this.caculateHttps
        .getProjection(this.$route.params.projectId)
        .then(res => {
          this.local =
            res.projectionSystem + " " + res.coordinateSystem + " " + res.zone;
          this.epsgNum = res.epsgNum;
          this.localValue = [
            res.projectionSystem,
            res.coordinateSystem,
            res.epsgNum
          ];
          this.zoneNum = Number(res.zone.split(" ")[1]);

          this.drawLine(
            this.zoneNum,
            parseInt(res.projectionSystem.replace(/[^0-9]/gi, ""))
          );
          this.loading = false;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    //高德接口根据地址返回经纬度 进行定位
    getLocal() {
      let vm = this;
      axios
        .get(
          `https://restapi.amap.com/v3/geocode/geo?key=28ea6b6473d1f3414940138e4546a446&address=${
            this.address
          }`,
          {}
        )
        .then(res => {
          if (res.data.geocodes.length != 0) {
            vm.location = [].concat([
              res.data.geocodes[0].location.split(",")[1],
              res.data.geocodes[0].location.split(",")[0]
            ]);
            if (vm.localMarker) {
              vm.localMarker.remove();
              vm.localMarker = null;
            }
            if (
              vm.location[1] >= vm.lineArr[0] &&
              vm.location[1] <= vm.lineArr[2]
            ) {
              vm.map.setView(vm.location, 10);
            } else {
              let myIcon = L.icon({
                iconUrl: require("../../../public/icon/local.png"),
                iconSize: [29, 51],
                iconAnchor: [14, 46]
              });
              vm.localMarker = L.marker([vm.location[0], vm.location[1]], {
                icon: myIcon
              }).addTo(vm.map);
              vm.map.setView(
                [vm.location[0], (Number(vm.location[1]) + vm.lineArr[1]) / 2],
                4
              );
            }
          } else {
            if (vm.localMarker) {
              vm.localMarker.remove();
              vm.localMarker = null;
            }
            vm.$message.error("请输入更详细地址");
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    drawRect(name) {
      //this.form[name] = this.form[name] && Number(Number(this.form[name]).toFixed(1));
      if (this.form.minX && this.form.maxX && this.form.minX > this.form.maxX) {
        this.$message.error("西北角的X值必须小于东南角的X值");
        return;
      }
      if (this.form.minY && this.form.maxY && this.form.minY > this.form.maxY) {
        this.$message.error("西北角的Y值必须大于东南角的Y值");
        return;
      }
      if (this.rectangle) {
        this.rectangle.remove();
      }
      if (
        this.form.maxY &&
        this.form.minX &&
        this.form.minY &&
        this.form.maxX
      ) {
        let bounds = [
          [this.form.maxY, this.form.minX],
          [this.form.minY, this.form.maxX]
        ];
        this.rectangle = L.rectangle(bounds, {
          color: "#FF2E76",
          weight: 2,
          dashArray: "4",
          fillColor: "rgba(0,44,70,.5)"
        });
        this.map.addLayer(this.rectangle);
        let zoom = this.map.getZoom();
        this.map.setView(
          [
            (Number(this.form.maxY) + Number(this.form.minY)) / 2,
            (Number(this.form.maxX) + Number(this.form.minX)) / 2
          ],
          zoom
        );
        this.addRectNote();
        let boundArr = this.rectangle.getBounds();
        let w = Number(
          this.map
            .distance(boundArr._northEast, [
              boundArr._northEast.lat,
              boundArr._southWest.lng
            ])
            .toFixed(1)
        );
        let h = Number(
          this.map
            .distance(boundArr._northEast, [
              boundArr._southWest.lat,
              boundArr._northEast.lng
            ])
            .toFixed(1)
        );
        if (h < 10000 || w < 10000) {
          this.$alert("边长距离不能小于10公里", "提示", {
            confirmButtonText: "确定",
            type: "warning",
            callback: action => {}
          });
          this.rectNoteW && this.rectNoteW.remove();
          this.rectNoteH && this.rectNoteH.remove();
          this.rectangle.remove();
          return;
        }
        this.bounds = [
          [Number(this.form.maxY), Number(this.form.minX)],
          [Number(this.form.minY), Number(this.form.maxX)]
        ];
        this.geodesicArea();
      }
    },
    addRectangle() {
      let vm = this;
      let beginLog = [];
      let moveLog = [];
      let endLog = [];
      let bounds = [];
      this.map.on({
        mousedown: function(e) {
          if (!vm.isEdit) return;
          if (vm.srtmFlag) return;
          vm.flag = false;
          vm.map.dragging.disable(); //鼠标移入禁止leaflet 拖拽事件
          beginLog = [e.latlng.lat, e.latlng.lng];
        },
        mousemove: function(e) {
          if (!vm.isEdit) return;
          if (vm.srtmFlag) return;
          if (vm.flag) return;
          vm.map.dragging.disable(); //鼠标移入禁止leaflet 拖拽事件
          moveLog = [e.latlng.lat, e.latlng.lng];
          if (beginLog.length == 0) return;
          if (moveLog == beginLog) return;
          vm.rectangle && vm.rectangle.remove();
          bounds = [beginLog, moveLog];
          vm.rectangle = L.rectangle(bounds, {
            color: "#FF2E76",
            weight: 2,
            dashArray: "4",
            fillColor: "rgba(0,44,70,.5)"
          });
          vm.map.addLayer(vm.rectangle);
          vm.addRectNote();
        },
        mouseup: function(e) {
          if (!vm.isEdit) return;
          if (vm.srtmFlag) return;
          vm.flag = true;
          vm.map.dragging.enable(); //鼠标移入禁止leaflet 拖拽事件
          endLog = [e.latlng.lat, e.latlng.lng];
          if (endLog[0] == beginLog[0] && endLog[1] == beginLog[1]) return;
          vm.rectangle.remove();
          bounds = [beginLog, endLog];
          vm.bounds = [].concat(bounds);

          vm.rectangle = L.rectangle(bounds, {
            color: "#FF2E76",
            weight: 2,
            dashArray: "4",
            fillColor: "rgba(0,44,70,.5)"
          });
          vm.map.addLayer(vm.rectangle);
          vm.addRectNote();
          let boundArr = vm.rectangle.getBounds();
          let w = Number(
            vm.map
              .distance(boundArr._northEast, [
                boundArr._northEast.lat,
                boundArr._southWest.lng
              ])
              .toFixed(1)
          );
          let h = Number(
            vm.map
              .distance(boundArr._northEast, [
                boundArr._southWest.lat,
                boundArr._northEast.lng
              ])
              .toFixed(1)
          );
          if (h < 10000 || w < 10000) {
            vm.$alert("边长距离不能小于10公里", "提示", {
              confirmButtonText: "确定",
              type: "warning",
              callback: action => {}
            });
            vm.rectNoteW && vm.rectNoteW.remove();
            vm.rectNoteH && vm.rectNoteH.remove();
            vm.rectangle.remove();
            return;
          }
          vm.form.minX = Math.min(beginLog[1], endLog[1]).toFixed(8);
          vm.form.minY = Math.min(beginLog[0], endLog[0]).toFixed(8);
          vm.form.maxX = Math.max(beginLog[1], endLog[1]).toFixed(8);
          vm.form.maxY = Math.max(beginLog[0], endLog[0]).toFixed(8);
          beginLog = [];
          moveLog = [];
          endLog = [];
          bounds = [];
          vm.geodesicArea();

          if (vm.localMarker) {
            vm.localMarker.remove();
            vm.localMarker = null;
          }
        },
        click: e => {}
      });
    },
    reset() {
      this.form = {
        minX: "",
        maxY: "",
        maxX: "",
        minY: ""
      };
      this.bounds = [];
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
      this.rectNoteW && this.rectNoteW.remove();
      this.rectNoteH && this.rectNoteH.remove();
      this.fileName = "";
      this.area = "";
      this.fileId = "";
      if (this.rectangle) {
        this.rectangle.remove();
      }
    },
    submitForm(formName) {
      if (
        this.form.maxY &&
        this.form.minX &&
        this.form.minY &&
        this.form.maxX
      ) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.generateSrtm();
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      }
    },
    generateSrtm() {
      this.srtmFlag = true;
      this.loading = true;
      let formData = new FormData();
      formData.append("maxX", this.form.maxX);
      formData.append("maxY", this.form.maxY);
      formData.append("minX", this.form.minX);
      formData.append("minY", this.form.minY);
      formData.append("epsg", this.localValue[2]);
      this.caculateHttps
        .generateSrtm(this.$route.params.projectId, formData)
        .then(res => {
          this.getSrtmRecord(res);
        })
        .catch(err => {
          console.log(err);
          this.srtmFlag = false;
          this.loading = false;
        });
    },
    getSrtmRecord(id) {
      this.caculateHttps
        .getSrtmRecord(id)
        .then(res => {
          if (res.isFinish) {
            //this.area = (res.area).toFixed(3);
            this.fileName = res.fileName;
            this.fileId = res.fileId;
            this.srtmFlag = false;
            this.rectangle.remove();
            console.log(this.bounds);
            this.rectangle = L.rectangle(this.bounds, {
              color: "#009FFF",
              weight: 2,
              dashArray: "0"
            });
            this.map.addLayer(this.rectangle);
            this.isEdit = false;
            this.loading = false;
          } else {
            setTimeout(() => {
              this.getSrtmRecord(id);
            }, 5000);
          }
        })
        .catch(err => {
          console.log(err);
          this.srtmFlag = false;
          this.loading = false;
        });
    },
    insertSrtm() {
      if (!this.fileId) return;
      if (this.epsgNum != this.localValue[2]) {
        this.$alert(
          "当前坐标系统与项目坐标系统不一致，无法应用到项目",
          "提示",
          {
            confirmButtonText: "确定",
            type: "warning",
            callback: action => {}
          }
        );
      } else {
        this.insertSrtmHandle();
      }
    },
    insertSrtmHandle() {
      this.loading = true;
      let formData = new FormData();
      formData.append("fileId", this.fileId);
      if (this.isFisrt) formData.append("isOverride", false);
      this.caculateHttps
        .insertSrtm(this.$route.params.projectId, formData)
        .then(res => {
          this.$message({
            message: "成功应用到项目",
            type: "success"
          });
          this.loading = false;
          this.isFisrt = true;
          this.$router.push({
            name: "calculate",
            query: this.$route.query,
            params: this.$route.params
          });
        })
        .catch(err => {
          console.log(err);
          if (err.response.data.code == 400) {
            this.isFisrt = false;
            this.$confirm("此操作将清除现有粗糙度数据，是否继续？", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            })
              .then(() => {
                this.insertSrtmHandle();
              })
              .catch(() => {
                this.isFisrt = true;
              });
          }
          this.loading = false;
        });
    },
    downloadSrtm() {
      this.loading = true;
      this.caculateHttps
        .downloadSrtm(this.$route.params.projectId, this.fileId)
        .then(res => {
          this.createLink(res, this.fileName);
        })
        .catch(err => {
          console.log(err);
          this.createLink(err, this.fileName);
          this.loading = false;
        });
    },
    createLink(blob, fileName) {
      let a = document.createElement("a");
      a.innerHTML = fileName;
      a.download = fileName;
      a.href = URL.createObjectURL(blob);

      document.body.appendChild(a);
      let evt = document.createEvent("MouseEvents");
      evt.initEvent("click", false, false);
      a.dispatchEvent(evt);
      document.body.removeChild(a);
      this.loading = false;
    },
    getProjectionSystem() {
      this.loading = true;
      this.caculateHttps
        .getProjectionSystem()
        .then(res => {
          res.map((item, index) => {
            this.$set(this.options, index, {
              label: item,
              value: item,
              children: []
            });
            this.getCoordinateSystem(item, index);
          });
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    getCoordinateSystem(item, index) {
      this.caculateHttps
        .getCoordinateSystem({ projectionSystem: item })
        .then(res => {
          res.map((son, idx) => {
            this.$set(this.options[index].children, idx, {
              label: son,
              value: son,
              children: []
            });
            this.getProjectionInfo(item, index, son, idx);
          });
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    getProjectionInfo(item, index, son, idx) {
      this.caculateHttps
        .getProjectionInfo({ projectionSystem: item, coordianteSystem: son })
        .then(res => {
          res.map((grandson, grandsonIndex) => {
            this.$set(
              this.options[index].children[idx].children,
              grandsonIndex,
              {
                label: grandson.zone,
                value: grandson.num
              }
            );
          });
          this.getProjection();
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    /**
     * 计算多边形面积，返回单位为平方米
     * @param {Array} latLngs [[lng,lat],[lng,lat]]
     */
    geodesicArea(fixed = 3) {
      let vm = this;
      let latLngs = [];
      latLngs.push([this.bounds[0][1], this.bounds[0][0]]);
      latLngs.push([this.bounds[1][1], this.bounds[0][0]]);
      latLngs.push([this.bounds[1][1], this.bounds[1][0]]);
      latLngs.push([this.bounds[0][1], this.bounds[1][0]]);
      const pointsCount = latLngs.length;
      let area = 0.0;
      const d2r = Math.PI / 180;
      let p1;
      let p2;

      if (pointsCount > 2) {
        for (let i = 0; i < pointsCount; i++) {
          p1 = latLngs[i];
          p2 = latLngs[(i + 1) % pointsCount];
          area +=
            (p2[0] - p1[0]) *
            d2r *
            (2 + Math.sin(p1[1] * d2r) + Math.sin(p2[1] * d2r));
        }
        area = (area * 6378137.0 * 6378137.0) / 2.0;
      }
      vm.area = (Math.abs(area) / 1000000).toFixed(fixed);
    },
    // 给兴趣区域添加说明
    addRectNote() {
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
      this.rectNoteW = L.marker(
        [
          bounds._northEast.lat,
          (bounds._southWest.lng + bounds._northEast.lng) / 2
        ],
        {
          icon: L.divIcon({
            className: "rect-note-ww",
            html: "<p>" + (w / 1000).toFixed(2) + "km</p>"
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
            className: "rect-note-hh",
            html: "<p> " + (h / 1000).toFixed(2) + "km</p>"
          })
        }
      ).addTo(this.map);
    }
  }
};
</script>

<style lang="less">
.srtm {
  width: 100%;
  overflow: hidden !important;
  position: relative;
  color: rgba(255, 255, 255, 0.7);
  .address-box {
    width: 380px;
    position: absolute;
    right: 17px;
    top: 22px;
    z-index: 999;
    padding: 20px 15px 0;
    border: 1px solid @highColor;
    background: url("../../../static/images/leftTop.png") no-repeat left top,
      url("../../../static/images/rightBottom.png") no-repeat right bottom;
    background-color: rgba(0, 44, 70, 0.93);
    .el-form {
      > .el-form-item {
        margin-bottom: 0px;
        position: relative;
        padding-left: 17px;
        &:before {
          width: 7px;
          height: 35px;
          border: 1px solid #2b678b;
          border-right: 0;
          position: absolute;
          left: 3px;
          top: 12px;
        }
      }
    }
    .interest-area {
      > label {
        margin: 10px 0 5px;
      }
      > * {
        display: inline-block;
        vertical-align: top;
      }
      .angle {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        label {
          margin-right: 6px;
        }
        .west-north {
          margin-bottom: 4px;
        }
        .west-north,
        .east-south {
          margin-bottom: 5px;
          .el-form-item {
            display: inline-block;
            margin-bottom: 0;
            &.is-error {
              .el-input__inner {
                border-color: #ff2e76;
              }
            }
          }
        }
      }
      .el-form-item__content {
        line-height: 1;
        .el-input {
          width: 135px;
          margin-right: 4px;
          input {
            height: 28px;
            line-height: 26px;
            background: transparent;
            border: 1px solid #034972;
            color: rgba(255, 255, 255, 0.7);
            border-radius: 0;
            padding: 0 5px;
          }
        }
      }
    }
    .local {
      margin-bottom: 5px;
      label {
        margin-right: 5px;
      }
      .el-cascader {
        width: 280px;
        .el-input__inner {
          height: 28px;
          line-height: 26px;
          border: 1px solid #034972;
          color: rgba(255, 255, 255, 0.7);
          background: transparent !important;
        }
      }
    }
    .search {
      margin-bottom: 5px;
      > label {
        color: rgba(255, 255, 255, 0.7);
        line-height: 32px;
        display: inline-block;
        margin-right: 6px;
        width: 60px;
        text-align: right;
      }
      .address-input {
        width: 280px;
        margin: 0 auto;
        .el-input__inner {
          height: 28px;
          line-height: 26px;
          background: transparent;
          border: 1px solid #034972;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 0;
          padding: 0 5px;
        }
      }
    }
    .file-text {
      margin-top: 10px;
      margin-bottom: 15px;
      .filename {
        margin-top: 5px;
      }
      p {
        display: flex;
        flex-direction: row;
        max-width: 340px;
        span {
          font-size: 14px;
          display: inline-block;
          vertical-align: middle;
          &:first-child {
            width: 60px;
            margin-right: 6px;
            text-align: right;
          }
          &:nth-child(2) {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        &.file-info {
          line-height: 26px;
          padding-left: 15px;
        }
      }
    }
    .el-footer {
      height: 50px !important;
      text-align: right;
      padding: 0;
      .el-button {
        margin: 0 8px 0 0;
        padding: 5px 12px;
        background: rgba(3, 73, 114, 1);
        border-radius: 2px;
        color: rgba(255, 255, 255, 0.7);
        &:last-child {
          margin-right: 0;
        }
        &.active {
          background: rgba(0, 159, 255, 1);
          cursor: pointer;
        }
        &.no-allow {
          background: rgba(3, 73, 114, 1);
          opacity: 0.4;
          cursor: not-allowed;
        }
      }
    }
  }

  .drag {
    font-size: 30px;
    position: absolute;
    left: 13px;
    top: 100px;
    z-index: 999;
    cursor: pointer;
    color: #ccc;
    &.active {
      color: rgb(0, 159, 255);
    }
  }
  #map {
    width: 100%;
    height: 100%;
    /*background: rgba(0, 29, 46, .3);*/
    background: url("../../../public/imgs/grid.png");
    cursor: pointer;
    .leaflet-control-zoom-in,
    .leaflet-control-zoom-out {
      font-size: 14px;
      width: 28px !important;
      height: 29px !important;
      line-height: 28px !important;
      color: @highColor !important;
      background: #002c46 !important;
      &.leaflet-disabled {
        color: #2b678b !important;
      }
    }
    .leaflet-control-container .leaflet-bar a:first-child:after {
      width: 18px !important;
    }
    &.default {
      cursor: default;
      .leaflet-interactive {
        cursor: default;
      }
    }
  }
  .rect-note-ww {
    width: 400px !important;
    margin-top: -20px !important;
    margin-left: -20px !important;
    p {
      color: red;
    }
  }
  .rect-note-hh {
    margin-left: 10px !important;
    p {
      color: red;
    }
  }
  .my-div-icon {
    font-size: 16px;
    color: #333;
    .a1 {
      position: absolute;
      top: 20px;
      left: -15px;
      -webkit-text-stroke: 0.1px #fff;
    }
    .a0 {
      position: absolute;
      bottom: 20px;
      left: -15px;
      -webkit-text-stroke: 0.1px #fff;
    }
  }
}
</style>