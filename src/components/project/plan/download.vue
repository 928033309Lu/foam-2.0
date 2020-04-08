<template>
  <el-dialog class="scheme-download" title="下载选择" :visible.sync="visible" :modal-append-to-body="false"
  v-loading="true"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="正在保存数据..."
             :close-on-click-modal="false" width="400px" top="calc(50vh - 115px)">
    <el-checkbox-group v-model="type" @change="checkChange">
      <el-checkbox v-for="(item, key) in typeFilter" :key="key" :label="key">{{item}}</el-checkbox>
    </el-checkbox-group>
    <p class="error-tip" v-if="errorTips">{{errorTips}}</p>
    <template slot="footer" v-if="!disabled">
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
        type:[],
        schemeName: '',
        typeFilter: {
          'WRA_RESULT': '发电量表格',
          'MATRIX': '矩阵文件',
          'WRG': 'WRG图谱',
          'KMZ': 'KMZ文件',
        },
        wrgHeights: '',
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
      },
      myMessage:false,
    },
    computed: {},
    watch: {
      scheme(res){
        this.schemeName = res.postProcessName;
        if(!res.wrgHeights || !res.wrgHeights.length){
          delete this.typeFilter.WRG
          // delete this.typeFilter.KMZ
        }
      },
      visible(cur){
        if(!cur){
          this.errorTips = ''
        }
      }
    },
    mounted() {
    },
    methods: {
      showDialog(){
        this.visible = true;
        this.type = Object.keys(this.typeFilter)
      },
      checkChange(value){
        if(value.length > 0) {
          this.errorTips = ''
        }
      },
      confirm(){
        if(this.type.length == 0) {
          this.errorTips = '请选择待下载项!'
          return
        }else{
          this.errorTips = ''
        }
        this.type.forEach(v => {
          this.download(v)
        })
      },
      download(type){
        this.errorTips = '',
        this.$emit("update:myMessage",true);
        this.visible = false
        this.planHttps.schemeDownload({
          projectId: this.projectId,
          scheme_id: this.id,
          type: type
        }).then(data => {
          let suffix = {
            'IEC': '.xls',
            'WRA_RESULT': '.xlsx'
          }
          this.visible = false
          let blo = new Blob([data])
          this.createLink(blo, this.schemeName + '-' + this.typeFilter[type] + (suffix[type] || '.zip'));
        }).catch(err=>{
          this.errorTips = '下载失败，请稍后重试！';
          this.$emit("update:myMessage",false);
        })
      },
      createLink(blob, fileName) {
        let a = document.createElement('a');
        a.innerHTML = fileName;
        a.download = fileName;
        a.href = URL.createObjectURL(blob);

        document.body.appendChild(a);
        let evt = document.createEvent("MouseEvents");
        evt.initEvent("click", false, false);
        a.dispatchEvent(evt);
        document.body.removeChild(a);
        this.$emit("update:myMessage",false);
      },
    }
  }
</script>

<style lang="less">
  .scheme-download{
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
      .el-scrollbar{
        .el-scrollbar__bar{
          right: 0px;
        }
      }
      .el-checkbox-group{
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
      .error-tip{
        color: @error;
        font-size: 12px;
        line-height: 1;
        padding-top: 12px;
        text-align: center;
      }
    }
  }
</style>
