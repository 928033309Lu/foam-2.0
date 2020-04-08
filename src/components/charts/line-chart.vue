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
    <div class="tip" v-if="A&&id==2&&isFull">
      {{'α=' + this.A.toFixed(2)}}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'line-chart',
    props: ['title','id','data','isCollapse','A','isFull'],
    data() {
      return {
        oWidth:0,
        oHeight:0,
        myChart:null,
        option:{},
        months:['1','2','3','4','5','6','7','8','9','10','11','12']
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
          document.querySelector('.chart-body').style.width = this.oWidth - 10 + 'px';
          document.querySelector('.chart-body').style.height = this.oHeight + 'px';
          if(this.data){
            this.$nextTick(()=>{
              this.myChart.resize();
            })
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
            document.querySelector('.chart-body').style.width = this.oWidth - 10 + 'px';
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
      getYName(){
        if(this.id==1){
          return '风速(m/s)'
        }else if(this.id==2){
          return '高度';
        }else if(this.id==3){
          return '湍流强度';
        }
      },
      initChart(){
        let that = this;
        this.myChart = echarts.init(document.getElementById('chart-body'+this.id));
        this.option = {
          color:['#1E3BEA','#1E66EA','#1EBCEA','#1EEAB3','#CBE925','#E96125'],
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
            "name": "风速(m/s)",
            "type": "category",
            nameLocation:'middle',
            nameGap:'25',
            axisLabel: {
              show: true,
              textStyle: {
                color: 'rgba(255,255,255,.7)',
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
            "top":'10',
            "right":'1',
            "orient":'vertical',
            icon: 'roundRect',
            itemWidth: 14,
            itemHeight: 14,
            lineHeight: 14,
            borderWidth: 0,
            padding: 10,
            textStyle: {
              color: 'rgba(255, 255, 255, .7)',
              padding: [2, 0, 0, 0],
              fontSize:10,
            },
          },
          "grid": {
            'top':'40px',
            'left':'40px',
            "right": "80px",
            "bottom":"50px"
          }
        };
        this.option.yAxis = {
          "name": that.getYName(),
          "type": "value",
          axisLabel: {
            show: true,
            textStyle: {
              color: 'rgba(255,255,255,.7)',
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
        }
        if(this.id==1){
          this.option.xAxis.data=that.months;
          this.option.xAxis.name='月份';
        }
        this.option.series = [];
        if(this.id!=2){
          this.data.forEach(item=>{
            this.option.series.push({
              "name": item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian),
              "data": item.data.map(son=>{
                if(_.isArray(son)){
                  return son[1]!='NaN'?[Number(son[0]),Number(son[1]).toFixed(2)]:son;
                }else{
                  return son;
                }
              }),
              "type": "line"
            });
          })
        }else{
          this.option.series.push({
            "name": 'PowerLawFit',
            "data": that.data.powerlawfit.map((item,index)=>{
              return [item[0].toFixed(2),item[1].toFixed(2)]
            }),
            "type": "line",
            "color": "#009fff",
            "symbolSize": 1,
            "smooth": true
          });
          this.option.series.push({
            "symbolSize": 5,
            "name": 'MeasuredData',
            "data": that.data.measureddata,
            "type": "scatter",
            "color": "#FF2E76"
          });
          this.option.xAxis = {
            "name": "风速(m/s)",
            "type": "value",
            nameLocation:'middle',
            nameGap:'25',
            axisLabel: {
              show: true,
              textStyle: {
                color: 'rgba(255,255,255,.7)',
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
            },
            nameTextStyle: {
              color: 'rgba(255, 255, 255, .7)'
            }
          }
          this.option.legend = {
            right:'10',
            icon: 'roundRect',
            itemWidth: 14,
            itemHeight: 14,
            lineHeight: 14,
            borderWidth: 0,
            padding: 10,
            textStyle: {
              color: 'rgba(255, 255, 255, .7)',
              padding: [2, 0, 0, 0],
              fontSize:10,
            },
            // "itemGap":5
          }
        }
          if(!this.isFull && this.id==2){
              this.option.series = [];
          }
        // 使用刚指定的配置项和数据显示图表。
        this.myChart.setOption(this.option,true);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .wind-chart {
    position:relative;
    box-sizing: border-box;
    .tip{
      height:30px;
      font-size:12px;
      overflow: hidden;
      position:absolute;
      right:30px;
      top:60px;
      z-index:999;
      color:#33cde5;
    }
  }
</style>
