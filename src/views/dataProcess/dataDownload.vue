<template>
  <div class="data-download" v-loading.fullscreen.lock="fullscreenLoading" :element-loading-text="loadingText" element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="no-data" v-if="false">
      no-data
    </div>
    <div class="has-data">
      <p class="filename" :title="fileName">{{fileName}}</p>
      <div class="start_end_time">
        <span class="demonstration">起止时间：</span>
        <el-date-picker
          v-model="timeValue"
          align="left"
          :unlink-panels="true"
          value-format="yyyy/MM/dd hh:mm"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="getTimDataHandle">
        </el-date-picker>
        <!--<el-button type="primary" plain>时间段推荐</el-button>-->
      </div>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="Tim文件" name="second" :disabled="!directionValue">
          <tim ref="tim" :column-data="columnData" :checkedT.sync="checkedT" :reviseValue.sync="reviseValue" :tim-data="timData"
               :time-interval.sync="timeIntervalE" :speedValue.sync="speedValue"
               :directionValue.sync="directionValue"></tim>
        </el-tab-pane>
        <el-tab-pane label="数据列" name="first">
          <data-column :column-data="columnData" :columns-arr.sync="columns"
                       :time-interval.sync="timeInterval"></data-column>
        </el-tab-pane>
        <!--<el-tab-pane label="E-Write" name="third" :disabled="true">-->
        <!--<ewt :column-data="columnData" :relevance-value.sync="relevanceValue" :revise-value-e.sync="reviseValueE" :speedValueE.sync="speedValueE" :directionValueE.sync="directionValueE"></ewt>-->
        <!--</el-tab-pane>-->
      </el-tabs>
    </div>
    <p v-if="!directionValue" style="color:red;margin-top:15px;text-indent: 22px;">
      注：该文件没有风向列，不能导出tim文件
    </p>
    <div class="bottom-btn">
      <el-button type="primary" plain @click="downloadHandle">导出</el-button>
      <el-button type="primary" v-if="activeName=='second'" plain @click="sendToFoam">应用到项目</el-button>
    </div>
  </div>
</template>

<script>
  // @ is an alias to /src
  import dataColumn from '@/components/download/data-column.vue'
  import tim from '@/components/download/tim.vue'
  import ewt from '@/components/download/EWT.vue'
  import {mixin} from '../../utils/mixin'

  export default {
    name: 'dataDownload',
    mixins: [mixin],
    data() {
      return {
        loadingText: '',
        fullscreenLoading: true,
        projectId:this.$route.params.projectId,
        fileName: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'file')).fileName,
        fileInfo: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'fileInfo')) || "",
        timeValue: [],
        activeName: 'second',
        columnData: {},
        timData: {},
        columns: [],
        timeInterval: 'TEN_MIN',
        timeIntervalE: 'TEN_MIN',
        reviseValue: 1,
        speedValue: '',
        directionValue: '',
        relevanceValue: 1,
        reviseValueE: 1,
        speedValueE: '',
        directionValueE: '',
        checkedT: true,
        flag: true,
        newFileName:''
      }
    },
    components: {
      dataColumn, tim, ewt
    },
    computed: {
      ensureId() {
        return this.fileInfo ? this.fileInfo.ensureId : "";
      }
    },
    watch: {
      'speedValue'(n) {
        if (!this.flag)
          this.getTimDataHandle();
      },
      'directionValue'(n) {
        if (!this.flag)
          this.getTimDataHandle();
      }
    },
    created() {
      this.$nextTick(() => {
        this.$set(this.timeValue, 0, this.changeTimeType(new Date(this.fileInfo.startDateTime)));
        this.$set(this.timeValue, 1, this.changeTimeType(new Date(this.fileInfo.endDateTime)));
      })
    },
    mounted() {
      this.getColumnDataHandle();
    },
    methods: {
      changeTimeType(time) {
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        return year + '/' + this.addZero(month) + '/' + this.addZero(day) + ' ' + this.addZero(hour) + ':' + this.addZero(minute);
      },
      addZero(num) {
        return num > 9 ? num : ('0' + num);
      },
      handleClick(tab, event) {
        //console.log(tab, event);
      },
      getColumnDataHandle() {
        this.https.getColumnData(this.ensureId).then(res => {
          this.columnData = Object.assign({}, res);

          this.speedValue = this.columnData.typeSpeed[0].columnNumber;
          this.directionValue = this.columnData.typeDirection ? this.columnData.typeDirection[0].columnNumber : '';

          setTimeout(() => {
            this.flag = false;
          }, 0)

          this.speedValueE = this.columnData.typeSpeed[0].columnNumber;
          this.directionValueE = this.columnData.typeDirection ? this.columnData.typeDirection[0].columnNumber : '';
          if (this.directionValue)
            this.getTimDataHandle();
          else
            this.fullscreenLoading = false;
        }).catch(err => {
          console.log(err);
          this.fullscreenLoading = false;
        })
      },
      getTimDataHandle() {
        this.https.getTimData(this.ensureId, this.speedValue, this.directionValue, this.timeValue).then(res => {
          this.timData = res;
          this.fullscreenLoading = false;
        }).catch(err => {
          this.fullscreenLoading = false;
          console.log(err);
        })
      },
      downloadHandle() {
        this.fullscreenLoading = true;
        if (this.activeName == "first") {
          this.downloadStandardHandle();
        } else if (this.activeName == "second") {
          this.downloadTimHandle();
        } else {
          this.downloadEwtHandle();
        }
      },
      createLink(blob, fileName) {
        let blobs = new Blob([blob], {
          type: 'application/octet-stream'//
        })
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blobs, fileName);
        } else {
          let a = document.createElement("a");
          a.setAttribute("download", fileName);
          a.setAttribute("href", window.URL.createObjectURL(blobs));
          document.body.appendChild(a)
          a.click();
          document.body.removeChild(a)
        }
        this.fullscreenLoading = false;
      },
      sendToFoam(){
          if(this.$refs.tim.checkYearFlag()){
              this.fullscreenLoading = false;
              return;
          }
        this.fullscreenLoading = true;
        let formData = new FormData();
        formData.append('ensureId',this.ensureId);
        formData.append('longTermCorrectionFactor',this.reviseValue);
        formData.append('period',this.timeInterval);
        formData.append('startDateTime',this.timeValue[0]);
        formData.append('endDateTime',this.timeValue[1]);
        formData.append('windDirectionColumn',this.directionValue);
        formData.append('windSpeedColumn',this.speedValue);
        formData.append('withSD',this.checkedT);
        let fileName = 'M' + this.fileInfo.windMeasurementTowerNumber + '_' + this.getTimHeight() + '.tim';
        if(fileName.length>200){
            this.$message.error('文件名称应在200字符内');
            return;
        }
        formData.append('fileName',this.newFileName?this.newFileName:fileName);
        this.https.sendToFoam(formData).then(res => {
          this.$message({
            message: '成功应用到项目',
            type: 'success'
          });
          this.fullscreenLoading = false;
        }).catch(err => {
          this.fullscreenLoading = false;
          console.log(err);
          if(err.code==400){
            this.$prompt('tim文件名称已存在，请输入新的文件名称', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
              // inputErrorMessage: ''
            }).then(({ value }) => {
              this.newFileName = value.trim().indexOf('.tim')>-1?value.trim():(value.trim()+'.tim');
              this.sendToFoam();
            }).catch(() => {

            });
          }
        })
      },
      getTimHeight() {
        let name = '';
        this.columnData.typeSpeed.forEach(item => {
          if (item.columnNumber == this.speedValue) {
            name = item.height + 'm' + (item.cedian == 'DEFAULT' ? '' : item.cedian);
          }
        })
        return name;
      },
      downloadStandardHandle() {
        this.https.downloadStandard(this.ensureId, this.columns, this.timeInterval, this.timeValue).then(res => {
          this.createLink(res, this.fileInfo.windMeasurementTowerNumber + '#(' + this.timeValue[0].split(' ')[0].replace(/\//g, '') + '-' + this.timeValue[1].split(' ')[0].replace(/\//g, '') + (this.timeInterval == 'TEN_MIN' ? ') 10min' : ') 60min') + '.txt');
        }).catch(err => {
          this.createLink(err.data, this.fileInfo.windMeasurementTowerNumber + '#(' + this.timeValue[0].split(' ')[0].replace(/\//g, '') + '-' + this.timeValue[1].split(' ')[0].replace(/\//g, '') + (this.timeInterval == 'TEN_MIN' ? ') 10min' : ') 60min') + '.txt');
          this.fullscreenLoading = false;
          console.log(err);
        })
      },
      downloadTimHandle() {
          if(this.$refs.tim.checkYearFlag()){
              this.fullscreenLoading = false;
              return;
          }
        this.https.downloadTim(this.ensureId, this.speedValue, this.directionValue, this.timeValue, this.reviseValue, this.timeIntervalE, this.checkedT).then(res => {
          this.createLink(res, 'M' + this.fileInfo.windMeasurementTowerNumber + '_' + this.getTimHeight() + '.tim');
        }).catch(err => {
          if (err.data) {
            this.createLink(err.data, 'M' + this.fileInfo.windMeasurementTowerNumber + '_' + this.getTimHeight() + '.tim');
          } else {
            _toast('下载失败，请确认所上传文件无误再试');
          }
          this.fullscreenLoading = false;
          console.log(err);
        })
      },
      downloadEwtHandle() {
        this.https.downloadEwt(this.ensureId, this.speedValueE, this.directionValueE, this.timeValue, this.reviseValueE, this.relevanceValue).then(res => {
          console.log(res)
          //if(res){
          this.createLink(res, this.fileName)
          //}
        }).catch(err => {
          this.createLink(err.data, this.fileName)
          this.fullscreenLoading = false;
          //console.log(err);
        })
      }
    }
  }
</script>

<style lang="less">
  .data-download {
    width: 100%;
    height: 100%;
    padding: 0px 10px 60px;
    overflow-x: hidden;
    overflow-y: scroll;
    position: relative;
    text-align: left;
    color:rgba(255,255,255,.7);
    .has-data {
      width: 100%;
      position: relative;
      .filename {
        width:100%;
        padding: 20px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .start_end_time {
        position: absolute;
        right: 0;
        top: 55px;
        z-index: 99;
        display: flex;
        flex-direction: row;
        align-items: center;
        .el-input__inner {
          height: 30px;
          line-height: 30px;
          background:transparent;
          border-color:rgba(3,73,114,1);
        }
        .el-date-editor {
          input{
            color:rgba(255,255,255,1);
            background:transparent;
          }
          .el-range__icon, .el-range-separator,.el-range__close-icon {
            line-height: 25px !important;
            color:rgba(255,255,255,.7);
          }
        }
        .el-button {
          width: 100px;
          height: 30px;
          background: rgba(3,73,114,1);
          border-radius: 4px;
          text-align: center;
          line-height: 30px;
          border: none;
          padding: 0;
          margin-top: 14px;
          color: rgba(255,255,255,.7);
          margin-left: 10px;
          margin-top: 0;
          border-radius: 2px;
          &:hover {
            background: rgba(3,73,114,1);
            border: none;
            color: rgba(255,255,255,.7);
            opacity: .5;
          }
        }
      }
      .el-tabs {
        .el-tabs__header {
          margin: 0;
          border-color:rgba(3,73,114,1);
        }
        .el-tabs__nav {
          border-color: rgba(3, 73, 114, 1);
        }
        .el-tabs__item {
          padding: 0 !important;
          text-align: center;
          height: 30px;
          line-height: 30px;
          width: 90px;
          background-color: rgb(204, 204, 204);
          color: rgb(3, 73, 114);
          background-color: rgba(3,73,114,1);
          color: rgb(255, 255, 255);
          border-color:rgba(3,73,114,1);
          opacity: .5;
          &.is-active {
            background-color: rgb(255, 255, 255);
            color: rgb(3, 73, 114);
            opacity: 1;
          }
        }
      }
    }
    .el-checkbox-group{
      .el-checkbox__input{
        top:-2px;
      }
      .el-checkbox__label{
        color:rgba(255,255,255,.5);
      }
    }
    .bottom-btn {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 60px;
      overflow: hidden;
      border-top: 1px solid rgba(3,73,114,1);
      text-align: center;
      .el-button {
        padding:0;
        width:100px;
        height: 30px;
        background: rgba(3,73,114,1);
        border-radius: 4px;
        text-align: center;
        line-height: 30px;
        border: none;
        margin: 14px 15px 0;
        color: rgba(255,255,255,.7);
        border-radius: 2px;
        &:hover {
          background: rgba(3,73,114,1);
          border: none;
          color: rgba(255,255,255,.7);
          opacity: .5;
        }
      }
    }
  }
</style>
