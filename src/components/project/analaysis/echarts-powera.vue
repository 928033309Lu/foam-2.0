<template>
  <div :id="id"></div>
</template>
<script>
  import lineEcharts from "./line"
  export default {
    data() {
      return {
        xd:[],
        sd:[]
      }
    },
    components: {},
    props: ['id','dataset'],
    mounted() {},
    methods: {
      drawEchart(o){
        lineEcharts.initEachrts(Object.assign({
          id: this.id,
        },o))
      },
      zoomDraw(id){
        let vm = this;
        this.drawEchart(Object.assign(this.dataset, {
          id: id,
          dataZoomShow: true,
          dataZoomInsideShow:true,
          grid: {
            bottom: 80
          },
          legend: {
            bottom: 5
          },
          dataZoomPos: {
            bottom: 30
          },
          series: vm.dataset.series.map((v, i)=>{
            return Object.assign(v,{
              areaStyle: {
                normal: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0, color: vm.dataset.color[i] // 0% 处的颜色
                    }, {
                      offset: 1, color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
                    }],
                    globalCoord: false // 缺省为 false
                  }
                }
              }
            })
          })
        }))
      }
    },
    watch: {
      dataset: function(cur){
        this.drawEchart(cur)
      }
    }
  }

</script>
<style lang='less'>
</style>
