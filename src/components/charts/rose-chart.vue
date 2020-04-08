<template>
  <div class="wind-chart" :class="{'active':id==4}" :id="id" :style="{'height':oHeight + 40 +'px'}">
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
        dir:["N","NNW","NW","WNW","W","WSW","SW","SSW","S","SSE","SE","ESE","E","ENE","NE","NNE"]
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
      changeOrder(arr){
        let newArr = [];
        newArr[0] = arr[0];
        let spliceArr = _.takeRight(arr, 15);
        newArr = newArr.concat(spliceArr.reverse());
        return newArr;
      },
      initChart(){
        let that = this;
        this.myChart = echarts.init(document.getElementById('chart-body'+this.id));
        let names = [],seriesData = [],dataArr = [];
        this.data.forEach(item=>{
          names.push(item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian));
          seriesData.push({
            "name": item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian),
            "value": this.changeOrder(item.data)
          })
          _.map(item.data,son=>{
            dataArr.push(son);
          })
        })
        let maxData = 1;
        maxData = Math.max.apply(null, dataArr);
        this.option = {
          color:['#1E3BEA','#1E66EA','#1EBCEA','#1EEAB3','#CBE925','#E96125'],
          "title": {},
          "tooltip": {
            "show": true,
            "trigger": "item",
            formatter:function(params){
              let data = params.data;
              let str = data.name + '<br>';
              data.value.forEach((item,index)=>{
                str += that.dir[index] + ': ' + ((Number(item)*100).toFixed(2) + '%') + '<br>'
              })
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
          "legend": {
            "right": "10",
            "top": "10",
            "orient": "vertical",
            "data": names,
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
            "itemGap":5
          },
          "grid": {
            'top':'50px',
            'left':'10px',
            "right": "80px",
            "bottom":"20px"
          },
          "radar": [{
            "indicator": [{
              "text": "N",
              "max": maxData
            }, {
              "text": "NNW",//NNE
              "max": maxData
            }, {
              "text": "NW",//NE
              "max": maxData
            }, {
              "text": "WNW",//EN
              "max": maxData
            }, {
              "text": "W",//E
              "max": maxData
            }, {
              "text": "WSW",//ESE
              "max": maxData
            }, {
              "text": "SW",//SE
              "max": maxData
            }, {
              "text": "SSW",//SSE
              "max": maxData
            }, {
              "text": "S",//S
              "max": maxData
            }, {
              "text": "SSE",//SSW
              "max": maxData
            }, {
              "text": "SE",//SW
              "max": maxData
            }, {
              "text": "ESE",//WSW
              "max": maxData
            }, {
              "text": "E",//W
              "max": maxData
            }, {
              "text": "ENE",//WNW
              "max": maxData
            }, {
              "text": "NE",//NW
              "max": maxData
            }, {
              "text": "NNE",//NNW
              "max": maxData
            }],
            "splitArea": {
              "show": true,
              "areaStyle": {
                "color": ["rgba(3,73,114,0)", "rgba(3,73,114,.5)"]
              }
            },
            "splitLine": {
              "show": true,
              "lineStyle": {
                "color": "rgba(3,73,114,.4)",
                "type": "solid"
              }
            },
            "axisLine": {
              "show": true,
              "lineStyle": {
                "color": "rgba(3,73,114,1)",
                "type": "solid"
              }
            },
            "center": ["43%", "50%"],
            "radius": "70%",
            "shape": "circle",
            "name": {
              "textStyle": {
                "color": "rgba(255,255,255,.7)"
              }
            },
            "nameGap": 10,
          }],
          "series": [{
            "type": "radar",
            "symbolSize": 0,
            "data": seriesData
          }]
        }
        // 使用刚指定的配置项和数据显示图表。
        console.log(this.option,'rodar')
        this.myChart.setOption(this.option,true);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .wind-chart {
    &.active{
      overflow: visible;
    }
  }
</style>
