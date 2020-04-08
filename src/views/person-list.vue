<template>
  <div class="person-list common-list" v-loading.fullscreen.lock="fullscreenLoading">
    <ul class="header-info">
      <li>
        <div class="box">
          <div class="icon">
            <i class="iconfont iconqiye"></i>
          </div>
        </div>
        <div class="text flex-column-style">
          <p>{{enterpriseInfo.wholeName}}</p>
          <p>{{enterpriseInfo.enterpriseCode}}</p>
        </div>
      </li>
      <li>
        <div class="box">
          <div class="icon">
            <i class="iconfont iconjine"></i>
          </div>
        </div>
        <div class="text flex-column-style">
          <p>{{enterpriseInfo.balanceNow}}</p>
          <p>当前余额（元）</p>
        </div>
      </li>
      <li>
        <div class="box">
          <div class="icon">
            <i class="iconfont iconqian"></i>
          </div>
        </div>
        <div class="text flex-column-style">
          <p>{{enterpriseInfo.balance}}</p>
          <p>未分配余额（元）</p>
        </div>
      </li>
    </ul>
    <ul class="tabs">
      <li @click="activeName='user'" :class="{'active':activeName=='user'}">
        用户管理
      </li>
      <li @click="activeName='register'" :class="{'active':activeName=='register'}">
        注册用户审核
      </li>
    </ul>
    <el-table
      :data="tableData[activeName]"
      border
      class="common-list-table"
      style="width: 100%"
      :max-height="tableHeight">
      <el-table-column v-for='(item,index) in arr[activeName]'
                       :prop="item.value"
                       :label="item.label"
                       :width="index==(arr[activeName].length-1)?'':item.width">
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200">
        <template slot-scope="scope">
          <el-button v-if="activeName=='user'" type="text" size="small" @click="actionHandle(scope.row,'userRecharge')">
            操作
          </el-button>
          <el-button v-if="activeName=='user'" class="shut-btn" type="text" size="small"
                     @click="actionHandle(scope.row,'delete')">删除
          </el-button>
          <el-button v-if="activeName=='user'" class="shut-btn" type="text" size="small"
                     @click="actionHandle(scope.row,'transfer')">项目移交
          </el-button>
          <el-button v-if="activeName=='register'" type="text" size="small" @click="actionHandle(scope.row,'agree')">
            同意
          </el-button>
          <el-button v-if="activeName=='register'" class="shut-btn" type="text" size="small"
                     @click="actionHandle(scope.row,'refuse')">拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <enterprise-dialog ref="enterpriseDialog" :title.sync="title" :arg="arg" :balance="enterpriseInfo.balance" :active-row="activeRow"
                       @userRecharge="userRecharge"></enterprise-dialog>
    <transfer-dialog ref="transferDialog" :title="title" :arg="arg" :active-row="activeRow" :projectList="projectList" :list="tableData.user"
                     @transfer="transfer"></transfer-dialog>
  </div>
</template>
<script>
  import userServices from '../services/user.service'
  import enterpriseDialog from '../components/user/enterprise-dialog'
  import transferDialog from '../components/user/transfer-dialog'

  export default {
    name: 'person-list',
    mixins: [],
    data() {
      return {
        fullscreenLoading: false,
        title: '',
        arg: '',
        activeRow: {},
        tableHeight: 0,
        activeName: 'user',
        enterpriseInfo: {},
        tableData: {
          user: [],
          register: []
        },
        projectList:[
          {
            projectName:'全部',
            id:0
          }
        ],
        arr: {
          user: [
            {
              label: '用户名称',
              value: 'realName',
              width: 180
            }, {
              label: '电话',
              value: 'telephone',
              width: 180
            }, {
              label: '邮箱',
              value: 'email',
              width: 280
            }, {
              label: '余额（元）',
              value: 'balance',
              width: 180
            }
          ],
          register: [
            {
              label: '用户名称',
              value: 'realName',
              width: 180
            }, {
              label: '电话',
              value: 'telephone',
              width: 180
            }, {
              label: '邮箱',
              value: 'email',
              width: 280
            }
          ]
        }
      }
    },
    components: {enterpriseDialog, transferDialog},
    props: [],
    watch: {
      'activeName'(n){
        if(n=='user'){
          this.getUserList();
        }else{
          this.getRegisterUserList();
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.tableHeight = document.querySelector('.person-list').offsetHeight - 200;
      })
      this.getLoginEnterpriseInfo();
      this.getRegisterUserList();
      this.getUserList();
    },
    methods: {
      //获取企业信息
      getLoginEnterpriseInfo() {
        userServices.getLoginEnterpriseInfo().then(res => {
          this.enterpriseInfo = res;
        }).catch(err => {
          console.log(err)
        })
      },
      getRegisterUserList() {
        userServices.getRegisterUserList().then(res => {
          this.tableData.register = [].concat(res.data ? res.data : [])
        }).catch(err => {
          console.log(err)
        })
      },
      getUserList() {
        userServices.getUserList().then(res => {
          this.tableData.user = [].concat(res.data ? res.data : []);
        }).catch(err => {
          console.log(err)
        })
      },
      actionHandle(row, type) {
        if (type == "agree") {
          this.auditUser(row, 1);
        } else if (type == "refuse") {
          this.auditUser(row, 0);
        } else if (type == "userRecharge") {
          this.arg = type;
          this.activeRow = Object.assign({},row);
          this.title = '个人帐户操作';
          this.$refs.enterpriseDialog.showDialog();
        } else if (type == "delete") {
          this.checkUser(row.id);
        } else if (type == "transfer") {
          this.arg = type;
          this.activeRow = Object.assign({},row);
          this.title = '项目移交';
          this.getProjectList(row.id);
        }
      },
      checkUser(id){
        userServices.checkUser(id).then(res => {
          this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.deleteUser(id);
          }).catch(() => {
            // this.$message({
            //   type: 'info',
            //   message: '已取消删除'
            // });
          });
        }).catch(err => {
          console.log(err)
        })
      },
      deleteUser(id) {
        userServices.deleteUser(id).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getUserList();
          this.getLoginEnterpriseInfo();
        }).catch(err => {
          console.log(err)
        })
      },
      userRecharge(obj) {
        let postData = {
          "cateLog": obj.cateLog,
          "money": obj.money
        }
        userServices.billsHandle(postData, obj.id).then(res => {
          this.$refs.enterpriseDialog.hideDialog();
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          this.getUserList();
          this.getLoginEnterpriseInfo();
        }).catch(err => {
          console.log(err)
        })
      },
      //拒绝 同意
      auditUser(row, status) {
        userServices.examineUser(row.id, status).then(res => {
          this.getRegisterUserList();
          this.getUserList();
        }).catch(err => {
          console.log(err)
        })
      },
      //移交项目
      transfer(obj) {
        userServices.transferProject(this.activeRow.id,obj.projectId,obj.transferId).then(res => {
          this.$refs.transferDialog.hideDialog();
          this.$message({
            message: '移交成功',
            type: 'success'
          });
        }).catch(err => {
          console.log(err)
        })
      },
      //获取项目列表
      getProjectList(id){
        userServices.getProjectList(id).then(res => {
          if(res.length>0) {
            this.projectList = [];
            this.projectList = [{
              projectName: '全部',
              id: 0
            }].concat(res);
            this.$refs.transferDialog.showDialog();
          }else {
            this.$message.warning('暂无可移交项目');
          }
        }).catch(err => {
          console.log(err)
        })
      }
    }

  }
</script>

<style lang="less">
  @import "../assets/less/common-list.less";

  .person-list {
    .el-table {
      tr th {
        background: rgba(3, 73, 114, 0.36);
      }
      .stop-btn:hover {
        color: #FF2E76 !important;
      }
      .contacts {
        .borsin(bottom, #fff);
        cursor: pointer;
        &:hover {
          color: @highColor;
          .borsin(bottom, @highColor);
        }
      }
    }
    .header-info {
      height: 80px;
      padding: 0 5px;
      margin: 5px 0 0;
      border: 1px solid rgba(3, 73, 114, 1);
      .flex-style();
      li {
        flex: 1;
        .flex-style();
        .box {
          width: 70px;
          height: 70px;
          position: relative;
          border: 1px solid rgba(0, 159, 255, .7);
          background: #012E47;
          &:before {
            .common-style-before();
          }
          &:after {
            .common-style-after();
          }
          .icon {
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 11;
            text-align: center;
            line-height: 68px;
            color: @highColor;
            .iconfont {
              font-size: 40px;
            }
            &:before {
              .common-arrow-before();
            }
            &:after {
              .common-arrow-after();
            }
          }
        }
        .text {
          height: 100%;
          margin-left: 12px;
          p {
            color: rgba(255, 255, 255, .7);
            &:first-child {
              font-size: 24px;
            }
            &:last-child {
              font-size: 12px;
            }
          }
        }
      }
    }
    .tabs {
      margin-top: 20px;
      height: 28px;
      .borsin(bottom, @listColor);
      .flex-style();
      li {
        padding: 0 16px;
        height: 28px;
        line-height: 29px;
        color: rgba(0, 159, 255, 1);
        opacity: .7;
        margin-right: 2px;
        .bor(#034972);
        transition: all .3s ease;
        cursor: pointer;
        &.active {
          height: 29px;
          opacity: 1;
          .bor(rgba(0, 159, 255, 1));
          .borsin(bottom, rgba(1, 46, 71, 1));
          cursor: default;
        }
      }
    }
    .common-list-table {
      margin-top: 10px;
      .el-button {
        padding: 3px 0;
        color: #fff;
        transition: none;
        &:hover {
          border: none;
          outline: none;
          color: @highColor;
        }
        &.shut-btn:hover {
          color: @error;
          span:hover {
            color: @error;
          }
        }
      }
    }
  }
</style>
