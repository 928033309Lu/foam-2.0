<template>
  <div class="ewt">
    <ul class="select-group">
      <li>
        <label>风速：</label>
        <el-select v-model="speedValueEwt" placeholder="请选择" @change="setSpeedValue">
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
        <el-select v-model="directionValueEwt" placeholder="请选择" @change="setDirValue">
          <el-option
            v-for="item in columnData.typeDirection"
            :key="item.columnNumber"
            :label="item.height+'m'+(item.cedian=='DEFAULT'?'':item.cedian)"
            :value="item.columnNumber">
          </el-option>
        </el-select>
      </li>
      <li>
        <label>代表年相关性：</label>
        <el-input v-model="relevanceValue" placeholder="请输入内容"></el-input>
      </li>
      <li>
        <label>代表年订正系数：</label>
        <el-input v-model="reviseValue" placeholder="请输入内容"></el-input>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "ewt",
    data(){
      return {
        speedValueEwt:'',
        directionValueEwt:'',
        relevanceValue:1,
        reviseValue:1
      }
    },
    props:['columnData'],
    watch:{
      columnData:{
        handler(curVal, oldVal){
          this.speedValueEwt = this.columnData.typeSpeed[0].columnNumber;
          this.directionValueEwt = this.columnData.typeDirection?this.columnData.typeDirection[0].columnNumber:'';
        },
        deep:true
      },
      'relevanceValue'(n){
        this.$emit('update:relevanceValue',n);
      },
      'reviseValue'(n){
        this.$emit('update:reviseValueE',n);
      },
    },
    methods:{
      setSpeedValue(){
        this.$emit('update:speedValueE',this.speedValueEwt);
      },
      setDirValue(){
        this.$emit('update:directionValueE',this.directionValueEwt);
      }
    }
  }
</script>

<style lang="less">
  .ewt{
    width:100%;
    overflow: hidden;
    background:rgba(250,250,251,1);
    padding:25px 20px 22px;
    .select-group{
      width:252px;
      text-align:right;
      li:not(:last-child){
        margin-bottom:12px;
      }
      .el-select,.el-input{
        width:140px;
      }
    }
  }
</style>