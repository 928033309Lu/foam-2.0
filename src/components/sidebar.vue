
<template>
  <div class="side-bar">
    <div class="logo" :class="{'active':$store.state.userInfo.isadmin==0}" @click="jump">
      <!-- <img src="/imgs/logo.png" alt> -->
    </div>
    <div style="text-align:center" v-if="projectName&&!$route.meta.show">
      <div class="project-name" :title='projectName'>
        {{projectName}}
        <div style="display:flex;margin-top:5px">
          <div class="duan"></div>
          <div class="chang"></div>
        </div>
      </div>
    </div>
    <div>
       <ul class="menus" v-if="$route.meta.show">
      <li
        v-for="(me,index) in menus"
        :key="index"
        @click="selectMenu(index)"
        :class="{active:$route.meta.dir==me.dir,'change-padding':$store.state.userInfo.isadmin==1}"
      >
        <div class="mini-kuang" v-if="me.logo">
          <div class="backg">
            <i :class="me.logo"></i>
          </div>
        </div>
        <div class="name">{{me.name}}</div>
      </li>
    </ul>
    <el-menu
      v-else
      :default-active="$route.meta.dir"
      router
      class="my-menu"
      @open="handleOpen"
      @close="handleClose"
      @select="handleSelect"
      background-color="#002C46"
      text-color="rgba(255,255,255,0.7)"
      active-text-color="#009FFF"
      >
      <el-menu-item index="calculate" :route="{name:'calculate',params:$route.params,query:$route.query}">
        <span slot="title">定向计算</span>
      </el-menu-item>
      
      <el-menu-item v-show='status>=3' index="2" :route="{name:'planList',params:$route.params,query:$route.query}">
        <span slot="title">项目方案</span>
      </el-menu-item>
      <el-submenu index="3">
        <template slot="title">
          <span>地形数据</span>
        </template>
        <el-menu-item index="srtm" :route="{name:'srtm',params:$route.params,query:$route.query}">srtm数据</el-menu-item>
        <el-menu-item index="windMaker"  :route="{name:'windMaker',params:$route.params,query:$route.query}">地图处理</el-menu-item>
      </el-submenu>
      <el-submenu index="4">
        <template slot="title">
          <span>风数据</span>
        </template>
        <el-menu-item index="upload" :route="{name:'upload',params:$route.params,query:$route.query}">数据上传</el-menu-item>
        <el-menu-item index="dataMarking" :route="{name:'dataMarking',params:$route.params,query:$route.query}">数据标记</el-menu-item>
        <el-menu-item index="windParameter" :route="{name:'windParameter',params:$route.params,query:$route.query}">风参展示</el-menu-item>
        <el-menu-item index="dataDownload" :route="{name:'dataDownload',params:$route.params,query:$route.query}">结果导出</el-menu-item>
      </el-submenu>
      <el-menu-item index="wrf" :route="{name:'wrfTable',params:$route.params,query:$route.query}">
        <span slot="title">气象仿真</span>
      </el-menu-item>
    </el-menu>
    <router-link class="el-footer" v-if="$store.state.userInfo.isadmin==0&&$route.path!='/'&&$route.path!='/project/list'&&$route.path!='/project/storehouse'&&$route.path!='/project/personalhouse'" to="/project/list">
      <i class="iconfont iconfanhui"></i>
      <span>项目列表</span>
    </router-link>
    </div>
   
  </div>
</template>

<script>
import { menus } from "@/config/menu.config.js";
import { EventBus } from "@/config/event-bus.js";
export default {
  data() {
    return {
      status:sessionStorage.getItem("status"),
      menus: [],
      current: 0,
      projectName: sessionStorage.getItem("projectName"),
      windShow:true,
    };
  },
  props: {},
  computed: {},
  created(){
    EventBus.$on('addition', param => {
      this.projectName = param.projectName;
      this.status=param.status;
      sessionStorage.setItem("status",param.status)
    })
  },
  mounted() {
    this.menus = menus.filter(item=>{
      return item.type==this.$store.state.userInfo.isadmin;
    })
  },
  methods: {
    toWind(){

      let routeUrl = this.$router.resolve({
          name: "windMaker",
          query: this.$route.query,
          param:this.$route.params,
     });
     window.open(routeUrl .href, '_blank');
     
    },
    handleOpen(){

    },
    handleClose(){

    },
    handleSelect(key, keyPath) {
        // console.log(key, keyPath);
      },
    selectMenu(index) {
      this.current = index;
      this.$router.push(this.menus[index].link);
    },
    jump(){
      if(this.$store.state.userInfo.isadmin==0){
        this.$router.push('/project/list');
      }
    }
  },
  watch: {}
};
</script>
<style lang="less" rel="stylesheet/less">
.side-bar {
  height: 100%;
  background: @sideBlack;
  position:relative;
  .duan {
    width: 10px;
    .borsin(bottom, @highColor, 3px);
  }
  .chang {
    position:relative;
    top:-1px;
    flex: 1;
    .borsin(bottom, @highColor);
  }
  .project-name {
    display: inline-block;
    width: 100px;
    padding-top: 17px;
    margin: 0 10px;
    color: @highColor;
    font-size: 14px;
    text-align: center;
    overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
    margin-bottom: 16px;
  }
  .logo {
    height: 50px;
    background: url(/imgs/login2/logo-header.png) no-repeat;
    background-position: center center;
    background-size:50px 22px;
    .bor();
    padding-top: 13px;
    text-align: center;
    &.active{
      cursor:pointer;
    }
  }
  .el-menu{
    .el-menu-item.is-active{
      color: rgb(0, 159, 255) !important;
      background-color: rgb(0, 44, 70) !important;
    }
  }
  .menus {
    padding-top: 22px;
    color: @whiteColor;
    text-align: center;
    .active {
      color: @highColor;
      .mini-kuang {
        background: url("/imgs/btn.png") no-repeat;
        background-size: 100% 100%;
        width: 48px;
        height: 48px;
      }
    }
    li {
      padding: 20px 0;
      cursor: pointer;
      &.change-padding{
        padding:10px 0;
      }
      .mini-kuang {
        padding: 6px 0;
        margin: 0 21px;
      }
      .name {
        /*padding-top: 10px;*/
      }
      &:active {
        color: @highColor;
      }
    }
    li:nth-child(1) {
      .iconfont {
        font-size: 30px;
        line-height: 36px;
      }
    }
    li:nth-child(2) {
      .iconfont {
        font-size: 32px;
      }
    }
    li:nth-child(3) {
      .iconfont {
        font-size: 28px;
      }
    }
  }
  .el-footer{
    position:absolute;
    left:0;
    bottom:0;
    padding:0;
    border-top:1px solid rgba(22,34,38,1);
    width:100%;
    height:59px;
    line-height:59px;
    text-align:center;
    color: rgba(255, 255, 255, 0.7);
    cursor:pointer;
    i{
      margin-right:8px;
    }
  }
}
</style>
