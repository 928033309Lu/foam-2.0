<template>
  <div class="type-house">
    <div class="double">
      <div class="left">
        <div class="sel-top">
          <el-cascader
            v-model="value"
            :show-all-levels="false"
            size="mini"
            :options="options"
            :props="{ expandTrigger: 'hover' }"
            @change="handleChange"
          >
            <template slot-scope="{ node, data }">
              <span>{{ data.label }}</span>
              <i
                v-if="!node.hasChildren"
                class="el-icon-close"
                style="float:right;line-height:34px;cursor:printer;"
                @click="delEnterprisType(data.value)"
              ></i>
            </template>
          </el-cascader>
          <span class="newbtn" style="margin-top:4px">IEC版本: {{iec?iec:'--'}}</span>
          <!-- <button
            style="margin-left:auto"
            class="g-btn"
            @click="open('quote')"
          >&nbsp;&nbsp;&nbsp;引用&nbsp;&nbsp;&nbsp;</button>-->
          <button
            style="margin-left:auto"
            class="newbtn g-btn"
            @click="open('new')"
          >&nbsp;&nbsp;&nbsp;新建&nbsp;&nbsp;&nbsp;</button>
        </div>
        <div class="kuang" :class="show3?'aa':'bb'">
          <span
            @click="show3 = !show3"
            class="biao"
            :class="show3?'el-icon-arrow-up':'el-icon-arrow-down'"
          ></span>
          <div class="top">
            功率曲线列表
            <span style="margin-left:auto" class="nbor-btn">
              <a
                href="https://goldfoam2.s3.cn-northwest-1.amazonaws.com.cn/template/%E5%8A%9F%E7%8E%87%E6%9B%B2%E7%BA%BF%E6%A8%A1%E6%9D%BF.zip"
              >模板下载</a>
            </span>

            <span @click="orUp" class="nbor-btn">上传</span>

            <!-- <span class="nbor-btn" @click="putPower">保存</!-->
            <span class="nbor-btn" style="margin-right:20px;" @click="delEnterprisPower()">删除</span>
          </div>
          <div class="scr">
            <!-- @cell-dblclick="db" -->
            <el-table
              height="100%"
              @row-click="getSingPower"
              class="my-table"
              :data="powers"
              tooltip-effect="dark"
              highlight-current-row
              style="width: 100%"
            >
              <el-table-column width="180" show-overflow-tooltip label="名称" prop="name"></el-table-column>
              <!-- <el-table-column label="版本" prop="iecVersion"></el-table-column> -->
              <el-table-column width="128" prop="airDensity" label="空气密度(kg/m3)">
                <template slot-scope="scope">
                  <span
                    class="span-input"
                    @blur="blurInput(scope.row,'airDensity',$event,'keepMa')"
                  >{{ scope.row.airDensity }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="turbulence" label="湍流强度">
                <template slot-scope="scope">
                  <span
                    class="span-input"
                    @blur="blurInput(scope.row,'turbulence',$event,'keepMa')"
                  >{{ scope.row.turbulence }}</span>
                </template>
              </el-table-column>
              <!-- <el-table-column show-overflow-tooltip prop="remark" label="备注">
                <template slot-scope="scope">
                  <span class="span-input">{{ scope.row.remark?scope.row.remark:'--为且为驱蚊器' }}</span>
                </template>
              </el-table-column>-->
              <el-table-column :show-overflow-tooltip="true" prop="isEmploy" label="状态">
                <template slot-scope="scope">
                  <span class="span-input">{{ scope.row.isEmploy?'已计算使用':'未计算使用' }}</span>
                </template>
              </el-table-column>
              <el-table-column width="110" prop="isEnabled" label="操作">
                <template slot-scope="scope">
                  <el-select
                    :disabled="Boolean(scope.row.isEmploy)"
                    v-model="scope.row.isEnabled"
                    placeholder="请选择"
                    @change="putEnable(scope.row)"
                  >
                    <el-option key="0" label="停用" :value="0"></el-option>
                    <el-option key="1" label="启用" :value="1"></el-option>
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="kuang" :class="show4?'cc':'bb'">
          <span
            @click="show4 = !show4"
            class="biao"
            :class="show4?'el-icon-arrow-up':'el-icon-arrow-down'"
          ></span>
          <div class="top">
            数据列表
            <!-- <span
              style="margin-left:auto;margin-right:20px"
              class="nbor-btn"
              @click="putPowerData"
            >保存</span>-->
          </div>
          <div class="scr">
            <el-table
              height="100%"
              class="my-table"
              :data="power"
              tooltip-effect="dark"
              style="width: 100%"
              highlight-current-row
            >
              <el-table-column label="风速(m/s)" prop="windSpeed">
                <template slot-scope="scope">
                  <span
                    class="span-input"
                    @blur="blurInput(scope.row,'windSpeed',$event,'keepData')"
                  >{{ scope.row.windSpeed }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="powerKW" label="功率(Kw)">
                <template slot-scope="scope">
                  <span
                    class="span-input"
                    @blur="blurInput(scope.row,'powerKW',$event,'keepData')"
                  >{{ scope.row.powerKW }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="ct" label="推力系数">
                <template slot-scope="scope">
                  <span
                    class="span-input"
                    @blur="blurInput(scope.row,'ct',$event,'keepData')"
                  >{{ scope.row.ct }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!-- @cell-dblclick="dbData" -->
        </div>
      </div>
      <div class="right">
        <div class="line-top">
          功率曲线图
          <!-- <el-cascader
            style="float:right;width:250px"
            v-model="values"
            size="mini"
            :show-all-levels="false"
            :props="{ multiple: true }"
            :options="allOptions"
            @change="handleChange1"
            collapse-tags
            clearable
          ></el-cascader>-->
        </div>
        <div style="margin-top:30px;height:80%">
          <e-linec :windSet="windSet" did="bb"></e-linec>
        </div>
      </div>
    </div>
    <el-dialog
      title="新建"
      :close-on-click-modal="false"
      :visible.sync="dialogFormVisible"
      :modal-append-to-body="false"
      width="400px"
    >
      <el-form
        ref="typeForm"
        size="mini"
        :model="form"
        label-width="90px"
        class="my-form"
        :rules="rules"
      >
        <div v-if="nOrQ==='new'">
          <el-form-item label="机型名称:" prop="name">
            <el-input placeholder="厂商代码+叶轮直径/额定功率" v-model.trim="form.name" style="width:230px"></el-input>
          </el-form-item>
          <el-form-item label="IEC版本:" prop="iecVersion">
            <el-select style="width:230px" v-model.number="form.iecVersion" placeholder="请选择IEC版本">
              <el-option :value="2"></el-option>
              <el-option :value="3"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div v-if="nOrQ==='quote'">
          <el-form-item label="公共库:" prop="types">
            <el-cascader
              style="width:240px"
              :show-all-levels="false"
              v-model="form.types"
              size="mini"
              :options="publicOptions"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer" style="text-align:center">
        <button :disabled="disabled" class="noborbtn" @click="submitForm">确 定</button>
      </div>
    </el-dialog>
    <el-dialog
      title="上传"
      :visible.sync="dialogShow"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      width="400px"
      @close='close'
    >
      <el-form
        ref="turForm"
        size="mini"
        :model="form1"
        :rules="rules1"
        label-width="60px"
        class="my-form"
         
      >
        <el-form-item label="湍流:" prop="turbulence">
          <el-input v-model="form1.turbulence" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogShow = false">取 消</el-button>
        <el-upload
          style="display:inline-block;margin-left:15px;width:auto"
          class="upload1"
          :disabled="canUp"
          accept=".xlsx, .wtg"
          :before-upload="preUpload"
          :http-request="uploadEnterprisWtg"
          :show-file-list="false"
          action
        >
          <el-button @click="ifTu">上传</el-button>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import eLinec from "@/components/echarts/linecValue.vue";
export default {
  name: "",
  data() {
    return {
      iec: null,
      form: {
        name: "",
        types: [],
        iecVersion: ""
      },
      form1: {
        turbulence: ""
      },
      dialogShow: false,
      canUp: false,
      keepMa: "", //功率曲线
      keepData: "", //功率曲线数据
      ids: [], //删除的ID
      typeId: "", //机型id
      nOrQ: "",
      rules: {
        name: [
          { required: true, message: "必填项", trigger: "change" },
          {
            pattern: /^[A-Za-z]{1,4}\d{1,4}\/\d{4}\w*$/,
            message: "规则为”厂商代码+叶轮直径/额定功率“",
            trigger: "change"
          }
        ],
        types: [{ required: true, message: "必填项", trigger: "change" }],
        iecVersion: [
          {
            type: "number",
            required: true,
            message: "必填项",
            trigger: "change"
          }
        ]
      },
      rules1: {
        turbulence: [
          {
            pattern: /^(([0-1]{1}(\.\d+)?)|2)$/,
            required: true,
            message: "必填项且范围为[0-2]的数字",
            trigger: "change"
          }
        ]
      },
      disabled: false,
      dialogFormVisible: false,
      value: [],
      values: [],
      options: [],
      allOptions: [],
      publicOptions: [],
      navList: [
        {
          name: "公共库",
          icon: "icongonggong",
          path: "storehouse",
          style: "font-size:14px"
        },
        { name: "个人库", icon: "iconren", path: "personalHouse" }
      ],
      show3: true,
      show4: true,
      powers: [],
      power: [],
      windSet: {
        xName: "风速(m/s)",
        yName: ["功率（kW）", "推力系数"],
        yData: []
      },
      file: {}
    };
  },
  components: { eLinec },
  mounted() {
    // this.getTypeList();
    this.getTypeList();
    // this.getAllTypeList();
  },
  methods: {
     close(){
      this.$refs['turForm'].resetFields();
    },
    ifTu() {
      this.$refs["turForm"].validate(valid => {
        if (valid) {
          this.canUp = false;
        } else {
          this.canUp = true;
          return false;
        }
      });
    },
    orUp() {
      if (this.value.length) {
        this.dialogShow = true;

        // this.canUp = false;
      } else {
        this.$message("请先选择机型");
        this.dialogShow = false;
        // this.canUp = true;
      }
    },
    blurInput(row, prop, event, what) {
      row[prop] = event.target.innerText;
      this[what] = row;
    },
    db(row, column, cell, event) {
      if (!this["keepMa"] || this["keepMa"].id === row.id) {
        event.target.setAttribute("contenteditable", "true");
        event.target.focus();
      } else {
        this.$confirm("存在未保存的数据，是否保存后再编辑？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "noborbtn",
          confirmButtonClass: "noborbtn",
          type: "warning"
        })
          .then(() => {
            this.putPower();
          })
          .catch(() => {});
      }
    },
    dbData(row, column, cell, event) {
      if (!this["keepData"] || this["keepData"].id === row.id) {
        event.target.setAttribute("contenteditable", "true");
        event.target.focus();
      } else {
        this.$confirm("存在未保存的数据，是否保存后再编辑？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "noborbtn",
          confirmButtonClass: "noborbtn",
          type: "warning"
        })
          .then(() => {
            this.putPowerData();
          })
          .catch(() => {});
      }
    },
    putPower() {
      this.projectHttps
        .putPower(this.keepMa)
        .then(() => {
          this.keepMa = "";
          this.getEPowerList(this.typeId);
        })
        .catch(err => console.log(err));
    },
    putPowerData() {
      this.projectHttps
        .putPowerData(this.keepData, this.typeId, this.ids[0])
        .then(() => {
          this.keepData = "";

          this.getSingPower();
        })
        .catch(err => console.log(err));
    },
    putEnable(row) {
      this.projectHttps
        .putEnable(row)
        .then(() => {})
        .catch(err => console.log(err));
    },
    preUpload(file) {
      if (file.name.length > 200) {
          this.$message("文件名长度不能超过200个字符");
          return false;
        }
      this.file = file;
      return;
    },
    uploadEnterprisWtg() {
      if (this.typeId) {
        this.projectHttps
          .uploadEnterprisWtg(this.typeId, this.file, this.form1.turbulence)
          .then(res => {
            this.getEPowerList(this.typeId);
            // this.powers = res;
            this.dialogShow = false;
            this.form1.turbulence = "";
          })
          .catch(err => console.log(err));
      } else {
        this.$message({
          message: "请先选择机型",
          center: true
        });
      }
    },
    open(data) {
      this.disabled = false;
      this.nOrQ = data;
      this.dialogFormVisible = true;
    },
    submitForm() {
      switch (this.nOrQ) {
        case "new":
          this.newEnterprisType();
          break;
        case "quote":
          this.quote();
          break;
      }
    },
    findIec(arr, a) {
      arr.find(it => {
        if (it.children) {
          this.findIec(it.children, a);
        } else {
          if (it.value == a) {
            this.iec = it.iecVersion;
          }
        }
      });
    },
    handleChange(value) {
      this.typeId = value[value.length - 1];
      this.findIec(this.options, value[value.length - 1]);
      this.getEPowerList(this.typeId);
    },
    handleChange1(value) {
      let arr = value
        .map(item => {
          return item[item.length - 1];
        })
        .filter(it => {
          return it != null;
        });
      this.getAllPower([...arr]);
    },
    newEnterprisType() {
      this.$refs["typeForm"].validate(valid => {
        if (valid) {
          this.disabled = true;
          this.projectHttps
            .newEnterprisType(this.form)
            .then(res => {
              let vm = this;
              setTimeout(() => {
                vm.value = [null, res.id + ""];
                vm.values = [null, res.id + ""];
                this.typeId = res.id + "";
                vm.iec = res.iecVersion;
              }, 500);
              this.getTypeList();
              this.dialogFormVisible = false;
              this.form = {
                types: [],
                name: ""
              };
              this.powers = [];
              this.power = [];
              this.windSet.yData = [];
              this.$refs["typeForm"].resetFields();
            })
            .catch(err => {
              this.disabled = false;
              console.log(err);
            });
        } else {
          this.disabled = false;
          console.log("error submit!!");
          return false;
        }
      });
    },
    quote() {
      let id = this.form.types[this.form.types.length - 1];
      this.$refs["typeForm"].validate(valid => {
        if (valid) {
          this.disabled = true;
          this.projectHttps
            .quote(id)
            .then(() => {
              this.getTypeList();
              this.dialogFormVisible = false;
              this.form = {
                types: [],
                name: ""
              };
              this.$refs["typeForm"].resetFields();
            })
            .catch(err => console.log(err));
        } else {
          this.disabled = false;
          console.log("error submit!!");
          return false;
        }
      });
    },
    getAllTypeList() {
      this.projectHttps
        .getAllTypeList()
        .then(res => {
          this.allOptions = res;
        })
        .catch(err => console.log(err));
    },
    getTypeList() {
      this.projectHttps
        .getTypeList()
        .then(res => {
          this.options = res;
        })
        .catch(err => console.log(err));
    },
    getEPowerList(type_id) {
      this.projectHttps
        .getEPowerList(type_id)
        .then(res => {
          this.ids = [];
          this.powers = res;
          this.power = [];
          this.windSet.yData = [];
          this.values = [];
        })
        .catch(err => console.log(err));
    },
    delEnterprisPower(ids = this.ids) {
      if (!ids[0]) {
        this.$message("请选择要删除的功率曲线");
        return;
      }
      this.$confirm("此操作将删除该条功率曲线, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "noborbtn",
        confirmButtonClass: "noborbtn",
        type: "warning"
      })
        .then(() => {
          this.projectHttps
            .delEnterprisPower([ids[0]])
            .then(res => {
              this.ids = [];
              this.$message("删除成功");
              this.getEPowerList(this.typeId);
            })
            .catch(err => console.log(err));
        })
        .catch(() => {});
    },
    delEnterprisType(TypeId) {
      this.$confirm("此操作将删除该机型, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "noborbtn",
        confirmButtonClass: "noborbtn",
        type: "warning"
      })
        .then(() => {
          this.projectHttps
            .delEnterprisType(TypeId)
            .then(res => {
              this.powers = [];
              this.power = [];
              this.iec = "";
              this.windSet.yData = [];
              this.$message("删除成功");
              this.getTypeList();
            })
            .catch(err => console.log(err));
        })
        .catch(() => {});
    },
    getSingPower(row, column, event) {
      this.values = [];
      row && ((this.ids[0] = row.id), (this.ids[1] = row.name));
      this.projectHttps
        .getSingPower(this.ids[0])
        .then(res => {
          this.windSet.yData = [];
          if (res.length == 1) {
            this.power = res[0];
            let cp = this.forLine(this.power, "powerKW");
            this.$set(this.windSet, "yData", [
              {
                name: this.ids[1],
                data: cp,
                type: "line",
                color: "#099FFF",
                symbolSize: 1,
                smooth: true
              },
              {
                name: `${this.ids[1]}-ct`,
                yAxisIndex: 1,
                data: this.forLine(this.power, "ct"),
                type: "line",
                color: "#FF2E76",
                symbolSize: 1,
                smooth: true
              }
            ]);
          } else {
            this.power = [];
            for (let item of res) {
              this.windSet.yData.push(
                {
                  name: `${this.ids[1]}-${item[0]["airDensity"]}`,
                  data: this.forLine(item, "powerKW"),
                  type: "line",
                  symbolSize: 1,
                  smooth: true
                },
                {
                  name: `${this.ids[1]}-${item[0]["airDensity"]}-ct`,
                  yAxisIndex: 1,
                  data: this.forLine(item, "ct"),
                  type: "line",
                  symbolSize: 1,
                  smooth: true
                }
              );
            }
          }
        })
        .catch(err => console.log(err));
    },
    getAllPower(arr) {
      this.windSet.yData = [];
      this.projectHttps
        .getAllPower(arr)
        .then(res => {
          let data = res;
          for (let item of Object.entries(data)) {
            this.windSet.yData.push(
              {
                name: item[0],
                data: this.forLine(item[1], "powerKW"),
                type: "line",
                symbolSize: 1,
                smooth: true
              },
              {
                name: `${item[0]}-ct`,
                yAxisIndex: 1,
                data: this.forLine(item[1], "ct"),
                type: "line",
                symbolSize: 1,
                smooth: true
              }
            );
          }
        })
        .catch(err => console.log(err));
    },
    forLine(arr, dir) {
      if (arr == null) {
        arr = [];
      }
      return arr.map(item => {
        return [item["windSpeed"], item[dir]];
      });
    }
  }
};
</script>

<style lang="less">
.type-house {
  padding: 30px 10px 50px 0;
  .double {
    display: flex;
    // overflow: hidden;
    // min-height:500px;
    height: calc(100% - 0px);
    .left {
      flex: 1;
      border-right: 1px dashed #2b678b;
      color: @whiteColor;
      padding: 0 10px;
      overflow: auto;
      .sel-top {
        display: flex;
        .newbtn {
          margin-left: 10px;
        }
      }
      .kuang {
        position: relative;
        margin-top: 10px;
        .bor(@inputColor);
        // overflow: hidden;
        transition: height 0.5s;
        .span-input {
          display: inline-block;
          width: 100%;
          height: 26px;
          margin-top: 1px;
          &:focus {
            .bor(@highColor);
            outline: none;
          }
        }
        .biao {
          position: absolute;
          right: 8px;
          top: 5px;
          z-index: 1;
        }
        &.aa {
          width: 99%;
          height: 35%;
          overflow-y: auto;
          overflow-x: hidden;
        }
        &.cc {
          width: 99%;
          height: 55%;
          overflow-y: auto;
          overflow-x: hidden;
        }
        &.bb {
          height: 112px;
        }
        .top {
          display: flex;
          padding: 2px 10px;
          color: @whiteColor;
          background: #034972;
          &::after {
            position: absolute;
            left: 2px;
            top: 2px;
            content: "";
            width: 0px;
            height: 0px;
            border-width: 3.5px;
            border-style: solid;
            border-color: #ff2e76 transparent transparent #ff2e76;
          }
          .nbor-btn {
            color: @highColor;
            padding: 0 8px;
            a {
              color: @highColor;
            }
            .bor(transparent);
            &:hover {
              .bor(@highColor);
            }
          }
        }
        .scr {
          height: calc(100% - 27px);
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
            background: transparent;
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
                  background-color: #012d47;
                  border-radius: 12px;
                }
              }
            }
          }
          .cell {
            .el-select{
              .el-input__inner{
                background-color: transparent;
                .bor(@tborder);
                height:24px;
                line-height: 24px;
                color:@whiteColor;
              }}

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
                    margin: 0 5px;
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
            .el-table__row.current-row {
              background: url(/imgs/table-bg.png) no-repeat 3px 2px;
              background-size: calc(100% - 6px) 30px;
              color: @hWhiteColor;
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
    .right {
      flex: 1;
      .line-top {
        position: relative;
        top: 20px;
        padding-left: 13px;
        color: @whiteColor;
      }
    }
  }
}
</style>
