<template>
  <div class="enterprise-dialog">
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="400px"
      class="common-dialog"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :before-close="handleClose">
      <div class="recharge transfer">
        <el-form :model="transferForm" :rules="Rules" :ref="arg" label-width="80px" class="demo-ruleForm">
          <el-form-item label="移交人:">
            <p class="text-center">{{activeRow.realName}}</p>
          </el-form-item>
          <el-form-item label="电话:">
            <p class="text-center">{{activeRow.telephone}}</p>
          </el-form-item>
          <el-form-item label="邮箱:">
            <p class="text-center">{{activeRow.email}}</p>
          </el-form-item>
          <el-form-item label="待移交项目:" style="margin-top:20px;" prop="projectId">
            <el-select v-model="transferForm.projectId" v-if="projectOptions.length">
              <el-option :label="item.projectName" :value="item.id" v-for="item in projectOptions"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="移交给:" style="margin-top:20px;" prop="transferId">
            <el-select v-model="transferForm.transferId" @change="getTransferinfo">
              <el-option :label="item.realName" :value="item.id" v-for="item in userList"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="电话:">
            <p class="text-center">{{activeTransferUser.telephone}}</p>
          </el-form-item>
          <el-form-item label="邮箱:">
            <p class="text-center">{{activeTransferUser.email}}</p>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelHandle">取 消</el-button>
        <el-button type="primary" @click="submitHandle">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import userServices from '../../services/user.service'

  export default {
    name: "transfer-dialog",
    props: ['title', 'arg', 'activeRow', 'list', 'projectList'],
    data() {
      return {
        dialogVisible: false,
        transferForm: {
          projectId: 0,
          transferId: ''
        },
        Rules: {
          wholeName: [
            {required: true, message: '请选择待移交项目', trigger: 'blur'}
          ],
          enterpriseCode: [
            {required: true, message: '请选择移交人', trigger: 'blur'}
          ]
        },
        projectOptions: [],
        activeTransferUser: {},
        userList:[]
      }
    },
    watch: {
      activeRow: {
        handler(curVal, oldVal) {
          this.userList = this.list.filter(item=>{
            return item.id != this.activeRow.id;
          })
          if (this.userList.length) {
            this.transferForm.transferId = this.userList[0].id;
            this.activeTransferUser = Object.assign({}, this.userList[0])
          }
        },
        deep: true
      },
      list: {
        handler(curVal, oldVal) {
          if(!this.list.length) return;
          this.userList = this.list.filter(item=>{
            return item.id != this.activeRow.id;
          })
          if (this.userList.length) {
            this.transferForm.transferId = this.userList[0].id;
            this.activeTransferUser = Object.assign({}, this.userList[0])
          }
        },
        deep: true
      },
      projectList: {
        handler(curVal, oldVal) {
          this.projectOptions = [].concat(curVal);
        },
        deep: true
      }
    },
    methods: {
      handleClose(done) {
        this.projectOptions = [];
        this.resetForm(this.arg);
        done();
      },
      //dialog显示
      showDialog(arg) {
        this.dialogVisible = true;
      },
      //dialog隐藏
      hideDialog() {
        this.resetForm(this.arg);
        this.dialogVisible = false;
      },
      //表单重置
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      //取消
      cancelHandle() {
        this.resetForm(this.arg);
        this.dialogVisible = false;
      },
      //确定
      submitHandle() {
        this.$refs[this.arg].validate((valid) => {
          if (valid) {
            this.$emit(this.arg, this[this.arg + 'Form'])
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      getTransferinfo(e) {
        this.activeTransferUser = this.list.filter(item => {
          return e == item.id;
        })[0];
      }
    }
  }
</script>

<style lang="less">
  .enterprise-dialog {
    .el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label-wrap > .el-form-item__label:before, .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
      content: '';
    }
    .el-form-item {
      margin-bottom: 16px;
      .el-form-item__label {
        padding-right: 6px;
        line-height: 28px;
        color: #fff;
      }
      .el-form-item__content {
        line-height: 28px;
        .el-input__inner {
          height: 28px;
          line-height: 28px;
          border-radius: 0;
          background-color: transparent;
          border: 1px solid rgba(43, 103, 139, 1);
          color: #fff;
        }
      }
    }

    .el-dialog__body {
      padding: 25px 0 0 !important;
      .transfer {
        padding: 0 45px !important;
      }
    }
  }
</style>