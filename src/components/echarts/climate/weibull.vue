<template>
  <div :id="id" class="line"></div>
</template>
<script>
  import echarts from 'echarts'
  import lineEcharts from "@/components/echarts/line.js"
  export default {
    data() {
      return {
        myChart:null,
        option :{
          xAxis: {
            name:this.windSet.xName,
            type: 'category',
            data: this.windSet.xData,
          },
          yAxis:[ {
            name:this.windSet.yName,
            type: 'value'
          },
            {
              name:this.windSet.yName1,
              type: 'value'
            },
          ],
          series: [],
        }
      }
    },
    props: {
      id:{
        default:'',
      },
      windSet:{
        default:{
          yData:[]
        },
      }
    },
    mounted() {
      // this.init(this.windSet.yData)
    },
    methods: {
      initData(arr){
        let series = arr.length && arr.map((v,i) => {
          let obj = {
            name: v.name,
            data: v.yda,
            type: i===1 ? 'line' : 'bar',
            
          }
          if(i===0){
            obj.barWidth = 10
            obj.barGap = 5
          }else{
            obj.smooth = true
            obj.symbol = 'emptyCircle',
              obj.itemStyle =  {
              color: '#1CD7BC',
              borderColor: '#1CD7BC'
            }
          }
          return obj
        })
        this.option={
          id: this.id,
          color: ['#1B7DE2', '#1CD7BC'],
          xAxis: [{
            name:this.windSet.xName,
            data: this.windSet.xData,
            markline: {}
          }],
          yAxis:[{
            name:this.windSet.yName,
            type: 'value'
          }],
          grid: {
            right: '80px',
          },
          series: series,
        };
        lineEcharts.initEachrts(this.option)
      },
      init(arr){
        this.initData(arr);
      }
    },
    watch: {
      windSet:{
        handler(curVal, oldVal) {
          // console.log(curVal)
          curVal.yData && curVal.yData.length && this.init(curVal.yData)
        },
        deep:true
      }
    }

  }
</script>
<style lang="less">
  #line1{
    height:100%;
    .line{
      height:100%;
    }
  }

</style>
