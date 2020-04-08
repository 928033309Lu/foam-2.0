<template>
  <el-dialog
    class="opera-dialog"
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    width="400px"
    top="90px"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="114px"
      class="my-form"
      size="mini"
    >
      <el-form-item label="扇区方向:" prop="angle">
        <span v-show="title!='新增定向'">{{ Array.isArray(form.angle )?form.angle.join(','): form.angle}}</span>
        <!-- <el-input v-show="title=='新增定向'" v-model="form.angle" placeholder="[0,360)"></el-input> -->
        <el-select
          filterable
          collapse-tags
          allow-create
          default-first-option
          multiple
          v-show="title=='新增定向'"
          v-model="form.angle"
          placeholder="[0,360)"
        >
          <el-option v-for="item in form.angle" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="水平分辨率:" prop="resolutionHorizontal">
        <span v-if="title=='续算'">{{form.resolutionHorizontal}}</span>
        <el-input v-else v-model="form.resolutionHorizontal" placeholder="(1,200]"></el-input>
      </el-form-item>
      <el-form-item label="垂直分辨率:" prop="resolutionVertical">
        <span v-if="title=='续算'">{{form.resolutionVertical}}</span>
        <el-input v-else v-model="form.resolutionVertical" placeholder="(0.1,2]"></el-input>
      </el-form-item>
      <el-form-item label="最大迭代步数:" prop="maxIterateStep">
        <el-input v-model="form.maxIterateStep" placeholder="[1000,10000]"></el-input>
      </el-form-item>
      <el-form-item label="热力稳定度:" prop="borderValue">
        <span v-if="title=='续算'">{{form.borderValue}}</span>
        <el-select v-else v-model="form.borderValue" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button type="primary" class="common-btn" @click="resetForm('form')">取 消</el-button>
      <el-button type="primary" class="common-btn" @click="submitForm('form')">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "param-set",
  data() {
    var checkAngle = (rule, value, callback) => {
      if (value.length == 0) {
        return callback(new Error("扇区方向不能为空"));
      }
      setTimeout(() => {
        var reg = /^[0-9]+(\.[0-9]{0,1})?$/;
        for (let item of value) {
          if (!reg.test(item)) {
            callback(new Error("请输入最多1位小数的正数"));
            return;
          } else {
            if (item < 0 || item >= 360) {
              callback(new Error("请输入360内最多1位小数"));
              return;
            } else {
              callback();
            }
          }
        }
      }, 100);
    };
    var checkResolutionHorizontal = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("水平分辨率不能为空"));
      }
      setTimeout(() => {
        var reg = /^[0-9]+(\.[0-9]{0,1})?$/;
        if (!reg.test(Number(value))) {
          callback(new Error("1-200内最多1位小数,不含1"));
        } else {
          if (value <= 1 || value > 200) {
            callback(new Error("1-200内最多1位小数,不含1"));
          } else {
            callback();
          }
        }
      }, 100);
    };
    var checkResolutionVertical = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("垂直分辨率不能为空"));
      }
      setTimeout(() => {
        var reg = /^[0-9]+(\.[0-9]{0,2})?$/;
        if (!reg.test(Number(value))) {
          callback(new Error("0.1-2内最多2位小数,不含0.1"));
        } else {
          if (value <= 0.1 || value > 2) {
            callback(new Error("0.1-2内最多2位小数,不含0.1"));
          } else {
            callback();
          }
        }
      }, 100);
    };
    var checkMaxIterateStep = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("最大迭代步数不能为空"));
      }
      setTimeout(() => {
        var reg = /^(0|\+?[1-9][0-9]*)$/;
        if (!reg.test(Number(value))) {
          callback(new Error("请输入正整数"));
        } else {
          if (value < 1000 || value > 10000) {
            callback(new Error("输入1000-10000内整数"));
          } else {
            callback();
          }
        }
      }, 1000);
    };
    return {
      visible: false,
      angle: [],
      form: {
        angle: [],
        resolutionHorizontal: "",
        resolutionVertical: "",
        maxIterateStep: "",
        borderValue: 10000
      },
      rules: {
        angle: [{ required: true, validator: checkAngle, trigger: "blur" }],
        resolutionHorizontal: [
          {
            required: true,
            validator: checkResolutionHorizontal,
            trigger: "blur"
          }
        ],
        resolutionVertical: [
          {
            required: true,
            validator: checkResolutionVertical,
            trigger: "blur"
          }
        ],
        maxIterateStep: [
          { required: true, validator: checkMaxIterateStep, trigger: "blur" }
        ],
        borderValue: [
          {
            required: true,
            required: true,
            message: "请至少选择一个活动性质",
            trigger: "change"
          }
        ]
      },
      options: [
        {
          value: -80,
          label: "0-非常不稳定"
        },
        {
          value: -500,
          label: "1-不稳定"
        },
        {
          value: 10000,
          label: "2-中性"
        },
        {
          value: 1500,
          label: "3-弱稳定"
        },
        {
          value: 800,
          label: "4-弱稳定"
        },
        {
          value: 500,
          label: "5-稳定"
        },
        {
          value: 300,
          label: "6-稳定"
        },
        {
          value: 200,
          label: "7-稳定"
        },
        {
          value: 130,
          label: "8-非常稳定"
        },
        {
          value: 60,
          label: "9-非常稳定"
        }
      ]
    };
  },
  props: ["title", "formData"],
  computed: {},
  watch: {
    formData: {
      handler(curVal, oldVal) {
        this.form = Object.assign({}, this.formData);
      },
      deep: true
    }
  },
  created() {},
  mounted() {},
  methods: {
    showDialog() {
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    hideDialog() {
      this.resetForm("form");
      this.visible = false;
    },
    submitHandle() {
      this.$emit("submitAction", this.form);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitHandle();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.visible = false;
    }
  }
};
</script>

<style lang="less">
.opera-dialog {
  .el-dialog {
    margin-top: 158px !important;
    background: rgba(0, 44, 70, 1) !important;
    .el-dialog__body {
      padding: 15px 65px 0px !important;
      .el-form-item {
        .el-form-item__label {
          color: #fff;
        }
        .el-form-item__content {
          text-align: left;
          span {
            padding-left: 6px;
          }
        }
      }
      .el-form-item__error {
        top: 29px;
        color: #ff2e76;
      }
    }
    .el-dialog__footer {
      .common-btn {
        width: 80px !important;
        height: 30px;
        background: rgba(3, 73, 114, 1) !important;
        border-radius: 2px;
        padding: 0 !important;
        text-align: center !important;
        line-height: 30px !important;
        border: none !important;
        outline: none !important;
        color: #009fff !important;
      }
    }
  }
}
</style>
