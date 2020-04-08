<template>
    <el-dialog class="login-dialog" :visible.sync="visible" :close-on-press-escape="false" :show-close="false"
               :close-on-click-modal="false"
               :modal-append-to-body="false" width="400px">
        <i class="iconfont iconchazi1" @click="$emit('update:loginVisible',false)"></i>
        <div class="main">
            <img src="../../../public/imgs/login2/login-logo.png" alt="">
            <!--<h3>风 匠</h3>-->
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
                <el-form-item label="" prop="username" :class="{'active':ruleForm.userName}">
                    <el-input v-model.trim="ruleForm.username" :placeholder="placeholderText" clearable
                              autocomplete='new-password'></el-input>
                    <i class="iconfont iconyonghu"></i>
                </el-form-item>
                <el-form-item label="" prop="password" :class="{'active':ruleForm.password}">
                    <el-input :type="inputType" v-model.trim="ruleForm.password" placeholder="请输入密码"
                              autocomplete='new-password'
                              @keyup.enter.native="submitForm('ruleForm')">

                    </el-input>
                    <i class="iconfont iconmima"></i>
                    <i class="eye iconfont iconyanjing" @click="hideHandle" v-if="isShow"></i>
                    <i class="eye iconfont iconyanjing1" @click="hideHandle" v-else></i>
                </el-form-item>
            </el-form>
            <p class="other-opera">
                <router-link :to="`/resetPwd/1?type=${type}`" v-if="type=='common' || type=='enterAdminLogin'">忘记密码
                </router-link>
                <router-link to="/register/1" v-if="type=='common'">马上注册</router-link>
            </p>
            <div class="btns">
                <el-button @click="submitForm('ruleForm')">登录</el-button>
            </div>
        </div>
        <el-footer>
            <router-link class="common" to="/login/common" v-if="type=='enterAdminLogin'">
                切换至普通用户
            </router-link>
            <router-link class="enterAdminLogin" to="/login/enterAdminLogin" v-if="type=='common'">
                切换至企业管理员
            </router-link>
        </el-footer>
    </el-dialog>
</template>

<script>
    import userServices from '../../services/user.service'

    export default {
        name: 'login-dialog',
        data() {
            return {
                visible: true,
                isShow: true,
                inputType: 'password',
                ruleForm: {
                    username: '',
                    password: ''
                },
                rules: {
                    username: [
                        {required: true, message: '请输入账号', trigger: 'change'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'change'}
                    ]
                },
                placeholderText:''
            }
        },
        props: [],
        computed: {
            type() {
                return this.$route.params.type;
            }
        },
        watch: {
            'type'(n){
                this.getPlaceholderText();
                this.$refs.ruleForm.clearValidate();
            }
        },
        created() {
            this.getPlaceholderText();
            this.rules.username[0].message = this.placeholderText;
        },
        mounted() {
        },
        methods: {
            getPlaceholderText(){
                if(this.type=='common'){
                    this.placeholderText = '请输入账号';
                }
                if(this.type=='enterAdminLogin'){
                    this.placeholderText = '请输入企业编码';
                }
                if(this.type=='sysAdminLogin'){
                    this.placeholderText = '请输入系统管理员账号';
                }
                this.rules.username[0].message = this.placeholderText;
            },
            hideHandle() {
                this.isShow = !this.isShow;
                this.inputType = this.isShow ? 'password' : 'text';
            },
            showDialog() {
                this.visible = true;
            },
            hideDialog() {
                this.visible = false;
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.loginHandle();
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.visible = false;
            },
            loginHandle() {
                //sysAdmin
                userServices[this.type](this.ruleForm.username, this.ruleForm.password).then(res => {
                    localStorage.setItem('userInfo', JSON.stringify(res));
                    localStorage.setItem('token', res.token);
                    this.$store.commit('setUserInfo', res);
                    if (this.type == 'common') {
                        this.getGlobal();
                        this.$router.push(this.$route.query.redirect || '/project/list');
                    } else if (this.type == "enterAdminLogin") {
                        this.$router.push(this.$route.query.redirect || '/customer/personList');
                    } else {
                        this.$router.push(this.$route.query.redirect || '/customer/list');
                    }
                }).catch(err => {
                    console.log(err)
                })
            },
            // 查询S3的文件存储的信息
            getGlobal() {
                this.caculateHttps.getGlobal().then(res => {
                    localStorage.setItem('wx_token', res.wx_token)
                    localStorage.setItem('file_token', res.file_token)
                    this.$store.commit('setWxToken', res.wx_token)
                    this.$store.commit('setFileToken', res.file_token)
                })
            },
        }
    }
</script>

<style lang="less">
    .login-dialog {
        z-index:999;
        .el-dialog {
            margin-top: 140px;
            .el-dialog__header {
                display: none;
            }
            .el-dialog__body {
                background: rgba(0, 44, 70, 1) !important;
                padding: 0 !important;
                overflow: hidden;
                .iconchazi1 {
                    font-size: 16px;
                    color: rgba(255, 255, 255, .3);
                    cursor: pointer;
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    z-index: 9;
                    &:hover {
                        color: rgba(255, 255, 255, .7);
                    }
                }
                .main {
                    width: 100%;
                    overflow: hidden;
                    text-align: center;
                    position: relative;
                    padding: 40px 80px 0!important;
                    > img {
                        display: block;
                        margin: 0 auto 40px;
                    }
                    h3 {
                        font-size: 24px;
                        color: #009FFF;
                        margin: 10px 10px 20px;
                        text-align: center;
                    }
                    .el-form {
                        .el-form-item {
                            &:last-child {
                                margin-bottom: 14px;
                            }
                            .el-form-item__content {
                                line-height: 30px;
                                > i.iconmima, > i.iconyonghu {
                                    color: rgba(255, 255, 255, .3);
                                    position: absolute;
                                    left: 5px;
                                    top: 0px;
                                }
                                .eye {
                                    position: absolute;
                                    right: 10px;
                                    top: 0px;
                                    display: none;
                                }
                                &:hover {
                                    .eye {
                                        display: block;
                                    }
                                }
                                .el-input {
                                    background: rgba(0, 44, 70, 1) !important;
                                }
                                .el-input__inner {
                                    height: 30px;
                                    line-height: 30px;
                                    background: rgba(0, 44, 70, 1);
                                    border: 1px solid rgba(43, 103, 139, 1);
                                    border-radius: 0px 1px 1px 1px;
                                    color: rgba(255, 255, 255, .7);
                                    padding: 0 30px;
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
                    .other-opera {
                        overflow: hidden;
                        a {
                            color: rgba(255, 255, 255, .5);
                            &:first-child {
                                float: left;
                            }
                            &:nth-child(2) {
                                float: right;
                            }
                            &:hover {
                                color: rgba(255, 255, 255, .7);
                            }
                        }
                    }
                    .btns {
                        margin: 30px 0 10px;
                        .el-button {
                            width: 240px;
                            height: 30px;
                            background: rgba(3, 73, 114, 1);
                            border-radius: 2px;
                            border: none;
                            color: @highColor;
                            padding: 0;
                        }
                    }
                }
                .el-footer {
                    height: 30px !important;
                    overflow: hidden;
                    margin: 10px 0 10px;
                    a {
                        color: rgba(255, 255, 255, .5);
                        float: right;
                        margin-right: 20px;
                        &:hover {
                            color: rgba(255, 255, 255, .7);
                        }
                    }
                }
            }
        }
    }
</style>
