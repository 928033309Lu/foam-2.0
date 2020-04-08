<template>
  <div class="enterprise-list common-list" v-loading.fullscreen.lock="fullscreenLoading" element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="header">
      <button class="newbtn mybtn" @click="addClick">
        <i class="iconfont iconxinjian"></i> 添加企业
      </button>
    </div>
    <el-table
      class="common-list-table"
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      v-if="tableHeight"
      border
      :max-height="tableHeight"
      :default-sort = "sortObj"
      :sort-orders="['ascending', 'descending']"
      @sort-change="sortChange">
      <el-table-column
        label="企业名称"
        prop="wholeName"
        sortable
        :sort-orders="['ascending', 'descending']"
        min-width="130">
        <template slot-scope="scope">
          <span :title="scope.row.wholeName">{{ scope.row.wholeName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="enterpriseCode"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="企业编号"
        min-width="100">
        <template slot-scope="scope">
          <span :title="scope.row.enterpriseCode">{{scope.row.enterpriseCode}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="gmtCreated"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="注册时间"
        min-width="115">
        <template slot-scope="scope">
          <span>{{scope.row.gmtCreated.split(' ')[0]}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="gmtExpired"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="账号到期时间"
        min-width="115">
        <template slot-scope="scope">
          <span>{{scope.row.gmtExpired?scope.row.gmtExpired.split(' ')[0]:'--'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="personNum"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="注册人数"
        min-width="100">
      </el-table-column>
      <el-table-column
        prop="personLimit"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="注册人数限制"
        min-width="115">
      </el-table-column>
      <el-table-column
        prop="status"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="状态"
        min-width="80">
        <template slot-scope="scope">
          <span :style="getStyle(scope.row.status)">{{scope.row.status?'正常':'停用'}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="balance"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="余额（元）"
        min-width="95">
      </el-table-column>
      <el-table-column
        prop="realName"
        sortable
        :sort-orders="['ascending', 'descending']"
        label="联系人"
        min-width="100">
        <template slot-scope="scope">
          <span class="contacts" @click="fixInfoAction(scope.row)" :title="scope.row.realName">{{scope.row.realName}}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="操作"
        width="200">
        <template slot-scope="scope">
          <span
            size="mini"
            @click="rechargeClick(scope.row)">操作</span>
          <span
            size="mini"
            class="stop-btn"
            @click="updateStatusHandle(scope.row)">{{scope.row.status?'停用':'启用'}}</span>
          <span
            size="mini"
            @click="logClick(scope.row)">操作记录</span>
        </template>
      </el-table-column>
    </el-table>
    <enterprise-dialog ref="enterpriseDialog" :title="title" :arg="arg" :active-row="activeRow" :log-obj="logObj" @add="addHandle" @recharge="rechargeHandle" @fix="fixInfoHandle"></enterprise-dialog>
  </div>
</template>
<script>
  import userServices from '../services/user.service'
  import enterpriseDialog from '../components/user/enterprise-dialog'
  import { swicthValue } from '../utils/switchBorderValue'
  export default {
    name:'customer-list',
    mixins: [swicthValue],
    data() {
      return {
        fullscreenLoading:true,
        tableData: [],
        sortObj:{
          prop: 'shortName',
          order: 'ascending'
        },
        formData:{
          angle:'',
          resolutionHorizontal:'',
          resolutionVertical:'',
          maxIterateStep:'',
          borderValue:10000
        },
        title:'',
        arg:'',
        activeRow:{},
        type:'',
        tableHeight:0,
        logObj:{}
      }
    },
    components: { enterpriseDialog },
    props: [],
    mounted() {
      this.tableHeight = document.querySelector('.enterprise-list').offsetHeight - 86;
      this.getList();
    },
    methods: {
      //添加企业按钮点击
      addClick(){
        this.title = '添加企业';
        this.arg = 'add';
        this.$refs.enterpriseDialog.showDialog();
      },
      //充值记录按钮点击
      logClick(row){
        this.activeRow = Object.assign({},row);
        this.getLogs();
      },
      //获取充值列表
      getLogs(){
        userServices.getLogs(this.activeRow.id).then(res=>{
          this.logObj = [].concat(res)
          this.title = '操作记录';
          this.arg = 'log';
          this.$refs.enterpriseDialog.showDialog('log');
        }).catch(err=>{
          console.log(err)
        })
      },
      //充值点击
      rechargeClick(row){
        this.title = '操作';
        this.arg = 'recharge';
        this.activeRow = Object.assign({},row);
        this.$refs.enterpriseDialog.showDialog();
      },
      //排序
      sortChange(column, prop, order){
        this.sortObj = {
          prop:column.prop,
          order:column.order
        }
      },
      handleClose(done) {
        done();
      },
      //添加企业
      addHandle(data){
        userServices.addEnterprise(data).then(res=>{
          this.$refs.enterpriseDialog.hideDialog();
          this.getList();
          this.$message({
            message: '添加成功',
            type: 'success'
          });
        }).catch(err=>{
          console.log(err)
        })
      },
      //充值
      rechargeHandle(obj){
        let postData = {
          "cateLog": obj.cateLog,
          "contract": obj.contractNumber,
          "gmtExpired": obj.gmtOver,
          "id": obj.id,
          "money": obj.money,
          "memo":obj.memo
        }
        userServices.addMoney(postData,obj.id).then(res=>{
          this.$refs.enterpriseDialog.hideDialog();
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          this.$refs.enterpriseDialog.initRechargeForm();
          this.getList();
        }).catch(err=>{
          console.log(err)
        })
      },
      //联系人点击
      fixInfoAction(row){
        this.title = '联系人信息';
        this.arg = 'fix';
        this.activeRow = Object.assign({},row);
        this.$refs.enterpriseDialog.showDialog();
      },
      //更改管理员信息
      fixInfoHandle(obj){
        userServices.fixUserInfo(this.activeRow.id,obj).then(res=>{
          this.getList();
          this.$refs.enterpriseDialog.hideDialog();
          this.$message({
            message: '修改成功',
            type: 'success'
          });
        }).catch(err=>{
          console.log(err)
        })
      },
      //更改企业状态 是否停用 启用
      updateStatusHandle(row){
        let tip = '是否'+ (row.status?'停用 ':'启用 ') + row.wholeName +' 的权限?';
        this.$confirm(tip, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center:true
        }).then(() => {
          this.updateStatus(row.id,row.status);
        }).catch(() => {
          console.log('取消')
        });
      },
      //更改状态
      updateStatus(id,status){
        userServices.updateStatus(id,status).then(res=>{
          this.getList();
        }).catch(err=>{
          console.log(err)
        })
      },
      //获取状态不同样式
      getStyle(arg){
        let obj = {
          "color":"",
          "line-height":"32px"
        }
        if(!arg){
          obj.color = '#FF2E76';
        }else{
          obj.color = '#fff';
        }
        return obj;
      },
      //获取列表
      getList(){
        userServices.getList().then(res=>{
          if(res)
            this.tableData = [].concat(res);
          else
            this.tableData = [];
          this.fullscreenLoading = false;
        }).catch(err=>{
          this.fullscreenLoading = false;
          console.log(err)
        })
      }
    },
    watch: {}

  }
</script>

<style lang="less">
  @import "../assets/less/common-list.less";
  .enterprise-list{
    .el-table{
      tr th{
        background:rgba(3,73,114,0.36);
      }
      .stop-btn:hover{
        color:#FF2E76!important;
      }
      .contacts{
        .borsin(bottom,#fff);
        cursor:pointer;
        &:hover{
          color:@highColor;
          .borsin(bottom,@highColor);
        }
      }
      .cell{
        span{
          display:inline-block;
          vertical-align: middle;
          width:100%;
          height:auto;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          &.contacts{
            display:inline;
          }
        }
      }
      td:last-child{
        .cell{
          span{
            display:inline;
          }
        }
      }
    }
  }
</style>
