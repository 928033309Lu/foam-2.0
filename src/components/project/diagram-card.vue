<style lang="less" rel="stylesheet/less">
  .diagram-box {
    width: 680px;
    .el-dialog__body {
      padding: 0!important;
      .diagram-body {
        width: 100%;
        box-sizing: border-box;
        padding: 20px 36px;
        overflow: hidden;
        .diagram-echart {
          width: 100%;
          height: 450px;
          //background: #f7f8f9;
        }
      }
    }
    .fan-list {
      width: 100%;
      height: 24px;
      margin-top: 20px;
      margin-right: 9px;
      position: relative;
      .el-button{
        float:left;
        margin-left:36px;
        width:76px;
        height:24px;
        border:1px solid rgba(43,103,139,1);
        padding:0;
        text-align:center;
        line-height:24px;
        background:transparent;
        color:#fff;
      }
      .select-right{
        float:right;
        .el-select{
          width:120px;
          height:24px;
          margin-right:36px;
          background:transparent;
          input{
            border-radius: 0;
            border:1px solid rgba(43,103,139,1);
            height:24px;
            line-height:24px;
            background:transparent;
            color:#fff;
          }
          .el-input__icon {
            line-height: 24px;
          }
        }
      }
    }
  }
</style>

<template>
  <el-dialog class="diagram" title="收敛图" custom-class="diagram-box" :close-on-click-modal="false" :visible="dialogDiagram" :before-close="close" :modal-append-to-body="false">
    <div class="fan-list">
      <el-button size="mini" @click="reset">{{fg?'显示后30%':'显示全部'}}</el-button>
      <div class="select-right">
        <span>扇区-热力稳定度：</span>
        <el-select size="mini" v-model="activeId" @change="changeGrid" placeholder="请选择">
          <el-option
            v-for="(item,index) in gridList"
            v-if="item.status==1"
            :key="index"
            :label="item.angle+' - '+changeValue(item.borderValue,true)"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="diagram-body" id="diagram-body">
      <div class="diagram-echart" id="diagram-echart" v-loading="loading" element-loading-background="rgba(0,44,70,0.8)">

      </div>
    </div>
  </el-dialog>
</template>

<script>
  import Highcharts from 'highcharts'
  import cfdListServices from '../../services/cfdList.service'
  import { swicthValue } from '../../utils/switchBorderValue'

  export default {
    mixins: [swicthValue],
    data() {
      return {
        loading:true,
        fg:false,
        dialogDiagram: false,
        projectId: JSON.parse(sessionStorage.getItem('detail')).projectId || 1,
        loading: true,
        seriesData: [],
        sData: [],
        chart: null,
        activeId: ''
      }
    },
    props: {
      grid: {},
      gridList: {}
    },
    watch: {
      dialogDiagram(n) {
        this.xData = '';
        if (n) {
          //setTimeout(()=>{
            this.initCharts();
          //},0)
        } else {
          this.chart.destroy();
          this.seriesData = [];
          this.sData = [];
          this.activeId = '';
        }
      }
    },
    computed: {

    },
    mounted() {

    },
    methods: {
      close(done) {
        this.dialogDiagram = false;
        done();
      },
      showDialog() {
        this.dialogDiagram = true;
        this.loading = true;
      },
      hideDialog() {
        this.dialogDiagram = false;
      },
      changeGrid() {
        if(this.chart)
          this.chart.destroy();
        this.seriesData = [];
        this.sData = [];
        this.initCharts();
      },
      reset(){
        this.loading = true;
        this.fg=!this.fg
        var vv=this;
        if(this.chart)
          this.chart.destroy();
        this.chart = Highcharts.chart('diagram-echart', {
          chart: {
            zoomType: 'x',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            resetZoomButton: {
              position: {
                x: 0,
                y: 0
              }
            },
          },
          colors: ['#BFBFBF','#8957A1','#F39800','#FF2E76','#009FFF','#00FFFF'],
          title: {
            text: ''
          },
          tooltip: {
            backgroundColor: 'rgba(43,103,139,.7)',   // 背景颜色
            borderColor: 'rgba(43,103,139,.7)',
            shadow: true,                 // 是否显示阴影
            animation: true,               // 是否启用动画效果
            style: {                      // 文字内容相关样式
              color: "rgba(255,255,255,.7)"
            },
            formatter: function () {
              return  '<b>' + this.y + '</b>';
            }
          },
          legend: {
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle : {
              color : '#fff'
            }
          },
          yAxis: {
            title: {
              text: ''
            },
            gridLineColor:'#2B678B',
            labels:{
              style: {
                color: '#fff'
              }
            }
          },
          xAxis: {
            labels: {
              formatter:function(){
                if(vv.fg){
                  return this.value;
                }else{
                  return this.value+vv.xData;
                }
              },
              style: {
                color: '#fff'
              }
            },
            gridLineColor:'#2B678B'
          },
          plotOptions: {
            series: {
              label: {
                connectorAllowed: false
              },
              marker: {
                enabled: false
              },
              pointStart: 1
            },
          },
          series: this.fg?vv.seriesData:vv.sData,
          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom',
                  enabled: false
                }
              }
            }]
          },
          credits: {
            enabled: false
          }
        });
        this.loading = false;
      },
      initCharts() {
        this.loading = true;
        if(!this.activeId){
          this.activeId = this.grid.id;
        }
        cfdListServices.getConvergence(this.projectId, this.activeId).then((data) => {
          this.seriesData = [];
          this.sData = [];
          for (let item in data) {
            if (item != 'continuity') {
              let dataItem = _.map(data[item], num => {
                return Number(num);
              })
              this.xData=parseInt(dataItem.length*0.7)
              let obj = {
                name: item,
                data: dataItem
              };
              let obj1 = {
                name: item,
                data: dataItem.slice(-parseInt(dataItem.length*0.3))
              };
              this.seriesData.push(obj);
              this.sData.push(obj1);
            }
          };
          var vv=this;
          this.chart = Highcharts.chart('diagram-echart', {
            chart: {
              zoomType: 'x',
              backgroundColor: 'rgba(255, 255, 255, 0)',
              resetZoomButton: {
                position: {
                  x: 0,
                  y: 0
                }
              },
            },
            colors: ['#BFBFBF','#8957A1','#F39800','#FF2E76','#009FFF','#00FFFF'],
            title: {
              text: ''
            },
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              itemStyle : {
                color : '#fff'
              }
            },
            yAxis: {
              title: {
                text: ''
              },
              gridLineColor:'#2B678B',
              labels:{
                style: {
                  color: '#fff'
                }
              }
            },
            xAxis: {
              labels: {
                formatter:function(){
                  return vv.fg?this.value:(this.value+vv.xData);
                },
                style: {
                  color: '#fff'
                }
              },
              gridLineColor:'#2B678B'
            },
            tooltip: {
              backgroundColor: 'rgba(43,103,139,.7)',   // 背景颜色
              borderColor: 'rgba(43,103,139,.7)',
              shadow: true,                 // 是否显示阴影
              animation: true,               // 是否启用动画效果
              style: {                      // 文字内容相关样式
                color: "rgba(255,255,255,.7)"
              },
              formatter: function () {
                return  '<b>' + this.y + '</b>';
              }
            },
            plotOptions: {
              series: {
                label: {
                  connectorAllowed: false
                },
                marker: {
                  enabled: false
                },
                pointStart: 1
              },
            },
            series: this.fg?this.seriesData:this.sData,
            responsive: {
              rules: [{
                condition: {
                  maxWidth: 500
                },
                chartOptions: {
                  legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    enabled: false
                  }
                }
              }]
            },
            credits: {
              enabled: false
            }
          });
          this.loading = false;
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }

</script>
