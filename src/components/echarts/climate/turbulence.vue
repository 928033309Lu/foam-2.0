<template>
  <div>
    <el-form>
      <el-form-item>
        <el-select :disabled="!Object.keys(turbulenceData).length" v-model="version" placeholder="请选择" @change="versionChange">
          <el-option v-if="windSet.iec3VOS" label="IEC 三版" value="3"></el-option>
          <el-option v-if="windSet.iec2VOS" label="IEC 二版" value="2"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div :id="id" class="echarts"></div>
  </div>
</template>
<script>
  import echarts from 'echarts'
  import lineEcharts from "@/components/echarts/line.js"
  export default {
    data() {
      return {
        myChart:null,
        version: '3',
        option :{
          xAxis: {
            name:this.windSet.xName,
            type: 'category',
            data: this.windSet.xData,
          },
          yAxis:[ {
            name:this.windSet.yName,
            type: 'value'
          },
            {
              name:this.windSet.yName1,
              type: 'value'
            },
          ],
          series: [],
        },
        turbulenceData: {}
      }
    },
    props: {
      id:{
        default:'',
      },
      windSet:{
        default:{
          yData:[]
        },
      },
      tag: {
        default: ''
      }
    },
    mounted() {
    },
    methods: {
      versionChange (version) {
        this.version = version
        this.initData({
          iecVOS: this.turbulenceData['iec'+version+'VOS'],
          turbulence: this.turbulenceData['iec'+version+'Turbulence']
        })
      },
      initData (data) {
        let obj = {}
        obj.series = data.iecVOS.map(v => {
          return {
            name: v.type,
            data: Object.values(v.data)
          }
        })
        obj.series.push({
          // name: this.tag,
          name: "当前数据",
          data: data.turbulence.map(v=>{return Object.values(v)[0]})
        })
        obj.xAxis = {
          data: data.turbulence.map(v => {
            return Object.keys(v)[0]
          })
        }
        this.drawEchart(obj)
      },
      drawEchart (o) {
        let vm = this;
        vm.color = {}
        let option = {
          animation: false,
          id: vm.id,
          color: o && o.series.map((v, k)=>{
            let color = ''
            if(v.name.includes('A')){
              color = '#1B7DE2'
            }else if(v.name.includes('B')){
              color = '#1CD7BC'
            }else if(v.name.includes('C')){
              color = '#FF2E76'
            }else {
              color = `#895FDE`
            }
            // vm.color[v.name] = color
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
                str += `<p style="display: inline-block; width:${100/col}%">${v.marker}${vm.fomationName(v.seriesName)}: ${v.value.toFixed(3)}</p> ${((k+1)%col == 0)?'<br/>': ''}`
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
        console.log(option)
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
    },
    watch: {
      windSet:{
        handler(curVal, oldVal){
          this.turbulenceData = curVal
          if (curVal.iec3Turbulence) {
            this.versionChange('3')
          } else {
            this.versionChange('2')
          }
        },
        deep:true
      }
    }

  }
</script>
<style lang="less" scoped>
  .echarts{
    .el-select{
      position: absolute;
      right: 6px;
      top: -35px;
    }
  }
</style>
