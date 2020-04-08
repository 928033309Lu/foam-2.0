<template>
  <div class="tubiao">
    <div :id="did" class="line"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      hslArray:[],
      myChart: null,
      option: {},
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 45
        },
        {
          start: 30,
          show: true,
          bottom: "30",
          end: 90,
          handleIcon:
            "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
          handleSize: "80%",
          handleStyle: {
            color: "#fff",
            shadowBlur: 3,
            shadowColor: "rgba(0, 0, 0, 0.6)",
            shadowOffsetX: 2,
            shadowOffsetY: 2
          },
          textStyle: {
            color: "rgba(255, 255, 255, .7)"
          }
        }
      ],
      yAxisData: {
        type: "value",
        inverse: this.inverse,
        nameLocation: this.inverse ? "start" : "end",
        nameTextStyle: {
          color: "rgba(255,255,255,0.7)",
          padding: [20, 0, 0, 5],
          align: "center"
        },
        axisLine: {
          // onZero: false,
          lineStyle: {
            color: "#034972"
          }
        },
        axisLabel: {
          color: "rgba(255,255,255,0.7)"
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#034972"
          }
        },
        scale: true //y轴自动计算最小值
      }
    };
  },
  props: {
    did: {
      default: "aa"
    },
    hidden: {
      default: true
    },
    inverse: {
      default: false
    },
    windSet: {}
  },
  computed: {
    rgbArray: function () {
      var self = this;
      if (!self.hslArray.length) return [];

      var rgbArray = self.hslArray.map(function (item) {
        return self.hslToRgb.apply(this, item);
      });

      return rgbArray.map(function (item) {
        return 'rgb(' + item.toString() + ')' ;
        
      });
    }
  },
  mounted() {
    this.hslArray = this.getHslArray();
    this.init(this.windSet.yData);
  },
  methods: {
    initData(arr) {
      this.option = {
        color:this.rgbArray,
        tooltip: {
          show: true,
          backgroundColor: 'rgba(3, 73, 114, .85)',
          trigger: "axis",
          confine:true,
          enterable:true,
          extraCssText:'overflow:auto;max-height:250px',
          axisPointer: {
            type: "cross"
          }
        },
        dataZoom: !this.hidden && this.dataZoom,
        xAxis: {
          name: this.windSet.xName,
          boundaryGap: false,
          type: "category",
          nameTextStyle: {
            color: "rgba(255,255,255,0.7)",
            padding: [40, 0, 0, 15]
          },
          axisLine: {
            // onZero: false,
            lineStyle: {
              color: "#034972"
            }
          },
          axisLabel: {
            color: "rgba(255,255,255,0.7)"
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#034972"
            }
          }
        },
        legend: {
          textStyle: {
            color: "rgba(255,255,255,0.7)"
          },
          pageIconColor:'#009FFF',
          pageTextStyle:{
            color:'#eee',
          },
          bottom: "0",
          type: "scroll",
          data: []
        },
        grid: {
          left: "80px",
          right: "100px",
          // top: '50px',
          bottom: "100px"
        },
        yAxis: [
          {
            name: this.windSet.yName
          }
        ],
        series: []
      };
      for (var i = 0; i < arr.length; i++) {
        this.option.legend.data.push({ name: arr[i].name, icon: "roundRect" });
      }
      this.option.yAxis = this.windSet.yName.map((it, index) => {
        if (index >= 1) {
          return { name: it, ...this.yAxisData,splitLine:{show:false} };
        } else {
          return { name: it, ...this.yAxisData };
        }
      });
      this.option.series = this.windSet.yData;
    },
    init(arr) {
      this.initData(arr);
      if (!this.myChart) {
        this.myChart = this.$echarts.init(document.getElementById(this.did));
      }

      this.myChart.setOption(this.option, true);
    },
    hslToRgb: function (H, S, L) {
      var R, G, B;
      if (+S === 0) {
        R = G = B = L; // 饱和度为0 为灰色
      } else {
        var hue2Rgb = function (p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        var Q = L < 0.5 ? L * (1 + S) : L + S - L * S;
        var P = 2 * L - Q;
        R = hue2Rgb(P, Q, H + 1/3);
        G = hue2Rgb(P, Q, H);
        B = hue2Rgb(P, Q, H - 1/3);
      }
      return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
    },

    // 获取随机HSL
    randomHsl: function () {
      var H = Math.random();
      var S = Math.random();
      var L = Math.random();
      return [H, S, L];
    },

    // 获取HSL数组
    getHslArray: function () {
      var HSL = [];
      var hslLength = 100; // 获取数量
      for (var i = 0; i < hslLength; i++) {
        var ret = this.randomHsl();

        // 颜色相邻颜色差异须大于 0.25
        if (i > 0 && Math.abs(ret[0] - HSL[i - 1][0]) < 0.25) {
          i--;
          continue; // 重新获取随机色
        }
        ret[1] = 0.7 + (ret[1] * 0.2); // [0.7 - 0.9] 排除过灰颜色
        ret[2] = 0.4 + (ret[2] * 0.4); // [0.4 - 0.8] 排除过亮过暗色

        // 数据转化到小数点后两位
        ret = ret.map(function (item) {
          return parseFloat(item.toFixed(2));
        });

        HSL.push(ret);
      }
      return HSL;
    }
  },
  watch: {
    windSet: {
      handler(curVal, oldVal) {
        this.init(curVal.yData);
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
.tubiao {
  height: 85%;
  .line {
    height: 100%;
  }
}
</style>
