<template>
  <div class="plan-input" v-loading="loading" element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)"
       element-loading-text="正在保存数据...">
    <el-row class="cal-row" ref="colRow">
      <el-col ref="colLeft" class="col-param empty-form">
        <el-scrollbar :style="{height: (editAble ? 'calc(100vh - 204px)' : 'calc(100vh - 164px)')}">
          <div class="plan-name">
            方案名称：<span v-if="!editName">{{form.postProcessName}}</span>
            <i v-if="!editName" class="iconfont iconbianji1" @click="handleChangeName"></i>
            <el-input v-if="editName" ref="nameInput" v-model.trim="form.postProcessName" @keyup.enter.native="changeName" @blur="changeName"></el-input>
          </div>
          <el-form ref="form" :model="form" label-width="135px" class="empty-form form-cont" label-position="right"
                   :show-message="false" :rules="rules" :disabled="!editAble">
            <el-collapse v-model="collapse" ref="collapse" class="has-triangle" @change="collapseChange">
              <div @click.stop='curCollapse = 2' :class="{'active': curCollapse===2}">
                <el-collapse-item class="no-padding" name="2">
                  <template slot="title">
                    <span>测风塔坐标 <span v-if="formNumber.masts">{{formNumber.masts}}个</span></span>
                    <div @click.stop="curCollapse = 2" v-if="editAble" class="p-right" @click="resetMarker">
                      <!--<upload-btn file-type="MAST" @postWtMast="postWtMast" btn-text="文件上传"></upload-btn>-->
                      <upload-file :hasList="masts.length>1 || (form.masts.length==1 && form.masts[0].tag && form.masts[0].x && form.masts[0].y)"
                         file-type="MAST" btn-text="文件上传"
                         :climateFilePath.sync="form.climateFilePath"
                         :turbulenceFilePath.sync="form.turbulenceFilePath" :bucket.sync="form.bucket"
                         :percentage.sync="percentage"
                         @postWtMast="postWtMast"
                         :climateFiles="form.climateFiles"
                         :turbulenceFiles="form.turbulenceFiles"
                         @setClimateData="setClimateData"
                         @setTurbulenceData = "setTurbulenceData"></upload-file>
                      <el-button type="text" @click="addTableRow('masts')">新增</el-button>
                    </div>
                  </template>
                  <el-table ref="mastTable" :data="form.masts" class="table-list form-no-border"
                            @cell-mouse-enter="mastsTableHover"
                            @cell-mouse-leave="mastsTableLeave"
                            :row-class-name="setRowClass" highlight-current-row>
                    <el-table-column prop="tag" label="标签" min-width="80">
                      <template slot-scope="scope">
                        <el-form-item :prop="'masts['+scope.$index+'].tag'" required :rules="{ validator: validateTag, trigger: 'blur' }">
                          <el-input v-model.trim="scope.row.tag" :ref="'masttag'+scope.$index" :maxlength="10"
                            @keyup.enter.native="inputBlur('masttag'+scope.$index)" @blur="updateInputValue('masts', scope)"
                            @focus="onfocus('masts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="x" label="x" min-width="100">
                      <template slot-scope="scope">
                        <el-form-item :prop="'masts['+scope.$index+'].x'" required>
                          <el-input placeholder="X" v-model.trim="scope.row.x" :ref="'mastX'+scope.$index"
                            @keyup.enter.native="inputBlur('mastX'+scope.$index)" @blur="xyBlur('mast', scope.$index)"
                            @focus="onfocus('masts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="y" label="y" min-width="90">
                      <template slot-scope="scope">
                        <el-form-item :prop="'masts['+scope.$index+'].y'" required>
                          <el-input placeholder="尝试复制粘贴批量操作" v-model.trim="scope.row.y" :ref="'mastY'+scope.$index"
                                    @keyup.enter.native="inputBlur('mastY'+scope.$index)" @blur="xyBlur('mast', scope.$index)"
                                    @focus="onfocus('masts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="h" label="h" min-width="50">
                      <template slot-scope="scope">
                        <el-form-item :prop="'masts['+scope.$index+'].h'" required :rules="{ validator: validateH, trigger: ['blur', 'change'] }">
                          <el-input v-model.trim="scope.row.h" type="text" placeholder="[10,250]" :ref="'mastH'+scope.$index"
                                    @keyup.enter.native="inputBlur('mastH'+scope.$index)" @blur="updateInputValue('masts', scope)"
                                    @focus="onfocus('masts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="climateFile" min-width="106" label="测风数据匹配">
                      <template slot-scope="scope">
                        <el-form-item v-if="editAble" :prop="'masts['+scope.$index+'].climateFile'" required>
                          <el-select v-model="scope.row.climateFile" @change="climateFileChange(scope)">
                            <el-option v-for="option in form.climateFiles" :key="option.id" :value="String(option.id)" :label="option.fileName" :title="option.fileName"></el-option>
                          </el-select>
                        </el-form-item>
                        <span class="td-scroll-x" v-else>{{scope.row.climateName}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="0" prop="turbulenceMatrix" :show-overflow-tooltip="!editAble" min-width="90" label="湍流矩阵">
                      <template slot-scope="scope">
                        <el-form-item v-if="editAble" :prop="'masts['+scope.$index+'].turbulenceMatrix'">
                          <el-select v-if="isShowTurbu(scope)" v-model="scope.row.turbulenceMatrix"  @change="updateTypeList('masts')" clearable :placeholder="editAble ? '请选择' : ''">
                            <el-option v-for="option in form.turbulenceFiles" :key="option.id" :value="String(option.id)" :label="option.fileName"></el-option>
                          </el-select>
                        </el-form-item>
                        <span class="td-scroll-x" v-else>{{scope.row.turbulenceMatrix && form.turbulenceFiles.filter(v=>{return v.id == scope.row.turbulenceMatrix})[0].fileName}}</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="90" v-if="projectCanWrite">
                      <template slot-scope="scope">
                        <i class="iconfont icontubiaofenxi" v-if="scope.row.climateFile && scope.row.tag" @click="openWindParam(scope.row)"></i>
                        <i v-if="editAble" class="iconfont iconjingzhun" :class="[(mapEditMode === 'mast' && curEditPointIndex === (masts.length>form.masts.length && (page.mast-1)*page.pageSize+scope.$index || scope.$index)) ? 'active' : '']" :style="{marginLeft: (scope.row.climateFile && scope.row.tag) ? '10px' : '25px'}" @click.stop="handlePoint('mast', scope)"></i>
                        <i v-if="editAble" class="iconfont iconjianh" @click="deleteTableRow('masts', scope)"></i>
                      </template>
                    </el-table-column>
                  </el-table>
                  <windParamResult ref="windParam"></windParamResult>
                  <el-pagination ref="mastsPage" layout="prev, pager, next" :total="masts.length" :page-size="page.pageSize" hide-on-single-page :current-page='page.mast' @current-change="mastPageChange"></el-pagination>
                </el-collapse-item>
              </div>
              <div @click.stop='curCollapse = 3; getAllWtList()' :class="{'active': curCollapse===3}">
                <el-collapse-item class="no-padding" name="3">
                  <template slot="title">
                    <span>机位点坐标 <span v-if="formNumber.wts">{{formNumber.wts}}个</span></span>
                    <div @click.stop="curCollapse = 3" v-if="editAble" class="p-right" @click="resetMarker">
                      <upload-btn :hasList="wts.length>1 || (form.wts.length==1 && form.wts[0].tag && form.wts[0].x && form.wts[0].y)" file-type="WT" https="planHttps" :proId="projectId" :schemeId="id" @postWtMast="postWtMast" btn-text="文件上传"></upload-btn>
                      <!--<upload-file file-type="MAST" @postWtMast="postWtMast" btn-text="文件上传"></upload-file> -->
                      <el-button type="text" @click="addTableRow('wts')">新增</el-button>
                    </div>
                  </template>
                  <el-table ref="wtTable" :data="form.wts" class="table-list form-no-border"
                            @cell-mouse-enter="wtsTableHover"
                            @cell-mouse-leave="wtsTableLeave"
                            :cell-class-name="wtClassName"
                            :row-class-name="setRowClass" highlight-current-row row-click="rowClick">
                    <el-table-column prop="tag" label="标签" min-width="80">
                      <template slot-scope="scope">
                        <el-form-item :prop="'wts['+scope.$index+'].tag'" required :rules="{ validator: validateTag, trigger: 'blur' }">
                          <el-input v-model.trim="scope.row.tag" :ref="'wttag'+scope.$index" :maxlength="10"
                                    @keyup.enter.native="inputBlur('wttag'+scope.$index)" @blur="updateInputValue('wts', scope)"
                                    @focus="onfocus('wts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="x" label="x" min-width="100">
                      <template slot-scope="scope">
                        <el-form-item :prop="'wts['+scope.$index+'].x'" required>
                          <el-input placeholder="X" v-model.trim="scope.row.x" :ref="'wtX'+scope.$index"
                            @keyup.enter.native="inputBlur('wtX'+scope.$index)" @blur="xyBlur('wt', scope.$index)"
                            @focus="onfocus('wts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="y" label="y" min-width="90">
                      <template slot-scope="scope">
                        <el-form-item :prop="'wts['+scope.$index+'].y'" required>
                          <el-input placeholder="尝试复制粘贴批量操作" v-model.trim="scope.row.y" :ref="'wtY'+scope.$index"
                            @keyup.enter.native="inputBlur('wtY'+scope.$index)" @blur="xyBlur('wt', scope.$index)"
                            @focus="onfocus('wts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="h" label="h" min-width="50">
                      <template slot-scope="scope">
                        <el-form-item :prop="'wts['+scope.$index+'].h'" required :rules="{ validator: validateH, trigger: ['blur', 'change'] }">
                          <el-input v-model.trim="scope.row.h" type="text" placeholder="(0,1000)" :ref="'wtH'+scope.$index"
                                    @keyup.enter.native="inputBlur('wtH'+scope.$index)" @blur="updateInputValue('wts', scope)"
                                    @focus="onfocus('wts', scope)" @input="onInput"></el-input>
                        </el-form-item>
                      </template>
                    </el-table-column>
                    <el-table-column prop="powerCurveName" min-width="208" label="机型匹配">
                      <template slot-scope="scope">
                        <span class="td-scroll-x" v-if="!editAble">{{scope.row.fileName && nameFilter(scope.row.fileName) || ''}}</span>
                        <span v-if="editAble && powerCurveIndex != scope.$index" class="layer-select" :class="{'value': scope.row.powerCurveId && powerCurveFileObj[scope.row.powerCurveId], 'error': (!scope.row.powerCurveId || !powerCurveFileObj[scope.row.powerCurveId]) && submitClick}" @click="showCascader(scope)">{{scope.row.powerCurveId && powerCurveFileObj[scope.row.powerCurveId] || '请选择'}}
                          <i class="el-input__icon el-icon-arrow-down"></i></span>
                        <el-form-item v-if="editAble && powerCurveIndex== scope.$index" :prop="'wts['+scope.$index+'].powerCurveName'" required :rules="{ validator: validatePowerCurveName, trigger: ['blur', 'change'] }">
                          <el-cascader
                              :ref="'cascader'+scope.$index"
                              :disabled="!form.wts.length"
                              v-model="scope.row.powerCurveName"
                              :show-all-levels="false"
                              size='mini'
                              :options="form.powercurveFiles"
                              :props="{ expandTrigger: 'hover' }"
                              @change="handleChange(scope)"
                              @expand-change="expandChange(scope)"
                              @visible-change="visibleChange"
                          ></el-cascader>
                        </el-form-item>
                        <span v-if="editAble && scope.row.powerCurveId" class="btnb" @click="setToAll(scope.row,scope.$index)">
                          <i class="iconfont iconchenggong"></i>以下全部应用</span>
                        <!--<span v-if="!editAble">{{getModelName(scope.$index)}}</span>-->
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="66" v-if="editAble">
                      <template slot-scope="scope">
                        <i class="iconfont iconjingzhun" :class="[(mapEditMode === 'wt' && curEditPointIndex === (wts.length>form.wts.length && (page.wt-1)*page.pageSize+scope.$index || scope.$index)) ? 'active' : '']" @click.stop="handlePoint('wt', scope)"></i>
                        <i class="iconfont iconjianh" @click="deleteTableRow('wts', scope)"></i>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-pagination ref="wtsPage" layout="prev, pager, next" :total="wts.length" :page-size="page.pageSize" hide-on-single-page  :current-page='page.wt' @current-change="pageChange"></el-pagination>
                </el-collapse-item>
              </div>
              <div @click.stop='curCollapse = 4' :class="{'active': curCollapse===4}">
                <el-collapse-item class="param-set" name="4" disabled>
                  <template slot="title">
                    <span>参数设置</span>
                    <div @click.stop class="p-right">
                      <span @click="openSection" :disabled="!editAble" class="set-btn">扇区</span>
                      <span style="margin-left: 10px" @click="openTrustSet" class="set-btn">信任系数</span>
                    </div>
                    <trust-set ref="trustSet" :list.sync="wts" :masts.sync="masts" :disabled="!editAble"
                       :guaranteeTrust.sync="form.guaranteeTrust" :turbulenceTrust.sync="form.turbulenceTrust"></trust-set>
                    <section-num ref="sectionNum" :sectionIds.sync="form.sectionIds" :admSectionIds.sync="form.admSectionIds" :disabled="!editAble"></section-num>
                  </template>
                  <div class="param-row el-row">
                    <div class="param-col left">
                      <el-form-item label="主测风塔设置：" prop="densityMast" required>
                        <el-select v-model="form.densityMast">
                          <el-option v-for="item in form.masts" :key="item.tag" :label="item.tag" :value="item.tag"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item prop="densityValue" required :rules="{ validator: valDensityValue, trigger: 'blur' }">
                        <template slot="label"><span title="温压传感器高度处的空气密度">空气密度：</span></template>
                        <el-input type="text" v-model.trim="form.densityValue" placeholder="(0, 1.5]" ref="densityValue" @keyup.enter.native="inputBlur('densityValue')" @blur="resolutionBlur('densityValue')" title="温压传感器高度处的空气密度"></el-input> kg/m3
                      </el-form-item>
                      <el-form-item prop="densityHeight" required :rules="{ validator: valDensityHeight, trigger: 'blur' }">
                        <template slot="label"><span title="此处的高度为测风塔温压传感器的高度。测风塔处的海拔，系统会从地图中获取，此处填写测风塔温压传感器的高度即可">温压传感器高度：</span></template>
                        <el-input type="text" v-model="form.densityHeight" placeholder="[0, 250]" ref="densityHeight" @keyup.enter.native="inputBlur('densityHeight')" @blur="resolutionBlur('densityHeight')" title="此处的高度为测风塔温压传感器的高度。测风塔处的海拔，系统会从地图中获取，此处填写测风塔温压传感器的高度即可"></el-input> m
                      </el-form-item>
                      <el-form-item prop="wrgHeights">
                        <!--<el-autocomplete v-model="form.wrgHeights" :fetch-suggestions="wrgHeightsSearch"></el-autocomplete>-->
                        <template slot="label"><span title="计算完成后，生成wrg图谱的高度，可添加多个">绘图区域高度：</span></template>
                        
                        <el-select v-if="editAble" ref="wrgHeight" v-model="form.wrgHeights" title="计算完成后，生成wrg图谱的高度，可添加多个"
                            multiple
                            filterable
                            allow-create
                            collapse-tags
                            default-first-option
                            @change="wrgHeightChange"
                            @blur="wrgHeightBlur"
                            placeholder="绘图高度">
                          <el-option
                              v-for="item in wrgHeightsOptions"
                              :key="item"
                              :label="item"
                              :value="item">
                          </el-option>
                        </el-select>
                        <p v-else class="wrgHeights"><span v-for="(h, k) in form.wrgHeights" :key="h">{{h}}{{k!=form.wrgHeights.length-1 && ', ' || ''}}</span></p> m
                        
                      </el-form-item>
                    </div>
                    <div class="param-col right">
                      <el-form-item label="尾流模型：" label-width="110px" prop="wakeModel">
                        PARK模型
                      </el-form-item>
                      <el-form-item label="模型系数：" label-width="110px" prop="modelCoefficient" required :rules="{ validator: valModelCoefficient, trigger: 'blur' }">
                        <el-input type="text" v-model="form.modelCoefficient" placeholder="(0,1)" ref="modelCoefficient" @keyup.enter.native="inputBlur('modelCoefficient')" @blur="resolutionBlur('modelCoefficient')"></el-input>
                      </el-form-item>
                      <el-form-item label="折减系数：" label-width="110px" prop="reductionCoefficient" required :rules="{ validator: valReductionCoefficient, trigger: 'blur' }">
                        <el-input type="text" v-model="form.reductionCoefficient" placeholder="(0,1]" ref="modelCoefficient" @keyup.enter.native="inputBlur('reductionCoefficient')" @blur="resolutionBlur('reductionCoefficient')"></el-input>
                      </el-form-item>
                      <!--<el-form-item label="IEC版本：" label-width="110px" prop="modelCoefficient" required :rules="{ validator: valModelCoefficient, trigger: 'blur' }">-->
                        <!--<el-input type="text" v-model="form.modelCoefficient" placeholder="(0,1)" ref="modelCoefficient" @keyup.enter.native="inputBlur('modelCoefficient')" @blur="resolutionBlur('modelCoefficient')"></el-input>-->
                      <!--</el-form-item>-->
                    </div>
                  </div>
                </el-collapse-item>
              </div>
            </el-collapse>
          </el-form>
        </el-scrollbar>
      </el-col>
      <div ref="dragLine" class="el-col el-col-24 drag-line" :style="{height: (editAble ? 'calc(100vh - 204px)' : 'calc(100vh - 152px)')}"></div>
      <el-col ref="colRight" class="col-map">
        <!-- v-if="form.terrain && form.terrain.wmsUrl" -->
        <!--:diadom="form.refine.diadom"-->
        <div @click.stop>
          <map-container ref="mapCon" v-if="form.terrain && form.terrain.xMax" :mapH.sync="mapH" :terrain.sync="form.terrain" :roughness.sync="form.roughness" :mapEditMode.sync="mapEditMode" :wt-list="wts" :mast-list="masts" @click.stop :mesh="mesh" @setPointXY="setPointXY" :epsgNum.sync="form.epsgNum" :system.sync="system" @setActiveMarker="setActiveMarker" :angles="angles">
            <ul class="tuli" v-show='conventionalSigns.length'>
              <li class='litop'>海拔（米）</li>
              <li class="li" :key="item.to_color" v-for="item in conventionalSigns">
                <span
                  :style="{'background':'linear-gradient('+item.from_color+','+item.to_color+')'}"
                  class="blo1"
                ></span>
                <span class="blo2">{{item.from_value}}-{{item.to_value}}</span>
              </li>
            </ul>
          </map-container>
          <div v-else style="width: 100%; border: 1px solid #009FFF;" :style="{height: mapH+'px'}"></div>
          <div class="tips-container" :style="{top: mapH+'px', 'max-height': 'calc(100vh - '+mapH+'px - 203px)'}">
            <el-progress v-if="percentage>0 || showProgress" :percentage="percentage" color="linear-gradient(90deg,rgba(0,159,255,1),rgba(255,46,118,1));"></el-progress>
            <p v-if="percentage>0 || showProgress">文件上传中， 请稍等...</p>
            <p class="error-tip" v-if="errorTips.length">{{errorTips[0]}}</p>
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="footer" v-if="editAble">
      <el-button type="primary" @click="onSubmit">提交计算</el-button>
    </div>
  </div>
</template>
<script>
  import mapContainer from '@/components/project/map-container.vue'
  import uploadFile from '@/components/project/plan/upload-file.vue'
  import trustSet from '@/components/project/plan/trust-set.vue'
  import windParamResult from '@/components/project/plan/windParamResult.vue'
  import sectionNum from '@/components/project/plan/section.vue'
  import {fileConfig, FILE_TYPE} from '@/config/file.config'
  import cfdConfig from '@/config/cfd.config'
  import uploadBtn from '@/components/project/upload-btn.vue'
  import {mapOptions} from '@/config/map.config'

  export default {
    data() {
      return {
        conventionalSigns: [],
        loading: false,
        id: this.$route.params.id,
        projectId: this.$route.params.projectId,
        form: {
          "coordinateSystem": "",
          "densityHeight": 10,
          "densityMast": "",
          "densityValue": "",
          "epsgNum": "",
          "id": 0,
          "masts": [
            {
              "climateFile": "",
              "h": 0,
              "tag": "",
              "turbulenceMatrix": "",
              "x": 0,
              "y": 0
            }
          ],
          "modelCoefficient": 0,
          "postProcessName": "",
          "projectionSystem": "",
          "roughness": {
            "fileName": "",
            "id": 0
          },
          "sectionIds": [
            0
          ],
          "terrain": {
            "epsgNum": "",
            "fileName": "",
            "fileSize": 0,
            "id": 0,
            "projectId": 0,
            "wmsUrl": "",
            "xmax": 0,
            "xmin": 0,
            "ymax": 0,
            "ymin": 0
          },
          "wakeModel": "PARK模型",
          "wrgHeights": "",
          "wts": [
            {
              "h": 0,
              "tag": "",
              "trustCoefficient": 0,
              "turbineType": "",
              "x": 0,
              "y": 0
            }
          ],
          "zone": ""
        },
        editName: false,
        oldName: "",
        wts: [],
        masts: [],
        formNumber: {
          wts: '',
          masts: ''
        },
        rules: {
          resolutionH: [
            // {validator: ''}
          ]
        },
        curCollapse: 2,
        collapse: ['4'],
        allWts: false,//标记是否已获取全部的风机列表
        options: [
          {
            value: "常规模式",
            label: "常规模式"
          }
        ],
        disabled: false,
        fileType: FILE_TYPE,
        mapEditMode: '', //当前地图编辑模式
        errTip: cfdConfig.errTip,
        errorTips: [], //错误提示文字,
        curEditPointIndex: '', //当前激活机位点/测风塔在所有列表中的索引
        curEditFormPointIndex: '', //当前激活机位点/测风塔在当前显示页中的索引
        powerCurveIndex: null, // 标记当前编辑机型匹配select 索引
        markBound: { //marker边界
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
        wrgHeightsOptions: [ '80', '85', '90', '100', '120', '125', '130', '140'],
        percentage: 0,
        showProgress: false,
        sortObj: {
          tab: '',
          x: '',
          y: '',
          h: ''
        },
        focusInput: {},
        mapH: mapOptions.height, //动态计算地图高度
        dragOffsetX: 0,
        dragClientX: 0,
        colLeftW: 0,
        colRightW: 0,
        page: {
          pageSize: 25,
          wt: 1,
          mast: 1
        },
        powerCurveFileObj: {},
        submitClick: false,
        angles:null,
      }
    },
    components: {
      mapContainer,
      uploadFile,
      trustSet,
      sectionNum,
      uploadBtn,
      windParamResult
    },
    computed: {
      mesh(){
        return {
          minX: this.form.minX,
          maxY: this.form.maxY,
          maxX: this.form.maxX,
          minY: this.form.minY,
        }
      },
      system(){
        return {
          projectionSystem: this.form.projectionSystem,
          coordinateSystem: this.form.coordinateSystem,
          zone: this.form.zone
        }
      },
      status(){
        return this.form.status || 0
      },
      editAble(){ // status为计算中1or计算完成2不可编辑
        return this.status != 1 && this.status != 2 && this.form.wakeModel != '致动盘'
      },
      projectCanWrite (){
        let bool = true
        this.projectId == this.$store.state.curProjectId && (bool = this.$store.state.projectCanWrite)
        return  bool
      }
    },
    props: [],
    mounted() {
      this.init()
      this.$nextTick(()=>{
        this.initDom()
        this.dragFun()
      })
    },
    methods: {
      init() {
        if(!this.id){
          this.$router.push('/project/planList')
          return;
        }
        this.getScheme();
      },
      initDom() {
        let vm = this;
        // if((document.body.clientHeight - 245) < mapOptions.height){
        //   this.mapH = (document.body.clientHeight - 245)
        // }
        this.calMapHeight(true)
        window.onresize = ()=>{
          this.calMapHeight(true)
        }
        document.onclick = () => {
          vm.resetMarker()
        }
      },
      // 拖拽改变左右布局宽度
      dragFun(){
        let vm = this
        let resize = this.$refs.dragLine
        if(!resize) return;
        resize.onmousedown = e =>{
          this.ondrag = true
          this.dragOffsetX = e.offsetX;
          this.dragClientX = e.clientX;
          this.colLeftW = this.$refs.colLeft.$el.clientWidth;
          this.colRightW = this.$refs.colRight.$el.clientWidth;
          document.onmousemove = emove=>{
            vm.dragChangeWidth(emove.clientX - vm.dragOffsetX - vm.dragClientX);
          }
          document.onmouseup = eup=>{
            document.onmousemove = null;
            document.onmouseup = null;
            vm.dragChangeWidth(eup.clientX - vm.dragOffsetX - vm.dragClientX, true);
            resize.releaseCapture && resize.releaseCapture();
          }
          resize.setCapture && resize.setCapture();
          return false;
        }
      },
      // 清除所有地图可编辑项目
      resetMarker(){
        let vm = this;
        if(this.mapEditMode == '') return;
        this.mapEditMode = ''
        this.curEditPointIndex = ''
        if(vm.$refs['mastTable'] && vm.$refs['mastTable'].$el.getElementsByClassName("current-row").length){
          vm.$refs['mastTable'].$el.getElementsByClassName("current-row")[0].className = 'el-table__row'
        }
        if(vm.$refs['wtTable'] && vm.$refs['wtTable'].$el.getElementsByClassName("current-row").length){
          vm.$refs['wtTable'].$el.getElementsByClassName("current-row")[0].className = 'el-table__row'
        }
        this.$refs.mapCon && this.$refs.mapCon.restoreIcon()
      },
      // 打开修改名称input
      handleChangeName(){
        this.editName = true;
        this.oldName = this.form.postProcessName;
        this.$nextTick(()=>{
          this.$refs.nameInput.focus()
        })
      },
      openTrustSet(){
        this.$refs.trustSet.showDialog()
      },
      openSection(){
        this.$refs.sectionNum.showDialog()
      },
      // 修改名称
      changeName(){
        this.$refs.nameInput.blur()
        this.editName = false;
        if(!this.form.postProcessName) {
          this.form.postProcessName = this.oldName
          return;
        }
        this.planHttps.changeName(this.projectId, this.id, this.form.postProcessName).then(res => {
          this.oldName = this.form.postProcessName
        })
      },
      // 获取方案详细信息
      getScheme(){
        this.planHttps.getScheme(this.projectId, this.id).then(res => {
          if(!res.sectionInfos){
            res.sectionInfos = []
          };
          if(res.multiRefine){
            this.angles = res.multiRefine;
          };
          this.form = res;
          if (res.terrain && res.terrain.conventionalSigns && res.terrain.conventionalSigns.length) {
          this.conventionalSigns = res.terrain.conventionalSigns;
        }
          res.masts && (this.formNumber.masts = res.masts.length)
          if(this.form.masts && this.form.masts.length){
            this.masts = JSON.parse(JSON.stringify(res.masts))
            res.masts.length>this.page.pageSize && (this.form.masts = JSON.parse(JSON.stringify(res.masts)).slice(0, this.page.pageSize))
          }else{
            this.form.masts = [];
            // res.status<2 && this.addTableRow('masts')
          }
          !this.form.resolutionH && (this.form.resolutionH = 25)
          !this.form.resolutionV && (this.form.resolutionV = 2)
          !this.form.densityHeight && (this.form.densityHeight = 10)
          !this.form.modelCoefficient && (this.form.modelCoefficient = 0.5)
          !this.form.reductionCoefficient && this.form.reductionCoefficient !== 0 && (this.form.reductionCoefficient = 1)
          this.$set(this.form, 'powercurveFiles', this.filterPowerCurveName(res.powercurveFiles))
          this.getAllWtList()
          this.initPowerCurveFiles(res.powercurveFiles)
          this.$nextTick(()=>{
            this.$refs.form && this.$refs.form.clearValidate() //移除表单项的校验结果
            this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon && this.$refs.mapCon.mapRedraw();//点更新，重绘地图
            this.$refs.sectionNum && this.$refs.sectionNum.initTable();
          })
        })
      },
      // 格式化机型匹配下拉列表 根据value获取label
      initPowerCurveFiles(list){
        let vm = this;
        list.forEach(v => {
          if(v.children && v.children.length){
            vm.initPowerCurveFiles(v.children)
          } else {
            vm.$set(vm.powerCurveFileObj, v.value, v.label)
          }
        })
      },
      // 筛选非机型和湍流组合不可选
      filterPowerCurveName(powercurveFiles){
        let vm = this;
        return powercurveFiles && powercurveFiles.map(v=>{
          if(v.children){
            vm.filterPowerCurveName(v.children)
          }else{
            if(!v.label.includes('-')){
              v.disabled = true
            }
          }
          return v
        })
      },
      // 获取测风塔/风机边界
      getAllMarkerBound(type){
        let vm = this;
        this.markBound[type] = {
          minX: '',
          maxY: '',
          maxX: '',
          minY: ''
        }
        this[type].forEach(v => {
          vm.setMarkBound(v, type)
        })
      },
      // 设置mark边界
      setMarkBound(v, type){
        if(!this.markBound[type].minX){
          this.markBound[type] = {
            minX: v.x,
            maxY: v.y,
            maxX: v.x,
            minY: v.y
          }
          return
        }
        (v.x < this.markBound[type].minX) && (this.markBound[type].minX = v.x);
        (v.x > this.markBound[type].maxX) && (this.markBound[type].maxX = v.x);
        (v.y < this.markBound[type].minY) && (this.markBound[type].minY = v.y);
        (v.y > this.markBound[type].maxY) && (this.markBound[type].minY = v.y);
      },
      // 检测测风塔/风机所有点是否都在兴趣区域中
      checkPointInRect(type){
        // let success = true;
        // if(this.markBound[type].minX && this.form.minX){
        //   if(this.markBound[type].minX < Math.min(this.form.minX, this.form.maxX) || this.markBound[type].maxX > Math.max(this.form.minX, this.form.maxX) || this.markBound[type].minY < Math.min(this.form.minY, this.form.maxY) || this.markBound[type].maxY > Math.max(this.form.minY, this.form.maxY)){
        //     success = false
        //   }
        // }
        // return success;
        let xarr=[];

        let yarr=[];

              
              for(let it of this.angles){
                 xarr.push(it.minX,it.maxX);
                 yarr.push(it.minY,it.maxY);               
              }
              //  debugger
      let maxX = Math.max(...xarr);
      let minX = Math.min(...xarr);
      let minY = Math.min(...yarr);
      let maxY = Math.max(...yarr);
      let success = true;
      if (this.markBound[type].minX && minX) {
        if (
          this.markBound[type].minX <minX ||
          this.markBound[type].maxX >maxX ||
          this.markBound[type].minY <minY||
          this.markBound[type].maxY > maxY
        ) {
          success = false;
        }
      }
      return success;
      },
      getFileTerrain(){
        // this.caculateHttps.getFileTerrain(this.projectId)
      },
      collapseChange(){
        // 默认不渲染机位点dom，展开再渲染
        if(this.collapse.includes('3') && this.wts.length>=1 && this.form.wts.length == 1){
          if(this.wts.length > this.page.pageSize){
            this.form.wts = JSON.parse(JSON.stringify(this.wts.slice(0, this.page.pageSize)));
          }else{
            this.form.wts = JSON.parse(JSON.stringify(this.wts));
          }
        }
      },
      // 获取所有风机列表
      getAllWtList(call){
        if(this.allWts) {
          return;
        }
        this.planHttps.getAllWtList(this.projectId, this.id).then(res => {
          this.wts = res && res.length && res.map(v=>{
            return Object.assign(v, {
              powerCurveName: v.powerCurveName && (v.powerCurveName.startsWith('[') && JSON.parse(v.powerCurveName) || [v.powerCurveName]) || v.powerCurveName
            })
          }) || []
          this.page.wt = 1
          
          this.getAllMarkerBound('wts')
          this.$nextTick(()=>{
            this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon && this.$refs.mapCon.mapRedraw();//点更新，重绘地图
          })
          this.formNumber.wts = this.wts.length
          try {
            call()
          }catch (e) {
            console.log(e)
          }
        })
        this.allWts = true;
      },
      // 测风塔/机位xy blur时触发
      xyBlur(type, index){
        // this.$refs.mapCon.mapRedraw();//点更新，重绘地图
        if(!this.form[type+'s'][index]){
          return;
        }
        this.$set(this[type+'s'], (this.page[type]-1)*this.page.pageSize+index, Object.assign({}, this.form[type+'s'][index]))
        this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon.movePoint(type, index);
        // this.setMarkBound(this.form[type+'s'][this.curEditPointIndex || index]);//更新marker边界值
        this.getAllMarkerBound(type+'s'); // 更新marker边界值
        this.updateTypeList(type+'s')
        if(this.checkPointInRect(type+'s')){ // 点在面内保存，否则报错
          this.clearError(this.errTip.markOverflow)
        }else{
          this.unshiftError(this.errTip.markOverflow)
        }
      },
      // 更新风机/测风塔列表
      updateTypeList(type){
        let p = new Promise((resolve, reject)=>{
          this.validateMastsWts(type).then(()=>{
            this.checkForm()
            this.planHttps[ type === 'masts' && 'uploadMastList' || type === 'wts' && 'uploadWtList']({
              projectId: this.projectId,
              scheme_id: this.id,
              list: this[type]
            }).then(() => {
              this.formNumber[type] = this[type].length
              resolve()
            }).catch(()=>{
              this.loading = false
            })
          })
        })
        return p
      },
      pageChange(num){
        this.page.wt = num
        this.$set(this.form, 'wts', this.wts.slice(this.page.pageSize*(num-1), this.page.pageSize*num))
        this.clearValidateMastsWts('wts')
      },
      mastPageChange(num){
        this.page.mast = num
        this.$set(this.form, 'masts', this.masts.slice(this.page.pageSize*(num-1), this.page.pageSize*num))
        this.clearValidateMastsWts('masts')
      },
      // 测风数据匹配-change
      climateFileChange(scope){
        this.$set(this.masts[(this.page.mast-1)*this.page.pageSize+scope.$index], 'climateFile', scope.row.climateFile);
        this.updateTypeList('masts')
      },
      //
      showCascader(scope){
        !this.collapse.includes("3") && this.collapse.push("3") && this.collapseChange()
        this.powerCurveIndex = scope.$index;
        this.$nextTick(()=>{
          if(scope.row.powerCurveId){
            setTimeout(()=>{
              this.$refs['cascader'+scope.$index].toggleDropDownVisible(true)
            }, 10)
          }else{
            this.$refs['cascader'+scope.$index].toggleDropDownVisible(true)
          }
          //如果已点击 提交计算，则需要校验当前表单项
          this.submitClick && this.$refs.form.validateField(`wts[${scope.$index}].powerCurveName`);
        })
      },
      // 机型匹配-change
      handleChange(scope) {
        if(!scope.row.powerCurveName || scope.row.powerCurveName.length == 0) return;
        this.$set(this.form.wts[scope.$index], 'powerCurveId', scope.row.powerCurveName[scope.row.powerCurveName.length - 1])
        this.$set(this.wts, (this.page.wt-1)*this.page.pageSize+scope.$index, this.form.wts[scope.$index])
        this.updateTypeList('wts')
      },
      expandChange(scope){
        console.log(1)
        // console.log(this.$refs['cascader'+scope.$index].getCheckedNodes())
        this.$nextTick(()=>{
          setTimeout(()=>{
            $(".el-cascader__dropdown .el-cascader-menu:last li").each((k,item) => {
              if($(item).text().endsWith('-Group') && $(item).next() && !$(item).next().text().endsWith('-Group')){
                $(item).addClass('group')
              }
            })
          }, 100)
        })
      },
      visibleChange(bool){
        if(bool){
          // console.log(this.$refs['cascader'+scope.$index].getCheckedNodes())
          
        }
      },
      // 以下全部应用
      setToAll(row,$index) {
        let vm = this
        vm.form.wts.map((v, k) => {
          if(k >= $index){
            vm.$set(vm.form.wts, k, Object.assign(v, {
              powerCurveName: row.powerCurveName,
              powerCurveId: row.powerCurveId
            }))
          }
          vm.$nextTick(()=>{
            vm.$refs.form.validateField(`wts[${k}].powerCurveName`);
          })
        });
        let errs = vm.errorTips.filter(v=>{
          return v.includes('轮毂高度与叶轮半径')
        })
        errs.map(v=>{
          vm.clearError(v)
        })
        vm.wts.map((v, k) => {
          if(k >= ((vm.page.wt-1)*vm.page.pageSize+$index)){
            vm.$set(vm.wts, k, Object.assign(v, {
              powerCurveName: row.powerCurveName,
              powerCurveId: row.powerCurveId
            }))
            vm.$refs.form.validateField('wts['+k+'].h')
          }
        })
      },
      validatePowerCureId(){
        let vm = this, success = true;
        for(let k=0; k < this.wts.length; k++){
          let v = vm.wts[k];
          if(!v.powerCurveId) {
            success = false
            !this.collapse.includes("3") && this.collapse.push("3") && this.collapseChange()
            vm.$refs['wtsPage'].handleCurrentChange(Math.ceil((k+1) / vm.page.pageSize))
            vm.pageChange(Math.ceil((k+1) / vm.page.pageSize))
            
            break;
          }
        }
        return success
      },
      openWindParam(row) {
        this.$refs.windParam.showDialog(this.form.climateFiles, row.climateFile, row.tag);
      },
      // 提交计算
      onSubmit() {
        let vm = this;
        vm.submitClick = true;
        vm.errorTips = []
        if(!vm.form.wts.length){
          vm.errorTips.push(vm.errTip.wtLess)
        }
        if(!vm.form.masts.length){
          vm.errorTips.push(vm.errTip.mastLess)
        }
        if(!vm.checkPointInRect('masts') || !vm.checkPointInRect('wts')){
          vm.errorTips.push(vm.errTip.markOverflow)
        }
        this.$refs.form.validate(valid => {
          if(!vm.validatePowerCureId()) return;
          if(valid){
            Promise.all([vm.validateMastsWtsNew('masts'), vm.validateMastsWtsNew('wts')]).then(vals => {
              if(vals[0] && vals[1]) {
                vm.clearError("请输入完整信息");
                setTimeout(()=>{
                  if(vm.errorTips.length) return;
                  vm.loading = true;
                  Promise.all([this.updateTypeList('wts'), this.updateTypeList('masts'), this.updateGlobalSetting(), this.$refs.sectionNum.confirm()]).then(res=>{
                    vm.schemeRun().then(res=>{
                      vm.loading = false;
                      // 提交综合后应关闭当前综合方案页卡
                      if(vm.$store.state.routeList.length){
                        let routeNames = vm.$store.state.routeList.map(v=>{return v.name})
                        vm.$store.commit('delRouteList', routeNames.indexOf('plan'));
                      }
                      // 提交计算方法
                      vm.$router.push({name: 'planList', params: {projectId: vm.projectId}})
                    }).catch(()=>{
                      vm.loading = false;
                    })
                  }).catch(err=>{
                    vm.loading = false;
                  })
                }, 1000)
              }else {
                vm.errorTips.push("请完善表单数据")
              }
            })
          }else {
            vm.loading = false;
            vm.errorTips.push("请输入完整信息")
            vm.validateMastsWts('wts', true)
            vm.validateMastsWts('masts')
          }
        })
      },
      schemeRun(){
        let vm = this, p = new Promise((resolve, reject) => {
          vm.planHttps.schemeRun({
            projectId: vm.projectId,
            scheme_id: vm.id,
          }).then(res=>{
            resolve()
          }).catch(()=>{
            reject()
          })
        })
        return p
      },
      // 获取测风塔/风机当前新增索引号
      getIndexOfList(type){
        let p = new Promise(resolve => {
          if(this[type].length==0) {
            resolve('01')
            return
          }
          let tags = this[type].map(v=>{
            return v.tag
          })
          let start = type == 'masts' ? 'M' : 'F';
          for(let k=1; k<=this[type].length; k++){
            if(tags.indexOf(start + (k<10 ? '0'+k : k)) == -1){
              resolve((k<10 ? '0'+k : k))
              break
            }
            if(k == this[type].length){
              resolve((k<9 ? '0'+(k+1) : (k+1)))
            }
          }
        })
        return p
      },
      // 新增测风塔坐标，机位点坐标
      addTableRow(formData) {
        let vm = this;
        if(!this.form[formData]) this.form[formData] = []
        vm.getIndexOfList(formData).then(k => {
          if(formData == 'masts'){
            !this.collapse.includes("2") && this.collapse.push("2")
            this.validateMastsWts(formData).then(()=>{
              let H = vm.form[formData].length && vm.form[formData][vm.form[formData].length - 1].h || 90
              this[formData].push({
                tag: 'M' + k,
                x: '',
                y: '',
                h: H,
                climateFile: '',
                turbulenceMatrix: '',
              })
              // 如果有分页，则切换到最后一页添加
              if (vm[formData].length > vm.page.pageSize) {
                vm.$refs[formData+'Page'].handleCurrentChange(Math.ceil(vm[formData].length / vm.page.pageSize))
                vm.mastPageChange(Math.ceil(vm[formData].length / vm.page.pageSize))
              }else{
                vm.form[formData].push({tag: 'M' + k, x: '', y: '', h: H, climateFile: '', turbulenceMatrix: ''})
              }
              setTimeout(()=>{
                vm.$refs['mastX' + (vm.form[formData].length - 1)].focus()
                vm.form.terrain && vm.form.terrain.xMax && vm.$refs.mapCon.mapRedraw();//点更新，重绘地图
              }, 300)
            })
          }
          if(formData == 'wts'){
            !this.collapse.includes("3") && this.collapse.push("3") && this.collapseChange()
            if(!this.allWts){
              vm.getAllWtList(()=>{
                setTimeout(()=>{
                  vm.validateMastsWts(formData).then(()=>{
                    let H = vm.form[formData].length && vm.form[formData][vm.form[formData].length - 1].h || 90
                    vm[formData].push({tag: 'F' + k, x: '', y: '', h: H, guaranteePolicyName: '0',
                      turbulencePolicyName: '0',
                      powerCurveName:[],
                      powerCurveId: ''})
                    // 如果有分页，则切换到最后一页添加
                    if (vm[formData].length > vm.page.pageSize) {
                      vm.$refs[formData+'Page'].handleCurrentChange(Math.ceil(vm[formData].length / vm.page.pageSize))
                      vm.pageChange(Math.ceil(vm[formData].length / vm.page.pageSize))
                    }else{
                      vm.form[formData].push({tag: 'F' + k, x: '', y: '', h: H, guaranteePolicyName: '0',
                        turbulencePolicyName: '0',
                        powerCurveName:[],
                        powerCurveId: ''})
                    }
                    setTimeout(()=>{
                      vm.$refs['wtX' + (vm.form[formData].length - 1)].focus()
                      vm.form.terrain && vm.form.terrain.xMax && vm.$refs.mapCon.mapRedraw();//点更新，重绘地图
                    }, 300)
                  })
                },20)
              });
            }else {
              vm.$nextTick(()=>{
                this.validateMastsWts(formData).then(()=>{
                  let H = vm.form[formData].length && vm.form[formData][vm.form[formData].length - 1].h || 90
                  this[formData].push({tag: 'F' + k, x: '', y: '', h: H, guaranteePolicyName: '0',
                    turbulencePolicyName: '0',
                    powerCurveName:[],
                    powerCurveId: ''})
                  // 如果有分页，则切换到最后一页添加
                  if (vm[formData].length > vm.page.pageSize) {
                    vm.$refs[formData+'Page'].handleCurrentChange(Math.ceil(vm[formData].length / vm.page.pageSize))
                    vm.pageChange(Math.ceil(vm[formData].length / vm.page.pageSize))
                  }else{
                    vm.form[formData].push({tag: 'F' + k, x: '', y: '', h: H,
                      turbulencePolicyName: '0',
                      powerCurveName:[],
                      powerCurveId: ''})
                  }
                  setTimeout(()=>{
                    // vm[formData].push(JSON.parse(JSON.stringify(vm.form[formData].slice(-1)))[0])
                    vm.$refs['wtX' + (vm.form[formData].length - 1)].focus()
                    this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon.mapRedraw();//点更新，重绘地图
                  }, 300)
                })
              })
            }
          }
        })
        
      },
      // 记录当前编辑表单项-用于input事件
      onfocus(type, scope){
        this.focusInput = {
          type: type,
          rowIndex: scope.$index
        }
      },
      // 监听表单输入事件 - 批量复制粘贴功能
      onInput(e){
        let arr = [], vm = this;
        //针对三种情况 csv 逗号和空格隔开 全部空格隔开 tab和空格隔开
        if(e.indexOf('\t')>-1){
          let deleteArr = [].concat(e.split(' '));
          arr = deleteArr.map((item,index)=>{
            return item.split('\t');
          })
        }else if(e.indexOf(',')>-1){
          let deleteArr = [].concat(e.split(' '));
          arr = deleteArr.map((item,index)=>{
            return item.split(',');
          })
        }else if((e.length-e.replace(/ /g,'').length)>1){
          String.prototype.ResetBlank=function(){
            var regEx = /\s+/g;
            return this.replace(regEx, ' ');
          };
          let str = e.ResetBlank();
          arr = _.chunk(str.split(' '),4);
        }
        if(arr.length){
          this.sortArr(arr[0]);
          let orderArr = [];
          _.map(arr,item=>{
            let obj = {
              tag: item[vm.sortObj.tag],
              x: item[vm.sortObj.x],
              y: item[vm.sortObj.y],
              h: item[vm.sortObj.h]
            }
            if(this.focusInput.type == 'masts'){
              orderArr.push(Object.assign({
                climateFile: '',
                turbulenceMatrix: '',
              }, obj))
            }else{
              orderArr.push(Object.assign({
                trustCoefficient: 2,
                turbineType: '',
                turbulenceTrust: 2,
                powerCurveId: '',
                powerCurveName: ""
              }, obj))
            }
          })
          let list = JSON.parse(JSON.stringify(vm[vm.focusInput.type]));
          list.splice((vm.page[vm.focusInput.type.slice(0, vm.focusInput.type.length-1)] - 1) * vm.page.pageSize + vm.focusInput.rowIndex, 1)
          // 如果原来的输入框中存在值A，则目前输入框中内容为A+复制的内容，应仅显示复制的内容，去掉A
          let tagArr = orderArr.map(v => {
            return v.tag
          });
          let newArr = []
          if(list.length){
            for(let i=0; i<list.length; i++){
              let v = list[i]
              if(tagArr.indexOf(v.tag) == -1){
                newArr.push(v)
              }
              if(i == list.length-1){
                // 跟新总的风机/测风塔
                vm[vm.focusInput.type] = JSON.parse(JSON.stringify(newArr)).concat(orderArr)
                // 如果有分页，则切换到最后一页添加
                if (vm[vm.focusInput.type].length > vm.page.pageSize) {
                  vm.$refs[vm.focusInput.type+'Page'].handleCurrentChange(Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize))
                  vm[vm.focusInput.type == 'wts' && 'pageChange' || 'mastPageChange'](Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize))
                }else{
                  vm.$set(vm.form, vm.focusInput.type, newArr.concat(orderArr).slice(0, 25))
                }
              }
            }
          }else{
            // 跟新总的风机/测风塔(拼接最后一页到原有数组后)
            vm[vm.focusInput.type] = orderArr
            // 如果有分页，则切换到最后一页添加
            if (vm[vm.focusInput.type].length > vm.page.pageSize) {
              vm.$refs[vm.focusInput.type+'Page'].handleCurrentChange(Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize))
              vm[vm.focusInput.type == 'wts' && 'pageChange' || 'mastPageChange'](Math.ceil(vm[vm.focusInput.type].length / vm.page.pageSize))
            }else{
              vm.$set(vm.form, vm.focusInput.type, orderArr)
            }
          }
          setTimeout(()=>{
            this.$refs.mapCon.mapRedraw(); //点更新，重绘地图
          }, 300)
        }
      },
      sortArr(arr){
        arr.map((item,index)=>{
          if(item>1&&item<200){
            this.sortObj.h = index;
          }else if((item>=100000&&item<1000000) || (item>=10000000&&item<100000000)){
            this.sortObj.x = index;
          }else if(item>=1000000&&item<10000000){
            this.sortObj.y = index;
          }else{
            this.sortObj.tag = index;
          }
        })
      },
      // 测风塔/风机表单校验
      validateMastsWts(formData, isSubmit){
        let vm = this, valid = true;
        let keys = ['tag', 'x', 'y', 'h'];
        formData == 'masts' && (keys = keys.concat(['climateFile']))
        // 新增不校验机型匹配，提交计算时校验
        formData == 'wts' && isSubmit && (keys = keys.concat(['powerCurveName']))
        let p = new Promise((resolve)=>{
          if(!vm.form[formData] || !vm.form[formData].length) {
            resolve()
          }else{
            vm.form[formData].forEach((v, i, arr1) => {
              keys.forEach((w, j, arr2) => {
                // 挨个校验表单项
                vm.$refs.form.validateField(formData+'['+i+'].'+w, error => {
                  if(!error) {
                    if(i== arr1.length-1 && j == arr2.length-1 && valid) {
                      resolve()
                    }
                  }else{
                    valid = false
                    if(vm.collapse.indexOf(formData == 'masts' && '2' || '3') == -1){
                      vm.collapse.push(formData == 'masts' && '2' || '3')
                      vm.$refs.collapse.setActiveNames(vm.collapse)
                    }
                  }
                })
              })
            })
          }

        })
        return p;
      },
      // 校验不在当前页页的表单项（机位点/测风塔）
      validateMastsWtsNew(type){
        let vm = this;
        let keys = ['tag', 'x', 'y', 'h'];
        type == 'masts' && (keys = keys.concat(['climateFile']))
        type == 'wts' && (keys = keys.concat(['powerCurveName']))
        let p = new Promise((resolve)=>{
          for(let i=0; i<vm[type].length; i++){
            let item = vm[type][i];
            for(let j=0; j<keys.length; j++){
              let jtem = keys[j];
              if(!eval('vm.'+'myValidate' + jtem + '("' + item[jtem] + '", "'+ type + '")')){
                console.log(i+ ' ' + j + jtem)
                vm[type == 'wts' && 'pageChange' || 'mastPageChange'](Math.ceil((i + 1) / vm.page.pageSize))
                return false;
              }
              if(i == vm[type].length-1 && j == keys.length-1){
                resolve(true)
              }
            }
          }
        })
        return p;
      },
      myValidatetag(value, type){
        let reg = /^[a-zA-Z0-9_.#-]{0,10}$/
        if (!value || !reg.test(value)) {
          this.unshiftError((type.startsWith('wts') && '机位点' || '测风塔') + this.errTip.wtMastTag)
          return false;
        } else {
          this.clearError((type.startsWith('wts') && '机位点' || '测风塔') + this.errTip.wtMastTag)
          return true;
        }
      },
      myValidatex(value){
        if (!value && value !== 0) {
          return false;
        } else {
          return true;
        }
      },
      myValidatey(value){
        if (!value && value !== 0) {
          return false;
        } else {
          return true;
        }
      },
      myValidateh(value, type){
        if (!Number(value) || value === 0 || value <= 0 || value >=1000) {
          this.unshiftError((type.startsWith('wts') && '机位点' || '测风塔') + this.errTip.wtMastH)
          return false;
        } else {
          this.clearError((type.startsWith('wts') && '机位点' || '测风塔') + this.errTip.wtMastH)
          return true;
        }
      },
      myValidateclimateFile(value){
        if (!value && value !== 0 || value == 'null') {
          return false;
        } else {
          return true;
        }
      },
      myValidatepowerCurveName(value){
        if (!value && value !== 0 || (value && !this.powerCurveFileObj[value.split(',').reverse()[0]])) {
          return false;
        } else {
          return true;
        }
      },
      // 移除测风塔/风机表单校验
      clearValidateMastsWts(formData){
        let vm = this, valid = true;
        let keys = ['tag', 'x', 'y', 'h'];
        formData == 'masts' && (keys = keys.concat(['climateFile']))
        formData == 'wts' && (keys = keys.concat(['powerCurveName']))
        let p = new Promise((resolve)=>{
          if(!vm.form[formData] || !vm.form[formData].length) {
            resolve()
          }else{
            vm.form[formData].forEach((v, i, arr1) => {
              keys.forEach((w, j, arr2) => {
                // 挨个校验表单项
                vm.$refs.form.clearValidate(formData+'['+i+'].'+w)
              })
            })
          }

        })
        return p;
      },
      // 删除测风塔坐标，机位点坐标
      deleteTableRow(formData, scope){
        let vm = this;
        if(!this.editAble) return;
        formData == 'wts' && !this.collapse.includes("3") && this.collapse.push("3") && this.collapseChange()
        // this.form[formData].splice(scope.$index, 1);
        let aIndex = (vm.page[formData.slice(0, formData.length-1)]-1)*vm.page.pageSize+scope.$index
        this[formData].splice(aIndex, 1);
        if(vm[formData].length >= aIndex){
          vm.$refs[formData+'Page'].handleCurrentChange(Math.ceil((aIndex+1) / vm.page.pageSize))
          vm.pageChange(Math.ceil((aIndex+1) / vm.page.pageSize))
        }else{
          vm.$refs[formData+'Page'].handleCurrentChange(Math.ceil(aIndex / vm.page.pageSize))
          vm.pageChange(Math.ceil(aIndex / vm.page.pageSize))
        }
        // 如果当前页已没有数据，则切换到上一页
        if(this[formData].length && this.form[formData].length == 0){
          this.$refs[formData+'Page'].prev()
        }
        
        // this[formData].splice((vm.page[formData.slice(0, formData.length-1)]-1)*vm.page.pageSize+scope.$index, 1);
        this.formNumber[formData] = this[formData].length;
        if(formData == 'masts' && scope.row.tag == vm.form.densityMast){
          vm.form.densityMast = ''
        }
        this.getAllMarkerBound(formData);
        if(this.checkPointInRect(formData)){ //点在面内保存，否则报错
          this.clearError(this.errTip.markOverflow)
        }else{
          this.unshiftError(this.errTip.markOverflow)
        }
        this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon.mapRedraw();//点更新，重绘地图
        this.updateTypeList(formData).then(()=>{
          let tip = `${formData === 'masts' && "测风塔" || '风机'} ${scope.row.tag} 删除成功！`
          this.errorTips.unshift(tip);
          setTimeout(()=>{
            vm.clearError(tip)
          }, 3000)
        })
      },
      // 激活绘制兴趣区域
      changeMapEditMode(mode){
        this.$refs.mapCon.showLayer(mode) //若该图层隐藏，则修改状态为显示
        if(!this.editAble) return;
        let nMode = ''
        if(this.mapEditMode && mode == this.mapEditMode){
          nMode = ''
        }else{
          nMode = mode
        }
        this.mapEditMode = nMode
      },
      // 测风塔坐标--文件上传-子组件触发-修改 册封数据匹配列表项
      setClimateData(option){
        !this.form.climateFiles && (this.form.climateFiles = [])
        this.form.climateFiles.push(option)
      },
      // 测风塔坐标--文件上传-子组件触发-修改 册封数据匹配列表项
      setTurbulenceData(option){
        !this.form.turbulenceFiles && (this.form.turbulenceFiles = [])
        this.form.turbulenceFiles.push(option)
      },
      // 文件上传(测风塔坐标，机位点坐标)
      postWtMast(type, data){
        let vm = this;
        let name = (type == 'WT' && 'wts') || (type == 'MAST' && 'masts')
        if(name == 'wts'){
          vm[name] = data.map(v=>{
            return Object.assign({}, v, {
              guaranteePolicyName: '0',
              turbulencePolicyName: '0',
              powerCurveName:[],
              powerCurveId: ''
            })
          })
        }else{
          vm[name] = data
        }
        if(vm[name].length > vm.form[name].length){
          vm.form[name] = vm[name].slice(0, vm.page.pageSize)
        }else{
          vm.form[name] = vm[name]
        }
        vm.formNumber[name] = data.length
        vm.$nextTick(() => {
          vm.clearValidateMastsWts(name)
          vm.$refs.mapCon.showLayer(name.substr(0, name.length-1)) //若该图层隐藏，则修改状态为显示
          vm.form.terrain && vm.form.terrain.xMax && vm.$refs.mapCon.mapRedraw();//点更新，重绘地图
          vm.getAllMarkerBound(name);//更新marker边界值
          vm.fitBounds()
          if(!vm.checkPointInRect(name)) {
            vm.errorTips.push(vm.errTip.markOverflow)
          }
          // this.checkRefine(this.form.mesh);
          // formChecker(this.$refs.standard);
        })
      },
      fitBounds () {
        let LatLngBounds = []
        if (this.markBound.masts.maxX) {
          let cor = this.markBound.masts
          LatLngBounds.push([cor.maxX, cor.minY])
          LatLngBounds.push([cor.minX, cor.maxY])
        }
        if (this.markBound.wts.maxX) {
          let cor = this.markBound.wts
          LatLngBounds.push([cor.maxX, cor.minY])
          LatLngBounds.push([cor.minX, cor.maxY])
        }
        this.$refs.mapCon.fitBounds(LatLngBounds)
      },
      inputBlur(name){
        this.$refs[name].blur();
      },
      updateInputValue(type, scope){
        let vm = this;
        if(scope.column.label == 'h'){
          this.$set(this.form[type], scope.$index, Object.assign(this.form[type][scope.$index], {
            h: Number(Number(scope.row.h).toFixed(1))
          }))
        }
        this.$set(this[type], (this.page[type.slice(0, type.length-1)]-1)*this.page.pageSize+scope.$index, Object.assign({}, this.form[type][scope.$index]))
        // 修改已设置为主测风塔的标签名称
        if(type == 'masts' && scope.column.property == 'tag'){
          if(vm.form.densityMast && this.masts.filter(v=>{return v.tag == vm.form.densityMast}).length == 0){
            vm.form.densityMast = scope.row.tag
          }
        }
        this.updateTypeList(type)
      },
      checkForm(){
        this.$nextTick(()=>{
          if(document.getElementsByClassName("is-error").length === 0 && this.errorTips.indexOf("请完善表单数据") != -1){
            this.clearError("请完善表单数据")
          }
        })
      },
      // 水平分辨率/垂直分辨率blur
      resolutionBlur(name){
        this.$refs.form.validateField(name, err => {
          if(!err){
            if(this.form[name]){
              this.updateGlobalSetting()
            }
          }
        })
      },
      // 保存基础参数
      updateGlobalSetting(){
        this.checkForm()
        let vm = this;
        let baseConf = {
          densityHeight: vm.form.densityHeight,
          densityMast: vm.form.densityMast,
          densityValue: vm.form.densityValue,
          modelCoefficient: vm.form.modelCoefficient,
          reductionCoefficient: vm.form.reductionCoefficient,
          wakeModel: "PARK模型",
          wrgHeights: vm.form.wrgHeights
        }
        let p = new Promise((resolve, reject) => {
          vm.planHttps.updateBaseConf({
            projectId: vm.projectId,
            scheme_id: vm.id,
            baseConf: baseConf
          }).then(() => {
            resolve()
          }).catch(err=>{
            reject(err)
          })
        })
        return p
      },
      // 机位点/测风塔激活按钮点击事件
      handlePoint(type, scope){
        let $index = this.page[type]>1 && (this.page[type]-1)*this.page.pageSize+scope.$index || scope.$index
        if(!this.editAble) return;
        this.$refs[type+'Table'].setCurrentRow(scope.row)
        this.$refs.mapCon.showLayer(type) //若该图层隐藏，则修改状态为显示
        this.curEditPointIndex = $index;
        this.curEditFormPointIndex = scope.$index;
        if(type === this.mapEditMode && this.curEditPointIndex === $index){
          this.$refs.mapCon.restoreIcon()
          // this.resetMarker()
        }//else{
          this.mapEditMode = type;
          this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon.setCurEditPoint(type, $index)
          // this.$refs.mapCon.mapRedraw();//点更新，重绘地图
        // }
      },
      // 地图点击触发修改风机/测风塔坐标
      setPointXY(type, coor){
        this.$set(this[type+'s'], [this.curEditPointIndex], Object.assign(this[type+'s'][this.curEditPointIndex], {
          x: Number(coor[0].toFixed(1)),
          y: Number(coor[1].toFixed(1))
        }))
        this.$set(this.form[type+'s'], [this.curEditFormPointIndex], Object.assign(this.form[type+'s'][this.curEditFormPointIndex], {
          x: Number(coor[0].toFixed(1)),
          y: Number(coor[1].toFixed(1))
        }))
        this.getAllMarkerBound(type+'s');//更新marker边界值
        // this.setMarkBound(this.form[type+'s'][this.curEditPointIndex]);//更新marker边界值
        if(this.checkPointInRect(type+'s')){ //点在面内保存，否则报错
          this.clearError(this.errTip.markOverflow)
          this.updateTypeList(type+'s')
        }else{
          this.unshiftError(this.errTip.markOverflow)
        }
      },
      // 添加错误提示
      unshiftError(error){
        this.clearError(error)
        this.errorTips.unshift(error)
      },
      // 清除错误信息
      clearError(error){
        let index = this.errorTips.indexOf(error)
        index >= 0 && this.errorTips.splice(index, 1)
      },
      setRowClass({row, rowIndex}) {
        if (this.editMode == 'mast' && this.curEditPointIndex == rowIndex) {
          return 'warning-row';
        } else {
          return ''
        }
      },
      wtClassName({row, column, rowIndex, columnIndex}){
        if(columnIndex == 4){
          return ('windColumn' + (this.editAble ? '' : ' disabled'))
        }
      },
      mastsTableHover(row, column, cell, event){
        this.tableHover('mast', row, column, cell, event)
      },
      mastsTableLeave(row, column, cell, event){
        this.tableLeave('mast', row, column, cell, event)
      },
      wtsTableHover(row, column, cell, event){
        this.tableHover('wt', row, column, cell, event)
      },
      wtsTableLeave(row, column, cell, event){
        this.tableLeave('wt', row, column, cell, event)
      },
      tableHover(type, row, column, cell, event){
        let vm = this;
        if(!(vm.form.terrain && vm.form.terrain.wmsUrl && vm.$refs.mapCon)){
          return
        }
        for(let k=0; k< this.form[type+'s'].length; k++){
          let item = this.form[type+'s'][k]
          if(item.tag == row.tag){
            // item.x && item.y && vm.$refs.mapCon.mouseover(type, k, item.tag)
            vm.$refs.mapCon.mouseover(type, k+(vm.page[type]-1)*vm.page.pageSize, item.tag)
            break;
          }
        }
      },
      tableLeave(type, row, column, cell, event){
        let vm = this;
        if(!(vm.form.terrain && vm.form.terrain.wmsUrl && vm.$refs.mapCon)){
          return
        }
        for(let k=0; k< this.form[type+'s'].length; k++){
          let item = this.form[type+'s'][k]
          if(item.tag == row.tag){
            if(!(vm.mapEditMode == type && vm.curEditPointIndex === k)){
              // vm.$refs.mapCon.mouseout(type, k, item.tag)
              vm.$refs.mapCon.mouseout(type, k+(vm.page[type]-1)*vm.page.pageSize, item.tag)
            }
            break;
          }
        }
      },
      // 子组件触发激活当前点
      setActiveMarker(type, index){
        this.mapEditMode = type
        this.curEditPointIndex = index
        this.$refs[type + 'Table'].setCurrentRow(this.form[type+'s'][index]);
        let name = type == 'mast' && '2' || 3
        if(index>0 && this.collapse.indexOf(name) == -1){
          this.collapse.push(name)
        }
      },
      isShowTurbu(scope){
        let bool = false
        let fileId = this.form.masts[scope.$index].climateFile
        if(!fileId) return;
        let type = this.form.climateFiles.filter(v=>{
          return v.id == fileId
        })
        // 当用户选择了tab文件后，湍流矩阵的选择框显示出来，否则不显示；
        if(type.length && (type[0].fileName.endsWith(".tab") || type[0].turbuleceFlag == 1)){
          bool = true
        }
        return bool
      },
      wrgHeightsSearch(queryString, cb){
        var list = this.wrgHeightsOptions;
        var results = queryString ? list.filter(v=>{
          return v.label.indexOf(queryString) === 0
        }) : list;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      wrgHeightChange(value){
        let vm = this;
        value.forEach(v=>{
          if(vm.wrgHeightsOptions.indexOf(v) == -1){
            vm.wrgHeightsOptions.push(v)
          }
        })
        vm.wrgHeightsOptions.sort((a,b)=>{
          return a-b
        })
      },
      wrgHeightBlur(e){
        console.log(e)
        debugger
        // this.$refs.wrgHeight
      },
      validateTag(rule, value, callback){
        let reg = /^[a-zA-Z0-9_.#-]{0,10}$/
        if (!reg.test(value)) {
          this.unshiftError((rule.field.startsWith('wts') && '机位点' || '测风塔') + this.errTip.wtMastTag)
          callback(new Error(''));
        } else {
          this.clearError((rule.field.startsWith('wts') && '机位点' || '测风塔') + this.errTip.wtMastTag)
          callback();
        }
        
      },
      validateH(rule, value, callback){
        if(rule.field.startsWith('masts')){
          if (!Number(value) || value === 0 || value < 10 || value >250) {
            this.unshiftError('测风塔h 必须大于等于10小于等于250！')
            callback(new Error(''));
          } else {
            this.clearError('测风塔h 必须大于等于10小于等于250！')
            callback();
          }
        }else {
          let str = rule.field.split('[')
          let powerCurveId = this.form[str[0]][str[1].split(']')[0]].powerCurveId
          let tag = this.form[str[0]][str[1].split(']')[0]].tag
          if(powerCurveId){
            let name = this.powerCurveFileObj[powerCurveId]
            if(!name){
                callback();
                return;
            }
            let d = name.split('/')[0].replace(/[^0-9]/ig, "");
            if(!Number(value) || value === 0 || (value - d/2) < 10) {
              this.unshiftError(tag+'轮毂高度与叶轮半径(' + d/2 + ')的差值必须大于等于10!')
              callback(new Error(''));
            }else {
              this.clearError(tag+'轮毂高度与叶轮半径(' + d/2 + ')的差值必须大于等于10!')
              callback();
            }
          }else{
            if(!Number(value) || value === 0 || value <= 0 || value >=1000){
              this.unshiftError('机位点' + this.errTip.wtMastH)
              callback(new Error(''));
            }else{
              this.clearError('机位点' + this.errTip.wtMastH)
              callback();
            }
          }
        }
      },
      validatePowerCurveName(rule, value, callback){
          if(!value.length || (value.length && !this.powerCurveFileObj[value[value.length-1]])){
              callback(new Error(''));
          }else{
              callback()
          }
      },
      valDensityValue(rule, value, callback){
        if (isNaN(Number(value)) || value <= 0 || value > 1.5) {
          this.unshiftError('空气密度必须大于0小于等于1.5')
          callback(new Error(''));
        } else {
          this.form.densityValue = Number(Number(value).toFixed(3))
          this.clearError('空气密度必须大于0小于等于1.5')
          callback();
        }
      },
      valDensityHeight(rule, value, callback){
        if (isNaN(Number(value)) || value < 0 || value > 250) {
          this.unshiftError('温压传感器高度必须大于等于0小于等于250')
          callback(new Error(''));
        } else {
          value && (this.form.densityHeight = Number(Number(value).toFixed(1)))
          this.clearError('温压传感器高度必须大于等于0小于等于250')
          callback();
        }
      },
      //模型系数
      valModelCoefficient(rule, value, callback){
        if (isNaN(Number(value)) || value <= 0 || value >= 1) {
          this.unshiftError('模型系数必须大于0小于1')
          callback(new Error(''));
        } else {
          this.form.modelCoefficient = Number(Number(value).toFixed(3))
          this.clearError('模型系数必须大于0小于1')
          callback();
        }
      },
      //折减系数
      valReductionCoefficient(rule, value, callback){
        if (isNaN(Number(value)) || value <= 0 || value > 1) {
          this.unshiftError('折减系数必须大于0小于等于1')
          callback(new Error(''));
        } else {
          this.form.reductionCoefficient = Number(Number(value).toFixed(2))
          this.clearError('折减系数必须大于0小于等于1')
          callback();
        }
      },
      dragChangeWidth(offset, isRelease){
        if((this.colLeftW + offset) < 100 || (this.colRightW - offset) < 100){
          return;
        }
        this.$refs.colLeft.$el.style.width = this.colLeftW + offset + 'px'
        this.$refs.colRight.$el.style.width = this.$refs.colRow.$el.clientWidth - this.colLeftW - offset - 13 + 'px'
        this.$nextTick(()=>{
          this.calMapHeight(isRelease)
        })
      },
      calMapHeight(isRelease){
        // if(!this.$refs.colRight) return;
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
        if((document.body.clientHeight - 245) < mapOptions.height){
          this.mapH = (document.body.clientHeight - (this.editAble && 245 || 158))
        }else{
          this.mapH = (document.body.clientHeight - (this.editAble && 320 || 158))
        }
        this.$nextTick(()=>{
          isRelease && this.form.terrain && this.form.terrain.xMax && this.$refs.mapCon && this.$refs.mapCon.mapFitBounds();//点更新，重绘地图
        })
      },
      // 机型匹配回显 去掉后缀名
      nameFilter(name){
        let arr = name.split('.')
        let str = ''
        arr.map((v, k) => {
          if(k<arr.length-1){
            str += (k==0 && v || ('.'+v))
          }
        })
        return str
      }
    },
    watch: {
      percentage(cur){
        if(cur > 0){
          this.showProgress = true;
        }
        if(cur == 100){
          setTimeout(()=>{
            this.percentage = 0;
            this.showProgress = false;
          }, 3000)
        }
      },
      'form.sectionIds'(cur){
        // cur && this.clearError(this.errTip.sectionLess)
      },
      'form.wts'(cur){
        cur.length && this.clearError(this.errTip.wtLess)
      },
      'form.masts'(cur){
        cur.length && this.clearError(this.errTip.mastLess)
      },
      collapse(cur){
        if(!cur.includes('4')){
          this.collapse.push('4')
        }
      },
      editAble(){
        this.calMapHeight(true)
      }
    },
    destroyed(){
      // sessionStorage.removeItem('detail');
      // sessionStorage.removeItem('projectName');
    }
  }
</script>

<style lang="less">
  .plan-input {
    position: relative;
    background: radial-gradient(circle at 50% 10%, #024a68, #001d2e, #001D2E) !important;
    padding: 8px;
    height: calc(100% - 48px);
    .td-scroll-x{
      display: block;
      overflow-x: auto;
      white-space: nowrap;
      &::-webkit-scrollbar {display:none}
    }
    .tuli {
        position: absolute;
        left: 17px;
        bottom: 24px;
        z-index: 501;
        padding-right: 3px;
        background: rgba(248, 245, 245,0.4);
        .litop{
          padding-bottom:5px ;
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
    .table-list{
      .el-table__body-wrapper{
        tr:hover,
        tr.current-row{
          background: url(/imgs/table-bg.png) no-repeat 2px 2px;
          background-size: calc(100% - 4px) 24px;
        }
      }
      .windColumn{
        &:not(.disabled){
          .el-form-item{
            display: inline-block;
            width: 110px;
          }
        }
        &.disabled{
          .el-input{
            width: 100%;
            max-width: 100%;
          }
        }
        .btnb{
          position: absolute;
          top: 7px;
          left: 114px;
          display: none;
          border: 1px solid @inputColor;
          border-radius: 10px;
          width: 96px;
          height: 20px;
          color: @whiteColor;
          font-size: 12px;
          text-align: center;
          line-height: 1;
          padding-top: 3px;
          cursor: pointer;
          .iconfont{
            display: inline-block;
            font-size: 12px;
            margin-right: 3px;
          }
          &:hover{
            background-color: @inputColor;
            .iconfont{
              color: #1BD3A3;
            }
          }
        }
        &:hover{
          .btnb{
            display: inline-block;
          }
        }
      }
      
    }
    .plan-name{
      color: @whiteColor;
      font-size: 14px;
      height: 28px;
      margin-bottom: 11px;
      span{
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        max-width: calc(100% - 110px);
        vertical-align: middle;
        text-overflow: ellipsis;
        margin: 0 10px;
        border-bottom: 1px solid @highColor;
        padding-bottom: 2px;
      }
      i.iconfont{
        color: @highColor;
        cursor: pointer;
        line-height: 28px;
      }
      .el-input{
        .el-input__suffix {
          z-index: 99999;
          display: block;
          width: 14px;
          i.el-input__icon{
            color: @whiteColor !important;
          }
        }
      }
    }
    .el-form-item{
      .el-input{
        width: 130px;
      }
      .el-select__input{
        color: @whiteColor;
        margin-left: 5px;
      }
      &.is-error{
        .el-input__inner{
          border-color: @error !important;
        }
      }
      .error{
        .el-input__inner{
          border-color: @error !important;
        }
      }
      &.is-required:not(.is-no-asterisk){
        >.el-form-item__label::before{
          color: transparent;
        }
      }
      .wrgHeights{
        display: inline-block;
        width: 130px;
        height: 28px;
        margin: 0;
        border: 1px solid @disabledBorder;
        line-height: 28px;
        padding: 0 10px;
        vertical-align: middle;
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
      color: rgba(255, 255, 255, .7);
      font-size: 14px;
      line-height: 28px;
      vertical-align: top;
      margin-right: 9px;
    }
    .icondingwei1{
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
      @map-width: 630px;
      @map-height: 480px;
      position: relative;
      display:flex;
      flex-direction: row;
      .col-param {
        width: calc(50% - 14px);
        max-width: calc(100vw - 270px);
        >.el-scrollbar{
          overflow: unset;
          >.el-scrollbar__wrap{
            overflow-y: auto;
            overflow-x: hidden;
            padding-bottom: 6px;
            margin-right:0!important;
          }
          >.el-scrollbar__bar{
            position: fixed;
            right: -8px;
          }
          /*定义滑块 内阴影+圆角*/
          &::-webkit-scrollbar-thumb
          {
            background-color: transparent;
          }
        }
        .form-cont{
          /*width: calc(100% - 649px);*/
          /*border-right: 1px dashed #2B678B;*/
          /*padding-right: 13px;*/
          min-width: 576px;
          /*min-height: calc(100vh - 164px);*/
        }
      }
      .drag-line{
        width: 28px;
        height: calc(100vh - 205px);
        position: relative;
        padding: 0 6px;
        &::before{
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
        &::after{
          content: "";
          display: inline-block;
          width: 1px;
          height: 100%;
          border-left: 1px dashed @tborder;
          margin-left: 8px;
        }
      }
      .col-map {
        /*width: @map-width;*/
        width: calc(50% - 13px);
        height: 100%;
        position: relative;
        /*right: 0;
        top: 0;*/
        /*flex:1;*/
        .tips-container{
          position: absolute;
          top:460px;
          left: 0;
          width: 100%;
          overflow: auto;
          p{
            color:rgba(255, 255, 255, .7);
            margin-bottom: 6px;
            line-height: 2;
          }
        }
      }
    }
    .el-table.form-no-border {
      .el-table__empty-block{
        min-height: 28px;
        height: 28px;
      }
      .cell{
        height: 24px;
        line-height: 24px;
        padding: 0 2px;
      }
      .layer-select{
        display: inline-block;
        width: 110px;
        height: 18px;
        line-height: 18px;
        margin-top: 4px;
        position: relative;
        color: #979db3;
        font-size: 12px;
        border: 1px solid transparent;
        padding-right: 30px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        &.value{
          font-size: 14px;
          color: @whiteColor;
        }
        &.error{
          border-color: @error;
        }
        *{
          vertical-align: middle;
        }
        i.el-input__icon{
          color: @whiteColor;
          position: absolute;
          right: 4px;
          top: -9px;
          font-size: 14px;
        }
      }
      .el-form-item__content {
        margin-left: 0 !important;
        height: 24px;
        line-height: 24px;
      }
      .el-input__suffix{
        top: 2px;
      }
      .el-select__caret.is-reverse{
        transform: translate(0px, -2px);
      }
      .el-input {
        width: 100%;
        max-width: 130px;
        height: 22px;
        .el-input__inner {
          border-color: transparent !important;
          padding: 0 !important;
          height: 18px !important;
          &::placeholder{
            font-size: 12px;
          }
          &:focus{
            border-color: #2B678B !important;
          }
        }
      }
      .el-cascader > .el-input > .el-input__inner,
      .el-select > .el-input > .el-input__inner {
        padding-right: 30px !important;
        
      }
      .el-form-item {
        margin-bottom: 0 !important;
      }
      .el-form-item.is-error {
        .el-input__inner {
          border-color: @error !important;
        }
      }
      .iconfont{
        cursor: pointer;
        &.active,
        &:hover{
          color: @highColor;
        }
        &.iconjianh:hover{
          color: @error;
        }
      }
    }
    .el-pagination{
      text-align: right;
    }
    .map {
      background-color: #002C46;
    }
    .param-set {
      background: rgba(0, 29, 46, 0.5);
      .set-btn{
        color: @highColor;
        cursor: pointer;
        font-size: 12px;
      }
      .param-row{
        font-size: 0;
        min-width: 568px;
        overflow: auto;
        .param-col{
        }
      }
    }
    @media(min-width: 1366px){
      .param-row{
        .param-col{
          display: inline-block;
          float: left;
        }
      }
    }
    .interest-area {
      > * {
        display: inline-block;
        vertical-align: top;
      }
      &::before {
        content: "";
        display: inline-block;
        width: 7px;
        height: 35px;
        border: 1px solid #2B678B;
        border-right: none;
        margin-top: 11px;
        margin-right: 4px;
      }
      .angle {
        color: rgba(255, 255, 255, .7);
        font-size: 14px;
        label {
          margin-right: 6px;
        }
        .west-north {
          margin-bottom: 4px;
        }
        .west-north,
        .east-south{
          .el-form-item{
            display: inline-block;
            margin-bottom: 0;
          }
        }
      }
      .el-input {
        width: 138px;
        margin-right: 4px;
      }
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 14px;
      text-align: center;
      border-top: 1px solid #2B678B;
    }
  }
</style>
