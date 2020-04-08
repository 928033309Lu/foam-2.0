<template>
  <div class="windOfEcharts">
    <div :id="id" class="windBar"></div>
    <div class="pre_next-btn" v-if="!isEnlarge && sd.length > onceShowWts">
      <el-button :class="zoomStart!=0?'active':''" class="btn_pre el-icon-arrow-left" :disabled="zoomStart==0"
                 @click="preClick"></el-button>
      <el-button :class="zoomEnd!=100?'active':''" class="btn_next el-icon-arrow-right" :disabled="zoomEnd==100"
                 @click="nextClick"></el-button>
    </div>
    <div class="my-legend">
      <ul>
        <li v-for="(item,i) in legend" :key="i" @click="changeLegend(i)"
            :class="item.checked ? 'checked' : 'no-checked'">
          <i class="round-rect" :style="'background-color:'+colors[i]"></i>{{i==legend.length-1 && '>' || '<'}} {{item.label}}
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  import lineEcharts from '../line.js'
  import echarts from 'echarts'

  export default {
    data() {
      return {
        xd: [], //横坐标机位
        xname: '> 机位点',
        yname: '风速(m/s)',
        sd: [], //series
        md: [], //markline 测风塔
        colors: ['#0022F4', '#1B7DE2', '#1BC4E2', '#1BE2CD', '#3BF5BE', '#1BE261', '#43EF4F', '#C3EC34', '#E5EC34', '#EC7F1F', '#ec4c1a', '#0022F4', '#1B7DE2', '#1BC4E2', '#1BE2CD', '#3BF5BE', '#1BE261', '#43EF4F', '#C3EC34', '#E5EC34', '#EC7F1F', '#ec4c1a','#0022F4', '#1B7DE2', '#1BC4E2', '#1BE2CD', '#3BF5BE', '#1BE261', '#43EF4F', '#C3EC34', '#E5EC34', '#EC7F1F', '#ec4c1a'],
        legend: [],
        isEnlarge: false,
        zoomStart: 0,
        zoomEnd: 40,
        onceShowWts: 6
      }
    },
    props: ['windSet', 'id'],
    components: {},
    mounted() {
    },
    methods: {
      initLengend() {
        let vm = this;
        let md = vm.windSet['tower'];
        let lengendArr = md.sort(function (a, b) {
          return a.windSpeedOfTower - b.windSpeedOfTower
        });
        lengendArr.map((v => {
          return Object.assign(v, {checked: true})
        }));
        vm.legend = lengendArr.concat(JSON.parse(JSON.stringify(lengendArr)).slice(-1))
      },
      drawEchart(o) {
        let vm = this;
        let colors = vm.colors;
        let markColors = ['#1B7DE2', '#1B9EE2', '#1bc4e2', '#1be2cd', '#3bf5be', '#15b94f', '#27cd32', '#9cc11c', '#c1c815', '#d67016'];
        vm.xd = vm.windSet['seats'].concat([]);
        vm.sd = vm.windSet['windSpeed'].concat([]);
        vm.md = vm.windSet['tower'].concat([]);
        let mdArr = vm.md.map((v => {
          return Number(v.windSpeedOfTower)
        })).sort(function (a, b) {
          return b - a
        });
        let lengendArr = vm.md.sort(function (a, b) {
          return a.windSpeedOfTower - b.windSpeedOfTower
        });
        let yMax = Math.ceil(Math.max(mdArr.max(), vm.sd.max()))
        let yMin = Math.floor(Math.min(mdArr.min(), vm.sd.min()))
        //只算false
        let splitlengendArr = [];
        for (let s = 0, len = vm.legend.length; s < len; s++) {
          if (!vm.legend[s].checked) {
            splitlengendArr.push(Object.assign(vm.legend[s], {index: s}))
            if(s == len-1) {
              splitlengendArr[splitlengendArr.length-1].isLast = true
            }
          }
        }
        if (splitlengendArr.length != 0) {
          for (let i = 0, len = splitlengendArr.length; i < len; i++) {
            for (let k = 0, kdlen = vm.sd.length; k < kdlen; k++) {
              if (splitlengendArr[i].index != 0) {
                if(splitlengendArr[i].isLast){
                  if(vm.sd[k] > splitlengendArr[i].windSpeedOfTower){
                    vm.sd.splice(k, 1);
                    vm.xd.splice(k, 1);
                    k--;
                  }
                }else {
                  if (vm.sd[k] < splitlengendArr[i].windSpeedOfTower && vm.sd[k] > vm.legend[splitlengendArr[i].index - 1].windSpeedOfTower) {
                    vm.sd.splice(k, 1);
                    vm.xd.splice(k, 1);
                    k--;
                  }
                }
              } else {
                if (vm.sd[k] < splitlengendArr[i].windSpeedOfTower) {
                  vm.sd.splice(k, 1)
                  vm.xd.splice(k, 1)
                  k--;
                }
              }
            }
          }
        }
        let markLineData = vm.md.map((v, index) => {
          return {
            name: v.label,
            yAxis: v.windSpeedOfTower,
            label: {
              show: true, formatter: function (item) {
                return item.name
              }
            },
            lineStyle: {color: markColors[index], type: 'dashed'}
          }
        })
        let markLine = {symbol: ['none', 'none'], data: markLineData}
        let series = [];
        let markData = lengendArr.map((v) => {
          return Number(((v.windSpeedOfTower * 100000 - yMin * 100000) / 100000).toFixed(2))
        })
        let seriesObj = {
          name: '风速',
          type: "bar",
          barWidth: 16,
          data: vm.sd,
          itemStyle: {normal: {
            color: colorSelect,
            borderColor: 'transparent'}},
          markLine: markLine
        }
        series.push(seriesObj)

        function colorSelect(item) {
          let dataItemValue = Number(((item.value * 100000 - yMin * 100000) / 100000).toFixed(2))

          let colorArr = [{offset: 0, color: colors[0]}];
          let markIndex = markData.length;
          for (let i = 0, len = markData.length; i < len; i++) {
            if (dataItemValue < markData[i] && dataItemValue > markData[i - 1]) {
              markIndex = i;
              break;
            }
          }
          for (let j = 0; j < markIndex + 1; j++) {
            let colorPercent;
            if (j == markIndex) {
              colorArr.push({offset: 1, color: colors[j]})
            } else {
              colorPercent = Number(((markData[j] / (dataItemValue))).toFixed(8))
              colorArr.push({offset: colorPercent > 1 && 1 || colorPercent, color: colors[j]})
              colorArr.push({offset: colorPercent > 1 && 1 || colorPercent, color: colors[j + 1]})
            }
          }
          return new echarts.graphic.LinearGradient(1, 1, 1, 0, colorArr)
        }

        lineEcharts.initEachrts(Object.assign({
          id: vm.id,
          color: colors,
          grid: {bottom: 60},
          xAxis: [{name: vm.xname, nameGap: 5, data: vm.xd}],
          dataZoomShow: false,
          dataZoomInsideShow: (vm.xd.length>vm.onceShowWts),
          dataZoomInside: {start: vm.zoomStart, end: vm.xd.length>vm.onceShowWts && vm.zoomEnd || 100},
          zoomLock: true,
          yAxis: [{name: vm.yname, min: yMin, max: yMax, splitLine: {show: false}}],
          legend: {show: false},
          series: series
        }, o))
      },
      changeLegend(index) {
        let vm = this;
        if (vm.legend[index].checked) {
          vm.$set(vm.legend, index, Object.assign(vm.legend[index], {checked: false}));
        } else {
          vm.$set(vm.legend, index, Object.assign(vm.legend[index], {checked: true}));
        }
        if (this.isEnlarge) {
          this.zoomDraw('echartFull', true)
        } else {
          this.drawEchart()
        }
      },
      zoomDraw(id, type) {
        this.drawEchart({
          id: id,
          dataZoomShow: true,
          dataZoomInsideShow: true,
          zoomLock: false,
          grid: {bottom: 110},
          legend: {show: false},
          dataZoomPos: {bottom: 70},
        })
        if (!type) {
          this.initLengend()
          this.isEnlarge = true
        }
      },
      preClick() {
        if (this.zoomStart != 0) {
          this.zoomStart = this.zoomStart - 20;
          this.zoomEnd = this.zoomEnd - 20
          this.drawEchart()
        }
      },
      nextClick() {
        if (this.zoomEnd != 100) {
          this.zoomStart = this.zoomStart + 20;
          this.zoomEnd = this.zoomEnd + 20
          this.drawEchart()
        }
      }
    },
    watch: {
      windSet: function () {
        if(this.id === 'echartFull') return;
        this.initLengend();
        this.drawEchart()
      },
      deep: true,
    }
  }
</script>
<style lang='less'>
  .el-dialog__body {
    .windOfEcharts {
      .my-legend {
        width: 1050px;
      }
      &.echarts-full {
        .windBar {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  
  .windOfEcharts {
    position: relative;
    .windBar {
      width: 100%;
      height: 380px;
    }
    .pre_next-btn {
      position: absolute;
      width: calc(100% - 48px);
      padding-left: 35px;
      left: 0;
      bottom: 50px;
      .btn_pre, .btn_next {
        width: 20px;
        height: 20px;
        border: 1px solid @inputColor;
        padding: 0;
        border-radius: 0;
        display: inline-block;
        background-color: transparent;
        color: @whiteColor;
        line-height: 20px;
        text-align: center;
        &.active {
          background-color: #1B7DE2;
          color: #fff;
          border: none
        }
      }
      .btn_next {
        float: right
      }
    }
    .my-legend {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 50px;
      overflow: auto;
      ul {
        padding: 0 60px;
        text-align: center;
      }
      li {
        color: @whiteColor;
        font-size: 12px;
        line-height: 2;
        cursor: pointer;
        display: inline-block;
        width: 20%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        .round-rect {
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 8px;
          vertical-align: middle;
        }
        &.no-checked {
          color: @whiteColor;
          .round-rect {
            background-color: @disabledBorder !important;
          }
        }
      }
    }
  }

</style>
