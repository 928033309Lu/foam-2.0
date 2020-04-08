<template>
  <div class="echarts-onflow-div">
    <el-select v-model="version" placeholder="请选择" @change="versionChange">
      <el-option v-if="flow.iecAllLine" label="IEC 三版" value="3"></el-option>
      <el-option v-if="flow.originLine" label="IEC 二版" value="2"></el-option>
    </el-select>
    <div class="noData" v-if="nodata">
      <div class="nonefont">
        <i class="iconfont icon-youxisousuo-wujieguo"></i>
        <p>暂无数据</p>
      </div>
    </div>
    <div v-else class="turbulence-container" :class="'version'+version">
      <div class="echarts-container">
        <el-row v-if="version == '3'" :gutter="10">
          <el-col :span="12" v-for="(item, index) in iecAllLine" :key="index">
            <div class="echart-container">
              <h3 class="echart-title">{{titleFilter(item)}}<i class="iconfont iconquanping1" @click="zoomInEcharts(index)"></i></h3>
              <div :ref="'com'+index" :id="'flow'+index" class="echarts"></div>
            </div>
          </el-col>
        </el-row>
        <div v-if="version == '2'" class="echart-container large">
          <h3 class="echart-title">特征湍流分析</h3>
          <div class="echarts-onflow">
            <div id="onflow"></div>
          </div>
        </div>
      </div>
      <div class="tips-container">
        <div class="tags-container">
          <el-button v-if="legendSelected.length < allLegend.length" type="text" @click="visible = true; checked=legendSelected">+增加结果点</el-button>
          <el-tag :key="wt" v-for="(wt, i) in legendSelected"
                  v-if="!['A', 'B', 'C', '2A', '2B'].includes(wt)" closable :disable-transitions="false" @close="handleClose(wt)">
            <i class="round-rect" :style="'background-color:' + color[wt]"></i>
            {{wtFilter(wt)}}
          </el-tag>
        </div>
        <div class="my-legend">
          <ul>
            <li v-for="(wt, i) in allLegend" @click="toggleLine(wt)" :key="wt" v-if="['A', 'B', 'C', '2A', '2B'].includes(wt)">
              <i class="round-rect" :style="'background-color:' + (legendSelected.includes(wt) && color[wt] || '#ccc')"></i>
              <span>{{'IEC '+ (wt.length == 2 && wt.substr(1,1) || wt) + '线'}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <el-dialog title="结果点" :visible.sync="visible" :modal-append-to-body="false">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <el-checkbox-group v-model="checked" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="city in allLegend" v-show="!['A', 'B', 'C', '2A', '2B'].includes(city)" :label="city" :key="city">{{city}}</el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer" style="text-align:center">
        <el-button @click="setLegendSelect">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="zoomVisible" :title="titleFilter(iecAllLine[zoomI])" class="zoom-window" width="1080px"  :fullscreen=" false" :modal-append-to-body="false">
      <div id="echartFull" class="echarts-full"></div>
    </el-dialog>
  </div>
</template>
<script>
  import echarts from 'echarts'
  import lineEcharts from "@/components/echarts/line.js"
  export default {
    name: 'turbulence',
    data() {
      return {
        nodata: false,
        flow: {
          iecAllLine: '',
          originLine: ''
        },
        fileId: 1886,
        id: 'onflow',
        color: {},
        isCheckAll: true,
        legendSelected: [],
        splitLine: ['10', '20'],
        checkedWt: [],
        visible: false,
        isIndeterminate: true,
        checkAll: false,
        checked: [],
        allLegend: [],
        hslArray: [],
        version: '',
        iecAllLine: [],
        zoomVisible: false,
        zoomI: 0
      }
    },
    components: {},
    props: ['projectId', 'planId', 'dataset'],
    mounted() {
      this.initData()
    },
    methods: {
      titleFilter(item){
        return (item + (item && item.includes('ETM') && '终极湍流分析' || '湍流图'));
      },
      wtFilter(wt){
        return (wt.startsWith('M') && wt.split("机位点")[0]+'测风塔' || wt)
      },
      initData(){
        let vm = this;
        this.projectHttps.getTurLine(vm.$route.params.projectId, vm.$route.params.id).then((data)=>{
          let echartData = JSON.parse(data.turbulenceResult)
          vm.flow = echartData;
          if(echartData.iecAllLine){
            vm.nodata = false;
            vm.version = '3';
            vm.versionChange('3');
          }else if(echartData.originLine || echartData.series){
            echartData.series && (vm.flow.originLine = echartData)
            vm.nodata = false;
            vm.version = '2';
            this.versionChange('2');
          }else{
            vm.nodata = true;
          }
          vm.nodata = false;
        }).catch(error=>{
          console.log(error)
        })
      },
      // 切换版本2/3
      versionChange(version){
        let vm = this;
        if(version == '2'){
          vm.allLegend = vm.flow.originLine.series.map((v)=>{return v.name})
          vm.hslArray = vm.getHslArray(vm.allLegend.length)
          vm.legendSelected = JSON.parse(JSON.stringify(vm.allLegend))
          vm.drawEchart2(vm.flow.originLine)
        }else if(version == '3'){
          let iecAllLine = Object.keys(vm.flow.iecAllLine)
          vm.iecAllLine = vm.toFirst(iecAllLine, iecAllLine.indexOf('ETM'))
          vm.allLegend = Object.values(vm.flow.iecAllLine)[0].turbines
          vm.hslArray = vm.getHslArray(vm.allLegend.length)
          vm.legendSelected = JSON.parse(JSON.stringify(vm.allLegend))
          vm.iecAllLine.map((v, k)=> {
            vm.drawEchart3(Object.assign(vm.flow.iecAllLine[v], {
              id: 'flow' + k
            }));
          })
        }
      },
      //数组元素置顶移动
      toFirst(arr,index) {
        if(index!=0){
          arr.unshift(arr.splice(index , 1)[0]);
        }
        return arr
      },
      // 版本3绘制
      drawEchart3(o) {
        let vm = this;
        vm.color = {}
        let option = {
          animation: false,
          id: o.id,
          color: o && o.series.map((v, k)=>{
            let color = ''
            if(v.name === 'A'){
              color = '#1B7DE2'
            }else if(v.name === 'B'){
              color = '#1CD7BC'
            }else if(v.name === 'C'){
              color = '#FF2E76'
            }else {
              color =  `rgb(${vm.hslToRgb.apply(this,vm.hslArray[k])})`
            }
            vm.color[v.name] = color
            return color
          }) || [],
          xAxis: [{
            name: '风速（m/s）',
            data: o && o.windSpeeds.slice(0, 23),
            markline: {},
            boundaryGap: false
          }],
          grid: {
            right: 90,
            // bottom: 120
          },
          legend: {
            // type: 'scroll',
            // orient: 'vertical',
            // right: 40,
            // top: 20,
            bottom: 0,
            icon: 'roundRect',
            itemWidth:14,
            inactiveColor: 'rgba(43, 103, 139, .4)',
            show: false
          },
          tooltip: {
            formatter: (params)=>{
              let col = Math.ceil(params.length/14)
              let str = `<div style="padding-right: 24px;">${params[0].name}m/s<br/>`;
              params.forEach((v, k)=>{
                str += `<p style="display: inline-block; width:${100/col}%">${v.marker}${vm.fomationName(v.seriesName)}: ${o.series[k].pre || ''}${Number(v.value.toFixed(3))}${o.series[k].unit || ''}</p> ${((k+1)%col == 0)?'<br/>': ''}`
              })
              str + '</div>'
              // console.log(str)
              return str;
            }
          },
          yAxis: [{
            name: '湍流强度',
            min: 0,
          }],
          series: o && o.series
        }
        lineEcharts.initEachrts(option)
      },
      // 版本2绘制
      drawEchart2(o) {
        let vm = this;
        vm.color = {}
        let option = {
          animation: false,
          id: 'onflow',
          color: o && o.series.map((v, k)=>{
            let color = ''
            if(v.name === '2A'){
              color = '#1B7DE2'
            }else if(v.name === '2B'){
              color = '#1CD7BC'
            }else {
              color = `rgb(${vm.hslToRgb.apply(this,vm.hslArray[k])})`
            }
            vm.color[v.name] = color
            return color
          }) || [],
          xAxis: [{
            name: '风速（m/s）',
            data: o && o.xAxis.data.slice(0, 25) || [],
            markline: {},
            boundaryGap: false
          }],
          grid: {
            right: 90,
            // bottom: 120
          },
          legend: {
            // type: 'scroll',
            // orient: 'vertical',
            // right: 40,
            // top: 20,
            bottom: 0,
            icon: 'roundRect',
            itemWidth:14,
            inactiveColor: 'rgba(43, 103, 139, .4)',
            show: false
          },
          tooltip: {
            formatter: (params)=>{
              let col = Math.ceil(params.length/14)
              let str = `<div style="padding-right: 24px;">${params[0].name}m/s<br/>`;
              params.forEach((v, k)=>{
                str += `<p style="display: inline-block; width:${100/col}%">${v.marker}${vm.fomationName(v.seriesName)}: ${o.series[k].pre || ''}${v.value.toFixed(3)}${o.series[k].unit || ''}</p> ${((k+1)%col == 0)?'<br/>': ''}`
              })
              str + '</div>'
              return str;
            }
          },
          yAxis: [{
            name: '湍流强度',
            min: 0
          }],
          series: o && o.series || []
        }
        lineEcharts.initEachrts(option)
      },
      fomationName(name){
        let arr = ['2A', '2B', '3A', '3B', '3C'];
        if(arr.indexOf(name)>-1){
          let start = name.substr(0,1)
          // return `IEC标准${start == '2' && 'Ⅱ' || start == '3' && 'Ⅲ'}${name.substring(1)}`
          return `${name.substring(1)}`
        }else{
          return name
        }
      },
      checkChange(v){
        if(v){
          this.legendSelected.forEach((c)=>{
            echarts.getInstanceByDom(document.getElementById(this.id)).dispatchAction({
              type: 'legendSelect',
              name: c.indexOf('_')>-1&&c.slice(c.indexOf('_')+1)||c,
            })
          })
        }else{
          this.legendSelected.forEach((c)=>{
            if(c === 'IEC标准') return;
            echarts.getInstanceByDom(document.getElementById(this.id)).dispatchAction({
              type: 'legendUnSelect',
              name: c.indexOf('_')>-1&&c.slice(c.indexOf('_')+1)||c,
            })
          })
        }
      },
      arrToObj(arr, v){
        let o = {};
        arr && arr.length>0 && arr.forEach((c,i)=>{
          o[c] = v
        })
        return o;
      },
      // 隐藏机位点
      handleClose(tag){
        if(this.legendSelected.length<=1) return;
        this.legendSelected.splice(this.legendSelected.indexOf(tag), 1);
        this.resetOption()
      },
      resetOption(){
        let vm = this;
        if(this.version == '2'){
          let newSeries = []
          vm.flow.originLine && vm.flow.originLine.series.map((v)=>{
            if(vm.legendSelected.indexOf(v.name) > -1){
              newSeries.push(v)
            }
          })
          echarts.dispose(document.getElementById('onflow'))
          this.drawEchart2(Object.assign({}, vm.flow.originLine, {
            series: newSeries
          }))
        }else if(this.version == '3'){
          vm.iecAllLine.map((v, i)=> {
            let newSeries = [];
            vm.flow.iecAllLine[v].series.map(w => {
              if(vm.legendSelected.indexOf(w.name) > -1){
                newSeries.push(w)
              }
            })
            echarts.dispose(document.getElementById('flow'+i))
            vm.drawEchart3(Object.assign({}, vm.flow.iecAllLine[v], {
              series: newSeries,
              id: 'flow'+i
            }))
          })
        }
        
        /*let option = {
          series: newSeries
        }
        console.log(option)
        this.$nextTick(()=>{
          echarts.dispose(document.getElementById(this.id))
          let myChart = echarts.init(document.getElementById(this.id))
          myChart.setOption(option);
        })*/
      },
      zoomInEcharts(k){
        this.zoomI = k;
        this.zoomVisible = true;
        this.$nextTick(()=>{
          echarts.dispose(document.getElementById("echartFull"));
          let dom = echarts.getInstanceByDom(document.getElementById("flow"+k))
          let myChart = echarts.init(document.getElementById("echartFull"))
          myChart.setOption(dom.getOption());
        })
      },
      handleCheckAllChange(val) {
        let arr =['A', 'B']
        this.version == '3' && arr.push('C')
        this.checked = val ? JSON.parse(JSON.stringify(this.allLegend)) : arr;
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.allLegend.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.allLegend.length;
      },
      setLegendSelect(){
        this.legendSelected = this.checked;
        this.visible = false;
        this.resetOption();
      },
      toggleLine(wt){
        if(this.legendSelected.includes(wt)){
          this.legendSelected.splice(this.legendSelected.indexOf(wt), 1);
        }else{
          this.legendSelected.push(wt);
        }
        this.resetOption()
      },
      /**
       * HSL颜色值转换为RGB
       * H，S，L 设定在 [0, 1] 之间
       * R，G，B 返回在 [0, 255] 之间
       *
       * @param H 色相
       * @param S 饱和度
       * @param L 亮度
       * @returns Array RGB色值
       */
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
      getHslArray: function (hslLength) {
        var HSL = [];
        // var hslLength = 9; // 获取数量
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
      isCheckAll: function(cur){
      }
    }
  }

</script>
<style lang='less'>
  .echarts-onflow-div{
    position: relative;
    padding-top: 10px;
    .noData{
      .nonefont{position: absolute;top:0;bottom:0;left:0;right:0;width:144px ;height:144px;margin:auto auto;text-align: center;color: #ccc;
        i{ font-size: 100px; }
      }
    }
    .el-select{
      width: 120px;
      height: 25px;
      position: absolute;
      top: -32px;
      right: 114px;
      .el-input__inner{
        height:25px;
        line-height:22px;
        background:transparent;
        border-color:rgba(3,73,114,1);
        color:rgba(255,255,255,.7);
        border-radius: 0;
      }
    }
    .turbulence-container{
      position: relative;
      height: calc(100vh - 198px);
      overflow: auto;
      .echarts-container{
        width: calc(100% - 160px);
      }
      .tips-container{
        position: fixed;
        top: 188px;
        width: 150px;
        height: calc(100vh - 198px);
        background-color: @sideBlack;
        .el-button.el-button--text{
          text-align: center;
          width: 100%;
          margin-bottom: 17px;
          border: none;
          &:hover{
            border: none;
          }
        }
      }
  
      &.version2{
        .tips-container{
          right: 10px;
        }
      }
      &.version3{
        .tips-container{
          right: 16px;
        }
      }
    }
    .echart-container{
      background: @sideBlack;
      margin-bottom: 10px;
      border-radius: 2px;
      &.large{
        margin-bottom: 0;
      }
      .echart-title{
        position: relative;
        border-bottom: 1px solid @inputColor;
        font-size: 16px;
        font-weight: normal;
        padding: 12px 22px 11px;
        line-height: 1;
        color: @whiteColor;
        .iconfont{
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
      }
    }
    .echarts{
      width: 100%;
      height: 380px;
    }
    .echarts-onflow{
      width: 100%;
      height: calc(100vh - 238px);
      padding-top: calc((100vh - 238px - 350px)/2);
      #onflow{
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        height: 350px;
      }
    }
    
    .tags-container{
      color: @whiteColor;
      font-size: 0;
      line-height: 1;
      padding: 20px 16px;
      height: calc(100% - 88px);
      border-bottom: 1px solid @inputColor;
      overflow-y: auto;
      overflow-x: hidden;
      .title{
        font-size: 14px;
        position: absolute;
        left: 10px;
        line-height: 26px;
      }
      .el-tag{
        position: relative;
        width: 100%;
        font-size: 14px;
        line-height: 1;
        height: 26px;
        padding: 0;
        background-color: transparent;
        color: @whiteColor;
        border: none;
        margin-bottom: 6px;
        >*{
          vertical-align: middle;
        }
        .round-rect{
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 8px;
          border-radius: 2px;
        }
        .el-tag__close{
          position: absolute;
          color: #C8C9D9;
          width: 14px;
          height: 14px;
          font-size: 10px;
          line-height: 14px;
          top: 0;
          &:hover{
            background-color: rgba(255, 255, 255, .3);
            color: #000;
          }
        }
      }
    }
    .el-dialog{
      .el-checkbox{
        color: @whiteColor;
        margin-bottom: 10px;
      }
    }
    .my-legend{
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 88px;
      padding: 14px 13px;
      ul{
        font-size: 0;
        line-height: 0;
      }
      li{
        display: inline-block;
        color: @whiteColor;
        font-size: 12px;
        line-height: 14px;
        cursor: pointer;
        margin-bottom: 8px;
        margin-right: 10px;
        *{
          vertical-align: middle;
        }
        .round-rect{
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 8px;
          border-radius: 2px;
        }
        &.no-checked{
          color: #cccccc;
          .round-rect{
            background-color: #cccccc !important;
          }
        }
      }
    }
    
    .zoom-window{
      .el-dialog{
        .el-dialog__body{
          padding: 0;
        }
        &.is-fullscreen{
          width: calc(100% - 100px);
          height: calc(100% - 100px);
          margin: 50px;
          overflow: hidden;
          .el-dialog__body{
            width: 100%;
            height: 100%;
            padding-bottom: 30px;
            margin-bottom: -30px;
          }
        }
      }
      .echarts-full{
        width: 1080px;
        height: 600px;
        max-height: 70vh;
      }
    }
  }

</style>
