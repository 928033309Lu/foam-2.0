<template>
  <div class="power-analaysis">
    <el-row :gutter="20">
      <el-col :span="12" v-for="(box, i) in boxList" :key="i">
        <div class="echart-container">
          <h3 class="echart-title">{{box.label}}<i class="iconfont icon-quanping" @click="zoomInEcharts(i)"></i></h3>
          <echarts-powera :ref="'com'+i" :id="box.name" class="echarts" :dataset.sync="box.data || null"></echarts-powera>
        </div>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="zoomVisible" :title="boxList[curZoomIndex].label" class="zoom-window" width="1080px">
      <div id="echartsFull" class="echarts-full"></div>
    </el-dialog>
  </div>
</template>
<script>
  import echarts from 'echarts';
  import echartsPowera from '@/components/project/analaysis/echarts-powera.vue'
  export default {
    data() {
      return {
        boxList:[
          {label:"机位点 - 发电量", name:'power', option: {
            dataZoomInsideShow:false,
            color: ['#ffb70a', '#37c7e2'],
            x:{n: '机位点', d: 'seatList'},
            y: [{name: '发电量（MWh/year）',d: 'powerList'}],
            s: [{name: '尾流前',d: 'powerBeforeList', unit: 'MWh/year'}, {name: '尾流后', d: 'powerAfterList', unit: 'MWh/year'}]
          }, data: []},
          {label:"机位点 - 尾流前小时数", name:'hoursBeforeWake', option: {
            dataZoomInsideShow:false,
            color: ['#FF1800'],
            x:{n: '机位点', d: 'seatList'},
            y: [{name: '发电小时数（h）',d: 'hoursBeforeList'}],
            s: [{name: '发电小时数',d: 'hoursBeforeList', unit: 'h'}]
          }, data: []},
          {label:"机位点 - 尾流损失率", name:'reductionRate', option: {
            dataZoomInsideShow:false,
            color: ['#4f8ce2'],
            tooltip: {
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#666666',
                  formatter: (v)=>{return typeof(v.value) == 'number' && `-${parseFloat(String(v.value).replace(',','')).toFixed(1)}` || v.value}
                }
              },
            },
            x:{n: '机位点', d: 'seatList'},
            y: [{name: '尾流损失率（%）', d: 'reductionRateList', axisLabel: {formatter: (v)=>{return (v==0 ? v : `-${v}`)}}}],
            s: [{name: '尾流损失率', d: 'reductionRateList', unit: '%', pre: '-'}]
          }, data: []},
          {label:"机位点 - 发电小时数/海拔", name:'powerHoursAtitude', option: {
              dataZoomInsideShow:false,
            color: ['#7850EC', '#99cc34'],
            x:{n: '机位点', d: 'seatList', nameGap: 40},
            y: [{name: '发电小时数（h）', d: 'hoursAfterList'},{name: '海拔（m）', d: 'altitudeList',splitLine: {show: false}}],
            s: [{name: '发电小时数', d: 'hoursAfterList', unit: 'h'},{name: '海拔', d: 'altitudeList', yAxisIndex: 1, unit: 'm'}]
          }, data: []}
        ],
        zoomVisible: false,
        curZoomIndex: 0,
        colors: ['#FF1800', '#1B7DE2', '#7850EC', '#99cc34']
      }
    },
    props:['dataSet'],
    components: {echartsPowera},
    mounted() {},
    methods: {
      initEcharts(){
        let vm = this;
        vm.dataSet.powerList = vm.dataSet.powerBeforeList.concat(vm.dataSet.powerAfterList)
        vm.boxList.forEach((cur, i)=>{
          let o = {
            name: [''],
            xAxis: [Object.assign({
              name: cur.option.x.n,
              data: vm.dataSet[cur.option.x.d]
            }, cur.option.x)],
            yAxis: cur.option.y.map((v)=>{
              return Object.assign({
                name: v.n,
                min: (Math.min.apply(Math, vm.dataSet[v.d])===0) ? 0 : (Math.min.apply(Math, vm.dataSet[v.d])- 10),
                max: Math.max.apply(Math, vm.dataSet[v.d])
              }, v)
            }),
            color: cur.option.color,
            series: cur.option.s.map((v)=>{
              return Object.assign({
                data: vm.dataSet[v.d],
                smooth: true,
              },v)
            })
          }
          cur.option.legend && (o.legend = cur.option.legend)
          cur.option.tooltip && (o.tooltip = cur.option.tooltip)
          vm.$set(vm.boxList, i, Object.assign(vm.boxList[i], {data:o}))
        })
      },
      zoomInEcharts(k){
        this.curZoomIndex = k;
        this.zoomVisible = true;
        this.$nextTick(()=>{
          echarts.dispose(document.getElementById("echartsFull"));
           this.$refs['com'+k][0].zoomDraw("echartsFull")
        })
      }
    },
    watch: {
      dataSet: function (cur,old) {
//        console.log(cur)
        this.initEcharts()
      }
    }
  }
</script>
<style lang='less'>
  .power-analaysis{
    .echart-container{
      background: #F8F9FD;
      margin-bottom: 20px;
      border-radius: 4px;
      .echart-title{
        position: relative;
        border-bottom: 1px solid #CFD9E5;
        font-size: 16px;
        font-weight: normal;
        padding: 12px 22px 11px;
        line-height: 1;
        color: #333;
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
    .echarts{
      width: 580px;
      height: 380px;
    }
  }
  .zoom-window{
    .el-dialog__header{
      border-bottom: 1px solid #EDEDED;
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
    .echarts-full{
      width: 1080px;
      height: 600px;
      max-height: 70vh;
    }
  }
</style>
