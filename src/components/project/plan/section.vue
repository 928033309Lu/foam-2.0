<template>
  <el-dialog class="section-number" title="扇区选择" :visible.sync="visible" :modal-append-to-body="false"
             :close-on-click-modal="true" width="691px" top="90px">
    <div class="btn-container">
      <el-button v-if="!disabled" class="check-btn" @click="cancleChecked">全部取消勾选</el-button>
      <el-button v-if="disabled" type="text"><i class="iconfont iconduihaox"></i>普通扇区</el-button>
      <el-button v-if="disabled && admSectionIds && admSectionIds.length" type="text"><i class="iconfont iconpanzi"></i>致动盘</el-button>
      <!--<el-button class="check-btn" @click="checkedMinValue">所有最稳定</el-button>-->
      <!--<el-button class="check-btn">按稳定度选择列</el-button>-->
    </div>
    <div class="section-table fixed-thead" :class="{'edit': !disabled && (curHoverTdCol || curHoverTdCol === 0)}">
      <ul class="col col-1">
        <li class="head">
          <p class="top">热力稳定度</p>
          <p class="btm">扇区方向</p>
        </li>
      </ul>
      <ul class="col" v-for="degree in 10" :key="degree" :class="{'hover' : !disabled && (curHoverTdCol === degree-1)}">
        <li @mouseover="curHoverTdCol = degree-1"
            @mouseout="curHoverTdCol = ''"
            @click="theadClick(degree-1)"
            :title="!disabled && '点击选中当前列' || ''">{{degree - 1}}</li>
      </ul>
    </div>
    <el-scrollbar style="height: 50vh;">
      <div class="section-table" :class="{'edit': curHoverTdCol || curHoverTdCol === 0}">
        <ul class="col col-1">
          <!--<li class="head">-->
            <!--<p class="top">热力稳定度</p>-->
            <!--<p class="btm">扇区方向</p>-->
          <!--</li>-->
          <li v-for="angle in angelArr" :key="angle">{{angle}}</li>
        </ul>
        <ul class="col" v-for="degree in 10" :key="degree" :class="{'hover' : !disabled && curHoverTdCol === degree-1}">
          <!--<li @mouseover="curHoverTdCol = degree-1"-->
              <!--@mouseout="curHoverTdCol = ''"-->
              <!--@click="theadClick(degree-1)"-->
              <!--title="点击选中当前列">{{degree - 1}}</li>-->
          <li v-for="angle in angelArr" :key="angle"
              :class="{
              'editable': !disabled,
              'available': Object.keys(angleList[angle]).includes(String(degree-1)) && angleList[angle][degree-1].status === 1,
              'checked': angleList[angle][degree-1] && checkedIds.includes(angleList[angle][degree-1].id),
              'admChecked': angleList[angle][degree-1] && admSectionIds && admSectionIds.length && admSectionIds.includes(angleList[angle][degree-1].id)}"
              @click.stop="tdClick(angleList[angle], angle, degree-1)">
            <i class="iconfont iconduihaox"></i>
            <i class="iconfont iconpanzi"></i>
          </li>
        </ul>
      </div>
    </el-scrollbar>
    <template slot="footer" v-if="!disabled">
      <el-button type="primary" @click="resetChecked">重 置</el-button>
      <el-button type="primary" @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </template>
    <!--<el-dialog width="30%" title="提示" :visible.sync="innerVisible" append-to-body></el-dialog>-->
    <div class="my-dialog" v-if="innerVisible">
      <div class="el-dialog" style="margin-top: 90px; width: 400px;">
        <div class="el-dialog__header"><span class="el-dialog__title">提示</span>
          <el-button type="text" class="el-dialog__headerbtn" @click="innerVisible = false"><i
              class="el-dialog__close el-icon el-icon-close"></i></el-button>
        </div>
        <div class="el-dialog__body">
          <p>两个扇区之间的角度差不能大于45°，不能发起计算!</p>
        </div>
        <div class="el-dialog__footer">
          <el-button type="primary" @click="innerVisible = false">忽 略</el-button>
          <el-button type="primary" @click="goModifySection">去修改扇区</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "sectionNumber",
    data(){
      return {
        visible: false,
        tableList: this.list,
        hasGetSet: false,
        projectId: this.$route.params.projectId,
        id: this.$route.params.id,
        innerVisible: false,
        innerText:'',
        steadyOptions: [
          {
            label: 0,
            value: -80
          }, {
            label: 1,
            value: -500
          }, {
            label: 2,
            value: 10000
          }, {
            label: 3,
            value: 1500
          }, {
            label: 4,
            value: 800
          }, {
            label: 5,
            value: 500
          }, {
            label: 6,
            value: 300
          }, {
            label: 7,
            value: 200
          }, {
            label: 8,
            value: 130
          }, {
            label: 9,
            value: 60
          }
        ],
        angleList: {},
        checkedIds: Object.assign([], this.sectionIds) || [],
        curHoverTdCol: '',
        angelArr: []
      }
    },
    props: {
      disabled: {
        default: false
      },
      sectionIds: {
        type: Array,
        default: ()=>{
          return []
        }
      },
      admSectionIds: {
        type: Array,
        default: ()=>{
          return []
        }
      },
    },
    computed: {
    },
    watch: {
      list(cur){
        this.tableList = cur;
      }
    },
    methods: {
      showDialog(){
        this.visible = true;
        this.initTable()
      },
      initTable(){
        this.checkedIds = Object.assign([], this.sectionIds) || []
        this.getAvail();
      },
      // 获取扇区数据
      getAvail(){
        let vm = this;
        // if(this.hasGetSet) return;
        this.planHttps.getAvail(this.projectId).then(res => {
          this.hasGetSet = true;
          this.tableList = res;
          // 处理数据，生成angleList对象 {angle: {degree: {id: '', status: ''}}}
          vm.angleList = {}
          res.length && res.map(v=>{
            if(vm.angleList[v.angle]){
              vm.angleList[v.angle][vm.getDegreeByBorderValue(v.borderValue)] = {
                id: v.id,
                status: v.status
              }
            }else{
              vm.angleList[v.angle] = {
                [vm.getDegreeByBorderValue(v.borderValue)]: {
                  id: v.id,
                  status: v.status
                }
              }
            }
          })
          this.$nextTick(()=>{
            vm.angelArr = Object.keys(vm.angleList).sort((a,b)=>{return a-b})
            vm.checkAnglePoor();
            (!vm.sectionIds || !vm.sectionIds.length) && vm.checkedMinValue() // 默认没有选中的情况下，选中所有最稳定
          })
        })
      },
      // 热力稳定度 根据值获取等级
      getDegreeByBorderValue(value){
        return this.steadyOptions.filter(v => {
          return value === v.value
        })[0].label
      },
      // 判断扇区之间是否超过45°
      checkAnglePoor(){
        let vm = this;
        let arr =  vm.angleArr && vm.angleArr.map((v,k)=>{
          return k>0 && v-vm.angleArr[k-1] || v
        }) || []
        if(Math.max(...arr) > 45 || (360 - vm.tableList.reverse()[0]) > 45){
          this.innerVisible = true;
          // this.$confirm('两个扇区之间的角度差不能大于45°，不能发起计算!', '提示', {
          //   confirmButtonText: '去修改扇区',
          //   cancelButtonText: '忽略',
          //   type: 'warning'
          // }).then(() => {
          //   this.$router.push({name: 'direc-calculate', params: {projectId: this.projectId}})
          // }).catch(() => {
          // });
        }else{
          this.innerVisible = false
        }
      },
      // 表头点击事件 - 选中当前列
      theadClick(degree){
        let vm = this;
        if(vm.disabled) return;
        for(let k in this.angleList){
          let section = this.angleList[k]
          Object.keys(section).length && Object.keys(section).map(v => {
            if(vm.checkedIds.includes(section[v].id) && section[degree] && section[degree].status == 1) { //当前项可选择且已选中
              vm.checkedIds.splice(vm.checkedIds.indexOf(section[v].id), 1)
            }
          })
          section[degree] && !this.checkedIds.includes(section[degree].id) && section[degree].status == 1 && vm.checkedIds.push(section[degree].id)
        }
      },
      // 表格点击事件 - 选中当前项or取消
      tdClick(section, angle, degree){
        let vm = this;
        if(vm.disabled) return;
        if(!section[degree] || section[degree].status != '1') return;
        if(!this.checkedIds.includes(section[degree].id)){
          // 清除当前angle中选中的热力稳定度
          Object.keys(section).length && Object.keys(section).map(v => {
            if(vm.checkedIds.includes(section[v].id)) {
              vm.checkedIds.splice(vm.checkedIds.indexOf(section[v].id), 1)
            }
          })
          this.checkedIds.push(section[degree].id)
        }else{
          this.checkedIds.splice(this.checkedIds.indexOf(section[degree].id), 1)
        }
      },
      // 取消所选
      cancleChecked(){
        this.checkedIds = []
      },
      // 所有最稳定
      checkedMinValue(){
        let vm = this;
        this.checkedIds = [];
        for(let k in this.angleList){
          let section = this.angleList[k]
          let degree = Math.max(...Object.keys(section))
          section[degree] && !this.checkedIds.includes(section[degree].id) && section[degree].status == 1 && vm.checkedIds.push(section[degree].id)
        }
      },
      // 跳转至定向计算页面，修改扇区
      goModifySection(){
        sessionStorage.setItem('detail',JSON.stringify({projectId: this.projectId}));
        this.$router.push({name: 'direc-calculate', params: {projectId: this.projectId}});
      },
      // 恢复默认
      resetChecked(){
        this.checkedIds = Object.assign([], this.sectionIds) || []
        // this.caculateHttps.resetMoreParam(this.projectId).then(res => {
        //   this.standard = Object.assign(res, {
        //     simulate: {
        //       maxIterateStep: res.maxIterateStep
        //     }
        //   })
        // })
      },
      confirm(){
        // let vm = this;
        // this.$refs.standard.validate(valid => {
        //   if(valid){
        let p = new Promise(resolve=>{
          this.planHttps.updateSection({
            projectId: this.projectId,
            scheme_id: this.id,
            ids: this.checkedIds
          }).then(res => {
            if(res) {
              // this.$message("保存成功！");
              this.$emit("update:sectionIds", this.checkedIds)
              this.visible = false;
              resolve()
            }
          })
        })
           return p;
        //   }else {
        //   }
        // })
      },
    }
  }
</script>

<style lang="less">
  .section-number{
    >.el-dialog{
      .el-dialog__title{
        display: inherit;
      }
      >.el-dialog__body{
        position: relative;
      }
    }
    .el-dialog__body{
      padding-top: 10px;
      .btn-container{
        line-height: 1;
        text-align: right;
        padding-bottom: 10px;
        .el-button.el-button--text{
          font-size: 14px;
          cursor: auto;
          color: #fff;
          &:hover{
            border-color: transparent;
            /*color: @highColor;*/
          }
          >*{
            vertical-align: top;
          }
          i{
            font-size: 20px;
            line-height: 14px;
            font-weight: bold;
            margin-right: 3px;
            &.iconduihaox{
              color: #00C8CF;
            }
            &.iconpanzi{
              color: @error;
            }
          }
        }
      }
      .my-dialog{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: calc(100% + 90px);
        top: -30px;
        background: rgba(0,0,0,.3);
        .el-dialog__body{
          color: @whiteColor;
        }
      }
      .el-scrollbar{
        .el-scrollbar__bar{
          right: 0px;
        }
      }
    }
    .copy-select{
      width: 90px;
      height: 18px;
      border: 1px solid transparent;
      &:hover{
        border-color: @highColor
      }
    }
    .section-container{
      max-height: calc(100vh - 400px);
      overflow: auto;
    }
    .section-table{
      position: relative;
      min-height: 27px;
      border-left: 1px solid @tborder;
      &.fixed-thead::before{
        content: '';
        display: inline-block;
        width: 100%;
        height: 28px;
        background: @listColor;
        border-top: 1px solid @tborder;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
      }
      &::after{
        content: "";
        clear: both;
        display: table;
      }
      &.edit{
        &::before{
          background: @linearGradient;
        }
        .col{
          &:not(.col-1){
            li:first-child{
              cursor: pointer;
            }
          }
        }
      }
      .col{
        float: left;
        li{
          width: 57px;
          height: 28px;
          border-right: 1px solid @tborder;
          border-bottom: 1px solid @tborder;
          text-align: center;
          line-height: 28px;
          color: @whiteColor;
          .iconduihaox{
            font-size: 20px;
            display: none;
            color: #00C8CF;
          }
          .iconpanzi{
            font-size: 20px;
            display: none;
            color: @error;
            font-weight: bold;
          }
          &.head{
            position: relative;
            width: 80px;
            height: 28px;
            overflow: visible;
            &:before{
              content: "";
              display: inline-block;
              width: 84px;
              height: 1px;
              background-color: #2B678B;
              position: absolute;
              left: -3px;
              top: 13px;
              z-index: 1;
              -webkit-transform: rotate(20deg);
              transform: rotate(19deg);
            }
            &:after{
              position: absolute;
              left: 2px;
              top: 2px;
              content: "";
              width: 0px;
              height: 0px;
              border-width: 3.5px;
              border-style: solid;
              border-color: #FF2E76 transparent transparent #FF2E76;
              z-index: 1;
            }
            .top, .btm{
              position: absolute;
              font-size: 10px;
              transform: scale(0.8);
            }
            .top{
              top: -7px;
              right: -4px;
            }
            .btm{
              left: 0px;
              bottom: -7px;
            }
          }
          &.available{
            background-color: rgba(0, 255, 255, .2);
            cursor: pointer;
            &:not(.editable){
              cursor: not-allowed;
            }
            &.editable:hover{
              border: 1px solid @highColor;
            }
            &.checked{
              .iconduihaox{
                display: inline-block;
              }
            }
            &.admChecked{
              .iconduihaox{
                display: none;
              }
              .iconpanzi{
                display: inline-block;
              }
            }
          }
        }
        &:not(.col-1){
          li:first-child{
            position: relative;
            z-index: 0;
          }
        }
        &.hover{
          li:last-child:not(:first-child){
            position: relative;
            &::before,
            &::after{
              content: "";
              display: inline-block;
              width: 7px;
              height: 7px;
              border-bottom: 1px solid @error;
              position: absolute;
              bottom: 0;
            }
            &::before{
              border-left: 1px solid @error;
              left: 0;
            }
            &::after{
              border-right: 1px solid @error;
              right: 0;
            }
          }
        }
        &.col-1{
          li{
            width: 80px;
          }
        }
      }
      &.fixed-thead{
        .col{
          &.hover{
            li:first-child{
              position: relative;
              &::before,
              &::after{
                content: "";
                display: inline-block;
                width: 7px;
                height: 7px;
                border-top: 1px solid @error;
                position: absolute;
                top: 0;
              }
              &::before{
                border-left: 1px solid @error;
                left: 0;
              }
              &::after{
                border-right: 1px solid @error;
                right: 0;
              }
            }
          }
        }
      }
    }
  }
</style>
