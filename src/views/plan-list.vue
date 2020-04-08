<template>
    <div class="plan">
        <div v-if="projectCanWrite" style='margin-bottom:10px;text-align:right'>
            <button class="newbtn mybtn" @click="open">
                <i class="iconfont iconxinjian"></i> 新建方案
            </button>
        </div>

        <div class="plan-list">
            <el-table
                class="my-table"
                :data="planList"
                tooltip-effect="dark"
                style="width: 100%"
            >
                <el-table-column width="90" label="方案ID" prop="id">

                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="postProcessName" label="方案名称"></el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="phase" label="状态">
                </el-table-column>
                <el-table-column prop="process" label="进度" :formatter="formatter">
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="theoreticalHours" label="尾流后小时数">
                    <template slot-scope="scope">
                        <span>{{ scope.row.wakedHours || scope.row.errorMsg}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="wakeModel" label="尾流模型">
                    <template slot-scope="scope">
                        <span>{{ scope.row.wakeModel=='线性PARK模型' && 'PARK模型' || scope.row.wakeModel}}</span>
                    </template>
                </el-table-column>

                <el-table-column :show-overflow-tooltip='true' prop="gmtCreated" min-width="160px" label="创建时间">
                    <template slot-scope="scope">
                        <span>{{ scope.row.gmtCreated | moment }}</span>
                    </template>
                </el-table-column>

                <el-table-column align="center" label="操作"
                                 :width="projectCanWrite ? (planList.filter(v=>{return v.status == 2}).length ? '250px' : '150px') : '180px'">
                    <template slot-scope="scope">
                        <span @click="jump(scope.row)">查看</span>
                        <span v-if="scope.row.wakeModel != '致动盘' && projectCanWrite" @click="copyPlan(scope.row)">复制</span>
                        <span  v-if="scope.row.wakeModel == '致动盘' && projectCanWrite" style="opacity:0">隐藏</span>
                        <span v-if="projectCanWrite" class='del' @click="delPlan(scope.row)">删除</span>
                        <span v-if="scope.row.status == 2" class='d3' @click="show3D(scope.row)"><i
                            class="iconfont iconsanwei1"></i>三维展示</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="ye" v-show='planList && planList.length'>
            <el-pagination
                @current-change="handleCurrentChange"
                :current-page.sync="fen.pageNo"
                :page-size="pageSize"
                layout="prev, pager, next, jumper"
                :total="fen.totalRows"
            ></el-pagination>
        </div>
        <el-dialog
            title="新建方案"
            :close-on-click-modal="false"
            :visible.sync="dialogFormVisible"
            :modal-append-to-body="false"
            width="400px"
        >
            <el-form
                ref="Form"
                size="mini"
                :model="form"
                label-width="90px"
                class="my-form"
                :rules="rules"
            >
                <el-form-item label="方案名称:" prop="schemeName">
                    <el-input style="display:none"></el-input>
                    <el-input v-model.trim="form.schemeName" style="width:230px"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align:center">
                <button :disabled="disabled" class="noborbtn" @click="newPlan(form)">确 定</button>
            </div>
        </el-dialog>
        <window3D ref="window3D"></window3D>
    </div>
</template>

<script>
    import {autoList} from "@/utils/mixin.js";
    import window3D from '@/components/project/plan/window3D'

    export default {
        mixins: [autoList],
        name: "",
        data() {
            return {
                fixFun: null,
                project_id: this.$route.params.projectId,
                disabled: false,
                timer: null,
                planList: [],
                fen: {
                    totalRows: null,
                    pageNo: 1,
                },
                dialogFormVisible: false,
                form: {
                    schemeName: "",
                },
                rules: {
                    schemeName: [
                        {required: true, message: "请输入方案名称", trigger: "blur"},
                        {
                            min: 1,
                            max: 100,
                            message: "长度在 100 个字符以内",
                            trigger: "blur"
                        }
                    ],
                }
            };
        },
        components: {window3D},
        computed: {
          projectCanWrite (){
            let bool = true
            this.project_id == this.$store.state.curProjectId && (bool = this.$store.state.projectCanWrite)
            return  bool
          }
        },
        created() {
            this.fixFun = this.debounce(this.displayWindowSize.bind(this, this.getPlanList.bind(this, this.project_id)), 1000, true);
        },
        mounted() {
            window.addEventListener("resize", this.fixFun);
            // this.getPlanList(this.project_id,1);
        },
        destroyed() {
            clearTimeout(this.timer);
            this.timer = null;
            window.removeEventListener("resize", this.fixFun);
        },
        methods: {
            getPlanList(project_id, pageIndex = this.fen.pageNo) {
                this.projectHttps.getPlanList(project_id, pageIndex, this.pageSize).then(res => {
                    let _this = this;
                    this.planList = res.data || [];
                    let {totalRows, pageNo} = res;
                    this.fen = {totalRows, pageNo};
                    let status = this.planList.findIndex(item => item.status === 1);
                    if (status != -1) {
                        if (_this.timer) clearTimeout(_this.timer);
                        _this.timer = setTimeout(() => {
                            _this.getPlanList(project_id, this.fen.pageNo);
                        }, 15000)
                    } else {
                        clearTimeout(_this.timer);
                        _this.timer = null;
                    }
                }).catch(err => console.log(err));
            },
            formatter(row, column) {
                return row[column.property] ? (row.process + '%') : '--';
            },
            handleCurrentChange(val) {
                // this.formInline.page = val;
                this.getPlanList(this.project_id, val);
            },
            open() {
                this.dialogFormVisible = true;
                this.disabled = false;
            },
            newPlan(form) {
                this.$refs["Form"].validate(valid => {
                    if (valid) {
                        this.disabled = true;
                        form.project_id = this.project_id;
                        this.projectHttps
                            .newPlan(form)
                            .then((res) => {
                                this.dialogFormVisible = false;
                                this.$refs["Form"].resetFields();
                                this.$router.push({name: 'plan', params: {id: res.id, projectId: res.projectId}})

                            })
                            .catch(err => {
                                this.disabled = false;
                            });
                    } else {
                        this.disabled = false;
                        console.log("error submit!!");
                        return false;
                    }
                });
            },

            copyPlan(row) {
                this.projectHttps.copyPlan(row).then(res => {
                    this.$message("复制成功");
                    this.$router.push({name: 'plan', params: {id: res.id, projectId: res.projectId}})
                }).catch(err => console.log(err));
            },
            delPlan(row) {
                this.$confirm("此操作将永久删除该方案, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    cancelButtonClass: 'noborbtn',
                    confirmButtonClass: 'noborbtn',
                    type: "warning"
                })
                    .then(() => {
                        this.projectHttps.delPlan(row).then(() => {
                            this.getPlanList(this.project_id, 1);
                            this.$message("删除成功");
                        }).catch(err => console.log(err));
                    })
                    .catch(() => {
                    });
            },
            jump(row) {
                this.$router.push({
                    name: 'plan',
                    params: {id: row.id, projectId: row.projectId},
                    query: Object.assign(this.$route.query, {planStatus: row.status})
                })
            },
            show3D(row) {
                this.$refs.window3D.showDialog(row.id)
            }
        },
        watch: {
            '$route'(cur) {
                // if(cur.path.includes('/project/planList')){
                // this.fixFun=this.debounce(this.displayWindowSize.bind(this,this.getPlanList.bind(this,this.project_id)),1000,true);
                // }
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    .plan {
        padding: 10px 20px;
        .ye {
            padding: 14px 10px 0;
            text-align: right;
            //.bor(@inputColor);
            border-top: none;
        }
        .newbtn {
            vertical-align: top;
            /*margin-right: 18px;*/
            line-height: 18px;
            width: 90px;
            height: 28px;
            text-align: center;
            font-size: 14px;
            &:focus {
                outline: none;
            }
        }
        .plan-list {
            .bor(@inputColor);
            border-bottom: none;
            .my-table {
                color: @whiteColor;
                background: none;
                &::before {
                    background-color: #034972;
                }
                tr {
                    background: none;
                    position: relative;
                }
                th {
                    background: #034972;
                    position: relative;
                    padding: 6px 0;
                    border-color: #034972;
                    color: @whiteColor !important;
                    white-space: nowrap;
                }
                td {
                    background: none;
                    position: relative;
                    padding: 0;
                    border-color: #034972;
                    .cell {
                        height: 34px;
                        line-height: 34px;
                        span.no-allow {
                            color: #ccc;
                            cursor: not-allowed !important;
                        }
                        .d3 {
                            width: 98px;
                            height: 24px;
                            line-height: 24px;
                            text-align: center;
                            > * {
                                vertical-align: top;
                            }
                            .iconfont {
                                font-size: 16px;
                                margin-right: 5px;
                                margin-left: -2px;
                            }
                            &:hover {
                                background-color: #012D47;
                                border-radius: 12px;
                            }
                        }
                    }
                }
                .cell {
                    .el-checkbox {
                        .el-checkbox__input {
                            width: 14px;
                            height: 14px;
                            border: 1px solid rgba(0, 159, 255, 1);
                            border-radius: 2px;
                            box-sizing: border-box;
                            overflow: hidden;
                            &.is-checked {
                                border: none;
                                background: rgba(3, 73, 114, 1);
                                .el-checkbox__inner {
                                    width: 14px;
                                    height: 14px;
                                    &::after {
                                        left: 5px;
                                        top: 2px;
                                    }
                                }
                            }
                            .el-checkbox__inner {
                                background-color: none;
                                border: none;
                                width: 12px;
                                height: 12px;
                                &::after {
                                    border-color: #009fff;
                                }
                            }
                        }
                    }
                }
                tbody {
                    tr {
                        td:first-child:before {
                            display: none;
                            position: absolute;
                            left: 0px;
                            top: -1px;
                            content: "";
                            width: 3px;
                            height: 34px;
                            border: 1px solid #009fff;
                            border-right: none;
                        }
                        td:last-child:after {
                            display: none;
                            position: absolute;
                            right: 0px;
                            top: -1px;
                            content: "";
                            width: 3px;
                            height: 34px;
                            border: 1px solid #009fff;
                            border-left: none;
                        }
                        td:last-child {
                            text-align: left;
                            .cell {
                                span {
                                    display: inline-block;
                                    margin: 2px 5px;
                                    cursor: pointer;
                                    &:hover {
                                        color: #009fff;
                                        &.no-allow {
                                            color: #ccc;
                                        }
                                    }
                                  &:first-child{
                                    margin-left: 0;
                                  }
                                }
                                .del:hover {
                                    color: @error;
                                }
                            }
                        }
                        &:first-child {
                            td:first-child:before,
                            td:last-child:after {
                                height: 33px;
                                top: 0;
                            }
                        }
                        &:last-child {
                            td:first-child:before,
                            td:last-child:after {
                                height: 33px;
                            }
                        }
                    }
                    tr:hover {
                        background: url(/imgs/table-bg.png) no-repeat 3px 2px;
                        background-size: calc(100% - 6px) 30px;
                        color: @hWhiteColor;
                        td {
                            background: transparent;
                            &:first-child:before {
                                display: block;
                            }
                            &:last-child:after {
                                display: block;
                            }
                        }
                        &:before,
                        &:after {
                            display: inline-block;
                        }
                    }
                }
            }
        }
    }
</style>
