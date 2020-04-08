<template>
  <div class="advantage-box">
    <div class="img-container" :style="{'width':width+'px'}">
      <div class="gray" :class="{'active':(((scrollTop+300)/2)>screenHeight && src1)}">
        <img :src="src" alt="">
      </div>
      <img :src="src1" alt="">
    </div>
    <div class="text" :class="{'active':(((scrollTop+300)/2)>screenHeight && src1)}">
      <p v-html="text"></p>
    </div>
  </div>
</template>

<script>
  export default {
    name: "img-info",
    props:['src','text','src1','width','screenHeight','scrollTop']
  }
</script>

<style lang="less">
  .advantage-box{
    overflow: hidden;
    margin:0 44px;
    .img-container{
      width:130px;
      display:flex;
      flex-direction: row;
      align-items: center;
      justify-content:center;
      position:relative;
      .gray{
        width:100%;
        overflow: hidden;
        max-height:200px;
        transition: max-height 2s;
        position:absolute;
        left:0;
        top:0;
        z-index:2;
        background:#060607;
        &.active{
          max-height:0px;
        }
      }
      img:nth-child(1){
        width:100%;
      }
      img:nth-child(2){
        width:100%;
        position:relative;
      }
    }
    .text{
      width:130px;
      font-size:14px;
      color:#F2F2F2;
      margin:60px 0 80px;
      opacity:0;
      transition: opacity 2s;
      &.active{
        opacity: 1;
      }
    }
  }

</style>