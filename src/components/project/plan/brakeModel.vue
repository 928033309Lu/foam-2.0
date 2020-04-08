<template>
  <el-dialog class="brake-model" title="致动盘模型设置" :visible.sync="visible" :modal-append-to-body="false"
             :close-on-click-modal="false" width="691px" top="90px">
    <el-table :data="tableData" class="table-list border out-border angle-thead row-hover" @selection-change="handleSelectionChange">
      <el-table-column  prop="angle" label="方向"></el-table-column>
      <el-table-column label="稳定度">
        <template slot-scope="scope">{{steadyFilter(scope.row.borderValue)}}</template>
      </el-table-column>
      <el-table-column label="是否设置致动盘">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.check" @change="selectChange(scope.row)"></el-checkbox>
        </template>
      </el-table-column>
    </el-table>
    <p class="error-tip" v-if="errorTips">{{errorTips}}</p>
    <template slot="footer" v-if="!disabled">
      <el-button type="primary" @click="resetChecked">恢复默认</el-button>
      <el-button type="primary" @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
  import cfdConfig from '@/config/cfd.config'
  export default {
    name: "brakeModel",
    data(){
      return {
        visible: false,
        projectId: this.$route.params.projectId,
        id: this.$route.params.id,
        tableData: [],
        steadyOptions: cfdConfig.steadyOptions,
        checkedIds: [],
        errorTips: ''
      }
    },
    props: {
      scheme: {
        type: Object,
        default: ()=>{return {}}
      },
      disabled: {
        default: false
      }
    },
    computed: {
    },
    watch: {
      visible(cur){
        if(!cur){
          this.errorTips = ''
        }
      }
    },
    mounted(){
      // this.checkedIds = Object.assign([], this.sectionIds) || []
    },
    methods: {
      steadyFilter(value){
        return this.steadyOptions.filter(v=>{
          return v.value == value
        })[0].label.substr(7, 1)
      },
      showDialog(){
        this.visible = true;
        this.getAvail();
      },
      // 获取扇区数据
      getAvail(){
        let vm = this;
        this.planHttps.getAvail(this.projectId).then(res => {
          if(res.length && Object.keys(res[0]).includes('check')){
            this.tableData = res;
          } else {
            this.tableData = res.filter(v=>{
              v.check = vm.scheme.admSectionIds && vm.scheme.admSectionIds.includes(v.id);
              return vm.scheme.sectionIds.includes(v.id);
            });
          }
        })
      },
      // 恢复默认
      resetChecked(){
        this.checkedIds = []
        this.tableData.map(v=>{
          v.check = false
        })
      },
      confirm(){
        // let vm = this;
        // this.$refs.standard.validate(valid => {
        //   if(valid){
        if(this.checkedIds.length == 0) {
          this.errorTips = '请选择致动盘扇区!'
          return
        }else{
          this.errorTips = ''
        }
        this.planHttps.schemeAdmRun({
          projectId: this.projectId,
          scheme_id: this.id,
          ids: this.checkedIds
        }).then(res => {
          this.visible = false
          this.$emit("update:sectionIds", this.checkedIds)
          this.$router.push({name: 'planList', params: {projectId: this.projectId}})
        })
      },
      handleSelectionChange(val){
        this.ids = val
      },
      selectChange(row){
        let index = this.checkedIds.indexOf(row.id)
        if(index > -1){
          this.checkedIds.splice(index, 1)
        }else{
          this.checkedIds.push(row.id)
          this.errorTips = ''
        }
      }
    }
  }
</script>

<style lang="less">
  .brake-model{
    >.el-dialog{
      >.el-dialog__body{
        position: relative;
      }
    }
    .el-dialog__body{
      padding-top: 10px;
      .btn-container{
        line-height: 1;
        text-align: right;
        padding-bottom: 10px;
      }
      .my-dialog{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: calc(100% + 90px);
        top: -30px;
        background: rgba(0,0,0,.3);
        .el-dialog__body{
          color: @whiteColor;
        }
      }
      .el-scrollbar{
        .el-scrollbar__bar{
          right: 0px;
        }
      }
      .error-tip{
        color: @error;
        font-size: 12px;
        line-height: 1;
        padding-top: 12px;
      }
      .el-checkbox{
          display: block;
          text-align: left;
          width: 100px;
          margin: 0 auto;
          color: @whiteColor;
          +.el-checkbox{
            margin-top: 10px;
          }
          &.is-checked{
            color: @whiteColor;
            .el-checkbox__input.is-checked+.el-checkbox__label{
              color: @whiteColor;
            }
            .el-checkbox__input{
              border-color: @listColor;
            }
            .el-checkbox__input.is-checked{
              .el-checkbox__inner{
                background-color: @listColor;
                border-color: @listColor;
                &::after{
                  transform: rotate(45deg) scale(1.3);
                }
              }
            }
          }
          &.is-disabled{
            background-color: transparent;
            .el-checkbox__input.is-disabled{
              .el-checkbox__inner{
                background-color: transparent;
                border-color: @disabledBorder;
              }
            }
          }
        }
    }
    .copy-select{
      width: 90px;
      height: 18px;
      border: 1px solid transparent;
      &:hover{
        border-color: @highColor
      }
    }
    .section-container{
      max-height: calc(100vh - 400px);
      overflow: auto;
    }
    .section-table{
      position: relative;
      min-height: 27px;
      border-left: 1px solid @tborder;
      &.fixed-thead::before{
        content: '';
        display: inline-block;
        width: 100%;
        height: 28px;
        background: @listColor;
        border-top: 1px solid @tborder;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
      }
      &::after{
        content: "";
        clear: both;
        display: table;
      }
      &.edit{
        &::before{
          background: @linearGradient;
        }
      }
      .col{
        float: left;
        li{
          width: 57px;
          height: 28px;
          border-right: 1px solid @tborder;
          border-bottom: 1px solid @tborder;
          text-align: center;
          line-height: 28px;
          color: @whiteColor;
          .iconduihaox{
            font-size: 20px;
            display: none;
            color: #00C8CF;
          }
          &.head{
            position: relative;
            width: 80px;
            height: 28px;
            overflow: visible;
            &:before{
              content: "";
              display: inline-block;
              width: 84px;
              height: 1px;
              background-color: #2B678B;
              position: absolute;
              left: -3px;
              top: 13px;
              z-index: 1;
              -webkit-transform: rotate(20deg);
              transform: rotate(19deg);
            }
            &:after{
              position: absolute;
              left: 2px;
              top: 2px;
              content: "";
              width: 0px;
              height: 0px;
              border-width: 3.5px;
              border-style: solid;
              border-color: #FF2E76 transparent transparent #FF2E76;
              z-index: 1;
            }
            .top, .btm{
              position: absolute;
              font-size: 10px;
              transform: scale(0.8);
            }
            .top{
              top: -7px;
              right: -4px;
            }
            .btm{
              left: 0px;
              bottom: -7px;
            }
          }
          &.available{
            background-color: rgba(0, 255, 255, .2);
            cursor: pointer;
            &:hover{
              border: 1px solid @highColor;
            }
          }
          &.checked{
            .iconduihaox{
              display: inline-block;
            }
          }
        }
        &:not(.col-1){
          li:first-child{
            position: relative;
            cursor: pointer;
            z-index: 0;
          }
        }
        &.hover{
          li:last-child:not(:first-child){
            position: relative;
            &::before,
            &::after{
              content: "";
              display: inline-block;
              width: 7px;
              height: 7px;
              border-bottom: 1px solid @error;
              position: absolute;
              bottom: 0;
            }
            &::before{
              border-left: 1px solid @error;
              left: 0;
            }
            &::after{
              border-right: 1px solid @error;
              right: 0;
            }
          }
        }
        &.col-1{
          li{
            width: 80px;
          }
        }
      }
      &.fixed-thead{
        .col{
          &.hover{
            li:first-child{
              position: relative;
              &::before,
              &::after{
                content: "";
                display: inline-block;
                width: 7px;
                height: 7px;
                border-top: 1px solid @error;
                position: absolute;
                top: 0;
              }
              &::before{
                border-left: 1px solid @error;
                left: 0;
              }
              &::after{
                border-right: 1px solid @error;
                right: 0;
              }
            }
          }
        }
      }
    }
    .el-table{
      border-bottom: none !important;
      &.angle-thead th:first-child .cell:before{
        display: none;
      }
    }
  }
</style>
