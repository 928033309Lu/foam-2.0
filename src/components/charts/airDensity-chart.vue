<template>
  <div class="wind-chart" :id="id" :style="{'height':oHeight + 40 +'px'}">
    <div class="chart-header" :style="{'width':oWidth - 10 +'px'}">
      <span>{{title}}</span>
      <div class="header-right">
        详情<i class="iconfont icon-arrow"></i>
      </div>
    </div>
    <div class="chart-body" :id="'chart-body'+id">

    </div>
  </div>
</template>

<script>
  export default {
    name: 'line-chart',
    props: ['title','id','data','isCollapse'],
    data() {
      return {
        oWidth:0,
        oHeight:0,
        myChart:null,
        option:{},
      }
    },
    computed:{
      screenWidth(){
        return this.$store.state.screenWidth;
      }
    },
    watch:{
      screenWidth:{
        handler(curVal,oldVal){
          this.oWidth = document.getElementById(this.id).offsetWidth;
          this.oHeight = this.oWidth*0.7;
          document.querySelector('.chart-body').style.width = this.oWidth + 'px';
          document.querySelector('.chart-body').style.height = this.oHeight + 'px';
          if(this.data){
            setTimeout(()=>{
              this.myChart.resize();
            },10)
          }
        },
        deep:true
      },
      data:{
        handler(curVal,oldVal){
          if(curVal){
            this.initChart();
          }
        },
        deep:true
      },
      'isCollapse'(n){
        if(this.data){
          setTimeout(()=>{
            this.oWidth = document.getElementById(this.id).offsetWidth;
            this.oHeight = this.oWidth*0.7;
            document.querySelector('.chart-body').style.width = this.oWidth + 'px';
            document.querySelector('.chart-body').style.height = this.oHeight + 'px';
            setTimeout(()=>{
              this.myChart.resize();
            },10)
          },110)
        }
      }
    },
    mounted(){
      this.oWidth = document.getElementById(this.id).offsetWidth;
      this.oHeight = this.oWidth*0.7;
    },
    methods: {
      setData(data){
        let arr = [];
        _.map(data,item=>{
          arr.push((item&&item!='NaN')?item.toFixed(2):0);
        })
        return arr;
      },
      initChart(){
        this.myChart = echarts.init(document.getElementById('chart-body'+this.id));
        this.option = {
          "tooltip": {
            "show": true,
            "trigger": "axis"
          },
          xAxis: {
            name: "月份",
            type: 'category',
            data: this.data.months,
            nameLocation:'middle',
            nameGap:'25',
            axisLabel: {
              show: true,
              textStyle: {
                color: 'rgba(255, 255, 255, .7)',
                fontSize:'12'
              }
            },
            nameTextStyle: {
              color: 'rgba(255, 255, 255, .7)'
            },
            // 控制网格线是否显示
            splitLine: {
              show: true,
              //  改变轴线颜色
              lineStyle: {
                // 使用深浅的间隔色
                color: 'rgba(3,73,114,1)'
              }
            },
            // x轴的颜色和宽度
            axisLine:{
              lineStyle:{
                color:'rgba(3,73,114,1)',
                width:1,   //这里是坐标轴的宽度,可以去掉
              }
            }
          },
          yAxis: {
            name:'密度(kg/m³)',
            type: 'value',
            axisLabel: {
              show: true,
              textStyle: {
                color: 'rgba(255, 255, 255, .7)',
                fontSize:'12'
              }
            },
            // 控制网格线是否显示
            splitLine: {
              show: true,
              //  改变轴线颜色
              lineStyle: {
                // 使用深浅的间隔色
                color: 'rgba(3,73,114,1)'
              }
            },
            nameTextStyle: {
              color: 'rgba(255, 255, 255, .7)'
            },
            // x轴的颜色和宽度
            axisLine:{
              lineStyle:{
                color:'rgba(3,73,114,1)',
                width:1,   //这里是坐标轴的宽度,可以去掉
              }
            }
          },
          "grid": {
            'top':'40px',
            'left':'45px',
            "right": "15px",
            "bottom":"50px"
          },
          series: [{
            data: this.setData(this.data.data),
            type: 'bar',
            barWidth:"50%",
            itemStyle : {
              normal : {
                // label: {
                //   show: true,
                //   position: 'top',
                //   textStyle: {
                //     color: '#000',
                //     fontSize:'8px'
                //   }
                // },
                color:'#33CDE5'
              },
            }
          }]
        };

        // 使用刚指定的配置项和数据显示图表。
        this.myChart.setOption(this.option,true);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .wind-chart {

  }
</style>
