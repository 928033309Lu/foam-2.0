<template>
    <div class="enterprise-dialog">
        <el-dialog
            :title="title"
            center
            :visible.sync="dialogVisible"
            :width="oWidth"
            class="common-dialog"
            :close-on-click-modal="false"
            :modal-append-to-body="false"
            :before-close="handleClose">
            <div class="add" v-if="arg=='add' && dialogVisible">
                <el-form :model="addForm" :rules="Rules" ref="add" label-width="140px" class="demo-ruleForm">
                    <el-form-item label="企业名称:" prop="wholeName">
                        <el-input v-model.trim="addForm.wholeName" placeholder="请输入企业名称"></el-input>
                    </el-form-item>
                    <el-form-item label="企业编号:" prop="enterpriseCode">
                        <el-input v-model.trim="addForm.enterpriseCode" placeholder="请输入企业编号"></el-input>
                    </el-form-item>
                    <el-form-item label="限制人数:" prop="personLimit">
                        <el-input v-model.trim="addForm.personLimit" placeholder="请输入限制人数"></el-input>
                    </el-form-item>
                    <el-form-item label="企业管理员姓名:" prop="realName">
                        <el-input v-model.trim="addForm.realName" placeholder="请输入姓名"></el-input>
                    </el-form-item>
                    <el-form-item label="企业管理员手机号码:" prop="telephone">
                        <el-input v-model.trim="addForm.telephone" placeholder="请输入手机号码"></el-input>
                    </el-form-item>
                    <el-form-item label="企业管理员邮箱:" prop="email">
                        <el-input v-model.trim="addForm.email" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="recharge userRecharg" v-if="arg=='userRecharge' && dialogVisible">
                <div class="money">
                    <el-input v-model.trim="userRechargeForm.money" @blur="checkMoney('userRechargeForm')"
                              placeholder="请输入金额"></el-input>
                    <p :class="{'error':tip!='操作金额'}">{{tip}}</p>
                </div>
                <el-form :model="userRechargeForm" :rules="Rules" ref="userRecharge" label-width="80px"
                         class="demo-ruleForm">
                    <el-form-item label="当前余额:">
                        <p class="text-center">{{userRechargeForm.balance}}</p>
                    </el-form-item>
                    <el-form-item label="操作方式:">
                        <el-select v-model="userRechargeForm.cateLog" placeholder="请选择">
                            <el-option
                                v-for="item in options"
                                v-if="item.value!=3"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="用户名称:">
                        <p class="text-center">{{userRechargeForm.realName}}</p>
                    </el-form-item>
                    <el-form-item label="用户电话:">
                        <p class="text-center">{{userRechargeForm.telephone}}</p>
                    </el-form-item>
                    <el-form-item label="用户邮箱:">
                        <p class="text-center">{{userRechargeForm.email}}</p>
                    </el-form-item>
                </el-form>
            </div>
            <div class="recharge" v-if="arg=='recharge' && dialogVisible">
                <div class="money">
                    <el-input v-model.trim="rechargeForm.money" @change.native="checkMoney('rechargeForm')"
                              placeholder="请输入金额"></el-input>
                    <p :class="{'error':tip=='请输入金额(正数)'}">{{tip}}</p>
                </div>
                <el-form :model="rechargeForm" :rules="Rules" ref="recharge" label-width="140px" class="demo-ruleForm">
                    <el-form-item label="当前余额:">
                        <p class="text-center">{{rechargeForm.balance}}</p>
                    </el-form-item>
                    <el-form-item label="操作方式:">
                        <el-select v-model="rechargeForm.cateLog" @change="cateLogChange" placeholder="请选择">
                            <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="企业名称:">
                        <p class="text-center">{{rechargeForm.wholeName}}</p>
                    </el-form-item>
                    <el-form-item label="企业编号:">
                        <p class="text-center">{{rechargeForm.enterpriseCode}}</p>
                    </el-form-item>
                    <el-form-item label="合同编号:" prop="contractNumber">
                        <el-input v-model="rechargeForm.contractNumber" placeholder="请输入合同编号"></el-input>
                    </el-form-item>
                    <el-form-item label="当前账号到期时间:">
                        <p class="text-center">{{rechargeForm.gmtExpired}}</p>
                    </el-form-item>
                    <el-form-item label="操作后账号到期时间:" prop="gmtOver">
                        <el-date-picker :clearable="false" type="date" value-format="yyyy-MM-dd 00:00:00"
                                        placeholder="选择日期"
                                        v-model="rechargeForm.gmtOver" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="备注:">
                        <el-input v-model="rechargeForm.memo" type="textarea" placeholder=""></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div class="log" v-if="arg=='log' && dialogVisible">
                <el-table
                    :data="logObj"
                    border
                    class="common-list-table custom-table"
                    max-height="400px"
                    style="width: 100%">
                    <el-table-column
                        label="交易时间"
                        width="120">
                        <template slot-scope="scope">
                            <span>{{scope.row.gmtTrade.split(" ")[0]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="交易类型"
                        width="100">
                        <template slot-scope="scope">
                            <span>{{scope.row.cateLog=="1"?'充值':scope.row.cateLog=="2"?'扣减':'延期'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="money"
                        label="金额（元）">
                    </el-table-column>
                    <!--<el-table-column-->
                    <!--prop="balance"-->
                    <!--label="账号金额（元）">-->
                    <!--</el-table-column>-->
                    <el-table-column
                        label="金额到期时间">
                        <template slot-scope="scope">
                            <span>{{scope.row.gmtExpired.split(" ")[0]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="contract"
                        label="合同编号">
                    </el-table-column>
                    <el-table-column
                        prop="memo"
                        label="备注">
                        <template slot-scope="scope">
                            <span :title="scope.row.memo">{{scope.row.memo?scope.row.memo:'无'}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="fix-info" v-if="arg=='fix' && dialogVisible">
                <el-form :model="fixForm" :rules="Rules" ref="fix" label-width="140px" class="demo-ruleForm">
                    <el-form-item label="企业管理员姓名:" prop="realName">
                        <el-input v-model="fixForm.realName" placeholder="请输入姓名" :class="{'active':!nameFlag}"
                                  :disabled="nameFlag"></el-input>
                        <span class="edit" @click="nameFlag=false">修改</span>
                    </el-form-item>
                    <el-form-item label="企业管理员手机号码:" prop="telephone">
                        <el-input v-model="fixForm.telephone" placeholder="请输入手机号码" :class="{'active':!phoneFlag}"
                                  :disabled="phoneFlag"></el-input>
                        <span class="edit" @click="phoneFlag=false">修改</span>
                    </el-form-item>
                    <el-form-item label="企业管理员邮箱:" prop="email">
                        <el-input v-model="fixForm.email" placeholder="请输入邮箱" :class="{'active':!emailFlag}"
                                  :disabled="emailFlag"></el-input>
                        <span class="edit" @click="emailFlag=false">修改</span>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
        <el-button @click="cancelHandle">取 消</el-button>
        <el-button type="primary" @click="submitHandle">确 定</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "enterprise-dialog",
        props: ['title', 'arg', 'activeRow', 'logObj', 'balance'],
        data() {
            var checkWholeName = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('名称不能为空'));
                }
                setTimeout(() => {
                    if (!/^([a-zA-Z0-9_\s*\u4e00-\u9fa5])+\s*$/.test(value)) {
                        callback(new Error('格式有误，请确认'));
                    } else if (value.length > 100) {
                        callback(new Error('100字符内'));
                    } else {
                        callback();
                    }
                }, 100);
            };
            var checkLimit = (rule, value, callback) => {
                if (!value && value != 0) {
                    return callback(new Error('不能为空'));
                }
                setTimeout(() => {
                    if (!/^[1-9][0-9]{0,}$/.test(value)) {
                        if (value == 0) {
                            callback(new Error('请输入200内正整数'));
                        } else {
                            callback(new Error('格式有误，请确认'));
                        }
                    } else if (value > 200) {
                        callback(new Error('请输入200内正整数'));
                    } else {
                        callback();
                    }
                }, 100);
            };
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
            return {
                oWidth: '400px',
                dialogVisible: false,
                addForm: {
                    wholeName: '',
                    enterpriseCode: '',
                    personLimit: '',
                    telephone: '',
                    email: '',
                    realName: ''
                },
                userRechargeForm: {
                    balance: '',
                    money: '',
                    cateLog: '1',
                    email: ''
                },
                rechargeForm: {
                    gmtOver: '',
                    money: '',
                    cateLog: '1',
                    contractNumber: '',
                    memo: ''
                },
                fixForm: {
                    realName: '',
                    telephone: '',
                    email: ''
                },
                Rules: {
                    wholeName: [
                        {required: true, message: '请输入企业名称', trigger: 'blur'},
                        {validator: checkWholeName, trigger: 'blur'}
                    ],
                    enterpriseCode: [
                        {required: true, message: '请输入企业编号', trigger: 'blur'},
                        {validator: checkWholeName, trigger: 'blur'}
                    ],
                    personLimit: [
                        {required: true, message: '请输入限制人数', trigger: 'blur'},
                        {validator: checkLimit, trigger: 'blur'}
                    ],
                    telephone: [
                        {required: true, message: '请输入手机号码', trigger: 'blur'},
                        {validator: checkPhone, trigger: 'blur'}
                    ],
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {validator: checkEmail, trigger: 'blur'}
                    ],
                    realName: [
                        {required: true, message: '请输入联系人', trigger: 'blur'},
                        {validator: checkWholeName, trigger: 'blur'}
                    ],
                    contractNumber: [
                        {required: true, message: '请输入合同编号', trigger: 'blur'}
                    ],
                    gmtOver: [
                        {type: 'string', required: true, message: '请选择日期', trigger: 'change'}
                    ]
                },
                tip: '操作金额',
                options: [{
                    label: '充值',
                    value: '1'
                }, {
                    label: '扣减',
                    value: '2'
                }, {
                    label: '延期',
                    value: '3'
                }],
                nameFlag: true,
                phoneFlag: true,
                emailFlag: true
            }
        },
        watch: {
            activeRow: {
                handler(curVal, oldVal) {
                    if (this.arg == "recharge") {
                        Object.assign(this.rechargeForm, curVal);
                    } else if (this.arg == 'fix') {
                        this.fixForm = {
                            realName: curVal.realName,
                            telephone: curVal.telephone,
                            email: curVal.email
                        }
                    } else if (this.arg == "userRecharge") {
                        Object.assign(this.userRechargeForm, curVal);
                    }
                },
                deep: true
            },
            'dialogVisible'(n) {
                if (n) {
                    if (this.arg != 'log') {
                        this.rechargeForm.money = '';
                        this.userRechargeForm.money = '';
                        this.$nextTick(() => {
                            this.resetForm(this.arg);
                        })
                    }
                }
            }
        },
        methods: {
            cateLogChange() {
                if (this.rechargeForm.cateLog == 3) {
                    this.tip = "操作金额";
                }
            },
            initRechargeForm() {
                this.rechargeForm = {
                    gmtOver: '',
                    money: '',
                    cateLog: '1',
                    contractNumber: '',
                    memo: ''
                }
            },
            handleClose(done) {
                done();
            },
            //dialog显示
            showDialog(arg) {
                if (arg == 'log') {
                    this.oWidth = "800px";
                } else {
                    this.oWidth = "400px";
                }
                this.$nextTick(() => {
                    this.tip = "操作金额";
                    this.dialogVisible = true;
                })
            },
            //dialog隐藏
            hideDialog() {
                this.dialogVisible = false;
                if(this.title){
                    this.$emit('update:title','');
                }
                this.addForm = {
                    wholeName: '',
                    enterpriseCode: '',
                    personLimit: '',
                    telephone: '',
                    email: '',
                    realName: ''
                }
            },
            //表单重置
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            //取消
            cancelHandle() {
                if (this.arg == 'fix') {
                    this.nameFlag = true;
                    this.phoneFlag = true;
                    this.emailFlag = true;
                }
                if (this.arg != 'log') {
                    this.resetForm(this.arg);
                    this.rechargeForm.money = '';
                    this.userRechargeForm.money = '';
                }

                this.dialogVisible = false;
            },
            //校验金额输入框
            checkMoney(arg) {
                var reg = /^([1-9][0-9]*((\.\d*)?)|([0]+\.\d+))$/;
                if (reg.test(this[arg].money)) {
                    this.tip = "操作金额";
                } else {
                    this.tip = "请输入金额(正数)"
                }
            },
            //确定
            submitHandle() {
                var reg = /^([1-9][0-9]*((\.\d*)?)|([0]+\.\d+))$/;
                if (this.arg == 'recharge') {
                    if (!reg.test(this.rechargeForm.money) && this.rechargeForm.cateLog != 3) {
                        this.tip = "请输入金额(正数)";
                        return;
                    } else {
                        if (this.rechargeForm.cateLog == 2) {
                            if (this.rechargeForm.money > this.rechargeForm.balance) {
                                this.tip = "扣减金额需小于等于当前余额";
                                return;
                            }
                        }
                    }
                }
                if (this.arg == 'userRecharge') {
                    if (!this.userRechargeForm.money || !reg.test(this.userRechargeForm.money)) {
                        this.tip = "请输入金额(正数)";
                        return;
                    }
                    if (this.userRechargeForm.cateLog == 1) {
                        if (this.balance < this.userRechargeForm.money) {
                            this.tip = "输入金额需小于等于未分配余额";
                            return;
                        }
                    } else if (this.userRechargeForm.cateLog == 2) {
                        if (this.userRechargeForm.money > this.userRechargeForm.balance) {
                            this.tip = "扣减金额需小于等于当前余额";
                            return;
                        }
                    }
                }
                if (this.arg == 'log') {
                    this.hideDialog();
                    return;
                }
                this.$refs[this.arg].validate((valid) => {
                    if (valid) {
                        this.$emit(this.arg, this[this.arg + 'Form'])
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style lang="less">
    .enterprise-dialog {
        .el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label-wrap > .el-form-item__label:before, .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
            content: '';
        }
        .el-form-item {
            margin-bottom: 16px;
            .el-form-item__label {
                padding-right: 6px;
                line-height: 28px;
                color: #fff;
            }
            .el-form-item__content {
                line-height: 28px;
                .el-input__inner {
                    height: 28px;
                    line-height: 28px;
                    border-radius: 0;
                    background-color: transparent;
                    border: 1px solid rgba(43, 103, 139, 1);
                    color: #fff;
                }
            }
        }

        .el-dialog__body {
            padding: 25px 0 0 !important;
            .add {
                padding: 0 90px 0px 20px !important;
            }
            .recharge {
                padding: 0 55px !important;
                &.userRecharg {
                    .el-form-item__label {
                        padding-right: 0;
                    }
                    .el-input__inner {
                        padding-left: 5px;
                    }
                    p.text-center {
                        text-indent: 18px;
                    }
                }
                .el-form-item {
                    margin-bottom: 10px;
                }
                .money {
                    width: 220px;
                    margin: 0 auto;
                    input {
                        color: #fff;
                    }
                    p {
                        font-size: 11px;
                        color: rgba(255, 255, 255, .4);
                        margin: 10px 0 20px;
                        &.error {
                            color: #FF2E76;
                        }
                    }
                    .el-input {
                        input {
                            text-align: center;
                            background: transparent;
                            border: none;
                            border-radius: 0;
                            border-bottom: 1px solid @tborder;
                            font-size: 30px;
                            height: 44px;
                            line-height: 44px;
                        }
                    }
                }
                p {
                    &.text-center {
                        text-align: left;
                        text-indent: 15px;
                    }
                }
                .el-date-editor {
                    .el-input__inner {
                        padding-left: 15px;
                    }
                    .el-input__prefix {
                        right: 5px;
                        left: auto;
                        .el-input__icon {
                            line-height: 28px;
                        }
                    }
                }
                .el-textarea__inner {
                    background: transparent;
                    border-color: @tborder;
                    color: #fff;
                }
                .el-form-item:last-child {
                    margin-top: 20px;
                }
            }
            .log {
                padding: 0 20px !important;
                .custom-table {
                    margin-bottom: 20px;
                    th, td {
                        background: transparent;
                        height: 26px;
                        .cell {
                            height: 22px !important;
                            line-height: 23px !important;
                        }
                        &:first-child {
                            border-right: none;
                        }
                    }
                    tr {
                        td:first-child:before, td:last-child:after {
                            height: 24px;
                        }
                    }
                    td:last-child {
                        .cell span {
                            color: rgba(255, 255, 255, 1);
                            cursor: default;
                        }
                    }
                }
            }
            .fix-info {
                padding: 0 34px !important;
                .el-form-item__content {
                    display: flex;
                    .edit {
                        width: 40px;
                        margin-left: 10px;
                        color: #FF2E76;
                        line-height: 28px;
                    }
                    .el-input {
                        input {
                            border-color: #2B678B;
                        }
                        &.active {
                            input {
                                border-color: #009FFF;
                            }
                        }
                    }
                }
            }
        }
    }
</style>