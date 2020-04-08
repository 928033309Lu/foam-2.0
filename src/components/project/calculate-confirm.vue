<template>
  <el-dialog class="calculate-confirm" title="计算确认" :visible.sync="visible" :modal-append-to-body="false" width="680px" top="90px"
       v-loading="loading"
       element-loading-text="正在计算..."
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-row>
      <el-col class="sectors">
        <ul v-if="sectionInfos.length < 9">
          <li class="title"><span>扇区方向</span><span>热力稳定度</span></li>
          <li v-for="(section, index) in sectionInfos" :key="section.value"><span>{{section.angle}}</span><span>{{section.level}}</span></li>
        </ul>
        <ul v-else class="more-angle">
          <li class="title"><span>扇区方向</span><span>热力稳定度</span></li>
          <li class="title"><span>扇区方向</span><span>热力稳定度</span></li>
          <el-scrollbar style="height: 220px;">
            <div class="clearfix">
              <div class="li-container">
                <li v-for="(section) in sections[0]" :key="section.value"><span>{{section.angle}}</span><span>{{section.level}}</span></li>
              </div>
              <div class="li-container">
                <li v-for="(section) in sections[1]" :key="section.value"><span>{{section.angle}}</span><span>{{section.level}}</span></li>
                <li v-if="sectionInfos.length%2 === 1"></li>
              </div>
            </div>
          </el-scrollbar>
        </ul>
      </el-col>
      <el-col class="qrCode">
        <div class="pic">
          <div class="border">
            <!--<img src="/imgs/qrcode.png" alt="">-->
            <img :src="wxUrl" alt="">
          </div>
        </div>
        <!--<el-checkbox v-model="checked">接受计算进度推送</el-checkbox>-->
        <p style="color: rgba(255,255,255,.7); padding-right: 10px;">扫码关注，接收计算进度推送</p>
      </el-col>
    </el-row>
    <ul class="my-list">
      <li class="title"><span>当前余额</span><span>规则</span></li>
      <li><span style="font-size: 20px;">{{userBalance}}</span><span>定向计算将消耗计算资源，系统将根据每个扇区的计算资源消耗规模扣费，价格为{{unitPrice}}元/核小时。<!--计费规则请<a>查看详情</a>--></span></li>
    </ul>
    <template slot="footer">
      <el-button type="primary" @click="visible = false">取消</el-button>
      <el-button type="primary" @click="caculateRun">确认</el-button>
    </template>
  </el-dialog>
</template>

<script>
  export default {
    name: "calculate-confirm",
    data(){
      return {
        visible: false,
        projectId: this.$route.params.projectId || 1,
        sectionInfos: [],
        checked: true,
        loading: false,
        userBalance: '',
        unitPrice: ''
      }
    },
    props: [
    ],
    computed: {
      wxUrl(){
        let origin = location.origin.includes('localhost') && 'http://goldfoam2-dev.wrinternal.goldwind.com.cn' || location.origin
        // let origin = 'http://goldfoam2-dev.wrinternal.goldwind.com.cn'
        let callurl = `${origin}/api/user-service/users/${this.$store.state.userInfo.userid}/updateOpenid/${new Date().getTime()}`
        return `${origin}/api/wx/${this.$store.state.wx_token}/authorize/qrcode?logo=fengjiang.png&confirm=1&target=${encodeURI(callurl)}`
      }
    },
    created () {
    },
    mounted () {
    },
    methods: {
      getSectionInfo(){
        this.caculateHttps.getSectionInfo(this.projectId).then(res => {
          if(res.sectionInfos.length>9) {
            let arr = [], len = res.sectionInfos.length
            arr.push(res.sectionInfos.slice(0, len%2 ? len/2+1 : len/2))
            arr.push(res.sectionInfos.slice(len%2 ? len/2+1 : len/2))
            this.sections = arr;
          }
          this.userBalance = res.userBalance;
          this.sectionInfos = res.sectionInfos;
          this.unitPrice = res.unitPrice;
        })
      },
      showDialog(){
        this.visible = true
        this.getSectionInfo();
      },
      caculateRun(){
        if(this.loading){
          return;
        }
        this.loading = true;
        this.caculateHttps.caculateRun(this.projectId).then(res => {
          // this.$message("定向计算已完成！")
          this.loading = false
          let detail = JSON.parse(sessionStorage.getItem('detail'))
          detail.status = 2;
          let query = JSON.parse(JSON.stringify(this.$route.query));
          let params = this.$route.query;
          query.status = 2;
          delete query.projectId;
          sessionStorage.setItem('detail',JSON.stringify(detail));
          this.visible = false;
          // this.$router.push({name:"calculate",params:params,query:query});
          this.$router.push({query: query});
        }).catch(err => {
          this.$emit('unshiftError', err.response.data.msg);
          setTimeout(()=>{
            this.$emit('clearError', err.response.data.msg);
          }, 3000)
          // this.$message(err.response.data.msg)
          this.loading = false
          this.visible = false
        })
      }
    }
  }
</script>

<style lang="less">
  .calculate-confirm {
    .el-dialog__body{
      height: 393px;
      overflow: auto;
    }
    .sectors{
      width: 372px;
      height: 247px;
      overflow: hidden;
      border: 1px solid @listColor;
      ul{
        border-bottom: 1px solid @listColor;
        li{
          font-size: 14px;
          color: rgba(255, 255, 255, .7);
          height: 26px;
          line-height: 26px;
          text-align: left;
          /*+li:not(.title){*/
            border-bottom: 1px solid @listColor;
          /*}*/
          span{
            display: inline-block;
            width: 50%;
            padding-left: 16px;
          }
        }
        &.more-angle{
          font-size: 0;
          li.title{
            width: 50%;
            border-bottom: 1px solid @listColor;
            &:first-child{
              border-right: 1px solid @listColor;
            }
          }
          .li-container{
            width: 50%;
            float: left;
            li{
              width: 100%;
            }
            &:first-child{
              border-right: 1px solid @listColor;
            }
          }
          li{
            display: inline-block;
            vertical-align: top;
          }
          .el-scrollbar{
            .el-scrollbar__wrap{
              overflow-x: hidden;
              overflow-y: scroll;
            }
          }
        }
      }
    }
    .qrCode{
      width: 260px;
      padding-left: 50px;
      padding-top: 17px;
      .pic{
        width: 200px;
        height: 200px;
        border: 1px solid @listColor;
        padding: 7px;
        position: relative;
        margin-bottom: 14px;
        img{
          width: 186px;
          height: 186px;
        }
      }
      .pic::before,
      .pic::after,
      .border::before,
      .border::after{
        content: "";
        display: inline-block;
        width: 11px;
        height: 11px;
        position: absolute;
      }
      .pic::before{
        border-top: 3px solid @error;
        border-left: 3px solid @error;
        left: -1px;
        top: -1px;
      }
      .pic::after{
        border-top: 3px solid @error;
        border-right: 3px solid @error;
        right: -1px;
        top: -1px;
      }
      .border::before{
        border-bottom: 3px solid @error;
        border-left: 3px solid @error;
        left: -1px;
        bottom: -1px;
      }
      .border::after{
        border-bottom: 3px solid @error;
        border-right: 3px solid @error;
        right: -1px;
        bottom: -1px;
      }
    }
    .my-list{
      margin-top: 20px;
      border: 1px solid @listColor;
      li{
        font-size: 14px;
        color: rgba(255, 255, 255, .7);
        line-height: 18px;
        padding: 6px 0;
        text-align: left;
        +li{
          border-top: 1px solid @listColor;
        }
        span{
          display: inline-block;
          padding-left: 16px;
          vertical-align: middle;
          &:first-child{
            width: 146px;
          }
          &:last-child{
            width: 480px;
          }
        }
      }
    }
    .el-checkbox__label{
      color: rgba(255, 255, 255, .7)
    }
  }
</style>
