<template>
  <div>
    <el-select class="device-select" v-model="curDevice" size="small" @change="deviceChange" placeholder="请选择">
      <el-option
        v-for="item in options"
        :key="item"
        :label="item"
        :value="item">
      </el-option>
    </el-select>
    <div :id="id" class="polar-echart need-legend"></div>
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
  .echarts,
  .echarts-full{
    position: relative;
    .device-select{
      position: absolute;
      left: 10px;
      top: 10px;
      width: 100px;
      z-index: 1;
      .el-input__inner{
        background-color: transparent;
        border: none;
      }
    }
  }
</style>
<style lang="less" scoped>
  .my-legend{
    position: absolute;
    right: 14px;
    bottom: 14px;
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
        /*padding-top: 10px;*/
        margin-right: 10px;
        li{
          width: 12px;
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
        curDevice: '',
        options: [],
        colors: ['#E92525', '#E96125', '#E99D25', '#D3EC45', '#4CE26C', '#1EEAB3', '#1EBCEA', '#1E66EA', '#1E3BEA', '#5A2EDC'],
        legend: [],
        domColors: []
      }
    },
    props: ['id','windSet'],
    mounted() {},
    methods: {
      initData(d){
        this.domColors = JSON.parse(JSON.stringify(this.colors)).reverse()
        if(d && d.data){
          this.options = Object.keys(d.data).sort();
          this.curDevice = this.curDevice || this.options[0]
          this.deviceChange(this.curDevice)
        }
      },
      deviceChange(v){
        let vm = this;
        let d = this.windSet.data[v];
        d[this.windSet.legendName] && (this.legend = d[this.windSet.legendName].sort((a, b) => { return a-b}))
        polarEcharts.initEachrts({
          id: this.id,
          colors: vm.colors,
          tooltip: {
            formatter: params =>{
              return `${params.seriesName}m/s<br>${params.marker}${params.data.itemStyle.value}`
            }
          },
          angleAxis: {
            // startAngle: 102,
            // boundaryGap: true,
            axisLine: {
              lineStyle: {
                color: '#034972'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#034972',
                type: 'solid'
              }
            },
            // z: 10,
          },
          radiusAxis: {
            max: 26,
            splitArea: {
              show: false
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#034972'
              }
            },
            splitLine: {
              show: false
            },
            z: 10
          },
          series: Object.values(d[vm.windSet.seriesName][0])[0].map((w, j) => {
            let arr = []
            d[vm.windSet.seriesName].forEach((v, k) =>{
              let value = Object.values(v)[0][j]
              arr.push({
                value: 1,
                itemStyle: {
                  normal: {
                    color: vm.colorFilter(value, d[vm.windSet.legendName], vm.colors),
                    value: value,
                    borderWidth: 1,
                    borderColor: vm.colorFilter(value, d[vm.windSet.legendName], vm.colors)
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
        })
      },
      colorFilter(value, vlist, colors){
        let arr = JSON.parse(JSON.stringify(vlist))
        arr.indexOf(value)==-1 && arr.push(value)
        arr.sort((a, b)=>{ return b-a})
        let index = arr.indexOf(value);
        return value==0 && 'transparent'||colors[index-1] || colors[0]
      },
      zoomDraw(id, device){
        this.id = id
        this.curDevice = device;
        this.initData(this.windSet)
      }
    },
    watch: {
      windSet: function(cur){
        this.initData(cur)
      }
    }

  }
</script>
