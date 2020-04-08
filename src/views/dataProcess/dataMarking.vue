<template>
    <div class="data-mark"
         v-loading.fullscreen="loading" :element-loading-text="loadingText"
         element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="box" v-if="ensureId">
            <div class="charts">
                <el-date-picker
                    v-model="value1"
                    class="marking-time"
                    type="daterange"
                    :unlink-panels="true"
                    @change="customTime"
                    value-format="yyyy-MM-dd"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                </el-date-picker>
                <ul class="buttons">
                    <li v-for="(item,index) in buttons" :class="{'active':selected==index}"
                        @click="setIntervalHandle(item,index)">{{item.text}}
                    </li>
                </ul>
                <div id="container" v-if="isShow" style="height: 100%; width:100%;"></div>
                <div class="pagination">
                    <el-button class="prev" type="primary" icon="el-icon-arrow-left"
                               @click="getDataBase(false,true)"></el-button>
                    <div class="range-box" id="range-box">
                        <button class="drag-button" id="drag-button" @mousedown="dragHandle"></button>
                    </div>
                    <el-button class="next" type="primary" @click="getDataBase(false,false)"><i
                        class="el-icon-arrow-right el-icon--right"></i></el-button>
                </div>
            </div>
            <div class="info">
                <div class="basics-info">
                    <p class="filename" :title="selectFile.fileName">{{selectFile.fileName}}</p>
                    <p>经度：{{fileInfo?Number(fileInfo.lon).toFixed(4):''}}</p>
                    <p>纬度：{{fileInfo?Number(fileInfo.lat).toFixed(4):''}}</p>
                    <p>开始：{{showStartTime?showStartTime.replace('T',' '):''}}</p>
                    <p>结束：{{showEndTime?showEndTime.replace('T',' '):''}}</p>
                </div>
                <div class="select-list">
                    <div class="list-left">
                        <h3>高度(m)</h3>
                        <el-checkbox-group v-model="checkHeights">
                            <el-checkbox :label="height" :key="height" v-for="height in heightList"></el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="list-right">
                        <h3>信号</h3>
                        <el-checkbox-group v-model="checkSingal">
                            <el-checkbox :label="singal.value" :key="singal.value" :value="singal.value"
                                         v-for="singal in singalList">
                                {{singal.label}}
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>
                </div>
                <div class="btns">
                    <el-button class="auto" :disabled="!isOk" @click="getAutoData">{{isOk?'自动处理':'自动处理中···'}}
                    </el-button>
                    <el-button @click="resetData">重新标记</el-button>
                    <el-button @click="saveHandle(true)" v-if="false">保存</el-button>
                    <el-button @click="" v-if="false">导出结果</el-button>
                </div>
            </div>
        </div>
        <div class="empty" v-else>
            <div class="content" v-if="flag1">
                <i class="iconfont icon-kong"></i>
                <p class="first">暂无数据</p>
                <p>请到数据上传页上传文件</p>
            </div>
        </div>
        <el-dialog
            title="数据确认"
            :visible.sync="dialogVisible"
            width="600"
            class="data-dialog"
            :append-to-body="true"
            :before-close="handleClose">
            <p class="time">
                开始时间:{{getMyDate(markerArr[0])}}
            </p>
            <p class="time" style="margin-top:5px;">
                结束时间:{{getMyDate(markerArr[1])}}
            </p>
            <div class="choose-table" v-if="checkAllList.length>0">
                <p class="table-tr table-header">
                    <span>高度</span>
                    <span>全部</span>
                    <span v-for="item in checkSingal">{{getSingalName(item)}}</span>
                </p>
                <p class="table-tr table-body" v-for="(item,index) in checkHeights">
                    <span>{{item}}</span>
                    <span>
            <el-checkbox v-model="checkAllList[index]" @change="changeValue(index)"></el-checkbox>
          </span>
                    <span v-for="(son,idx) in checkSingal">
            <el-checkbox
                v-if="son!='TEMPRETURE_AVG'&&son!='PRESSURE_AVG'&&((hasMore&&index<checkHeights.length-1)||!hasMore)"
                v-model="checkList[index][idx]" @change="changeSonValue(index,idx)"></el-checkbox>
            <el-checkbox v-if="(son=='TEMPRETURE_AVG' || son=='PRESSURE_AVG') && index==checkHeights.length-1"
                         v-model="checkList[index][idx]" @change="changeSonValue(index,idx)"></el-checkbox>
          </span>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="cancelMarker">取消</el-button>
        <el-button class="invalid is-valid" @click="setValid(true)">有效</el-button>
        <el-button class="valid is-valid" @click="setValid(false)">无效</el-button>
      </span>
        </el-dialog>
    </div>
</template>
<script>
    import {invalid, valid} from "../../utils/PeriodUtils";
    import {mixin} from '../../utils/mixin';

    export default {
        name: 'dataMarking',
        mixins: [mixin],
        components: {},
        data() {
            return {
                flag1: false,
                value1: [],
                projectId: this.$route.params.projectId,
                isShow: true,
                loadingText: "数据加载中，请稍后...",
                loading: true,
                fileInfo: JSON.parse(sessionStorage.getItem(this.$route.params.projectId + 'fileInfo')) || "",
                fileList: [],
                heightList: [],
                singalList: [],
                checkHeights: [],
                checkSingal: [],
                dialogVisible: false,
                checkAllList: [],
                checkList: [],
                markerArr: [],
                highChart: null,
                account: 0,
                accountNum: 0,
                sessionData: [],
                chooseObj: {},
                originalObj: {},
                allData: {},
                rangeSection: [],
                colors: ['#F3480C', '#FF9F00', '#F2E40F', '#B6EF0D', '#34FB92', '#12BAEA', '#2156F6', '#A817EC', '#DF7A7A', '#E5B286', '#F0ECAF', '#E0F0B1', '#ACF3CD', '#8DCDE0', '#A2B4EB', '#A2B4EB', '#AB340A', '#AB6C05', '#B2A707', '#7EA705', '#069C4D', '#047291', '#14359A', '#6B069A'],
                buttons: [{ //指定时间选择按钮
                    key: 'oneday',
                    text: '1天',
                    value: 1
                }, {
                    key: 'threeday',
                    text: '3天',
                    value: 3
                }, {
                    key: 'oneweek',
                    text: '1周',
                    value: 7
                }, {
                    key: 'onemonth',
                    text: '1个月',
                    value: 30
                }, {
                    key: 'all',
                    text: '全部',
                    value: 'all'
                }],
                selected: 1, //设置进度条显示区间
                option: {
                    chart: {
                        panning: true,
                        backgroundColor: ['red', 'transparent'],
                        plotBackgroundColor: 'transparent',
                    },
                    legend: {
                        enabled: false
                    },
                    navigator: {
                        height: 0
                    },
                    credits: {
                        enabled: false
                    },
                    rangeSelector: {
                        enabled: false
                    },
                    title: {
                        text: ""
                    },
                    scrollbar: {
                        enabled: false
                    },
                    xAxis: {},
                    yAxis: [],
                    tooltip: {
                        split: true
                    },
                    plotOptions: {},
                    series: []
                },
                invalidGeneralPeriodColumns: [],
                validPeriodColumns: [],
                //flag:true,
                currentTagId: 2333,
                isfirst: true,
                flag: false,
                selectFile: '',
                Stime: null,
                Etime: null,
                startTime: '',
                endTime: '',
                showStartTime: '',
                showEndTime: '',
                testData: {},
                timeInterval: 3,
                allTime: 0,
                leftP: 0,
                curWidth: 0,
                postColumnNumber: [],
                mouseState: false, //鼠标默认状态
                startX: 0,
                moveDirection: 0, //鼠标拖动距离
                box: null,
                boxLeft: 0,//表示内容块被偏移的值
                oWidth: 0,
                rangeLeft: 0,
                isOk: false,
                Interval: null
            }
        },
        computed: {
            ensureId() {
                return this.fileInfo ? this.fileInfo.ensureId : "";
            },
            totalNum() {
                return this.heightList.length * this.singalList.length;
            },
            hasMore() {
                return JSON.stringify(this.checkSingal).indexOf('TEMPRETURE_AVG') > -1 || JSON.stringify(this.checkSingal).indexOf('PRESSURE_AVG') > -1;
            },
        },
        watch: {
            'accountNum'(n) {
                if (this.totalNum == n) {
                    this.matchAction();
                }
            },
            'dialogVisible'(n) {
                if (n) {
                    this.checkList = [];
                    this.checkAllList = [];
                    this.checkHeights = this.checkHeights.filter(item => {
                        return item && item != "";
                    })
                    if (JSON.stringify(this.checkSingal).indexOf('TEMPRETURE_AVG') > -1 || JSON.stringify(this.checkSingal).indexOf('PRESSURE_AVG') > -1) {
                        this.checkHeights.push('');
                        this.flag = true;
                    }
                    _.map(this.checkHeights, (item, index) => {
                        let arr = [];
                        _.map(this.checkSingal, son => {
                            if (index == this.checkHeights.length - 1 && this.hasMore) {
                                if (son == "TEMPRETURE_AVG" || son == "PRESSURE_AVG") {
                                    arr.push(true);
                                } else {
                                    arr.push(null);
                                }
                            } else {
                                arr.push(true);
                            }

                        });
                        this.checkList.push(arr);
                        this.checkAllList.push(true);
                    })
                } else {
                    this.checkList = [];
                    this.checkAllList = [];
                }
            },
            'markerArr.length'(n) {
                let that = this;
                if (n == 1) {
                    this.highChart.xAxis[0].addPlotLine({ //在x轴上增加
                        value: that.markerArr[0], //在值为2的地方
                        width: 2, //标示线的宽度为2px
                        color: 'red', //标示线的颜色
                        id: that.markerArr[0], //标示线的id，在删除该标示线的时候需要该id标示
                        dashStyle: 'Dash'
                    })
                } else if (n == 2) {
                    this.highChart.xAxis[0].addPlotLine({ //在x轴上增加
                        value: that.markerArr[1], //在值为2的地方
                        width: 2, //标示线的宽度为2px
                        color: 'red', //标示线的颜色
                        id: that.markerArr[1], //标示线的id，在删除该标示线的时候需要该id标示
                        dashStyle: 'Dash'
                    });
                    if (that.markerArr[1] < that.markerArr[0]) {
                        let arr = JSON.parse(JSON.stringify(that.markerArr));
                        that.markerArr[0] = arr[1];
                        that.markerArr[1] = arr[0];
                    }
                    this.dialogVisible = true;
                }
            },
            'account'(n) {
                if (n == 2) {
                    _.map(this.singalList, (item, index) => {
                        _.map(this.heightList, (son, idx) => {
                            this.getColumnNumber(son, item.value);
                        })
                    })
                }
            },
            'checkHeights.length'(n) {
                if (this.flag) {
                    this.flag = false;
                    return;
                }
                if (this.totalNum == this.accountNum && this.totalNum != 0 && this.accountNum != 0) {
                    if (n && this.checkSingal.length) {
                        this.loading = true;
                        setTimeout(() => {
                            this.matchAction();
                        }, 100);
                    } else {
                        _toast('请选择高度/信号');
                    }
                }
            },
            'checkSingal.length'(n) {
                if (this.totalNum == this.accountNum && this.totalNum != 0 && this.accountNum != 0) {
                    if (n && this.checkHeights.length) {
                        this.loading = true;
                        setTimeout(() => {
                            this.matchAction();
                        }, 100);
                    } else {
                        _toast('请选择高度/信号');
                    }
                }
            },
            'timeInterval'(n) {
                if (n == 'all') {
                    this.leftP = 0;
                    this.Stime = this.startTime;
                    this.Etime = this.endTime;
                    this.getAllNewData();
                } else {
                    this.setRangeButton();
                    this.getDataBase(true, false, true);
                }
            },
            'leftP'(n) {
                if (n + this.curWidth > document.getElementById('range-box').offsetWidth) {
                    this.leftP = document.getElementById('range-box').offsetWidth - this.curWidth;
                }
                if (n <= 0) {
                    this.leftP = 0;
                }
                document.getElementById('drag-button').style.left = this.leftP + 'px';
            },
            Stime: {
                handler(cur, old) {
                    let beginTime = cur;
                    this.$set(this.value1, 0, beginTime.toInstant().atZone(joda.ZoneId.of("+8")).toLocalDateTime().toString().split('T')[0])
                },
                deep: true
            },
            Etime: {
                handler(cur, old) {
                    let endTime = cur;
                    this.$set(this.value1, 1, endTime.toInstant().atZone(joda.ZoneId.of("+8")).toLocalDateTime().toString().split('T')[0]);
                },
                deep: true
            }
        },
        created() {
            this.importHandle();
            let _this = this;
            document.onkeydown = function (e) {
                let key = e.keyCode;
                if (key == 39) {
                    _this.getDataBase(false, false);
                } else if (key == 37) {
                    _this.getDataBase(false, true);
                }
            };
        },
        mounted() {
            this.selectFile = JSON.parse(sessionStorage.getItem(this.projectId + 'file'));
            if (this.selectFile) {
                this.fileList.push(this.selectFile);
                this.startTime = joda.ZonedDateTime.parse(this.fileInfo.startDateTime).withZoneSameInstant(joda.ZoneOffset.UTC);
                this.showStartTime = this.startTime.toInstant().atZone(joda.ZoneId.of("+8")).toLocalDateTime().toString();
                this.endTime = joda.ZonedDateTime.parse(this.fileInfo.endDateTime).withZoneSameInstant(joda.ZoneOffset.UTC);
                this.showEndTime = this.endTime.toInstant().atZone(joda.ZoneId.of("+8")).toLocalDateTime().toString();
                this.Stime = this.startTime;
                this.Etime = this.Stime.plusDays(this.timeInterval).isAfter(this.endTime) ? this.endTime : this.Stime.plusDays(this.timeInterval);
                this.allTime = new Date(this.showEndTime).getTime() - new Date(this.showStartTime).getTime();
                this.setRangeButton();
                this.getAutoIsOk(false);
                this.getAutoStatus();
            }
        },
        methods: {
            dragHandle(e) {
                this.mouseState = false; //鼠标默认状态
                this.box = document.querySelector('#drag-button');
                this.boxLeft = parseInt(this.box.offsetLeft)//表示内容块被偏移的值
                if (this.timeInterval == 'all') {
                    return;
                }
                //更改鼠标状态
                //参数e为鼠标
                this.mouseState = true;
                //获取鼠标坐标
                this.startX = e.clientX;
                //鼠标拖动初始化
                this.moveDirection = 0
                this.boxLeft = parseInt(this.box.offsetLeft);
                document.onmousemove = (e) => {
                    this.moveDirection = e.clientX - this.startX;
                    //向右移动
                    this.rangeLeft = (this.boxLeft + this.moveDirection) < 0 ? 0 : (this.boxLeft + this.moveDirection);
                    if ((this.oWidth - this.curWidth) < this.rangeLeft) {
                        this.rangeLeft = this.oWidth - this.curWidth;
                    }
                    this.box.style.left = this.rangeLeft + 'px';
                }
                document.onmouseup = () => {
                    document.onmousemove = null;
                    document.onmouseup = null;
                    this.getPercent();
                    this.mouseState = false;
                };
            },
            setRangeButton() {
                if (this.timeInterval == 'all') {
                    this.curWidth = '100%';
                    this.leftP = 0;
                } else {
                    let times = 3600000 * 24 * this.timeInterval;
                    this.oWidth = document.getElementById('range-box').offsetWidth;
                    this.curWidth = Math.floor((times / this.allTime) * this.oWidth);
                    this.curWidth = this.curWidth > 5 ? this.curWidth : 5;
                }
                document.getElementById('drag-button').style.width = this.curWidth + 'px';
            },
            setIntervalHandle(item, index) {
                this.timeInterval = item.value;
                this.selected = index;
            },
            getPercent() {
                if (!this.mouseState) return;
                let percent = this.rangeLeft / (this.oWidth);
                let times = Math.floor(this.allTime * percent);
                this.Stime = this.startTime.plusSeconds(times / 1000).withZoneSameInstant(joda.ZoneOffset.UTC);
                if (this.timeInterval == '30') {
                    this.Etime = this.Stime.plusMonths(1).isAfter(this.endTime) ? this.endTime : this.Stime.plusMonths(1).withZoneSameInstant(joda.ZoneOffset.UTC);
                } else {
                    this.Etime = (this.Stime.plusDays(this.timeInterval).isAfter(this.endTime) ? this.endTime : this.Stime.plusDays(this.timeInterval)).withZoneSameInstant(joda.ZoneOffset.UTC);
                }
                this.getPostNumber();
                this.getDataBaseHandle();
            },
            getDataBase(boolean, isUpPage, isbegin = false) {
                if (isbegin) {
                    if (this.timeInterval != 'all') {
                        if (this.timeInterval == '30') {
                            this.Etime = this.Stime.plusMonths(1).isAfter(this.endTime) ? this.endTime : this.Stime.plusMonths(1).withZoneSameInstant(joda.ZoneOffset.UTC);
                        } else {
                            this.Etime = this.Stime.plusDays(this.timeInterval).isAfter(this.endTime) ? this.endTime : this.Stime.plusDays(this.timeInterval).withZoneSameInstant(joda.ZoneOffset.UTC);
                        }
                    }
                }
                if (boolean && !isbegin) {
                    this.Stime = this.startTime;
                    this.Etime = (this.Stime.plusDays(this.timeInterval).isAfter(this.endTime) ? this.endTime : this.Stime.plusDays(this.timeInterval)).withZoneSameInstant(joda.ZoneOffset.UTC);
                    this.Stime = this.Stime.withZoneSameInstant(joda.ZoneOffset.UTC);
                } else if (!isbegin) {
                    this.setRangeButton();
                    if (!isUpPage) {
                        let c = new Date(this.Etime).getTime();
                        let d = new Date(this.endTime).getTime();
                        if (c >= d) {
                            return;
                        }
                        this.Stime = this.Etime;
                        if (this.timeInterval == 'all') {
                            this.Stime = this.startTime;
                            this.Etime = this.endTime;
                            return;
                        } else if (this.timeInterval == '30') {
                            this.Etime = this.Stime.plusMonths(1).isAfter(this.endTime) ? this.endTime : this.Stime.plusMonths(1).withZoneSameInstant(joda.ZoneOffset.UTC);
                        } else {
                            this.Etime = this.Stime.plusDays(this.timeInterval).isAfter(this.endTime) ? this.endTime : this.Stime.plusDays(this.timeInterval).withZoneSameInstant(joda.ZoneOffset.UTC);
                        }
                    } else {
                        let a = new Date(this.Stime).getTime();
                        let b = new Date(this.startTime).getTime();
                        if (a <= b) {
                            return;
                        }
                        this.Etime = this.Stime;
                        if (this.timeInterval == 'all') {
                            this.Stime = this.startTime;
                            this.Etime = this.endTime;
                            return;
                        } else if (this.timeInterval == '30') {
                            this.Stime = this.Stime.minusMonths(1).isBefore(this.startTime) ? this.startTime : this.Stime.minusMonths(1).withZoneSameInstant(joda.ZoneOffset.UTC);
                        } else {
                            this.Stime = this.Stime.minusDays(this.timeInterval).isBefore(this.startTime) ? this.startTime : this.Stime.minusDays(this.timeInterval).withZoneSameInstant(joda.ZoneOffset.UTC);
                        }
                    }
                    this.oWidth = document.getElementById('range-box').offsetWidth;
                    let timeI = new Date(this.Stime.toString()).getTime() - new Date(this.showStartTime.toString()).getTime();
                    this.leftP = Math.floor((timeI / this.allTime) * this.oWidth);
                }
                if (this.Etime == this.Stime) return;
                this.getPostNumber();
                this.getDataBaseHandle();
            },
            getAllNewData() {
                this.curWidth = this.oWidth;
                document.getElementById('drag-button').style.width = this.curWidth + 'px';
                this.leftP = 0;
                document.getElementById('drag-button').style.left = '0px';
                this.https.getAllNewData(this.ensureId, this.postColumnNumber.join(',')).then(res => {
                    console.log(res);
                    this.testData = res;
                    _.map(res, (item, key) => {
                        if (item.invalidPeriod.length > 0) {
                            _.map(item.invalidPeriod, (son, index) => {
                                this.testData[key].invalidPeriod[index] = {
                                    value: son + 3600000 * 8,
                                    color: index % 2 == 1 ? "#ccc" : ""
                                };
                            })
                        }
                        if (item.values.length > 0) {
                            _.map(item.values, (son, index) => {
                                this.testData[key].values[index][0] = this.testData[key].values[index][0] + 3600000 * 8;
                            })
                        }
                    })
                    this.setOptions();
                }).catch(err => {
                    console.log(err);
                })
            },
            setTableData(item, key) {
                let sTime = new Date(this.Stime).getTime();
                let eTime = new Date(this.Etime).getTime();
                for (let i = sTime; i <= eTime; i = i + 600000) {
                    this.testData[key].values.push([i + 3600000 * 8, null]);
                }
            },
            getDataBaseHandle() {
                this.https.getDataBase(this.ensureId, this.currentTagId, this.postColumnNumber.join(','), this.Stime, this.Etime).then(res => {
                    //console.log(res);
                    this.flag1 = true;
                    this.testData = res;

                    _.map(res, (item, key) => {
                        if (item.invalidPeriod.length > 0) {
                            _.map(item.invalidPeriod, (son, index) => {
                                this.testData[key].invalidPeriod[index] = {
                                    value: son + 3600000 * 8,
                                    color: index % 2 == 1 ? "#ccc" : ""
                                };
                            })
                        }
                        if (item.values.length > 0) {
                            _.map(item.values, (son, index) => {
                                this.testData[key].values[index][0] = this.testData[key].values[index][0] + 3600000 * 8;
                            })
                        } else {
                            this.setTableData(item, key);
                        }
                    })
                    this.setOptions();
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            },
            getMyDate(str) {
                var oDate = new Date(str),
                    oYear = oDate.getFullYear(),
                    oMonth = oDate.getMonth() + 1,
                    oDay = oDate.getDate(),
                    oHour = oDate.getHours(),
                    oMin = oDate.getMinutes(),
                    oSen = oDate.getSeconds(),
                    oTime = oYear + '-' + this.addZero(oMonth) + '-' + this.addZero(oDay) + ' ' + this.addZero(oHour) + ':' +
                        this.addZero(oMin) + ':' + this.addZero(oSen);
                return oTime;
            },
            addZero(num) {
                if (parseInt(num) < 10) {
                    num = '0' + num;
                }
                return num;
            },
            getAutoData() {
                if (!this.isOk) return;
                this.$confirm('是否确定使用自动标记结果并清空当前标记结果?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.loading = true;
                    this.currentTagId = '-9999';
                    this.getAutoIsOk(true);
                }).catch((err) => {
                    console.log(err);
                });
            },
            getAutoIsOk(boolean) {
                this.https.getAutoIsOk(this.ensureId).then(res => {
                    if (res) {
                        if (boolean) {
                            this.copyAutoToLast();
                        } else {
                            clearInterval(this.Interval);
                            this.Interval = null;
                        }
                        this.isOk = true;
                    } else {
                        //_toast('自动处理未完成，请稍后再试');
                        this.loading = false;
                    }
                    if (this.isfirst) {
                        this.getOriginData();
                        this.isfirst = false;
                    }
                }).catch(err => {
                    console.log(err);
                    clearInterval(this.Interval);
                    this.loading = false;
                })
            },
            getAutoStatus() {
                this.Interval = setInterval(() => {
                    this.getAutoIsOk(false);
                }, 10000);
            },
            copyAutoToLast() {
                this.https.copyAutoToLast(this.ensureId).then(res => {
                    this.getDataBaseHandle();
                }).catch(err => {
                    console.log(err);
                })
            },
            resetData() {
                this.$confirm('是否确定清空当前标记?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.https.deleteInvalidData(this.ensureId).then(res => {
                        console.log(res)
                        _.map(this.testData, (item, key) => {
                            this.testData[key].invalidPeriod = [];
                        });
                        _toast('当前标记已清空');
                        this.setOptions();
                    }).catch(err => {
                        console.log(err);
                    })
                }).catch((err) => {
                    console.log(err);
                });
            },
            customTime() {
                let startArr = this.value1[0].split('-');
                let endArr = this.value1[1].split('-');
                this.Etime = joda.ZonedDateTime.of(endArr[0], endArr[1], endArr[2], 0, 0, 0, 0, joda.ZoneId.of("+8")).withZoneSameInstant(joda.ZoneOffset.UTC);
                this.Stime = joda.ZonedDateTime.of(startArr[0], startArr[1], startArr[2], 0, 0, 0, 0, joda.ZoneId.of("+8")).withZoneSameInstant(joda.ZoneOffset.UTC);
                if (!this.Stime.isAfter(this.startTime)) {
                    this.Stime = this.startTime;
                }
                if (this.Etime.isAfter(this.endTime)) {
                    this.Etime = this.endTime;
                }
                if (this.Etime.isBefore(this.startTime) || this.Stime.isAfter(this.endTime)) {
                    this.Stime = this.startTime;
                    this.Etime = this.endTime;
                }
                this.getDataBaseHandle();
            },
            saveHandle(boolean) {
                this.loading = true;
                let formData = new FormData()
                formData.append('currentTagId', this.currentTagId);
                formData.append('ensureId', this.ensureId);
                formData.append('operationSequenceId', new Date().getTime());
                this.https.saveHandle(formData).then(res => {
                    this.currentTagId = res.tagId;
                    this.matchAction(false);
                    if (boolean) {
                        _toast('当前标记已保存');
                    }
                    this.loading = false;
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            },
            changeValue(index) {
                if (this.checkAllList[index]) {
                    _.map(this.checkList[index], (item, idx) => {
                        this.checkList[index][idx] = true;
                    })
                } else {
                    if (JSON.stringify(this.checkList[index]).indexOf('false') == -1) {
                        _.map(this.checkList[index], (item, idx) => {
                            this.checkList[index][idx] = false;
                        })
                    }
                }
            },
            changeSonValue(index, idx) {
                if (this.checkList[index][idx]) {
                    if (JSON.stringify(this.checkList[index]).indexOf('false') == -1) {
                        this.checkAllList[index] = true;
                    }
                } else {
                    if (this.checkAllList[index]) {
                        this.checkAllList[index] = false;
                    }
                }
            },
            getSingalName(item) {
                let name = '';
                this.singalList.forEach(son => {
                    if (son.value == item) {
                        name = son.label;
                    }
                })
                return name;
            },
            matchAction(boolean = true) {
                this.chooseObj = JSON.parse(JSON.stringify(this.originalObj));
                _.map(this.checkHeights, (item, index) => {
                    _.map(this.checkSingal, (son, idx) => {
                        this.sessionData.forEach(it => {
                            if (it.name == son + item) {
                                this.chooseObj[son].push({columnNumber: it.columnNumber, name: item + 'm'});
                            }
                        });
                    })
                });
                if (boolean)
                    if (this.timeInterval == 'all') {
                        this.getPostNumber();
                        this.getAllNewData();
                    } else {
                        this.getDataBase(true, false, true);
                    }
                else {
                    this.getPostNumber();
                    if (this.timeInterval == 'all') {
                        this.getAllNewData();
                    } else {
                        this.getDataBaseHandle();
                    }
                }
            },
            getPostNumber() {
                this.postColumnNumber = [];
                for (let key in this.chooseObj) {
                    if (this.chooseObj[key].length == 0) {
                        delete this.chooseObj[key];
                    } else {
                        this.chooseObj[key].forEach(item => {
                            this.postColumnNumber.push(item.columnNumber);
                        })
                    }
                }
            },
            setOptions() {
                if (this.highChart) {
                    this.highChart.destroy();
                    this.highChart = null;
                }
                let that = this;
                let keys = Object.keys(this.chooseObj);
                let avgHeight = Math.floor(100 / (keys.length));
                this.option.yAxis = [];
                this.option.xAxis = {
                    events: {
                        afterSetExtremes: function (e) {
                            let extremes = that.highChart.xAxis[0].getExtremes();
                            that.rangeSection = [];
                            that.rangeSection.push(extremes.min);
                            that.rangeSection.push(extremes.max);
                            //截取data方法放在这里
                        }
                    },
                    labels: {
                        style: {
                            color: "#fff"
                        }
                    },
                    gridLineColor: "rgba(3,73,114,1)"
                };
                this.option.series = [];
                _.map(keys, (item, index) => {
                    this.option.yAxis.push({
                        startOnTick: true,
                        endOnTick: true,
                        opposite: false,
                        gridLineColor: "rgba(3,73,114,1)",//网格线颜色设置
                        labels: {
                            align: 'right',
                            x: -3,
                            style: {
                                color: "#fff"
                            }
                        },
                        title: {
                            text: this.changeENtoCH(item),
                            style: {
                                color: "#fff"
                            }
                        },
                        top: index * (avgHeight) + '%',
                        height: avgHeight + '%',
                        offset: 0,
                        lineWidth: 2,
                    });
                    _.map(this.chooseObj[item], (son, idx) => {
                        if (item == 'TEMPRETURE_AVG' || item == 'PRESSURE_AVG') {
                            if (idx == 0) {
                                let color = this.getColor(item.replace(/m/, ""));
                                this.option.series.push({
                                    name: item,
                                    color: color,
                                    data: this.testData[son.columnNumber].values,
                                    yAxis: index,
                                    pointStart: this.allData.startTimestamp,
                                    pointInterval: this.allData.intervalsMillis,
                                    tooltip: {
                                        valueDecimals: 2
                                    },
                                    zoneAxis: 'x',
                                    zones: this.testData[son.columnNumber].invalidPeriod.map((item, index) => {
                                        if (index % 2) {
                                            return {
                                                color: item.color,
                                                value: item.value + 600000
                                            }
                                        } else {
                                            return {
                                                color: '',
                                                value: item.value - 600000
                                            }
                                        }
                                    })
                                })
                            }
                        } else {
                            if (this.testData[son.columnNumber]) {
                                let color = this.getColor(son.name.replace(/m/, ""));
                                this.option.series.push({
                                    name: son.name,
                                    color: color,
                                    data: this.testData[son.columnNumber].values,
                                    //id: son.columnNumber,
                                    yAxis: index,
                                    pointStart: this.allData.startTimestamp,
                                    pointInterval: this.allData.intervalsMillis,
                                    tooltip: {
                                        valueDecimals: 2
                                    },
                                    //showInNavigator:false,//是否显示导航器
                                    zoneAxis: 'x',
                                    zones: this.testData[son.columnNumber].invalidPeriod.map((item, index) => {
                                        if (index % 2 == 1) {
                                            return {
                                                color: item.color,
                                                value: item.value + 600000
                                            }
                                        } else {
                                            return {
                                                color: '',
                                                value: item.value - 600000
                                            }
                                        }
                                    })
                                })
                            }
                        }
                    })
                })

                this.option.plotOptions = {
                    series: {
                        cursor: 'pointer',
                        animation: false,
                        //stacking: 'normal', //是否叠加
                        events: {
                            click: function (e) {
                                if (!that.checkSingal.length || !that.checkHeights.length) {
                                    _toast('请选择高度/信号');
                                    return;
                                }
                                if (that.markerArr.length >= 2) {
                                    that.markerArr = [];
                                }
                                that.markerArr.push(e.point.category);
                            }
                        }
                    }
                };
                if (!this.option.yAxis[0].resize) {
                    this.option.yAxis[0].resize = {
                        enabled: true
                    }
                }

                console.log(this.option)
                this.option.series[0].navigatorOptions = {
                    color: 'none',
                }; //去掉滚动条内概览
                this.highChart = new Highcharts.stockChart('container', this.option, () => {
                    //console.log(new Date(),'渲染完成')
                });
                if (this.markerArr.length == 1) {
                    this.highChart.xAxis[0].addPlotLine({ //在x轴上增加
                        value: that.markerArr[0], //在值为2的地方
                        width: 2, //标示线的宽度为2px
                        color: 'red', //标示线的颜色
                        id: that.markerArr[0], //标示线的id，在删除该标示线的时候需要该id标示
                        dashStyle: 'Dash'
                    })
                }
                this.loading = false;
                this.dialogVisible = false;
            },
            getColor(arg) {
                let color = "";
                this.heightList.forEach((item, index) => {
                    if (item == arg) {
                        color = this.colors[index];
                    }
                })
                return color;
            },
            changeENtoCH(name) {
                let newName = name;
                _.map(this.singalList, item => {
                    if (item.value == name) {
                        newName = item.label;
                    }
                })
                return newName;
            },
            handleClose(done) {
                this.highChart.xAxis[0].removePlotLine(this.markerArr[0]);
                this.highChart.xAxis[0].removePlotLine(this.markerArr[1]);
                this.checkAllList = [];
                this.markerArr = [];
                if (JSON.stringify(this.checkSingal).indexOf('TEMPRETURE_AVG') > -1 || JSON.stringify(this.checkSingal).indexOf('PRESSURE_AVG') > -1) {
                    this.checkHeights.splice(this.checkHeights.length - 1, 1);
                }
                done();
            },
            importHandle() {
                const s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = 'https://code.highcharts.com.cn/highcharts-plugins/highcharts-zh_CN.js';
                document.body.appendChild(s);
            },
            cancelMarker() {
                this.highChart.xAxis[0].removePlotLine(this.markerArr[0]);
                this.highChart.xAxis[0].removePlotLine(this.markerArr[1]);
                this.checkAllList = [];
                this.markerArr = [];
                if (JSON.stringify(this.checkSingal).indexOf('TEMPRETURE_AVG') > -1 || JSON.stringify(this.checkSingal).indexOf('PRESSURE_AVG') > -1) {
                    this.checkHeights.splice(this.checkHeights.length - 1, 1);
                }
                this.dialogVisible = false;
            },
            getOriginData() {
                this.getHeightList();
                this.getSingnalList();
            },
            getHeightList() {
                this.https.getHeightList(this.ensureId).then(res => {
                    if (res.length == 0) {
                        _toast('文件有问题，没有高度数据');
                        this.loading = false;
                        return;
                    }
                    this.heightList = [].concat(res);
                    this.heightList = this.heightList.map(item => {
                        return item.toString();
                    });
                    this.checkHeights = [].concat(_.take(this.heightList, 1));
                    //this.checkHeights = [].concat(_.take(this.heightList, this.heightList.length)); //加载全部
                    this.account++;
                }).catch(err => {
                    console.log(err)
                    this.loading = false;
                })
            },
            getSingnalList() {
                this.https.getSingnalList().then(res => {
                    this.singalList = [].concat(res);
                    _.map(this.singalList, item => {
                        this.chooseObj[item.value] = [];
                        this.originalObj[item.value] = [];
                    });
                    this.checkSingal.push(this.singalList[0].value);
                    //this.checkSingal.push(this.singalList[1].value);
                    this.checkSingal.push(this.singalList[2].value);
                    this.account++;
                }).catch(err => {
                    console.log(err)
                    this.loading = false;
                })
            },
            getColumnNumber(height, singnal) {
                this.https.getColumnNumber(this.ensureId, height, singnal).then(res => {
                    this.sessionData.push({name: singnal + height, columnNumber: res});
                    this.accountNum++;
                }).catch(err => {
                    //console.log(err);
                    this.accountNum++;
                })
            },
            setValid(boolean) {
                this.invalidGeneralPeriodColumns = [];
                this.validPeriodColumns = [];
                this.dialogVisible = false;
                let arr = [];
                _.map(this.checkHeights, (item, index) => {
                    _.map(this.checkList[index], (son, idx) => {
                        if (son) {
                            if (this.checkSingal[idx] != 'TEMPRETURE_AVG' && this.checkSingal[idx] != 'PRESSURE_AVG') {
                                arr.push(this.checkSingal[idx] + item);
                            }
                            if (this.checkSingal[idx] == 'TEMPRETURE_AVG' && !item) {
                                arr.push(this.checkSingal[idx] + this.checkHeights[0]);
                            }
                            if (this.checkSingal[idx] == 'PRESSURE_AVG' && !item) {
                                arr.push(this.checkSingal[idx] + this.checkHeights[0]);
                            }
                        }
                    })
                });
                _.map(this.sessionData, item => {
                    _.map(arr, son => {
                        if (son == item.name) {
                            if (boolean) {
                                this.validPeriodColumns.push(item.columnNumber);
                            } else {
                                this.invalidGeneralPeriodColumns.push(item.columnNumber);
                            }
                        }
                    })
                });

                let postData = {
                    "endTimestamp": this.markerArr[1] - 3600000 * 8,
                    "invalidGeneralPeriodColumns": this.invalidGeneralPeriodColumns,
                    "startTimestamp": this.markerArr[0] - 3600000 * 8,
                    "validPeriodColumns": this.validPeriodColumns,
                    "invalidTag": this.currentTagId
                }
                //this.loading = true;
                this.https.setValidNew(postData, this.ensureId).then(res => {
                    //this.getPostNumber();
                    _toast('已标记');
                    if (this.timeInterval == "all") {
                        this.getAllNewData();
                    } else {
                        this.getDataBaseHandle();
                    }
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            }
        }
    }
</script>
<style lang="less">
    .data-mark {
        width: 100%;
        height: 100%;
        .box {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            .charts {
                flex: 1;
                height: 100%;
                overflow-x: hidden;
                overflow-y: scroll;
                display: flex;
                flex-direction: column;
                position: relative;
                & > .el-date-editor {
                    position: absolute;
                    right: 10px;
                    top: 15px;
                    background: transparent;
                    border: 2px solid rgba(3, 73, 114, 1);
                    .el-range-separator {
                        width: auto;
                        line-height: 36px;
                        color: rgba(255, 255, 255, 1);
                    }
                    .el-input__icon {
                        line-height: 32px !important;
                    }
                    .el-range-input {
                        background: transparent;
                        color: rgba(255, 255, 255, 1);
                    }
                }
                .buttons {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    margin: 20px 0 10px 60px;
                    li {
                        width: 66px;
                        height: 24px;
                        text-align: center;
                        line-height: 26px;
                        background: #ccc;
                        margin-right: 12px;
                        cursor: pointer;
                        background: transparent;
                        color: @highColor;
                        border: 1px solid @listColor;
                        &.active {
                            color: @highColor;
                            border: 1px solid @highColor;
                        }
                    }
                }
                #container {
                    .highcharts-button-normal {

                    }
                }
                .pagination {
                    width: 100%;
                    height: 40px;
                    padding: 10px;
                    margin-bottom: 20px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    .el-button {
                        padding: 0;
                        width: 40px;
                        height: 40px;
                        background: rgba(3, 73, 114, 1);
                        border-color: rgba(3, 73, 114, 1);
                    }
                    .range-box {
                        flex: 1;
                        margin: 0 2px;
                        width: 100%;
                        height: 40px;
                        background: rgba(233, 233, 233, .5);
                        position: relative;
                        .drag-button {
                            width: 10px;
                            height: 40px;
                            background: rgba(255, 255, 255, 1);
                            position: absolute;
                            left: 0;
                            top: 0;
                            border-radius: 4px;
                            cursor: pointer;
                            &:focus {
                                border: none;
                                outline: none;
                                box-shadow: none;
                            }
                        }
                    }
                }
            }
            .info {
                width: 278px;
                height: 100%;
                margin-left: 15px;
                padding: 20px 14px;
                .basics-info {
                    width: 100%;
                    overflow: hidden;
                    padding: 0 20px 10px;
                    border: 1px dashed rgba(3, 73, 114, 1);
                    p {
                        text-align: left;
                        line-height: 24px;
                        color: rgba(255, 255, 255, .7);
                        &.filename {
                            line-height: 30px;
                            border-bottom: 1px solid #D2D2D2;
                            overflow: hidden; //隐藏文字
                            text-overflow: ellipsis; //显示 ...
                            white-space: nowrap; //不换行
                            margin: 15px 0;
                        }
                    }
                }
                .select-list {
                    width: 100%;
                    overflow: hidden;
                    padding: 10px 20px 10px;
                    border: 1px dashed rgba(3, 73, 114, 1);
                    margin: 12px 0 16px;
                    display: flex;
                    flex-direction: row;
                    text-align: left;
                    h3 {
                        color: rgba(255, 255, 255, .7);
                        font-size: 14px;
                        font-weight: normal;
                        margin-bottom: 8px;
                    }
                    .el-checkbox__label {
                        font-size: 12px;
                        color: rgba(255, 255, 255, .7);
                    }
                    .el-checkbox__inner {
                        width: 12px;
                        height: 12px;
                    }
                    .list-left {
                        width: 140px;
                        .el-checkbox__inner::after {
                            display: none;
                        }
                        label:nth-child(1) {
                            .el-checkbox__inner {
                                border-color: #F3480C;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #F3480C !important;
                                    border-color: #F3480C !important;
                                }
                            }
                        }
                        label:nth-child(2) {
                            .el-checkbox__inner {
                                border-color: #FF9F00;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #FF9F00 !important;
                                    border-color: #FF9F00 !important;
                                }
                            }
                        }
                        label:nth-child(3) {
                            .el-checkbox__inner {
                                border-color: #F2E40F;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #F2E40F !important;
                                    border-color: #F2E40F !important;
                                }
                            }
                        }
                        label:nth-child(4) {
                            .el-checkbox__inner {
                                border-color: #B6EF0D;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #B6EF0D !important;
                                    border-color: #B6EF0D !important;
                                }
                            }
                        }
                        label:nth-child(5) {
                            .el-checkbox__inner {
                                border-color: #34FB92;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #34FB92 !important;
                                    border-color: #34FB92 !important;
                                }
                            }
                        }
                        label:nth-child(6) {
                            .el-checkbox__inner {
                                border-color: #12BAEA;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #12BAEA !important;
                                    border-color: #12BAEA !important;
                                }
                            }
                        }
                        label:nth-child(7) {
                            .el-checkbox__inner {
                                border-color: #2156F6;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #2156F6 !important;
                                    border-color: #2156F6 !important;
                                }
                            }
                        }
                        label:nth-child(8) {
                            .el-checkbox__inner {
                                border-color: #A817EC;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #A817EC !important;
                                    border-color: #A817EC !important;
                                }
                            }
                        }
                        label:nth-child(9) {
                            .el-checkbox__inner {
                                border-color: #DF7A7A;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #DF7A7A !important;
                                    border-color: #DF7A7A !important;
                                }
                            }
                        }
                        label:nth-child(10) {
                            .el-checkbox__inner {
                                border-color: #E5B286;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #E5B286 !important;
                                    border-color: #E5B286 !important;
                                }
                            }
                        }
                        label:nth-child(11) {
                            .el-checkbox__inner {
                                border-color: #F0ECAF;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #F0ECAF !important;
                                    border-color: #F0ECAF !important;
                                }
                            }
                        }
                        label:nth-child(12) {
                            .el-checkbox__inner {
                                border-color: #E0F0B1;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #E0F0B1 !important;
                                    border-color: #E0F0B1 !important;
                                }
                            }
                        }
                        label:nth-child(13) {
                            .el-checkbox__inner {
                                border-color: #ACF3CD;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #ACF3CD !important;
                                    border-color: #ACF3CD !important;
                                }
                            }
                        }
                        label:nth-child(14) {
                            .el-checkbox__inner {
                                border-color: #8DCDE0;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #8DCDE0 !important;
                                    border-color: #8DCDE0 !important;
                                }
                            }
                        }
                        label:nth-child(15) {
                            .el-checkbox__inner {
                                border-color: #A2B4EB;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #A2B4EB !important;
                                    border-color: #A2B4EB !important;
                                }
                            }
                        }
                        label:nth-child(16) {
                            .el-checkbox__inner {
                                border-color: #D7ADEB;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #D7ADEB !important;
                                    border-color: #D7ADEB !important;
                                }
                            }
                        }
                        label:nth-child(17) {
                            .el-checkbox__inner {
                                border-color: #AB340A;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #AB340A !important;
                                    border-color: #AB340A !important;
                                }
                            }
                        }
                        label:nth-child(18) {
                            .el-checkbox__inner {
                                border-color: #AB6C05;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #AB6C05 !important;
                                    border-color: #AB6C05 !important;
                                }
                            }
                        }
                        label:nth-child(19) {
                            .el-checkbox__inner {
                                border-color: #B2A707;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #B2A707 !important;
                                    border-color: #B2A707 !important;
                                }
                            }
                        }
                        label:nth-child(20) {
                            .el-checkbox__inner {
                                border-color: #7EA705;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #7EA705 !important;
                                    border-color: #7EA705 !important;
                                }
                            }
                        }
                        label:nth-child(21) {
                            .el-checkbox__inner {
                                border-color: #069C4D;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #069C4D !important;
                                    border-color: #069C4D !important;
                                }
                            }
                        }
                        label:nth-child(22) {
                            .el-checkbox__inner {
                                border-color: #047291;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #047291 !important;
                                    border-color: #047291 !important;
                                }
                            }
                        }
                        label:nth-child(23) {
                            .el-checkbox__inner {
                                border-color: #14359A;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #14359A !important;
                                    border-color: #14359A !important;
                                }
                            }
                        }
                        label:nth-child(24) {
                            .el-checkbox__inner {
                                border-color: #6B069A;
                            }
                            .is-checked {
                                .el-checkbox__inner {
                                    background-color: #6B069A !important;
                                    border-color: #6B069A !important;
                                }
                            }
                        }
                    }
                    .list-right {
                        width: 90px;
                        .el-checkbox__inner::after {

                        }
                        .el-checkbox__inner {
                            border-color: rgba(3, 73, 114, 1);
                        }
                        .el-checkbox.is-checked {
                            .el-checkbox__inner {
                                background: rgba(3, 73, 114, 1);
                                border-color: rgba(3, 73, 114, 1);
                            }
                        }
                    }
                    .el-checkbox {
                        display: inline-block;
                        width: 100%;
                    }
                }
                .btns {
                    width: 100%;
                    overflow: hidden;
                    .el-button {
                        float: left;
                        width: 120px;
                        height: 30px;
                        color: rgba(255, 255, 255, .7);
                        background: rgba(3, 73, 114, 1);
                        border-radius: 2px;
                        line-height: 30px;
                        margin-bottom: 12px;
                        padding: 0;
                        border: none;
                        transition: opacity .3s ease;
                        &:focus, &:hover {
                            color: rgba(255, 255, 255, .7);
                            border: none;
                            background-color: rgba(3, 73, 114, 1);
                            opacity: 1;
                        }
                        & + .el-button {
                            margin: 0 0 12px;
                        }
                        &:nth-child(2n) {
                            margin-left: 10px;
                        }
                        &.is-disabled {
                            background: #ccc !important;
                            border-color: #ccc !important;
                        }
                    }
                }
            }
        }
        .empty {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            .content {
                i {
                    font-size: 100px;
                    color: #ccc;
                }
                p {
                    line-height: 26px;
                    margin-left: -30px;
                    &.first {
                        margin-top: 20px;
                    }
                }
            }
        }
        .highcharts-navigator, .highcharts-navigator-xaxis {
            display: none;
        }
    }
</style>
