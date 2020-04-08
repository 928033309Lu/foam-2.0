<template>
  <div class="multi-radar">
    <el-scrollbar class="device-group" wrapClass="wrap">
      <label class="el-checkbox">结果点</label>
      <el-checkbox :indeterminate="checkDevice.length>0 && checkDevice.length<devices.length" v-model="checkAll" @change="checkAllDevice">全选</el-checkbox>
      <el-checkbox-group v-model="checkDevice" @change="deviceChange">
        <!--<el-checkbox v-for="(device, index) in devices" :label="device" :key="device" @change="curDevChange(device, index)">{{device.indexOf('_')>-1&&device.slice(device.indexOf('_')+1)||device}}</el-checkbox>-->
        <el-checkbox v-for="(device, index) in devices" :label="device" :key="device" @change="curDevChange(device, index)">{{device}}</el-checkbox>
      </el-checkbox-group>
    </el-scrollbar>
    <el-scrollbar ref="echartsGroup" class="echarts-group" id="echartsCon" wrapClass="echart-wrap" :noresize="false">
      <div :id="`${id}${index}`" class="polar-echart" v-for="(item, index) in checkDevice" :key="item" :style="`width: ${echart.width}; height: ${echart.height}`"></div>
    </el-scrollbar>
    <div v-if="legend.length>0" class="my-legend">
      <div class="title">风速 {{legend[windSpeed-1]}}m/s</div>
      <el-slider v-model="windSpeed" :min="1" :max="25" @change="legendChange"  :format-tooltip="formatTooltip"></el-slider>
    </div>
  </div>
</template>
<style lang="less">
  .multi-radar{
    .el-scrollbar__view{
      position: relative;
    }
    .el-scrollbar__wrap {
      overflow: auto;
      height: calc(100% + 40px);
      width: calc(100% + 40px);
      padding-right: 40px;
      padding-bottom: 40px;
    }
    .el-scrollbar__bar{
      right: 0;
      bottom: 0;
      .el-scrollbar__thumb{
        /*background-color: #eee;*/
      }
    }
    @checkW: 150px;
    @borderColor: #EDEDED;
    @legendH: 40px;
    .device-group{
      width: @checkW;
      height: 100%;
      padding: 20px;
      float: left;
      margin-right: -@checkW;
      z-index: 11;
      border-right: 1px solid @inputColor;
      color: @whiteColor;
      .wrap{
        /*max-height: 200px;*/
      }
      .el-checkbox-group{
        margin-top: 14px;
      }
      .el-checkbox{
        display: block;
        color: @whiteColor;
        &+.el-checkbox{
          margin-left: 0;
          margin-top: 14px;
        }
        .el-checkbox__label{
          vertical-align: middle;
        }
      }
    }
    .echarts-group{
      position: relative;
      width: 100%;
      padding-left: @checkW+10px;
      height: calc(100% - 50px);
      padding-top: 50px;
      .echart-wrap{
        height: 100%;
      }
      .el-scrollbar__view{
        height: 100%;
        /*display: flex;*/
        /*justify-content: space-around;*/
        /*flex-wrap: wrap;*/
      }
    }
    .polar-echart{
      display: inline-block;
      /*min-width: 340px;*/
      /*min-height: 340px;*/
    }
    .my-legend{
      display: flex;
      position: absolute;
      left: @checkW;
      top: 0;
      width: calc(100% - @checkW);
      padding-right: 20px;
      height: @legendH;
      background-color: transparent;
      border-bottom: 1px solid @inputColor;
      color: @whiteColor;
      .title{
        padding: 9px;
        padding-right: 20px;
      }
      .el-slider{
        flex: 1;
      }
    }
  }
</style>
<script>
  import echarts from 'echarts'
  import polarEcharts from "./polar"
  export default {
    data() {
      return {
        checkAll: false,
        checkDevice: [],
        devices: [],
        dir: {
          1: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'],
          2: ['N', '', 'NE', '', 'E', '', 'SE','','S','','SW','','W','','NW',''],
          3: ['', '', 'NE', '', '', '', 'SE','','','','SW','','','','NW',''],
        },
        colors: ['#0022F4','#007EFF','#1BC4E2','#3BF5BE','#C3EC34','#EC7F1F'],
        echart: {
          width: 0,
          height: 0
        },
        legend: [],
        curDevice: '',//current checkbox value
        curDeviceIndex: '', //index of current checkbox in checklist,
        windSpeed: 15,
        turbuMaxWind10: [] //风速为10的湍流最大值
      }
    },
    props: ['id','windSet'],
    components: {},
    mounted() {
      this.$nextTick(()=>{
        this.windSpeed = 15
      })
    },
    methods: {
      initData(d){
        let vm = this;
        if(d && d.data){
          // console.log(d)
          this.devices = Object.keys(d.data).sort();
          this.checkDevice = this.checkDevice || this.options[0]
          this.devices.forEach(v => {
            vm.turbuMaxWind10.push(vm.arrMaxFill(d.data[v][this.windSet.seriesName][9].value))
          })
          this.deviceChange()
        }
      },
      drawEchart(o){
        let num = this.checkDevice.length;
        let option = polarEcharts.setRadarOption(Object.assign({
          areaStyle: {
            color: ['RGBA(248, 249, 253, 0)', 'rgba(3, 73, 114, .7)']
          },
          legend: {
            show: false,
            selectedMode: 'single'
          }
        }, o))
        this.$nextTick(()=>{
          echarts.dispose(document.getElementById(o.id))
          let myChart = echarts.init(document.getElementById(o.id))
          myChart.setOption(option);
        })
      },
      curDevChange(v, index){
        this.curDevice = v;
      },
      deviceChange(v){
        let checkCount = v && v.length;
        this.curDeviceIndex = this.checkDevice.indexOf(this.curDevice);
        this.checkAll = checkCount === this.devices.length;
        this.initChart(v)
      },
      initChart(device){
//        let colNum = Math.ceil(Math.sqrt(this.checkDevice.length))
//        let rowNum= this.checkDevice.length%colNum==0 ? this.checkDevice.length/colNum : Math.ceil(this.checkDevice.length/colNum);
//        this.echart.width = `${(1/colNum*100)}%`
//        this.echart.height = `${(1/rowNum*100-1)}%`
        let vm = this;
        let winW = document.getElementById("echartsCon").clientWidth-150, winH = document.getElementById("echartsCon").clientHeight, minW = 340, l = this.checkDevice.length;
        let maxCol = Math.floor(winW/minW), maxRow = Math.floor(winH/minW);
        let newW = l > maxCol ? `${(1/maxCol*100)}%` : `${(1/l*100)}%`;
        let newH = l > maxCol ? (l/maxCol > maxRow ? `${minW}px` : `${(1/maxRow*100-1)}%`) : '99%';
        let maxfill = vm.arrMaxFill(vm.windSet.data[vm.curDevice][vm.windSet.seriesName].filter(v=>{return v.name == vm.windSpeed})[0].value);
        if(newW === this.echart.width && this.echart.height === newH){
          if(this.checkDevice.indexOf(this.curDevice) == -1){
            return;
          }
          let v = this.windSet.data[this.curDevice];
          this.drawEchart({
            title: {
              text: this.curDevice
            },
            id: `${this.id}${this.curDeviceIndex}`,
            radar: vm.windSpeed>9 && vm.turbuMaxWind10[vm.devices.indexOf(vm.curDevice)].map((w,k)=>{
              return w>maxfill[k] && w || maxfill[k]
            }) || vm.arrMaxFill(v[this.windSet.indicator]),
            series: {
              data: v[this.windSet.seriesName].map(series=>{
                return {
                  name: series.name,
                  value: this.clockData(series.value)
                }
              })
            }
          })
        }else {
          this.echart.width = newW
          this.echart.height = newH
          this.checkDevice.forEach((d, k) => {
            let v = this.windSet.data[d];
            if(k == 0){
              this.legend = v[vm.windSet.seriesName].map((leg)=>{
                return Number(leg.name)
              });
            }
            this.drawEchart({
              title: {
                text: d
              },
              id: `${this.id}${k}`,
              radar: vm.windSpeed>9 && vm.turbuMaxWind10[vm.devices.indexOf(d)].map((w,k)=>{
                return w>maxfill[k] && w || maxfill[k]
              }) || vm.arrMaxFill(v[this.windSet.indicator]),
              series: {
                data: v[this.windSet.seriesName].map(series=>{
                  return {
                    name: series.name,
                    value: this.clockData(series.value)
                  }
                })
              }
            })
          })
        }
        // this.echart.width = l > maxCol ? `${(1/maxCol*100)}%` : `${(1/l*100)}%`;
        // this.echart.height = l > maxCol ? (l/maxCol > maxRow ? `${minW}px` : `${(1/maxRow*100-1)}%`) : '99%';
        this.$nextTick(()=>{
          this.$refs['echartsGroup'].update()
          this.legendChange(this.windSpeed)
        })
      },
      checkAllDevice(v){
        this.checkDevice = v ? this.devices : this.devices.slice(0, 1);
        this.initChart()
      },
      zoomDraw(id, device){
        this.id = id
        this.checkDevice = [device];
        this.curDevice = device;
        this.initData(this.windSet)
      },
      legendChange(radio){
        let vm = this;
        this.checkDevice.forEach((d, k) => {
          let dom = echarts.getInstanceByDom(document.getElementById(`${this.id}${k}`))
          let maxfill = vm.arrMaxFill(vm.windSet.data[d][vm.windSet.seriesName].filter(v=>{return v.name == radio})[0].value)
          dom.dispatchAction({
            type: 'legendSelect',
            name: this.legend[radio-1],
          })
          //设置风速>=10m/s时，雷达图的最大值为默认最大值；风速<10时，雷达图的最大值取10m/s时候的湍流值
          if(radio>9){
            dom.setOption({
              radar: Object.assign(dom.getOption().radar[0], {
                indicator: polarEcharts.setRadarIndicator(vm.turbuMaxWind10[vm.devices.indexOf(d)].map((v,k)=>{
                  return v>maxfill[k] && v || maxfill[k]
                }))
              })
            })
          }else{
            dom.setOption({
              radar: Object.assign(dom.getOption().radar[0], {
                indicator: polarEcharts.setRadarIndicator(vm.arrMaxFill(vm.windSet.data[vm.curDevice][[vm.windSet.indicator]]))
              })
            })
          }
        })
      },
      formatTooltip(val){
        return `${this.legend[val-1]} m/s`
      },
      clockData(arr){
        let newarr = Object.assign([],arr)
        newarr.reverse()
        newarr.unshift(newarr[newarr.length-1])
        newarr.pop()
        return newarr
      },
      arrMaxFill(arr){
        let max = Math.max.apply(Math, arr), newarr = [];
        arr.forEach(v=>{
          newarr.push(max)
        })
        return newarr
      }
    },
    watch: {
      windSet: function(cur){
        this.initData(cur)
      }
    }

  }
</script>
