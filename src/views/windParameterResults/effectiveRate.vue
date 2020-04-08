<template>
  <div class="effective-rate" v-loading.fullscreen="loading" element-loading-text="数据加载中，请稍后..." element-loading-background="rgba(0, 0, 0, 0.8)">
    <ul class="header-tip" v-if="tipFlag">
      <li>
        <i class="iconfont icon-warn"></i>
        <span>提示：数据量不足1年时，系统将按1年计算有效率；数据量在1-2年之间时，系统将按2年计算有效</span>
      </li>
      <li>
        <i class="iconfont iconguanbi" @click="tipFlag=false"></i>
      </li>
    </ul>
    <ul class="choose-time">
      <li>时间推荐：</li>
      <li>
        <el-date-picker
          v-model="timeValue"
          align="left"
          value-format="yyyy/MM/dd HH:mm"
          :unlink-panels="true"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['12:00:00']">
        </el-date-picker>
      </li>
      <li>
        <el-button class="calculate-btn" @click="getEffectiveData">开始计算</el-button>
      </li>
    </ul>
    <div class="wind-frequency">
      <div class="title">有效率统计</div>
      <div class="table-box table-info effective-table">
        <el-table
          ref="table"
          :data="resultData.allData"
          :highlight-current-row="true"
          :row-class-name="setClass"
          empty-text="暂无数据"
          fit
          @row-click="clickRow">
          <el-table-column
            prop="type"
            :show-overflow-tooltip="true"
            label="信号属性"
            min-width="100">
            <template slot-scope="scope">
              <span>{{scope.row.type=='DIRECTION'?'风向':'风速'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="height"
            label="高度(m)"
            min-width="90">
          </el-table-column>
          <el-table-column
            prop="allDataCount"
            label="应有数据"
            min-width="90">
          </el-table-column>
          <el-table-column
            prop="missingCount"
            label="缺测数据"
            min-width="90">
          </el-table-column>
          <el-table-column
            prop="invalidCount"
            label="无效数据"
            min-width="90">
          </el-table-column>
          <el-table-column
            prop="effectRate"
            label="有效率"
            min-width="90">
            <template slot-scope="scope">
              <span>{{(scope.row.effectRate*100).toFixed(2)+'%'}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="wind-all-data">
      <div class="title">
        数据完整率
        <ul class="title-right" v-if="resultData.allData">
          <li>
            信号：{{resultData.allData[activeRowIndex].type}}
          </li>
          <li class="line"></li>
          <li>
            高度：{{resultData.allData[activeRowIndex].height + 'm'}}
          </li>
        </ul>
      </div>
      <div class="detail-data">
        <ul class="detail-header">
          <li>年/月</li>
          <li>完整率</li>
          <li class="num" v-for="num in 31">{{num}}</li>
        </ul>
        <ul class="detail-body">
          <li v-for="item in actvieDetailData">
            <ul class="row-detail">
              <li>{{item.year+'/'+item.month}}</li>
              <li class="vild-data" :class="{'not-full':item.integrity<1}">{{(item.integrity*100).toFixed(2)+'%'}}</li>
              <li class="num" :class="{'vild-data':son>0,'zero-data':(son==0),'not-full':son&&son<144}" v-for="son in item.data">{{son}}</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  export default{
    name:'effectiveRate',
    data(){
      return {
        loading:false,
        tipFlag:true,
        projectId:this.$route.params.projectId,
        fileInfo: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'fileInfo')) || "",
        timeValue:[],
        tableData:[],
        activeRowIndex:0,
        resultData:{},
        actvieDetailData:[]
      }
    },
    computed: {
      ensureId(){
        return this.fileInfo?this.fileInfo.ensureId:"";
      }
    },
    mounted(){
      this.$set(this.timeValue, 0, this.changeTimeType(new Date(this.fileInfo.startDateTime)));
      this.$set(this.timeValue, 1, this.changeTimeType(new Date(this.fileInfo.endDateTime)));
      this.getEffectiveData();
    },
    methods:{
      changeTimeType(time){
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        return year+'/'+this.addZero(month)+'/'+this.addZero(day)+' '+this.addZero(hour)+':'+this.addZero(minute);
      },
      addZero(num){
        return num>9?num:('0'+num);
      },
      setClass({row, rowIndex}){
        row.index = rowIndex;
        //return rowIndex%2==1?'activeOne':'activeTwo';
        return row.type=='SPEED'?'activeThree activeOne':'activeFour activeTwo';
      },
      clickRow(row, column, event){
        this.activeRowIndex = row.index;
        this.resultData.detailData.forEach(item=>{
          if(item.columnNumber == this.resultData.allData[this.activeRowIndex].columnNumber){
            this.actvieDetailData = item.monthData;
          }
        })
      },
      getEffectiveData(){
        this.loading = true;
        this.https.getEffectiveData(this.ensureId,this.timeValue[0],this.timeValue[1]).then(res => {
          this.resultData = Object.assign({},res);
          setTimeout(()=>{
            this.activeRowIndex = 0;
            this.$refs.table.setCurrentRow(this.resultData.allData[0]);
            this.resultData.detailData.forEach(item=>{
              if(item.columnNumber == this.resultData.allData[this.activeRowIndex].columnNumber){
                this.actvieDetailData = item.monthData;
              }
            })
            this.loading = false;
          },100);
        }).catch(err => {
          console.log(err);
          this.loading = false;
        })
      }
    }
  }
</script>
<style lang="less">
  .effective-rate{
    width:100%;
    overflow: hidden;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-bottom:14px;
    position:relative;
    .header-tip{
      width:100%;
      height:22px;
      background:rgba(243,206,146,.2);
      color:#DA6D24;
      overflow: hidden;
      padding:0 20px;
      line-height:22px;
      font-size:10px;
      li{
        overflow: hidden;
        &:nth-child(1){
          float:left;
          display:flex;
          flex-direction: row;
          align-items: center;
        }
        &:nth-child(2){
          float:right;
        }
        .icon-warn{
          color:#ED7627;
        }
        .iconguanbi{
          color:#B2B3C6;
          font-size:8px;
          cursor:pointer;
        }
      }
    }
    .choose-time{
      width:550px;
      height:30px;
      display:flex;
      flex-direction: row;
      align-items: center;
      margin:14px 0 14px 24px;
      color:rgba(255,255,255,.7);
      .el-date-editor{
        width:380px;
        margin:0 10px;
        &.el-input__inner{
          height:30px;
          line-height:30px;
          color:#fff;
          background:transparent;
          border-color:#245E80;
          .el-range-separator,.el-range__icon{
            line-height:23px!important;
            color:#fff;
          }
          .el-range-input{
            color:#fff;
            background:transparent;
            border-color:#245E80;
          }
        }
        .el-range__close-icon{
          display:none!important;
        }
      }
      .calculate-btn{
        width:80px;
        height:30px;
        color: rgba(255,255,255,.7);
        background: rgba(3,73,114,1);
        border-radius: 2px;
        padding:0;
        line-height:30px;
        border:none;
        &:focus, &:hover {
          border: none;
          background-color: rgba(3,73,114,1);
          opacity: 1;
        }
      }
    }
    .title{
      color:rgba(255,255,255,.7);
      line-height:22px;
      text-align:left;
      .title-right{
        float:right;
        font-size:14px;
        color:rgba(255,255,255,.7);
        display:flex;
        flex-direction: row;
        align-items: center;
        li:nth-child(1),li:nth-child(3){

        }
        li:nth-child(2){
          width:1px;
          height:18px;
          background:#D2D2D2;
          margin:0 20px;
        }
      }
    }
    .wind-frequency,.wind-all-data{
      width:100%;
      overflow: hidden;
      padding:0 24px;
      .table-box{
        width:550px;
        th,td{
          padding:3px 0;
        }
      }
    }
    .detail-data{
      width:100%;
      overflow: hidden;
      margin-top:10px;
      .detail-header{
        width:100%;
        height:28px;
        line-height:28px;
        border-top:1px solid rgba(3,73,114,1);
        border-bottom:1px solid rgba(3,73,114,1);
        display:flex;
        flex-direction: row;
        align-items: center;
        li{
          background:#F0F3F8;
          min-width:30px;
          flex:1;
          height:100%;
          text-align:center;
          line-height:26px;
          font-size:12px;
          border-right:1px solid rgba(3,73,114,1);
          &:last-child{
            border:none;
          }
          &:first-child{
            min-width:80px;
            width:80px;
          }
          &:nth-child(2){
            min-width:80px;
            width:80px;
          }
        }
      }
      .detail-body{
        >li{
          border-bottom:1px solid rgba(3,73,114,1);
        }
      }
      .row-detail{
        display:flex;
        flex-direction: row;
        align-items: center;
        height:28px;
        li{
          min-width:30px;
          flex:1;
          height:100%;
          text-align:center;
          line-height:26px;
          font-size:12px;
          border-right:1px solid rgba(3,73,114,1);
          &:last-child{
            border:none;
          }
          &:first-child{
            min-width:80px;
            width:80px;
            color:rgba(255,255,255,.7);
          }
          &:nth-child(2){
            min-width:80px;
            width:80px;
          }
          &.vild-data{
            background:#E6FFEC;
          }
          &.zero-data{
            background:#F98989!important;
          }
          &.not-full{
            background:#FFF7A5;
          }
        }
      }
    }
  }
</style>