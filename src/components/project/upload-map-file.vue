<template>
  <div class="upload-map-file">
    <div class="name" :class="fileStatusClass" v-if="fileName">
      <span
        :class="{'downloadAble': (percent==0 || percent == 100) && !isRoughnessGenerating}"
        :title="fileName"
        @click.stop="download"
      >{{fileName}}</span>
      <i
        v-if="!disabled && !isUploading && !isRoughnessGenerating"
        @click="deleteFile"
        class="iconfont iconshanchu"
        :class="{'deleteAble': (percent==0 || percent == 100)}"
      ></i>
    </div>
    <div class="name error" v-if="errorFile">{{errorFile}}</div>
    <!--<el-progress v-if="file" class="upload-progress" :percentage="percent" status=""></el-progress>-->
    <el-button
      :disabled="disabled || (type === 'terrain' && mapLoading)"
      v-if="!fileName"
      @click="visible=true"
      style="width: 110px;"
    >
      <i class="iconfont iconxinjian"></i> 新增
    </el-button>
    <el-dialog
      class="new-file"
      title="新建"
      :visible.sync="visible"
      :modal-append-to-body="false"
      width="400px"
      top="230px"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      element-loading-text="上传中..."
    >
      <el-upload
        @click.native.stop="uploadEvent"
        class="upload-section"
        drag
        action
        accept=".map"
        :on-success="success"
        :on-progress="progress"
        :show-file-list="false"
        :file-list="fileList"
        :before-upload="preUpload"
        :http-request="uploadAction"
        :disabled="disabledUpload"
      >上传map文件</el-upload>
      <el-button v-if="type === 'terrain'" @click="go('srtm')" type="primary">使用srtm数据</el-button>
      <el-button v-if="type === 'terrain'" @click="go('windMaker')" type="primary">在线处理数据</el-button>
      <el-button v-if="type === 'roughness'" @click="autoRoughness" type="primary">自动匹配全国300m粗糙度数据</el-button>
    </el-dialog>
  </div>
</template>
<script>
import { fileConfig, UPLOAD_STATUS } from "@/config/file.config";
import cfdService from "@/services/cfd.service";

export default {
  data() {
    return {
      loading: false,
      tip: {},
      file: "",
      fileId: "",
      fileData: {},
      fileList: [],
      projectId: this.$route.params.projectId || 1,
      percent: 0,
      verifyCode: "",
      status: UPLOAD_STATUS.STOP,
      errorFile: "",
      allowflag: false,
      inter: null,
      aa: false,
      analysisTime: null,
      visible: false,
      isUploading: false,
      initText: "",
      timer: null,
      timer2: null
    };
  },
  props: {
    btnText: {
      default: "新增"
    },
    disabled: {
      default: false
    },
    fileType: {},
    schemeId: {},
    hasFile: {},
    path: {},
    bucket: {},
    type: {}, //文件类型terrain/roughness
    fileInfo: {},
    mapLoading: {},
    percentage: {},
    roughness: {},
    fileHandle: {},
    isRoughnessGenerating: {},
    errTip: {}
  },
  computed: {
    fileName() {
      if (this.fileInfo && this.fileInfo.id) {
        //已上传过
        this.fileId = this.fileInfo.id;
        return this.fileInfo.fileName;
      } else if (this.file) {
        return this.file;
      } else if (this.isRoughnessGenerating) {
        return "粗糙度文件生成中...";
      } else if (this.hasFile) {
        return this.hasFile.fileName;
      } else {
        return "";
      }
    },
    fileParams() {
      let defaultOption = { accept: "*", service: "" };
      return !(fileConfig[this.fileType] === undefined)
        ? fileConfig[this.fileType]
        : defaultOption;
    },
    fileStatusClass() {
      if (this.status === UPLOAD_STATUS.START) {
        return "uploading";
      } else if (this.status === UPLOAD_STATUS.FINISHED) {
        return "finished";
      } else {
        return "";
      }
    },
    disabledUpload() {
      // return (this.disabled || this.needCodeUpload) && !this.allowflag;
      return this.disabled || this.percent > 0;
    }
  },
  methods: {
    go(name) {
      this.$router.push({ name: name, params: { projectId: this.projectId } });
    },
    deleteFile() {
      let vm = this;
      if (this.percent != 0 && this.percent != 100) {
        return;
      }
      let tipText = "",
        status = "";
      if (this.type === "terrain") {
        if (this.roughness && this.roughness.fileName) {
          tipText = "此操作将同时清除现有地形和粗糙度数据，是否继续？";
          status = 1;
        } else {
          tipText = "此操作将清除现有地形数据，是否继续？";
          status = 2;
        }
      } else if (this.type === "roughness") {
        tipText = "此操作将清除现有粗糙度数据，是否继续？";
        status = 3;
      }
      this.$confirm(tipText, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        center: true
      })
        .then(() => {
          switch (status) {
            case 1:
              vm.deleteFileTerrain().then(() => {
                vm.$emit("getFileRoughness", true);
              });
              break;
            case 2:
              this.deleteFileTerrain();
              break;
            case 3:
              this.deleteFileRoughness();
              break;
          }
        })
        .catch(() => {
          console.log("取消删除");
        });
    },
    getFileRoughness(check) {
      this.caculateHttps.getFileRoughness(this.projectId).then(res => {
        this.$emit("update:fileInfo", res);
        if (check && res) {
          this.timer2 = setTimeout(() => {
            this.getFileRoughness(true);
          }, 1000);
        }
      });
    },
    // 删除地形文件信息
    deleteFileTerrain() {
      let vm = this;
      let p = new Promise(resolve => {
        vm.caculateHttps
          .deleteFileTerrain(vm.projectId, vm.fileInfo.id)
          .then(res => {
            vm.fileData = "";
            vm.file = "";
            vm.percent = 0;
            vm.$emit("update:fileInfo", {});
            vm.$emit("showTip", vm.type);
            vm.$emit("update:mapLoading", false);
            vm.$emit("update:fileHandle", "post");
            resolve();
          });
      });
      return p;
    },
    // 删除地形粗糙度文件
    deleteFileRoughness(id) {
      this.caculateHttps
        .deleteFileRoughness(this.projectId, id || this.fileInfo.id)
        .then(res => {
          this.fileData = "";
          this.file = "";
          this.percent = 0;
          this.$emit("update:fileInfo", {});
          this.$emit("showTip", this.type);
          this.$emit("update:fileHandle", "post");
        });
    },
    success(response, file, fileList) {},
    progress(event) {
      let percent =
        event.total > 0 ? Math.floor((event.loaded * 100) / event.total) : 0;
      this.percent = percent == 100 ? 99 : percent;
    },
    preUpload(file) {
      if (file.name.length > 200) {
        this.$message("文件名长度不能超过200个字符");
        return false;
      }
      // let reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
      // if(reg.test(file.name)){
      //     this.$message("文件名不能包含汉字");
      //     return false;
      // }
      let map = file.name.split(".");
      if (map[map.length - 1] != "map") {
        this.$message("只支持map格式的文件");
        return false;
      }
      this.errorFile = "";
      this.fileData = file;
      this.file = file.name;
      this.status = UPLOAD_STATUS.START;
    },
    uploadAction() {
      // this.loading = true;
      let params = {
        path: this.path,
        bucket: this.bucket,
        token: this.$store.state.file_token
      };
      this.visible = false;
      this.$emit("update:fileHandle", "upload");
      this.$emit("clearError", this.errTip.mapFileError);
      this.isUploading = true;
      this.caculateHttps
        .uploadMapFile(this.fileData, params, this.progress)
        .then(res => {
          this.isUploading = false;
          this.percent = 100;
          // this.$message('文件上传成功');
          // this.loading = false;
          this.fileId = res.id;
          this.type === "terrain" && this.$emit("update:mapLoading", true);
          setTimeout(() => {
            this.percent = 0;
          }, 2000);
          if (this.type === "terrain") {
            this.setFileTerrain();
          } else if (this.type === "roughness") {
            this.setFileRoughness();
          }
        })
        .catch(err => {
          this.isUploading = false;
          this.percent = 0;
          this.file = "";
          this.$emit(
            "unshiftError",
            err.response.data.msg || "上传过程出错,请稍后重试.."
          );
          setTimeout(() => {
            this.$emit(
              "clearError",
              err.response.data.msg || "上传过程出错,请稍后重试.."
            );
          }, 3000);
        });
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
    setFileTerrain() {
      this.caculateHttps
        .setFileTerrain(this.projectId, this.fileId)
        .then(res => {
          this.getFileTerrain();
        });
    },
    getFileTerrain() {
      this.caculateHttps.getFileTerrain(this.projectId).then(res => {
        this.$emit("setMapLayer", "terrain", res);
        if (res && res.wmsUrl) {
          this.$emit("update:mapLoading", false);
          this.$emit("clearError", this.errTip.terrainLess);
        } else if (res == null) {
          this.fileData = "";
          this.file = "";
          this.$emit("update:fileInfo", {});
          this.$emit("update:mapLoading", false);
          this.$emit("unshiftError", this.errTip.mapFileError);
        } else {
          this.timer = setTimeout(() => {
            this.mapLoading && this.getFileTerrain();
          }, 1000);
        }
      });
    },
    setFileRoughness() {
      this.caculateHttps
        .setFileRoughness(this.projectId, this.fileId)
        .then(res => {
          this.$emit("setMapLayer", "roughness", res);
          // this.$emit('update:mapLoading', false)
          this.$emit("clearError", this.errTip.roughnessLess);
        });
    },
    getStu() {
      this.projectId = this.$store.state.project.activeProject.id;
      let _this = this;
      clearInterval(_this.inter);
      _this.inter = null;
      cfdService
        .getStu(this.projectId)
        .then(data => {
          if (this.projectId != this.$store.state.project.activeProject.id) {
            return;
          }
          this.tip = data;
          if (data && !data.imagePath) {
            this.changeLoading(true);
            _this.inter = setInterval(function() {
              _this.getStu();
            }, 5000);
          } else {
            this.$emit("update:needCodeUpload", false);
            this.changeLoading(false);
            this.$emit("getUploadedFile", function() {});
            this.analysisTime = data.analysisTime;
            clearInterval(_this.inter);
            _this.inter = null;
          }
        })
        .catch(err => {});
    },
    changeLoading(bool) {
      this.$emit("update:loading", bool);
      this.$store.commit(
        types.SET_ACTIVE_PROJECT,
        Object.assign({}, this.$store.state.project.activeProject, {
          loading: bool
        })
      );
    },
    changeFullLoading(bool) {
      this.$store.commit(
        types.SET_ACTIVE_PROJECT,
        Object.assign({}, this.$store.state.project.activeProject, {
          fullLoading: bool
        })
      );
    },
    showMap(event) {
      this.$emit("showMap", event);
    },
    actionEvent(event) {
      if (event == "delete" && this.fileName) {
        this.$emit("actionEvent", event);
        this.fileName = "";
        this.file = "";
      } else if (event == "rollback") {
        this.$emit("actionEvent", event);
      }
    },
    createLink(blob, fileName) {
      let a = document.createElement("a");
      a.innerHTML = fileName;
      a.download = fileName;
      // a.href = URL.createObjectURL(blob)
      a.href = URL.createObjectURL(
        new Blob([blob], {
          type: "application/octet-stream"
        })
      );

      document.body.appendChild(a);
      let evt = document.createEvent("MouseEvents");
      evt.initEvent("click", false, false);
      a.dispatchEvent(evt);
      document.body.removeChild(a);
    },
    download() {
      if (this.percent != 0 && this.percent != 100) {
        return;
      }
      if (this.isRoughnessGenerating) return;
      let type =
        this.type == "terrain" ? "downloadTerrain" : "downloadRoughness";
      this.$emit("update:fileHandle", "post");
      this.percent = 1;
      this.caculateHttps[type](
        this.projectId,
        this.fileId,
        this.downloadProgress
      )
        .then(data => {
          this.percent = 100;
          this.createLink(data, this.fileName);
        })
        .catch(err => {
          this.percent = 0;
          this.$emit("unshiftError", err.response.data.msg);
          setTimeout(() => {
            this.$emit("clearError", err.response.data.msg);
          }, 3000);
        });
    },
    downloadProgress(event) {
      let total = this.fileInfo.fileSize;
      let percent =
        total > 0 ? Math.floor((event.loaded * 100) / total) || 1 : 0;
      this.percent = percent;
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
      if (this.disabled) {
        this.$emit("upload", "");
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
    uploadContainerClick() {
      if (!this.disabledUpload) {
        this.$message("请选择坐标系！");
      }
    },
    autoRoughness() {
      this.caculateHttps.autoRoughness(this.projectId).then(res => {
        this.visible = false;
        this.$emit("checkIsRoughnessGenerating");
      });
    }
  },
  watch: {
    percent(per) {
      this.$emit("update:percentage", per);
    }
  },
  destroyed() {
    clearTimeout(this.timer);
    clearTimeout(this.timer2);
    this.timer = null;
    this.timer2 = null;
  }
};
</script>
<style lang="less" rel="stylesheet/less">
.upload-map-file {
  display: inline-block;
  width: calc(100% - 130px);
  input[type="file"] {
    display: none;
  }
  .el-dialog__body {
    text-align: center;
  }
  .name {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    span {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 100px);
      float: left;
      &.downloadAble:hover {
        color: @highColor;
        cursor: pointer;
      }
    }
    .iconfont {
      width: 24px;
      height: 24px;
      border: 1px solid transparent;
      position: relative;
      text-align: center;
      cursor: pointer;
      margin-left: 20px;
      &.iconshanchu.deleteAble:hover {
        color: @error;
        border-color: @highColor;
        &:after {
          content: "";
          background-color: @listColor;
          display: inline-block;
          width: 18px;
          height: 18px;
          position: absolute;
          left: 2px;
          top: 2px;
          z-index: -1;
        }
      }
    }
  }
  .upload-section {
    margin-bottom: 7px;
    width: 100%;
    .el-upload {
      text-align: center;
    }
    .el-upload-dragger {
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
  .el-button.el-button--primary {
    background-color: @listColor !important;
    line-height: 22px;
    width: 240px;
    height: 30px;
    padding: 3px 6px;
    border: 1px solid @listColor;
    color: @highColor;
    text-align: center;
    font-size: 14px;
    border-radius: 0;
    margin: 0 auto;
    margin-bottom: 7px;
    &:hover,
    &:active,
    &.is-disabled,
    &.is-disabled:hover,
    &:focus {
      border-color: @highColor !important;
    }
  }
}
.el-dialog__wrapper.new-file {
  .upload-section {
    text-align: center;
    height: 30px;
  }
  .el-upload-dragger {
    width: 240px;
  }
}
</style>

