<template>
  <el-dialog class="wind-param-result" title="风数据" :visible.sync="visible" :modal-append-to-body="false"
             :close-on-click-modal="true" width="1200px" top="30px" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.3)">
    <el-form class="form-header" label-width="left" inline>
      <el-form-item label="风数据：">
        <el-select v-model="climate_file_id" @change="climateFileChange">
          <el-option v-for="option in climateFiles" :key="option.id" :value="option.id"
                     :label="option.fileName" :title="option.fileName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="avgSpeed" label="平均风速：" style="margin-left: 63px;">
        <span>{{ avgSpeed }}m/s</span>
      </el-form-item>
      <el-form-item v-if="time" label="起止时间：" style="float:right;">
        <span>{{ time }}</span>
      </el-form-item>
    </el-form>
    <el-row :gutter="10">
      <el-col :span="12" v-for="(box, index) in boxList" :key="box.name + index">
        <div class="echart-container" v-show="!box.hide">
          <h3 class="echart-title">{{box.label}}
            <p v-if="index===2" class="iconfont">A: {{box.A}} <span>K: {{box.K}}</span></p>
          </h3>
          <polar v-if="box.type && box.type === 'polar'" :id="box.name" :ref="'com'+index" class="echarts"
                 :windSet.sync="box.data || null"></polar>
          <component v-else :ref="'com'+index" :is="box.name" class="echarts" :id="box.name + index"
                     :windSet.sync="box.data || null" :tag.sync="tag"></component>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
  import polar from '@/components/echarts/climate/polar.vue'
  import weibull from '@/components/echarts/climate/weibull.vue'
  import turbulence from '@/components/echarts/climate/turbulence.vue'

  export default {
    name: "windParamResult",
    data() {
      return {
        visible: false,
        projectId: this.$route.params.projectId,
        id: this.$route.params.id,
        climate_file_id: null,
        climateFiles: [],
        avgSpeed: '',
        time: '',
        boxList: [
          {label: "风向玫瑰图", name: 'windDirection', type: 'polar', data: {}},
          {label: "风能玫瑰图", name: 'windEnergy', type: 'polar', data: {}},
          {label: "威布尔分布", name: 'weibull', data: {}},
          {label: "湍流图", name: 'turbulence', data: {}}
        ],
        tag: '',
        pdata: {},
        loading: false
      }
    },
    components: {polar, weibull, turbulence},
    methods: {
      showDialog(climateFiles, climate_file_id, tag) {
        this.visible = true;
        this.loading = true;
        this.climateFiles = climateFiles;
        this.climate_file_id = Number(climate_file_id)
        this.tag = tag
        this.getData()
      },
      getData() {
        this.planHttps.getClimateVIew(this.projectId, this.climate_file_id).then(data => {
          this.loading = false;
          this.avgSpeed = data.avgSpeed
          this.time = data.time
          this.$set(this.boxList, 2, Object.assign(this.boxList[2], {
            data: this.getWBE(data.weibullData),
            A: data.weibullData.weibull_a,
            K: data.weibullData.weibull_k
          }))
          if(data.turbulenceData && (data.turbulenceData.iec3Turbulence || data.turbulenceData.iec2Turbulence)) {
            this.$set(this.boxList, 3, Object.assign(this.boxList[3], {
              hide: false,
              data: data.turbulenceData
            }))
          } else {
            this.$set(this.boxList, 3, Object.assign(this.boxList[3], {
              hide: true
            }))
          }
          this.setPolarData(data.directionRose, 0)
          this.setPolarData(data.energyRose, 1)

        }).catch(err => {
          this.loading = false;
          console.log(err)
        })
      },
      setPolarData(data, index) {
        let edata = {};
        var cc = this.aa(data);
        var list = this.bb(cc.data);
        edata.direction = cc.direction;
        edata.data = list;
        edata.da = ['0-2', '2-4', '4-6', '6-8', '8-10', '>10']
        this.$set(this.boxList, index, Object.assign(this.boxList[index], {
          data: edata
        }))
      },
      getWBE(data) {
        let wdata = {
          yData: []
        };
        // var colors = ['#1B7DE2', '#1BCCCA']
        var xData = [], yData = [];

        var obj = {};
        for (var item in data.weiBullData) {
          obj.name = `风频分布`;
          obj.color = '#1B7DE2';
          yData.push((data.weiBullData[item] * 100).toFixed(2));
          xData.push(item);
        }
        obj.yda = yData;
        yData = [];
        var obj1 = {};
        for (var item in data.formula) {
          obj1.name = `威布尔分布`;
          obj1.color = '#1CD7BC';
          yData.push((data.formula[item] * 100).toFixed(2));
        }
        obj1.yda = yData;
        wdata.xData = xData;
        wdata.yData.push(obj);
        wdata.yData.push(obj1);
        wdata.xName = '风速(m/s)';
        wdata.yName = '风频(%)';
        wdata.yName1 = 'f';
        return wdata
      },
      bb(arr) {
        var list1 = [], list2 = [], list3 = [], list4 = [], list5 = [], list6 = [];
        for (var item of arr) {
          list1.push(item['0-2m/s']);
          list2.push(item['2-4m/s']);
          list3.push(item['4-6m/s']);
          list4.push(item['6-8m/s']);
          list5.push(item['8-10m/s']);
          list6.push(item['>10m/s']);
        }
        return [list1, list2, list3, list4, list5, list6]
      },
      aa(arr) {
        let vm = this;
        var list = [];
        var list1 = [];
        var ob = {
          direction: list,
          data: obj
        }
        var bb = 0;
        let climateType = this.climateFiles.filter(v=>{return v.id == vm.climate_file_id})[0].fileName
        for (var item of arr) {
          list.push(climateType.endsWith('.tab') ? (item.angle == null && item.direction || item.angle) : item.direction);
          var obj = {
            '0-2m/s': 0,
            '2-4m/s': 0,
            '4-6m/s': 0,
            '6-8m/s': 0,
            '8-10m/s': 0,
            '>10m/s': 0,
          }
          for (var ite of item.speeds) {
            bb = Object.keys(ite)[0];
            if (bb <= 2) {
              obj['0-2m/s'] += ite[bb].toFixed(4) * 100;

            }
            if (bb <= 4 && bb > 2) {
              obj['2-4m/s'] += ite[bb].toFixed(4) * 100;

            }
            if (bb <= 6 && bb > 4) {
              obj['4-6m/s'] += ite[bb].toFixed(4) * 100;

            }
            if (bb <= 8 && bb > 6) {
              obj['6-8m/s'] += ite[bb].toFixed(4) * 100;

            }
            if (bb <= 10 && bb > 8) {
              obj['8-10m/s'] += ite[bb].toFixed(4) * 100;

            }
            if (bb > 10) {
              obj['>10m/s'] += ite[bb].toFixed(4) * 100;

            }
          }
          obj['0-2m/s'] = obj['0-2m/s'].toFixed(2)
          obj['2-4m/s'] = obj['2-4m/s'].toFixed(2)
          obj['4-6m/s'] = obj['4-6m/s'].toFixed(2)
          obj['6-8m/s'] = obj['6-8m/s'].toFixed(2)
          obj['8-10m/s'] = obj['8-10m/s'].toFixed(2)
          obj['>10m/s'] = obj['>10m/s'].toFixed(2)
          list1.push(obj)
        }
        ob.data = list1
        return ob;

      },
      climateFileChange(value) {
        this.loading = true;
        this.climate_file_id = value;
        this.getData()
      }
    }
  }
</script>

<style lang="less">
  @border_color: #e4e7ed;
  .wind-param-result {
    padding-top: 10px;
    .form-header {
      height: 48px;
      background: @blockBg;
      border: 1px solid @listColor;
      padding: 10px;
      margin-bottom: 10px;
      color: @whiteColor;
    }
    .echart-container {
      background: @sideBlack;
      margin-bottom: 10px;
      border-radius: 2px;
      border: 1px solid @inputColor;
      .echart-title {
        position: relative;
        border-bottom: 1px solid @inputColor;
        font-size: 16px;
        font-weight: normal;
        padding: 12px 22px 11px;
        line-height: 1;
        color: @whiteColor;
        .iconfont {
          background-size: 18px;
          width: 40px;
          height: 40px;
          position: absolute;
          right: 0;
          top: 0;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
        }
        p.iconfont {
          width: 200px;
          text-align: right;
          padding-right: 20px;
          span {
            margin-left: 40px;
          }
        }
      }
    }
    .echarts,
    .polar-echart {
      width: 100%;
      height: 320px;
      .el-select {
        .el-input__inner {
          color: @whiteColor;
        }
      }
    }
    .radar-echart {
      width: 100%;
      height: 380px;
      /*padding-top: 40px;*/
    }
  }
</style>
