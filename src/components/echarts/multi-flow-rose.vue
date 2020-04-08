<template>
  <div class="multi-flow-rose">
    <el-scrollbar class="device-group" wrapClass="wrap">
      <label class="el-checkbox">结果点</label>
      <el-checkbox :indeterminate="checkDevice.length>0 && checkDevice.length<devices.length" v-model="checkAll" @change="checkAllDevice">全选</el-checkbox>
      <el-checkbox-group v-model="checkDevice" @change="deviceChange">
        <el-checkbox v-for="(device, index) in devices" :label="device" :key="device" @change="curDevChange(device, index)">{{device}}</el-checkbox>
      </el-checkbox-group>
    </el-scrollbar>
    <el-scrollbar ref="echartsGroup" class="echarts-group" id="echartsCon" wrapClass="echart-wrap" :noresize="false">
      <div :id="`${id}${index}`" class="polar-echart" v-for="(item, index) in checkDevice" :key="item" :style="`width: ${echart.width}; height: ${echart.height}`"></div>
    </el-scrollbar>
    <div class="my-legend">
      <ul>
        <li v-for="item in domColors" :key="item" :style="'background-color:'+item"></li>
      </ul>
      <ul>
        <li v-for="item in legend" :key="item">{{item}}</li>
      </ul>
    </div>
  </div>
</template>
<style lang="less">
  .multi-flow-rose{
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
    @legendH: 253px;
    .device-group{
      width: @checkW;
      height: calc(100% - @legendH);
      padding: 20px;
      float: left;
      margin-right: -@checkW;
      z-index: 11;
      border-right: 1px solid @inputColor;
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
      height: 100%;
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
      position: absolute;
      left: 0;
      bottom: 0;
      width: @checkW;
      height: @legendH;
      border-right: 1px solid @inputColor;
      border-top: 1px solid @inputColor;
      padding-top: 10px;
      ul{
        display: inline-block;
        vertical-align: middle;
        li{
          height: 20px;
          line-height: 20px;
          margin-bottom: 1px;
          color: @whiteColor;
        }
        &:first-child{
          padding-left: 40px;
          margin-right: 10px;
          li{
            width: 12px;
          }
        }
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
//          3: ['N', '', '', '', 'E', '', '','','S','','','','W','','','']
        },
        colors: ['#E92525', '#E96125', '#E99D25', '#D3EC45', '#4CE26C', '#1EEAB3', '#1EBCEA', '#1E66EA', '#1E3BEA', '#5A2EDC'],
        domColors: [],
        echart: {
          width: 0,
          height: 0
        },
        legend: [],
        curDevice: '',//current checkbox value
        curDeviceIndex: '', //index of current checkbox in checklist,
      }
    },
    props: ['id','windSet'],
    mounted() {},
    methods: {
      initData(d){
        this.domColors = JSON.parse(JSON.stringify(this.colors)).reverse()
        if(d && d.data) {
          this.devices = Object.keys(d.data).sort();
          this.checkDevice = this.checkDevice || this.options[0]
          this.deviceChange()
        }
      },
      drawEchart(o){
        let num = this.checkDevice.length;
        let bool = num>4 ? false : true
        let option = {
          title: Object.assign({
            show: num > 1 ? true : false,
            left: 'center',
            top: 'bottom',
            textStyle: {
              color: 'rgba(255,255,255,.7)',
              fontSize: '14'
            }
          }, o.title),
          tooltip: {
            trigger: 'item',
            formatter: params =>{
              return `${params.seriesName}m/s<br>${params.marker}${params.data.itemStyle.value}`
            }
          },
          angleAxis: Object.assign({
            type: 'category',
//            data: num > 25 && this.dir[3] || num > 9 && this.dir[2] || this.dir[1],
            data: this.dir[1],
            // z: 10,
            // startAngle: 102,
            boundaryGap: false,
            // splitNumber: 10,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#034972'
              },
            },
            axisLine: {
              lineStyle: {
                color: '#034972'
              }
            },
            axisTick: {
//              show: num > 16 ? false : true,
              lineStyle: {
                color: '#034972'
              }
            },
            axisLabel: {
              color: 'rgba(255,255,255,.7)',
              interval: 0,
//              interval: num > 36 ? 1 : 0,
//              show: num > 36 ? false : true,
//              margin: num > 16 ? 0 : 8
            }
          }, o.angleAxis || {}),
          radiusAxis: {
            max: 26,
            axisLabel: {
              show: bool,
              color: 'rgba(255,255,255,.7)'
            },
            axisTick: {
              show: bool
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#034972',
              }
            },
            splitArea: {
              show: false,
              areaStyle: {
                color: ['RGBA(248, 249, 253, 0)', 'rgba(3, 73, 114, .7)']
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#034972'
              }
            },
            z: 10
          },
          polar: {
            radius: '70%'
          },
          legend: {
            show: false,
          },
          series: o.series.map((v,k)=>{
            return Object.assign({
              type: 'bar',
              coordinateSystem: 'polar',
              stack: 'a',
              itemStyle:{
                normal:{
                  color: o.colors && o.colors[k] || this.colors[k] || this.colors[o.series.length%this.colors.length-1]
                }
              },
            },v)
          })
        }
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
        this.initChart()
      },
      initChart(){
        let vm = this;
        let winW = document.getElementById("echartsCon").clientWidth-150, winH = document.getElementById("echartsCon").clientHeight, minW = 340, l = this.checkDevice.length;
        let maxCol = Math.floor(winW/minW), maxRow = Math.floor(winH/minW);
        let newW = l > maxCol ? `${(1/maxCol*100)}%` : `${(1/l*100)}%`
        let newH = l > maxCol ? (l/maxCol > maxRow ? `${minW}px` : `${(1/maxRow*100-1)}%`) : '99%'
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
            // series: v[this.windSet.legendName].map((l, i) => {
            //   return {
            //     data: v[this.windSet.seriesName][l].map(m => {
            //       return m.toFixed(2)
            //     }),
            //     name: l,
            //     itemStyle: {
            //       normal: {
            //         color: this.colors[i] || this.colors[i % this.colors.length]
            //       }
            //     }
            //   }
            // })
            series: vm.getseries(v)
          })
        }else {
          this.echart.width = newW
          this.echart.height = newH
          this.checkDevice.forEach((d, k) => {
            let v = this.windSet.data[d];
            if (k == 0) {
              this.legend = v[vm.windSet.legendName]
            }
            this.drawEchart({
              title: {
                text: d
              },
              id: `${this.id}${k}`,
              // series: v[this.windSet.legendName].map((l, i) => {
              //   return {
              //     data: v[this.windSet.seriesName][l].map(m => {
              //       return m.toFixed(2)
              //     }),
              //     name: l,
              //     itemStyle: {
              //       normal: {
              //         color: this.colors[i] || this.colors[i % this.colors.length]
              //       }
              //     }
              //   }
              // })
              series: vm.getseries(v)
            })
          })
        }
        this.$nextTick(()=>{
          this.$refs['echartsGroup'].update()
        })
      },
      colorFilter(value, vlist, colors){
        let arr = JSON.parse(JSON.stringify(vlist))
        arr.indexOf(value)==-1 && arr.push(value)
        arr.sort((a, b)=>{ return b-a})
        let index = arr.indexOf(value);
        return value==0 && 'transparent' ||colors[index-1] || colors[0]
      },
      getseries(d){
        let vm = this;
        return Object.values(d[vm.windSet.seriesName][0])[0].map((w, j) => {
          let arr = []
          d[vm.windSet.seriesName].forEach((v, k) =>{
            let value = Object.values(v)[0][j]
            arr.push({
              value: 1,
              itemStyle: {
                normal: {
                  color: vm.colorFilter(value, d[vm.windSet.legendName], vm.colors),
                  value: value,
                  borderWidth: 0
                },
              }
            })
          })
          return {
            data: arr,
            name: j+1,
            barCategoryGap: 1
          }
        }).slice(0, 25)
      },
      checkAllDevice(v){
        this.checkDevice = v ? this.devices : this.devices.slice(0, 1);
        this.initChart()
      },
      zoomDraw(id, device){
        // this.id = id
        this.checkDevice = [device];
        this.curDevice = device;
        this.initData(this.windSet)
      },
      changeLegend(i){
        if(this.legend[i].checked){
          this.legend[i].checked = false;
          this.checkDevice.forEach((d, k) => {
            echarts.getInstanceByDom(document.getElementById(`${this.id}${k}`)).dispatchAction({
              type: 'legendUnSelect',
              name: this.legend[i].name,
            })
          })
        }else{
          this.legend[i].checked = true;
          this.checkDevice.forEach((d, k) => {
            echarts.getInstanceByDom(document.getElementById(`${this.id}${k}`)).dispatchAction({
              type: 'legendSelect',
              name: this.legend[i].name,
            })
          })
        }
      }
    },
    watch: {
      windSet: function(cur){
        this.initData(cur)
      }
    }

  }
</script>
