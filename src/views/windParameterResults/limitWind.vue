<template>
    <div class="limit-wind" v-loading.fullscreen="loading" :element-loading-text="loadingText"
         element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-container>
            <el-header>
                <div class="header_wrapper">
                    <div class="wind_speed">
                        <div class="block">
                            风速列：
                            <el-select v-model="speedColumn" placeholder="请选择" @change="getAllData">
                                <el-option
                                    v-for="item in speedColumns"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="start_end_time">
                        <div class="block">
                            <span class="demonstration">起止时间：</span>
                            <el-date-picker
                                v-model="timeValue"
                                @change="getAllData"
                                :unlink-panels="true"
                                value-format="yyyy/MM/dd HH:mm"
                                type="datetimerange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期">
                            </el-date-picker>
                        </div>
                    </div>
                </div>
            </el-header>
            <el-container v-if="allData.speedAvg">
                <el-aside>
                    <el-form ref="form" label-width="80px">
                        <div class="ul_outwrapper">
                            <div class="ul_wrapper">
                                <el-collapse v-model="activeName1" accordion>
                                    <el-collapse-item title="基本信息统计 :" name="1">
                                        <table>
                                            <tr>
                                                <th>指标</th>
                                            </tr>
                                            <tr>
                                                <td>平均风速m/s</td>
                                            </tr>
                                            <tr>
                                                <td>威布尔k</td>
                                            </tr>
                                        </table>
                                        <table class="first_two">
                                            <tr>
                                                <th>数值</th>
                                            </tr>
                                            <tr>
                                                <td>{{allData.speedAvg?allData.speedAvg.toFixed(2):'--'}}</td>
                                            </tr>
                                            <tr>
                                                <td>{{allData.ewtsii?allData.ewtsii.weibullK.toFixed(2):'--'}}</td>
                                            </tr>
                                        </table>
                                    </el-collapse-item>

                                </el-collapse>
                                <el-collapse v-model="activeName2" accordion>
                                    <el-collapse-item title="极值风速统计 :" name="2">
                                        <table>
                                            <tr>
                                                <th>方法</th>
                                            </tr>
                                            <tr>
                                                <td>IEC</td>
                                            </tr>
                                            <tr>
                                                <td>EWTS II (Exact)</td>
                                            </tr>
                                            <tr>
                                                <td>EWTS II (Gumbell)</td>
                                            </tr>
                                            <tr>
                                                <td>EWTS II (Davenport)</td>
                                            </tr>
                                            <tr>
                                                <td>独立风暴法</td>
                                            </tr>
                                            <tr>
                                                <td>周期极值法</td>
                                            </tr>
                                        </table>
                                        <table>
                                            <tr>
                                                <th>数值(风速m/s)</th>
                                            </tr>
                                            <tr>
                                                <td>
                                                    {{(allData.iec&&allData.iec.vRef)?allData.iec.vRef.toFixed(2):'--'}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>{{allData.ewtsii.vRefExact.toFixed(2)}}</td>
                                            </tr>
                                            <tr>
                                                <td>{{allData.ewtsii.vRefGumbel.toFixed(2)}}</td>
                                            </tr>
                                            <tr>
                                                <td>{{allData.ewtsii.vRefDavenport.toFixed(2)}}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    {{allData.independentStorms?(allData.independentStorms.vRef?allData.independentStorms.vRef.toFixed(2):'null'):'null'}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    {{allData.periodicMaxima?(allData.periodicMaxima.vRef?allData.periodicMaxima.vRef.toFixed(2):'null'):'null'}}
                                                </td>
                                            </tr>
                                        </table>
                                    </el-collapse-item>
                                </el-collapse>
                                <!--<ul class="info">-->
                                <!--<li>-->
                                <!--<div class="title">-->
                                <!--<span>接口地址</span>-->
                                <!--</div>-->
                                <!--<p>show/extremeWindCondition/all/data/</p>-->
                                <!--<div class="title">-->
                                <!--<span>ensureId</span>-->
                                <!--</div>-->
                                <!--<p>{{this.ensureId}}</p>-->
                                <!--</li>-->
                                <!--</ul>-->
                            </div>
                        </div>
                    </el-form>
                </el-aside>
                <el-main>
                    <div>
                        <el-menu :default-active="active_Index.toString()" class="el-menu-demo" mode="horizontal"
                        >
                            <el-menu-item v-for="(tab,index) in tabs" :key="index">
                                <el-row>
                                    <el-button type="primary" plain @click="Active_clase(index)"
                                               :style="{'background-color':active_Index===index?'rgba(3,73,114,1)':'#ccc','color':active_Index===index?'#FFFFFF':''} ">
                                        {{tab.name}}
                                    </el-button>
                                </el-row>
                            </el-menu-item>
                        </el-menu>
                        <div class="body_wrapper" v-show="active_Index===0">
                            <div class="span_wrapper">
                                <span>参考IEC标准，实测风速一般是50年一遇最大风速(10min)的0.8倍，该数据列50年一遇最大风速为{{(allData.iec&&allData.iec.vRef)?allData.iec.vRef.toFixed(2):'--'}}m/s</span>
                            </div>
                            <table>
                                <tr class="header_wrapper">
                                    <th class="first">高度 (m)</th>
                                    <th class="second">最大风速(m/s)</th>
                                    <th class="third">时间</th>
                                    <th class="forth">风向</th>
                                </tr>
                                <tr class="table_content">
                                    <td>{{allData.iec?allData.iec.height:'--'}}</td>
                                    <td>{{allData.iec?allData.iec.speedMax.toFixed(2):'--'}}</td>
                                    <td>{{allData.iec?allData.iec.time.split('T').join(' ').replace(/-/g,'.'):'--'}}
                                    </td>
                                    <td>{{allData.iec?allData.iec.direction:'--'}}</td>
                                </tr>
                            </table>
                            <div class="span_wrapper">
                                <span>风频情况:</span>
                            </div>
                            <div class="wind-frequency">
                                <ul>
                                    <li>
                                        <span>风速(m/s)</span>
                                        <span>频率(%)</span>
                                    </li>
                                    <li v-for="item in windFrequency[0]">
                                        <span>{{item.order}}</span>
                                        <span>{{(item.value*100).toFixed(2)+'%'}}</span>
                                    </li>
                                </ul>
                                <ul>
                                    <li>
                                        <span>风速(m/s)</span>
                                        <span>频率(%)</span>
                                    </li>
                                    <li v-for="item in windFrequency[1]">
                                        <span>{{item.order}}</span>
                                        <span>{{item.order?((item.value*100).toFixed(2)+'%'):''}}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="body_wrapper2" v-show="active_Index===1">
                            <div class="ewt-box" id="ewt-box">
                                <Ewt-chart ref="ewtChart" v-if="active_Index===1"
                                           :data="allData.ewtsii.weibullK"></Ewt-chart>
                            </div>
                            <table>
                                <tr class="header_wrapper">
                                    <th class="first">Method</th>
                                    <th class="second">Vref/Vave</th>
                                    <th class="third">Vref(m/s)</th>
                                </tr>
                                <tr class="table_content">
                                    <td>Exact</td>
                                    <td class="second">{{allData.ewtsii.vRefExact.toFixed(2)}}</td>
                                    <td>{{allData.ewtsii.vvExact.toFixed(2)}}</td>
                                </tr>
                                <tr class="table_content">
                                    <td>Gumbell</td>
                                    <td class="second">{{allData.ewtsii.vRefGumbel.toFixed(2)}}</td>
                                    <td>{{allData.ewtsii.vvGumbel.toFixed(2)}}</td>
                                </tr>
                                <tr class="table_content">
                                    <td>Davenport</td>
                                    <td class="second">{{allData.ewtsii.vRefDavenport.toFixed(2)}}</td>
                                    <td>{{allData.ewtsii.vvDavenport.toFixed(2)}}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="body_wrapper3" v-show="active_Index===2">
                            <div class="scatter-box">
                                <scatter-chart ref="scatterChart" v-if="active_Index===2" id="scatterChart"
                                               :data="allData.independentStorms?allData.independentStorms.points:''"
                                               :line-slope="allData.independentStorms?allData.independentStorms.lineSlope:''"
                                               :line-intercept="allData.independentStorms?allData.independentStorms.lineIntercept:''"></scatter-chart>
                            </div>
                            <div class="content_wrapper">
                                <el-form :model="ruleForm_inde_storm" :rules="rules"
                                         ref="ruleForm_inde_storm" label-width="125px"
                                         label-position="left"
                                         class="demo-ruleForm">
                                    <el-form-item label="Vref计算值 "
                                                  :show-message="false">
                                        <span>:</span>
                                        <span>{{allData.independentStorms?(allData.independentStorms.vRef?allData.independentStorms.vRef.toFixed(2):'null'):'null'}}</span>
                                        <span>m/s</span>
                                    </el-form-item>
                                    <el-form-item label="风暴阈值 " prop="ISStormThreshold">
                                        <span>:</span>
                                        <el-input v-model.number="ruleForm_inde_storm.ISStormThreshold"
                                                  placeholder="请输入"></el-input>
                                        <span>m/s</span>
                                    </el-form-item>
                                    <el-form-item label="被合并风暴间隔小于 " prop="ISMergeStormsLessHour">
                                        <span>:</span>
                                        <el-input v-model.number="ruleForm_inde_storm.ISMergeStormsLessHour"
                                                  placeholder="请输入"></el-input>
                                        <span>h</span>
                                    </el-form-item>
                                    <div class="button_wrapper">
                                        <button type="button" class="el-button el-button--primary"
                                                @click="submitForm('ruleForm_inde_storm')"><span>确定</span>
                                        </button>
                                    </div>
                                </el-form>
                            </div>
                        </div>
                        <div class="body_wrapper4" v-if="active_Index===3">
                            <div class="scatter-box">
                                <scatter-chart ref="scatterChart1" v-if="active_Index===3" id="scatterChart1"
                                               :data="allData.periodicMaxima.points?allData.periodicMaxima.points:[]"
                                               :line-slope="allData.periodicMaxima.lineSlope"
                                               :line-intercept="allData.periodicMaxima.lineIntercept"></scatter-chart>
                            </div>
                            <div class="content_wrapper">
                                <el-form v-if="showFlag" :model="ruleForm_period_extr" ref="ruleForm_period_extr"
                                         :rules="rules"
                                         label-width="0px"
                                         class="demo-ruleForm"
                                         :hide-required-asterisk="false">
                                    <el-form-item label="">
                                        <span class="name">Verf计算值 ：</span>
                                        <span class="verf-value">{{allData.periodicMaxima?(allData.periodicMaxima.vRef?allData.periodicMaxima.vRef.toFixed(2):'null'):'null'}}</span>
                                        <span class="spec_item">m/s</span>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <span class="name">时间周期 ：</span>
                                        <el-select v-model="ruleForm_period_extr.timePeriod" placeholder="请选择">
                                            <el-option v-for="item in timePeriods" :label="item.label"
                                                       :value="item.value"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <span class="name">排除区间 ：</span>
                                    </el-form-item>
                                    <el-form-item label="" class="check-box"
                                                  prop="PMExcludeRecoveryRateLessPercent">
                                        <el-checkbox name="type1" v-model="ruleForm_period_extr.type1"></el-checkbox>
                                        <span class="title">数据完整率小于</span>
                                        <el-input
                                            v-model="ruleForm_period_extr.PMExcludeRecoveryRateLessPercent"></el-input>
                                        <span class="spec_item">%</span>
                                    </el-form-item>
                                    <el-form-item label="" class="check-box"
                                                  prop="PMExcludeValidDataPointsLessCount">
                                        <el-checkbox name="type2" v-model.number="ruleForm_period_extr.type2"></el-checkbox>
                                        <span class="title">有效数据点小于</span>
                                        <el-input
                                            v-model.number="ruleForm_period_extr.PMExcludeValidDataPointsLessCount"></el-input>
                                        <span class="spec_item">个</span>
                                    </el-form-item>
                                    <div class="button_wrapper">
                                        <button type="button" class="cycle-btn"
                                                @click="submitForm('ruleForm_period_extr')">
                                            确定
                                        </button>
                                    </div>
                                </el-form>
                            </div>
                        </div>
                    </div>
                </el-main>
            </el-container>
            <div class="no-data no-data-a" v-if="!allData.speedAvg">
                暂无数据，请尝试其他风速列
            </div>
        </el-container>
    </div>

</template>

<script>
    import EwtChart from '@/components/charts/EWT-chart.vue'
    import scatterChart from '@/components/charts/scatter-chart.vue'

    export default {
        data() {
            var check_PMExcludeRecoveryRateLessPercent = (rule, value, callback) => {
                var value_ = value;
                if (!value_) {
                    return callback(new Error('数值不能为空'));
                }
                setTimeout(() => {
                    var reg=/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/;
                    if (!reg.test(value_)) {
                        callback(new Error('请输入数字值'));
                    } else {
                        if (value_ > 100) {
                            callback(new Error('必须100内'));
                        } else if (value_ < 1) {
                            callback(new Error('必须大于1'));
                        }
                        else {
                            callback();
                        }
                    }
                }, 300);
            };
            var check_PMExcludeValidDataPointsLessCount = (rule, value, callback) => {
                var value_ = value;
                if (!value_) {
                    return callback(new Error('数值不能为空'));
                }
                if (value_) {
                    setTimeout(() => {
                        let reg = /^[1-9]\d*$/;
                        if (!reg.test(value_)) {
                            callback(new Error('请输入整数'));
                        } else {
                            if (value_ <= 0) {
                                callback(new Error('必须大于0'));
                            } else {
                                callback();
                            }
                        }
                    }, 300);
                } else {
                    //return callback(new Error('数值不能为空'));
                }
            };
            var check_ISStormThreshold = (rule, value, callback) => {
                var value_ = value;
                if (!value_) {
                    return callback(new Error('请输入整数'));
                }
                setTimeout(() => {
                    let reg = /^[1-9]\d*$/;
                    if (!reg.test(value_)) {
                        callback(new Error('请输入整数'));
                    } else {
                        if (value_ > 100) {
                            callback(new Error('必须小于100'));
                        } else if (value_ < 1) {
                            callback(new Error('必须大于1'));
                        }
                        else {
                            callback();
                        }
                    }
                }, 300);
            };
            var check_ISMergeStormsLessHour = (rule, value, callback) => {
                var value_ = value;
                if (!value_) {
                    return callback(new Error('数值不能为空'));
                }
                setTimeout(() => {
                    let reg = /^[1-9]\d*$/;
                    if (!reg.test(value_)) {
                        callback(new Error('请输入整数'));
                    } else {
                        if (value_ > 100) {
                            callback(new Error('必须小于100'));
                        } else if (value_ < 1) {
                            callback(new Error('必须大于1'));
                        }
                        else {
                            callback();
                        }
                    }
                }, 300);
            };
            return {
                loadingText: "数据加载中，请稍后...",
                loading: true,
                projectId: this.$route.params.projectId,
                fileInfo: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'fileInfo')) || "",
                active_Index: 0,
                active: 'home',
                tabs: [
                    {name: 'IEC标准'},
                    {name: 'EWTS II'},
                    {name: '独立风暴法'},
                    {name: '周期极值法'},
                ],
                input: '',
                speedColumns: [],
                speedColumn: '',
                timePeriods: [],
                allData: '',
                timeValue: [],
                windFrequency: [],
                activeName1: '1',
                activeName2: '2',
                showFlag: true,
                ruleForm_period_extr: {
                    timePeriod: '',
                    PMExcludeRecoveryRateLessPercent: 80,
                    PMExcludeValidDataPointsLessCount: 5000,
                    type1: false,
                    type2: false
                },
                ruleForm_inde_storm: {
                    ISMergeStormsLessHour: 48,
                    ISStormThreshold: 15
                },
                rules: {
                    PMExcludeRecoveryRateLessPercent: [
                        {required: false, message: '', trigger: 'blur'},
                        {validator: check_PMExcludeRecoveryRateLessPercent, trigger: 'blur'}
                    ],
                    PMExcludeValidDataPointsLessCount: [
                        {required: false, message: '', trigger: 'blur'},
                        {validator: check_PMExcludeValidDataPointsLessCount, trigger: 'blur'}
                    ],
                    ISStormThreshold: [
                        {required: true, message: '请输入整数', trigger: 'blur'},
                        {validator: check_ISStormThreshold, trigger: 'blur'}
                    ],
                    ISMergeStormsLessHour: [
                        {required: true, message: '数值不能为空', trigger: 'blur'},
                        {validator: check_ISMergeStormsLessHour, trigger: 'blur'}
                    ]
                }
            }
        },
        components: {
            EwtChart, scatterChart
        },
        computed: {
            ensureId() {
                return this.fileInfo ? this.fileInfo.ensureId : "";
            },
        },
        watch: {
            'active_Index'(n) {
                this.$nextTick(() => {
                    if (n == 1) {
                        this.$refs.ewtChart.initChart();
                    } else if (n == 2) {
                        if (this.allData.independentStorms) {
                            this.$refs.scatterChart.initChart();
                        } else {
                            return;
                        }
                    } else if (n == 3) {
                        if (this.allData.periodicMaxima) {
                            this.$refs.scatterChart1.initChart();
                        } else {
                            return;
                        }
                    }
                })
            },
            'ruleForm_period_extr.type1'(n) {
                if (n) {
                    this.rules.PMExcludeRecoveryRateLessPercent[0].required = true;
                    this.rules.PMExcludeRecoveryRateLessPercent[0].message = '请输入值';
                    this.showFlag = false;
                    this.$nextTick(() => {
                        this.showFlag = true;
                    })
                } else {
                    this.rules.PMExcludeRecoveryRateLessPercent[0].required = false;
                }
            },
            'ruleForm_period_extr.type2'(n) {
                if (n) {
                    this.rules.PMExcludeValidDataPointsLessCount[0].required = true;
                    this.rules.PMExcludeValidDataPointsLessCount[0].message = '请输入值';
                    this.showFlag = false;
                    this.$nextTick(() => {
                        this.showFlag = true;
                    })
                } else {
                    this.rules.PMExcludeValidDataPointsLessCount[0].required = false;
                }
            }
        },
        created() {
            this.$nextTick(() => {
                this.$set(this.timeValue, 0, this.changeTimeType(new Date(this.fileInfo.startDateTime)));
                this.$set(this.timeValue, 1, this.changeTimeType(new Date(this.fileInfo.endDateTime)));
                this.getTimePeriods();
            })
        },
        methods: {
            changeTimeType(time) {
                let date = new Date(time);
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let hour = date.getHours();
                let minute = date.getMinutes();
                return year + '/' + this.addZero(month) + '/' + this.addZero(day) + ' ' + this.addZero(hour) + ':' + this.addZero(minute);
            },
            addZero(num) {
                return num > 9 ? num : ('0' + num);
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.getIndependentStorm();
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            Active_clase(index) {
                this.active_Index = index;
            },
            getSpeedColumns() {
                this.https.getSpeedColumns(this.ensureId).then(res => {
                    this.speedColumns = res;
                    this.$nextTick(() => {
                        this.speedColumn = this.speedColumns[0].value;
                        this.getAllData();
                    })
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            },
            getTimePeriods() {
                this.https.getTimePeriods().then(res => {
                    this.timePeriods = res;
                    this.ruleForm_period_extr.timePeriod = res[0].value;
                    this.getSpeedColumns();
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            },
            getAllData() {
                this.loading = true;
                this.https.getAllData(this.ensureId, this.ruleForm_period_extr.timePeriod, this.speedColumn, this.timeValue).then(res => {
                    this.allData = Object.assign({}, res);
                    if (res.iec && res.iec.windFrequency) {
                        this.windFrequency = res.iec.windFrequency.map((item, index) => {
                            return {
                                order: index + '-' + (index + 1),
                                value: item
                            }
                        });
                        this.windFrequency = _.chunk(this.windFrequency, Math.ceil(this.windFrequency.length / 2));
                        if (this.windFrequency[0].length != this.windFrequency[1].length) {
                            this.windFrequency[1].push({
                                order: '',
                                value: ''
                            })
                        }
                    }
                    this.loading = false;
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            },
            getIndependentStorm() {
                this.loading = true;
                if (this.active_Index == 2) {
                    this.https.getIndependentStorm(this.ensureId, this.ruleForm_inde_storm.ISMergeStormsLessHour, this.ruleForm_inde_storm.ISStormThreshold, this.speedColumn, this.timeValue).then(res => {
                        this.allData.independentStorms = Object.assign({}, res);
                        this.loading = false;
                    }).catch(err => {
                        console.log(err);
                        this.loading = false;
                    })
                } else if (this.active_Index == 3) {
                    let PMExcludeRecoveryRateLessPercent = this.ruleForm_period_extr.type1 ? this.ruleForm_period_extr.PMExcludeRecoveryRateLessPercent : '';
                    let PMExcludeValidDataPointsLessCount = this.ruleForm_period_extr.type2 ? this.ruleForm_period_extr.PMExcludeValidDataPointsLessCount : '';
                    this.https.getPeriodMaxima(this.ensureId, PMExcludeRecoveryRateLessPercent, PMExcludeValidDataPointsLessCount, this.ruleForm_period_extr.timePeriod, this.speedColumn, this.timeValue).then(res => {
                        this.allData.periodicMaxima = Object.assign({}, res);
                        this.loading = false;
                    }).catch(err => {
                        console.log(err);
                        this.loading = false;
                    })
                }
            }
        },
    }
</script>
<style lang="less">
    @import '../../assets/less/limit.less';
</style>

