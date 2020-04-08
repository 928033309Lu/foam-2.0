<template>
  <div class="border-box" :class="className">
    <span class="title">{{title}}</span>
    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
    <div style="margin: 15px 0;"></div>
    <el-checkbox-group v-model="checkedOptions" @change="handleCheckedCitiesChange">
      <el-checkbox v-for="item in chooseList" :label="item.columnNumber" :key="item.columnNumber">{{item.type+' '+item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian)}}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
  export default {
    name: "signal-model",
    props:[
      'title',
      'className',
      'chooseList'
    ],
    data(){
      return {
        checkAll: true,
        checkedOptions: [],
        isIndeterminate: false
      }
    },
    watch:{
      chooseList: {
        handler(curVal, oldVal) {
          this.checkedOptions = [];
          _.map(this.chooseList,item=>{
            this.checkedOptions.push(item.columnNumber);
          })
        },
        deep: true
      },
      checkedOptions: {
        handler(curVal, oldVal) {
          if(this.title=="风速"){
            this.$emit('changeSpeedColumn',curVal)
          }else if(this.title=="风向"){
            this.$emit('changeDirColumn',curVal)
          }else{
            this.$emit('changeOtherColumn',curVal)
          }
        },
        deep: true
      }
    },
    mounted(){

    },
    methods:{
      handleCheckAllChange(val) {
        this.checkedOptions = val ? this.chooseList.map(item=>{
          return item.columnNumber;
        }) : [];
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.chooseList.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.chooseList.length;
      }
    }
  }
</script>

<style scoped lang="less">
  .border-box{
    width:100%;
    min-height:88px;
    border:1px dashed #034972;
    border-radius:2px;
    position:relative;
    padding:23px 0 20px 28px;
    margin-bottom:20px;
    .title{
      position:absolute;
      left:23px;
      top:-10px;
      display:block;
      padding:0 5px;
    }
  }
</style>