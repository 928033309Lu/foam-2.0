<template>
  <div class="storehouse">
    <nav-top :nav-list="navList" activeName="公共库"></nav-top>
    <div class="double">
      <div class="left">
        <el-cascader
          v-model="value"
          :show-all-levels="false"
          size="mini"
          :options="options"
          :props="{ expandTrigger: 'hover' }"
          @change="handleChange"
        ></el-cascader>
        <span style="margin-top:4px;margin-left:10px">IEC版本: {{iec?iec:'--'}}</span>
        <div class="kuang" :class="show3?'aa':'bb'">
          <span
            @click="show3 = !show3"
            class="biao"
            :class="show3?'el-icon-arrow-up':'el-icon-arrow-down'"
          ></span>
          <div class="scr">
            <el-table
              height="100%"
              @row-click="getSingPower"
              class="my-table"
              :data="powers"
              tooltip-effect="dark"
              style="width: 100%"
              highlight-current-row
            >
              <el-table-column show-overflow-tooltip label="名称" prop="name"></el-table-column>
              <el-table-column prop="airDensity" label="空气密度(kg/m3)"></el-table-column>
              <el-table-column prop="turbulence" label="湍流强度"></el-table-column>
              <!-- <el-table-column show-overflow-tooltip prop="remark" label="备注">
                <template slot-scope="scope">
                  <span class="span-input"> {{ scope.row.remark?scope.row.remark:'--' }}</span>
                </template>
              </el-table-column>-->
              <el-table-column prop="isEmploy" label="状态">
                <template slot-scope="scope">
                  <span class="span-input">{{ scope.row.isEmploy?'已计算使用':'未计算使用' }}</span>
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
          <div class="scr">
            <el-table
              height="100%"
              class="my-table"
              :data="power"
              tooltip-effect="dark"
              style="width: 100%"
              highlight-current-row
            >
              <el-table-column label="风速(m/s)" prop="windSpeed"></el-table-column>
              <el-table-column prop="powerKW" label="功率(Kw)"></el-table-column>
              <el-table-column prop="ct" label="推力系数"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="line-top">功率曲线图</div>
        <div style="height:80%">
          <e-linec :windSet="windSet" did="bb"></e-linec>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import navTop from "@/components/project/nav-top.vue";
import eLinec from "@/components/echarts/linecValue.vue";
export default {
  name: "",
  data() {
    return {
      iec: "",
      value: [],
      options: [],
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
      }
    };
  },
  components: { navTop, eLinec },
  mounted() {
    this.getTypeList();
  },
  methods: {
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
      this.findIec(this.options, value[value.length - 1]);
      this.getPowerList(value[value.length - 1]);
    },
    getTypeList() {
      this.projectHttps
        .getTypeList()
        .then(res => {
          this.options = res;
        })
        .catch(err => console.log(err));
    },
    getPowerList(type_id) {
      this.projectHttps
        .getPowerList(type_id)
        .then(res => {
          this.powers = res;
          this.power = [];
          this.windSet.yData = [];
        })
        .catch(err => console.log(err));
    },
    getSingPower(row, column, event) {
      this.projectHttps
        .getSingPower(row.id)
        .then(res => {
          this.windSet.yData = [];
          if (res.length == 1) {
            this.power = res[0];
            let cp = this.forLine(this.power, "powerKW");
            this.$set(this.windSet, "yData", [
              {
                name: row.name,
                data: cp,
                type: "line",
                color: "#099FFF",
                symbolSize: 1,
                smooth: true
              },
              {
                name: `${row.name}-ct`,
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
                  name: `${row.name}-${item[0]["airDensity"]}`,
                  data: this.forLine(item, "powerKW"),
                  type: "line",
                  symbolSize: 1,
                  smooth: true
                },
                {
                  name: `${row.name}-${item[0]["airDensity"]}-ct`,
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
    forLine(arr, dir) {
      return arr.map(item => {
        return [item["windSpeed"], item[dir]];
      });
    }
  }
};
</script>

<style lang="less">
.storehouse {
  padding: 0 10px 50px 0;
  .double {
    // overflow: hidden;
    height: calc(100% - 50px);
    // min-height:500px;
    display: flex;
    .left {
      flex: 1;
      border-right: 1px dashed #2b678b;
      color: @whiteColor;
      padding: 0 10px;
      // overflow: auto;
      .kuang {
        position: relative;
        margin-top: 10px;
        .bor(@inputColor);
        // overflow: hidden;
        transition: height 0.5s;
        .biao {
          position: absolute;
          right: 8px;
          top: 4px;
          z-index: 1;
        }
        &.aa {
          height: 35%;
          overflow: auto;
        }
        &.cc {
          height: 55%;
          overflow: auto;
        }
        &.bb {
          height: 112px;
          overflow: auto;
        }
        .scr {
          height: 100%;
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