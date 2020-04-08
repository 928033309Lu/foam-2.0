<template>
  <div class="fan-split">
    <div class="el-form-item__label">
      <el-radio-group class="dark-radio" v-model="type" @change="changeType">
        <el-radio-button label="扇区数"></el-radio-button>
        <el-radio-button label="步长"></el-radio-button>
      </el-radio-group>：
    </div>
    <template>
      <div class="fan-input required" ref="fanInput">
        <el-input v-if="showFanType" type="text" :disabled="disabled" v-model="fanNumber" :class="fanNumberError && 'is-error'" placeholder="请输入扇区数" @focus="focusInput" @blur="blurInput('fanNumber')" @mousewheel.native.prevent></el-input>
        <el-input v-else type="text" :disabled="disabled" v-model="step" :class="stepError && 'is-error'" placeholder="请输入步长" @focus="focusInput" @blur="blurInput('step')" @mousewheel.native.prevent></el-input>
        <el-button v-show="!disabled" @click="btnAction" @mouseleave.native="leaveBtn" @mouseover.native="hoverBtn">{{buttonText}}</el-button>
        <span class="fan-length" v-if="fanList && fanList.length">当前扇区共{{fanList.length}}个</span>
      </div>
      <div class="scroll-hidden">
        <div class="fan-content">
          <div class="fan-line" v-for="(fan,index) in fanList" :key="index">
            角度：
            <el-input type="text" :disabled="disabled" v-model.number="fan.angle" :class="(fan.angle<0 || fan.angle>=360 )&& 'is-error'" placeholder="请输入角度" @mousewheel.native.prevent class="angle-input" @blur="formatData(fan, index)" @change="angleChange"></el-input>
            <el-select :disabled="disabled" class="steady" v-model="fan.level" placeholder="请选择热力稳定度" @change="changeFanList">
              <el-option :label="option.label" :value="option.value" v-for="option in steadyOptions" :key="option.value"></el-option>
            </el-select>
            <i class="iconfont el-icon-plus" v-show="!disabled" @click="addFan(index)"></i>
            <i class="iconfont el-icon-minus" v-show="!disabled" @click="deleteFan(index)"></i>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  // import textInput from '../form/text-input.vue'
  // import {formChecker} from '../../utils/validator'

  export default {
    data() {
      return {
        type: '扇区数',
        fanNumber: '',
        step: '',
        fanNumberError: false,
        stepError: false,
        fanList: [],
        focusStatus: false,
        hoverLock: false,
        steadyOptions: [
          {
            label: '热稳定度等级：0-非常不稳定',
            value: -80
          }, {
            label: '热稳定度等级：1-不稳定',
            value: -500
          }, {
            label: '热稳定度等级：2-中性',
            value: 10000
          }, {
            label: '热稳定度等级：3-弱稳定',
            value: 1500
          }, {
            label: '热稳定度等级：4-弱稳定',
            value: 800
          }, {
            label: '热稳定度等级：5-稳定',
            value: 500
          }, {
            label: '热稳定度等级：6-稳定',
            value: 300
          }, {
            label: '热稳定度等级：7-稳定',
            value: 200
          }, {
            label: '热稳定度等级：8-非常稳定',
            value: 130
          }, {
            label: '热稳定度等级：9-非常稳定',
            value: 60
          }
        ]
      }
    },
    computed: {
      showFanType() {
        return this.type === '扇区数';
      },
      buttonText() {
        return this.focusStatus ? '设置' : '清空';
      },
    },
    props: {
      value: {},
      disabled: {
        default: false
      },
      errorTips: {}
    },
    components: {
    },
    mounted(){
      this.fanList = this.value
    },
    methods: {
      compare(property) {
        return function (obj1, obj2) {
          var value1 = obj1[property];
          var value2 = obj2[property];
          return value1 - value2;
        }
      },
      formatData(value, index){
        value.angle && (this.fanList[index].angle = Number(value.angle.toFixed(1)))
        this.changeFanList()
        this.angleChange()
      },
      createFan() {
        if (this.showFanType && !this.fanNumber || this.fanNumber === '0') {
          return;
        }
        if (!this.showFanType && !this.step || this.step === '0') {
          return;
        }
        let step = Math.round(this.showFanType ? 360 / this.fanNumber*10 : this.step*10)/10;
        if (Number.isFinite(step)) {
          if (this.fanList.length == 0) {
            this.fanList.push({
              angle: 0,
              level: 10000
            });
          }
          for (let k = step; k < 360; k += step) {
            let filterList = this.fanList.filter((value) => {
              return value.angle === k;
            });
            if (filterList.length === 0) {
              this.fanList.push({
                angle: Number(k.toFixed(1)),
                level: 10000
              })
            }
          }
          this.fanList = this.getSingle(this.fanList);
          this.fanList = this.fanList.sort(this.compare("angle"));
          this.changeFanList();
        }

      },
      getSingle(arr) {
        let unique = {};
        arr.forEach(function (a) {
          unique[JSON.stringify(a)] = 1
        });
        arr = Object.keys(unique).map(function (u) {
          return JSON.parse(u)
        });
        return arr
      },
      addFan(index) {
        let newFan = {
          value: '',
          level: 10000
        };
        this.fanList = this.fanList.slice(0, index + 1).concat([newFan]).concat(this.fanList.slice(index + 1));
        this.changeFanList();
      },
      btnAction() {
        if (this.hoverLock) {
          this.hoverLock = false;
        } else {
          this.fanList = [];
          this.fanNumber = '';
          this.step = '';
          this.$emit('update:value', this.fanList);
          this.$emit('changeSectionInfos', this.fanList)
        }
      },
      deleteFan(index) {
        this.fanList.splice(index, 1);
        this.changeFanList();
      },
      blurInput(name) {
        let _this = this;
        if(this[name+'Error']) return;
        setTimeout(function () {
          _this.focusStatus = false;
          _this.createFan();
          // _this.$emit('update:value', this.fanList);
        }, 300)
      },
      focusInput() {
        this.focusStatus = true;
      },
      hoverBtn() {
        if (this.focusStatus) {
          this.hoverLock = true;
        }
      },
      leaveBtn() {
        this.hoverLock = false;
      },
      changeFanList() {
        // this.fanNumber = this.fanList.length
        this.$emit('update:value', this.fanList);
        this.$emit('clearError', "请设置扇区");
        this.$emit('changeSectionInfos', this.fanList)
        this.checkAngleRepeat()
      },
      changeType(type) {
        if (type === '步长') {
          !this.fanNumberError && (this.step = this.fanNumber ? Number((360 / this.fanNumber).toFixed(1)) : '') || (this.step = '');
          this.$emit("clearError", `扇区应为大于等于1小于等于360的整数！`)
        }else{
          !this.stepError && (this.fanNumber = this.step ? parseInt(360 / this.step) : '') || (this.fanNumber = '');
          this.$emit("clearError", `步长应大于0小于等于360！`)
        }
      },
      checkAngleRepeat(){
        let vm = this, arr = [], angle = '', level = '';
        vm.errorTips.forEach(v=>{
          if(v.includes("不应重复")){
            this.$emit("clearError", v)
          }
        })
        for(let k=0; k< vm.fanList.length; k++){
          let v = vm.fanList[k]
          let str = v.angle+','+v.level
          if((!v.angle && v.angle !== 0) || v.angle<0 || v.angle>=360){
            vm.$emit("unshiftError", `扇区角度必须大于等于0且小于360！`)
          }
          if(arr.indexOf(str) == -1){
            arr.push(v.angle+','+v.level)
          }else{
            angle = v.angle;
            level = vm.steadyOptions.filter(u=>{return u.value == v.level})[0].label.substr(7, 1);
            vm.$emit("unshiftError", `${angle}度扇区 热力稳定度${level} 不应重复！`)
            break;
          }
        }
      },
      angleChange(){
        let vm = this;
        for(let k=0; k< vm.fanList.length; k++){
          let v = vm.fanList[k]
          if((!v.angle && v.angle!==0) || v.angle<0 || v.angle>=360){
            vm.$emit("unshiftError", `扇区角度必须大于等于0且小于360！`);
            break;
          }
          if(k == vm.fanList.length-1){
            this.$emit("clearError", `扇区角度必须大于等于0且小于360！`)
          }
        }
      },
    },
    watch: {
      'value'() {
        this.fanList = [].concat(this.value);
        // this.fanNumber = this.fanNumber === '' ? this.fanList.length : this.fanNumber;
      },
      'fanNumber'(value){
        if((value || value === 0) && (value < 1 || value > 360)){
          this.$emit("unshiftError", `扇区应为大于等于1小于等于360的整数！`)
          this.fanNumberError = true
        }else{
          this.fanNumberError = false
          this.$emit("clearError", `扇区应为大于等于1小于等于360的整数！`)
          this.fanNumber && (this.fanNumber = parseInt(this.fanNumber))
        }
      },
      'step'(value){
        if(value && (value <= 0 || value > 360)) {
          this.$emit("unshiftError", `步长应大于0小于等于360！`)
          this.stepError = true
        }else{
          this.stepError = false
          this.$emit("clearError", `步长应大于0小于等于360！`)
          this.step && (this.step = Number(Number(this.step).toFixed(1)))
        }
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  .fan-split {
    .el-form-item__label{
      padding-right: 8px;
    }
    .dark-radio{
      .el-radio-button{
        .el-radio-button__inner{
          background: @sideBlack;
          padding: 6px;
          border: 1px solid @sideBlack;
          color: rgba(255, 255, 255, .4);
          border-radius: 0;
          box-shadow: none;
        }
        &.is-active{
          .el-radio-button__inner {
            border-color: @highColor;
            color: rgba(255, 255, 255, .7);
          }
        }
      }
    }
    .scroll-hidden {
      width: 100%;
      overflow: hidden;
      position: relative;
      max-height: 300px;
    }
    &::-webkit-scrollbar {
      /*display: none;*/
    }
    .is-error{
      .el-input__inner{
        border-color: @error !important;
      }
    }
    .fan-input {
      input:disabled{
        background: #EFEFEF;
      }
      button{
        margin-left: 6px;
      }
      .fan-length{
        margin-left: 130px;
        color: @highColor;
      }
    }
    input{
      color: rgba(255, 255, 255, .7) !important;
    }
    .fan-content {
      max-height: 300px;
      overflow-y: auto;
      color: rgba(255, 255, 255, .7);
      padding: 6px;
      padding-left: 120px;
      .fan-line+.fan-line{
        margin-top: 6px;
      }
      input:disabled{
        background: #EFEFEF;
      }
      .el-select{
        margin-left: 6px;
        margin-right: 6px;
      }
      .el-input.angle-input{
        width: 67px;
      }
      .steady .el-input{
        width: 224px;
      }
      .el-input__inner {
        line-height: 28px;
        height: auto;
      }
      .iconfont{
        display: inline-block;
        width: 28px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        border: 1px solid #2B678B;
        cursor: pointer;
        &:not(:last-child){
          border-right: none;
        }
        &.el-icon-plus:hover{
          color: @highColor;
          font-weight: 400;
        }
        &.el-icon-minus:hover{
          color: @error;
          font-weight: 400;
        }
      }
    }
    .error-tip {
      padding-top: 0;
    }
  }
</style>

