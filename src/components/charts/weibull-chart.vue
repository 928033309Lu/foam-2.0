<template>
  <div class="wind-chart" :id="id" :style="{'height':oHeight + 40 +'px'}">
    <div class="chart-header" :style="{'width':oWidth - 10 +'px'}">
      <span>{{title}}</span>
      <div class="header-right">
        详情<i class="iconfont icon-arrow"></i>
      </div>
    </div>
    <div class="tip" v-if="A&&K">
      {{'A=' + this.A.toFixed(2) + ' K='+this.K.toFixed(3)}}
    </div>
    <div class="chart-body" :id="'chart-body'+id">

    </div>
  </div>
</template>

<script>
  export default {
    name: 'weibull-chart',
    props: ['title','id','dataOne','dataTwo','isCollapse','A','K'],
    data() {
      return {
        oWidth:0,
        oHeight:0,
        myChart:null,
        option:{}
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
          if(this.dataOne){
            setTimeout(()=>{
              this.myChart.resize();
            },10)
          }
        },
        deep:true
      },
      dataOne:{
        handler(curVal,oldVal){
          if(curVal){
            this.initChart();
          }
        },
        deep:true
      },
      'isCollapse'(n){
        if(this.dataOne){
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
      initChart(){
        let xdata = [];
        _.map(this.dataOne,(item,index)=>{
          xdata.push(0.5*(index+1));
        })
        this.myChart = echarts.init(document.getElementById('chart-body'+this.id));
        this.option = {
          color:['#1E3BEA','#1E66EA','#1EBCEA','#1EEAB3','#CBE925','#E96125'],
          "tooltip": {
            "show": true,
            "trigger": "axis",
            formatter:function(params){
              let str = params[0].axisValueLabel + '<br>' + '威布尔分布：' + params[0].value + '%' + '<br>' + '风频分布：' + params[1].value + '%';
              return str;
            },
            position: function (point, params, dom, rect, size) {
              // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
              // 提示框位置
              var x = 0; // x坐标位置
              var y = 0; // y坐标位置

              // 当前鼠标位置
              var pointX = point[0];
              var pointY = point[1];

              // 外层div大小
              // var viewWidth = size.viewSize[0];
              // var viewHeight = size.viewSize[1];

              // 提示框大小
              var boxWidth = size.contentSize[0];
              var boxHeight = size.contentSize[1];

              // boxWidth > pointX 说明鼠标左边放不下提示框
              if (boxWidth > pointX) {
                x = 5;
              } else { // 左边放的下
                x = pointX - boxWidth;
              }

              // boxHeight > pointY 说明鼠标上边放不下提示框
              if (boxHeight > pointY) {
                y = 5;
              } else { // 上边放得下
                y = pointY - boxHeight;
              }

              return [x, y];
            }
          },
          "xAxis": {
            "name": "风速(m/s)",
            "type": "category",
            "data": xdata,
            nameLocation:'middle',
            nameGap:'25',
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
          "legend": {
            "padding":3,
            "itemGap":2,
            right:'10',
            top:'10',
            icon: 'roundRect',
            itemWidth: 14,
            itemHeight: 14,
            lineHeight: 14,
            borderWidth: 0,
            padding: 0,
            textStyle: {
              color: 'rgba(255, 255, 255, .7)',
              padding: [2, 0, 0, 0],
              fontSize:10,
            },
            "itemGap":5,
            "data": ["风频分布", "威布尔分布"]
          },
          "yAxis": [{
            "name": "频率(%)",
            "type": "value",
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
          }],
          "grid": {
            'top':'40px',
            'left':'40px',
            "right": "30px",
            "bottom":"50px"
          },
          "series": [{
            "name": "威布尔分布",
            "data": this.dataTwo.map(item=>{
              return item[1];
            }),
            "type": "line",
            "color": "#1B7DE2",
            "smooth": true,
            "symbolSize": 1,
          },{
            "name": "风频分布",
            "data": this.dataOne,
            "type": "bar",
            "color": "#1CD7BC",
            "symbolSize": 1
          }]
        }

        // 使用刚指定的配置项和数据显示图表。
        console.log(this.option)
        this.myChart.setOption(this.option,true);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .wind-chart {
    position:relative;
    .tip{
      height:30px;
      font-size:12px;
      overflow: hidden;
      position:absolute;
      right:30px;
      top:70px;
      z-index:999;
      color:rgba(255,255,255,.7);
    }
  }
</style>
