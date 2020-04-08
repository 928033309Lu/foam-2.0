<template>
  <div class="radar">
    <el-select class="device-select" v-model="curDevice" size="small" @change="deviceChange" placeholder="请选择">
      <el-option
        v-for="item in options"
        :key="item"
        :label="item"
        :value="item">
      </el-option>
    </el-select>
    <!--<my-swipe ref="myLegend" :legend="legend" name="radar" v-on:legendChange="legendChange"></my-swipe>-->
    <div v-if="legend.length>0" class="my-legend">
      <div class="title">风速 {{legend[windSpeed-1]}}m/s</div>
      <el-slider v-model="windSpeed" :min="legend[0]" :max="25" @change="legendChange"  :format-tooltip="formatTooltip"></el-slider>
    </div>
    <div :id="id" class="radar-echart"></div>
  </div>
</template>
<script>
  import echarts from 'echarts'
  import polarEcharts from "./polar"
  export default {
    data() {
      return {
        curDevice: '',
        options: [],
        legend: [],
        windSpeed: 15,
        turbuMaxWind10: [] //风速为10的湍流最大值
      }
    },
    components: {},
    props: ['id','windSet'],
    mounted() {

    },
    methods: {
      initData(d){
        if(d && d.data){
          this.options = Object.keys(d.data).sort();
          this.curDevice = this.curDevice || this.options[0]
          this.deviceChange(this.curDevice)
          this.$nextTick(()=>{
            this.windSpeed = 15
            this.legendChange(this.windSpeed)
          })
        }
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
      },
      deviceChange(v){
        let vm = this;
        let d = this.windSet.data[v];
        this.legend = d[this.windSet.seriesName].map(v=>{
          return Number(v.name)
        })
        vm.turbuMaxWind10 = vm.arrMaxFill(d[this.windSet.seriesName][9].value)
        //当前风速的湍流最大值
        let maxfill = vm.arrMaxFill(vm.windSet.data[vm.curDevice][vm.windSet.seriesName].filter(v=>{return v.name == vm.windSpeed})[0].value);
        let option = polarEcharts.setRadarOption({
          // 防止出现10m/s时候湍流值小于当前风速对应实际值中的最大值 取最大值
          radar: vm.windSpeed>9 && vm.turbuMaxWind10.map((v,k)=>{
            return v>maxfill[k] && v || maxfill[k]
          }) || vm.arrMaxFill(d[this.windSet.indicator]),
          series: {
            data: d[this.windSet.seriesName].map(series=>{
              return {
                name: series.name,
                value: vm.clockData(series.value)
              }
            })
          },
          legend: {
            show: false,
            selectedMode: 'single'
          }
        })
        let myChart = echarts.init(document.getElementById(this.id))
        myChart.setOption(option);
      },
      zoomDraw(id, device){
        this.id = id
        this.curDevice = device;
        this.initData(this.windSet)
      },
      legendChange(legend){
        let vm = this, maxfill = vm.arrMaxFill(vm.windSet.data[vm.curDevice][vm.windSet.seriesName].filter(v=>{return v.name == legend})[0].value);
        let dom = echarts.getInstanceByDom(document.getElementById(`${this.id}`))
        dom.dispatchAction({
          type: 'legendSelect',
          name: legend,
        })
        //设置风速>=10m/s时，雷达图的最大值为默认最大值；风速<10时，雷达图的最大值取10m/s时候的湍流值
        if(legend>9){
          dom.setOption({
            radar: Object.assign(dom.getOption().radar[0], {
              indicator: polarEcharts.setRadarIndicator(vm.turbuMaxWind10.map((v,k)=>{
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
      },
      formatTooltip(val){
        return `${this.legend[val-1]} m/s`
      }
    },
    watch: {
      windSet: function(cur){
        this.initData(cur)
      }
    }

  }
</script>
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
    }
    &.radar{
      position: relative;
      .my-legend{
        display: flex;
        position: absolute;
        left: 2px;
        bottom: 2px;
        padding-right: 20px;
        width: 100%;
        z-index: 1;
        color: @whiteColor;
        .title{
          padding: 9px;
          padding-right: 20px;
        }
        .el-slider{
          flex: 1;
          .el-slider__bar{
            background-color: #1b7de2;
          }
          .el-slider__button{
            border-color: #1b7de2;
          }
        }
      }
      .el-slider__runway{
        background-color: #024065;
      }
    }
  }

</style>
