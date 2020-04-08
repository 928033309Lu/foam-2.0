<template>
  <div
    class="calculate-list common-list"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div class="list-header">
      <span>定向计算</span>
      <div class="p-right" v-if="projectCanWrite">
        <button type="button" @click="deleteHandle" class="right-btn delete-all">
          <span>删除</span>
        </button>
        <button type="button" class="right-btn add-new" @click="addHandle">
          <span>新增定向</span>
        </button>
      </div>
    </div>
    <el-table
      class="common-list-table check-common-list-table"
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      v-if="tableHeight"
      border
      row-key="id"
      :max-height="tableHeight"
      :default-sort="sortObj"
      :sort-orders="['ascending', 'descending']"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :reserve-selection="true" min-width="35"></el-table-column>
      <el-table-column
        label="方向"
        prop="angle"
        sortable
        :sort-orders="['ascending', 'descending']"
        min-width="80"
      >
        <template slot-scope="scope">{{ scope.row.angle }}</template>
      </el-table-column>
      <el-table-column
        prop="borderValue"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="稳定度"
        min-width="90"
      >
        <template slot-scope="scope">
          <span>{{changeValue(scope.row.borderValue,true)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="process"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="进度"
        min-width="90"
      >
        <template slot-scope="scope">
          <span>{{scope.row.process+'%'}}</span>
        </template>
      </el-table-column>
      <el-table-column
      :show-overflow-tooltip='true'
        prop="phase"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="状态"
        min-width="90"
      >
        <template slot-scope="scope">
          <span :style="getStyle(scope.row.phase)">{{scope.row.phase}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="meshNum"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="网格量"
        :show-overflow-tooltip="true"
        min-width="100"
      >
        <template slot-scope="scope">
          <span>{{scope.row.phase=='失败'?scope.row.errorMsg:scope.row.meshNum}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="startTime"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="开始时间"
        min-width="160"
      >
        <template slot-scope="scope">
          <span>{{scope.row.startTime | ToTime}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="endTime"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="结束时间"
        min-width="160"
      >
        <template slot-scope="scope">
          <span>{{scope.row.endTime | ToTime}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="convergenceStep"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="收敛步数"
        min-width="95"
      >
        <template slot-scope="scope">
          <span>{{scope.row.convergenceStep}}</span>
          <span
            @click="shou(scope.row.convergenceState)"
            class="shou"
            :class="scope.row.convergenceState!='已收敛'?'shou1':''"
            :style="{color:scope.row.convergenceState!='已收敛'?'red':''}"
          >{{scope.row.convergenceState}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="cost"
        v-if="false"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="计算费用"
        min-width="95"
      ></el-table-column>
      <el-table-column align="right" :width="projectCanWrite ? '200px' : '80px'">
        <template slot-scope="scope">
          <span
            v-if="projectCanWrite"
            size="mini"
            @click="actionHandle(scope.row,'stop')"
          >{{scope.row.status==0?'停止':'删除'}}</span>
          <span
            v-if="projectCanWrite"
            size="mini"
            @click="actionHandle(scope.row,'reset')"
            :class="{'no-allow':scope.row.status==0}"
          >重算</span>
          <span
            size="mini"
            @click="actionHandle(scope.row,'toogle')"
            :class="{'no-allow':scope.row.status!=1}"
          >收敛图</span>
          <span v-if="false" size="mini" @click="actionHandle(scope.row,'goon')">续算</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      width="400px"
      :before-close="handleClose"
    >
      <span>是否要删除勾选的 {{multipleSelection.length}} 个定向任务</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteAction">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :modal-append-to-body='false' title="计算残差的概念：" :visible.sync="shouShow" width="30%">
      <div class='btip'>
        &nbsp; &nbsp; &nbsp; &nbsp;CFD计算中，每一个网格 单元 上都会存储 计算得到的 物理量， 故 每一个网格上的任一个物理量在计算过程中都会存在一个残差 。这意味着在一次迭代过程中，同一物理量在不同的计算网格上有不同的计算残差，而实际上我们在进行CFD计算时，每个迭代步仅对应着一个残差值。 在 CFD计算中，常采用均方根残差（RMS）作为残差值 ，均方根残差是指计算所有网格中残差值的均方根作为本次迭代计算的残差。通常设定某一标准，当迭代计算过程中残差值低于此标准时则认为计算收敛。这也是几乎所有 CFD软件用于判断收敛的基本方法。
         <br/> 
        &nbsp; &nbsp; &nbsp; &nbsp;稳态计算中每一个物理量都有一条残差曲线，当残差曲线低于设定的标准时认为计算收敛。所有的残差曲线均低于设定的标准后计算结束。【风匠】里默认收敛标准是，压力场 P 为0 .0001 ，速度场U（包括三个方向Ux、 U y 、U z ）为1e -05 ，湍动能/湍动能耗散率场（k |epsilon ）为1e -05 。
      </div>
    </el-dialog>
    <opera-dialog
      ref="operaDialog"
      :title="title"
      :form-data="formData"
      @submitAction="submitHandle"
    ></opera-dialog>
    <diagram-card :grid-list="tableData" :grid="activeRow" ref="diagram"></diagram-card>
  </div>
</template>
<script>
import operaDialog from "@/components/project/opera-dialog.vue";
import diagramCard from "@/components/project/diagram-card.vue";
import cfdListServices from "../services/cfdList.service";
import { swicthValue } from "../utils/switchBorderValue";
import { EventBus } from "@/config/event-bus.js";
import { setTimeout } from "timers";

export default {
  mixins: [swicthValue],
  data() {
    return {
        shouShow:false,
      fullscreenLoading: true,
      navList: [
        {
          name: "输入设置",
          icon: "iconsetting",
          path: "direc-calculate",
          params: this.$route.params
        },
        {
          name: "计算结果",
          icon: "iconjiesuanjieguo",
          path: "calculate-list",
          params: this.$route.params
        }
      ],
      projectId: this.$route.params.projectId || 1,
      tableData: [],
      multipleSelection: [],
      sortObj: {
        prop: "angle",
        order: "ascending"
      },
      dialogVisible: false,
      formData: {
        angle: "",
        resolutionHorizontal: "",
        resolutionVertical: "",
        maxIterateStep: "",
        borderValue: 10000
      },
      title: "",
      activeRow: {},
      type: "",
      tableHeight: 0
    };
  },
  components: { operaDialog, diagramCard },
  props: [],
  computed: {
    projectCanWrite() {
      let bool = true;
      this.projectId == this.$store.state.curProjectId &&
        (bool = this.$store.state.projectCanWrite);
      return bool;
    }
  },
  mounted() {
    this.tableHeight =
      document.querySelector(".calculate-list").offsetHeight - 76;
    this.getList();
    this.getSinProject(this.projectId);
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    shou(data) {
        if(data!='已收敛'){
            this.shouShow=true;
        }
    },
    sortChange(column, prop, order) {
      this.sortObj = {
        prop: column.prop,
        order: column.order
      };
    },
    actionHandle(row, type) {
      this.activeRow = Object.assign({}, row);
      this.type = type;
      if (type == "stop") {
        if (row.status == 0) {
          this.$confirm("此操作将停止该定向, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            center: true
          })
            .then(() => {
              this.stopCalculate(row);
            })
            .catch(() => {
              console.log("取消停止");
            });
        } else {
          this.$confirm("此操作将永久删除该定向, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            center: true
          })
            .then(() => {
              this.deleteCalculate(row);
            })
            .catch(() => {
              console.log("取消删除");
            });
        }
      } else if (type == "reset") {
        if (row.status == 0) return;
        this.title = "重新计算";
        this.formData = {
          angle: [row.angle],
          resolutionHorizontal: row.resolutionHorizontal,
          resolutionVertical: row.resolutionVertical,
          maxIterateStep: row.maxIterateStep,
          borderValue: row.borderValue
        };
        setTimeout(() => {
          this.$refs.operaDialog.showDialog();
        }, 0);
      } else if (type == "toogle") {
        if (row.status == 1) this.showDiagramAction(row);
        else return;
      } else {
        this.title = "续算";
        this.formData = {
          angle: row.angle,
          resolutionHorizontal: row.resolutionHorizontal,
          resolutionVertical: row.resolutionVertical,
          maxIterateStep: row.maxIterateStep,
          borderValue: row.borderValue
        };
        this.$refs.operaDialog.showDialog();
      }
    },
    showDiagramAction(grid) {
      //this.activeGrid = grid;
      this.$refs.diagram.showDialog();
    },
    handleClose(done) {
      done();
    },
    deleteHandle() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          message: "请选择所要删除项",
          type: "warning"
        });
      } else {
        this.dialogVisible = true;
      }
    },
    deleteAction() {
      cfdListServices
        .deleteAllCalculate(
          this.projectId,
          this.multipleSelection.map(item => {
            return item.id;
          })
        )
        .then(res => {
          this.getList();
          this.dialogVisible = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    addHandle() {
      this.type = "add";
      this.formData = {
        angle: "",
        resolutionHorizontal: 25,
        resolutionVertical: 2,
        maxIterateStep: 3000,
        borderValue: 10000
      };
      this.title = "新增定向";
      this.$refs.operaDialog.showDialog();
    },
    getStyle(arg) {
      let obj = {
        color: ""
      };
      if (arg == "初始化") {
        obj.color = "#FFAE00";
      } else if (arg == "网格划分") {
        obj.color = "#00FFFF";
      } else if (arg == "排队中") {
        obj.color = "#FFAE00";
      } else if (arg == "求解中") {
        obj.color = "#009FFF";
      } else if (arg == "完成") {
        obj.color = "#ffffff";
      } else if (arg == "失败" || arg == "挂起") {
        obj.color = "#F63737";
      } else if (arg == "停止中" || arg == "取消") {
        obj.color = "#CF7AEE";
      } else {
        obj.color = "#fff";
      }
      return obj;
    },
    getSinProject(projectId) {
      this.projectHttps
        .getSinProject(projectId)
        .then(res => {
          EventBus.$emit("addition", {
            projectName: res.projectName,
            status: res.status
          });
          let query = JSON.parse(JSON.stringify(this.$route.query));
          query.status = res.status;
          this.$router.push({ query: query });
        })
        .catch(err => {
          console.log(err);
        });
    },
    getList() {
      cfdListServices
        .getList(this.projectId)
        .then(res => {
          this.fullscreenLoading = false;
          if (res && res.length != 0) {
            this.tableData = [].concat(res);
            let arr = this.tableData.filter(item => {
              return item.status == 1 || item.status == 2;
            });
            if (
              arr.length != this.tableData.length &&
              this.$route.name == "calculate"
            ) {
              clearInterval(window.timer);
              window.timer = setInterval(() => {
                this.getList();
                this.getSinProject(this.projectId);
              }, 20000);
            } else {
              this.getSinProject(this.projectId);
            }
          } else {
            this.tableData = [];
            let query = JSON.parse(JSON.stringify(this.$route.query));
            query.status = 1;
            this.$router.push({ query: query });
          }
        })
        .catch(err => {
          this.fullscreenLoading = false;
          console.log(err);
        });
    },
    stopCalculate(row) {
      cfdListServices
        .stopCalculate(this.projectId, row.id)
        .then(res => {
          clearInterval(window.timer);
          this.getList();
        })
        .catch(err => {
          console.log(err);
        });
    },
    deleteCalculate(row) {
      cfdListServices
        .deleteCalculate(this.projectId, row.id)
        .then(res => {
          this.$message({
            message: "删除成功",
            type: "success"
          });
          clearInterval(window.timer);
          this.getList();
        })
        .catch(err => {
          console.log(err);
        });
    },
    addCalculate(obj) {
      let {
        borderValue,
        maxIterateStep,
        resolutionHorizontal,
        resolutionVertical
      } = obj;
      let cfdRuns = obj.angle.map(v => {
        return {
          angle: v,
          borderValue,
          maxIterateStep,
          resolutionHorizontal,
          resolutionVertical
        };
      });
      cfdListServices
        .addCalculate(this.projectId, cfdRuns)
        .then(res => {
          clearInterval(window.timer);
          this.getList();
          this.$refs.operaDialog.hideDialog();
          this.$message({
            message: "添加成功",
            type: "success"
          });
        })
        .catch(err => {
          this.fullscreenLoading = false;
          console.log(err);
        });
    },
    submitHandle(obj) {
      this.fullscreenLoading = true;
      if (this.type == "reset") {
        this.recalculateHandle(obj);
      } else if (this.type == "add") {
        this.addCalculate(obj);
      }
    },
    recalculateHandle(obj) {
      obj.angle= obj.angle.join(',');
      cfdListServices
        .reCalculate(this.projectId, this.activeRow.id, obj)
        .then(res => {
          clearInterval(window.timer);
          this.getList();
          this.$refs.operaDialog.hideDialog();
        })
        .catch(err => {
          console.log(err);
          this.fullscreenLoading = false;
        });
    },
    closeTimer() {
      if (window.timer) {
        clearInterval(window.timer);
        window.timer = null;
        return;
      }
    }
  },
  watch: {},
  beforeRouteLeave(to, from, next) {
    if (window.timer) {
      clearInterval(window.timer);
      window.timer = null;
    }
    next();
  }
};
</script>

<style lang="less">
@import "../assets/less/common-list.less";

.calculate-list {
  height: calc(100% - 48px);
  overflow: hidden;
  .el-select__tags {
    height: auto !important;
  }
  .shou {
    margin-left: 5px;   
  }
  .shou1{
    cursor:pointer;
  }
  .btip{
      padding:0 20px;
      margin:-10px 0;
      text-align: justify;
      color:#DFE4EB;
  }
}
</style>
