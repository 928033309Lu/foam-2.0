<template>
  <div class="img-box">
    <div class="img-container">
      <img :src="src" alt="">
    </div>
    <div class="text">
      <p v-html="text"></p>
    </div>
  </div>
</template>

<script>
  export default {
    name: "img-info",
    props:['src','text']
  }
</script>

<style lang="less">
  .img-box{
    overflow: hidden;
    margin:30px 0;
    .img-container{
      width:280px;
      height:320px;
      margin:0 46px;
      border:1px solid rgba(208,213,216,1);
      box-shadow: 0 0 10px rgba(208,213,216,1);
      display:flex;
      flex-direction: row;
      align-items: center;
      justify-content:center;
    }
    .text{
      width:280px;
      margin:20px auto;
      padding:0 20px;
      font-size:16px;
      color:#0C1C26;
    }
  }

</style>