<template>
  <div class="data-column">
    <div class="select-radio">
      <span>时间间隔：</span>
      <el-radio-group v-model="radio">
        <el-radio label="TEN_MIN">10min</el-radio>
        <!--<el-radio label="ONE_HOUR">60min</el-radio>-->
      </el-radio-group>
    </div>
    <signal-model title="风速" :choose-list='columnData.typeSpeed' @changeSpeedColumn="changeSpeedColumnHandle"></signal-model>
    <signal-model title="风向" v-show="columnData.typeDirection" :choose-list='columnData.typeDirection' @changeDirColumn="changeDirColumnHandle"></signal-model>
    <signal-model title="其他" :choose-list='columnData.typeOther' @changeOtherColumn="changeSpeedOtherHandle"></signal-model>
  </div>
</template>

<script>
  import signalModel from './signal/signal-model.vue'
  export default {
    name: "data-column",
    data(){
      return {
        radio:'TEN_MIN',
        speedColumns:[],
        directionColumns:[],
        otherColumns:[]
      }
    },
    components:{
      signalModel
    },
    props:[
      'columnData'
    ],
    computed:{
      columns(){
        return [].concat(this.speedColumns).concat(this.directionColumns).concat(this.otherColumns);
      }
    },
    watch:{
      'radio'(n){
        this.$emit('update:timeInterval',n);
      },
      'columns':{
        handler(cur,old){
          this.$emit('update:columnsArr',cur);
        },
        deep:true
      }
    },
    methods: {
      changeSpeedColumnHandle(arr){
        this.speedColumns = [].concat(arr);
      },
      changeDirColumnHandle(arr){
        this.directionColumns = [].concat(arr);
      },
      changeSpeedOtherHandle(arr){
        this.otherColumns = [].concat(arr);
      }
    }
  }
</script>

<style scoped lang="less">
  .data-column{
    width:100%;
    overflow: hidden;
    padding:0 20px;
    .select-radio{
      margin:25px 0;
    }
  }
</style>