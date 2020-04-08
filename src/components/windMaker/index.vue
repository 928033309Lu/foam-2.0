<template>
  <div
    class="maker"
    v-loading="loading"
    element-loading-spinner="aa"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    
  >
    <div v-if='loading' class='water-waves'>
      <span>{{uploadRate}}%</span>
      <div class='water-wave1'></div>
      <div class='water-wave2'></div>
      <div class='water-wave3'></div>
    </div>
    <div class="china" id="china"></div>
    <div class="top-right" v-show="show">
      <div>图层显示控制</div>
      <el-checkbox v-model="checked1" @change="switch_layer('contour',checked1)">高精度等高线</el-checkbox>
      <br>
      <el-checkbox v-model="checked2" @change="switch_layer('bg',checked2)">背景数据</el-checkbox>
    </div>
    <div class="side-form">
      <el-form
        :hide-required-asterisk="true"
        ref="ruleForm"
        size="mini"
        :model="form"
        label-width="100px"
        class="my-form"
        :rules="rules"
      >
        <el-form-item label="坐标系统:" prop="all">
          <!-- <span v-if="valueShow" style="position:absolute;top:0;left:9px;font-size:12px">{{deValue}}</span> -->
          <el-cascader
            placeholder
            style="width:248px"
            v-model="form.all"
            :options="props"
            @change="clearAll"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="等高线数据:" prop="dxf">
          <el-upload
            class="upload-demo"
            ref="upload"
            action
            accept=".dxf,.map"
            :before-upload="preUpload"
            :on-change="handlePreview"
            :http-request="upMap"
            :show-file-list="false"
          >
            <div>
              <el-input
                :title="fileName"
                v-model="fileName"
                style="width:186px;margin-right:10px"
                placeholder="请选择dxf或map文件"
              ></el-input>
              <el-button slot="trigger" size="small" type="primary">浏览</el-button>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div class="title" style="padding-left:26px">
        <span style="margin-right: 4px;">处理方式：</span>
        <el-select
          style="width:248px;margin-bottom:18px"
          size="mini"
          v-model="radio"
          placeholder="请选择"
          @change="jiaoZheng"
        >
          <el-option label="无校正" value="0"></el-option>
          <el-option label="自动校正" value="1"></el-option>
          <el-option label="平移校正" value="2"></el-option>
          <el-option label="控制点校正" value="3"></el-option>
        </el-select>
      </div>
      <div>
        <div class="icons" v-show="radio==2">
          <i class="iconfont iconpingyi" @click="pingYi"></i>
          <i class="iconfont iconshanchu" @click="resetmap"></i>
        </div>
        <div class="icons" v-show="radio==3">
          <i class="iconfont iconiconfontjiantou-copy-down" @click="dianJiaoZheng"></i>
          <i class="iconfont iconshanchu" @click="delDian"></i>
        </div>
        <div class="btns" v-show="radio!=0">
          <!-- <el-button type="primary" @click="submitJIaoZheng(form)">开始校正</el-button> -->
          <el-button type="primary" @click="jiaoZheng1(form)">开始校正</el-button>
          <el-button type="primary" @click="resetJiao">重置</el-button>
        </div>
      </div>
      <div>
        <el-form
          ref="ruleForm1"
          size="mini"
          :model="form1"
          label-width="100px"
          class="my-form"
          :rules="rules1"
        >
          <el-form-item label="缓冲距离:" prop="huanJu">
            <el-select
              @change="submitHuan"
              style="width:248px"
              v-model="form1.huanJu"
              placeholder="请选择"
            >
              <el-option value="10" label="10米"></el-option>
              <el-option value="20" label="20米"></el-option>
              <el-option value="30" label="30米"></el-option>
              <el-option value="40" label="40米"></el-option>
              <el-option value="50" label="50米"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="外扩距离:" prop="waiJu">
            <el-select
              filterable
              allow-create
              default-first-option
              @change="submitWai"
              style="width:248px"
              v-model="form1.waiJu"
              placeholder="请选择"
            >
              <el-option value="1" label="1KM"></el-option>
              <el-option value="2" label="2KM"></el-option>
              <el-option value="3" label="3KM"></el-option>
              <el-option value="4" label="4KM"></el-option>
              <el-option value="5" label="5KM"></el-option>
              <el-option value="6" label="6KM"></el-option>
              <el-option value="7" label="7KM"></el-option>
              <el-option value="8" label="8KM"></el-option>
              <el-option value="9" label="9KM"></el-option>
              <el-option value="10" label="10KM"></el-option>
              <el-option value="11" label="11KM"></el-option>
              <el-option value="12" label="12KM"></el-option>
              <el-option value="13" label="13KM"></el-option>
              <el-option value="14" label="14KM"></el-option>
              <el-option value="15" label="15KM"></el-option>
              <el-option value="16" label="16KM"></el-option>
              <el-option value="17" label="17KM"></el-option>
              <el-option value="18" label="18KM"></el-option>
              <el-option value="19" label="19KM"></el-option>
              <el-option value="20" label="20KM"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="btns">
          <!-- <el-button style="margin-bottom:10px" type="primary" @click="downloadOutline">下载数据轮廓</el-button> -->
          <el-button type="primary" @click="downloadFixData">下载文件</el-button>
          <el-button type="primary" @click="applyProject">应用到项目</el-button>
          <a id="outlineurl_a" href download="outline.map"></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "proj4leaflet";
import "leaflet-polylinedecorator";
import mapSerices from "@/components/windMaker/mapServe.js";
import { crsdef } from "@/config/map.config";
import "./leaflet.ChineseTmsProviders";
import { addZone } from "@/utils/mixin.js";
const windMakerUrl =
  process.env.NODE_ENV === "development" ? "/china" : "/api/china";
export default {
  mixins: [addZone],
  name: "aa",
  data() {
    return {
      uploadRate:0,
      lineGet: null,
      deValue: "",
      valueShow: true,
      projectId: this.$route.params.projectId,
      projectName: "",
      status: "",
      fileName: "",
      level2: [
        {
          value: "xian",
          label: "西安80"
        },
        {
          value: "beijing",
          label: "北京54"
        },
        {
          value: "cgcs",
          label: "CGCS2000"
        }
      ],
      level1: [
        {
          value: "6",
          label: "6度分带"
        },
        {
          value: "3",
          label: "3度分带"
        }
      ],
      props: {},
      fix_basemap_url:
        windMakerUrl +
        "/mapserver/cgi-bin/mapserv?map=/gisdata/map/contourmaps/",
      server_url: "http://52.82.2.121:5500",
      map: null,
      outlineLayer: null,
      drawLayer: null,
      isDraw: false,
      is_shift_adjust: false,
      currentLine: null,
      baseMapLayer: null,
      currentContourMap: null,
      fixBaseMapLayer: null,
      fixContourLayer: null,
      is_cp_adjust: null,
      form: {
        dxf: null,
        all: null,
        jiaoyan: null
      },
      rules: {
        dxf: [{ required: true, message: "必选项", trigger: "change" }],
        all: [{ required: true, message: "必选项", trigger: "change" }]
      },
      form1: {
        huanJu: null,
        waiJu: "10"
      },
      rules1: {
        waiJu: [
          {
            pattern: /^\d+$/,
            message: "必须为整数",
            trigger: "change"
          }
        ]
      },
      zones: [],
      checked1: true,
      checked2: true,
      show: false,
      radio: "0",
      loading: false,
      result:null,
      jiazai:false,//控制要不要缓存
      canrun:true,//如果已经加载过地图了，就不要再加载了
      runMap:true,//离开时还没有运行到添加地图哪里，就先停止，不然找不到那个map的dom
    };
  },
  components: {},
  created() {
    this.props = [
      {
        value: "6",
        label: "6度分带",
        children: [
          {
            value: "xian",
            label: "西安80",
            children: this.getZone("6", "xian")
          },
          {
            value: "beijing",
            label: "北京54",
            children: this.getZone("6", "beijing")
          },
          {
            value: "cgcs",
            label: "CGCS2000",
            children: this.getZone("6", "cgcs")
          }
        ]
      },
      {
        value: "3",
        label: "3度分带",
        children: [
          {
            value: "xian",
            label: "西安80",
            children: this.getZone("3", "xian")
          },
          {
            value: "beijing",
            label: "北京54",
            children: this.getZone("3", "beijing")
          },
          {
            value: "cgcs",
            label: "CGCS2000",
            children: this.getZone("3", "cgcs")
          }
        ]
      }
    ];
  },
  mounted() {
    this.init();
    this.getProjection();
    this.getSinProject(this.projectId);
  },
  methods: {
    preUpload(file) {
      if (file.name.length > 200) {
        this.$message("文件名长度不能超过200个字符");
        return false;
      }
      let dxf = file.name.split('.');
      if(dxf[dxf.length-1]!='dxf' && dxf[dxf.length-1]!='map'){
          this.$message("只支持dxf或map格式的文件");
          return false;
      }
    },
    clearAll() {
      this.valueShow = false;
      this.fileName = "";
      this.form1.huanJu = "";
      if (this.currentContourMap) {
        this.currentContourMap = null;
        this.map.off();
        this.map.remove();
        this.init();
      }
      this.drawLine(this.form.all[2], this.form.all[0]);
    },
    init() {
      this.map = L.map("china", {
        crs: L.CRS.EPSG4326,
        attributionControl: false,
        zoom: 3.6,
        minZoom: 1,
        maxZoom: 18,
        zoomSnap: 0.1,
        zoomControl: false
      }).setView([37, 104]);

      this.map.addControl(L.control.zoom({ position: "bottomright" }));

      // this.map.on("contextmenu", function(e) {
      //   return;
      // });
      this.baseMapLayer = L.tileLayer
        .wms(
          "http://gis-internet-server-nx-472631219.cn-northwest-1.elb.amazonaws.com.cn/mapcache_global?",
          {
            layers: "srtmchina_contour_84"
          }
        )
        .addTo(this.map);
      //城市标注
      let layer = L.tileLayer.chinaProvider(
        "TianDiTuWMTS4326.Satellite.Annotion",
        {
          token: "2d02a4bf00cfa355abc3f7f7850dfcc7"
        }
      );
      this.map.addLayer(layer);

      //  layer = L.tileLayer.chinaProvider('TianDiTuWMTS4326.BoundLayer.Map', {
      //     maxZoom: 18,
      //     minZoom: 1,
      //     token: "2d02a4bf00cfa355abc3f7f7850dfcc7"
      // }).addTo(this.map);
    },
    //获取项目度带
    getProjection() {
      this.caculateHttps
        .getProjection(this.$route.params.projectId)
        .then(res => {
          this.form.all = [
            res.projectionSystem.replace(/[^0-9]/gi, ""),
            res.coordinateSystem.replace(/[^a-zA-Z\s]/gi, "").toLowerCase(),
            res.zone.replace(/[^0-9]/gi, "")
          ];
          this.form.all[2] = this.form.all[2] + this.form.all[1];
          this.deValue = this.findZ(this.form.all);
          this.form.jiaoyan = JSON.stringify(this.form.all);

          this.drawLine(this.form.all[2], this.form.all[0]);
        })
        .catch(err => {
          console.log(err);
        });
    },

    getSinProject(projectId) {
      this.projectHttps
        .getSinProject(projectId)
        .then(res => {
          this.projectName = res.projectName;
          this.status = res.status;
        })
        .catch(err => {
          console.log(err);
        });
    },
    findZ(value) {
      let a = this.level1.find(item => {
        return item.value == "3";
      }).label;
      let b = this.level2.find(item => {
        return item.value == value[1];
      }).label;
      let c = `zone ${value[2]}`;
      return `${a} / ${b} / ${c}`;
    },
    getlev2(index) {
      this.level2.map(it => {
        it.sb = index;
      });
      return this.level2;
    },
    getZone(index, re) {
      let arr = [];
      if (index == "6") {
        for (let zone = 13; zone <= 23; zone++) {
          arr.push({ value: zone + re, label: `zone ${zone}` });
        }
      } else if (index == "3") {
        for (let zone = 25; zone <= 45; zone++) {
          arr.push({ value: zone + re, label: `zone ${zone}` });
        }
      }
      return arr;
    },
    handlePreview(file) {
      if (file.name.length > 200) {
        return false;
      }
      let dxf = file.name.split('.');
      if(dxf[dxf.length-1]!='dxf' && dxf[dxf.length-1]!='map'){          
          return false;
      }
      this.fileName = file.name;
      this.form.dxf = file.raw;
    },
    upMap() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          [
            this.form.zone_type,
            this.form.coord_type,
            this.form.zone
          ] = this.form.all;
          this.form.zone = this.form.zone.replace(this.form.coord_type, "");
          this.loading = true;
          this.result=null;
          this.jiazai=true;
          this.canrun=true;
          mapSerices
            .upMap(this.form,{
              headers: {'Content-Type': 'multipart/form-data'},
              onUploadProgress: (e)=> {
                        //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
                        //如果lengthComputable为false，就获取不到e.total和e.loaded
                        if (e.lengthComputable) {
                          
                            var rate = Math.floor((e.loaded / e.total)*100);  //已上传的比例
                            if (rate < 100) {
                                //这里的进度只能表明文件已经上传到后台，但是后台有没有处理完还不知道
                                //因此不能直接显示为100%，不然用户会误以为已经上传完毕，关掉浏览器的话就可能导致上传失败
                                //等响应回来时，再将进度设为100%
                                this.uploadRate = rate;
                            } else {
                                // this.loadingText = '数据解析中，请稍候...';
                            }
                        }
                    }
            })
            .then(result => {
            //  debugger
            this.result=result;
            if(this.runMap){
               this.changeToFixdMap(result);
            }
              
              this.loading = false;
            })
            .catch(error => {
              console.log(error);
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    changeToFixdMap(result) {
      this.map.off();
      this.map.remove();
      var crs_code = "EPSG:" + result.epsg_code;
      var aa = crsdef[crs_code];
      this.map = L.map("china", {
        center: [25.289, 118.192],
        zoom: 1,
        minZoom: 0,
        maxZoom: 8,
        attributionControl: false,
        zoomControl: false,
        crs: new L.Proj.CRS(
          crs_code,
          crsdef[crs_code],
          //'+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=39500000 +y_0=0 +ellps=krass +towgs84=15.8,-154.4,-82.3,0,0,0,0 +units=m +no_defs',
          {
            resolutions: [320, 160, 80, 40, 20, 10, 5, 2, 1] // 3 example zoom level resolutions
          }
        )
      });
      this.canrun=false;
      this.map.addControl(L.control.zoom({ position: "bottomright" }));
      this.currentContourMap = result.map;
      this.fixBaseMapLayer = L.tileLayer.wms(
        this.fix_basemap_url + result.map,
        {
          layers: "hillchina,srtmchina,basecontour",
          format: "image/jpeg",
          transparent: false
        }
      );
      this.fixBaseMapLayer.addTo(this.map);
      this.fixContourLayer = L.tileLayer
        .wms(this.fix_basemap_url + result.map, {
          layers: "uploadcontour",
          format: "image/png",
          transparent: true
        })
        .addTo(this.map);

      this.fixContourLayer.bringToBack();
      this.fixBaseMapLayer.bringToBack();

      this.drawLayer = L.layerGroup();
      this.drawLayer.addTo(this.map);
      this.$refs["ruleForm1"].validate(valid => {
        if (valid) {
          this.refresh_extent(this.currentContourMap, this.form1.waiJu);
        } else {
          console.log("error submit!!");
          return false;
        }
      });

      this.map.fitBounds([
        [result.extent[2], result.extent[0]],
        [result.extent[3], result.extent[1]]
      ]);
      this.bind_map_event();
      this.show = true;
      this.checked1 = true;
      this.checked2 = true;
    },

    refresh_extent(map, outline_width) {
      let _this = this;
      _this.loading = true;
      mapSerices
        .refresh_extent(map, outline_width)
        .then(function(result) {
          _this.loading = false;
          if (result.status == 0) {
            if (_this.outlineLayer) {
              if (_this.map.hasLayer(_this.outlineLayer)) {
                _this.map.removeLayer(_this.outlineLayer);
              }
            }

            var latlngs = [
              [result.outline.miny, result.outline.minx],
              [result.outline.miny, result.outline.maxx],
              [result.outline.maxy, result.outline.maxx],
              [result.outline.maxy, result.outline.minx],
              [result.outline.miny, result.outline.minx]
            ];
            _this.outlineLayer = L.polyline(latlngs, { color: "blue" }).addTo(
              _this.map
            );
          }
        })
        .catch(err => {
          _this.loading = false;
          console.log(err);
        });
    },

    bind_map_event() {
      let _this = this;
      this.map.on("mousedown", function(evt) {
        if (_this.isDraw && evt.originalEvent.button == 0) {
          var pt = evt.latlng;
          if (_this.currentLine) {
            if (_this.is_shift_adjust) {
              _this.isDraw = false;

              // _this.shift_adjust(_this.currentLine.getLatLngs());
              _this.lineGet = _this.currentLine.getLatLngs();

              // _this.drawLayer.clearLayers();
              L.DomUtil.removeClass(_this.map._container, "leaflet-crosshair");
            }
            _this.currentLine = undefined;
          } else {
            _this.currentLine = L.polyline([pt]).addTo(_this.drawLayer);
            _this.currentLine.options.isline = true;
            _this.currentLine_arrow = L.polylineDecorator(_this.currentLine, {
              patterns: [
                {
                  offset: "100%",
                  repeat: 0,
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 10,
                    polygon: false,
                    pathOptions: { stroke: true }
                  })
                }
              ]
            }).addTo(_this.drawLayer);
          }
        }
      });

      this.map.on("mousemove", function(evt) {
        if (_this.isDraw) {
          let pt = evt.latlng;
          if (_this.currentLine) {
            if (_this.currentLine.getLatLngs().length > 0) {
              _this.currentLine.setLatLngs([
                _this.currentLine.getLatLngs()[0],
                pt
              ]);
              _this.currentLine_arrow &&
                _this.currentLine_arrow.setPaths(_this.currentLine);
            }
          }
        }
      });
    },
    shift_adjust(latlngs) {
      var from_local = this.map.options.crs.projection.project(latlngs[0]);
      var to_local = this.map.options.crs.projection.project(latlngs[1]);

      var delta_x = to_local.x - from_local.x;
      var delta_y = to_local.y - from_local.y;

      this.$message("正在进行平移处理...");

      this.shift_adjust_li(this.currentContourMap, delta_x, delta_y);
    },
    shift_adjust_li(map, offsetx, offsety) {
      this.loading = true;
      mapSerices
        .shift_adjust_li(map, offsetx, offsety)
        .then(result => {
          this.loading = false;
          if (result.status == 0) {
            if (this.fixBaseMapLayer) {
              this.fixBaseMapLayer.options.layers =
                "hillchina_fix,srtmchina_fix,basecontour_fix";
              this.fixBaseMapLayer.wmsParams.layers =
                "hillchina_fix,srtmchina_fix,basecontour_fix";
              this.fixBaseMapLayer.redraw();
            }
          }
          this.drawLayer.clearLayers();
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    switch_layer(type, visible) {
      let changeLayer;
      if (type == "bg") {
        changeLayer = this.fixBaseMapLayer;
      } else {
        changeLayer = this.fixContourLayer;
      }
      if (visible) {
        if (!this.map.hasLayer(changeLayer)) {
          this.map.addLayer(changeLayer);
          if (type == "bg") {
            changeLayer.bringToBack();
          }
        }
      } else {
        if (this.map.hasLayer(changeLayer)) {
          this.map.removeLayer(changeLayer);
        }
      }
    },
    //校正
    jiaoZheng() {
      if (this.radio == 1) {
      } else if (this.radio == 2) {
        //平移校正
        let isChecked = this.radio == 2;
        if (!this.currentContourMap) {
          this.$message("请上传等高线数据文件！");
          this.radio = "0";
          return;
        }
        if (this.drawLayer) {
          this.drawLayer.clearLayers();
        }
        this.is_shift_adjust = true;
        this.resetmap();
      } else if (this.radio == 3) {
        //控制点校正
        var isChecked = this.radio == 3;
        if (!this.currentContourMap) {
          this.$message("请上传等高线数据文件！");
          this.radio = "0";
          return;
        }

        if (this.drawLayer) {
          this.drawLayer.clearLayers();
        }
        this.resetmap();
        this.is_shift_adjust = false;
        this.is_cp_adjust = true;
      }
    },
    //按钮校正
    jiaoZheng1(form) {
      if (this.radio == 1) {
        this.auto();
      } else if (this.radio == 2) {
        //平移校正
        this.shift_adjust(this.lineGet);
      } else if (this.radio == 3) {
        //控制点校正
        this.submitJIaoZheng();
      }
    },
    //自动校正
    auto() {
      let is_autoadjust = false;

      let isChecked = this.radio == 1;

      if (!this.currentContourMap) {
        this.radio = "0";
        this.$message("请上传等高线数据文件！");
        return;
      }

      if (this.drawLayer) {
        this.drawLayer.clearLayers();
      }

      this.resetmap();

      if (isChecked) {
        this.loading = true;
        mapSerices
          .autoadjust(this.currentContourMap)
          .then(result => {
            this.loading = false;
            if (result.status == 0) {
              this.$message("自动校正完成！");

              if (this.fixBaseMapLayer) {
                this.fixBaseMapLayer.options.layers =
                  "hillchina_fix,srtmchina_fix,basecontour_fix";
                this.fixBaseMapLayer.wmsParams.layers =
                  "hillchina_fix,srtmchina_fix,basecontour_fix";
                this.fixBaseMapLayer.redraw();
              }

              is_autoadjust = true;
            } else {
              this.loading = false;
              this.$message("自动校正失败，请手动校正！");
              this.radio = null;
              is_autoadjust = false;
            }
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
          });
      } else {
        is_autoadjust = false;
        this.fixBaseMapLayer.options.layers = "hillchina,srtmchina,basecontour";
        this.fixBaseMapLayer.wmsParams.layers =
          "hillchina,srtmchina,basecontour";
        this.fixBaseMapLayer.redraw();
      }
    },
    resetmap() {
      this.fixBaseMapLayer.options.layers = "hillchina,srtmchina,basecontour";
      this.fixBaseMapLayer.wmsParams.layers = "hillchina,srtmchina,basecontour";
      this.fixBaseMapLayer.redraw();

      if (this.drawLayer) {
        this.drawLayer.clearLayers();
      }
    },
    pingYi() {
      if (!this.is_shift_adjust) {
        return;
      }

      if (!this.currentContourMap) {
        return;
      }

      this.isDraw = true;
      L.DomUtil.addClass(this.map._container, "leaflet-crosshair");
      this.resetmap();
    },
    //控制点校正
    dianJiaoZheng() {
      if (!this.is_cp_adjust) {
        return;
      }

      this.is_shift_adjust = false;

      if (!this.currentContourMap) {
        return;
      }

      this.isDraw = !this.isDraw;
      if (this.isDraw) {
        L.DomUtil.addClass(this.map._container, "leaflet-crosshair");
      } else {
        L.DomUtil.removeClass(this.map._container, "leaflet-crosshair");
      }
    },
    //清除点
    delDian() {
      this.currentLine = undefined;
      this.drawLayer.clearLayers();
    },
    //按钮校正
    submitJIaoZheng() {
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件");
        return;
      }

      let layers = this.drawLayer.getLayers();
      let gcps = [];
      for (let index = 0; index < layers.length; index++) {
        if (layers[index].options.isline) {
          const pts = layers[index].getLatLngs();
          gcps.push([pts[0].lat, pts[0].lng, pts[1].lat, pts[1].lng]);
        }
      }

      if (gcps.length < 3) {
        this.$message("请添加至少3个控制点连接！");
        return;
      }

      //send to server
      this.loading = true;
      mapSerices
        .dianJiao(JSON.stringify(gcps), this.currentContourMap)
        .then(result => {
          this.loading = false;
          if (result.status == 0) {
            if (this.fixBaseMapLayer) {
              this.fixBaseMapLayer.options.layers =
                "hillchina_fix,srtmchina_fix,basecontour_fix";
              this.fixBaseMapLayer.wmsParams.layers =
                "hillchina_fix,srtmchina_fix,basecontour_fix";
              this.fixBaseMapLayer.redraw();
            }

            //clear control points
            this.drawLayer.clearLayers();

            if (this.isDraw) {
              this.isDraw = false;
              L.DomUtil.removeClass(this.map._container, "leaflet-crosshair");
            }
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    //重新校正
    resetJiao() {
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件！");
        return;
      }
      this.resetmap();
    },
    //提交缓冲距离
    submitHuan() {
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件！");
        this.form1.huanJu = null;
        return;
      }

      this.refresh_outline();
    },
    refresh_outline() {
      this.loading = true;
      mapSerices
        .refresh_outline(this.form1.huanJu, this.currentContourMap)
        .then(result => {
          this.loading = false;
          if (result.status == 0) {
            this.fixContourLayer.options.layers =
              "uploadcontour,outline" + this.form1.huanJu;
            this.fixContourLayer.wmsParams.layers =
              "uploadcontour,outline" + this.form1.huanJu;
            this.fixContourLayer.redraw();
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    //提交外扩距离
    submitWai() {
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件！");
        this.form1.huanJu = null;
        return;
      }
      this.$refs["ruleForm1"].validate(valid => {
        if (valid) {
          this.refresh_extent(this.currentContourMap, this.form1.waiJu);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //下载数据轮廓
    downloadOutline() {
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件！");
        return;
      }
      if (this.form1.huanJu > 0) {
        let mapurl =
          "/gis/downloadoutline?map=" +
          this.currentContourMap +
          "&width=" +
          this.form1.huanJu;
        let a = document.getElementById("outlineurl_a");
        a.href = mapurl;
        a.click();
      } else {
        this.$message("请选择缓冲区距离！");
        return;
      }
    },
    downloadFixData() {
      let _this = this;
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件！");
        return;
      }
      if (this.form1.huanJu > 0) {
        this.loading = true;
        mapSerices
          .downloadFixData(_this.form1.huanJu, _this.currentContourMap)
          .then(result => {
            this.loading = false;
            if (result.status == 0) {
              let mapurl =
                "/api/gis/downloadresult?map=" +
                _this.currentContourMap +
                "&width=" +
                _this.form1.huanJu;
              let a = document.getElementById("outlineurl_a");
              a.href = mapurl;
              a.click();
            } else if (result.status == 1) {
              this.$message("请先对等高线进行校正。");
            } else {
              this.$message("插补处理失败，请重试。");
            }
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
          });
      } else {
        this.$message("请选择缓冲区距离");
        return;
      }
    },
    applyProject() {
      if (!this.form1.huanJu) {
        this.$message("请选择缓冲区距离！");
        return;
      }
      if (this.form.jiaoyan != JSON.stringify(this.form.all)) {
        this.$message("当前坐标系统与项目坐标系统不一致，无法应用到项目");
        return;
      }
      if (!this.currentContourMap) {
        this.$message("请上传等高线数据文件！");
        return;
      }
      this.loading = true;
      mapSerices
        .applyProject(this.projectId, this.currentContourMap, this.form1.huanJu)
        .then(result => {
          this.loading = false;
          this.$router.push({
            name: "calculate",
            params: {
              projectId: this.projectId,
              projectName: this.projectName,
              status: this.status
            }
          });
        })
        .catch(error => {
          console.log(error);
          this.loading = false;
        });
    }
  }
};
</script>

<style lang='less'>
@keyframes water-waters {
  0%{
    transform: rotate(0deg);
  }
  100%{
    transform: rotate(360deg)
  }
}
.maker {
  position: relative;
  height: 100%;
  overflow: hidden;
  .water-waves{
    position:absolute;
    top:50%;
    left:50%;
    width: 80px;
    height:80px;
     margin-left:-50px;
     margin-top:-50px;
     border-radius: 50%;
     border:1px solid rgb(36, 15, 226);
     overflow: hidden;
     line-height: 43px;
     color:white;
     text-align: center;
    
    z-index: 2101;
    .water-wave1{
      position:absolute;
      top:50%;
      left:-35%;
      width: 200%;
      height:200%;
      border-radius: 33%;
      animation: water-waters linear infinite;
      animation-duration: 6s;
      background: #044294;
      opacity:0.7;
    }
    .water-wave2{
      position:absolute;
      top:50%;
      left:-35%;
      width: 200%;
      height:200%;
      border-radius: 33%;
      animation: water-waters linear infinite;
      animation-duration: 7s;
      background: rgb(6, 83, 172);
      opacity: 0.5;
    }
    .water-wave3{
      position:absolute;
      top:50%;
      left:-35%;
      width: 200%;
      height:200%;
      border-radius: 33%;
      animation: water-waters linear infinite;
      animation-duration: 11s;
      background: rgb(6, 124, 192);
      opacity: 0.3;
    }
  }
  .my-div-icon {
    font-size: 16px;
    color: #555;
    .a1 {
      position: absolute;
      top: 20px;
      left: -15px;
    }
    .a0 {
      position: absolute;
      bottom: 20px;
      left: -15px;
    }
  }
  .el-button--primary {
    color: @whiteColor;
  }
  .el-input__inner {
    border-radius: 0;
    border-color: #2b678b !important;
  }
  .side-form {
    position: absolute;
    top: 23px;
    right: 17px;
    // width: 338px;
    padding: 20px 20px 10px 0px;

    color: @whiteColor;
    .bor(@highColor);
    z-index: 1000;
    overflow: auto;
    background: url("../../../static/images/leftTop.png") no-repeat left top,
      url("../../../static/images/rightBottom.png") no-repeat right bottom;
    background-color: @sideBlack;
    .el-input__inner {
      background: transparent;
      color: @whiteColor;
      .bor(@inputColor);
    }
    .el-upload-list__item-name {
      width: 100px;
    }
    .el-radio {
      margin-top: 10px;
      color: @whiteColor;
    }
    .el-button {
      background-color: @inputColor;
    }
    .btns {
      margin-top: 10px;
      margin-bottom: 20px;
      text-align: right;
    }
  }
  #china {
    height: 100%;
    background: url("/imgs/grid.png");
    // background: rgba(0, 29, 46, 0.7);
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
  .top-right {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 20px;
    background: @sideBlack;
    color: @whiteColor;
    z-index: 1000;
  }
  .icons {
    width: 200px;
    margin: 0 0 10px 94px;
    .iconfont {
      position: relative;
      padding: 1px 10px;
      font-size: 20px;
      cursor: pointer;

      &::after {
        content: "";
        position: absolute;
        left: 5px;
        top: -2px;
        width: 27px;
        height: 27px;
        z-index: -1;
        background: @inputColor;
        .bor(@inputColor);
      }
      &:hover {
        &::after {
          .bor(@highColor);
        }
        color: red;
      }
    }
  }
}
</style>