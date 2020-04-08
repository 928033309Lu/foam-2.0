
<template>
  <div class="nav-header" :class="{'whole':isadmin==2,'kuan':!$route.meta.show}"
    v-loading.fullscreen="loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="正在反馈..."
  >
    <div class="tou">
      <div class="logo" v-if="isadmin==2">
        <img src="/imgs/login2/logo-header.png" alt>
      </div>
      <!-- <span class="feedback" @click="feedback">反馈</span> -->
      <!--<router-link to="/project/list" v-if="isadmin==0">-->
      <!--<i class="iconfont iconshouye" style="margin:20px;color:#bbb"></i>-->
      <!--</router-link>-->

      <div class="head">
        <!-- <el-badge :value="3" class="item">
          <i class="iconfont iconxiaoxi"></i>
        </el-badge>-->
        <!-- <button id='feed'>qweq</button> -->
        <i
          title="有任何建议或问题，欢迎您向我们进行反馈"
          style="cursor:pointer;color:rgba(255,255,255,.9)"
          class="iconfont icontucao"
          @click="feedback"
        ></i>
        <span class="border-left"></span>
        <el-dropdown @command="handleCommand" trigger="click">
          <span class="el-dropdown-link">
            <i class="iconfont iconren" style="font-size:16px"></i>
            <!-- <img class="img" src="/imgs/big.jpeg" alt="y"> -->
            {{$store.state.userInfo.realname}}
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a" v-if="isadmin==1">修改密码</el-dropdown-item>
            <el-dropdown-item command="b" v-if="isadmin==0">查看账单</el-dropdown-item>
            <el-dropdown-item command="d" v-if="isadmin==0">全局设置</el-dropdown-item>
            <el-dropdown-item command="c">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="tabs" v-if="$store.state.userInfo.isadmin!=2&&!$route.meta.show">
      <span class="tab" v-for="(ru,index) in routeList" :key="ru.name">
        <span :class="{line:$route.name===ru.name}">
          <span class="sing" @click="toye(ru)">{{ru.meta.title}}</span>
          <i class="el-icon-close" @click="delye(index,ru)" v-if="$store.state.routeList.length>1"></i>
        </span>
      </span>
      <span class="f-right">
        <a
          class="help"
          href="https://goldfoam2.s3.cn-northwest-1.amazonaws.com.cn/help/help.html"
          target="_blank"
        >帮助</a>
      </span>
    </div>
    <el-dialog
      title="问题反馈"
      :visible.sync="dialogFormVisible"
      append-to-body
      width="500px"
      @close="close"
    >
      <el-form
        :rules="rules"
        ref="ruleForm"
        :model="form"
        class="my-form"
        label-width="90px"
        size="small"
      >
        <!-- <el-form-item label="地址:">
          <el-input v-model="form.n" autocomplete="off"></el-input>
        </el-form-item>-->
        <el-form-item label="联系方式:" prop="author">
          <el-input v-model="form.author" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="反馈内容:" prop="content">
          <el-input type="textarea" :rows="5" placeholder="请输入反馈内容" v-model="form.content"></el-input>
        </el-form-item>
        <el-form-item>
          <span
            style="color:#aaa;font-size:12px"
          >注: 此操作会把本页截图和地址发送到问题处理中心，请您填写正确的联系方式和反馈内容，以便工作人员联系您。</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button :disabled="disabled" type="primary" @click="problem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { EventBus } from "@/config/event-bus.js";
import html2canvas from "html2canvas";
export default {
  data() {
    return {
      loading:false,
      disabled: false,
      dialogFormVisible: false,
      noticeNumber: 0,
      logofix: false,
      projectName: "",
      form: {
        account: this.$store.state.userInfo.userid,
        app: "fengjiang",
        author: null,
        content: null,
        name: this.$store.state.userInfo.realname,
        url: null,
        userInfo: localStorage.getItem("userInfo"),
        screen: null,
        email: "test@132.com"
      },
      rules: {
        author: [
          {
            min: 1,
            max: 100,
            message: "长度在 100 个字符以内",
            trigger: "change"
          }
        ],
        content: [
          { required: true, message: "请输入反馈内容", trigger: "change" },
          {
            min: 1,
            max: 500,
            message: "长度在 500 个字符以内",
            trigger: "change"
          }
        ]
      }
    };
  },
  props: {},
  computed: {
    routeList() {
      return this.$store.state.routeList;
    },
    isadmin() {
      return this.$store.state.userInfo.isadmin;
    }
  },
  mounted() {},
  methods: {
    problem() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          this.disabled = true;
          this.loading = true;
          this.projectHttps
            .problem(this.form)
            .then(res => {
              this.$message("意见提交成功");
              this.dialogFormVisible = false;
              this.disabled = false;
              this.loading = false;
              // this.$alert("意见提交成功", "提示", {
              //   confirmButtonText: "确定",
              // });
            })
            .catch(err => {
              this.disabled = false;
              this.loading = false;
              console.log(err);
            });
        } else {
          this.disabled = false;
          console.log("error submit!!");
          return false;
        }
      });
    },
    close() {
      this.$refs["ruleForm"].resetFields();
    },
    feedback() {
      // this.form.author=null;
      // this.form.content=null;

      this.generatorImage();
      this.form.url = window.location.href;
      this.dialogFormVisible = true;
    },
    generatorImage() {
      html2canvas(document.getElementsByTagName("body")[0], {
        useCORS: true
      }).then(canvas => {
        this.form.screen = canvas.toDataURL("images/png");
        // canvas.toBlob(blob=>{
        //   this.form.screen=blob;
        //   console.log(blob)
        // })
        //  this.$refs.addImage.append(canvas);
        // let link = document.createElement("a");
        // link.href = canvas.toDataURL();
        // link.setAttribute("download", "图片canvas.png");
        // link.style.display = "none";
        // document.body.appendChild(link);
        // link.click();
      });
    },
    handleCommand(command) {
      if (command == "a") {
        this.$emit("setShow");
      } else if (command == "c") {
        let type =
          this.isadmin == 2
            ? "sysAdminLogin"
            : this.isadmin == 1
            ? "enterAdminLogin"
            : "common";
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        this.$store.commit("clearRouteList");
        this.$router.push(`/login/${type}`);
      } else if (command == "b") {
        let projectId = this.$route.params.projectId;
        let name =
          this.isadmin == 0
            ? projectId
              ? `user-bill`
              : "bill"
            : this.isadmin == 1
            ? "manager-bill"
            : "";
        this.$router.push({
          name: name,
          params: this.$route.params,
          query: this.$route.query
        });
      } else if (command == "d") {
        let projectId = this.$route.params.projectId;
        let name = !projectId ? `global-settings` : "settings";
        this.$router.push({
          name: name,
          params: this.$route.params,
          query: this.$route.query
        });
      }
    },
    delye(index, ru) {
      if (this.routeList.length != 1) {
        if (ru.name == "list" || name == "shou") {
          let projectName = JSON.parse(sessionStorage.getItem("detail"))
            .projectName;
          sessionStorage.setItem("projectName", projectName);
          EventBus.$emit("addition", {
            projectName: sessionStorage.getItem("projectName")
          });
        }
        this.$store.commit("delRouteList", index);
        if (ru.name == this.$route.name) {
          this.$router.push({
            name: this.routeList[this.routeList.length - 1].name,
            params: this.$route.params,
            query: this.$route.query
          });
        }
      }
    },
    toye({ name, query, params }) {
      this.$router.push({ name, query, params });
      if (name != "list" || name != "shou") {
        let projectName = JSON.parse(sessionStorage.getItem("detail"))
          .projectName;
        sessionStorage.setItem("projectName", projectName);
        EventBus.$emit("addition", {
          projectName: sessionStorage.getItem("projectName"),
          status: sessionStorage.getItem("status")
        });
      }
    },
    exit() {
      if (sessionStorage.getItem("projectName")) {
        sessionStorage.setItem("projectName", "");
      } else {
        sessionStorage.setItem("projectName", "www");
      }
      EventBus.$emit("addition", {
        projectName: sessionStorage.getItem("projectName")
      });
    }
  }
};
</script>
<style lang="less" rel="stylesheet/less">
.nav-header {
  color: @whiteColor;
  position: fixed;
  left: 90px;
  top: 0;
  z-index: 500;
  width: calc(100% - 90px);
  &.whole {
    width: 100%;
    left: 0;
  }
  &.kuan {
    left: 120px;
    padding-right: 30px;
  }
  
  .el-dropdown-link {
    margin-left: 6px;
    color: @hWhiteColor;
    cursor: pointer;
    line-height: 30px;
  }
  .tou {
    height: @headerHeight;
    padding-right: 40px;
    background: linear-gradient(
      90deg,
      rgba(20, 30, 36, 1),
      rgba(0, 96, 145, 1),
      rgba(20, 30, 36, 0.99)
    );
    .feedback {
      display: inline-block;
      margin: 15px;
      cursor: pointer;
    }
    .logo {
      width: 71px;
      float: left;
      padding-top: 8px;
      text-align: center;
      img {
        width: 60px;
      }
    }
  }
  .tabs {
    height: 38px;
    background: radial-gradient(
      circle,
      rgba(2, 74, 104, 1),
      rgba(0, 29, 46, 1)
    );
    .borsin(bottom, #2b678b);
    line-height: 38px;
    .tab {
      padding-left: 15px;
      /*.borsin(right, #2b678b);*/
      cursor: pointer;
      &:after {
        content: "";
        display: inline-block;
        width: 1px;
        height: 14px;
        background-color: #2b678b;
        vertical-align: middle;
        margin-left: 15px;
      }
      &:hover {
        color: @highColor;
      }
      .sing {
        padding: 0 10px 0 5px;
      }
      .line {
        display: inline-block;
        height: 37px;
        margin: 0 5px;
        line-height: 42px;
        .borsin(bottom, @highColor, 2px);
      }
    }
    .f-right {
      margin-right: 20px;
      .help {
        color: @whiteColor;
      }
    }
  }
  .head {
    float: right;
    /*width: 195px;*/
    margin-top: 10px;
    .img {
      width: 30px;
      height: 30px;
      vertical-align: bottom;
      border-radius: 50%;
    }
    .border-left {
      position: relative;
      top: 5px;
      margin: 0 12px 0 25px;
      display: inline-block;
      width: 4px;
      height: 18px;
      opacity: 0.3;
      .borsin(left);
    }
    .item {
      margin-right: 25px;
    }
  }
}
</style>
