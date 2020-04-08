<template>
  <div class="ewt-chart" id="ewt-chart">

  </div>
</template>

<script>
  import davenportK from '../../../static/json/davenport_k.json'
  import davenportVrefVave from '../../../static/json/davenport_vref_vave.json'
  import exactK from '../../../static/json/exact_k.json'
  import exactVrefVave from '../../../static/json/exact_vref_vave.json'
  import gumelK from '../../../static/json/gumel_k.json'
  import gumelVrefVave from '../../../static/json/gumel_vref_vave.json'
  export default {
    name: 'ewt-chart',
    props: ['title','data','isCollapse'],
    data() {
      return {
        oWidth:0,
        oHeight:0,
        myChart:null,
        option:{},
        davenport:[],
        exact:[],
        gumbel:[]
      }
    },
    computed:{
      screenWidth(){
        return this.$store.state.screenWidth;
      }
    },
    watch: {
      screenWidth: {
        handler(curVal, oldVal) {
          this.oWidth = document.getElementById('ewt-chart').offsetWidth;
          this.oHeight = this.oWidth * 0.7;
          document.querySelector('.ewt-chart').style.width = this.oWidth + 'px';
          document.querySelector('.ewt-chart').style.height = this.oHeight + 'px';
          if (this.data){
            setTimeout(()=>{
              this.myChart.resize();
            },10)
          }
        },
        deep: true
      },
      data: {
        handler(curVal, oldVal) {
          if (curVal) {
            this.initChart();
          }
        },
        deep: true
      },
      'isCollapse'(n){
        if(this.data){
          setTimeout(()=>{

            this.oWidth = document.getElementById('ewt-chart').offsetWidth;
            this.oHeight = this.oWidth * 0.7;
            document.querySelector('.ewt-chart').style.width = this.oWidth + 'px';
            document.querySelector('.ewt-chart').style.height = this.oHeight + 'px';
            setTimeout(()=>{
              this.myChart.resize();
            },10)
          },110)
        }
      }
    },
    mounted(){
      this.oWidth = document.getElementById('ewt-chart').offsetWidth;
      this.oHeight = this.oWidth*0.7;
    },
    methods: {
      initChart(){
        this.davenport = [];
        this.exact = [];
        this.gumbel = [];
        this.oWidth = document.getElementById('ewt-chart').offsetWidth;
        this.oHeight = this.oWidth*0.7;
        document.getElementById('ewt-chart').style.height = this.oHeight + "px";
        _.map(davenportVrefVave.Y,(item,index)=>{
          this.davenport.push([davenportK.X[index],item]);
        })
        _.map(exactVrefVave.Y,(item,index)=>{
          this.exact.push([exactK.X[index],item]);
        })
        _.map(gumelVrefVave.Y,(item,index)=>{
          this.gumbel.push([gumelK.X[index],item]);
        })
        this.myChart = echarts.init(document.getElementById('ewt-chart'));
        this.option = {
          "tooltip": {
            "show": true,
            "trigger": "axis",
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
            "name": "Weibull k",
            "type": "value",
            nameLocation:'middle',
            nameGap:'20',
            //type: 'category',
            max : 2.5,
            min : 1,
            splitNumber : 3,
            axisLabel: {
              show: true,
              textStyle: {
                color: '#fff',
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
            // x轴的颜色和宽度
            axisLine:{
              lineStyle:{
                color:'#fff',
                width:1,   //这里是坐标轴的宽度,可以去掉
              }
            }
          },
          "legend": {
            "top":'2',
            "right":'1',
            "orient":'vertical',
            textStyle:{
              fontSize:10,
              color:'rgba(255,255,255,.7)'
            }
          },
          "grid": {
            'top':'40px',
            'left':'30px',
            "right": "100px",
            "bottom":"40px"
          }
        };
        this.option.yAxis = {
          "name": 'Vref Vave',
          "type": "value",
          max : 14,
          min : 2,
          splitNumber : 7,
          axisLabel: {
            show: true,
            textStyle: {
              color: '#fff',
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
          // x轴的颜色和宽度
          axisLine:{
            lineStyle:{
              color:'#fff',
              width:1,   //这里是坐标轴的宽度,可以去掉
            }
          }
        }
        this.option.series = [];
        this.option.series.push({
          "name": 'Exact',
          "data": this.exact,
          "type": "line",
          symbol: "none",
          markLine:{
            symbol:'none',
            data:[{
              xAxis: this.data
            }],
            lineStyle:{
              type:'solid',
              color:'red'
            }
          }
        });
        this.option.series.push({
          "name": 'Gumbel',
          "data": this.gumbel,
          "type": "line",
          symbol: "none",
          markLine:{
            symbol:'none',
            data:[{
              xAxis: this.data
            }],
            lineStyle:{
              type:'solid',
              color:'red'
            }
          }
        });
        this.option.series.push({
          "name": 'Davenport',
          "data": this.davenport,
          "type": "line",
          symbol: "none",
          markLine:{
            symbol:'none',
            data:[{
              xAxis: this.data
            }],
            lineStyle:{
              type:'solid',
              color:'red'
            }
          }
        });
        // 使用刚指定的配置项和数据显示图表。
        this.myChart.setOption(this.option,true);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .ewt-chart {
    width:100%;
  }
</style>
