<template>
  <div class="wind-parameter" v-loading.fullscreen="loading" element-loading-text="数据加载中，请稍后..." element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="wind-parameter-left">
      <line-chart title="月平均风速" id='1' :isCollapse="isCollapse" :data="resultData.monthlySpeed" :is-full="isFull"></line-chart>
      <line-chart title="风切变" id='2' :A="A" :isCollapse="isCollapse" :data="resultData.shear" :is-full="isFull"></line-chart>
      <rose-chart title="风向玫瑰图" id='4' :isCollapse="isCollapse" :data="resultData.wdFrequency"></rose-chart>
      <weibull-chart title="威布尔分布" id='5' :A="resultData.weibullA" :K="resultData.weibullK" :isCollapse="isCollapse" :dataOne="resultData.weibullFrequency" :dataTwo="resultData.weibullMaximum"></weibull-chart>
      <airDensity-chart title="空气密度" :isCollapse="isCollapse" id='6' :data="resultData.monthlyAirDensity"></airDensity-chart>
      <line-chart title="湍流强度" id='3' :isCollapse="isCollapse" :data="resultData[radio]" :is-full="isFull"></line-chart>
    </div>
    <div class="wind-parameter-right" :class="{'active':!isCollapse}">
      <div class="collapse" @click="isCollapse=!isCollapse" :class="{'active':!isCollapse}">
        <!--{{isCollapse?'收起':'展开'}}-->
        <i class="iconfont iconziyuan2"></i>
      </div>
      <div class="filename" :title="fileName">
        {{fileName}}
      </div>
      <ul class="time-box">
        <li class="title">起止时间：</li>
        <li class="line"></li>
        <li class="time-text">
          <p>{{timeValue[0]}}</p>
          <p>{{timeValue[1]}}</p>
        </li>
        <li class="time-plug">
          <i class="iconfont iconxiugai"></i>
          <div class="time">
          <el-date-picker
          v-model="timeValue"
          align="right"
          @change="getPicData"
          value-format="yyyy/MM/dd HH:mm"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['12:00:00']">
          </el-date-picker>
          </div>
        </li>
      </ul>
      <ul class="info" v-if="resultData.rightWindParam">
        <li>
          <div class="title">
            <span>风速结果</span>
            <i class="iconfont iconarrow-down1" :class="{'active':!windFlag}" @click="windFlag=!windFlag"></i>
          </div>
          <ul class="info-list" :class="{'active':windFlag}">
            <li v-for="item in resultData.rightWindParam.windResult">
              <span>{{item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian)}}</span>
              <span>{{(item.data&&item.data!='NaN'&&item.data>=0)?(item.data.toFixed(2) + 'm/s'):''}}</span>
            </li>
          </ul>
        </li>
        <li>
          <div class="title">
            <span>湍流结果</span>
            <el-radio-group v-model="radio">
              <el-radio label="iec2">IEC2</el-radio>
              <el-radio label="iec3">IEC3</el-radio>
            </el-radio-group>
            <i class="iconfont iconarrow-down1" :class="{'active':!turbulenceFlag}" @click="turbulenceFlag=!turbulenceFlag"></i>
          </div>
          <ul class="info-list" :class="{'active':turbulenceFlag}">
            <li v-for="item in resultData.rightWindParam[radio]">
              <span>{{item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian)}}</span>
              <span>{{(item.data&&item.data!='NaN'&&item.data>=0)?item.data.toFixed(3):'-'}}</span>
            </li>
          </ul>
        </li>
        <li>
          <div class="title">
            <span>其他风参</span>
            <i class="iconfont iconarrow-down1" :class="{'active':!otherFlag}" @click="otherFlag=!otherFlag"></i>
          </div>
          <ul class="info-list" :class="{'active':otherFlag}">
            <li>
              <span>风切变</span>
              <span>{{(resultData.rightWindParam.other.shear?((resultData.rightWindParam.other.shear.toFixed(3))+' ('+resultData.shearMinHeight+'m-'+resultData.shearMaxHeight+'m)'):'')}}</span>
            </li>
            <li>
              <span>空气密度</span>
              <span>{{resultData.rightWindParam.other.airDensity?(resultData.rightWindParam.other.airDensity.toFixed(3)+' kg/m³'):''}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="btns">
        <el-button @click="showDialog(1)">极限风况</el-button>
        <el-button @click="showDialog(2)">有效率</el-button>
      </div>
    </div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      class="parameters"
      :before-close="handleClose">
      <div style="width:100%;height:100%;overflow: auto">
        <effective-rate v-if="title=='有效率'"></effective-rate>
        <limit-wind v-if="title=='极限风况'"></limit-wind>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import lineChart from '@/components/charts/line-chart.vue'
  import roseChart from '@/components/charts/rose-chart.vue'
  import weibullChart from '@/components/charts/weibull-chart.vue'
  import airDensityChart from '@/components/charts/airDensity-chart.vue'
  import effectiveRate from './effectiveRate.vue'
  import limitWind from './limitWind.vue'
  import {mixin} from '../../utils/mixin'
  export default {
    name: 'wind-parameter',
    mixins: [mixin],
    props: {},
    data() {
      return {
        loading:true,
        projectId:this.$route.params.projectId,
        fileInfo: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'fileInfo')) || "",
        fileName: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'file')).fileName || "",
        timeValue:[],
        radio:'iec3',
        windFlag:true,
        turbulenceFlag:false,
        otherFlag:false,
        resultData:{},
        isCollapse:true,
        dialogVisible:false,
        title:'',
        A:'',
          isFull:true
      }
    },
    components:{
      lineChart,roseChart,weibullChart,airDensityChart,effectiveRate,limitWind
    },
    computed: {
      ensureId(){
        return this.fileInfo?this.fileInfo.ensureId:"";
      }
    },
    watch:{
      timeValue:{
        handler(cur,old){
          if(!cur){
            this.timeValue = [];
            this.$set(this.timeValue, 0, this.changeTimeType(new Date(this.fileInfo.startDateTime)));
            this.$set(this.timeValue, 1, this.changeTimeType(new Date(this.fileInfo.endDateTime)));
          }
        },
        deep:true
      }
    },
    mounted(){
      let that = this;
      window.onresize = () => {
        return (() => {
          that.$store.commit('setScreenWidth', document.body.clientWidth);
        })()
      }
      this.$set(this.timeValue, 0, this.changeTimeType(new Date(this.fileInfo.startDateTime)));
      this.$set(this.timeValue, 1, this.changeTimeType(new Date(this.fileInfo.endDateTime)));
      this.getPicData();
    },
    methods: {
      handleClose(done) {
        this.title = '';
        done();
      },
      showDialog(num){
        if(num==1){
          this.title = '极限风况';
        }else if(num==2){
          this.title = '有效率';
        }
        this.dialogVisible = true;
      },
      changeTimeType(time){
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        return year+'/'+this.addZero(month)+'/'+this.addZero(day)+' '+this.addZero(hour)+':'+this.addZero(minute);
      },
      addZero(num){
        return num>9?num:('0'+num);
      },
      getPicData(){
        if(!this.timeValue){
          this.$set(this.timeValue, 0, this.changeTimeType(new Date(this.fileInfo.startDateTime)));
          this.$set(this.timeValue, 1, this.changeTimeType(new Date(this.fileInfo.endDateTime)));
        }
        this.loading = true;
        this.https.getPicData(this.ensureId,this.timeValue[0],this.timeValue[1]).then(res => {
          this.resultData = Object.assign({},res);
          this.A = this.resultData.rightWindParam.other.shear;
          _.map(this.resultData['weibullFrequency'],(item,index)=>{
            this.resultData['weibullFrequency'][index] = (item*100).toFixed(2);
          })
          _.map(this.resultData['weibullMaximum'],(item,index)=>{
            this.resultData['weibullMaximum'][index][1] = Number((item[1]*100).toFixed(2));
            this.resultData['weibullMaximum'][index][0] = Number(item[0].toFixed(2));
          })
          _.map(this.resultData['monthlySpeed'],(item,index)=>{
            _.map(item.data,(son,idx)=>{
              if(son!="NaN" && son)
                this.resultData['monthlySpeed'][index].data[idx] = son.toFixed(2);
            })
          })
          _.map(this.resultData['wdFrequency'],(item,index)=>{
            _.map(item.data,(son,idx)=>{
              if(son)
                this.resultData['wdFrequency'][index].data[idx] = son.toFixed(4);
            })
          })
          _.map(this.resultData['iec2'],(item,index)=>{
            _.map(item.data,(son,idx)=>{
              if(son){
                if(son[1]!="NaN" && son[1]){
                  this.resultData['iec2'][index].data[idx][1] = son[1].toFixed(2);
                }else{
                  this.resultData['iec2'][index].data[idx][1] = son[1];
                }
              }
            })
          })
          _.map(this.resultData['iec3'],(item,index)=>{
            _.map(item.data,(son,idx)=>{
              if(son)
                if(son[1]!="NaN" && son[1]){
                  this.resultData['iec3'][index].data[idx][1] = son[1].toFixed(2);
                }else{
                  this.resultData['iec3'][index].data[idx][1] = son[1];
                }
            })
          })
            let arr = [];
            _.map(this.resultData.rightWindParam.windResult,item=>{
                if(arr.indexOf(item.height) == -1){
                    arr.push(item.height);
                }
            })
            if(arr.length <= 1){
                this.isFull = false;
            }
          this.loading = false;
        }).catch(err => {
          console.log(err);
          this.loading = false;
        })
      }
    }
  }
</script>
<style lang="less">
  .wind-parameter{
    width:100%;
    height:100%;
    overflow: hidden;
    padding:14px 0;
    display:flex;
    flex-direction: row;
    text-align:left;
    box-sizing:border-box;
    .wind-parameter-left{
      flex:1;
      width:100%;
      font-size: 0;
      height:100%;
      padding:0 5px;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .wind-parameter-right{
      width:292px;
      height:100%;
      padding:20px 15px;
      border-left:1px solid rgba(3,73,114,1);
      position:relative;
      transition: all .1s ease-in;
      overflow-x: hidden;
      overflow-y: scroll;
      &.active{
        width:1px;
        padding:0;
      }
      .collapse{
        width:50px;
        height:30px;
        background: #ccc;
        text-align:center;
        line-height:30px;
        border-radius: 15px;
        cursor:pointer;
        position:fixed;
        right:20px;
        top:110px;
        transform: rotate(180deg);
        &.active{
          transform: rotate(0deg);
        }
      }
      .filename{
        width:100%;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        color:rgba(255,255,255,.7);
      }
      .time-box{
        width:100%;
        overflow: hidden;
        display:flex;
        flex-direction: row;
        align-items: center;
        margin:20px 0 24px;
        li{
          position:relative;
          >i{
            color:rgba(255,255,255,.7);
          }
          &.title{
            color:rgba(255,255,255,.7);
          }
          &.line{
            width:8px;
            height:32px;
            border:1px solid #D2D2D2;
            border-right:none;
            margin-left:5px;
            margin-right:5px;
          }
          &.time-text{
            color:rgba(255,255,255,.7);
            line-height:28px;
          }
          &.time-plug{
            margin-left:10px;
            top:-12px;
            >i{
              font-size:24px;
              position:relative;
              top:10px;
            }
            .time{
              width:24px;
              height:24px;
              position:absolute;
              left:0;
              top:7px;
              z-index:99;
              cursor:pointer;
            }
            .el-date-editor{
              width:100%;
              height:100%;
              opacity:0;
            }
          }
        }
      }
      .btns {
        width: 100%;
        margin-top:20px;
        overflow: hidden;
        .el-button {
          float: left;
          width: 112px;
          height: 30px;
          color: rgba(255,255,255,.7);
          background: rgba(3,73,114,1);
          border-radius: 2px;
          line-height: 30px;
          margin-bottom: 12px;
          padding: 0;
          border: none;
          transition: opacity .3s ease;
          &:focus, &:hover {
            border: none;
            color: rgba(255,255,255,.7);
            background: rgba(3,73,114,1);
            opacity: 1;
          }
          & + .el-button {
            margin: 0 0 12px;
          }
          &:nth-child(2n) {
            margin-left: 10px;
          }
        }
      }
    }
    .info{
      width:100%;
      overflow: hidden;
      >li{
        margin-bottom:10px;
        color:rgba(255,255,255,.7);
        .title{
          display:flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width:100%;
          height:28px;
          line-height:28px;
          padding:0 10px;
          background:rgba(0,44,70,1);
          overflow: hidden;
          >span,>i{
            color:rgba(255,255,255,.7);
          }
          .el-radio-group{
            margin-left:20px;
            line-height: 1.2;
            .el-radio{
              margin-right:10px;
            }
            .el-radio__label{
              padding-left:5px;
              color:rgba(255,255,255,.7);
            }
            .el-radio__inner{
              border-color:#009FFF;
              background:transparent;
            }
            .el-radio__input.is-checked {
              .el-radio__inner{
                border-color: #009fff;
                &::after{
                  background-color:#009fff;
                }
              }
            }
            .el-radio__input.is-checked+.el-radio__label{
              color:#009fff;
            }
          }
          >i{
            cursor:pointer;
            transition: transform .3s ease-in;
            transform: rotate(-180deg);
            &.active{
              transform: rotate(0deg);
            }
          }
        }
        .info-list{
          width:100%;
          display:none;
          overflow: hidden;
          padding: 5px 10px;
          transition: display .3s ease-in;
          &.active{
            display:block;
          }
          li{
            line-height:24px;
            font-size:12px;
            display:flex;
            flex-direction: row;
            align-items: center;
            color:rgba(255,255,255,.7);
            span:nth-child(1){
              width:80px;
            }
          }
        }
      }
    }
  }
</style>
