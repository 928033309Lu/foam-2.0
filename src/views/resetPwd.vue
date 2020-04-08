<template>
    <div class="register-container">
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
                <div class="form">
                    <h3 v-if="step==1">忘记密码</h3>
                    <el-form v-if="step==1" :model="ruleForm" ref="ruleForm" :rules="rules" :label-width="oWidth"
                             class="demo-ruleForm">
                        <el-form-item label="手机号：" prop="telephone">
                            <el-input v-model.trim="ruleForm.telephone"></el-input>
                        </el-form-item>
                        <el-form-item label="验证码：" prop="xcode" class="code">
                            <el-input v-model.trim="ruleForm.xcode"></el-input>
                            <el-button class="get-code" :class="{'no-allow':btnTxt!='获取验证码'}" @click="getCodeHandle">
                                {{btnTxt}}
                            </el-button>
                        </el-form-item>
                        <el-form-item label="新密码：" prop="password">
                            <el-input name="a" type="password" v-model.trim="ruleForm.password"
                                      auto-complete="new-password"></el-input>
                        </el-form-item>
                        <el-form-item label="确认密码：" prop="confirmPwd">
                            <el-input name="b" type="password" v-model.trim="ruleForm.confirmPwd"
                                      auto-complete="new-password"></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="register-success" v-if="step==2">
                        <i class="iconfont iconchenggong"></i>
                        <p class="tip">密码重置成功</p>
                        <p class="time" v-if="type=='common'">{{s+'秒后系统帮你自动登录'}}</p>
                    </div>
                    <el-button class="submit-btn" :class="setClass" @click="submitHadnle('ruleForm')"
                               :disabled="isDisabled && step==1">{{submitTxt}}
                    </el-button>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import userServices from '../services/user.service'

    export default {
        name: 'resetPwd',
        beforeRouteLeave(to, from, next) {
            // 导航离开该组件的对应路由时调用
            if(this.timer){
                clearTimeout(this.timer);
                this.timer = null;
            }
            next();
        },
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
                    if (this.ruleForm.confirmPwd) {
                        if (this.ruleForm.confirmPwd != this.ruleForm.password) {
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
                    if (this.ruleForm.password) {
                        if (this.ruleForm.confirmPwd != this.ruleForm.password) {
                            callback(new Error('两次密码不一致'));
                        } else {
                            callback();
                        }
                    }
                }, 100);
            };
            return {
                step: this.$route.params.step || 1,
                type: this.$route.query.type || '',
                btnTxt: '获取验证码',
                oWidth: '85px',
                s: 5,
                timer: null,
                ruleForm: {
                    telephone: '',
                    password: '',
                    confirmPwd: '',
                    xcode: ''
                },
                rules: {
                    telephone: [
                        {required: true, message: '请输入手机号码', trigger: 'blur'},
                        {validator: checkPhone, trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {validator: checkPwd, trigger: 'blur'}
                    ],
                    confirmPwd: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {validator: checkConfirmPwd, trigger: 'blur'}
                    ],
                    xcode: [
                        {required: true, message: '请输入验证码', trigger: 'blur'}
                    ]
                }
            }
        },
        computed: {
            isDisabled() {
                return !this.ruleForm.telephone || !this.ruleForm.xcode || !this.ruleForm.password || !this.ruleForm.confirmPwd;
            },
            setClass() {
                if (this.step == 1) {
                    if (!this.isDisabled) {
                        return {
                            'active': true
                        }
                    }
                } else {
                    return {
                        'hover': true
                    }
                }
            },
            submitTxt() {
                return this.step == 2 ? '返回首页' : '下一步';
            }
        },
        props: [],
        created() {
            this.step = this.$route.params.step;
            if (this.step == 1) {
                clearInterval(this.timer);
                this.s = 60;
            } else {
                this.s = 5;
            }
        },
        mounted() {
            this.ruleForm.telephone = this.$route.query.phone || '';
            if (this.step == 2) {
                this.setTimer();
            }
        },
        methods: {
            submitHadnle(formName) {
                if (this.step == 2) {
                    clearInterval(this.timer);
                    this.$router.push(`/login/${this.type == 'common' ? 'common' : 'enterAdminLogin'}`);
                } else {
                    this.submitForm(formName);
                }
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.step == 1) {
                            this.resetPwd();
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetPwd() {
                let postData = {};
                Object.assign(postData, this.ruleForm);
                delete postData.confirmPwd;
                let urlName = this.type == 'common' ? 'resetPwd' : 'updatePasswordByPhone'
                userServices[urlName](postData).then(res => {
                    clearInterval(this.timer);
                    this.btnTxt = '返回首页';
                    this.$router.push(`/resetPwd/2?type=${this.type}`);
                    if (this.type == 'common')
                        this.setTimer();
                }).catch(err => {
                    console.log(err);
                    clearInterval(this.timer);
                })
            },
            getCodeHandle() {
                if (this.btnTxt != '获取验证码') return;
                this.$refs.ruleForm.validateField('telephone', (phoneError) => {
                    if (!phoneError) {
                        //当校验通过时，这里面写逻辑代码
                        this.getCode();
                        this.s = 60;
                        this.btnTxt = this.s + 's后重新发送';
                        this.setTimer();
                    }
                })
            },
            //获取短信验证码
            getCode() {
                if (this.btnTxt != '获取验证码') return;
                this.$refs.ruleForm.validateField('telephone', (phoneError) => {
                    if (!phoneError) {
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
            setTimer() {
                let vm = this;
                clearInterval(vm.timer);
                this.timer = setInterval(() => {
                    if (vm.s == 0) {
                        clearInterval(vm.timer);
                        if (vm.step == 2 && vm.type == 'common') {
                            vm.s = 5;
                            vm.autologin();
                        }
                        if (vm.step == 1) {
                            vm.btnTxt = '获取验证码';
                        }
                        return;
                    }
                    if (vm.step == 1)
                        vm.btnTxt = vm.s + 's后重新发送';
                    vm.s--;
                }, 1000)
            },
            autologin() {
                userServices.common(this.ruleForm.telephone, this.ruleForm.password).then(res => {
                    localStorage.setItem('userInfo', JSON.stringify(res));
                    localStorage.setItem('token', res.token);
                    this.$store.commit('setUserInfo', res);
                    this.getGlobal();
                    this.$router.push(this.$route.query.redirect || '/project/list');
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
            }
        },
        watch: {
            $route() {
                this.step = this.$route.params.step;
                if (this.step == 1) {
                    clearInterval(this.timer);
                    this.s = 60;
                } else {
                    this.s = 5;
                }
            }
        }

    }
</script>

<style lang="less">
    @import "../assets/less/login&register.less";

    .register-container {
        .el-container {
            .el-main {
                .form {
                    margin: 127px auto 0;
                }
            }
        }
    }
</style>
