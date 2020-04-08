<template>
  <el-dialog class="fix-pwd" :visible.sync="visible" title="修改密码" :close-on-click-modal="false"
             :modal-append-to-body="false" width="400px">
    <div class="main">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" class="demo-ruleForm">
        <el-form-item label="旧密码:" prop="oldpassword" :class="{'active':ruleForm.oldpassword}">
          <el-input v-model.trim="ruleForm.oldpassword" :type="oldType" placeholder="请输入旧密码"></el-input>
          <i class="iconfont iconyanjing" @click="showHandle('old')" v-if="ruleForm.oldpassword && isSHowOld"></i>
          <i class="iconfont iconyanjing1" @click="hideHandle('old')" v-if="ruleForm.oldpassword && !isSHowOld"></i>
        </el-form-item>
        <el-form-item label="新密码:" prop="newpassword" :class="{'active':ruleForm.newpassword}">
          <el-input v-model.trim="ruleForm.newpassword" :type="newType" placeholder="请输入新密码"></el-input>
          <i class="iconfont iconyanjing" @click="showHandle('new')" v-if="ruleForm.newpassword && isSHowNew"></i>
          <i class="iconfont iconyanjing1" @click="hideHandle('new')" v-if="ruleForm.newpassword && !isSHowNew"></i>
        </el-form-item>
        <el-form-item label="确认密码:" prop="ensurepassword" :class="{'active':ruleForm.ensurepassword}">
          <el-input v-model.trim="ruleForm.ensurepassword" :type="ensureType" placeholder="请再次输入密码"></el-input>
          <i class="iconfont iconyanjing" @click="showHandle('ensure')" v-if="ruleForm.ensurepassword && isSHowEnsure"></i>
          <i class="iconfont iconyanjing1" @click="hideHandle('ensure')" v-if="ruleForm.ensurepassword && !isSHowEnsure"></i>
        </el-form-item>
      </el-form>
    </div>
    <template slot="footer">
      <el-button class="common-btn" @click="resetForm('ruleForm')">取 消</el-button>
      <el-button class="common-btn" @click="submitForm('ruleForm')">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
  export default {
    data() {
      var checkPwd = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('密码不能为空'));
        }
        setTimeout(() => {
          if (this.ruleForm.ensurepassword){
            if (this.ruleForm.ensurepassword!=this.ruleForm.newpassword) {
              callback(new Error('两次密码不一致'));
            } else {
              callback();
            }
          }
        }, 100);
      };
      var checkConfirmPwd = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('密码不能为空'));
        }
        setTimeout(() => {
          if (this.ruleForm.newpassword) {
            if (this.ruleForm.ensurepassword != this.ruleForm.newpassword) {
              callback(new Error('两次密码不一致'));
            } else {
              callback();
            }
          }
        }, 100);
      };
      return {
        visible: false,
        isSHowOld:true,
        isSHowNew:true,
        isSHowEnsure:true,
        oldType:'password',
        newType:'password',
        ensureType:'password',
        ruleForm: {
          oldpassword:'',
          newpassword: '',
          ensurepassword:''
        },
        rules: {
          oldpassword: [
            { required: true, message: '请输入旧密码', trigger: 'change' }
          ],
          newpassword: [
            { required: true, message: '请输入新密码', trigger: 'change' },
            { validator: checkPwd, trigger: 'blur' }
          ],
          ensurepassword: [
            { required: true, message: '请再次输入密码', trigger: 'change' },
            { validator: checkConfirmPwd, trigger: 'blur' }
          ]
        }
      }
    },
    props: ['isSHow'],
    computed: {},
    watch: {
      'isSHow'(n){
        if(n){
          this.visible = n;
        }
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      showDialog(){
        this.visible = true;
      },
      hideDialog(){
        this.resetForm('ruleForm');
        this.visible = false;
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$emit('submit',this.ruleForm);
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.visible = false;
        this.$refs[formName].resetFields();
      },
      showHandle(arg){
        if(arg=='old'){
          this.oldType = "text";
          this.isSHowOld = false;
        }else if(arg=="new"){
          this.newType = "text";
          this.isSHowNew = false;
        }else{
          this.ensureType = "text";
          this.isSHowEnsure = false;
        }
      },
      hideHandle(arg){
        if(arg=='old'){
          this.oldType = "password";
          this.isSHowOld = true;
        }else if(arg=="new"){
          this.newType = "password";
          this.isSHowNew = true;
        }else{
          this.ensureType = "password";
          this.isSHowEnsure = true;
        }
      }
    }
  }
</script>

<style lang="less">
  .fix-pwd {
    .el-dialog {
      margin-top: 140px;
      .el-dialog__body {
        background: rgba(0, 44, 70, 1) !important;
        padding: 40px 80px 20px !important;
        .main {
          width: 100%;
          overflow: hidden;
          text-align: center;
          .el-form {
            .el-form-item {
              .el-form-item__label{
                line-height:30px;
                color:rgba(255,255,255,.7);
                &:before{
                  display:none;
                }
              }
              .el-form-item__content {
                line-height: 30px;
                > i {
                  color: rgba(255, 255, 255, .3);
                  position: absolute;
                  right: 5px;
                  top: 0px;
                  cursor:pointer;
                }
                .el-input__inner {
                  height: 30px;
                  line-height: 30px;
                  background: rgba(0, 44, 70, 1);
                  border: 1px solid rgba(43, 103, 139, 1);
                  border-radius: 0px 1px 1px 1px;
                  color: rgba(255, 255, 255, .7);
                  &:focus {
                    border: 1px solid rgba(0, 159, 255, 1);
                  }
                }
                .el-input__suffix {
                  top: -5px;
                }
              }
              &.active {
                .el-form-item__content {
                  .el-input__inner {
                    border: 1px solid rgba(0, 159, 255, 1);
                  }
                  > i {
                    color: rgba(255, 255, 255, .7);
                  }
                }
              }
            }
          }
        }
      }
      .el-dialog__footer{
        .common-btn{
          width:80px!important;
          height:30px;
          background:rgba(3,73,114,1)!important;
          border-radius:2px;
          padding:0!important;
          text-align:center!important;
          line-height:30px!important;
          border:none!important;
          outline:none!important;
          color:#009FFF!important;
        }
      }
    }
  }
</style>
