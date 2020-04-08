<template>
  <div class="dataProcess" >

    <!--<keep-alive>-->
      <router-view/>
    <!--</keep-alive>-->
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'dataProcess',

}
</script>

<style lang="less">
  .dataProcess{
    width:100%;
    height:100%;
    padding:10px;
    display:flex;
    flex-direction: row;
  }
</style>
