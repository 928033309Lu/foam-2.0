<template>
    <div class="plan">
        <div v-if="projectCanWrite" style='margin-bottom:10px;text-align:right'>
            <el-select
                    @change="getWrfList(project_id)"
                    size="mini"
                    v-model="phase"
                    placeholder="请选择"
                    class="no-bor"
            >
                <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                ></el-option>
            </el-select>
            <button class="newbtn mybtn" @click="open">
                <i class="iconfont iconxinjian"></i> 新增计算
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
                <el-table-column :show-overflow-tooltip='true' prop="name" label="名称"></el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="dataBegin" label="数据时间段">
                    <template slot-scope="scope">
                        <span>{{ scope.row.dataBegin | ToDian}}-{{  scope.row.dataEnd |ToDian}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="beginTime" label="计算开始时间">
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="endTime" label="计算结束时间">

                </el-table-column>
                <el-table-column prop="totalTime" label="计算时长">
                </el-table-column>

                <el-table-column :show-overflow-tooltip='true' prop="cost" label="实际花费">
                </el-table-column>
                <el-table-column :show-overflow-tooltip='true' prop="phase" label="计算状态">

                </el-table-column>

                <el-table-column align="center" label="操作"
                                 width="180px'">
                    <template slot-scope="scope">
                        <span @click="jump(scope.row)">查看</span>
                        <span @click="copyWrf(scope.row.id)">复制</span>
                        <span class='del' @click="delWrf(scope.row.id)">删除</span>
                        <span @click="endWrf(scope.row.id)">终止</span>

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
            title="新增计算"
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
                <el-form-item label="名称:" prop="name">
                    <el-input v-model.trim="form.name" style="width:230px"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer" style="text-align:center">
                <button :disabled="disabled" class="noborbtn" style="margin-right: 20px" @click="newWrf(form)">确 定</button>
                <button class="noborbtn" @click="dialogFormVisible=false">取消</button>

            </div>
        </el-dialog>
    </div>
</template>

<script>
    import {autoList} from "@/utils/mixin.js";

    export default {
        mixins: [autoList],
        data() {
            return {
                fixFun: null,
                project_id: this.$route.params.projectId,
                disabled: false,
                timer: null,
                phase:"全部",
                options:[
                    {value:"全部"},
                    {value:'编辑中'},
                    {value:'计算中'},
                    {value:'计算失败'},
                    {value:'已终止'},
                    {value:'计算成功'},
                    {value:'停止中'},
                    {value:'排队中'},
                ],
                planList: [],
                fen: {
                    totalRows: null,
                    pageNo: 1,
                },
                dialogFormVisible: false,
                form: {
                    name: "",
                },
                rules: {
                    name: [
                        {required: true, message: "请输入名称", trigger: "blur"},
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
        computed: {
          projectCanWrite (){
            let bool = true
            this.project_id == this.$store.state.curProjectId && (bool = this.$store.state.projectCanWrite)
            return  bool
          }
        },
        created() {
            this.fixFun = this.debounce(this.displayWindowSize.bind(this, this.getWrfList.bind(this, this.project_id)), 1000, true);
        },
        mounted() {
            window.addEventListener("resize", this.fixFun);
            // this.getWrfList(this.project_id,1);
        },
        destroyed() {
            clearTimeout(this.timer);
            this.timer = null;
            window.removeEventListener("resize", this.fixFun);
        },
        methods: {
            getWrfList(project_id, pageIndex = this.fen.pageNo,phase=this.phase) {
                this.projectHttps.getWrfList(project_id, pageIndex, this.pageSize,phase).then(res => {
                    let _this = this;
                    this.planList = res.data || [];
                    let {totalRows, pageNo} = res;
                    this.fen = {totalRows, pageNo};

                }).catch(err => console.log(err));
            },
            handleCurrentChange(val) {
                // this.formInline.page = val;
                this.getWrfList(this.project_id, val);
            },
            open() {
                this.dialogFormVisible = true;
                this.disabled = false;
            },
            newWrf(form) {
                this.$refs["Form"].validate(valid => {
                    if (valid) {
                        this.disabled = true;
                        this.projectHttps
                            .newWrf(this.project_id,form.name)
                            .then((res) => {
                                this.getWrfList(this.project_id, 1);
                                this.dialogFormVisible=false;
                                this.$refs["Form"].resetFields();
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

            copyWrf(id) {
                this.projectHttps.copyWrf(id).then(res => {
                    this.$message("复制成功");
                    this.getWrfList(this.project_id, 1);
//                    this.$router.push({name: 'plan', params: {id: res.id, projectId: res.projectId}})
                }).catch(err => console.log(err));
            },
            delWrf(row) {
                this.$confirm("此操作将永久删除该计算, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    cancelButtonClass: 'noborbtn',
                    confirmButtonClass: 'noborbtn',
                    type: "warning"
                })
                    .then(() => {
                        this.projectHttps.delWrf(row).then(() => {
                            this.getWrfList(this.project_id, 1);
                            this.$message("删除成功");
                        }).catch(err => console.log(err));
                    })
                    .catch(() => {
                    });
            },
            endWrf(row) {
                this.$confirm("此操作将终止该方案, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    cancelButtonClass: 'noborbtn',
                    confirmButtonClass: 'noborbtn',
                    type: "warning"
                })
                    .then(() => {
                        this.projectHttps.endWrf(row).then(() => {
                            this.getWrfList(this.project_id, 1);
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

        },
        watch: {
            '$route'(cur) {
                // if(cur.path.includes('/project/planList')){
                // this.fixFun=this.debounce(this.displayWindowSize.bind(this,this.getWrfList.bind(this,this.project_id)),1000,true);
                // }
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    .plan {
        padding: 10px 20px;
        .no-bor{
            float: left;
        }
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
