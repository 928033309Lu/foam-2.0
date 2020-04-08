<template>
  <div class="register-container" v-loading="loading"
       element-loading-text="拼命加载中"
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-container>
      <el-header>
        <div class="header-left">
          <img src="../../public/imgs/login2/register-logo.png" alt="">
          <!--<span></span>-->
          <!--<img src="../../public/imgs/logo-2.png" alt="">-->
        </div>
        <router-link to="/login/common" class="header-right">
          返回首页
        </router-link>
      </el-header>
      <el-main>
        <ul>
          <li class="step" :class="{'active':step>=1}">
            <i class="iconfont iconshenfenyanzheng"></i>
            <p>注册信息</p>
          </li>
          <!--<li class="line" :class="{'active':step>=1}"></li>-->
          <!--<li class="step" :class="{'active':step>=2}">-->
            <!--<i class="iconfont iconbianji1"></i>-->
            <!--<p>身份验证</p>-->
          <!--</li>-->
          <li class="line" :class="{'active':step>=1}"></li>
          <li class="step" :class="{'active':step>=2}">
            <i class="iconfont iconwancheng"></i>
            <p>注册成功</p>
          </li>
        </ul>
        <div class="form">
          <h3 v-if="step==1 || step==2">新用户注册</h3>
          <el-form v-if="step==1" :model="ruleForm" ref="ruleForm" :rules="rules" :label-width="oWidth" class="demo-ruleForm">
            <el-form-item label="手机号：" prop="telephone">
              <el-input v-model.trim="ruleForm.telephone"></el-input>
            </el-form-item>
            <el-form-item label="验证码：" prop="verificationCode" class="code">
              <el-input v-model.trim="ruleForm.verificationCode"></el-input>
              <el-button class="get-code" :class="{'no-allow':btnTxt!='获取验证码'}" @click="getCode">{{btnTxt}}</el-button>
            </el-form-item>
            <el-form-item label="企业编码：" prop="enterpriseCode">
              <el-input v-model.trim="ruleForm.enterpriseCode"></el-input>
            </el-form-item>
            <el-form-item label="用户姓名：" prop="realName">
              <el-input v-model.trim="ruleForm.realName"></el-input>
            </el-form-item>
            <el-form-item label="企业邮箱：" prop="email">
              <el-input v-model.trim="ruleForm.email"></el-input>
            </el-form-item>
            <el-form-item label="登录密码：" prop="password">
              <el-input name="a" type="password" v-model.trim="ruleForm.password" auto-complete="new-password"></el-input>
            </el-form-item>
            <el-form-item label="确认密码：" prop="passwordAgain">
              <el-input name="b" type="password" v-model.trim="ruleForm.passwordAgain" auto-complete="new-password"></el-input>
            </el-form-item>
          </el-form>
          <div class="register-success" v-if="step==2">
            <i class="iconfont iconchenggong"></i>
            <p class="tip">已提交注册申请</p>
            <p class="time">等待企业管理员审核</p>
            <p class="time">{{s+'秒后跳转登录页'}}</p>
          </div>
          <el-button class="submit-btn" :class="setClass" @click="submitHadnle('ruleForm')" :disabled="isDisabled">{{submitTxt}}</el-button>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import userServices from '../services/user.service'
  export default {
    data() {
      var checkPhone = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('手机号不能为空'));
        }
        setTimeout(() => {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error('请输入正确的手机号码'));
          } else {
            callback();
          }
        }, 100);
      };
      var checkEmail = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('邮箱不能为空'));
        }
        setTimeout(() => {
          if (!/^(?=\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$).{0,50}$/.test(value)) {
            callback(new Error('请输入正确的邮箱'));
          } else {
            callback();
          }
        }, 100);
      };
      var checkPwd = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('密码不能为空'));
        }
        setTimeout(() => {
          if (this.ruleForm.passwordAgain){
            if (this.ruleForm.passwordAgain!=this.ruleForm.password) {
              callback(new Error('两次密码不一致'));
            } else {
              callback();
            }
          }
        }, 100);
      };
      var checkpasswordAgain = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('密码不能为空'));
        }
        setTimeout(() => {
          if (this.ruleForm.password) {
            if (this.ruleForm.passwordAgain != this.ruleForm.password) {
              callback(new Error('两次密码不一致'));
            } else {
              callback();
            }
          }
        }, 100);
      };
      return {
        loading:false,
        step:this.$route.params.step || 1,
        btnTxt:'获取验证码',
        oWidth:'85px',
        s:60,
        timer:null,
        ruleForm: {
          telephone: '',
          verificationCode:'',
          enterpriseCode:'',
          realName:'',
          email:'',
          password:'',
          passwordAgain:''
        },
        rules: {
          telephone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkPhone, trigger: 'blur' }
          ],
          verificationCode: [
            { required: true, message: '请输入验证码', trigger: 'blur' }
          ],
          enterpriseCode: [
            { required: true, message: '请输入企业编码', trigger: 'blur' }
          ],
          realName: [
            { required: true, message: '请输入姓名', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: checkPwd, trigger: 'blur' }
          ],
          passwordAgain: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: checkpasswordAgain, trigger: 'blur' }
          ]
        }
      }
    },
    computed:{
      isDisabled(){
        return !this.ruleForm.telephone || !this.ruleForm.verificationCode || !this.ruleForm.enterpriseCode || !this.ruleForm.realName || !this.ruleForm.email || !this.ruleForm.password || !this.ruleForm.passwordAgain;
      },
      setClass(){
        if(this.step==1){
          if(!this.isDisabled){
            return {
              'active':true
            }
          }
        }else{
          return {
            'hover':true
          }
        }
      },
      submitTxt(){
        return this.step==2?'返回首页':'下一步';
      }
    },
    props: [],
    created(){
      this.step = this.$route.params.step;
      if(this.step==1){
        this.s = 60;
        clearInterval(this.timer);
      }else{
        this.s = 5;
      }
    },
    mounted() {
      this.ruleForm.telephone = this.$route.query.phone || '';
      if(this.step==2){
        clearInterval(this.timer);
        this.timer = null;
        this.s = 5;
        this.setTimer();
      }
    },
    methods: {
      submitHadnle(formName){
        if(this.step==2){
          clearInterval(this.timer);
          this.timer = null;
          this.$router.push('/login/common');
        }else{
          this.submitForm(formName);
        }
      },
      //提交
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.step==1){
              this.registerHandle();
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      registerHandle(){
        let postData = Object.assign({},this.ruleForm);
        delete postData.verificationCode;
        userServices.register(postData,this.ruleForm.verificationCode).then(res => {
          this.loading = false;
          this.btnTxt = '返回首页';
          this.$router.push({path:'/register/2',query:{phone:this.ruleForm.telephone,pwd:this.ruleForm.password}});
          clearInterval(this.timer);
          this.timer = null;
          this.setTimer();
        }).catch(err => {
          this.loading = false;
          console.log(err)
        })
      },
      //获取短信验证码
      getCode(){
        if(this.btnTxt != '获取验证码') return;
        this.$refs.ruleForm.validateField('telephone', (phoneError) => {
          if(!phoneError){
            //当校验通过时，这里面写逻辑代码
            userServices.getMessageCode(this.ruleForm.telephone).then(res => {
              this.s = 60;
              this.btnTxt = this.s + 's后重新发送';
              this.setTimer();
            }).catch(err => {
              console.log(err)
            })
          }
        })
      },
      setTimer(){
        this.timer = setInterval(()=>{
          if(this.s==0){
            clearInterval(this.timer);
            this.timer = null;
            if(this.step==2){
              this.autologin();
              return;
            }
            if(this.step==1){
              this.btnTxt = '获取验证码';
              return;
            }
          }
          this.s--;
          if(this.step==1){
            this.btnTxt = this.s + 's后重新发送';
          }
        },1000)
      },
      autologin(){
        this.$router.push('/login/common');
      }
    },
    watch: {
      $route(){
        this.step = this.$route.params.step;
        if(this.step==1){
          clearInterval(this.timer);
          this.s = 60;
        }else if(this.step==2){
          this.s = 5;
        }
      }
    }

  }
</script>

<style lang="less">
  @import "../assets/less/login&register.less";
</style>
