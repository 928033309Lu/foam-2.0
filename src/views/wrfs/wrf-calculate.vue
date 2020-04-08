<template>
  <div
    class="directional-calculation"
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="正在保存数据..."
  >
    <el-row class="cal-row" ref="colRow">
      <el-col ref="colLeft" class="col-param empty-form">
        <el-scrollbar :style="{height: (status<2 ? 'calc(100vh - 204px)' : 'calc(100vh - 164px)')}">
          <el-form
            ref="form"
            :model="form"
            label-width="120px"
            class="empty-form form-cont"
            label-position="right"
            :show-message="false"
            :rules="rules"
            :disabled="status > 1"
          >
            <el-select
              v-if="0"
              size="mini"
              v-model="form.style"
              placeholder="常规方式"
              style="margin-bottom: 8px;"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <el-collapse
              ref="collapse"
              v-model="collapse"
              class="has-triangle"
              @change="collapseChange"
            >
              <div @click="curCollapse = 1" :class="{'active': curCollapse===1}">
                <!--<el-collapse-item title="地图文件(必填)" name="1" disabled>-->
                  <!--<div class="form-item">-->
                    <!--<label class="form-item-label">地图文件：</label>-->
                    <!--<upload-map-file-->
                      <!--ref="mapFile"-->
                      <!--:disabled="status > 1"-->
                      <!--@setMapLayer="setMapLayer"-->
                      <!--:path.sync="form.mapFilePath"-->
                      <!--:bucket.sync="form.bucket"-->
                      <!--type="terrain"-->
                      <!--:fileInfo.sync="form.terrain"-->
                      <!--@showTip="showTip"-->
                      <!--:mapLoading.sync="mapLoading"-->
                      <!--:errTip="errTip"-->
                      <!--@unshiftError="unshiftError"-->
                      <!--@clearError="clearError"-->
                      <!--:percentage.sync="terrainPer"-->
                      <!--:fileHandle.sync="terrainFileHandle"-->
                      <!--:roughness="form.roughness"-->
                      <!--@getFileRoughness="getFileRoughness"-->
                    <!--&gt;</upload-map-file>-->
                  <!--</div>-->
                  <!--<div class="form-item">-->
                    <!--<label class="form-item-label">粗糙度文件：</label>-->
                    <!--<upload-map-file-->
                      <!--ref="cucaoFile"-->
                      <!--:disabled="status > 1"-->
                      <!--@setMapLayer="setMapLayer"-->
                      <!--:path.sync="form.mapFilePath"-->
                      <!--:bucket.sync="form.bucket"-->
                      <!--type="roughness"-->
                      <!--:fileInfo.sync="form.roughness"-->
                      <!--@showTip="showTip"-->
                      <!--:mapLoading.sync="mapLoading"-->
                      <!--:errTip="errTip"-->
                      <!--@unshiftError="unshiftError"-->
                      <!--@clearError="clearError"-->
                      <!--:percentage.sync="roughnessPer"-->
                      <!--:fileHandle.sync="roughnessFileHandle"-->
                      <!--:isRoughnessGenerating.sync="form.isRoughnessGenerating"-->
                      <!--@checkIsRoughnessGenerating="checkIsRoughnessGenerating"-->
                    <!--&gt;</upload-map-file>-->
                  <!--</div>-->
                <!--</el-collapse-item>-->
              </div>
              <div @click="curCollapse = 2" :class="{'active': curCollapse===2}">
                <el-collapse-item class="no-padding" name="2">
                  <template slot="title">
                    <span>
                      测风塔坐标
                      <span v-if="formNumber.masts">{{formNumber.masts}}个</span>
                    </span>
                    <div
                      @click.stop="curCollapse = 2"
                      v-if="status<2"
                      class="p-right"
                      @click="resetMarker"
                    >
                      <upload-btn
                        :hasList="masts.length>1 || (form.masts.length==1 && form.masts[0].tag && form.masts[0].x && form.masts[0].y)"
                        file-type="MAST"
                        @postWtMast="postWtMast"
                        btn-text="文件上传"
                      ></upload-btn>
                      <el-button type="text" @click="addTableRow('masts')">新增</el-button>
                    </div>
                  </template>
                  <el-table
                    ref="mastTable"
                    :data="form.masts"
                    class="table-list form-no-border"
                    @cell-mouse-enter="mastsTableHover"
                    @cell-mouse-leave="mastsTableLeave"
                    :row-class-name="setRowClass"
                    highlight-current-row
                  >
                    <el-table-column prop="tag" label="标签">
                      <template slot-scope="scope">
                        <el-form-item
                          :prop="'masts['+scope.$index+'].tag'"
                          required
                          :rules="{ validator: validateTag, trigger: 'blur' }"
                        >
                          <el-input
                            v-model.trim="scope.row.tag"
                            :ref="'masttag'+scope.$index"
                            :maxlength="10"
                            @keyup.enter.native="inputBlur('masttag'+scope.$index)"
                            @blur="updateInputValue('masts', scope)"
                            @focus="onfocus('masts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="x" label="x" min-width="100">
                      <template slot-scope="scope">
                        <el-form-item :prop="'masts['+scope.$index+'].x'" required>
                          <el-input
                            placeholder="X"
                            v-model.trim="scope.row.x"
                            :ref="'mastX'+scope.$index"
                            @keyup.enter.native="inputBlur('mastX'+scope.$index)"
                            @blur="xyBlur('mast', scope.$index)"
                            @focus="onfocus('masts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="y" label="y" min-width="125">
                      <template slot-scope="scope">
                        <el-form-item :prop="'masts['+scope.$index+'].y'" required>
                          <el-input
                            placeholder="尝试复制粘贴批量操作"
                            v-model.trim="scope.row.y"
                            :ref="'mastY'+scope.$index"
                            @keyup.enter.native="inputBlur('mastY'+scope.$index)"
                            @blur="xyBlur('mast', scope.$index)"
                            @focus="onfocus('masts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="h" label="h">
                      <template slot-scope="scope">
                        <el-form-item
                          :prop="'masts['+scope.$index+'].h'"
                          required
                          :rules="{ validator: validateH, trigger: ['blur', 'change'] }"
                        >
                          <el-input
                            v-model.trim="scope.row.h"
                            placeholder="(0,1000)"
                            :ref="'mastH'+scope.$index"
                            @keyup.enter.native="inputBlur('mastH'+scope.$index)"
                            @blur="updateInputValue('masts', scope)"
                            @focus="onfocus('masts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" v-if="status<2">
                      <template slot-scope="scope">
                        <i
                          class="iconfont iconjingzhun"
                          :class="[(mapEditMode === 'mast' && curEditPointIndex === (masts.length>form.masts.length && (page.mast-1)*page.pageSize+scope.$index || scope.$index)) ? 'active' : '']"
                          @click.stop="handlePoint('mast', scope)"
                        ></i>
                        <i class="iconfont iconjianh" @click="deleteTableRow('masts', scope)"></i>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-pagination
                    ref="mastsPage"
                    layout="prev, pager, next"
                    :total="masts.length"
                    :page-size="page.pageSize"
                    hide-on-single-page
                    :current-page="page.mast"
                    @current-change="mastPageChange"
                  ></el-pagination>
                </el-collapse-item>
              </div>
              <div @click="curCollapse = 3; getAllWtList()" :class="{'active': curCollapse===3}">
                <el-collapse-item class="no-padding" name="3">
                  <template slot="title">
                    <span>
                      机位点坐标
                      <span v-if="formNumber.wts">{{formNumber.wts}}个</span>
                    </span>
                    <div
                      @click.stop="curCollapse = 3"
                      v-if="status<2"
                      class="p-right"
                      @click="resetMarker"
                    >
                      <upload-btn
                        :hasList="wts.length>1 || (form.wts.length==1 && form.wts[0].tag && form.wts[0].x && form.wts[0].y)"
                        file-type="WT"
                        @postWtMast="postWtMast"
                        btn-text="文件上传"
                      ></upload-btn>
                      <el-button type="text" @click="addTableRow('wts')">新增</el-button>
                    </div>
                  </template>
                  <el-table
                    ref="wtTable"
                    :data="form.wts"
                    class="table-list form-no-border"
                    @cell-mouse-enter="wtsTableHover"
                    @cell-mouse-leave="wtsTableLeave"
                    :row-class-name="setRowClass"
                    highlight-current-row
                    row-click="rowClick"
                  >
                    <el-table-column prop="tag" label="标签">
                      <template slot-scope="scope">
                        <el-form-item
                          :prop="'wts['+scope.$index+'].tag'"
                          required
                          :rules="{ validator: validateTag, trigger: 'blur' }"
                        >
                          <el-input
                            v-model.trim="scope.row.tag"
                            :ref="'wttag'+scope.$index"
                            :maxlength="10"
                            @keyup.enter.native="inputBlur('wttag'+scope.$index)"
                            @blur="updateInputValue('wts', scope)"
                            @focus="onfocus('wts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="x" label="x" min-width="100">
                      <template slot-scope="scope">
                        <el-form-item :prop="'wts['+scope.$index+'].x'" required>
                          <el-input
                            placeholder="X"
                            v-model.trim="scope.row.x"
                            :ref="'wtX'+scope.$index"
                            @keyup.enter.native="inputBlur('wtX'+scope.$index)"
                            @blur="xyBlur('wt', scope.$index)"
                            @focus="onfocus('wts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="y" label="y" min-width="125">
                      <template slot-scope="scope">
                        <el-form-item :prop="'wts['+scope.$index+'].y'" required>
                          <el-input
                            placeholder="尝试复制粘贴批量操作"
                            v-model.trim="scope.row.y"
                            :ref="'wtY'+scope.$index"
                            @keyup.enter.native="inputBlur('wtY'+scope.$index)"
                            @blur="xyBlur('wt', scope.$index)"
                            @focus="onfocus('wts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="h" label="h">
                      <template slot-scope="scope">
                        <el-form-item
                          :prop="'wts['+scope.$index+'].h'"
                          required
                          :rules="{ validator: validateH, trigger: ['blur', 'change'] }"
                        >
                          <el-input
                            placeholder="(0,1000)"
                            v-model.trim="scope.row.h"
                            :ref="'wtH'+scope.$index"
                            @keyup.enter.native="inputBlur('wtH'+scope.$index)"
                            @blur="updateInputValue('wts', scope)"
                            @focus="onfocus('wts', scope)"
                            @input="onInput"
                          ></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" v-if="status<2">
                      <template slot-scope="scope">
                        <i
                          class="iconfont iconjingzhun"
                          :class="[(mapEditMode === 'wt' && curEditPointIndex === (wts.length>form.wts.length && (page.wt-1)*page.pageSize+scope.$index || scope.$index)) ? 'active' : '']"
                          @click.stop="handlePoint('wt', scope)"
                        ></i>
                        <i class="iconfont iconjianh" @click="deleteTableRow('wts', scope)"></i>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-pagination
                    ref="wtsPage"
                    layout="prev, pager, next"
                    :total="wts.length"
                    :page-size="page.pageSize"
                    hide-on-single-page
                    :current-page="page.wt"
                    @current-change="pageChange"
                  ></el-pagination>
                </el-collapse-item>
              </div>
              <div @click="curCollapse = 4" :class="{'active': curCollapse===4}">
                <el-collapse-item class="param-set" name="4" disabled>
                  <template slot="title">
                    <span>参数设置(必填)</span>
                    <div @click.stop class="p-right">
                      <!--<el-button :disabled="false" type="text" @click="openParamSet">更多设置</el-button>-->
                      <span @click="openParamSet" class="set-btn">更多设置</span>
                    </div>
                    <param-set ref="paramSet" :disabled="status > 1" :dzmin.sync="form.resolutionV"></param-set>
                  </template>
                  <el-form-item label="兴趣区域：">
                    <div
                      @mouseover="selectStyle(index)"
                      @mouseout="outStyle(index)"
                      class="interest-area"
                      v-for="(item,index) in angles"
                      :key="index"
                    >
                      <div class="angle">
                        <div class="west-north">
                          <label>西北角</label>
                          <el-form-item required>
                            <el-input
                              v-model.trim.number="item.minX"
                              :ref="'minX'+index"
                              @change="updateAngle(index,item)"
                              @blur="drawRect('minX',index,item)"
                              @keyup.enter.native="inputBlur('minX'+index)"
                              placeholder="X-投影系坐标"
                            ></el-input>
                          </el-form-item>
                          <el-form-item required>
                            <el-input
                              v-model.trim.number="item.maxY"
                              :ref="'maxY'+index"
                              @change="updateAngle(index,item)"
                              @blur="drawRect('maxY',index,item)"
                              @keyup.enter.native="inputBlur('maxY'+index)"
                              placeholder="Y-投影系坐标"
                            ></el-input>
                          </el-form-item>
                        </div>
                        <div class="east-south">
                          <label>东南角</label>
                          <el-form-item required>
                            <el-input
                              v-model.trim.number="item.maxX"
                              :ref="'maxX'+index"
                              @change="updateAngle(index,item)"
                              @blur="drawRect('maxX',index,item)"
                              @keyup.enter.native="inputBlur('maxX'+index)"
                              placeholder="X-投影系坐标"
                            ></el-input>
                          </el-form-item>
                          <el-form-item required>
                            <el-input
                              v-model.trim.number="item.minY"
                              :ref="'minY'+index"
                              @change="updateAngle(index,item)"
                              @blur="drawRect('minY',index,item)"
                              @keyup.enter.native="inputBlur('minY'+index)"
                              placeholder="Y-投影系坐标"
                            ></el-input>
                          </el-form-item>
                        </div>
                      </div>
                      <div
                        v-if="status <= 1"
                        class="handle-map"
                        :class="{'active': mapEditMode==='rect'&&ind===index}"
                        @click.stop="changeMapEditMode('rect',index)"
                      >
                        <i class="iconfont iconditu1"></i>
                      </div>
                      <div v-if="status <= 1">
                        <i
                          style="margin-left:4px"
                          class="iconfont el-icon-plus add"
                          @click="addAngle"
                        ></i>
                        <i
                          class="iconfont el-icon-minus del"
                          @click="delAngle(index,item)"
                          v-if="angles.length>1"
                        ></i>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item
                    prop="resolutionH"
                    required
                    :rules="{ validator: validateReH, trigger: 'blur' }"
                  >
                    <template slot="label">
                      <span title="水平方向上网格的最小分辨率，建议为25左右">水平分辨率：</span>
                    </template>
                    <el-input
                      v-model.trim="form.resolutionH"
                      placeholder="(1, 50]"
                      ref="resolutionH"
                      @keyup.enter.native="inputBlur('resolutionH')"
                      @blur="resolutionBlur('resolutionH')"
                      title="水平方向上网格的最小分辨率，建议为25左右"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    prop="resolutionV"
                    required
                    :rules="{ validator: validateReV, trigger: 'blur' }"
                  >
                    <template slot="label">
                      <span title="垂直方向上距离地面第一层网格的分辨率，建议为1左右">垂直分辨率：</span>
                    </template>
                    <el-input
                      v-model.trim="form.resolutionV"
                      placeholder="(0.1, 2]"
                      ref="resolutionV"
                      @keyup.enter.native="inputBlur('resolutionV')"
                      @blur="resolutionBlur('resolutionV')"
                      title="垂直方向上距离地面第一层网格的分辨率，建议为1左右"
                    ></el-input>
                  </el-form-item>
                  <div class="fan-split-block">
                    <fan-split
                      v-if="status < 2"
                      ref="fansplit"
                      :value.sync="form.sectionInfos"
                      @updateGlobalSetting="updateGlobalSetting"
                      @changeSectionInfos="changeSectionInfos"
                      @clearError="clearError"
                      @unshiftError="unshiftError"
                      :errorTips="errorTips"
                    ></fan-split>
                  </div>
                </el-collapse-item>
              </div>
            </el-collapse>
          </el-form>
        </el-scrollbar>
      </el-col>
      <div
        ref="dragLine"
        class="el-col el-col-24 drag-line"
        :style="{height: (status<2 ? 'calc(100vh - 204px)' : 'calc(100vh - 152px)')}"
      ></div>
      <el-col ref="colRight" class="col-map">
        <div @click.stop>
          <map-container
            ref="mapCon"
            v-if="form.terrain && form.terrain.xMax"
            :mapH.sync="mapH"
            :terrain.sync="form.terrain"
            :roughness.sync="form.roughness"
            :mapEditMode.sync="mapEditMode"
            :wt-list="wts"
            :mast-list="masts"
            @click.stop
            :mesh="mesh"
            :angles="angles"
            @update="updateCoordinate"
            @setPointXY="setPointXY"
            :epsgNum.sync="form.epsgNum"
            :system.sync="system"
            @setActiveMarker="setActiveMarker"
          >
            <ul class="tuli" v-if="conventionalSigns&&conventionalSigns.length">
              <li class="litop">海拔（米）</li>
              <li class="li" :key="item.to_color" v-for="item in conventionalSigns">
                <span
                  :style="{'background':'linear-gradient('+item.from_color+','+item.to_color+')'}"
                  class="blo1"
                ></span>
                <span class="blo2">{{item.from_value}}-{{item.to_value}}</span>
              </li>
            </ul>
          </map-container>
          <div
            v-else
            class="map-space"
            style="width: 100%; border: 1px solid #009FFF;"
            :style="{height: mapH+'px'}"
          >
            <div
              v-if="!mapLoading"
              style="position:absolute;left:50%; top:50%; transform: translate(-50%,-50%);color:red"
            >暂无数据</div>
            <div
              class="info"
            >坐标系统：{{system.projectionSystem}} {{system.coordinateSystem}} {{system.zone}}</div>
          </div>
          <div v-if="mapLoading" class="map-loading" :style="{height: mapH+'px'}">
            <img class="pic" src="/imgs/loading.svg" alt>
          </div>
          <div
            class="tips-container"
            :style="{top: mapH+'px', 'max-height': 'calc(100vh - '+mapH+'px - 203px)'}"
          >
            <el-progress
              v-if="showTerrProgress"
              :percentage="terrainPer"
              color="linear-gradient(90deg,rgba(0,159,255,1),rgba(255,46,118,1));"
            ></el-progress>
            <p v-if="showTerrProgress">地图文件{{terrainFileHandle=='post' ? '获取' : '上传'}}中， 请稍等...</p>
            <el-progress
              v-if="showRoughProgress"
              :percentage="roughnessPer"
              color="linear-gradient(90deg,rgba(0,159,255,1),rgba(255,46,118,1));"
            ></el-progress>
            <p v-if="showRoughProgress">粗糙度文件{{roughnessFileHandle=='post' ? '获取' : '上传'}}中， 请稍等...</p>
            <p class="error-tip" v-if="errorTips.length">{{errorTips[0]}}</p>
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="footer" v-if="status<2">
      <el-button type="primary" @click="openCalculateConfirm">提交计算</el-button>
      <calculate-confirm
        ref="calculateConfirm"
        @unshiftError="unshiftError"
        @clearError="clearError"
      ></calculate-confirm>
    </div>
  </div>
</template>
<script>
import fanSplit from "@/components/project/fan-split.vue";
import mapContainer from "@/components/project/map-container.vue";
import uploadBtn from "@/components/project/upload-btn.vue";
import paramSet from "@/components/project/param-set.vue";
import calculateConfirm from "@/components/project/calculate-confirm.vue";
import { fileConfig, FILE_TYPE } from "@/config/file.config";
import cfdConfig from "@/config/cfd.config";
import { mapOptions } from "@/config/map.config";

export default {
  data() {
    return {
      loading: false,
      conventionalSigns: [],
      projectId: this.$route.params.projectId || 1,
      form: {
        style: "常规模式",
        resolutionH: "",
        resolutionV: "",
        minX: "",
        maxY: "",
        maxX: "",
        minY: "",
        refine: {
          diadom: ""
        },
        masts: [],
        wts: [],
        terrain: {}
      },
      wts: [],
      masts: [],
      formNumber: {
        wts: "",
        masts: ""
      },
      rules: {
        resolutionH: [
          // {validator: ''}
        ]
      },
      curCollapse: 0, //原来是等于2，白志强
      collapse: ["1", "4"],
      allWts: false, //标记是否已获取全部的风机列表
      options: [
        {
          value: "常规模式",
          label: "常规模式"
        }
      ],
      disabled: false,
      fileType: FILE_TYPE,
      mapEditMode: "", //当前地图编辑模式
      errTip: cfdConfig.errTip,
      errorTips: [], //错误提示文字,
      curEditPointIndex: "", //当前激活机位点/测风塔在所有列表中的索引
      curEditFormPointIndex: "", //当前激活机位点/测风塔在当前显示页中的索引
      mapLoading: false,
      markBound: {
        //marker边界
        wts: {
          minX: 0,
          maxY: 0,
          maxX: 0,
          minY: 0
        },
        masts: {
          minX: 0,
          maxY: 0,
          maxX: 0,
          minY: 0
        }
      },
      terrainPer: 0,
      roughnessPer: 0,
      terrainFileHandle: "upload", //记录上传or下载地形文件
      roughnessFileHandle: "upload", //记录上传or下载粗糙度文件
      showTerrProgress: false,
      showRoughProgress: false,
      sortObj: {
        tab: "",
        x: "",
        y: "",
        h: ""
      },
      focusInput: {},
      mapH: mapOptions.height, // 动态计算地图高度
      dragOffsetX: 0,
      dragClientX: 0,
      colLeftW: 0,
      colRightW: 0,
      styleColL: {},
      styleColR: {},
      ondrag: false,
      timer: null,
      rTimer: null,
      page: {
        pageSize: 25,
        wt: 1,
        mast: 1
      },
      angles: [], //加密区数组
      ind: null //确定画那一组数据
    };
  },
  components: {
    fanSplit,
    mapContainer,
    uploadBtn,
    paramSet,
    calculateConfirm
  },
  computed: {
    mesh() {
      return {
        minX: this.form.minX,
        maxY: this.form.maxY,
        maxX: this.form.maxX,
        minY: this.form.minY
      };
    },
    system() {
      return {
        projectionSystem: this.form.projectionSystem,
        coordinateSystem: this.form.coordinateSystem,
        zone: this.form.zone
      };
    },
    status() {
      return this.form.status || 0;
    }
  },
  props: [],
  mounted() {
    this.init();
    this.$nextTick(() => {
      this.initDom();
      this.dragFun();
    });
  },
  methods: {
    findSame(arr) {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (
            arr[i].maxX == arr[j].maxX &&
            arr[i].maxY == arr[j].maxY &&
            arr[i].minX == arr[j].minX &&
            arr[i].minY == arr[j].minY
          ) {
            return false;
          }
        }
        if (i == arr.length - 1) {
          return true;
        }
      }
    },
    updateAngle(index, item) {
      this.caculateHttps
        .updateAngle(this.projectId, index, item)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    addAngle() {
      if (this.angles.length >= 4) {
        this.$message("最多可绘制4个兴趣区域");
        return;
      }
      for (let item of this.angles) {
        if (!item.minX || !item.maxX || !item.minY || !item.maxY) {
          this.$message("兴趣区域坐标不可为空");
          return;
        }
      }
      this.caculateHttps
        .addAngle(this.projectId, {
          maxX: null,
          maxY: null,
          minX: null,
          minY: null
        })
        .then(res => {
          this.angles.push({
            maxX: null,
            maxY: null,
            minX: null,
            minY: null
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    delAngle(index) {
      this.caculateHttps
        .delAngle(this.projectId, index)
        .then(res => {
          this.angles.splice(index, 1);
          this.$refs.mapCon && this.$refs.mapCon.delRect(index);
          if(this.$refs.mapCon && !this.$refs.mapCon.layerShow['rect']){
            this.$refs.mapCon && this.$refs.mapCon.toggleLayer('rect');
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    init() {
      if (!this.projectId) {
        this.$router.push("/project/list");
        return;
      }
      this.getGlobalSetting();
    },
    initDom() {
      let vm = this;
      // if((document.body.clientHeight - 245) < mapOptions.height){
      //   this.mapH = (document.body.clientHeight - 245)
      // }else{
      //   this.mapH = (document.body.clientHeight - 320)
      // }
      this.calMapHeight(true);
      window.onresize = () => {
        this.calMapHeight(true);
      };
      document.onclick = () => {
        vm.resetMarker();
      };
    },
    // 清除所有地图可编辑项目
    resetMarker() {
      let vm = this;
      if (this.mapEditMode == "") return;
      this.mapEditMode = "";
      this.curEditPointIndex = "";
      this.clearTableRowClass();
    },
    clearTableRowClass() {
      let vm = this;
      if (
        vm.$refs["mastTable"] &&
        vm.$refs["mastTable"].$el.getElementsByClassName("current-row").length
      ) {
        vm.$refs["mastTable"].$el.getElementsByClassName(
          "current-row"
        )[0].className = "el-table__row";
      }
      if (
        vm.$refs["wtTable"] &&
        vm.$refs["wtTable"].$el.getElementsByClassName("current-row").length
      ) {
        vm.$refs["wtTable"].$el.getElementsByClassName(
          "current-row"
        )[0].className = "el-table__row";
      }
    },
    // 获取项目定向计算基础配置
    getGlobalSetting() {
      this.caculateHttps.getGlobalSetting(this.projectId).then(res => {
        if (res.isRoughnessGenerating) {
          this.checkIsRoughnessGenerating();
        }
        if (!res.sectionInfos) {
          res.sectionInfos = [];
        }
        if (res.multiRefine) {
          this.angles = res.multiRefine;
        }

        this.form = res;
        res.masts && (this.formNumber.masts = res.masts.length);
        if (this.form.masts && this.form.masts.length) {
          this.masts = JSON.parse(JSON.stringify(res.masts));
          res.masts.length > this.page.pageSize &&
            (this.form.masts = JSON.parse(JSON.stringify(res.masts)).slice(
              0,
              this.page.pageSize
            ));
        } else {
          this.form.masts = [];
          // res.status<2 && this.addTableRow('masts')
        }
        this.getAllMarkerBound("masts");
        !this.form.resolutionH && (this.form.resolutionH = 25);
        !this.form.resolutionV && (this.form.resolutionV = 2);
        // 刷新页面，上传完成，未解析完成
        if (res.terrain && res.terrain.id && !res.terrain.wmsUrl) {
          this.mapLoading = true;
          this.$refs.mapFile.getFileTerrain();
        }
        if (
          res.terrain &&
          res.terrain.conventionalSigns &&
          res.terrain.conventionalSigns.length
        ) {
          this.conventionalSigns = res.terrain.conventionalSigns;
        }
        this.getAllWtList();
        this.$nextTick(() => {
          this.$refs.form.clearValidate(); //移除表单项的校验结果
          
          this.form.terrain &&
            this.form.terrain.xMax &&
            this.$refs.mapCon.mapRedraw(); //点更新，重绘地图
        });
      });
    },
    // 获取测风塔/风机边界
    getAllMarkerBound(type) {
      let vm = this;
      this.markBound[type] = {
        minX: "",
        maxY: "",
        maxX: "",
        minY: ""
      };
      this[type].forEach(v => {
        vm.setMarkBound(v, type);
      });
    },
    // 设置mark边界
    setMarkBound(v, type) {
      if (!this.markBound[type].minX) {
        this.markBound[type] = {
          minX: v.x,
          maxY: v.y,
          maxX: v.x,
          minY: v.y
        };
        return;
      }
      v.x < this.markBound[type].minX && (this.markBound[type].minX = v.x);
      v.x > this.markBound[type].maxX && (this.markBound[type].maxX = v.x);
      v.y < this.markBound[type].minY && (this.markBound[type].minY = v.y);
      v.y > this.markBound[type].maxY && (this.markBound[type].minY = v.y);
    },
    // 检测所有点是否都在兴趣区域中
    checkPointInRect(type) {
      let xarr = [];

      let yarr = [];

      for (let it of this.angles) {
        xarr.push(it.minX, it.maxX);
        yarr.push(it.minY, it.maxY);
      }
      //  debugger
      let maxX = Math.max(...xarr);
      let minX = Math.min(...xarr);
      let minY = Math.min(...yarr);
      let maxY = Math.max(...yarr);
      let success = true;
      if (this.markBound[type].minX && minX) {
        if (
          this.markBound[type].minX < minX ||
          this.markBound[type].maxX > maxX ||
          this.markBound[type].minY < minY ||
          this.markBound[type].maxY > maxY
        ) {
          success = false;
        }
      }
      return success;

      // let arr=this.angles;
      // let success1 = true;
      // let success2 = true;
      // for (let bb of this.masts) {
      //   for (let i=0,j=arr.length;i<j; i++) {
      //     if (
      //       bb.x >
      //         Math.min(arr[i].minX, arr[i].maxX) &&
      //       bb.y > Math.min(arr[i].minY, arr[i].maxY) && bb.x <
      //         Math.max(arr[i].minX, arr[i].maxX) &&
      //       bb.y < Math.max(arr[i].minY, arr[i].maxY)
      //     ) {
      //       success1 = true;
      //       break;
      //     }else{
      //       if(i==arr.length-1){
      //         success1 = false;
      //         return success1;
      //       }
      //     }
      //   }
      // };
      // for (let aa of this.wts) {
      //   for (var i=0;i<arr.length; i++) {
      //     if (
      //       aa.x >
      //         Math.min(arr[i].minX, arr[i].maxX) &&
      //       aa.y > Math.min(arr[i].minY, arr[i].maxY) && aa.x <
      //         Math.max(arr[i].minX, arr[i].maxX) &&
      //       aa.y < Math.max(arr[i].minY, arr[i].maxY)
      //     ) {
      //       success2 = true;
      //       break;
      //     }else{
      //       if(i==arr.length-1){
      //         success2 = false;
      //         return success2;
      //       }
      //     }
      //   }
      // };
      // return success1 && success2;
    },
    getFileTerrain() {
      // this.caculateHttps.getFileTerrain(this.projectId)
    },
    collapseChange() {
      // 默认不渲染机位点dom，展开再渲染
      if (
        this.collapse.includes("3") &&
        this.wts.length > 1 &&
        this.form.wts.length == 1
      ) {
        if (this.wts.length > this.page.pageSize) {
          this.form.wts = JSON.parse(
            JSON.stringify(this.wts.slice(0, this.page.pageSize))
          );
        } else {
          this.form.wts = JSON.parse(JSON.stringify(this.wts));
        }
      }
    },
    // 获取所有风机列表
    getAllWtList(call) {
      if (this.allWts) {
        return;
      }
      this.caculateHttps.getAllWtList(this.projectId).then(res => {
        this.wts = res;
        this.page.wt = 1;
        this.getAllMarkerBound("wts");
        this.$nextTick(() => {
          this.form.terrain &&
            this.form.terrain.xMax &&
            this.$refs.mapCon &&
            this.$refs.mapCon.mapRedraw(); //点更新，重绘地图
        });
        this.formNumber.wts = res.length;
        try {
          call();
        } catch (e) {
          console.log(e);
        }
      });
      this.allWts = true;
    },
    getWtsTableData(idx) {
      idx = idx || 0;
      let len = Math.min(this.form.wts.length - idx, 100);
      return this.form.wts.slice(idx, len);
    },
    // 测风塔/机位xy blur时触发
    xyBlur(type, index) {
      // this.$refs.mapCon.mapRedraw();//点更新，重绘地图
      if (!this.form[type + "s"][index]) {
        return;
      }
      this.$set(
        this[type + "s"],
        (this.page[type] - 1) * this.page.pageSize + index,
        Object.assign({}, this.form[type + "s"][index])
      );
      this.form.terrain &&
        this.form.terrain.xMax &&
        this.$refs.mapCon.movePoint(type, index);
      // this.setMarkBound(this.form[type+'s'][this.curEditPointIndex || index]);//更新marker边界值
      this.getAllMarkerBound(type + "s"); // 更新marker边界值
      if (this.checkPointInRect(type + "s")) {
        //点在面内保存，否则报错
        this.clearError(this.errTip.markOverflow);
        this.updateTypeList(type + "s");
      } else {
        this.unshiftError(this.errTip.markOverflow);
      }
    },
    // 更新风机/测风塔列表
    updateTypeList(type) {
      let p = new Promise((resolve, reject) => {
        this.validateMastsWts(type).then(() => {
          this.checkForm();
          this.caculateHttps
            .updateTypeList({
              projectId: this.projectId,
              type: (type === "masts" && "MAST") || (type === "wts" && "WT"),
              list: this[type]
            })
            .then(() => {
              this.formNumber[type] = this[type].length;
              resolve();
            });
        });
      });
      return p;
    },
    pageChange(num) {
      this.page.wt = num;
      this.$set(
        this.form,
        "wts",
        this.wts.slice(this.page.pageSize * (num - 1), this.page.pageSize * num)
      );
      this.clearValidateMastsWts("wts");
    },
    mastPageChange(num) {
      this.page.mast = num;
      this.$set(
        this.form,
        "masts",
        this.masts.slice(
          this.page.pageSize * (num - 1),
          this.page.pageSize * num
        )
      );
      this.clearValidateMastsWts("masts");
    },
    openParamSet() {
      this.$refs.paramSet.showDialog();
    },
    // 提交计算
    openCalculateConfirm() {
      let vm = this;
      vm.errorTips = [];
      if (!vm.$refs.mapFile.fileName) {
        vm.errorTips.push(vm.errTip.terrainLess);
      }
      if (!vm.$refs.cucaoFile.fileName) {
        vm.errorTips.push(vm.errTip.roughnessLess);
      }
      if (vm.form.isRoughnessGenerating) {
        vm.errorTips.push(vm.errTip.roughnessGenerating);
      }
      if (
        vm.form.terrain &&
        vm.form.terrain.wmsUrl &&
        vm.$refs.mapCon.rectOverflow
      ) {
        vm.errorTips.push(vm.errTip.rectOverflow);
      }
      if (
        vm.form.terrain &&
        vm.form.terrain.wmsUrl &&
        vm.$refs.mapCon.rectLessThanMin
      ) {
        vm.errorTips.push(vm.errTip.rectLessThanMin);
      }
      if (!vm.checkPointInRect("masts") || !vm.checkPointInRect("wts")) {
        vm.errorTips.push(vm.errTip.markOverflow);
      }
      if (!vm.form.sectionInfos.length) {
        vm.errorTips.push("请设置扇区");
      } else {
        vm.$refs.fansplit.checkAngleRepeat();
      }
      if (this.findSame(this.angles) == false) {
        this.$message.error({
          showClose: true,
          duration: 0,
          message: "兴趣区域位置重复",
          center: true
        });
        return;
      }
      for (let item of this.angles) {
        if (item.minX && item.maxX && item.minX >= item.maxX) {
          this.unshiftError("西北角的X值必须小于东南角的X值");
          
          return;
        } else {
          
          this.clearError("西北角的X值必须小于东南角的X值");
        }
        if (item.minY && item.maxY && item.minY >= item.maxY) {
          this.unshiftError("西北角的Y值必须大于东南角的Y值");
          
          return;
        } else {
         
          this.clearError("西北角的Y值必须大于东南角的Y值");
        }
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          Promise.all([
            vm.validateMastsWtsNew("masts"),
            vm.validateMastsWtsNew("wts")
          ]).then(vals => {
            if (vals[0] && vals[1]) {
              vm.clearError("请完善表单数据");
              setTimeout(() => {
                if (vm.errorTips.length) return;
                vm.loading = true;
                Promise.all([
                  this.updateTypeList("wts"),
                  this.updateTypeList("masts"),
                  this.updateGlobalSetting()
                ])
                  .then(res => {
                    vm.loading = false;
                    vm.$refs.calculateConfirm.showDialog();
                  })
                  .catch(err => {
                    vm.loading = false;
                  });
              }, 1000);
            } else {
              vm.errorTips.push("请完善表单数据");
            }
          });
        } else {
          vm.validateMastsWts("wts");
          vm.validateMastsWts("masts");
          vm.errorTips.push("请完善表单数据");
        }
      });
    },
    // 获取测风塔/风机当前新增索引号
    getIndexOfList(type) {
      let p = new Promise(resolve => {
        if (this[type].length == 0) {
          resolve("01");
          return;
        }
        let tags = this[type].map(v => {
          return v.tag;
        });
        let start = type == "masts" ? "M" : "F";
        for (let k = 1; k <= this[type].length; k++) {
          if (tags.indexOf(start + (k < 10 ? "0" + k : k)) == -1) {
            resolve(k < 10 ? "0" + k : k);
            break;
          }
          if (k == this[type].length) {
            resolve(k < 9 ? "0" + (k + 1) : k + 1);
          }
        }
      });
      return p;
    },
    // 新增测风塔坐标，机位点坐标
    addTableRow(formData) {
      let vm = this;
      if(this.$refs.mapCon){
        this.$refs.mapCon.layerShow[formData.substring(0, formData.length - 1)]=true;
      }
      if (!this.form[formData]) this.form[formData] = [];
      if (formData == "masts") {
        !this.collapse.includes("2") && this.collapse.push("2");
        vm.$nextTick(() => {
          this.validateMastsWts(formData).then(() => {
            let H =
              (vm.form[formData].length &&
                vm.form[formData][vm.form[formData].length - 1].h) ||
              90;
            vm.getIndexOfList(formData).then(k => {
              vm[formData].push({ tag: "M" + k, x: "", y: "", h: H });
              // 如果有分页，则切换到最后一页添加
              if (vm[formData].length > vm.page.pageSize) {
                vm.$refs[formData + "Page"].handleCurrentChange(
                  Math.ceil(vm[formData].length / vm.page.pageSize)
                );
                vm.mastPageChange(
                  Math.ceil(vm[formData].length / vm.page.pageSize)
                );
              } else {
                vm.form[formData].push({ tag: "M" + k, x: "", y: "", h: H });
              }
              vm.$nextTick(() => {
                vm.$refs["mastX" + (vm.form[formData].length - 1)].focus();
                vm.form.terrain &&
                  vm.form.terrain.xMax &&
                  vm.$refs.mapCon.mapRedraw(); //点更新，重绘地图
              });
            });
          });
        });
      }
      if (formData == "wts") {
        !this.collapse.includes("3") &&
          this.collapse.push("3") &&
          this.collapseChange();
        if (!this.allWts) {
          vm.getAllWtList(() => {
            setTimeout(() => {
              vm.validateMastsWts(formData).then(() => {
                let H =
                  (vm.form[formData].length &&
                    vm.form[formData][vm.form[formData].length - 1].h) ||
                  90;
                vm.getIndexOfList(formData).then(k => {
                  // vm.form[formData].push({tag: 'F' + k, x: '', y: '', h: H})
                  vm[formData].push({ tag: "F" + k, x: "", y: "", h: H });
                  // 如果有分页，则切换到最后一页添加
                  if (vm[formData].length > vm.page.pageSize) {
                    vm.$refs[formData + "Page"].handleCurrentChange(
                      Math.ceil(vm[formData].length / vm.page.pageSize)
                    );
                    vm.pageChange(
                      Math.ceil(vm[formData].length / vm.page.pageSize)
                    );
                  } else {
                    vm.form[formData].push({
                      tag: "F" + k,
                      x: "",
                      y: "",
                      h: H
                    });
                  }
                  vm.$nextTick(() => {
                    vm.$refs["wtX" + (vm.form[formData].length - 1)].focus();
                    vm.form.terrain &&
                      vm.form.terrain.xMax &&
                      vm.$refs.mapCon.mapRedraw(); //点更新，重绘地图
                  });
                });
              });
            }, 20);
          });
        } else {
          vm.$nextTick(() => {
            this.validateMastsWts(formData).then(() => {
              let H =
                (vm.form[formData].length &&
                  vm.form[formData][vm.form[formData].length - 1].h) ||
                90;
              vm.getIndexOfList(formData).then(k => {
                vm[formData].push({ tag: "F" + k, x: "", y: "", h: H });
                // 如果有分页，则切换到最后一页添加
                if (vm[formData].length > vm.page.pageSize) {
                  vm.$refs[formData + "Page"].handleCurrentChange(
                    Math.ceil(vm[formData].length / vm.page.pageSize)
                  );
                  vm.pageChange(
                    Math.ceil(vm[formData].length / vm.page.pageSize)
                  );
                } else {
                  vm.form[formData].push({ tag: "F" + k, x: "", y: "", h: H });
                }
                this.$nextTick(() => {
                  vm.$refs["wtX" + (vm.form[formData].length - 1)].focus();
                  vm.form.terrain &&
                    vm.form.terrain.xMax &&
                    vm.$refs.mapCon.mapRedraw(); //点更新，重绘地图
                });
              });
            });
          });
        }
      }
    },
    // 记录当前编辑表单项-用于input事件
    onfocus(type, scope) {
      this.focusInput = {
        type: type,
        rowIndex: scope.$index
      };
    },
    // 监听表单输入事件 - 批量复制粘贴功能
    onInput(e) {
      let arr = [],
        vm = this;
      //针对三种情况 csv 逗号和空格隔开 全部空格隔开 tab和空格隔开
      if (e.indexOf("\t") > -1) {
        let deleteArr = [].concat(e.split(" "));
        arr = deleteArr.map((item, index) => {
          return item.split("\t");
        });
      } else if (e.indexOf(",") > -1) {
        let deleteArr = [].concat(e.split(" "));
        arr = deleteArr.map((item, index) => {
          return item.split(",");
        });
      } else if (e.length - e.replace(/ /g, "").length > 1) {
        String.prototype.ResetBlank = function() {
          var regEx = /\s+/g;
          return this.replace(regEx, " ");
        };
        let str = e.ResetBlank();
        arr = _.chunk(str.split(" "), 4);
      }
      if (arr.length) {
        this.sortArr(arr[0]);
        let orderArr = [];
        _.map(arr, item => {
          orderArr.push({
            tag: item[vm.sortObj.tag],
            x: item[vm.sortObj.x],
            y: item[vm.sortObj.y],
            h: item[vm.sortObj.h]
          });
        });
        let list = JSON.parse(JSON.stringify(vm[vm.focusInput.type]));
        list.splice(
          (vm.page[vm.focusInput.type.slice(0, vm.focusInput.type.length - 1)] -
            1) *
            vm.page.pageSize +
            vm.focusInput.rowIndex,
          1
        );
        // 如果原来的输入框中存在值A，则目前输入框中内容为A+复制的内容，应仅显示复制的内容，去掉A
        let tagArr = orderArr.map(v => {
          return v.tag;
        });
        let newArr = [];
        if (list.length) {
          for (let i = 0; i < list.length; i++) {
            let v = list[i];
            if (tagArr.indexOf(v.tag) == -1) {
              newArr.push(v);
              // list.splice(i, 1)
              // i-=1;
            }
            if (i == list.length - 1) {
              // 跟新总的风机/测风塔
              vm[vm.focusInput.type] = JSON.parse(
                JSON.stringify(newArr)
              ).concat(orderArr);
              // 如果有分页，则切换到最后一页添加
              if (vm[vm.focusInput.type].length > vm.page.pageSize) {
                vm.$refs[vm.focusInput.type + "Page"].handleCurrentChange(
                  Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize)
                );
                vm[
                  (vm.focusInput.type == "wts" && "pageChange") ||
                    "mastPageChange"
                ](Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize));
              } else {
                vm.$set(
                  vm.form,
                  vm.focusInput.type,
                  newArr.concat(orderArr).slice(0, 25)
                );
              }
            }
          }
        } else {
          // 跟新总的风机/测风塔(拼接最后一页到原有数组后)
          vm[vm.focusInput.type] = orderArr;
          // 如果有分页，则切换到最后一页添加
          if (vm[vm.focusInput.type].length > vm.page.pageSize) {
            vm.$refs[vm.focusInput.type + "Page"].handleCurrentChange(
              Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize)
            );
            vm[
              (vm.focusInput.type == "wts" && "pageChange") || "mastPageChange"
            ](Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize));
          } else {
            vm.$set(vm.form, vm.focusInput.type, orderArr);
          }
        }
        setTimeout(() => {
          vm.$refs.mapCon.mapRedraw(); //点更新，重绘地图
        }, 300);
      }
    },
    sortArr(arr) {
      arr.map((item, index) => {
        if (item > 1 && item < 200) {
          this.sortObj.h = index;
        } else if (
          (item >= 100000 && item < 1000000) ||
          (item >= 10000000 && item < 100000000)
        ) {
          this.sortObj.x = index;
        } else if (item >= 1000000 && item < 10000000) {
          this.sortObj.y = index;
        } else {
          this.sortObj.tag = index;
        }
      });
    },
    // 测风塔/风机表单校验
    validateMastsWts(formData) {
      let vm = this,
        valid = true;
      let p = new Promise(resolve => {
        if (!vm.form[formData] || !vm.form[formData].length) {
          resolve();
        } else {
          vm.form[formData].forEach((v, i, arr1) => {
            Object.keys(vm.form[formData][0]).forEach((w, j, arr2) => {
              // 挨个校验表单项
              vm.$refs.form.validateField(
                formData + "[" + i + "]." + w,
                error => {
                  if (!error) {
                    if (i == arr1.length - 1 && j == arr2.length - 1 && valid) {
                      resolve();
                    }
                  } else {
                    valid = false;
                    if (
                      vm.collapse.indexOf(
                        (formData == "masts" && "2") || "3"
                      ) == -1
                    ) {
                      vm.collapse.push((formData == "masts" && "2") || "3");
                      vm.$refs.collapse.setActiveNames(vm.collapse);
                    }
                  }
                }
              );
            });
          });
        }
      });
      return p;
    },
    // 校验不在当前页页的表单项（机位点/测风塔）
    validateMastsWtsNew(type) {
      let vm = this;
      let p = new Promise(resolve => {
        if (vm[type].length == 0) {
          resolve(true);
          return;
        }
        for (let i = 0; i < vm[type].length; i++) {
          let item = vm[type][i];
          for (let j = 0; j < Object.keys(item).length; j++) {
            let jtem = Object.keys(item)[j];
            if (
              !eval(
                "vm." +
                  "myValidate" +
                  jtem +
                  '("' +
                  item[jtem] +
                  '", "' +
                  type +
                  '")'
              )
            ) {
              console.log(i + " " + j + jtem);
              vm[(type == "wts" && "pageChange") || "mastPageChange"](
                Math.ceil((i + 1) / vm.page.pageSize)
              );
              return false;
            }
            if (i == vm[type].length - 1 && j == Object.keys(item).length - 1) {
              resolve(true);
            }
          }
        }
      });
      return p;
    },
    myValidatetag(value, type) {
      let reg = /^[a-zA-Z0-9_.#-]{0,10}$/;
      if (!value || !reg.test(value)) {
        this.unshiftError(
          ((type.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastTag
        );
        return false;
      } else {
        this.clearError(
          ((type.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastTag
        );
        return true;
      }
    },
    myValidatex(value) {
      if (!value && value !== 0) {
        return false;
      } else {
        return true;
      }
    },
    myValidatey(value) {
      if (!value && value !== 0) {
        return false;
      } else {
        return true;
      }
    },
    myValidateh(value, type) {
      if (!Number(value) || value === 0 || value <= 0 || value >= 1000) {
        this.unshiftError(
          ((type.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastH
        );
        return false;
      } else {
        this.clearError(
          ((type.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastH
        );
        return true;
      }
    },
    // 移除测风塔/风机表单校验
    clearValidateMastsWts(formData) {
      let vm = this,
        valid = true;
      let p = new Promise(resolve => {
        if (!vm.form[formData] || !vm.form[formData].length) {
          resolve();
        } else {
          vm.form[formData].forEach((v, i, arr1) => {
            Object.keys(vm.form[formData][0]).forEach((w, j, arr2) => {
              // 挨个校验表单项
              vm.$refs.form.clearValidate(formData + "[" + i + "]." + w);
            });
          });
        }
      });
      return p;
    },
    //删除地图文件，粗糙度文件提示
    showTip(arg) {
      let tip = `${(arg === "terrain" && "地图文件") ||
        "粗糙度文件"} 删除成功！`;
      this.errorTips.unshift(tip);
      setTimeout(() => {
        this.clearError(tip);
      }, 3000);
    },
    // 删除测风塔坐标，机位点坐标
    deleteTableRow(formData, scope) {
      let vm = this;
      if (this.status > 1) return;
      formData == "wts" &&
        !this.collapse.includes("3") &&
        this.collapse.push("3") &&
        this.collapseChange();
      // this.form[formData].splice(scope.$index, 1);
      let aIndex =
        (vm.page[formData.slice(0, formData.length - 1)] - 1) *
          vm.page.pageSize +
        scope.$index;
      this[formData].splice(aIndex, 1);
      if (vm[formData].length >= aIndex) {
        vm.$refs[formData + "Page"].handleCurrentChange(
          Math.ceil((aIndex + 1) / vm.page.pageSize)
        );
        vm.pageChange(Math.ceil((aIndex + 1) / vm.page.pageSize));
      } else {
        vm.$refs[formData + "Page"].handleCurrentChange(
          Math.ceil(aIndex / vm.page.pageSize)
        );
        vm.pageChange(Math.ceil(aIndex / vm.page.pageSize));
      }
      // 如果当前页已没有数据，则切换到上一页
      if (this[formData].length && this.form[formData].length == 0) {
        this.$refs[formData + "Page"].prev();
      }
      this.formNumber[formData] = this[formData].length;
      this.getAllMarkerBound(formData);
      if (this.checkPointInRect(formData)) {
        //点在面内保存，否则报错
        this.clearError(this.errTip.markOverflow);
      } else {
        this.unshiftError(this.errTip.markOverflow);
      }
      this.form.terrain &&
        this.form.terrain.xMax &&
        this.$refs.mapCon.mapRedraw(); //点更新，重绘地图
        if(this.$refs.mapCon){
        this.$refs.mapCon.layerShow[formData.substring(0, formData.length - 1)]=true;
      }
      this.updateTypeList(formData).then(() => {
        let tip = `${(formData === "masts" && "测风塔") || "风机"} ${
          scope.row.tag
        } 删除成功！`;
        this.errorTips.unshift(tip);
        setTimeout(() => {
          vm.clearError(tip);
        }, 3000);
      });
    },
    // 激活绘制兴趣区域
    changeMapEditMode(mode, index = null) {
      if (!this.form.terrain) return;
      this.$refs.mapCon && this.$refs.mapCon.showLayer(mode, index); //若该图层隐藏，则修改状态为显示
      if (this.status > 1) return;
      let nMode = "";
      if (this.mapEditMode && mode == this.mapEditMode && this.ind == index) {
        nMode = "";
      } else {
        nMode = mode;
      }
      this.mapEditMode = nMode;
      this.ind = index;
    },
    // 子组件触发修改兴趣区域坐标值
    updateCoordinate(data, index) {
      this.angles[index].minX = Math.min(data.start_x, data.end_x).toFixed(1);
      this.angles[index].minY = Math.min(data.end_y, data.start_y).toFixed(1);
      this.angles[index].maxX = Math.max(data.start_x, data.end_x).toFixed(1);
      this.angles[index].maxY = Math.max(data.end_y, data.start_y).toFixed(1);
      this.updateAngle(index, this.angles[index]);

      this.clearError("西北角的X值必须小于东南角的X值");
      this.clearError("西北角的Y值必须大于东南角的Y值");
      if (this.$refs.mapCon.rectOverflow) {
        // 兴趣区域出界报错，否则保存
        this.unshiftError(this.errTip.rectOverflow);
        return;
      } else if (this.$refs.mapCon.rectLessThanMin) {
        // 兴趣区域边长太小，否则保存
        this.clearError(this.errTip.rectOverflow);
        this.unshiftError(this.errTip.rectLessThanMin);
        return;
      } else {
        this.clearError(this.errTip.rectOverflow);
        this.clearError(this.errTip.rectLessThanMin);
        if (this.checkPointInRect("masts") && this.checkPointInRect("wts")) {
          //点在面内保存，否则报错
          this.clearError(this.errTip.markOverflow);
          this.updateGlobalSetting();
        } else {
          this.unshiftError(this.errTip.markOverflow);
        }
      }
    },
    // 文件上传(测风塔坐标，机位点坐标)
    postWtMast(type, data) {
      let vm = this;
      let name = (type == "WT" && "wts") || (type == "MAST" && "masts");
      // this.form[name] = this.form[name].concat(data)
      vm[name] = data;
      // this.$refs.form.clearValidate()
      if (vm[name].length > vm.form[name].length) {
        vm.form[name] = data.slice(0, vm.page.pageSize);
      } else {
        vm.form[name] = data;
      }
      vm.formNumber[name] = data.length;
      vm.$nextTick(() => {
        vm.clearValidateMastsWts(name);
        vm.form.terrain &&
          vm.form.terrain.xMax &&
          vm.$refs.mapCon.showLayer(name.substr(0, name.length - 1)); //若该图层隐藏，则修改状态为显示
        vm.form.terrain && vm.form.terrain.xMax && vm.$refs.mapCon.mapRedraw(); //点更新，重绘地图
        vm.getAllMarkerBound(name); //更新marker边界值
        vm.fitBounds();
        if (!vm.checkPointInRect(name)) {
          vm.errorTips.push(vm.errTip.markOverflow);
        }
        // this.checkRefine(this.form.mesh);
        // formChecker(this.$refs.standard);
      });
    },
    fitBounds() {
      let LatLngBounds = [];
      if (this.markBound.masts.maxX) {
        let cor = this.markBound.masts;
        LatLngBounds.push([cor.maxX, cor.minY]);
        LatLngBounds.push([cor.minX, cor.maxY]);
      }
      if (this.markBound.wts.maxX) {
        let cor = this.markBound.wts;
        LatLngBounds.push([cor.maxX, cor.minY]);
        LatLngBounds.push([cor.minX, cor.maxY]);
      }
      this.$refs.mapCon.fitBounds(LatLngBounds);
    },
    inputBlur(name) {
      this.$refs[name].blur();
    },
    updateInputValue(type, scope) {
      if (scope.column.label == "h") {
        this.$set(
          this.form[type],
          scope.$index,
          Object.assign(this.form[type][scope.$index], {
            h: Number(Number(scope.row.h).toFixed(1))
          })
        );
      }
      this.$set(
        this[type],
        (this.page[type.slice(0, type.length - 1)] - 1) * this.page.pageSize +
          scope.$index,
        Object.assign({}, this.form[type][scope.$index])
      );
      this.updateTypeList(type);
    },
    checkForm() {
      this.$nextTick(() => {
        if (
          document.getElementsByClassName("is-error").length === 0 &&
          this.errorTips.indexOf("请完善表单数据") != -1
        ) {
          this.clearError("请完善表单数据");
        }
      });
    },
    changeSectionInfos(value) {
      this.form.sectionInfos = value;
      this.updateGlobalSetting();
    },
    // 水平分辨率/垂直分辨率blur
    resolutionBlur(name) {
      this.$refs.form.validateField(name, err => {
        if (!err) {
          if (this.form[name]) {
            this.updateGlobalSetting();
          }
        }
      });
    },
    // 保存基础参数
    updateGlobalSetting() {
      this.checkForm();
      let vm = this;
      let p = new Promise((resolve, reject) => {
        let param = Object.assign({}, vm.form);
        delete param.id;
        delete param.projectId;
        delete param.wts;
        delete param.masts;
        param.sectionInfo = param.sectionInfos;
        delete param.sectionInfos;
        vm.caculateHttps
          .updateGlobalSetting({
            projectId: vm.projectId,
            baseConf: param
          })
          .then(() => {
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
      return p;
    },
    // 机位点/测风塔激活按钮点击事件
    handlePoint(type, scope) {
      let $index =
        (type.length &&
          (this.page[type] - 1) * this.page.pageSize + scope.$index) ||
        scope.$index;
      if (this.status > 1) return;
      if (!this.form.terrain) return;
      this.$refs[type + "Table"].setCurrentRow(scope.row);
      this.$refs.mapCon.showLayer(type); //若该图层隐藏，则修改状态为显示
      this.curEditPointIndex = $index;
      this.curEditFormPointIndex = scope.$index;
      if (type === this.mapEditMode && this.curEditPointIndex === $index) {
        this.$refs.mapCon.restoreIcon();
        // this.resetMarker()
      } //else{
      this.mapEditMode = type;
      this.form.terrain &&
        this.form.terrain.xMax &&
        this.$refs.mapCon.setCurEditPoint(type, $index);
      // this.$refs.mapCon.mapRedraw();//点更新，重绘地图
      // }
    },
    // 地图点击触发修改风机/测风塔坐标
    setPointXY(type, coor) {
      this.$set(
        this[type + "s"],
        [this.curEditPointIndex],
        Object.assign(this[type + "s"][this.curEditPointIndex], {
          x: Number(coor[0].toFixed(1)),
          y: Number(coor[1].toFixed(1))
        })
      );
      this.$set(
        this.form[type + "s"],
        [this.curEditFormPointIndex],
        Object.assign(this.form[type + "s"][this.curEditFormPointIndex], {
          x: Number(coor[0].toFixed(1)),
          y: Number(coor[1].toFixed(1))
        })
      );
      // this.setMarkBound(this.form[type+'s'][this.curEditPointIndex]);//更新marker边界值
      this.getAllMarkerBound(type + "s"); //更新marker边界值
      if (this.checkPointInRect(type + "s")) {
        //点在面内保存，否则报错
        this.clearError(this.errTip.markOverflow);
        this.updateTypeList(type + "s");
      } else {
        this.unshiftError(this.errTip.markOverflow);
      }
    },
    // 添加错误提示
    unshiftError(error) {
      this.clearError(error);
      this.errorTips.unshift(error);
    },
    // 清除错误信息
    clearError(error) {
      let index = this.errorTips.indexOf(error);
      index >= 0 && this.errorTips.splice(index, 1);
    },
    setRowClass({ row, rowIndex }) {
      if (this.editMode == "mast" && this.curEditPointIndex == rowIndex) {
        return "warning-row";
      } else {
        return "";
      }
    },
    mastsTableHover(row, column, cell, event) {
      this.tableHover("mast", row, column, cell, event);
    },
    mastsTableLeave(row, column, cell, event) {
      this.tableLeave("mast", row, column, cell, event);
    },
    wtsTableHover(row, column, cell, event) {
      this.tableHover("wt", row, column, cell, event);
    },
    wtsTableLeave(row, column, cell, event) {
      this.tableLeave("wt", row, column, cell, event);
    },
    tableHover(type, row, column, cell, event) {
      let vm = this;
      if (!(vm.form.terrain && vm.form.terrain.wmsUrl && vm.$refs.mapCon)) {
        return;
      }
      for (let k = 0; k < this.form[type + "s"].length; k++) {
        let item = this.form[type + "s"][k];
        if (item.tag == row.tag) {
          // vm.$refs.mapCon.mouseover(type, k, item.tag)
          vm.$refs.mapCon.mouseover(
            type,
            k + (vm.page[type] - 1) * vm.page.pageSize,
            item.tag
          );
          break;
        }
      }
    },
    //框拂过变色
    selectStyle(index) {
      if(this.$refs.mapCon){
        this.$refs.mapCon.selectStyle(index);
      }
      
    },
    outStyle(index) {
      if(this.$refs.mapCon){
        this.$refs.mapCon.outStyle(index);
      }
      
    },
    tableLeave(type, row, column, cell, event) {
      let vm = this;
      if (!(vm.form.terrain && vm.form.terrain.wmsUrl && vm.$refs.mapCon)) {
        return;
      }
      for (let k = 0; k < this.form[type + "s"].length; k++) {
        let item = this.form[type + "s"][k];
        if (item.tag == row.tag) {
          if (!(vm.mapEditMode == type && vm.curEditPointIndex === k)) {
            // vm.$refs.mapCon.mouseout(type, k, item.tag)
            vm.$refs.mapCon.mouseout(
              type,
              k + (vm.page[type] - 1) * vm.page.pageSize,
              item.tag
            );
          }
          break;
        }
      }
    },
    // 子组件触发激活当前点
    setActiveMarker(type, index) {
      this.mapEditMode = type;
      this.curEditPointIndex = index;
      this.$refs[type + "Table"].setCurrentRow(this.form[type + "s"][index]);
      let name = (type == "mast" && "2") || 3;
      if (index > 0 && this.collapse.indexOf(name) == -1) {
        this.collapse.push(name);
      }
    },
    // 兴趣区域手动修改，绘制地图
    drawRect(name, index, item) {
      item[name] = item[name] && Number(Number(item[name]).toFixed(1));
      if (!item.minX || !item.maxX || !item.minY || !item.maxY) {
        return;
      }
      if (item.minX && item.maxX && item.minX >= item.maxX) {
        this.unshiftError("西北角的X值必须小于东南角的X值");
        
        return;
      } else {
        
        this.clearError("西北角的X值必须小于东南角的X值");
      }
      if (item.minY && item.maxY && item.minY >= item.maxY) {
        this.unshiftError("西北角的Y值必须大于东南角的Y值");
        
        return;
      } else {
        
        this.clearError("西北角的Y值必须大于东南角的Y值");
      }
      this.$refs.mapCon.drawRect(index);
      if (this.$refs.mapCon.rectOverflow) {
        // 兴趣区域出界报错，否则保存
        this.unshiftError(this.errTip.rectOverflow);
        return;
      } else if (this.$refs.mapCon.rectLessThanMin) {
        // 兴趣区域边长太小，否则保存
        this.clearError(this.errTip.rectOverflow);
        this.unshiftError(this.errTip.rectLessThanMin);
        return;
      } else {
        this.clearError(this.errTip.rectOverflow);
        this.clearError(this.errTip.rectLessThanMin);
        this.updateGlobalSetting();
      }
      if (this.checkPointInRect("wts") && this.checkPointInRect("masts")) {
        //点在面内保存，否则报错
        this.clearError(this.errTip.markOverflow);
      } else {
        this.unshiftError(this.errTip.markOverflow);
      }
    },
    validateTag(rule, value, callback) {
      let reg = /^[a-zA-Z0-9_.#-]{0,10}$/;
      if (!reg.test(value)) {
        this.unshiftError(
          ((rule.field.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastTag
        );
        callback(new Error(""));
      } else {
        this.clearError(
          ((rule.field.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastTag
        );
        callback();
      }
    },
    validateH(rule, value, callback) {
      if (!Number(value) || value === 0 || value <= 0 || value >= 1000) {
        this.unshiftError(
          ((rule.field.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastH
        );
        callback(new Error(""));
      } else {
        this.clearError(
          ((rule.field.startsWith("wts") && "机位点") || "测风塔") +
            this.errTip.wtMastH
        );
        callback();
      }
    },
    validateReH(rule, value, callback) {
      if (!Number(value) || value <= 1 || value > 50) {
        this.unshiftError(this.errTip.resolutionH);
        callback(new Error(""));
      } else {
        this.form.resolutionH = Number(Number(value).toFixed(1));
        this.clearError(this.errTip.resolutionH);
        callback();
      }
    },
    validateReV(rule, value, callback) {
      if (value <= 0.1 || value > 2) {
        this.unshiftError(this.errTip.resolutionV);
        callback(new Error(""));
      } else {
        this.form.resolutionV = Number(Number(value).toFixed(2));
        this.clearError(this.errTip.resolutionV);
        callback();
      }
    },
    getFileRoughness(check) {
      let vm = this;
      this.caculateHttps.getFileRoughness(this.projectId).then(res => {
        this.form.roughness = res;
        if (check) {
          if (res) {
            vm.rTimer = setTimeout(() => {
              vm.getFileRoughness(true);
            }, 1000);
          }
          this.$refs.cucaoFile.file = "";
          this.$refs.cucaoFile.fileData = "";
        }
      });
    },
    // 拖拽改变左右布局宽度
    dragFun() {
      let vm = this;
      let resize = this.$refs.dragLine;
      resize.onmousedown = e => {
        this.ondrag = true;
        this.dragOffsetX = e.offsetX;
        this.dragClientX = e.clientX;
        this.colLeftW = this.$refs.colLeft.$el.clientWidth;
        this.colRightW = this.$refs.colRight.$el.clientWidth;
        document.onmousemove = emove => {
          vm.dragChangeWidth(emove.clientX - vm.dragOffsetX - vm.dragClientX);
        };
        document.onmouseup = eup => {
          document.onmousemove = null;
          document.onmouseup = null;
          vm.dragChangeWidth(
            eup.clientX - vm.dragOffsetX - vm.dragClientX,
            true
          );
          resize.releaseCapture && resize.releaseCapture();
        };
        resize.setCapture && resize.setCapture();
        return false;
      };
    },
    dragChangeWidth(offset, isRelease) {
      if (this.colLeftW + offset < 100 || this.colRightW - offset < 100) {
        return;
      }
      this.$refs.colLeft.$el.style.width = this.colLeftW + offset + "px";
      this.$refs.colRight.$el.style.width =
        this.$refs.colRow.$el.clientWidth - this.colLeftW - offset - 13 + "px";
      this.$nextTick(() => {
        this.calMapHeight(isRelease);
      });
    },
    calMapHeight(isRelease) {
      if (!this.$refs.colRight) return;
      // let mapW = this.$refs.colRight.$el.offsetWidth
      // let calH = mapOptions.height*mapW/mapOptions.width
      // let minH = document.body.clientHeight - 245
      // if(calH > minH){
      //   this.mapH = minH
      // } else if(calH < mapOptions.height){
      //   this.mapH = mapOptions.height < minH && mapOptions.height || minH;
      // } else {
      //   this.mapH = calH
      // }
      if (document.body.clientHeight - 245 < mapOptions.height) {
        this.mapH =
          document.body.clientHeight - ((this.status > 1 && 155) || 245);
      } else {
        this.mapH =
          document.body.clientHeight - ((this.status > 1 && 155) || 320);
      }

      this.$nextTick(() => {
        isRelease &&
          this.form.terrain &&
          this.form.terrain.xMax &&
          this.$refs.mapCon &&
          this.$refs.mapCon.mapFitBounds(); //点更新，重绘地图
      });
    },
    // 检测是否有正在匹配中的粗糙度文件
    checkIsRoughnessGenerating() {
      let vm = this;
      this.clearError(this.errTip.roughnessLess);
      this.caculateHttps.getGlobalSetting(this.projectId).then(res => {
        this.$set(
          this.form,
          "isRoughnessGenerating",
          res.isRoughnessGenerating
        );
        if (res.isRoughnessGenerating) {
          vm.timer = setTimeout(() => {
            vm.checkIsRoughnessGenerating();
          }, 1000);
        } else {
          this.clearError(this.errTip.roughnessGenerating);
          this.$set(this.form, "roughness", res.roughness);
        }
      });
    }
  },
  watch: {
    terrainPer(cur) {
      if (cur > 0) {
        this.showTerrProgress = true;
      }
      if (cur == 0) {
        this.showTerrProgress = false;
      }
      if (cur == 100) {
        setTimeout(() => {
          this.terrainPer = 0;
          this.showTerrProgress = false;
        }, 2000);
      }
    },
    roughnessPer(cur) {
      if (cur > 0) {
        this.showRoughProgress = true;
      }
      if (cur == 0) {
        this.showRoughProgress = false;
      }
      if (cur == 100) {
        setTimeout(() => {
          this.roughnessPer = 0;
          this.showRoughProgress = false;
        }, 2000);
      }
    },
    status() {
      this.calMapHeight(true);
    },
    "form.masts"(cur) {
      cur.length && this.clearError(this.errTip.mastLess);
    }
  },
  destroyed() {
    clearTimeout(this.timer);
    this.timer = null;
    clearTimeout(this.rTimer);
    this.rTimer = null;
  }
};
</script>

<style lang="less">
.directional-calculation {
  position: relative;
  height: calc(100% - 48px);
  background: radial-gradient(
    circle at 50% 10%,
    #024a68,
    #001d2e,
    #001d2e
  ) !important;
  padding: 8px;
  .table-list {
    .el-table__body-wrapper {
      tr:hover,
      tr.current-row {
        background: url(/imgs/table-bg.png) no-repeat 2px 2px;
        background-size: calc(100% - 4px) 24px;
      }
    }
  }
  .el-form-item {
    &.is-error {
      .el-input__inner {
        border-color: @error !important;
      }
    }
    .error {
      .el-input__inner {
        border-color: @error !important;
      }
    }
    &.is-required:not(.is-no-asterisk) {
      > .el-form-item__label::before {
        color: transparent;
      }
    }
  }
  .form-item {
    font-size: 0;
    + .form-item {
      margin-top: 8px;
    }
  }
  .form-item-label {
    display: inline-block;
    width: 110px;
    text-align: right;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 28px;
    vertical-align: top;
    margin-right: 9px;
  }
  .icondingwei1 {
    width: 17px;
    height: 17px;
    line-height: 17px;
  }
  .el-collapse-item.no-padding:not(.is-active) {
    .el-collapse-item__wrap {
      display: block !important;
      height: 62px !important;
      transition: height 2s;
    }
  }
  .cal-row {
    /*min-width: 1174px;*/
    @map-width: 630px;
    @map-height: 450px;
    position: relative;
    display: flex;
    flex-direction: row;
    /*padding-right: 12px;*/
    .col-param {
      /*width: calc(100% - @map-width - 13px);*/
      width: calc(50% + 51px);
      max-width: calc(100vw - 270px);
      > .el-scrollbar {
        overflow: unset;
        .el-scrollbar__wrap {
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 6px;
          margin-right: 0 !important;
        }
        .el-scrollbar__bar {
          position: fixed;
          right: -8px;
        }
        /*定义滑块 内阴影+圆角*/
        ::-webkit-scrollbar-thumb {
          background-color: transparent;
        }
      }
      .form-cont {
        /*width: calc(100% - 649px);*/
        /*border-right: 1px dashed #2B678B;*/
        min-width: 626px;
        /*padding-right: 6px;*/
        /*min-height: calc(100vh - 164px);*/
      }
    }
    .drag-line {
      width: 28px;
      height: calc(100vh - 205px);
      position: relative;
      padding: 0 6px;
      &::before {
        content: url("/icon/resize.png");
        display: inline-block;
        width: 16px;
        height: 30px;
        position: absolute;
        left: 6px;
        top: 50%;
        margin-top: -15px;
        text-align: center;
        line-height: 30px;
        background-color: @tborder;
        border-radius: 2px;
        cursor: col-resize;
      }
      &::after {
        content: "";
        display: inline-block;
        width: 1px;
        height: 100%;
        border-left: 1px dashed @tborder;
        margin-left: 8px;
      }
      &.hidden {
        opacity: 0;
      }
    }
    .col-map {
      //width: @map-width;
      width: calc(50% - 13px);
      position: relative;
      //right: 0;
      //top: 0;
      /*flex:1;*/
      height: 100%;
      .tips-container {
        position: absolute;
        top: 460px;
        left: 0;
        width: 100%;
        overflow: auto;
        p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 6px;
          line-height: 2;
        }
        .error-tip {
          padding-top: 6px;
        }
      }
      .map-space .info {
        position: absolute;
        left: 1px;
        bottom: 1px;
        width: calc(100% - 2px);
        height: 24px;
        padding: 0 18px;
        line-height: 24px;
        background-color: rgba(0, 44, 70, 0.7);
        font-size: 12px;
        font-weight: 300;
        color: rgba(255, 255, 255, 1);
        text-shadow: 0px 1px 0px rgba(0, 29, 46, 1);
        z-index: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tuli {
        position: absolute;
        left: 17px;
        bottom: 24px;
        z-index: 501;
        padding-right: 3px;
        background: rgba(248, 245, 245, 0.4);
        .litop {
          padding-bottom: 5px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .li {
          .blo1 {
            display: inline-block;
            width: 24px;
            height: 13px;
          }
          .blo2 {
            display: inline-block;
            // width: 100px;
            height: 13px;
            margin-left: 6px;

            vertical-align: top;
            font-size: 12px;
            color: #666;
          }
        }
      }
      .map-loading {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        width: 100%;
        height: @map-height;
        background-color: rgba(0, 0, 0, 0.3);
        text-align: center;
        img {
          position: relative;
          width: 115px;
          height: 115px;
          top: 50%;
          margin-top: -65px;
        }
      }
    }
  }
  .el-table.form-no-border {
    .el-table__empty-block {
      min-height: 28px;
      height: 28px;
    }
    .cell {
      height: 24px;
      line-height: 24px;
    }
    .el-form-item__content {
      margin-left: 0 !important;
      height: 24px;
      line-height: 24px;
    }
    .el-input {
      width: 100%;
      max-width: 150px;
      height: 22px;
      .el-input__inner {
        border-color: transparent !important;
        padding: 0 !important;
        height: 18px !important;
        &::placeholder {
          font-size: 12px;
        }
        &:focus {
          border-color: #2b678b !important;
        }
      }
    }
    .el-form-item {
      margin-bottom: 0 !important;
    }
    .el-form-item.is-error {
      .el-input__inner {
        border-color: @error !important;
      }
    }
    .iconfont {
      cursor: pointer;
      &.active,
      &:hover {
        color: @highColor;
      }
      &.iconjianh:hover {
        color: @error;
      }
    }
  }
  .el-pagination {
    text-align: right;
  }
  .map {
    background-color: #002c46;
  }
  .param-set {
    background: rgba(0, 29, 46, 0.5);
    .set-btn {
      color: @highColor;
      display: block;
      cursor: pointer;
      font-size: 12px;
      height: 18px;
      line-height: 1;
      padding: 3px 6px;
      border: 1px solid transparent;
      &:hover {
        border-color: @highColor;
      }
    }
  }
  .interest-area {
    margin-bottom: 8px;
    > * {
      display: inline-block;
      vertical-align: top;
    }
    &::before {
      content: "";
      display: inline-block;
      width: 7px;
      height: 35px;
      border: 1px solid #2b678b;
      border-right: none;
      margin-top: 11px;
      margin-right: 4px;
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
        .el-form-item {
          display: inline-block;
          margin-bottom: 0;
        }
      }
    }
    .el-input {
      width: 138px;
      margin-right: 4px;
    }
    .handle-map {
      width: 60px;
      height: 60px;
      text-align: center;
      border: 1px solid #2b678b;
      color: rgba(255, 255, 255, 0.7);
      line-height: 60px;
      cursor: pointer;
      &:hover,
      &.active {
        border-color: @highColor;
      }
    }
    .add,
    .del {
      display: inline-block;
      width: 28px;
      height: 28px;
      margin-top: 16px;
      line-height: 28px;
      text-align: center;
      border: 1px solid #2b678b;
      cursor: pointer;
    }
    .del {
      border-left: none;
    }
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 14px;
    text-align: center;
    border-top: 1px solid #2b678b;
  }
}
</style>
