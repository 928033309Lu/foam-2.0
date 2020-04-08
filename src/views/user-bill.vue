<template>
  <div class="user-bill bill" v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-main>
      <el-header>
        <!-- <span>{{'当前余额：' + money + '元'}}</span>
                <el-select
                    v-model.trim="search"
                    filterable
                    remote
                    clearable
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="remoteMethod"
                    :loading="loading"
                    @clear="getAgain">
                    <el-option
                        v-for="item in filterData"
                        :key="item.targetId"
                        :label="item.targetName"
                        :value="item.targetId">
                    </el-option>
        </el-select>-->
        <span>项目:</span>
        <el-select filterable  v-model.trim="searchName" @change="getSinMoney">
          <el-option key="all" label="全部" value></el-option>
          <el-option
            v-for="(item,index) in nameList"
            
            :key="index"
            :label="item.projectName"
            :value="item.projectId"
          ></el-option>
        </el-select>
        <div class="choose-time" v-show="!searchName">
          <span>时间:</span>
          <el-date-picker
            v-model="timeValue"
            type="daterange"
            range-separator="-"
            @change="timeChange"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </div>
      </el-header>
      <ul class="header-info">
        <li>
          <div class="box">
            <div class="icon">
              <i class="iconfont iconjine"></i>
            </div>
          </div>
          <div class="text flex-column-style">
            <p>{{money}}</p>
            <p>当前余额（元）</p>
          </div>
        </li>
        <li v-show="searchName">
          <div class="box">
            <div class="icon">
              <i class="iconfont iconqian"></i>
            </div>
          </div>
          <div class="text flex-column-style">
            <p>{{sinMoney.toFixed(2)}}</p>
            <p>当前项目花费金额（元）</p>
          </div>
        </li>
      </ul>
      <table-list
        v-if="pageSize>0"
        :tableHeight="tableHeight"
        orderDefault="gmtStart"
        :tableStructure="tableStructure"
        :tableData="tableData"
        :condition.sync="condition"
        :order.sync="order"
        @getAgain="getAgain"
      ></table-list>
    </el-main>
    <el-footer v-if="total>pageSize&&!searchName">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="pageIndex"
        :page-size="pageSize"
        layout="prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-footer>
  </div>
</template>

<script>
import userServices from "../services/user.service";
import tableList from "@/components/table-list.vue";
import { bill } from "@/utils/mixin.js";

export default {
  mixins: [bill],
  components: {
    tableList
  },
  data() {
    return {
        loading:false,
      nameList: [],
      userInfo: JSON.parse(localStorage.getItem("userInfo")),
      searchName: "",
      sinMoney: 0,
      money: 0,
      timeValue: [],
      tableData: [],
      pageSize: 0,
      total: "",
      condition: "STARTTIME",
      order: "DESC",
      tableHeight: 400,
      tableStructure: [
        {
          label: "账单编号",
          prop: "id",
          width: 108
        },
        {
          label: "项目ID",
          prop: "projectId",
          width: 80
        },
        {
          label: "项目名",
          prop: "projectName",
          width: 140
          //isShowTip:true
        },
        {
          label: "定向任务ID",
          prop: "cfdId",
          width: 100
        },
        {
          label: "扇区方向",
          prop: "sectionDirection",
          width: 80
        },
        {
          label: "热力稳定度",
          prop: "powerStability",
          width: 90
        },
        {
          label: "计算类型",
          prop: "computationType",
          width: 100
        },
        {
          label: "计费开始时间",
          prop: "gmtStart",
          sortable: true,
          width: 160
        },
        {
          label: "计费截止时间",
          prop: "gmtEnd",
          sortable: true,
          width: 160
        },
        {
          label: "并行核数",
          prop: "parallelNumber",
          width: 80
        },
        {
          label: "金额(元)",
          prop: "money",
          width: 80
        },
        {
          label: "备注",
          prop: "memo",
          width: 120
        }
      ]
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      let projectId = this.$route.params.projectId;
      this.pageSize = Math.floor(
        (document.querySelector(".side-right").offsetHeight - 300) / 34
      );
      if (projectId) {
        this.pageSize -= 1;
      }
      this.tableHeight = (this.pageSize + 2) * 34;
      this.getUserBill();
    });
    this.getList();
  },
  methods: {
    getList() {
        this.loading=true;
      this.projectHttps
        .getList({
          condition: "PRODATE",
          projectType: "1",
          searchConditions: "",
          order: "",
          pageSize: 1000,
          page: 1
        })
        .then(res => {
          this.nameList = res.data;
          // this.nameList.splice(0,2); 
          this.loading=false;
        })
        .catch(err => {
          console.log(err);
          this.loading=false;

        });
    },
    getSinMoney(projectId) {
      if (projectId) {
        this.sinMoney = 0;
        userServices
          .getUserBill({ projectId, pageSize: 1000 })
          .then(res => {
            this.tableData = [].concat(res.page.data);
            for (let it of this.tableData) {
              this.sinMoney = it.money + this.sinMoney;
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        this.getUserBill();
      }
    },
    showTip() {
      // this.$alert('请将您有疑议的定向账单ID通过您的企业邮箱发送至fengjiang@goldwind.com.cn', '提示', {
      //   confirmButtonText: '确定',
      //   callback: action => {}
      // });
      this.$alert(
        '请将您有疑议的定向账单ID通过您的企业邮箱发送至<a href="mailto:fengjiang@goldwind.com.cn">fengjiang@goldwind.com.cn</a>',
        "提示",
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          callback: action => {}
        }
      );
    },
    handleCurrentChange(val) {
      this.pageIndex = val;
      this.getUserBill();
    },
    timeChange() {
      this.pageIndex = 1;
      this.getUserBill();
    },
    getAgain() {
      this.pageIndex = 1;
      this.getUserBill();
    },
    getUserBill() {
      let postData = {};
      if (this.pageIndex) {
        postData.pageIndex = this.pageIndex;
      }
      if (this.pageSize) {
        postData.pageSize = this.pageSize;
      } else {
        return;
      }
      if (this.timeValue && this.timeValue.length == 2) {
        postData.startDate = this.timeValue[0];
        postData.endDate = this.timeValue[1];
      }
      if (this.order) {
        postData.order = this.order;
      }
      if (this.condition) {
        postData.condition = this.condition;
      }
      if (this.search) {
        postData.projectId = this.search;
      }
      userServices
        .getUserBill(postData)
        .then(res => {
          this.money = res.balance;
          this.tableData = [].concat(res.page.data);
          this.total = res.page.totalRows;
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style lang="less">
@import "../assets/less/bill.less";
.bill.user-bill {
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
        border: 1px solid rgba(0, 159, 255, 0.7);
        background: #012e47;
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
          color: rgba(255, 255, 255, 0.7);
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
}
</style>