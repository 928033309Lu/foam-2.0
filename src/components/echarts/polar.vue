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
<script>
  import echarts from 'echarts'
  import polarEcharts from "./polar"
  export default {
    data() {
      return {
        curDevice: '',
        options: [],
      }
    },
    props: ['id','windSet'],
    mounted() {},
    methods: {
      initData(d){
        if(d && d.data){
          this.options = Object.keys(d.data).sort();
          this.curDevice = this.curDevice || this.options[0]
          this.deviceChange(this.curDevice)
        }
      },
      deviceChange(v){
        let d = this.windSet.data[v];
        polarEcharts.initEachrts({
          id: this.id,
//          angleAxis: {
//            data: d.dir
//          },
          series: d[this.windSet.legendName].map((k)=>{
            return {
              data: d[this.windSet.seriesName][k].map(m=>{
                return (m*100).toFixed(2)
              }),
              name: k+'m/s',
            }
          }),
          radiusAxis: {
            axisLabel: {
              color: 'rgba(255,255,255,.7)',
              formatter: '{value}%'
            },
          }
        })
        setTimeout(function () {
          // $('.polar-echart.need-legend').find('.legendTitle').remove()
          // $('.polar-echart.need-legend').append('<span class="legendTitle" style="position: absolute;right:20px;bottom:150px;font-size:12px">风速(m/s)<span>')
        },10)
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
