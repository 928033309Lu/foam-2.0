<template>
  <div class="wind_analysis">
    <el-row :gutter="10">
      <el-col :span="12" v-for="(box, index) in boxList" :key="box.name + index">
        <div class="echart-container">
          <h3 class="echart-title">{{box.label}}<i class="iconfont iconquanping1" @click="zoomInEcharts(index)"></i></h3>
          <polar v-if="box.type && box.type === 'polar'" :id="box.name" :ref="'com'+index" class="echarts" :windSet.sync="box.data || null"></polar>
          <radar v-else-if="box.type && box.type === 'radar'" :id="box.name" :ref="'com'+index" class="echarts" :windSet.sync="box.data || null"></radar>
          <component v-else :ref="'com'+index" :is="box.name" class="echarts"  :id="box.name + index" :windSet.sync="box.data || null"></component>
        </div>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="zoomVisible" :title="boxList[zoomI].label" class="zoom-window" :width="(boxList[zoomI].type && (boxList[zoomI].type === 'polar' || boxList[zoomI].type === 'radar')) ? '' : '1080px'"  :fullscreen="(boxList[zoomI].type && (boxList[zoomI].type === 'polar' || boxList[zoomI].type === 'radar')) ? true : false" :modal-append-to-body="false">
      <multi-polar v-if="boxList[zoomI].type && boxList[zoomI].type === 'polar'" :id="'echartsFull'" :windSet.sync="boxList[zoomI].data || null" :ref="'zoom'+zoomI" class="echarts-fullpage"></multi-polar>
      <multi-radar v-else-if="boxList[zoomI].type && boxList[zoomI].type === 'radar'" :id="'echartsFull'" :windSet.sync="boxList[zoomI].data || null" :ref="'zoom'+zoomI" class="echarts-fullpage"></multi-radar>
      <speed-tower v-else-if="boxList[zoomI].type && boxList[zoomI].type === 'tower'" :id="'echartFull'" :windSet.sync="boxList[zoomI].data || null" :ref="'tower'+zoomI" class="echarts-full"></speed-tower>
      <multi-flow-rose v-else-if="boxList[zoomI].name == 'flowRose'" :id="'echartFull'" :windSet.sync="boxList[zoomI].data || null" :ref="'zoom'+zoomI" class="echarts-full"></multi-flow-rose>
      <div v-else id="echartFull" class="echarts-full"></div>
    </el-dialog>
  </div>
</template>
<script>
  import echarts from 'echarts';
  import speedTower from  '@/components/echarts/wind/speedTower.vue'
  import speedAltitude from  '@/components/echarts/wind/speedAltitude.vue'
  import polar from '@/components/echarts/polar.vue'
  import radar from '@/components/echarts/radar.vue'
  import flowRose from '@/components/echarts/flow-rose.vue'
  import multiPolar from '@/components/echarts/multi-polar.vue'
  import multiRadar from '@/components/echarts/multi-radar.vue'
  import multiFlowRose from '@/components/echarts/multi-flow-rose.vue'
  // import {SchemeServices} from '@/services/scheme.service'
  let schemeServices;
  export default {
    data() {
      return {
        dataSet: {},
        boxList:[
          {label:"机位点/测风塔 - 风速(尾流前)/海拔", name:'speedAltitude', data:{}},
          {label:"机位点 - 风速(尾流后)/海拔", name:'speedAltitude', data:{}},
          {label:"机位点/测风塔 - 风速(尾流前)",type: 'tower', name:'speedTower', data: {}},
          {label:"机位点/测风塔 - 风速(尾流后)",type: 'tower', name:'speedTower', data: {}},
          {label:"风向玫瑰图", name:'windDirection',type: 'polar', data: {}},
          {label:"风能玫瑰图", name:'windEnergy',type: 'polar', data: {}},
          {label:"湍流雷达图", name:'onFlow',type: 'radar', data: {}},
          {label:"湍流玫瑰图", name:'flowRose',type: '', data: {}}
        ],
        zoomVisible: false,
        zoomI: 0,
        enlarge:false,
      }
    },
    props:[],
    components: {speedTower, speedAltitude, polar, multiPolar, radar, multiRadar, flowRose, multiFlowRose},
    mounted() {
      this.initData();
      this.getWindDirectionData();
    },
    computed:{
      dataFrom(){
        return sessionStorage.getItem('dataFrom');
      }
    },
    methods: {
      initData() {
        let vm = this;
        this.projectHttps.getwindSpeed(vm.$route.params.projectId, vm.$route.params.id).then((data) => {
          vm.formatData(data)
        }).catch(error => {
          console.log(error)
        })
        // vm.getSchemeById();
        // if(this.$route.query.tabId){
        //   this.activeName = this.$route.query.tabId
        // }
        
        window.onresize = ()=>{
          this.$nextTick(()=>{
            this.boxList.forEach((v, k) => {
              let id = (k<4 || k==7) && (v.name+k) || v.name
              let ins = echarts.getInstanceByDom(document.getElementById(id))
              ins.resize();
            })
          })
        }
      },
      formatData(d) {
        let vm = this, seatList = [], towerDataList = [], altitudeList = [], wtAltitudeList = [], windSpeedList = [],windSpeedbeforeList=[], powerBeforeList = [],
          powerAfterList = [], hoursBeforeList = [], hoursAfterList = [], reductionRateList = [];
        d && d.length > 0 && d.forEach((cur) => {
          altitudeList.push(cur.z);
          if (!!cur.model) {
            seatList.push(cur.label);
            wtAltitudeList.push(cur.z);
            // windSpeedList.push(cur.windSpeedBeforeWake);
            windSpeedList.push(cur.windSpeedAfterWake);
            windSpeedbeforeList.push(cur.windSpeedBeforeWake);
            powerBeforeList.push(cur.powerBeforeWake)
            powerAfterList.push(cur.powerAfterWake)
            hoursBeforeList.push(cur.hoursBeforeWake)
            hoursAfterList.push(cur.hoursAfterWake)
            reductionRateList.push(Math.abs(cur.reductionRateAvgAfterWake))
          } else {//model 为空，表示测风塔
            // if (cur.label == "M1" || cur.label == "M2" || cur.label == "M3" || cur.label == "M4") {
            // if (cur.label.startsWith("M")) {
              towerDataList.push({label: cur.label, windSpeedOfTower: cur.windSpeedBeforeWake}) //测风塔数据
            // }
          }
        })
        // vm.$set(vm.tabList, 0, Object.assign(vm.tabList[0], {data: {d, seatList}}))
        // vm.$set(vm.tabList, 1, Object.assign(vm.tabList[1], {data: {seatList, altitudeList, hoursBeforeList, hoursAfterList, powerBeforeList, powerAfterList, reductionRateList}}))
        // vm.$set(vm.tabList, 2, Object.assign(vm.tabList[2], {data: {seatList, altitudeList, windSpeedList, towerDataList,windSpeedbeforeList}}))
        this.dataSet = {seatList, altitudeList, wtAltitudeList, windSpeedList, towerDataList, windSpeedbeforeList}
        this.initChartsData()
      },
      initChartsData(){
        let tempData= this.dataSet;
        for(let i=0;i<tempData.seatList.length;i++){
          if(tempData.seatList[i].indexOf('_')>-1&&this.dataFrom<2){
            tempData.seatList[i] = tempData.seatList[i].slice(tempData.seatList[i].indexOf('_')+1);
          }
        }
        this.$set(this.boxList, 2, Object.assign(this.boxList[2],{data: {seats:tempData.seatList,tower:tempData.towerDataList,windSpeed:tempData.windSpeedbeforeList}}))
        this.$set(this.boxList, 0, Object.assign(this.boxList[0],{data: {seats:tempData.seatList,tower:tempData.towerDataList,h:tempData.altitudeList,windSpeed:tempData.windSpeedbeforeList}}))
        this.$set(this.boxList, 3, Object.assign(this.boxList[3],{data: {seats:tempData.seatList,tower:tempData.towerDataList,h:tempData.altitudeList,windSpeed:tempData.windSpeedList}}))
        this.$set(this.boxList, 1, Object.assign(this.boxList[1],{data: {seats:tempData.seatList,tower:[],h:tempData.wtAltitudeList,windSpeed:tempData.windSpeedList}}))
      },
      //获取风向数据
      getWindDirectionData(){
        let vm = this;
        this.projectHttps.getWindDirectionData(vm.$route.params.projectId, vm.$route.params.id).then((data)=>{
          let windir = JSON.parse(data.directionResult);
          this.setPolarData({
            legendName: 'dirLegend',
            seriesName: 'dirSeries',
            data: windir
          }, 4)
          this.setPolarData({
            legendName: 'powerLegend',
            seriesName: 'powerSeries',
            data: windir
          }, 5)
          this.setPolarData({
            indicator: 'turbuRadarMax',
            seriesName: 'turbuRadarSeries',
            data: windir
          }, 6)
          this.setPolarData({
            legendName: 'turbuRoseLegend',
            seriesName: 'turbuRoseSeries',
            data: windir
          }, 7)
        }).catch(error=>{
          console.log(error)
        })
      },
      setPolarData(d, index){
        this.$set(this.boxList, index, Object.assign(this.boxList[index], {
          data: d
        }))
      },
      zoomInEcharts(k){
        this.zoomI = k;
        this.zoomVisible = true;
        this.$nextTick(()=>{
          if(this.boxList[k].type && this.boxList[k].type === 'polar'){
            this.$refs['zoom'+k].zoomDraw("echartsFull", this.$refs['com'+k][0].curDevice)
          }else if(this.boxList[k].type && this.boxList[k].type === 'radar'){
            this.$refs['zoom'+k].zoomDraw("echartsFull", this.$refs['com'+k][0].curDevice)
          }else if(this.boxList[k].type && this.boxList[k].type === 'tower'){
            echarts.dispose(document.getElementById("echartFull"));
            this.$refs['tower'+k].zoomDraw("echartFull")
          }else if(this.boxList[k].name == 'flowRose'){
            this.$refs['zoom'+k].zoomDraw("echartsFull", this.$refs['com'+k][0].curDevice)
          }else{
            echarts.dispose(document.getElementById("echartFull"));
            this.$refs['com'+k][0].zoomDraw("echartFull")
          }
        })
      }
    },
    watch:{
      // dataSet:function (cur) {
      //   this.initChartsData()
      // }
    }
  }
</script>
<style lang='less'>
  @border_color:#e4e7ed;
  .wind_analysis {
    padding-top: 10px;
    .echart-container{
      background: @sideBlack;
      margin-bottom: 10px;
      border-radius: 2px;
      .echart-title{
        position: relative;
        border-bottom: 1px solid @inputColor;
        font-size: 16px;
        font-weight: normal;
        padding: 12px 22px 11px;
        line-height: 1;
        color: @whiteColor;
        .iconfont{
          background-size: 18px;
          width: 40px;
          height: 40px;
          position: absolute;
          right: 0;
          top: 0;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
        }
      }
    }
    .echarts,
    .polar-echart{
      width: 100%;
      height: 380px;
      .el-select{
        .el-input__inner{
          color: @whiteColor;
        }
      }
    }
    .radar-echart{
      width: 100%;
      height: 380px;
      /*padding-top: 40px;*/
    }
    .zoom-window{
      .el-dialog{
        .el-dialog__header{
          padding-top: 12px;
          padding-bottom: 9px;
          .el-dialog__title{
            font-size: 16px;
            line-height: 1;
            color: #333;
          }
          .el-dialog__headerbtn{
            top: 12px;
            .el-dialog__close{
              color: #B2B3C6;
              font-weight: bold;
            }
          }
        }
        .el-dialog__body{
          padding: 0;
        }
        &.is-fullscreen{
          width: calc(100% - 100px);
          height: calc(100% - 100px);
          margin: 50px;
          overflow: hidden;
          .el-dialog__body{
            width: 100%;
            height: 100%;
            padding-bottom: 30px;
            margin-bottom: -30px;
          }
        }
      }
      .echarts-full,
      .polar-echart{
        width: 1080px;
        height: 600px;
        max-height: 70vh;
      }
      .echarts-fullpage{
        width: 100%;
        height: 100%;
        position: relative;
      }
    }
  }
</style>
