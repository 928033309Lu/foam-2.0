<template>
  <div id="polar">
    <span style="position: absolute;right:11px;bottom:150px;font-size:12px; color: rgba(255,255,255,.7)">风速(m/s)</span>
    <div :id="id" class="polar"></div>
  </div>
</template>
<script>
  import echarts from 'echarts'
  export default {
    data() {
      return {
        curDevice: '',
        myChart:null,

      }
    },
    props: ['id','windSet'],
    mounted() {
      this.myChart = echarts.init(document.getElementById(this.id));
      // this.init(this.windSet.data)
    },
    methods: {
      initData(arr){
        this.option={
          title:{
            // text:'风玫瑰图',
            left:'center'
          },
          color: ['#0022F4','#007EFF','#1BC4E2','#3BF5BE','#C3EC34','#EC7F1F'],
          angleAxis: {
            type: 'category',
            data: this.windSet.direction,
            axisLabel: {
              interval: 0,
              color: 'rgba(255,255,255,.7)'
            },
            z: 0,
            boundaryGap: false,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#034972',
                type: 'solid'
              }
            },
            axisLine: {
              show: false
            }
          },
          tooltip: {
            show: true,
            backgroundColor: 'rgba(3, 73, 114, .85)',
            trigger: 'item'
          },
          radiusAxis: {
            splitLine: {
              lineStyle: {
                color: '#034972'
              }
            },
            splitArea: {
              show: true,
              areaStyle: {
                color: ['RGBA(248, 249, 253, 0)', 'rgba(3, 73, 114, .7)']
              }
            },
            axisLabel: {
              color: 'rgba(255,255,255,.7)',
              formatter: '{value}%',
              z: 100
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#034972'
              }
            }
          },
          polar: {

          },
          series: [],
          legend: {
            show: true,
            bottom: 20,
            right: 10,
            orient: 'vertical',
            itemWidth: 18,
            itemHeight: 10,
            textStyle: {
              color: 'rgba(255,255,255,.7)'
            },
            borderRadius: 0
          }}
        for(var i =0 ; i<arr.length;i++){
          var obj={
            type: 'bar',
            data:arr[i],
            coordinateSystem: 'polar',
            name: this.windSet.da[i],
            stack: 'a',
          };
          this.option.series.push(obj)
        }
      },
      init(arr){
        if(arr.length === 0){
          return;
        }
        this.initData(arr);
        if (!this.myChart) {
          this.myChart = echarts.init(document.getElementById(this.id));
        }
        this.myChart.setOption(this.option,true);
      }
    },
    watch: {
      windSet:{
        handler(curVal){
          curVal && curVal.data && this.init(curVal.data)
        },
        deep:true
      }
    }

  }
</script>
<style lang="less">
  #polar{
    /*height:100%;*/
    position:relative;
    .polar{
      height:100%;
      
    }
  }

</style>
