<template>
  <div id="layer">
    <div class="side-left" :class="[$route.meta.show?'':'kuan']" v-if="$store.state.userInfo.isadmin!=2">
      <side-bar></side-bar>
    </div>
    <div class="side-right">
      <map-div v-if="mapMode" class="map-div"></map-div>
      <!-- <a-map v-else class="map-div"></!-->
      <nav-header @setShow="setShow"></nav-header>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" class="container"  :class="{'top':$store.state.userInfo.isadmin==2||$route.meta.show}" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" class="container" :class="{'top':$store.state.userInfo.isadmin==2||$route.meta.show}" />
    </div>
    <fix-pwd ref="fixPwd" @submit="changePwd"></fix-pwd>
  </div>
</template>
<script>
  import navHeader from "@/components/header.vue";
  import sideBar from "@/components/sidebar.vue";
  import mapDiv from "@/components/map/map.vue";
  import fixPwd from "@/components/user/fix-pwd.vue";
  import userServices from '@/services/user.service'
  export default {
    components: {
      navHeader,
      sideBar,
      fixPwd,
      mapDiv
    },
    data () {
      return {

      }
    },
    created() {
      window.rootScope = this;
    },
    computed: {
      mapMode () {
        // return this.$store.state.mapMode
        return this.$route.path == '/map/'
      }
    },
    methods:{
      setShow(){
        this.$refs.fixPwd.showDialog();
      },
      changePwd(obj){
        userServices.updatePassword({password:obj.newpassword},obj.oldpassword).then(res => {
          this.$message({
            type: 'success',
            message: '修改密码成功!'
          });
          this.$refs.fixPwd.hideDialog();
        }).catch(err => {
          console.log(err)
        })
      }
    }
  };
</script>
<style lang="less">
  #layer {
    display: flex;
    width:100%;
    height: 100%;
    .side-left{
      width: 90px;
      height: 100%;
      &.kuan{
        width: 120px;
      }
    }
    .side-right{
      flex:1;
      position: relative;
      .container{
        position: absolute;
        left: 0;
        top: 88px;
        width: 100%;
        height: calc(100% - @headerHeight - 38px);
        z-index: 500;
        overflow: auto;
        &.top{
          top:50px;
          height: calc(100% - @headerHeight);
        }
      }
    }
    .map-div{
      width: 100%;
      height: 100vh;
    }
  }
</style>
