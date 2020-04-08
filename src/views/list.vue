
<template>
  <div class="list" v-show="show"
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="loading...">
    <div class="list-name">
      <el-form :inline="true" :model="formInline" style="display:inline-block">
        <el-form-item label style='width:110px'>
          <el-select
            @change="pgetList()"
            size="mini"
            v-model="formInline.projectType"
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
        </el-form-item>
        <el-form-item label>
          <el-select
            @change="pgetList()"
            size="mini"
            v-model="formInline.order"
            placeholder="排序"
            class="no-bor"
          >
            <el-option
              v-for="item in conditions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            @keyup.enter.native="pgetList()"
            clearable
            class="no-bor"
            size="mini"
            v-model="formInline.searchConditions"
            placeholder="请输入内容"
          >
            <i slot="suffix" class="el-icon-search" style="font-size: 14px; margin-right: 4px; margin-top: 8px;" @click="pgetList()"></i>
          </el-input>
        </el-form-item>
      </el-form>

      <div class="icons f-right">
        <button class="newbtn mybtn" @click="open">
          <i class="iconfont iconxinjian"></i> 新建项目
        </button>
        <i @click="$router.push('/map/')" class="iconfont iconditu1" style="font-size:20px"></i>
      </div>
    </div>
    <div class="table-content">
      <el-table class="my-table" :data="listData" tooltip-effect="dark" style="width: 100%">
        <el-table-column width="90" label="项目ID" prop="projectId"></el-table-column>
        <el-table-column  prop="projectName" label="项目名称">
          <template slot-scope="scope">
            
            <input @keyup.enter='putName(scope.row,$event)' @blur='putName(scope.row,$event)' class='edit-input' v-model="scope.row.projectName" v-if='scope.row.flag' placeholder="请输入内容">
            <el-tooltip  v-else class="item" effect="dark" :content="scope.row.projectName" placement="top-start">
              <span class='shenglue'>{{scope.row.projectName}}</span> 
          </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改的项目名称，仅对新提交的方案生效。" placement="top-end">
      <i v-if='scope.row.userId == $store.state.userInfo.userid' class="el-icon-edit-outline" @click="editName(scope.row,$event)"></i>  
    </el-tooltip>
                    
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="province" label="位置">
          <template slot-scope="scope">
            <span>{{`${scope.row.province||'--'}${scope.row.city||''}${scope.row.town||''}`}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status===0" style="color:#FF2E76">未完成</span>
            <span v-if="scope.row.status===1" style="color:#FF2E76">定向配置中</span>
            <span v-if="scope.row.status===2" style="color:#FF2E76">定向计算中</span>
            <span v-if="scope.row.status===3" style="color:#009FFF">方案</span>
            <span v-if="scope.row.status===4" style="color:#FF2E76">综合计算中</span>
            <span v-if="scope.row.status===5" style="color:#FF2E76">完成</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="projectGmtCreated" label="创建时间"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" width="100px" prop="userRealName" label="创建人"></el-table-column>

        <el-table-column align="center" label="操作" width="150px">
          <template slot-scope="scope">
            <div v-if="!scope.row.isCopying">
              <span @click="goto(scope.row)">查看</span>
              <span @click="copyProject(scope.row)">复制</span>
              <!-- <span>分享</span> -->
              <span v-if="scope.row.userId == $store.state.userInfo.userid" class="del" @click="delProject(scope.row)">删除</span>
              <!-- <span @click="ArchivedProject(scope.row)">归档</span> -->
            </div>
            <div v-else>
              正在复制中...
            </div>
            
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="ye" v-show="listData.length">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="fen.pageNo"
        :page-size="pageSize"
        layout="prev, pager, next, jumper"
        :total="fen.totalRows"
      ></el-pagination>
    </div>
    <el-dialog
      title="新建项目"
      :close-on-click-modal="false"
      :visible.sync="dialogFormVisible"
      :modal-append-to-body="false"
      width="400px"
    >
      <el-form
        ref="ruleForm"
        size="mini"
        :model="form"
        label-width="90px"
        class="my-form"
        :rules="rules"
      >
        <el-form-item label="项目名称:" prop="projectName">
          <el-input v-model.trim="form.projectName" style="width:230px"></el-input>
        </el-form-item>
        <el-form-item label="投影系:" prop="projectionSystem">
          <el-select
          filterable
            @change="getZone(form.projectionSystem)"
            style="width:230px"
            v-model="form.projectionSystem"
            placeholder="请选择投影"
          >
            <el-option
              v-for="(it,index) in projectionSystemData"
              :key="index"
              :label="it"
              :value="it"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="zone" ref="zone">
          <el-select
          filterable
            @change="getZoneRange(form.projectionSystem,form.zone)"
            style="width:230px"
            v-model="form.zone"
            placeholder="请选择基准"
          >
            <el-option v-for="(it,index) in zoneData" :key="index" :label="it" :value="it"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="zoneRange" ref="zoneRange" v-show='zoneRangeData.length&&zoneRangeData[0].zonerange'>
          <el-select filterable style="width:230px" v-model="form.zoneRange" placeholder="请选择地区">
            <el-option
              v-for="it in zoneRangeData"
              :key="it.id"
              :label="it.zonerange"
              :value="it.zonerange"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:center">
        <button :disabled="disabled" style="width:80px;height:30px" class="noborbtn" @click="newProject(form)">确 定</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import listItem from "@/components/list-item";
import { delimiter } from "path";
import { EventBus } from "@/config/event-bus.js";
import { setInterval, clearInterval, setTimeout } from 'timers';
import { autoList } from "@/utils/mixin.js";
export default {
  mixins:[autoList],
  data() {
    return {
      loading: false,
      fixFun:null,
      disabled: false,
      timer:null,
      dialogFormVisible: false,
      listData: [],
      projectionSystemData: [],
      zoneData: [],
      zoneRangeData: [],
      show: true,
      form: {
        projectName: "",
        projectionSystem: "",
        zone: "",
        zoneRange: "",
        epsgNum: ""
      },
      fen: {},
      rules: {
        projectName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
          {
            min: 1,
            max: 100,
            message: "长度在 100 个字符以内",
            trigger: "blur"
          }
        ],
        projectionSystem: [
          { required: true, message: "必填项", trigger: "change" }
        ],
        zone: [{ required: true, message: "必填项", trigger: "change" }],
        zoneRange: [{ required: true, message: "必填项", trigger: "change" }]
      },
      formInline: {
        condition: "PRODATE",
        projectType: "1",
        searchConditions: "",
        order: "",
        page: 1
      },
      options: [
        {
          value: "1",
          label: "我的项目"
        },
        // {
        //   value: "2",
        //   label: "团队项目"
        // },
        // {
        //   value: "3",
        //   label: "分享项目"
        // },
        // {
        //   value: "4",
        //   label: "归档项目"
        // }
      ],
      conditions: [
        {
          value: "DESC",
          label: "按项目创建时间降序"
        },
        {
          value: "ASC",
          label: "按项目创建时间升序"
        }
      ],
      endTime:'',
    };
  },
  components: {
    listItem
  },
  props: {},
  computed: {},
  created() {
    this.getUserTime();
    sessionStorage.setItem("projectName", "");
    EventBus.$emit("addition", {
      projectName: sessionStorage.getItem("projectName")
    });
    this.fixFun=this.debounce(this.displayWindowSize.bind(this,this.getList),1000,true);
  },
  mounted() {
    window.addEventListener("resize",this.fixFun);
    this.getProjectionSystem();
    if (this.$route.params.isAdd) {
      this.dialogFormVisible = true;
    }
    this.timer=setInterval(()=>{
      this.getUserTime();
    },15000)
  },
  destroyed(){
    clearInterval(this.timer);
    this.timer=null;
    window.removeEventListener("resize",this.fixFun);
  },
  methods: {
    putName(row,event){
      let value = event.currentTarget.value;
      let reg=/\S{1,100}/;
      if(!reg.test(value)){
        event.currentTarget.classList.add("err-input")
        this.$message({
          showClose: true,
          message: '请输入长度为1-100之间的非空白字符',
          type: 'error'
        });
        return;
      }
      this.projectHttps.putName(row).then(res => {
        row.flag=false;
      }).catch(err=>{
        console.log(err)
      });
    },
    editName(data,event){
      data.flag=true;
      var el = event.currentTarget;
      setTimeout(()=>{
        el.previousElementSibling.focus()
      },500)
          
    },
    pgetList() {
      this.formInline.page = 1;
      this.getList();
    },
    //获取用户更新项目时间
    getUserTime() {
      let _this=this;
      this.projectHttps.getUserTime().then(res => {
        
        if(_this.endTime!=res){
          _this.getList();
          _this.endTime=res;
        }
      }).catch(err=>{
        console.log(err)
      });
    },
    //获取单个项目信息
    getList(formInline = this.formInline) {
      formInline.pageSize = this.pageSize;
      this.projectHttps.getList(formInline).then(res => {
        let list=res.data.map(it=>{
           it.flag=false;
          return it;
        })
        this.listData = list;
        let { totalRows, pageNo } = res;
        this.fen = { totalRows, pageNo };
      }).catch(err=>{
        console.log(err)
      });
    },
    handleCurrentChange(val) {
      this.formInline.page = val;
      this.getList();
    },
    goto(item) {
      sessionStorage.setItem("detail", JSON.stringify(item));
      sessionStorage.setItem("projectName", item.projectName);
      sessionStorage.setItem("status", item.status);
      
      let projectCanWrite = 1;
      (item.userId || item.userId===0) && (projectCanWrite = (item.userId == this.$store.state.userInfo.userid && 1 || 0))
      
      localStorage.setItem('curProjectId', item.projectId)
      localStorage.setItem('projectCanWrite', projectCanWrite)
      this.$store.commit('setCurProjectId', item.projectId)
      this.$store.commit('setProjectCanWrite', projectCanWrite)
      if (item.status <= 2) {
        this.$router.push({
          name: "calculate",
          params: {
            projectId: item.projectId,
            projectName: item.projectName,
          },
          query:{
            status: item.status
          }
        });
      } else if (item.status >= 3) {
         this.$router.push({
          name: "planList",
          params: {
            projectId: item.projectId,
            projectName: item.projectName,
          },
           query:{
             status: item.status
           }
        });
      } else {
        return;
      }
      // window.open(routeUrl.href, "_blank");
      EventBus.$emit("addition", {
        projectName: sessionStorage.getItem("projectName"),
        status:item.status,
      });
    },
    copyProject(item) {
      this.loading=true;
      this.projectHttps.copyProject(item).then(() => {
        this.loading=false;
        this.pgetList();
        this.$message("已开始复制");
      }).catch(err=>{
        console.log(err);
        this.loading=false;
      });
    },
    delProject(item) {
      this.$confirm("此操作将永久删除该项目, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "noborbtn",
        confirmButtonClass: "noborbtn",
        type: "warning"
      })
        .then(() => {
          this.loading=true;
          this.projectHttps.delProject(item).then(() => {
            this.loading=false;
            this.pgetList();
            this.$message("删除成功");
          });
        })
        .catch(() => {this.loading=false;});
    },
    ArchivedProject(item) {
      this.projectHttps
        .ArchivedProject(item)
        .then(() => {
          this.pgetList();
          this.$message("归档成功");
        })
        .catch(err => console.log(err));
    },
    newProject(form) {
      if(this.zoneRangeData.length==1&&!this.zoneRangeData[0].zonerange){
            this.form.zoneRange=0;
            form.epsgNum = this.zoneRangeData[0].num;
          }else{
            form.epsgNum = this.zoneRangeData.find(
              it => it.zonerange === form.zoneRange
            ).num;
          }
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {          
          this.disabled = true;
          this.projectHttps
            .newProject(form)
            .then(res => {
              this.getList();
              this.dialogFormVisible = false;
              this.form = {
                projectName: "",
                projectionSystem: "",
                zone: "",
                zoneRange: "",
                epsgId: ""
              };
              this.$refs["ruleForm"].resetFields();
              this.goto(res);
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
    getProjectionSystem() {
      this.projectHttps.getProjectionSystem().then(res => {
        this.projectionSystemData = res;
      });
    },
    getZone(data) {
      this.projectHttps.getZone(data).then(res => {
        this.zoneData = res;
        this.$refs["zone"].resetField();
        this.$refs["zoneRange"].resetField();
      });
    },
    getZoneRange(da1, da2) {
      this.projectHttps.getZoneRange(da1, da2).then(res => {
        this.zoneRangeData = res;
        this.$refs["zoneRange"].resetField();
      });
    },
    open() {
      this.dialogFormVisible = true;
    }
  },
  watch: {}
};
</script>
<style lang="less" rel="stylesheet/less">
.list {
  padding:9px 18px;
  .list-name{
    >.el-form{
      .el-form-item {
        margin-bottom: 0;
      }
      .el-form-item__content{
        line-height: 28px;
        height: 28px;
      }
    }
  }
  .el-icon-circle-close {
    font-size: 12px;
  }
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
      color: @whiteColor!important;
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
        .el-icon-edit-outline{
          margin-right:4px;
          opacity: 0;
        }
        .edit-input{
          display: inline-block;
          width: 90%;
          height: 24px;
          padding-left:4px;
          border:none;
          border-bottom: 1px solid @highColor;
          
          background:rgba(3, 73, 114, 0);
          color:@whiteColor;
          &:focus{
            outline:none;
            outline-offset: 0;
          }
        }
        .err-input{
          border-bottom: 1px solid red;
        }
        .shenglue{
          display: inline-block;
          width: 90%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow:ellipsis;
        }
        .el-icon-edit-outline{
          position:absolute;
          right:10px;
          top:10px;
        }
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
            }
            .del:hover {
              color: @error;
            }
          }
        }
        &:first-child{
          td:first-child:before,
          td:last-child:after{
            height: 33px;
            top: 0;
          }
        }
        &:last-child{
          td:first-child:before,
          td:last-child:after{
            height: 33px;
          }
        }
      }
      tr:hover {
        background: url(/imgs/table-bg.png) no-repeat 3px 2px;
        background-size: calc(100% - 6px) 30px;
        color: @hWhiteColor;
        .el-icon-edit-outline{
          opacity: 1;
          cursor: pointer;
          font-size: 16px;
        }
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
  .list-name {
    height: 40px;
    color: @highColor;
    .icons {
      .newbtn {
        vertical-align: top;
        margin-right: 18px;
        line-height: 18px;
        width: 90px;
        height: 28px;
        text-align: center;
        &:focus{
          outline: none;
        }
      }
      & > i {
        padding: 2px 4px 4px;
        background: @btnColor;
        border: 1px solid transparent;
        cursor: pointer;
        width: 28px;
        height: 28px;
        &:hover{
          border-color: @highColor;
        }
      }
    }
  }
  .table-content {
    color: @whiteColor;
    .bor(@listColor);
    border-bottom: none;
    .table-th {
      display: flex;
      background: rgba(3, 73, 114, 0.4);
      padding: 0 4px;
      .chang {
        width: 95px;
        padding: 8px 10px;
      }
      .table-td {
        padding: 8px 20px;
        flex: 1;
        display: table-cell;
        &.flex2 {
          flex: 2;
          text-align: center;
        }
        &.td1 {
          .borsin(right, @listColor);
        }
      }
    }
  }
  .ye {
    margin-top: 14px;
    text-align: right;
  }
}
</style>
