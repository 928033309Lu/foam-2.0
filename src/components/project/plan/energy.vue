<template>
  <div class='energy'>
      <div class='b-container'>
        <sin-box v-for="item in boxList" class="sin" :key='item.name' :single='item' v-on="$listeners"></sin-box>
      </div>
  </div>
</template>

<script>
import sinBox from "@/components/project/plan/sin-box.vue";
export default {
  name: '',
  data () {
    return {
      boxList:[{
            name:'机位点 - 发电量/海拔',
            windSet:{
            xName:'机位点',
            yName:['发电量(MWh/year)','海拔(m)'],
            yData:[],
          },
        },
        // {
        //     name:'机位点 - 尾流前小时数',
        //     windSet:{
        //     xName:'机位点',
        //     yName:['发电小时数(h)'],
        //     yData:[],
        //   },
        // },
        {
            name:'机位点 - 发电小时数/海拔',
            windSet:{
            xName:'机位点',
            yName:['发电小时数(h)','海拔(m)'],
            yData:[],
          },
        },
        {
            name:'机位点 - 尾流损失率',
            // inverse:true,
            windSet:{
            xName:'机位点',
            yName:['尾流损失率(%)'],
            yData:[],
          },
        },
      ],
    };
  },
  props:['projectId','id'],
  components: {sinBox},
  mounted () {
    this.getHourLine(this.projectId, this.id);
  },
  methods: {
    getHourLine(project_id, scheme_id) {
      this.projectHttps
        .getHourLine(project_id, scheme_id)
        .then(res => {
           let cp=this.forLine(res);
          this.boxList[0].windSet.yData=[{
            name:'尾流前',
            data: this.forLine(res,'powerBeforeWake'),
            type: 'line',
            color:'#1B7DE2',
            symbolSize:1,
            smooth: true
          },{
            name:'尾流后',
            data: this.forLine(res,'powerAfterWake'),
            type: 'line',
            color:'#1CD7BC',
            symbolSize:1,
            smooth: true
          },{
            name:'海拔',
             yAxisIndex:1,
            data: this.forLine(res,'z'),
            type: 'line',
            color:'#FF2E76',
            symbolSize:1,
            smooth: true
          }];
          // this.boxList[1].windSet.yData=[{
          //   name:'发电小时数',
          //   data: this.forLine(res,'hoursBeforeWake'),
          //   type: 'line',
          //   color:'#099FFF',
          //   symbolSize:1,
          //   smooth: true
          // }];
          this.boxList[2].windSet.yData=[{
            name:'尾流损失率',
            data: this.forLine(res,'reductionRateAvgAfterWake'),
            type: 'line',
            color:'#1B7DE2',
            symbolSize:1,
            smooth: true
          }];
          this.boxList[1].windSet.yData=[
          {
            name:'尾流前',
            data: this.forLine(res,'hoursBeforeWake'),
            type: 'line',
            color:'#1B7DE2',
            symbolSize:1,
            smooth: true
          },
          {
            name:'尾流后',
            data: this.forLine(res,'hoursAfterWake'),
            type: 'line',
            color:'#1CD7BC',
            symbolSize:1,
            smooth: true
          },{
            name:'海拔',
             yAxisIndex:1,
            data: this.forLine(res,'z'),
            type: 'line',
            color:'#FF2E76',
            symbolSize:1,
            smooth: true
          }];
        })
        .catch(err => console.log(err));
    },
    forLine(arr,dir){
      return arr.map((item)=>{
        return [item['label'],Math.abs(item[dir])]
      })
    }
  }
}
</script>

<style lang='less'>
  .energy{
    padding-top:10px;
    .b-container {
      display: grid;
      grid-gap: 10px;
      grid-template-columns: repeat(2,  1fr);
      grid-template-rows: repeat(2, 420px);
}
  }
</style>
