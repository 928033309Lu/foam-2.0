<template>
    <div class="global-settings" v-loading.fullscreen="loading"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-main>
            <div class="setting arg-setting">
                <el-header>
                    参数设置
                </el-header>
                <el-main class="arg-main">
                    <span>风险警示小时数：</span>
                    <el-input v-model="value" :class="{'error':valueFlag}" @blur="checkValue"></el-input>
                    <span>h</span>
                    <span class="error-text" v-if="valueFlag">{{errorTip}}</span>
                </el-main>
            </div>
            <div class="setting noise-setting">
                <el-header>
                    机组噪音参数设置
                </el-header>
                <el-main class="noise-main">
                    <el-form :rules="formData.rules" :model="formData" ref="formDom" class="demo-ruleForm">
                        <el-table
                            :data="formData.tableData"
                            style="width: 100%">
                            <el-table-column prop="label" label="机型" width="325">
                                <template slot-scope="scope">
                                    <el-form-item :prop="'tableData.' + scope.$index + '.id'"
                                                  :rules='formData.rules.id'>
                                        <el-cascader
                                            style="width:250px;"
                                            v-model="formData.tableData[scope.$index].id"
                                            size="mini"
                                            :show-all-levels="false"
                                            :options="allOptions"
                                            @change="handleChange"
                                            collapse-tags
                                            :props="{
                                            'emitPath':false
                                        }"
                                        ></el-cascader>
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column prop="value" label="最大声压级（db）">
                                <template slot-scope="scope">
                                    <el-form-item :prop="'tableData.' + scope.$index + '.value'"
                                                  :rules="formData.rules.value">
                                        <el-input type="text" v-model="scope.row.value" placeholder="请输入"></el-input>
                                        <el-button @click.prevent="removeDomain(scope.$index)">删除</el-button>
                                    </el-form-item>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form>
                </el-main>
                <div class="add">
                    <el-button @click="addDomain">增加</el-button>
                </div>
                <div class="other">
                    <span>除上述以外所有机型</span>
                    <el-input v-model="otherValue" :class="{'error':otherFlag}" @blur="checkOtherValue"></el-input>
                </div>
                <div class="tip">
                    <p>最大声压级范围[20,500],支持最多两位小数</p>
                </div>
            </div>
        </el-main>
        <el-footer>
            <el-button type="primary" @click="submitHandle('formDom')">保存</el-button>
        </el-footer>
    </div>
</template>

<script>
    import globalServices from '../services/global.service'

    export default {
        data() {
            var checkValue = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('不能为空'));
                }
                setTimeout(() => {
                    var reg = /^[0-9]+(\.[0-9]{0,2})?$/;
                    if (!reg.test(Number(value))) {
                        callback(new Error('20-500内最多2位小数'));
                    } else {
                        if (value < 20 || value > 500) {
                            callback(new Error('20-500内最多2位小数'));
                        } else {
                            callback();
                        }
                    }
                }, 100);
            };
            return {
                loading: false,
                value: 1800,
                valueFlag: false,
                otherFlag: false,
                errorTip: '',
                otherValue: 110,
                modelList: [],
                allOptions: [
                    {
                        children: [],
                        iecVersion: null,
                        label: "企业库",
                        value: null
                    }, {
                        children: [],
                        iecVersion: null,
                        label: "个人库",
                        value: null
                    }
                ],
                formData: {
                    rules: {
                        id: [
                            {required: true, message: '不能为空', trigger: 'change'},
                        ],
                        value: [
                            {required: true, message: '不能为空', trigger: 'blur'},
                            {validator: checkValue, trigger: 'blur'}
                        ]
                    },
                    tableData: []
                },
                hasSame:false
            }
        },
        mounted() {
            let vm = this;
            Promise.all([this.getPerTypeList(), this.getTypeList()]).then(res => {
                vm.getSetting();
            }).catch(err => {
                console.log(err)
            })
        },
        methods: {
            checkValue() {
                if (!this.value) {
                    this.valueFlag = true;
                    this.errorTip = '小时数不能为空';
                    return;
                }
                var reg = /^[0-9]+(\.[0-9]{0,2})?$/;
                if (!reg.test(Number(this.value))) {
                    this.errorTip = '1000-8000内最多2位小数';
                    this.valueFlag = true;
                    return;
                } else {
                    if (this.value < 1000 || this.value > 8000) {
                        this.errorTip = '1000-8000内最多2位小数';
                        this.valueFlag = true;
                        return;
                    } else {
                        this.valueFlag = false;
                    }
                }
            },
            checkOtherValue() {
                if (!this.otherValue) {
                    this.otherFlag = true;
                    return;
                }
                var reg = /^[0-9]+(\.[0-9]{0,2})?$/;
                if (!reg.test(Number(this.otherValue))) {
                    this.otherFlag = true;
                    return;
                } else {
                    if (this.otherValue < 20 || this.otherValue > 500) {
                        this.otherFlag = true;
                        return;
                    } else {
                        this.otherFlag = false;
                    }
                }
            },
            getPerTypeList() {
                let p = new Promise((resolve, reject) => {
                    this.projectHttps
                        .getPerTypeList()
                        .then(res => {
                            this.allOptions[1].children = this.allOptions[1].children.concat(res);
                            this.setModel(this.allOptions[1].children);
                            resolve();
                        })
                        .catch(err => console.log(err));
                })
                return p
            },
            getTypeList() {
                let p = new Promise((resolve, reject) => {
                    this.projectHttps
                        .getTypeList()
                        .then(res => {
                            this.allOptions[0].children = this.allOptions[0].children.concat(res);
                            this.setModel(this.allOptions[0].children);
                            resolve();
                        })
                        .catch(err => console.log(err));
                })
                return p
            },
            setModel(arr) {
                arr.forEach(item => {
                    if (item.value) {
                        item.id = item.value;
                    }
                    if (item.children) {
                        this.setModel(item.children);
                    }
                })
            },
            handleChange(value) {
                let models = this.formData.tableData.filter(item => {
                    return item.id;
                });
                let arr = _.uniqBy(models, 'id');
                if (arr.length < models.length) {
                    this.$message({
                        message: '机型有重复，请确认',
                        type: 'warning'
                    });
                    this.hasSame = true;
                    return;
                }else{
                    this.hasSame = false;
                }
            },
            addDomain() {
                this.formData.tableData.push({
                    id: '',
                    value: this.otherValue || 110
                })
            },
            removeDomain(index) {
                if (index !== -1) {
                    this.formData.tableData.splice(index, 1);
                    this.$nextTick(() => {
                        this.submitHandle('formDom', true);
                    });
                }
            },
            submitHandle(formName, boolean = false) {
                this.handleChange();
                if(this.hasSame) return;
                this.$refs[formName].validate((valid, model) => {
                    if (boolean) {
                        return false;
                    }
                    this.checkValue();
                    this.checkOtherValue();
                    if (valid) {
                        if (this.valueFlag) return;
                        if (this.otherFlag) return;
                        this.$confirm('全局设置将在下次发起计算时生效，是否继续？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.settingUpdate();
                        }).catch(() => {

                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                })
            },
            getSetting() {
                globalServices.getSetting().then(res => {
                    this.value = res.eHourPo || 1800;
                    this.otherValue = res.defaultPo || 110;
                    //if (JSON.parse(res.crew).length>0) {
                    this.formData.tableData = JSON.parse(res.crew).filter(item => {
                        return JSON.stringify(this.allOptions).indexOf(item.id) > -1;
                    });
                    // } else {
                    //     this.formData.tableData.push({
                    //         label: '',
                    //         value: 110
                    //     });
                    // }
                }).catch(err => {
                    console.log(err)
                })
            },
            settingUpdate() {
                this.loading = true;
                let formData = new FormData();
                formData.append('eHour', this.value);
                formData.append('defaultValue', this.otherValue);
                formData.append('setContent', JSON.stringify(this.formData.tableData));
                globalServices.settingUpdate(formData).then(res => {
                    this.loading = false;
                    this.$message({
                        message: '操作成功',
                        type: 'success'
                    });
                }).catch(err => {
                    this.loading = false;
                    console.log(err)
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .global-settings {
        > .el-main {
            width: 568px;
            height: calc(100% - 62px);
            overflow: hidden;
            margin: 0 auto;
            padding: 0;
            padding-bottom: 20px;
            .setting {
                position: relative;
                border: 1px solid rgba(3, 73, 114, 1);
                overflow: hidden;
                &.arg-setting {
                    margin: 10px 0;
                }
                &.noise-setting {
                    height: calc(100% - 100px);
                    overflow: hidden;
                }
                .el-header {
                    height: 28px !important;
                    background: rgba(3, 73, 114, 1);
                    color: #fff;
                    line-height: 28px;
                    padding: 0 9px;
                    &:before {
                        position: absolute;
                        left: 2px;
                        top: 2px;
                        content: "";
                        width: 0px;
                        height: 0px;
                        border-width: 3.5px;
                        border-style: solid;
                        border-color: #FF2E76 transparent transparent #FF2E76;
                    }
                }
                .add {
                    height: 40px;
                    background: rgba(0, 0, 0, .1);
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    font-size: 16px;
                    .el-button {
                        width: 60px;
                        height: 28px;
                        padding: 0;
                        background: rgba(0, 75, 119, 1);
                        text-align: center;
                        line-height: 28px;
                        border: none;
                        color: #fff;
                        margin: 0 auto;
                    }
                }
                .other {
                    height: 40px;
                    background: rgba(0, 0, 0, .2);
                    /*display: flex;*/
                    /*flex-direction: row;*/
                    /*align-items: center;*/
                    font-size: 16px;
                    padding: 5px 0;
                    span {
                        margin: 0 150px 0 40px;
                        color: @highColor;
                    }
                    /deep/ .el-input {
                        width: 80px;
                        &.error {
                            .el-input__inner {
                                border-color: @error;
                            }
                        }
                        .el-input__inner {
                            background: transparent;
                            height: 32px;
                            line-height: 32px;
                            border-color: @listColor;
                            color: #fff;
                            padding: 0 6px;
                            border-radius: 0;
                        }
                    }
                }
                .tip {
                    p {
                        margin-top: 5px;
                        text-indent: 40px;
                        color: @error;
                        font-size: 13px;
                    }
                }
                .el-main {
                    padding: 0;
                    &.arg-main {
                        height: 60px;
                        padding: 10px 0 0 36px;
                        display: flex;
                        flex-direction: row;
                        color: #FFFFFF;
                        > span {
                            line-height: 32px;
                            margin-right: 20px;
                            &.error-text {
                                color: @error;
                            }
                        }
                        /deep/ .el-input {
                            width: 110px;
                            margin-right: 5px;
                            .el-input__inner {
                                background: transparent;
                                height: 28px;
                                line-height: 28px;
                                border-color: transparent;
                                border-bottom-color: @listColor;
                                color: #fff;
                            }
                            &.error {
                                .el-input__inner {
                                    border-bottom-color: @error !important;
                                }
                            }
                        }
                    }
                    &.noise-main {
                        max-height: calc(100% - 132px);
                        overflow-x: hidden;
                        overflow-y: scroll;
                        /deep/ .el-table, /deep/ .el-table th, /deep/ .el-table tr {
                            background-color: transparent;
                        }
                        /deep/ .el-table::before {
                            display: none;
                        }
                        /deep/ tr:hover td {
                            background-color: transparent !important;
                        }
                        /deep/ th, /deep/ td {
                            color: #fff;
                            height: 28px;
                            line-height: 28px !important;
                            border-bottom: 1px solid @listColor;
                            padding: 0;
                            &:first-child {
                                width: 385px;
                                padding-left: 26px;
                            }
                            &:nth-child(2) {
                                /deep/ .el-input {
                                    width: 60px;
                                    .el-input__inner {
                                        background: transparent;
                                        height: 20px;
                                        line-height: 22px;
                                        border-color: transparent;
                                        color: #fff;
                                        font-size: 12px;
                                        padding: 0 6px;
                                        border-radius: 0;
                                    }
                                    &:hover {
                                        .el-input__inner {
                                            border-color: @listColor;
                                        }
                                    }
                                }
                            }
                        }
                        /deep/ .el-form-item {
                            margin-bottom: 0;
                            padding: 6px 0;
                            .el-form-item__content {
                                line-height: 1;
                                > .el-input {
                                    width: 60px;
                                    margin-right: 15px;
                                    .el-input__inner {
                                        height: 28px;
                                        line-height: 28px;
                                        background: transparent;
                                        border: 1px solid @listColor;
                                        color: #fff;
                                    }
                                }
                                .el-button {
                                    width: 60px;
                                    height: 28px;
                                    padding: 0;
                                    background: rgba(0, 75, 119, 1);
                                    text-align: center;
                                    line-height: 28px;
                                    border: none;
                                    color: #fff;
                                }
                            }
                            &.is-error {
                                .el-input__inner {
                                    border-color: @error !important;
                                }
                                .el-form-item__error {
                                    display: none;
                                }
                            }

                        }
                    }
                }
            }
        }
        .el-footer {
            height: 60px;
            border-top: 1px solid rgba(43, 103, 139, 1);
            text-align: center;
            .el-button {
                width: 80px;
                height: 30px;
                background: rgba(3, 73, 114, 1);
                border-radius: 2px;
                padding: 0;
                margin: 15px auto;
            }
        }
    }
</style>