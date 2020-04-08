<template>
  <div class="tim">
    <ul class="select-group">
      <li>
        <!--<div class="select-radio">-->
          <label>时间间隔：</label>
          <el-radio-group v-model="radio">
            <el-radio label="TEN_MIN">10min</el-radio>
            <!--<el-radio label="ONE_HOUR">60min</el-radio>-->
          </el-radio-group>
        <!--</div>-->
      </li>
      <li>
        <label>风速：</label>
        <el-select v-model="speedValueTim" placeholder="请选择" @change="setSpeedValue">
          <el-option
            v-for="item in columnData.typeSpeed"
            :key="item.columnNumber"
            :label="item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian)"
            :value="item.columnNumber">
          </el-option>
        </el-select>
      </li>
      <li>
        <label>风向：</label>
        <el-select v-model="directionValueTim" placeholder="请选择" @change="setDirValue" :isabled="!columnData.typeDirection">
          <el-option
            v-for="item in columnData.typeDirection"
            :key="item.columnNumber"
            :label="item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian)"
            :value="item.columnNumber">
          </el-option>
        </el-select>
      </li>
      <li>
        <label>代表年订正系数：</label>
        <el-input v-model="reviseValue" placeholder="请输入内容" :class="{'error':yearFlag}"></el-input>
        <span v-if="yearFlag" style="color:#FF2E76;margin-left:5px;">请输入数字</span>
      </li>
      <li>
        <label>是否包含SD列：</label>
        <el-checkbox v-model="checked"></el-checkbox>
      </li>
    </ul>
    <el-table
      :data="tableData"
      border
      style="width: 360px">
      <el-table-column
        prop="title"
        label=""
        width="160">
      </el-table-column>
      <el-table-column
        prop="before"
        label="订正前"
        width="100">
        <template slot-scope="scope">
          <span>{{(scope.$index==1)?scope.row.before.toFixed(2):scope.row.before}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="after"
        label="订正后">
        <template slot-scope="scope">
          <span>{{(scope.$index==1)?scope.row.after.toFixed(2):scope.row.after}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  export default {
    name: "tim",
    data(){
      return {
        radio:'TEN_MIN',
        speedValueTim:'',
        directionValueTim:'',
        reviseValue:1,
        tableData: [],
        checked:true,
          yearFlag:false
      }
    },
    props:['columnData','timData'],
    watch:{
      'radio'(n){
        this.$emit('update:timeInterval',n);
      },
      'checked'(n){
        this.$emit('update:checkedT',n);
      },
      columnData:{
        handler(curVal, oldVal){
          this.speedValueTim = this.columnData.typeSpeed[0].columnNumber;
          this.directionValueTim = this.columnData.typeDirection?this.columnData.typeDirection[0].columnNumber:'';
        },
        deep:true
      },
      timData:{
        handler(curVal, oldVal){
          this.tableData = [{
            title: '数据量',
            before: this.timData.periodCount,
            after: this.timData.periodCount
          }, {
            title: '平均风速',
            before: this.timData.speedAvg,
            after: this.timData.speedAvg*this.reviseValue
          }, {
            title: '方向',
            before: this.timData.mainDirection,
            after: this.timData.mainDirection
          }, {
            title: '是否含有方向差列',
            before: this.timData.sppeedHasSd?'是':'否',
            after: this.timData.sppeedHasSd?'是':'否'
          }]
        },
        deep:true
      },
      'directionValue'(n){
        this.directionValueTim = n;
      },
      'speedValue'(n){
        this.speedValueTim = n;
      },
      'reviseValue'(n){
          let reg = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/;
          if (!reg.test(n)) {
              this.yearFlag = true;
              return;
          }else{
              this.yearFlag = false;
          }
        this.tableData = [{
          title: '数据量',
          before: this.timData.periodCount,
          after: this.timData.periodCount
        }, {
          title: '平均风速',
          before: this.timData.speedAvg,
          after: this.timData.speedAvg*this.reviseValue
        }, {
          title: '方向',
          before: this.timData.mainDirection,
          after: this.timData.mainDirection
        }, {
          title: '是否含有方向差列',
          before: this.timData.sppeedHasSd?'是':'否',
          after: this.timData.sppeedHasSd?'是':'否'
        }]

        this.$emit('update:reviseValue',n);
      }
    },
    methods:{
      setSpeedValue(){
        this.$emit('update:speedValue',this.speedValueTim);
      },
      setDirValue(){
        this.$emit('update:directionValue',this.directionValueTim);
      },
        checkYearFlag(){
          return this.yearFlag;
        }
    }
  }
</script>

<style lang="less">
  .tim{
    width:100%;
    overflow: hidden;
    padding:25px 20px 22px;
    .select-group{
      width:350px;
      text-align:right;
      li:not(:last-child){
        margin-bottom:12px;
      }
      li:last-child{
        margin-bottom:23px;
      }
      .el-select,.el-input{
        width:140px;
        .el-input__inner{
          height:32px;
          line-height:30px;
          background:transparent;
          border-color:rgba(3,73,114,1);
          color:rgba(255,255,255,.7);
        }
        &.error{
          .el-input__inner{
            border-color:@error;
          }
        }
      }
      li{
        text-align:left;
        label:nth-child(1){
          text-align:right;
          display:inline-block;
          width:112px;
        }
        .el-radio-group{
          text-align:left;
          .el-radio{
            text-align:left;
            &:nth-child(1){
              margin:0;
              width:80px;
            }
          }
        }
      }
    }
    .el-table--border{
      border-color:rgba(3,73,114,1);
    }
    .el-table{
      background:transparent;
      &:before,&:after{
        background:rgba(3,73,114,1);
      }
      tr{
        background:transparent;
        td, th{
          padding:0;
          height:30px;
          background:transparent;
          border-color:rgba(3,73,114,1);
          .cell{
            padding-left:20px!important;
            color:rgba(255,255,255,.7);
          }
        }
      }
      .el-table__body tr:hover>td{
        background-color: transparent;
      }
    }

  }
</style>