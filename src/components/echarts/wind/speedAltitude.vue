<template>
    <div :id="id"></div>
</template>
<script>
  import lineEcharts  from '../line.js'
  export default {
    data() {
      return {
        // id:'speedaltitude',
        xd:[], //横坐标机位
        xname:'机位点',
        yIndex0:'风速(m/s)',
        yIndex1:'海拔(m)',
        sdIndex0:[], //第一个y轴
        sdIndex1:[], //第二个y轴
        series:[],
        colors:['#1B7DE2','#1CD7BC'],
        renderData:[],
      }
    },
    components: {},
    props:['windSet','id'],
    mounted() {},
    methods: {
      drawEchart(o){
        let vm=this;
        if(vm.id == 'speedAltitude0'){
          vm.xd = vm.renderData.tower.map(v=>{return v.label}).concat(this.renderData['seats']);  //机位
          vm.sdIndex0 = vm.renderData.tower.map(v=>{return v.windSpeedOfTower}).concat(this.renderData['windSpeed']); //风速
        }else{
          vm.xd = this.renderData['seats'];  //机位
          vm.sdIndex0 = this.renderData['windSpeed'] //风速
        }
        vm.sdIndex1 = this.renderData['h']; //海拔
        vm.series=[{name:'风速', data:vm.sdIndex0, unit: 'm/s',smooth: true,}, {name:'海拔', yAxisIndex: 1, data:vm.sdIndex1,unit: 'm', smooth: true,}];
        let yIndex0Max =Math.ceil(vm.sdIndex0.concat(vm.renderData['tower'].map((v)=>{return v.windSpeedOfTower})).max())
        let yIndex0Min =Math.floor(vm.sdIndex0.concat(vm.renderData['tower'].map((v)=>{return v.windSpeedOfTower})).min())
        let yIndex1Max =Math.ceil(vm.sdIndex1.max())
        let yIndex1Min =Math.floor(vm.sdIndex1.min())
        lineEcharts.initEachrts(Object.assign({
          id:(o && o.id)|| vm.id,
          color:vm.colors,
          xAxis:[{name:vm.xname,data:vm.xd,nameGap:40}],
          dataZoomShow:(o &&o.dataZoomShow)||false,
          dataZoomInsideShow:false,
          yAxis:[{ type: 'value',name:vm.yIndex0, min: yIndex0Min, max: yIndex0Max},{ type: 'value',name:vm.yIndex1, min: yIndex1Min, max: yIndex1Max,splitLine: {show: false}}],
          series:vm.series
        },o))
      },
      zoomDraw(id){
        this.drawEchart({
          id: id,
          dataZoomShow: true,
          dataZoomInsideShow:true,
          grid: {
            bottom: 80
          },
          dataZoomPos: {
            bottom: 30
          },
          legend: {
            bottom: 5
          },
          series: this.series.map((v)=>{
            return Object.assign(v,{
              /*areaStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: this.colors[i] // 0% 处的颜色
                    }, {
                      offset: 1, color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
                    }],
                    globalCoord: false // 缺省为 false
                  }
                }
              }*/
            })
          })
        })
      }

    },
    watch:{
      windSet:function () {
        this.renderData=this.windSet
        this.drawEchart()
      },
      deep: true,
    }
  }

</script>
<style lang='less'>
</style>
