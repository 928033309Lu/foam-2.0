<template>
  <div class="upload-btn-widget">
    <el-button type="text" @click="btnClick">{{btnText}}</el-button>
    <el-upload v-show="false" :ref="fileType" class="upload-section" action="" :accept="uploadConfig.accept" :before-upload="preUpload"
               :http-request="uploadAction" :file-list="fileList" :show-file-list="false">
          <span class="btn-span">{{btnText}}</span>
    </el-upload>
  </div>
</template>


<script>
  import {FILE_TYPE, fileConfig, UPLOAD_STATUS} from '@/config/file.config'
  import {checkFileType} from '@/utils/checkFileType'
  import cfdService from '@/services/cfd.service'

  export default {
    mixins: [checkFileType],
    data() {
      return {
        fileList: [],
        tableData: [],
        projectId: this.$route.params.projectId || 1,
        percent: 0,
        // status: UPLOAD_STATUS.STOP,
        fileData: {},
        file: '',
        flag: true,
        needTips: this.hasList
      }
    },
    props: {
      btnText: {
        default: '上传文件'
      },
      fileType: {},
      proId: {},
      schemeId: {},
      https: {},
      hasList: {
        default: false
      }
    },
    mounted(){
      // this.$nextTick(()=>{
      //   this.$refs[this.fileType].$el.onclick
      // })
      this.proId && (this.projectId = this.proId)
    },
    computed: {
      uploadConfig() {
        let defaultOption = {accept: '*', service: ''};
        return fileConfig[FILE_TYPE[this.fileType]] ? fileConfig[FILE_TYPE[this.fileType]] : defaultOption;
      },
      showPercent() {
        return this.status !== UPLOAD_STATUS.STOP;
      }
    },
    methods: {
      btnClick(){
        if(this.hasList){
          this.$confirm(`此操作将清除现有${this.fileType == 'MAST' ? '测风塔' : '风机'}，是否继续？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            center:true
          }).then(() => {
            this.$refs[this.fileType].$refs['upload-inner'].handleClick()
          }).catch(() => {
            console.log('取消上传')
          });
        }else{
          this.$refs[this.fileType].$refs['upload-inner'].handleClick()
        }
      },
      preUpload(file) {
        this.flag = true;
        if (file.name.length > 200) {
          this.$message("文件名长度不能超过200个字符");
          this.flag = false;
          return false;
        }
        this.fileData = file;
        this.file = file.name;
        // this.status = UPLOAD_STATUS.START;
      },
      progress(event) {
        let percent = event.total > 0 ? Math.floor(event.loaded * 100 / event.total) : 0;
        this.percent = percent;
      },
      uploadAction() {
        if(!this.checkFile(this.file,this.uploadConfig.accept)){
          return;
        }
        let formData = new FormData();
        formData.append("type", this.fileType)
        formData.append("file", this.fileData)
        let params = {
          projectId: this.projectId,
          data: formData,
        }
        this.https && this.schemeId && (params.scheme_id = this.schemeId)
        this[this.https || 'caculateHttps'].uploadTypeList(params).then(res => {
          this.$emit("postWtMast", this.fileType, res)
        })
      }
    },
    watch: {
      hasList(cur){
        this.needTips = cur
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  .upload-btn-widget {
    display: inline-block;
    input[type=file] {
      display: none;
    }
    .el-icon-upload {
      color: #2CC2EB;
      font-size: 16px;
      margin-right: 4px;
    }
    .btn-span {
      display: inline-block;
      line-height: 12px;
      height: 18px;
      padding: 3px 6px;
      border: 1px solid transparent;
      color: @highColor;
      font-size: 12px;
      &:hover {
        border-color: @highColor;
      }
      .upload-percent {
        margin-left: 10px;
        color: #4cae4c;
      }
    }
    .progress-line {
      height: 2px;
      background: #4cae4c;
    }
  }
</style>

