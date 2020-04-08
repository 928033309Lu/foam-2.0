<template>
  <div class="result-display">
    <div class="display-container">
      <p class="project_name">{{projectName}}-{{schemeName}}</p>
      <template>
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane v-for="(item,index) in tabList " :label="item.label" :name="item.name" :key="index">
            <component :is="item.name" :projectId="projectId" :planId="id" :schemeId="id" :dataSet.sync="item.data || null"></component>
            <div class="nonefont" v-if="bor">
              <i class="iconfont icon-youxisousuo-wujieguo"></i>
              <p>暂无数据</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
    
  </div>
</template>
<script>
  
  
  import poweranalaysis from '@/components/project/analaysis/poweranalaysis.vue' //发电量分析
  // import wind from '@/components/project/analaysis/wind.vue'//风速分析
  // import onflow from '@/components/project/analaysis/onflow.vue' //湍流分析
  // import environment from '@/components/result/environment.vue' //环境影响分析
  // import load from '@/components/result/load.vue' //载荷分析
  // import powerassure from '@/components/result/powerassure.vue' //发电量担保
  // import download from '@/components/result/download.vue' //详情结果下载
  // import opgroup from '@/components/result/opgroup.vue' //详情结果下载
  // import {SchemeServices} from '@/services/scheme.service'
  //方案实现类
  let schemeServices;
  export default {
    data() {
      return {
        projectName:this.$route.query.projectName||"风资源项目",
        schemeName:this.$route.query.schemeName||"风资源方案",
        id: this.$route.query.schemeId||18,
        projectId: this.$route.query.projectId || 248,
        schemeData:null,
        // activeName: localStorage.getItem("curTab") || 'outcome',
        activeName:'outcome',
        maxReloadNum:3,
        tabList: [
          
          {label: "发电量分析", name: 'poweranalaysis', data: []},
          
        ],
        tableData: [],
        bor: false,
        breadcrumbList:[],
      }
    },
    components: { poweranalaysis},
    computed:{
      dataFrom(){
        return sessionStorage.getItem('dataFrom');
      }
    },
    mounted() {
      this.initData()
    },
    methods: {
      handleClick(e) {
        // localStorage.setItem("curTab", e.name)
      },
      initData() {
        
      this.projectHttps
        .getHourLine(82, 2)
        .then(res => {
          this.formatData(res)
        })
        .catch(err => console.log(err));
    

      },
      getProjectId(){
        let projectId=this.schemeData.projectId;
        return projectId;
      },
      formatData(d) {
        let vm = this, seatList = [], towerDataList = [], altitudeList = [], windSpeedList = [],windSpeedbeforeList=[], powerBeforeList = [],
          powerAfterList = [], hoursBeforeList = [], hoursAfterList = [], reductionRateList = [];
        d && d.length > 0 && d.forEach((cur) => {
          if (!!cur.model) {
            seatList.push(cur.label);
            altitudeList.push(parseFloat(cur.z));
            // windSpeedList.push(cur.windSpeedBeforeWake);
            windSpeedList.push(cur.windSpeedAfterWake);
            windSpeedbeforeList.push(cur.windSpeedBeforeWake);
            powerBeforeList.push(parseFloat(cur.powerBeforeWake))
            powerAfterList.push(parseFloat(cur.powerAfterWake))
            hoursBeforeList.push(parseFloat(cur.hoursBeforeWake.replace(',', '')))
            hoursAfterList.push(parseFloat(cur.hoursAfterWake.replace(',', '')))
            reductionRateList.push(parseFloat(Math.abs(cur.reductionRateAvgAfterWake)))
          } else {
            if (cur.label == "M1" || cur.label == "M2" || cur.label == "M3" || cur.label == "M4") {
              towerDataList.push({label: cur.label, windSpeedOfTower: cur.windSpeedBeforeWake}) //测风塔数据
            }
          }
        })
        
        vm.$set(vm.tabList, 1, Object.assign(vm.tabList[1], {data: {seatList, altitudeList, hoursBeforeList, hoursAfterList, powerBeforeList, powerAfterList, reductionRateList}}))
        
      },
    }
  }

</script>
<style lang='less'>
  @theme-blue: #1B7DE2;
@font-grey: #5E5F73;
@border-grey: #C1C2CE;
@green: #1BCCCA;

@view-default: 1200px;
@view-sm: 1000px;
  .result-display {
    width:100%;
    height: 100%;
    /*min-height:100vh;*/
    position: relative;
    margin: 0 auto;
    .display-container {
      width:1200px;
      margin:0 auto;
      padding:20px 0;
      text-align: center;
      .project_name {
        text-align: left;
        font-size: 18px;
        color: @font-grey;
        line-height: 30px;
        width:80%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      > .el-tabs .el-tabs__content {
        text-align: left;
      }
      .el-tabs__nav {
        float: none;
      }
      .el-tabs--card > .el-tabs__header .el-tabs__nav {
        border: none
      }
      .el-tabs--card > .el-tabs__header {
        border-bottom: none
      }
      .el-tabs--card > .el-tabs__header .el-tabs__item {
        border-top: 1px solid @border-grey;
        border-bottom: 1px solid @border-grey;
        line-height: 34px;
        height: 34px;
        padding: 0 15px;
        color: @font-grey;
        &:first-child {
          border-left: 1px solid @border-grey;
        }
        &:last-child {
          border-right: 1px solid @border-grey;
        }
        &.is-active {
          background-color: @theme-blue;
          color: #fff;
        }
      }
    }
    .cue-content {
      /*position: fixed;*/
      /*right: 150px;*/
      /*bottom: 59px;*/
      position: absolute;
      /*bottom:60px;*/
      right:-56px;
      width:56px;
      /*transition: all 0.5s linear;*/
      li {
        margin-bottom: 28px;
        cursor: pointer;
        .cue {
          width: 54px;
          height: 54px;
          margin-bottom: 7px;
          border-radius: 50%;
          text-align: center;
          line-height: 54px;
          &.green {
            background: @green;
          }
          &.blue {
            .iconfont {
              color: @theme-blue;
            }
          }
          &.black {
            background-color: @font-grey;
          }
          .iconfont {
            font-size: 26px;
            color: #fff;
            &.icon-baogao {
              font-size: 58px;
            }
            &.icon-liebiao {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
  @media screen and (min-width: 1580px){
    .result-display .cue-content {
      left: 50%;
      right: unset;
      margin-left: @view-default/2+60px;
    }
    .app.active .result-display .cue-content {
      margin-left: @view-default/2+130px;
    }
  }

</style>
