<template>
  <div class="scatter-chart" :id="id">

  </div>
</template>

<script>
  export default {
    name: 'scatter-chart',
    props: ['title', 'data', 'lineIntercept', 'lineSlope', 'id', 'isCollapse'],
    data() {
      return {
        oWidth: 0,
        oHeight: 0,
        myChart: null
      }
    },
    computed: {
      screenWidth() {
        return this.$store.state.screenWidth;
      }
    },
    watch: {
      screenWidth: {
        handler(curVal, oldVal) {
          this.oWidth = document.getElementById(this.id).offsetWidth;
          this.oHeight = this.oWidth * 0.7;
          document.querySelector('.scatter-chart').style.width = this.oWidth + 'px';
          document.querySelector('.scatter-chart').style.height = this.oHeight + 'px';
          if (this.data) {
            setTimeout(() => {
              this.myChart.resize();
            }, 10)
          }
        },
        deep: true
      },
      data: {
        handler(curVal, oldVal) {
          if (curVal)
            this.initChart();
        },
        deep: true
      },
      'isCollapse'(n) {
        if (this.data) {
          setTimeout(() => {
            this.oWidth = document.getElementById(this.id).offsetWidth;
            this.oHeight = this.oWidth * 0.7;
            document.querySelector('.scatter-chart').style.width = this.oWidth + 'px';
            document.querySelector('.scatter-chart').style.height = this.oHeight + 'px';
            setTimeout(() => {
              this.myChart.resize();
            }, 10)
          }, 110)
        }
      }
    },
    mounted() {
      this.oWidth = document.getElementById(this.id).offsetWidth;
      this.oHeight = this.oWidth * 0.7;
    },
    methods: {
      initChart() {
        this.oWidth = document.getElementById(this.id).offsetWidth;
        this.oHeight = this.oWidth * 0.7;
        document.getElementById(this.id).style.height = this.oHeight + "px";
        this.myChart = echarts.init(document.getElementById(this.id));
        let xArr = [], yArr = [], yMin = 0, yMax = 20, xMin = 0, xMax = 20;
        _.map(this.data, item => {
          xArr.push(item[0]);
          yArr.push(item[1]);
        })
        xMin = Math.floor(Math.min.apply(null, xArr));
        xMax = Math.ceil(Math.max.apply(null, xArr)) + 2;
        yMin = Math.floor(Math.min.apply(null, yArr));
        yMax = Math.ceil(Math.max.apply(null, yArr)) + 2;
        let yBottom = this.lineSlope * xMin + (this.lineIntercept ? this.lineIntercept : 0);
        let yTop = this.lineSlope * xMax + (this.lineIntercept ? this.lineIntercept : 0);
        let markLineOpt = {
          animation: false,
          lineStyle: {
            normal: {
              type: 'solid'
            }
          },
          data: [[{
            coord: [xMin, yBottom],
            symbol: 'none'
          }, {
            coord: [xMax, yTop],
            symbol: 'none'
          }]]
        };
        if (this.lineSlope) {
          markLineOpt.label = {
            normal: {
              formatter: 'y = ' + this.lineSlope.toFixed(2) + ' * x ' + (this.lineIntercept ? (this.lineIntercept >= 0 ? ('+' + this.lineIntercept.toFixed(2)) : this.lineIntercept.toFixed(2)) : ''),
              textStyle: {
                align: 'right'
              }
            }
          }
          markLineOpt.tooltip = {
            formatter: 'y = ' + this.lineSlope.toFixed(2) + ' * x ' + (this.lineIntercept ? (this.lineIntercept >= 0 ? ('+' + this.lineIntercept.toFixed(2)) : this.lineIntercept.toFixed(2)) : '')
          }
        }
        this.option = {
          title: {},
          grid: {
            top: '20'
          },
          tooltip: {
            //show:false
            formatter: '{c}'
          },
          xAxis: [
            {
              gridIndex: 0, min: xMin, max: xMax, axisLabel: {
                show: true,
                textStyle: {
                  color: '#fff',
                  fontSize: '12'
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
              axisLine: {
                lineStyle: {
                  color: '#fff',
                  width: 1,   //这里是坐标轴的宽度,可以去掉
                }
              }
            }
          ],
          yAxis: [
            {
              gridIndex: 0, min: yMin, max: yMax < yTop ? yTop : yMax, axisLabel: {
                show: true,
                textStyle: {
                  color: '#fff',
                  fontSize: '12'
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
              axisLine: {
                lineStyle: {
                  color: '#fff',
                  width: 1,   //这里是坐标轴的宽度,可以去掉
                }
              }
            }
          ],
          series: [
            {
              name: '',
              type: 'scatter',
              xAxisIndex: 0,
              yAxisIndex: 0,
              data: this.data,
              markLine: this.data.length > 0 ? markLineOpt : {}
            }
          ]
        };
        //console.log(this.option)
        // 使用刚指定的配置项和数据显示图表。
        this.myChart.setOption(this.option, true);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
  .scatter-chart {
    width: 100%;
  }
</style>
