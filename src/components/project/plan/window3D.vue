<template>
  <el-dialog class="window3D" title="三维展示" :visible.sync="visible" :modal-append-to-body="false"
             :close-on-click-modal="false" width="680px" top="90px">
    <el-form ref="form" :model="form" label-width="230px" class="my-form" size="mini">
      <el-form-item label="发电量结果">准备完毕</el-form-item>
      <el-form-item label="风图谱">
        <span :class="isVtk == 3 && 'error'">{{wrgHeight && status.vtk[isVtk] || '未设置绘图高度，无法展示'}}</span>
        <!--<el-button class="submit-btn" @click="getCreditData">计算</el-button>-->
        <el-button @click="goMap3d" class="submit-btn view">查看</el-button>
      </el-form-item>
      <el-form-item label="测风塔置信度">
        <span class="status-text" :class="isWindMast == 2 && 'error'">{{status.windmast[isWindMast]}}</span>
        <el-button v-if="isWindMast!=1" class="submit-btn" @click="getCreditData" :disabled="isWindMast==0">计算</el-button>
      </el-form-item>
      <el-form-item label="噪声图谱">
        <span class="status-text" :class="isNoise == 2 && 'error'">{{status.noise[isNoise]}}</span>
        <el-button v-if="isNoise!=1" class="submit-btn" @click="getNoiseData" :disabled="isNoise==0">计算</el-button>
      </el-form-item>
      <div class="share-link">
        <div v-if="!form.shareId" class="no-share">
          <el-form-item label="分享有效期设置" prop="duration" required :rules="{ validator: validateDuration, trigger: ['blur', 'change'] }">
            <el-input-number type="text" v-model.trim="form.duration" controls-position="right" :min="1"></el-input-number> 天
            <!--<el-checkbox  v-model="form.isSecret">加密</el-checkbox>-->
            <el-button class="submit-btn" @click="createLink" style="margin-left: 30px;">生成链接</el-button>
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="链接有效期至" label-width="185px">
            <span style="display: inline-block; width: 120px;">{{form.enddate}}</span>
            <el-button class="submit-btn" @click="renewal(7)">续期7天</el-button>
            <el-button class="submit-btn" @click="renewal(30)">续期30天</el-button>
          </el-form-item>
          <el-form-item label-width="0">
            <el-input disabled class="link" v-model="link"></el-input>
            <el-button class="submit-btn"
               v-clipboard:copy="link"
               v-clipboard:success="onCopy"
               v-clipboard:error="onError">复制链接</el-button>
            <el-button class="submit-btn" @click="innerVisible = true">删除分享</el-button>
          </el-form-item>
          <el-form-item v-if="form.accessPwd" label="访问密码">
            <el-input disabled class="pwd" v-model="form.accessPwd"></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <div class="my-dialog" v-if="innerVisible">
      <div class="el-dialog" style="margin-top: 90px; width: 400px;">
        <div class="el-dialog__header"><span class="el-dialog__title">提示</span>
          <el-button type="text" class="el-dialog__headerbtn" @click="innerVisible = false"><i
              class="el-dialog__close el-icon el-icon-close"></i></el-button>
        </div>
        <div class="el-dialog__body">
          <p>删除后，当前分享链接将失效，无法查看，是否继续？</p>
        </div>
        <div class="el-dialog__footer">
          <el-button type="primary" @click="innerVisible = false">取消</el-button>
          <el-button type="primary" @click="delLink">确定</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import userServices from '@/services/user.service'
  import map3dServices from '@/services/map3d.service'
  
  export default {
    name: "window3D",
    data(){
      return {
        visible: false,
        projectId: this.$route.params.projectId,
        id: this.$route.params.id,
        form: {
          duration: 7,
          isSecret: false,
          link: '',
          accessPwd: '',
          enddate: '',
          shareId: ''
        },
        isNoise: false,
        isWindMast: false,
        isVtk: 0,
        wrgHeight: '',
        status: {
          noise: {
            0: '计算中',
            1: '计算完成',
            2: '计算失败',
          },
          windmast: {
            0: '计算中',
            1: '计算完成',
            2: '计算失败',
          },
          vtk: {
            0: '未计算',
            1: '计算中',
            2: '计算完成',
            3: '计算异常'
          }
        },
        innerVisible: false,
        timer: null
      }
    },
    props: {
      scheme: {
        type: Object,
        default: ()=>{return {}}
      },
      disabled: {
        default: false
      }
    },
    computed: {
      link(){
        return `${location.origin}/map3d/index.html#/index/${this.projectId}/${this.id}?shareId=${this.form.shareId}`
      }
    },
    watch: {
      visible(cur){
        if(!cur){
          clearTimeout(this.timer);
          this.timer=null;
        }
      }
    },
    mounted(){
    },
    methods: {
      showDialog(id){
        this.id = id
        this.form = Object.assign(this.form, {
          shareId: '',
          accessPwd: '',
          enddate: ''
        })
        this.visible = true;
        this.getShare();
        this.getStatus();
      },
      //噪声图谱
      getNoiseData(){
        this.isNoise = 0
        map3dServices.getNoiseData(this.id).then(() => {
          this.getStatus('isNoise');
        }).catch(()=>{
          this.isNoise = 2
        })
      },
      //测风塔置信度
      getCreditData(){
        this.isWindMast = 0
        map3dServices.getCreditData(this.id).then(() => {
          this.getStatus('isWindMast')
        }).catch(()=>{
          this.isWindMast = 2
        })
      },
      getStatus(name){
        let vm = this;
        map3dServices.getStatus(this.id).then(res => {
          // if(name){
          //   this[name] = res[name]
          // }else{
          this.isNoise = res.isNoise
          this.isWindMast = res.isWindMast
          this.isVtk = res.isVtk
          this.wrgHeight = res.wrgHeight
          // }
          if(this.isNoise === 0 || this.isWindMast === 0 || this.isVtk===1){
            vm.timer = setTimeout(()=>{
              vm.getStatus()
            }, 1000)
          }
        })
      },
      // 获取分享信息
      getShare(){
        userServices.getShare({
          projectId: this.projectId,
          schemeId: this.id
        }).then(res => {
          if(res && res.shareId){
            this.form.shareId = res.shareId
            this.form.enddate = res.enddate
            this.form.accessPwd = res.accessPwd
          }
        }).catch(err=>{
          console.log(err && err.msg)
        })
      },
      goMap3d(){
        // let routeUrl = this.$router.resolve({name: 'map-view', params: {projectId: this.projectId, id: this.id}})
        // window.open(routeUrl.href, '_blank');
        
        // let routeUrl = this.$router.resolve({name: 'map-view', params: {projectId: this.projectId, id: this.id}})
        // todo:分环境
        // let url = `http://52.83.252.242:84/#/index/${this.projectId}/${this.id}/${localStorage.getItem('isadmin') || 0}/${localStorage.getItem('token')}`
        let url = `/map3d/index.html#/index/${this.projectId}/${this.id}`
        console.log(url)
        window.open(url, '_blank');
        
      },
      // 生成分享链接
      createLink(){
        if(!this.form.duration || this.form.duration<7 || this.form.duration>30) return
        userServices.createShareId({
          projectId: this.projectId,
          schemeId: this.id,
          duration: this.form.duration,
          isSecret: this.form.isSecret && 1 || 0,
        }).then(res => {
          let origin = location.origin.includes('localhost') && 'http://goldfoam2-dev.wrinternal.goldwind.com.cn' || location.origin
          this.form = Object.assign(this.form, {
            link: origin+'/map3d/542/530?shareid='+ res.shareId,
            accessPwd: res.accessPwd,
            enddate: res.enddate,
            shareId: res.shareId
          })
        })
        
      },
      // 续期
      renewal(days){
        userServices.delayShareId({
          shareId: this.form.shareId,
          duration: days,
        }).then(res => {
          this.$set(this.form, 'enddate', res)
        })
      },
      onCopy(){
        this.$message.success("已复制到粘贴板！")
      },
      onError(){
        this.$message.error("您的电脑不支持此功能，请手动复制！")
      },
      // 删除分享id
      delLink(){
        let params = {
          shareId: this.form.shareId
        }
        this.form.accessPwd && (params.accessPwd = this.form.accessPwd)
        userServices.deleteShareId(params).then(() => {
          this.innerVisible = false
          this.form = Object.assign(this.form, {
            shareId: '',
            accessPwd: '',
            enddate: ''
          })
        })
      },
      validateDuration(rule, value, callback){
        if (isNaN(Number(value)) || value < 7 || value >30) {
          callback(new Error('请输入7-30的整数！'));
        } else {
          this.form.duration = parseInt(value)
          callback();
        }
      },
    },
    destroyed(){
      clearTimeout(this.timer);
      this.timer=null;
    },
  }
</script>

<style lang="less">
  .window3D{
    >.el-dialog{
      >.el-dialog__body{
        position: relative;
      }
    }
    .el-dialog__body{
      padding-top: 10px;
    }
    .error{
      color: @error;
    }
    .el-form{
      position: relative;
      color: @whiteColor;
      padding-top: 40px;
      .el-form-item{
        margin-bottom: 6px;
        .status-text{
          display: inline-block;
          width: 92px;
          &.error{
            color: @error;
          }
        }
      }
      .el-form-item__label{
        &::after{
          content: "：";
        }
      }
      .el-button{
        +.el-button{
          margin-left: 10px;
        }
        &.view{
          position: absolute;
          right: 150px;
          top: -3px;
          width: 60px;
          height: 60px;
          padding-left: 17px;
          z-index: 1;
        }
      }
      
      .share-link{
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px dashed @inputColor;
        .no-share{
          padding-top: 30px;
          padding-bottom: 40px;
        }
        .el-input{
          &.link{
            width: 320px;
            margin-left: 70px;
            margin-right: 10px;
          }
          &.pwd{
            width: 100px;
          }
          &.is-disabled{
            .el-input__inner{
              cursor: text;
            }
          }
        }
        .el-checkbox{
          margin-left: 40px;
          margin-right: 0;
          .el-checkbox__input{
            border-color: @inputColor;
            background: transparent;
            border-radius: 50%;
            .el-checkbox__inner{
              &::after{
                display: none;
              }
            }
            &.is-checked{
              .el-checkbox__inner{
                &::after{
                  display: inline-block;
                  border: none;
                  width: 6px;
                  height: 6px;
                  background-color: @highColor;
                  transform: unset;
                  transition: unset;
                  border-radius: 6px;
                  top: 3px;
                  left: 3px;
                }
              }
            }
          }
          .el-checkbox__label{
            color: @whiteColor;
          }
        }
        .el-input-number{
          width: 60px;
          .el-input-number__decrease,
          .el-input-number__increase{
            width: 18px;
            background-color: @listColor;
            border-color: @listColor;
            color: @whiteColor;
          }
          .el-input__inner{
            padding-left: 5px;
            padding-right: 18px;
          }
        }
      }
    }
    .my-dialog{
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: calc(100% + 90px);
      top: -30px;
      background: rgba(0,0,0,.3);
      z-index: 1;
      .el-dialog__body{
        color: @whiteColor;
      }
    }
  }
</style>
