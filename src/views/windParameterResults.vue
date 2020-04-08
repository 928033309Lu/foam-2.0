<template>
  <div class="wind-parameter-results">
    <!--<keep-alive>-->
      <router-view/>
    <!--</keep-alive>-->
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'windParameterResults',

}
</script>

<style lang="less">
  .wind-parameter-results{
    width:100%;
    height:100%;
    background:rgba(244,245,247,1);
    display:flex;
    flex-direction: row;
  }
</style>
