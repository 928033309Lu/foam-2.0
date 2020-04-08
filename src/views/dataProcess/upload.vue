<template>
    <div class="upload" v-loading.fullscreen.lock="fullscreenLoading" :element-loading-text="loadingText"
         element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="upload-box">
            <div class="upload-left">
                <div class="upload-action">
                    <el-upload
                        class="upload-demo"
                        drag
                        action=""
                        :http-request="uploadHandle"
                        accept="text/plain"
                        :multiple="false">
                        <i class="iconfont iconwenjianshangchuan"></i>
                        <div class="el-upload__text">点击或拖动文件上传</div>
                    </el-upload>
                </div>
                <div class="upload-list">
                    <div class="file-list">
                        <p v-for="(item,index) in fileList" :class="{'active':activeIndex==index}"
                           @click="getFileData(item,index,false)">
                            <i class="iconfont iconwenjian"></i>
                            <span :title="item.fileName">{{item.fileName}}</span>
                            <i class="iconfont icon-chazi1" @click.stop="deleteFileHandle(item,index)"></i>
                        </p>
                        <div class="no-file" v-if="fileList.length==0">
                            <i class="iconfont iconwenjian"></i>
                            <p>请上传文件</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="upload-right">
                <el-form ref="form" :model="postObj" :rules="rules" label-width="88px" :hide-required-asterisk="true">
                    <el-form-item label="测风塔编号:" prop="windMeasurementTowerNumber">
                        <el-input v-model="postObj.windMeasurementTowerNumber"
                                  :disabled="postObj.hasEnsured"></el-input>
                    </el-form-item>
                    <el-form-item label="位置:" class="inline" prop="lon">
                        <el-input v-model="postObj.lon" :disabled="postObj.hasEnsured"></el-input>
                        <el-select v-model="longitude" placeholder="请选择" :disabled="postObj.hasEnsured">
                            <el-option label="东经" value="1"></el-option>
                            <el-option label="西经" value="0"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="所属项目:" prop="projectName">
                        <el-input v-model="postObj.projectName" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="" class="inline" prop="lat">
                        <el-input v-model="postObj.lat" :disabled="postObj.hasEnsured"></el-input>
                        <el-select v-model="latitude" placeholder="请选择" :disabled="postObj.hasEnsured">
                            <el-option label="北纬" value="1"></el-option>
                            <el-option label="南纬" value="0"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <div class="data-confirm">
            <!--<h3>数据集确认</h3>-->
            <div class="data-box" id="data-box">
                <div class="table-box">
                    <el-table
                        ref="table"
                        :data="tableData"
                        :height="tableHeight"
                        :highlight-current-row="true"
                        :row-class-name="setClass"
                        empty-text="暂无数据"
                        fit
                        @row-click="clickRow"
                        v-if="tableHeight>1">
                        <el-table-column
                            prop="label"
                            :show-overflow-tooltip="true"
                            label="标签"
                            min-width="220">
                        </el-table-column>
                        <el-table-column
                            prop="unitDescribe"
                            label="单位"
                            width="80">
                        </el-table-column>
                        <el-table-column
                            prop="type"
                            label="类型"
                            min-width="144">
                        </el-table-column>
                        <el-table-column
                            prop="subType"
                            label="次类型"
                            min-width="100">
                        </el-table-column>
                        <el-table-column
                            prop="height"
                            label="高度(m)"
                            min-width="110">
                        </el-table-column>
                        <el-table-column
                            prop="columnValueAvg"
                            label="平均值"
                            min-width="100">
                            <template slot-scope="scope">
                                <span>{{scope.row.columnValueAvg.toFixed(2)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="columnValueMax"
                            label="最大值"
                            min-width="130">
                            <template slot-scope="scope">
                                <span>{{scope.row.columnValueMax.toFixed(2)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="columnValueMin"
                            label="最小值"
                            min-width="100">
                            <template slot-scope="scope">
                                <span>{{scope.row.columnValueMin.toFixed(2)}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="data-detail">
                    <ul>
                        <li class="one">
                            <span class="one-word title">标签：</span>
                            <span
                                class="value">{{tableData.length==0?emptyData.label:tableData[activeRowIndex].label}}</span>
                        </li>
                        <li class="two bottom">
                            <span class="two-word title">类型：</span>
                            <el-select v-model="tableData.length==0?emptyData.type:tableData[activeRowIndex].type"
                                       placeholder=""
                                       :disabled="postObj.hasEnsured">
                                <el-option
                                    v-for="item in typeList"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </li>
                        <li class="three bottom">
                            <span class="three-word title">
                              高度(m)：
                            </span>
                            <el-input
                                v-model.number="tableData.length==0?emptyData.height:tableData[activeRowIndex].height"
                                class="height-input" :class="{'error':heightFlag}" placeholder=""
                                :disabled="postObj.hasEnsured" @blur="checkHeight"></el-input>
                            <span class="line">-</span>
                            <el-select v-model="tableData.length==0?emptyData.cedian:tableData[activeRowIndex].cedian"
                                       placeholder=""
                                       class="height-select" :disabled="postObj.hasEnsured">
                                <el-option
                                    v-for="item in cedianList"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </li>
                        <li class="four bottom">
                            <span class="four-word title">次类型：</span>
                            <el-select v-model="tableData.length==0?emptyData.subType:tableData[activeRowIndex].subType"
                                       placeholder="" class="whole" :disabled="postObj.hasEnsured">
                                <el-option
                                    v-for="item in subTypeList"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </li>
                        <li>
                            <span class="five-word title">首行数据：</span>
                            <span class="value1">{{tableData.length==0?emptyData.columnValueFirst:tableData[activeRowIndex].columnValueFirst}}</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="btns" :class="{'active':postObj.hasEnsured}">
                <!--<div class="cancel">取消</div>-->
                <div class="submit" :class="{'not-allowed':postObj.hasEnsured}" @click="submitHandle">确定</div>
            </div>
            <el-dialog
                title="信息确认"
                :visible.sync="dialogVisible"
                width="500px"
                class="location-dialog"
                :append-to-body="true"
                :before-close="handleClose">
                <p class="location" style="margin-top:20px;color:rgba(255,255,255,.7);;">
                    请确认输入的塔号、位置，如输入有误，将影响部分功能。<br>
                    一经确认，将无法修改。
                </p>
                <span slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogVisible = false">否</el-button>
        <el-button class="is-valid" @click="submitAction">是</el-button>
      </span>
            </el-dialog>
        </div>
        <div class="cover" v-if="processLoading">
            <div class="content">
                <!--<div class="progress">-->
                    <!--<div class="progress-bar progress-bar-info progress-bar-striped active" :class="{'over':isOver}"-->
                         <!--:style="{'width':oWidth}">-->
                        <!--<div class="progress-value">{{num+'%'}}</div>-->
                    <!--</div>-->
                <!--</div>-->
                <el-progress v-if="processLoading" :percentage="uploadRate" color="linear-gradient(90deg,rgba(0,159,255,1),rgba(255,46,118,1));"></el-progress>
                <p>{{loadingText}}</p>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'upload',
        components: {},
        data() {
            var checkLon = (rule, value, callback) => {
                if (!value && value != 0) {
                    return callback(new Error('必填字段'));
                }
                setTimeout(() => {
                    if (typeof (Number(value)) != 'number') {
                        callback(new Error('请输入数字值'));
                    } else {
                        if (value > 180 || value < 0) {
                            callback(new Error('经度必须在0和180度之间'));
                        } else {
                            callback();
                        }
                    }
                }, 300);
            };
            var checkLat = (rule, value, callback) => {
                if (!value && value != 0) {
                    return callback(new Error('必填字段'));
                }
                setTimeout(() => {
                    if (typeof (Number(value)) != 'number') {
                        callback(new Error('请输入数字值'));
                    } else {
                        if (value > 90 || value < 0) {
                            callback(new Error('纬度必须在0和90度之间'));
                        } else {
                            callback();
                        }
                    }
                }, 300);
            };
            return {
                processLoading: false,
                projectId: this.$route.params.projectId,
                num: 0,
                heightFlag: false,
                oWidth: '270px',
                isOver: false,
                loadingText: '',
                dialogVisible: false,
                fullscreenLoading: true,
                fileList: [],
                activeIndex: 0,
                tableHeight: 0,
                tableData: [],
                emptyData: {
                    "cedian": "",
                    "channelNumber": '',
                    "columnNumber": '',
                    "columnValueAvg": '',
                    "columnValueFirst": '',
                    "columnValueMax": '',
                    "columnValueMin": '',
                    "height": '',
                    "label": "",
                    "subType": "",
                    "type": "",
                    "unitDescribe": ""
                },
                activeRowIndex: 0,
                cedianList: [],
                typeList: [],
                subTypeList: [],
                file: null,
                postObj: {
                    longitude: 'east',
                    latitude: 'north',
                    windMeasurementTowerNumber: '',
                    projectName: sessionStorage.getItem('projectName'),
                    lon: '',
                    lat: ''
                },
                rules: {
                    windMeasurementTowerNumber: [
                        {required: true, message: '请输入测风塔编号', trigger: 'blur'},
                        {max: 50, message: '最多50字符', trigger: 'blur'}
                    ],
                    projectName: [
                        {required: true, message: '请选择项目名称', trigger: 'blur'},
                        {max: 100, message: '最多100字符', trigger: 'blur'}
                    ],
                    lon: [
                        {required: true, message: '请输入经度', trigger: 'blur'},
                        {validator: checkLon, trigger: 'blur'},
                    ],
                    lat: [
                        {required: true, message: '请输入纬度', trigger: 'blur'},
                        {validator: checkLat, trigger: 'blur'},
                    ]
                },
                longitude: '1',
                latitude: '1',
                form: {
                    longitude: '',
                    latitude: ''
                },
                uploadRate: 0,
                timer: null
            }
        },
        watch: {
            'processLoading'(n) {
                if (n) {
                    this.num++;
                    this.timer = setInterval(() => {
                        if (this.num >= 90) {
                            clearInterval(this.timer);
                            return;
                        }
                        this.num++;
                    }, 333)
                } else {
                    this.num = 0;
                    this.oWidth = '270px';
                    this.isOver = false;
                }
            },
            'activeRowIndex'(n){
                this.checkHeight();
            }
        },
        created() {

        },
        mounted() {
            this.activeIndex = sessionStorage.getItem(this.projectId + 'activeIndex') || 0;
            let dom = document.getElementById("data-box");
            if (dom) {
                this.tableHeight = document.getElementById("data-box").offsetHeight - 40;
            }
            window.onresize = () => {
                if (dom && this.$route.path == "/project/dataProcess/upload") {
                    this.tableHeight = document.getElementById("data-box").offsetHeight - 40;
                }
            }
            setTimeout(() => {
                this.getCedian();
                this.getSubType();
                this.getType();
                this.getFileList();
                if (window.parent == window || window.top == window) {
                    this.$refs.table.setCurrentRow(this.tableData[0]);
                    this.checkHeight();
                }
            }, 1000);
        },
        methods: {
            checkHeight() {
                if(!this.tableData.length) return;
                if (!this.tableData[this.activeRowIndex].height && this.tableData[this.activeRowIndex].height !== 0) {
                    this.heightFlag = true;
                } else {
                    this.heightFlag = false;
                }
                if(this.tableData[this.activeRowIndex].height>1000 || this.tableData[this.activeRowIndex].height<0){
                    this.$message("高度为[0,1000]区间的整数");
                    this.heightFlag = true;
                }
            },
            handleClose(done) {
                done();
            },
            setClass({row, rowIndex}) {
                row.index = rowIndex;
                return row.channelNumber % 2 == 1 ? 'activeOne' : 'activeTwo';
            },
            clickRow(row, column, event) {
                this.activeRowIndex = row.index;
                this.heightFlag = false;
            },
            getFileData(item, index, boolean) {
                if (this.activeIndex == index && !boolean) {
                    this.fullscreenLoading = false;
                    return;
                }
                ;
                //this.$refs.form.clearValidate();
                this.activeIndex = index;
                sessionStorage.setItem(this.projectId + 'activeIndex', this.activeIndex);
                this.fullscreenLoading = true;
                this.loadingText = '';
                this.https.getInfo(item.ensureId).then(res => {
                    this.tableData = res ? res.dataSlices : this.tableData;
                    this.postObj = res;
                    this.postObj.projectName = this.postObj.projectName || sessionStorage.getItem('projectName');
                    let postObj = Object.assign({}, res);
                    this.longitude = res.lon >= 0 ? '1' : '0';
                    this.latitude = res.lat >= 0 ? '1' : '0';
                    this.postObj.lon = Math.abs(this.postObj.lon.toFixed(4));
                    this.postObj.lat = Math.abs(this.postObj.lat.toFixed(4));
                    sessionStorage.setItem(this.projectId + 'fileInfo', JSON.stringify(postObj));
                    sessionStorage.setItem(this.projectId + 'file', JSON.stringify(this.fileList[this.activeIndex]));
                    setTimeout(() => {
                        this.$refs.table.setCurrentRow(this.tableData[0]);
                        this.fullscreenLoading = false;
                    }, 500);
                }).catch(err => {
                    console.log(err);
                    this.fullscreenLoading = false;
                })
            },
            deleteFileHandle(item, index) {
                this.deleteFile(item.ensureId, index);
            },
            uploadHandle(file) {
                if (JSON.stringify(this.fileList).indexOf(file.file.name) > -1) {
                    _toast('文件名重复，请修正后再上传');
                    return false;
                }
                if (file.file.name.length > 200) {
                    this.$message("文件名长度不能超过200个字符");
                    return false;
                }
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                    this.num = 0;
                }
                this.file = file.file;
                let formData = new FormData();
                formData.append('file', file.file);
                this.processLoading = true;
                this.loadingText = '文件上传中，请稍候...';
                let vm = this;
                this.https.uploadFile(formData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                    onUploadProgress: function (e) {
                        //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
                        //如果lengthComputable为false，就获取不到e.total和e.loaded
                        if (e.lengthComputable) {
                            var rate = Math.floor((e.loaded / e.total)*100);  //已上传的比例
                            if (rate < 100) {
                                //这里的进度只能表明文件已经上传到后台，但是后台有没有处理完还不知道
                                //因此不能直接显示为100%，不然用户会误以为已经上传完毕，关掉浏览器的话就可能导致上传失败
                                //等响应回来时，再将进度设为100%
                                vm.uploadRate = rate;
                            } else {
                                vm.loadingText = '数据解析中，请稍候...';
                            }
                        }
                    }
                }, this.$route.params.projectId).then(res => {
                    this.isOver = true;
                    setTimeout(() => {
                        this.num++;
                        if (this.timer) {
                            clearInterval(this.timer);
                            this.timer = null;
                        }
                        this.timer = setInterval(() => {
                            if (this.num >= 100) {
                                clearInterval(this.timer);
                                this.num = 0;
                                this.uploadRate = 0;
                                return;
                            }
                            this.num++;
                        }, 100)
                        this.oWidth = '300px';
                        this.num = 100;
                    }, 10);
                    this.fileList.unshift({
                        ensureId: res ? res.ensureId : 0,
                        fileName: this.file.name
                    });
                    //this.activeIndex = this.fileList.length-1;
                    this.activeIndex = 0;
                    //this.tableData = this.tableData;
                    this.tableData = res ? res.dataSlices : this.tableData;
                    this.postObj = res;
                    this.postObj.projectName = this.postObj.projectName || sessionStorage.getItem('projectName');
                    this.longitude = res.lon >= 0 ? '1' : '0';
                    this.latitude = res.lat >= 0 ? '1' : '0';
                    let postObj = Object.assign({}, this.postObj);
                    // postObj.lon = res.lon >= 0 ? postObj.lon : ('-' + postObj.lon);
                    // postObj.lat = res.lat >= 0 ? postObj.lat : ('-' + postObj.lat);
                    this.postObj.lon = Math.abs(this.postObj.lon.toFixed(4));
                    this.postObj.lat = Math.abs(this.postObj.lat.toFixed(4));
                    sessionStorage.setItem(this.projectId + 'fileInfo', JSON.stringify(postObj));
                    sessionStorage.setItem(this.projectId + 'file', JSON.stringify(this.fileList[this.activeIndex]));
                    setTimeout(() => {
                        this.$refs.table.setCurrentRow(this.tableData[0]);
                        this.processLoading = false;
                        this.loadingText = '';
                        this.num = 0;
                        this.uploadRate = 0;
                        if (this.timer) {
                            clearInterval(this.timer);
                            this.timer = null;
                        }
                        this.oWidth = '270px';
                        this.isOver = false;
                    }, 100);
                }).catch(err => {
                    clearInterval(this.timer);
                    this.processLoading = false;
                    this.loadingText = '';
                    this.num = 0;
                    this.uploadRate = 0;
                    this.oWidth = '270px';
                    this.isOver = false;
                })
            },
            getCedian() {
                this.https.getCedian().then(res => {
                    this.cedianList = [].concat(res);
                }).catch(err => {
                    console.log(err)
                })
            },
            getSubType() {
                this.https.getSubType().then(res => {
                    this.subTypeList = [].concat(res);
                }).catch(err => {
                    console.log(err)
                })
            },
            getType() {
                this.https.getType().then(res => {
                    this.typeList = [].concat(res);
                }).catch(err => {
                    console.log(err)
                })
            },
            getFileList() {
                this.https.getFileList(this.$route.params.projectId).then(res => {
                    if (res.length > 0) {
                        this.fileList = res;
                        this.getFileData(this.fileList[this.activeIndex], this.activeIndex, true);
                    } else {
                        this.fullscreenLoading = false;
                    }
                }).catch(err => {
                    console.log(err)
                    this.fullscreenLoading = false;
                })
            },
            deleteFile(id, index) {
                this.https.deleteFile(id).then(res => {
                    this.activeRowIndex = 0;
                    this.fileList.splice(index, 1);
                    if (this.fileList.length > 0) {
                        this.activeIndex = 0;
                        this.fullscreenLoading = true;
                        _toast('删除文件成功');
                        this.getFileData(this.fileList[0], 0, true);
                    } else {
                        this.postObj = {};
                        this.tableData = [];
                        sessionStorage.removeItem(this.projectId + "file");
                        sessionStorage.removeItem(this.projectId + "fileInfo");
                    }
                }).catch(err => {
                    console.log(err)
                })
            },
            submitHandle() {
                if (this.postObj.hasEnsured) {
                    return;
                }
                if (this.tableData.length == 0) {
                    _toast('请上传文件');
                    return;
                }
                if (this.heightFlag) return;
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (this.postObj.hasEnsured && this.postObj.hasEnsured == true) {

                            this.submitAction();
                        } else {
                            this.checkAction();
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            checkAction() {
                var reg1 = /^[0-9]{1,3}°([0-9]{1,2}')?([0-9]{1,2}(.[0-9]{1,})")?$/ig;
                var reg2 = /^[0-9]{1,3}(\s+)[0-9]{1,2}(.[0-9]{1,})$/ig;
                var reg3 = /^[0-9]{1,3}(.[0-9]+)*$/ig;
                if (this.postObj.lat.toString().search(reg1) == 0 && this.postObj.lon.toString().search(reg1) == 0) {
                    this.chuNS();
                } else if (this.postObj.lat.toString().search(reg2) == 0 && this.postObj.lon.toString().search(reg2) == 0) {
                    this.chuDF();
                } else if (this.postObj.lat.toString().search(reg3) == 0 && this.postObj.lon.toString().search(reg3) == 0) {
                    this.chuD();
                } else {
                    _toast('测风塔位置经纬度输入有误，请确认');
                    return;
                }
                let arr = this.tableData.filter(item=>{
                    return item.height>0 || item.height===0;
                })
                if(this.tableData.length!==arr.length){
                    this.$message("表格信息不全，请确认");
                    return;
                }else{
                    this.dialogVisible = true;
                }
            },
            chuNS() {
                this.form = {
                    longitude: '',
                    latitude: ''
                }
                var ar = `${this.postObj.lon}`.replace(/[°'"]/ig, '*').split('*');
                var ar2 = `${this.postObj.lat}`.replace(/[°'"]/ig, '*').split('*');
                ar.pop();
                ar2.pop();
                var jdu = Number(ar[0]) + ((Number(ar[1] ? ar[1] : 0) + (ar[2] ? ar[2] : 0) / 60) / 60);
                var wdu = Number(ar2[0]) + ((Number(ar2[1] ? ar2[1] : 0) + (ar2[2] ? ar2[2] : 0) / 60) / 60);
                this.form.longitude = jdu;
                this.form.latitude = wdu;
            },
            chuDF(val) {
                this.form = {
                    longitude: '',
                    latitude: ''
                }
                var ar = `${this.postObj.lon}`.replace(/[\s]/ig, '*').split('*');
                var ar2 = `${this.postObj.lat}`.replace(/[\s]/ig, '*').split('*');
                var jdu = Number(ar[0]) + (ar[ar.length - 1] / 60);
                var wdu = Number(ar2[0]) + (ar2[ar2.length - 1] / 60);
                this.form.longitude = jdu;
                this.form.latitude = wdu;
            },
            chuD() {
                this.form = {
                    longitude: '',
                    latitude: ''
                }
                this.form.longitude = this.postObj.lon;
                this.form.latitude = this.postObj.lat;
            },
            submitAction() {
                this.fullscreenLoading = true;
                this.dialogVisible = false;
                let postObj = Object.assign({}, this.postObj);
                if (this.longitude == 1) {
                    postObj.lon = Math.abs(this.form.longitude);
                } else {
                    postObj.lon = '-' + this.form.longitude;
                }
                if (this.latitude == 1) {
                    postObj.lat = Math.abs(this.form.latitude);
                } else {
                    postObj.lat = '-' + this.form.latitude;
                }
                postObj.dataSlices = [].concat(this.tableData);

                this.https.putInfo(postObj, this.fileList[this.activeIndex].ensureId).then(res => {
                    this.dialogVisible = false;
                    sessionStorage.setItem(this.projectId + 'fileInfo', JSON.stringify(postObj));
                    sessionStorage.setItem(this.projectId + 'file', JSON.stringify(this.fileList[this.activeIndex]));
                    this.fullscreenLoading = false;
                    this.$router.push({path: `/project/dataProcess/dataMarking/${this.$route.params.projectId}`});
                }).catch(err => {
                    this.dialogVisible = false;
                    console.log(err);
                    this.fullscreenLoading = false;
                })
            }
        }
    }
</script>

<style lang="less">
    .upload {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .cover {
            width: 100vw;
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            z-index: 99999;
            background: rgba(0, 0, 0, 0.8);
            .content {
                position: absolute;
                left: 50%;
                top: 40%;
                transform: translate(-50%, 0);
            }
            .progress {
                width: 300px;
                height: 25px;
                background: #262626;
                overflow: visible;
                border-radius: 20px;
                border-top: 1px solid #000;
                /*border-bottom: 1px solid #7992a8;*/
            }
            .progress .progress-bar {
                height: 25px;
                border-radius: 20px;
                position: relative;
                top: -1px;
                left: -1px;
                transition: width 30s linear;
                animation: animate-positive 30s;
            }
            .progress-bar-info {
                background-color: #5bc0de;
            }
            .progress .progress-value {
                display: block;
                padding: 3px 7px;
                font-size: 13px;
                color: rgba(255, 255, 255, .7);;
                border-radius: 4px;
                background: #191919;
                border: 1px solid #000;
                position: absolute;
                top: -40px;
                right: -10px;
            }
            .progress .progress-value:after {
                content: "";
                border-top: 10px solid #191919;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                position: absolute;
                bottom: -6px;
                left: 26%;
            }
            .progress-bar-striped {
                background-image: linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
                background-size: 40px 40px;
            }
            .progress-bar.active {
                animation: reverse progress-bar-stripes 0.40s linear infinite, animate-positive 30s linear;
            }
            .progress-bar.over {
                animation: reverse progress-bar-stripes 0.40s linear infinite, animate-positive 1s linear;
                transition: width 1s linear;
            }
            @keyframes animate-positive {
                0% {
                    width: 0;
                }
            }
            @keyframes progress-bar-stripes {
                from {
                    background-position: 40px 0
                }

                to {
                    background-position: 0 0
                }
            }
            p {
                color: #409eff;
                text-align: center;
                font-size: 14px;
                margin-top: 15px;
            }
        }
        .upload-box {
            width: 100%;
            height: 128px;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            .upload-left {
                width:calc(100% - 530px);
                display: flex;
                flex-direction: row;
                border: 1px solid rgba(3, 73, 114, 1);
            }
            .upload-right {
                width: 520px;
                min-width:520px;
                height: 127px;
                padding: 13px 14px 0;
                margin-left: 10px;
                border: 1px solid rgba(3, 73, 114, 1);
                .el-form-item__label {
                    padding-right: 4px;
                    text-align: left;
                    color: rgba(255, 255, 255, .7);;
                }
                .el-input__inner {
                    height: 30px;
                    line-height: 28px;
                    border: 1px solid rgba(3, 73, 114, 1);
                    border-radius: inherit;
                    background: transparent;
                    color: rgba(255, 255, 255, .7);;
                }
                .el-form-item__content, .el-form-item__label {
                    line-height: 30px;
                }
                .el-form-item {
                    margin-bottom: 10px;
                    width: 50% !important;
                    float: left;
                    margin-bottom: 15px;
                    .el-form-item__error {
                        padding: 0;
                    }
                    &.inline {
                        .el-form-item__content {
                            margin-left: 50px !important;
                        }
                        .el-form-item__label {
                            width: 50px !important;
                            text-align: right;
                        }
                        .el-input {
                            width: 90px;
                            margin-right: 10px;
                        }
                        .el-select {
                            width: 76px;
                            .el-input__inner {
                                padding-right: 20px;
                            }
                            .el-input {
                                width: 100%;
                            }
                            .el-input__suffix {
                                right: 0;
                            }
                        }
                    }
                }
            }
            .upload-action {
                width: 220px;
                height: 126px;
                .upload-demo {
                    width: 100%;
                    height: 100%;
                    .el-upload {
                        width: 100%;
                        height: 100%;
                        &:focus {
                            color: #343439;
                            i {
                                color: #343439
                            }
                        }
                        .el-upload-dragger {
                            width: 100%;
                            height: 100%;
                            border: none;
                            border-radius: initial;
                            background: linear-gradient(-36deg, rgba(21, 155, 235, 1) 0%, rgba(19, 184, 232, 1) 100%);
                            display: flex;
                            flex-direction: column;
                            align-content: center;
                            i {
                                font-size: 44px;
                                margin: 20px 0 2px;
                                opacity: .3;
                            }
                            p {
                                font-size: 9px;
                                line-height: 18px;
                                text-align: left;
                                text-indent: 30px;
                            }
                            .el-upload__text {
                                width: 180px;
                                height: 34px;
                                color: rgba(255, 255, 255, .7);;
                                line-height: 34px;
                                text-align: center;
                                margin: 10px auto 5px;
                                background: rgba(3, 73, 114, 1);
                                box-shadow: 0px 2px 4px 0px rgba(52, 57, 52, 0.35);
                                border-radius: 17px;
                            }
                        }
                    }
                }
            }
            .upload-list {
                flex: 1;
                overflow: hidden;
                margin: 0 22px;
                .file-list {
                    width: 100%;
                    height: 126px;
                    position: relative;
                    overflow-x: hidden;
                    overflow-y: scroll;
                    > p {
                        width:100%;
                        height: 30px;
                        line-height: 30px;
                        padding-right:40px;
                        /*display: flex;*/
                        /*flex-direction: row;*/
                        /*align-items: center;*/
                        color: rgba(255, 255, 255, .7);;
                        cursor: pointer;
                        transition: all .3s ease-in;
                        position:relative;
                        overflow: hidden;
                        text-overflow:ellipsis;
                        white-space: nowrap;
                        .icon-CombinedShape {
                            margin: 0 8px 0 24px;
                        }
                        span {
                            flex: 1;
                            text-align: left;
                        }
                        .icon-chazi1 {
                            display: none;
                            cursor: pointer;
                            position:absolute;
                            top:0px;
                            right: 15px;
                        }
                        &:hover, &.active {
                            color: #33CDE5;
                            background: rgba(51, 205, 229, .1);
                        }
                        &:hover .icon-chazi1 {
                            display: block;
                            /*color:#E94B4B;*/
                            color: #ccc;
                        }
                    }
                    .no-file {
                        width: 100%;
                        text-align: center;
                        overflow: hidden;
                        position: absolute;
                        left: 0;
                        top: 55%;
                        transform: translate(0, -60%);
                        i {
                            font-size: 40px;
                            color: rgba(255, 255, 255, .3);
                        }
                        p {
                            margin-top: 10px;
                            color: rgba(255, 255, 255, .3);
                        }
                    }
                }
            }
        }
        .data-confirm {
            width: 100%;
            height: ~"calc(100% - 120px)";
            overflow: hidden;
            padding-top: 12px;
            h3 {
                font-size: 16px;
                color: #343439;
                line-height: 32px;
                text-indent: 10px;
                position: relative;
                margin-top: 12px;
                text-align: left;
                font-weight: normal;
                &:before {
                    content: "";
                    width: 4px;
                    height: 16px;
                    background: rgba(51, 205, 229, 1);
                    position: absolute;
                    left: 0;
                    top: 9px;
                }
            }
            .data-box {
                width: 100%;
                height: ~"calc(100% - 10px)";
                display: flex;
                flex-direction: row;
                .table-box {
                    flex: 1;
                    height: 100%;
                    border: 1px solid rgba(3, 73, 114, 1);
                    .el-table {
                        background: transparent;
                        &::before, .el-table__fixed::before {
                            background-color: rgba(3, 73, 114, 1);
                        }
                        td, th {
                            padding: 4px 0;
                        }
                        tr, th {
                            background: transparent;
                            &.is-leaf {
                                border-color: rgba(3, 73, 114, 1);
                            }
                        }
                    }
                }
                .data-detail {
                    width: 290px;
                    overflow: hidden;
                    margin-left: 10px;
                    padding: 0 15px 20px;
                    border: 1px solid rgba(3, 73, 114, 1);
                    overflow: hidden;
                    ul {
                        overflow: hidden;
                        margin-top: 25px;
                    }
                    li {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        text-align: left;
                        margin-bottom: 15px;
                        color: rgba(255, 255, 255, .7);;
                        > span.title {
                            width: 75px;
                            color: rgba(255, 255, 255, .7);;
                            text-align: right;
                        }
                        .el-input__inner {
                            height: 30px;
                            line-height: 28px;
                            background-color: transparent;
                            border-radius: inherit;
                            padding: 0 10px;
                            border-color: rgba(3, 73, 114, 1);
                            color: rgba(255, 255, 255, .7);;
                            &:focus {
                                border-color: #33CDE5;
                                outline: 0;
                                color: rgba(255, 255, 255, .7);;
                            }
                        }
                        .el-input__icon {
                            line-height: 28px;
                            width: 14px;
                        }
                        .height-input {
                            width: 60px;
                            height: 30px;
                            &.error {
                                input {
                                    border-color: @error;
                                }
                            }
                        }
                        .line {
                            margin: 0 5px;
                        }
                        .el-select {
                            flex: 1;
                            height: 30px;
                        }
                        &:last-child {
                            margin-top: 30px;
                        }
                    }
                }
            }
            .btns {
                width: 60px;
                height: 60px;
                overflow: hidden;
                position: fixed;
                right: 130px;
                bottom: 35px;
                border-radius: 15px;
                &.active {
                    display: none;
                }
                .submit {
                    width: 60px;
                    height: 60px;
                    background: rgba(3, 73, 114, 1);
                    box-shadow: 0px 2px 4px 0px rgba(4, 42, 27, 0.35);
                    border-radius: 30px;
                    color: #009FFF;
                    text-align: center;
                    line-height: 60px;
                    font-weight: bold;
                    font-size: 16px;
                    cursor: pointer;
                    &.not-allowed {
                        cursor: default;
                        background: #ccc;
                        display: none;
                    }
                }
            }
        }
    }
</style>