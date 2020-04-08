<template>
  <div class="plan-result"
    v-loading.fullscreen="loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="正在下载..."
  >
    <div v-if="show">
      <div class="top">
        <div class="left">
          <span class="shang">尾流后平均风速：{{waked.wakedSpeedAvg}}</span>
          <span class="xia">尾流后平均小时数：{{waked.wakedHours}}</span>
        </div>
        <button :disabled='diz' v-if="scheme.wakeModel != '致动盘'" class="mybtn right" @click="openBrakeModel">
          <i class="iconfont iconmoxing"></i> 致动盘
        </button>

        <button class="mybtn right" @click="show=!show">
          <i class="iconfont icontubiaofenxi"></i> 图表分析
        </button>
        <button class="mybtn right" @click="openDownload">
          <i class="iconfont iconxiazai"></i> 下载结果
        </button>
      </div>

      <div class="plan-list">
        <el-table class="my-table" :data="planList" tooltip-effect="dark" style="width: 100%">
          <el-table-column align="center" label="标签" prop="tag"></el-table-column>
          <el-table-column align="center" prop='modelType' label="机型"></el-table-column>
          <el-table-column align="center" prop="freeSpeed" label="平均风速(米/秒)" min-width="90"></el-table-column>
          <el-table-column align="center" prop="wakedSpeed" label="考虑尾流效应的平均风速(米/秒)"></el-table-column>
          <el-table-column align="center" prop="wakedReductionRatio" label="尾流效应导致的平均折减率(%)"></el-table-column>
          <el-table-column align="center" prop="theoryYield" label="发电量(兆瓦小时/年)"></el-table-column>
          <el-table-column align="center" prop='wakedHours' label="尾流后平均小时数(h)"></el-table-column>
          <el-table-column align="center" prop="wakedYield" label="考虑尾流效应的发电量(兆瓦小时/年)"></el-table-column>
          <el-table-column align="center" prop="windShearExponentAvg" label="平均风切变指数"></el-table-column>
        </el-table>
        
      </div>
      <div class="ye" v-show="planList.length">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page.sync="fen.pageNo"
            :page-size="pageSize"
            layout="prev, pager, next, jumper"
            :total="fen.totalRows"
          ></el-pagination>
        </div>
    </div>

    <div v-else class="echarts-content">
      <div class="tou">
        <div class='left'>
          <button class="mybtn-bottom" :class="{active:selected==0}" @click="menuClick(0,'energy')">发电量分析</button>
          <span class='xiao'></span>
          <button class="mybtn-bottom" :class="{active:selected==1}" @click="menuClick(1,'windSpeed')">风速分析</button>
          <span class='xiao'></span>
          <button class="mybtn-bottom" :class="{active:selected==2}" @click="menuClick(2,'turbulence')">湍流分析</button>
        </div>
        <div class="right">
          <button class="mybtn" @click="show=!show" style='position:relative;bottom:5px'>
            <i class="iconfont iconreturn"></i> 返回方案结果
          </button>
        </div>
      </div>
      <div :is="currentView" :id='id' :projectId='projectId' @backFu='backFu'></div>
    </div>
    <el-dialog
      :title="single.name"
      :visible.sync="dialogFormVisible"
      :modal-append-to-body="false"
      width="1080px"
      top="15vh"
    >
      <div style='height:600px; max-height: 70vh'>
        <e-linec :windSet='single.windSet' did='hh' :hidden=false :inverse='single.inverse'></e-linec>
      </div>
    </el-dialog>
    <brakeModel ref="breakModel" :scheme="scheme"></brakeModel>
    <download :myMessage.sync='loading' ref="download" :scheme="scheme"></download>
  </div>
</template>

<script>
import energy from "@/components/project/plan/energy.vue";
import eLinec from "@/components/echarts/linec.vue";
import windSpeed from "@/components/project/plan/windSpeed.vue";
import turbulence from "@/components/project/plan/turbulence.vue";
import brakeModel from "@/components/project/plan/brakeModel.vue";
import download from "@/components/project/plan/download.vue";
import { autoList } from "@/utils/mixin.js";
export default {
  mixins:[autoList],
  name: "",
  data() {
    return {
      loading:false,
      fixFun:null,
      id: this.$route.params.id,
      projectId: this.$route.params.projectId,
      // id: 2,
      // projectId: 82,
      disabled: false,
      diz:true,
      show:true,
      single:{},
      planList: [],
      selected:0,
      waked:{},
      currentView:'energy',
      fen: {},
      dialogFormVisible: false,
      form: {
        schemeName: ""
      },
      rules: {
        schemeName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
          {
            min: 1,
            max: 100,
            message: "长度在 100 个字符以内",
            trigger: "blur"
          }
        ]
      },
      scheme: {}
    };
  },
  components: { energy, windSpeed, turbulence, eLinec, brakeModel, download },
  mounted() {
    this.fixFun=this.debounce(this.displayWindowSize.bind(this,this.getPlanResult.bind(this,this.projectId, this.id, 1)),1000,true);
    window.addEventListener("resize",this.fixFun);
    // this.getPlanResult(this.projectId, this.id, 1);
    this.getHour(this.projectId, this.id);
    this.getScheme()
  },
  destroyed(){
    window.removeEventListener("resize",this.fixFun)
  },
  methods: {
    backFu(single){
      this.single=single;
      this.dialogFormVisible=true;
    },
    menuClick(index,current){
        this.selected=index;
        this.currentView=current;
      },
    handleCurrentChange(val) {
      this.getPlanResult(this.projectId, this.id, val);
    },
    open() {
      this.dialogFormVisible = true;
      this.disabled = false;
    },
    openBrakeModel(){
      this.$refs.breakModel.showDialog()
    },
    openDownload(){
      this.$refs.download.showDialog()
    },
    getPlanResult(project_id, scheme_id, pageIndex=this.fen.pageNo) {
      this.projectHttps
        .getPlanResult(project_id, scheme_id, pageIndex,this.pageSize)
        .then(res => {
          this.planList = res.data;
          let { totalRows, pageNo } = res;
          this.fen = { totalRows, pageNo };
        })
        .catch(err => console.log(err));
    },
    getHour(project_id, scheme_id) {
      this.projectHttps
        .getHour(project_id, scheme_id)
        .then(res => {
          this.waked=res;
        })
        .catch(err => console.log(err));
    },
    // 获取方案详细信息
    getScheme() {
      this.planHttps.getScheme(this.projectId, this.id).then(res => {
        this.scheme = res;
        this.diz=false;
      })
    },
  }
};
</script>

<style lang="less" rel="stylesheet/less">
.plan-result {
  padding: 15px 10px 10px;
  .top {
    display: flow-root;
    margin-bottom: 10px;
    color: @whiteColor;
    .left {
      float: left;
      display: flex;
      width: 470px;
      height: 28px;
      position: relative;
      border: 1px solid rgba(0, 159, 255, 0.7);
      background: #012e47;
      &:before {
        .common-style-before(452px, 28px);
      }
      &:after {
        .common-style-after(472px, 12px);
      }
      .shang {
        flex: 1;
        position: relative;
        z-index: 11;
        padding: 3px 15px;
        &:before {
          .common-arrow-before();
        }
      }
      .xia {
        flex: 1;
        position: relative;
        padding: 3px 15px;
        z-index: 11;
        text-align: right;
        &:after {
          .common-arrow-after();
        }
      }
    }
    .right {
      float: right;
      margin-left: 18px;
    }
  }
  .ye {
       padding-top: 20px;
       padding-bottom: 15px;
      text-align: right;
      
      border-top:none;
    }
  .plan-list {
    .bor(@inputColor);
    border-bottom:none;
     .my-table {
    color: @whiteColor;
    background: none;
    &::before {
        background-color: #034972;
    }
    tr {
        background: none;
        position: relative;
    }
    th {
        background: #034972;
        position: relative;
        padding: 6px 0;
        border-color: #034972;
        color: @whiteColor !important;
        white-space: nowrap;
    }
    td {
        background: none;
        position: relative;
        padding: 0;
        border-color: #034972;
        .cell {
            height: 34px;
            line-height: 34px;
            span.no-allow {
                color: #ccc;
                cursor: not-allowed !important;
            }
            .d3 {
                width: 98px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                > * {
                    vertical-align: top;
                }
                .iconfont {
                    font-size: 16px;
                    margin-right: 5px;
                    margin-left: -2px;
                }
                &:hover {
                    background-color: #012D47;
                    border-radius: 12px;
                }
            }
        }
    }
    .cell {
        .el-checkbox {
            .el-checkbox__input {
                width: 14px;
                height: 14px;
                border: 1px solid rgba(0, 159, 255, 1);
                border-radius: 2px;
                box-sizing: border-box;
                overflow: hidden;
                &.is-checked {
                    border: none;
                    background: rgba(3, 73, 114, 1);
                    .el-checkbox__inner {
                        width: 14px;
                        height: 14px;
                        &::after {
                            left: 5px;
                            top: 2px;
                        }
                    }
                }
                .el-checkbox__inner {
                    background-color: none;
                    border: none;
                    width: 12px;
                    height: 12px;
                    &::after {
                        border-color: #009fff;
                    }
                }
            }
        }
    }
    tbody {
        tr {
            td:first-child:before {
                display: none;
                position: absolute;
                left: 0px;
                top: -1px;
                content: "";
                width: 3px;
                height: 34px;
                border: 1px solid #009fff;
                border-right: none;
            }
            td:last-child:after {
                display: none;
                position: absolute;
                right: 0px;
                top: -1px;
                content: "";
                width: 3px;
                height: 34px;
                border: 1px solid #009fff;
                border-left: none;
            }
            td:last-child {
                text-align: left;
                .cell {
                    span {
                        display: inline-block;
                        margin: 2px 5px;
                        cursor: pointer;
                        &:hover {
                            color: #009fff;
                            &.no-allow {
                                color: #ccc;
                            }
                        }
                    }
                    .del:hover {
                        color: @error;
                    }
                }
            }
            &:first-child {
                td:first-child:before,
                td:last-child:after {
                    height: 33px;
                    top: 0;
                }
            }
            &:last-child {
                td:first-child:before,
                td:last-child:after {
                    height: 33px;
                }
            }
        }
        tr:hover {
            background: url(/imgs/table-bg.png) no-repeat 3px 2px;
            background-size: calc(100% - 6px) 30px;
            color: @hWhiteColor;
            td {
                background: transparent;
                &:first-child:before {
                    display: block;
                }
                &:last-child:after {
                    display: block;
                }
            }
            &:before,
            &:after {
                display: inline-block;
            }
        }
    }
}
  
  }
  .echarts-content {
    .tou{
      display: flex;
      > *{
        vertical-align: middle;
      }
      .left{
        position:relative;
        top:0;
        width: 312px;
        .xiao{
          display:inline-block;
          width: 5px;
          height: 25px;
          vertical-align: bottom;
          .borsin(bottom,@inputColor);
        }
      }
      .right{
        flex:1;
        .borsin(bottom,@inputColor);
        text-align: right;
      }
    }
  }
}
</style>
