<template>
  <div class="upload-file">
    <!--<div class="name" :class="fileStatusClass" @click.stop="download" v-if="fileName">-->
      <!--<span :title="fileName">{{fileName}}</span>-->
      <!--<i v-if="!disabled" @click="deleteFile" class="iconfont iconshanchu"></i>-->
    <!--</div>-->
    <!--<div class="name error" v-if="errorFile">{{errorFile}}</div>-->
    <!--<el-progress v-if="file" class="upload-progress" :percentage="percent" status=""></el-progress>-->
    <el-button type="text" @click="errorTips = []; visible=true">文件上传</el-button>
    <el-dialog class="new-file" title="文件上传" :visible.sync="visible" :append-to-body="true" :modal-append-to-body="true" width="400px" top="230px"
               v-loading="loading" element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.8)"
               element-loading-text="上传中...">
      <upload-btn :hasList="needTips" file-type="MAST" https="planHttps" :proId="projectId" :schemeId="id" @postWtMast="postWtMast" btn-text="坐标文件"></upload-btn>
      <el-upload @click.native.stop="uploadEvent" class="upload-section" drag action="" accept=".zsvds,.tim"
                 :on-success="success" multiple :limit="100" :on-exceed="fileExceed"
                 :on-progress="progress" :show-file-list="false" :file-list="fileList" :before-upload="preUpload"
                 :http-request="uploadClimate" :disabled="disabledUpload">风序列文件
      </el-upload>
      <el-upload @click.native.stop="uploadEvent" class="upload-section" drag action="" accept=".tab"
                 :on-success="success" multiple :limit="100" :on-exceed="fileExceed"
                 :on-progress="progress" :show-file-list="false" :file-list="fileList" :before-upload="preUpload"
                 :http-request="uploadTab" :disabled="disabledUpload">tab文件
      </el-upload>
      <el-upload v-if="0" @click.native.stop="uploadEvent" class="upload-section" drag action="" accept=".txt"
                 :on-success="success" multiple :limit="100" :on-exceed="fileExceed"
                 :on-progress="progress" :show-file-list="false" :file-list="fileList" :before-upload="preUpload"
                 :http-request="uploadTurbulence" :disabled="disabledUpload">湍流矩阵文件
      </el-upload>
      <div class="error-container" v-if="errorTips.length">
        <p class="error-tip" v-for="error in errorTips" :key="error">{{error}}</p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {fileConfig, UPLOAD_STATUS} from '@/config/file.config'
  import {checkFileType} from '@/utils/checkFileType'
  import cfdService from '@/services/cfd.service'
  import uploadBtn from '@/components/project/upload-btn.vue'

  export default {
    mixins: [checkFileType],
    data() {
      return {
        loading: false,
        tip: {},
        file: '',
        fileId: '',
        fileData: {},
        fileList: [],
        projectId: this.$route.params.projectId || 1,
        id: this.$route.params.id,
        percent: 0,
        verifyCode: '',
        status: UPLOAD_STATUS.STOP,
        errorFile: '',
        allowflag: false,
        inter:null,
        aa:false,
        analysisTime: null,
        visible: false,
        needTips: this.hasList,
        errorTips: [], //错误提示文字,
      }
    },
    components: {
      uploadBtn
    },
    props: {
      btnText: {
        default: '新增'
      },
      disabled: {
        default: false
      },
      fileType: {},
      schemeId: {},
      hasFile: {},
      path: {},
      bucket: {},
      type: {},//文件类型terrain/roughness
      fileInfo: {},
      mapLoading: {},
      climateFilePath: {},
      turbulenceFilePath: {},
      percentage: {},
      hasList: {
        default: false
      },
      climateFiles: {},
      turbulenceFiles: {}
    },
    computed: {
      fileName() {
        if(this.fileInfo){ //已上传过
          this.fileId = this.fileInfo.id
          return this.fileInfo.fileName
        }else if (this.file) {
          return this.file;
        } else if (this.initData) {
          this.status = UPLOAD_STATUS.FINISHED;
          return this.initData.fileName;
        } else if(this.hasFile) {
          return this.hasFile.fileName
        } else {
          return '';
        }
      },
      fileParams() {
        let defaultOption = {accept: '*', service: ''};
        return !(fileConfig[this.fileType] === undefined) ? fileConfig[this.fileType] : defaultOption;
      },
      fileStatusClass() {
        if (this.status === UPLOAD_STATUS.START) {
          return 'uploading';
        } else if (this.status === UPLOAD_STATUS.FINISHED) {
          return 'finished';
        } else {
          return '';
        }
      },
      disabledUpload() {
        return (this.disabled || this.needCodeUpload) && !this.allowflag;
      },
      climateNames(){
        return this.climateFiles && this.climateFiles.map(v=>{return v.fileName}) || []
      },
      turbulenceNames(){
        return this.turbulenceFiles && this.turbulenceFiles.map(v=>{return v.fileName}) || []
      }
    },
    methods: {
      fileExceed(){
        this.error3s("一次上传文件最大个数不允许超过100！")
      },
      postWtMast(type, list){
        this.$emit("postWtMast", type, list)
        if(this.errorTips.length == 0){
          this.visible = false
        }
      },
      success(response, file, fileList) {

      },
      progress(event) {
        let percent = event.total > 0 ? Math.floor(event.loaded * 100 / event.total) : 0;
        this.percent = percent;
      },
      preUpload(file) {
        if (file.name.length > 200) {
          this.error3s("文件名长度不能超过200个字符");
          return false;
        }
        if(file.size > 200 * 1024 * 1024){
          this.error3s("单个文件大小不能超过200M");
          return false;
        }
        if (this.fileParams.regex) {
          let pattern = this.fileParams.regex;
          if (pattern.test(file.name)) {
            this.fileData = {};
            this.errorFile = this.fileParams.regexText;
            return false;
          }
        }
        this.errorFile = '';
        this.fileData = file;
        this.file = file.name;
        this.status = UPLOAD_STATUS.START;
      },
      uploadClimate(){
        if(!this.checkFile(this.fileData.name, '.zsvds,.tim')){
          return
        }
        if(this.climateNames.indexOf(this.fileData.name)>-1){
          // this.$message({
          //   showClose: true,
          //   duration: 0,
          //   message: '当前项目包含名称为'+this.fileData.name+'的风序列文件!'
          // })
          this.unshiftError('当前项目包含名称为'+this.fileData.name+'的风序列文件!')
          return;
        }
        this.uploadAction('climate')
      },
      uploadTab(){
        if(!this.checkFile(this.fileData.name, '.tab')){
          return
        }
        if(this.climateNames.indexOf(this.fileData.name)>-1){
          // this.$message({
          //   showClose: true,
          //   duration: 0,
          //   message: '当前项目包含名称为'+this.fileData.name+'的tab文件!'})
          this.unshiftError('当前项目包含名称为'+this.fileData.name+'的tab文件!')
          return;
        }
        this.uploadAction('climate')
      },
      uploadTurbulence(){
        if(!this.checkFile(this.fileData.name, '.txt')){
          return
        }
        if(this.turbulenceNames.indexOf(this.fileData.name)>-1){
          // this.$message({
          //   showClose: true,
          //   duration: 0,
          //   message: '当前项目已存在名称为'+this.fileData.name+'的湍流矩阵文件!'})
          this.unshiftError('当前项目已存在名称为'+this.fileData.name+'的湍流矩阵文件!')
          return;
        }
        this.uploadAction('turbulence')
      },
      uploadAction(type) {
        // this.loading = true;
        let params = {
          path: this[type + 'FilePath'],
          bucket: this.bucket,
          token: this.$store.state.file_token
        }
        setTimeout(()=>{
          if(this.errorTips.length == 0){
            this.visible = false
          }
        }, 500)
        this.caculateHttps.uploadMapFile(this.fileData, params, this.progress).then(res => {
          // this.$message('文件上传成功');
          this.fileList = [];
          this.loading = false;
          this.fileId = res.id
          this.$emit('update:mapLoading', true)
          if(type === 'climate'){
            this.setFileClimate()
          }else if(type === 'turbulence'){
            this.setFileTurbulence()
          }
        })
        // let service = this.fileParams.service;
        // if (service && this.projectId) {
        //   let params = {
        //     projectId: this.projectId,
        //     messageCode: this.verifyCode,
        //     epsgNum: this.areaZoneData
        //   };
        //   this.changeLoading(false)
        //   this.$store.commit(types.SET_ACTIVE_PROJECT, Object.assign({}, this.$store.state.project.activeProject, {
        //     fullLoading: true
        //   }))
        //   cfdService[service](this.fileData, this.progress, params).then((data) => {
        //     this.status = UPLOAD_STATUS.FINISHED;
        //     this.$message('文件上传成功');
        //     this.changeFullLoading(false)
        //     this.changeLoading(true)
        //     this.$emit('upload', data);
        //     // cfdService.getMeshMap(this.projectId).then((data) => {
        //     //   this.$emit('update:needCodeUpload', data.messageStatus === 1);
        //     // }).catch((err) => {
        //     //
        //     // });
        //     this.getStu();
        //   }).catch((err) => {
        //     this.changeFullLoading(false)
        //     this.percent = 0;
        //     this.file = '';
        //     this.status = UPLOAD_STATUS.START;
        //     this.$message(err.msg || err);
        //   })
        // }
      },
      setFileClimate(){
        this.planHttps.setFileClimate(this.projectId, this.fileId).then(res => {
          this.$emit('setClimateData', res)
          // this.$emit('setMapLayer', 'terrain', res)
          // this.$emit('update:mapLoading', false)
          // this.$emit('clearError', '请上传地图文件');
        })
      },
      setFileTurbulence(){
        this.planHttps.setFileTurbulence(this.projectId, this.fileId).then(res => {
          this.$emit('setTurbulenceData', res)
          // this.$emit('setMapLayer', 'roughness', res)
          // this.$emit('update:mapLoading', false)
          // this.$emit('clearError', '请上传粗糙度文件');
        })
      },
      getStu(){
        this.projectId = this.$store.state.project.activeProject.id
        let _this=this;
        clearInterval(_this.inter);
        _this.inter=null;
        cfdService.getStu(this.projectId).then((data) => {
          if(this.projectId != this.$store.state.project.activeProject.id){
            return;
          }
          this.tip=data;
          if(data&&!data.imagePath){
            this.changeLoading(true)
            _this.inter=setInterval(function(){
              _this.getStu();
            },5000)
          }else{
            this.$emit('update:needCodeUpload', false);
            this.changeLoading(false)
            this.$emit('getUploadedFile', function(){});
            this.analysisTime = data.analysisTime
            clearInterval(_this.inter);
            _this.inter=null;
          }

        }).catch((err) => {

        });
      },
      changeLoading(bool){
        this.$emit('update:loading', bool);
        this.$store.commit(types.SET_ACTIVE_PROJECT, Object.assign({}, this.$store.state.project.activeProject, {
          loading: bool
        }))
      },
      changeFullLoading(bool){
        this.$store.commit(types.SET_ACTIVE_PROJECT, Object.assign({}, this.$store.state.project.activeProject, {
          fullLoading: bool
        }))
      },
      showMap(event) {
        this.$emit('showMap', event);
      },
      actionEvent(event) {
        if (event == "delete" && this.fileName) {
          this.$emit('actionEvent', event);
          this.fileName='';
          this.file='';
        } else if (event == "rollback") {
          this.$emit('actionEvent', event);
        }
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
      },
      download() {
        if (this.initData && this.initData.id) {
          let type = fileConfig[this.fileType].type;
          cfdService.downloadMapFile(this.projectId, type, this.initData.id).then((data) => {
            this.createLink(data, this.initData.fileName);
          }).catch((err) => {
            this.createLink(err, this.initData.fileName);
          })
        }
      },
      startUpload(code) {
        this.verifyCode = code;
        // if (this.fileParams.type === 'terrain') {
        //   $('.upload-section input')[0].click();
        // } else if (this.fileParams.type === 'roughness') {
        //   $('.upload-section input')[1].click();
        // }
      },
      uploadEvent() {
        this.errorTips = [];
        if (this.disabled) {
          this.$emit('upload', '');
          return;
        }
        /*
        if (!this.areaZoneData && this.title == "地形高程文件") {
          this.allowflag = false;
          this.$message("请先选择坐标系");
          return false;
        } else {
          this.allowflag = true;
        }


        cfdService.getMeshMap(this.projectId).then((data) => {
          this.$emit('update:needCodeUpload', data.messageStatus === 1);
          if (data.messageStatus === 1) {
            rootScope.getPhoneCode('CFD', 'file', this.fileType).then((data) => {
              this.verifyCode = data.vcode;
              this.fileData = data.file;
              this.uploadAction();
            }).catch((err) => {
            })
          }
        }).catch((err) => {

        });*/
      },
      uploadContainerClick(){
        if(!this.disabledUpload){
          this.$message("请选择坐标系！");
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
        
        setTimeout(()=>{
          if(this.errorTips.length == 0){
            this.visible = false
          }
        }, 500)
      },
      // 添加只显示3s的提示
      error3s(tip){
        let vm = this;
        this.errorTips.unshift(tip);
        setTimeout(()=>{
          vm.clearError(tip)
        }, 5000)
      }
    },
    watch: {
      percent(per){
        this.$emit("update:percentage", per)
      },
      hasList(cur){
        this.needTips = cur
      }
    }
  }
</script>
<style lang="less" rel="stylesheet/less">
  .upload-file{
    display: inline-block;
  }
  .new-file {
    .error-container{
      max-height: 57px;
      overflow: auto;
      .error-tip{
        color: @error;
        text-align: center;
      }
    }
    input[type=file] {
      display: none;
    }
    .upload-btn-widget,
    .upload-section {
      height: 30px;
      margin-bottom: 8px;
      width: 100%;
      line-height: 1;
      .el-upload {
        text-align: center;
      }
      .el-upload-dragger,.btn-span{
        background-color: @listColor;
        line-height: 22px;
        width: 110px;
        height: 30px;
        padding: 3px 6px;
        border: 1px solid @listColor;
        color: @highColor;
        text-align: center;
        font-size: 14px;
        border-radius: 0;
        .iconfont {
          margin-right: 5px;
        }
        &:hover {
          border-color: @highColor !important;
        }
      }
      .el-upload__input {
        display: none;
      }
    }
    .upload-btn-widget{
      text-align: center;
      .el-button{
        background-color: @inputColor;
        line-height: 22px;
        width: 240px;
        height: 30px;
        padding: 3px 6px;
        border: 1px solid @inputColor;
        color: @highColor;
        text-align: center;
        font-size: 14px;
        border-radius: 0;
        &:hover{
          border-color: @highColor;
        }
      }
      .upload-section{
        margin-bottom: 0;
      }
      .btn-span{
        width: 240px;
      }
    }
  }
  .el-dialog__wrapper.new-file{
    .upload-section{
      text-align: center;
    }
    .el-upload-dragger{
      width: 240px;
    }
  }
</style>

