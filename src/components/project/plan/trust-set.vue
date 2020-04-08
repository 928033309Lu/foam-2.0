<template>
  <el-dialog class="trust-set" title="信任系数配置" :visible.sync="visible" :modal-append-to-body="false"
             :close-on-click-modal="disabled" width="710px" top="90px">
    <div class="radio-container">
      <!--<el-radio-group class="radio-btn-group" v-model="type">-->
        <!--<el-radio-button label="发电量"></el-radio-button>-->
        <!--<el-radio-button label="湍流"></el-radio-button>-->
      <!--</el-radio-group>-->
      <ul class="radio-btn-group">
        <li @click="type = '发电量'" :class="type ==  '发电量' && 'is-active'">发电量</li>
        <li @click="type = '湍流'" :class="type ==  '湍流' && 'is-active'">湍流</li>
      </ul>
    </div>
    <el-table :data="tableList" class="table-list out-border first-td-border" max-height="400px">
      <el-table-column prop="tag" label="机位点" width="130"></el-table-column>
      <el-table-column prop="x" label="X"></el-table-column>
      <el-table-column prop="y" label="Y"></el-table-column>
      <el-table-column prop="h" label="H"></el-table-column>
      <el-table-column v-if="type === '发电量'" prop="trustCoefficient" label="信任系数" width="180">
        <template slot-scope="scope">
          <!--<p class="copy-select">{{scope.row.trustCoefficient}}</p>-->
          <el-select disabled v-model="scope.row.guaranteePolicyName" @change="selectChange(scope, 'guaranteePolicyName')">
            <el-option v-for="opt in energyOptions" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
          </el-select>
          <i v-if="scope.row.guaranteePolicyName && ![null, '0', '2', 0, 2, '自定义'].includes(scope.row.guaranteePolicyName)"
             @click="viewTrust(scope.row.guaranteePolicyName, scope.$index)"
             class="iconfont iconyanjing"></i>
        </template>
      </el-table-column>
      <el-table-column v-if="type === '湍流'" prop="turbulenceTrust" label="信任系数" width="180">
        <template slot-scope="scope">
          <!--<p class="copy-select">{{scope.row.trustCoefficient}}</p>-->
          <el-select disabled v-model="scope.row.turbulencePolicyName" @change="selectChange(scope, 'turbulencePolicyName')">
            <el-option v-for="opt in turbulenceOptions" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
          </el-select>
          <i v-if="scope.row.turbulencePolicyName && ![null, '0', '2', 0, 2, '自定义'].includes(scope.row.turbulencePolicyName)"
             @click="viewTrust(scope.row.turbulencePolicyName, scope.$index)"
             class="iconfont iconyanjing"></i>
        </template>
      </el-table-column>
    </el-table>
    <div class="tips-container">
      <p><label>默认的信任系数：</label><span>系统将计算当前风机位置与所有测风塔位置之间的距离，并通过距离的平方计算测风塔权重。 距离越近的测风塔，其在计算结果中的权重体现的越大。</span></p>
      <!--<p v-if="0"><label>距离最近的测风塔：</label><span>系统在计算当前风机位置处的结果时，将完全采用距离其最近的测风塔数据，忽略其他所有测风塔数据。</span></p>-->
    </div>
    <div class="custom" v-if="strategyVisible">
      <div class="content">
        <el-form ref="form" :model="form" :show-message="false">
          <div class="header">
            <div class="strategy-name">
              <p>{{form.name}}</p>
              <el-input placeholder="策略名称" ref="namebox" v-model.trim="form.name" :disabled="disabled" :class="nameError && 'error'" maxlength="20" clearable></el-input>
            </div>
            <i class="el-icon el-icon-close" @click="cancelTrust"></i>
          </div>
          <el-table :data="form.masts" class="table-list out-border first-td-border" max-height="150px">
            <el-table-column prop="tag" label="测风塔" width="130"></el-table-column>
            <el-table-column prop="x" label="X"></el-table-column>
            <el-table-column prop="y" label="Y"></el-table-column>
            <el-table-column prop="h" label="H"></el-table-column>
            <el-table-column prop="trust" label="信任比例">
              <template slot-scope="scope">
                <el-form-item v-if="!disabled" :prop="'masts['+scope.$index+'].trust'">
                  <el-input type="text" v-model="scope.row.trust"></el-input>
                </el-form-item>
                <span v-else>{{scope.row.trust}}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="tips-container">
            <p class="error-tip" v-if="errorTips.length">{{errorTips[0]}}</p>
          </div>
          <div class="el-dialog__footer" v-if="!disabled">
            <el-button type="primary" @click="cancelTrust">取 消</el-button>
            <el-button type="primary" @click="createTrust">确 定</el-button>
          </div>
        </el-form>
      </div>
    </div>
    <template slot="footer" v-if="!disabled">
      <el-button type="primary" @click="resetMoreParam">恢复默认</el-button>
      <el-button type="primary" @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
  export default {
    name: "trust-set",
    data(){
      return {
        visible: false,
        type: '发电量',
        tableList: this.list,
        hasGetSet: false,
        id: this.$route.params.id,
        projectId: this.$route.params.projectId,
        options: [
          {value: "0", label: '默认信任系数'},
          {value: '2', label: '距离最近的测风塔'},
          {value: '自定义', label: '自定义'}
        ],
        form: {
          name: '',
          masts: []
        },
        sourceName: '',
        // strategyName: '',
        nameError: false,
        // mastsList: [],
        strategyVisible: false,
        editMode: '', // create 创建 update 更新
        energyOptions: [],
        turbulenceOptions: [],
        errorTips: [],
        editTrustRow: '' //标记当前编辑行，自定义设置后对应设置信任系数值
      }
    },
    props: {
      disabled: {
        default: false
      },
      list: {
        type: Array,
        default: ()=>{return []}
      },
      masts: {
        type: Array,
        default: ()=>{return []}
      },
      guaranteeTrust: {},
      turbulenceTrust: {}
    },
    mounted() {
      this.form.masts = Object.assign([], this.masts)
      this.guaranteeTrust && (this.energyOptions = Object.keys(this.guaranteeTrust).map(v=>{return {label: v, value: v}}).concat(this.options)) || (this.energyOptions = JSON.parse(JSON.stringify(this.options)))
      this.turbulenceTrust && (this.turbulenceOptions = Object.keys(this.turbulenceTrust).map(v=>{return {label: v, value: v}}).concat(this.options)) || (this.turbulenceOptions = JSON.parse(JSON.stringify(this.options)))
    },
    watch: {
      list(cur){
        this.tableList = cur;
      },
      masts(cur){
        this.form.masts = cur.map(v=>{
          return {
            tag: v.tag,
            x: v.x,
            y: v.y,
            h: v.h,
            trust: ''
          }
        })
      },
      guaranteeTrust() {
        this.guaranteeTrust && (this.energyOptions = Object.keys(this.guaranteeTrust).map(v=>{return {label: v, value: v}}).concat(this.options)) || (this.energyOptions = JSON.parse(JSON.stringify(this.options)))
      },
      turbulenceTrust() {
        this.turbulenceTrust && (this.turbulenceOptions = Object.keys(this.turbulenceTrust).map(v=>{return {label: v, value: v}}).concat(this.options)) || (this.turbulenceOptions = JSON.parse(JSON.stringify(this.options)))
      },
      strategyName(cur){
        if(cur){
          this.nameError = false;
          this.clearError('请输入策略名称！')
        }
      },
      strategyVisible(cur){
        !cur && (this.form.name='')
      }
    },
    methods: {
      showDialog(){
        this.visible = true;
        // this.getMoreParam();
      },
      // 打开修改名称input
      handleChangeName(){
        this.editName = true;
        this.oldName = this.form.name;
        this.$nextTick(()=>{
          this.$refs.namebox.focus()
        })
      },
      getMoreParam(){
        if(this.hasGetSet) return;
        this.planHttps.getAllWtList(this.projectId).then(res => {
          this.hasGetSet = true;
          this.standard = Object.assign(res, {
            simulate: {
              maxIterateStep: res.maxIterateStep
            }
          })
        })
      },
      selectChange(scope, key){
        this.editTrustRow = scope.$index;
        if(scope.row[key] === '自定义') {
          this.nameError = false
          this.strategyVisible = true;
          this.editMode = 'create';
          let mastsL = this.form.masts.length
          let avg = Number((1/mastsL).toFixed(2))
          this.form.masts = this.form.masts.map(v=> {
            return Object.assign(v, {
              trust: avg
            })
          })
          this.$set(this.form.masts[mastsL-1], 'trust', Number((1-avg*(mastsL-1)).toFixed(2)))
          this.$nextTick(()=>{
            this.$refs.namebox.focus();
          })
        }else{
          this.strategyVisible = false;
        }
      },
      // 创建策略
      createTrust(){
        let options = this.type == '发电量' && 'energyOptions' || 'turbulenceOptions'
        let key = this.type == '发电量' && 'guaranteePolicyName' || 'turbulencePolicyName'
        if(!this.form.name) {
          this.nameError = true
          this.errorTips.push('请输入策略名称！')
          return;
        }else{
          this.nameError = false
          this.clearError('请输入策略名称！')
        }
        let names = this[options].map(v=>{return v.label})
        if(this.sourceName != this.form.name && names.includes(this.form.name)) {
          this.nameError = true;
          this.errorTips.push('策略名称不允许重复！')
          return;
        }else{
          this.nameError = false
          this.clearError('策略名称不允许重复！')
        }
        let sum = 0;
        this.form.masts.forEach(v => {
          sum += Number(v.trust)
        })
        if(sum != 1) {
          this.errorTips.push('信任比例和必须为1 ！')
          return
        }else{
          this.clearError('信任比例和必须为1 ！')
        }
        let params = this.editMode == 'update' && {
          sourceName: this.sourceName,
          targetName: this.form.name
        } || {
          name: this.form.name,
        }
        this.planHttps[this.editMode == 'create' && 'createTrust' || this.editMode == 'update' && 'updateTrust'](Object.assign({
          url: this.type == '发电量' && 'guarantee-trust' || this.type == '湍流' && 'turbulence-trust',
          projectId: this.projectId,
          scheme_id: this.id,
          trustList: this.form.masts.map(v=>{
            return v.trust
          })
        }, params)).then(res => {
          this.strategyVisible = false
          if(this.editMode == 'create'){
            // 更新options
            this[options].splice(this[options].length-3, 0, {
              value: this.form.name,
              name: this.form.name
            })
          }else{
            // 更新options
            this[options].splice(this[options].map(v=>{return v.value}).indexOf(this.sourceName), 1, {
              value: this.form.name,
              name: this.form.name
            })
            // 更新风机列表中已选中当前修改项的值
            this.tableList.map((v, k)=> {
              if(v[key] === this.sourceName){
                this.$set(this.tableList[k], key, this.form.name)
              }
            })
          }
          // 将当前风机信任系数设置为刚才编辑的项目
          this.$set(this.tableList[this.editTrustRow], key, this.form.name)
        })
      },
      // 查看策略
      viewTrust(name, index){
        this.editTrustRow = index;
        this.planHttps.viewTrust({
          url: this.type == '发电量' && 'guarantee-trust' || this.type == '湍流' && 'turbulence-trust',
          projectId: this.projectId,
          scheme_id: this.id,
          name
        }).then(res => {
          this.editMode = 'update';
          this.strategyVisible = true;
          this.form.name = name
          this.sourceName = name
          this.form.masts = this.form.masts.map((v, k)=> {
            return Object.assign(v, {
              // trust: Number(1/this.form.masts.length.toFixed(2))
              trust: res[k]
            })
          })
        })
      },
      cancelTrust(){
        this.strategyVisible = false;
        let label = this.type == '发电量' && 'guaranteePolicyName' || this.type == '湍流' && 'turbulencePolicyName'
        if(this.tableList[this.editTrustRow][label] == '自定义'){
          this.$set(this.tableList[this.editTrustRow], label, '0')
        }
      },
      // 恢复默认信任系数
      resetMoreParam(){
        let putFun = this.type == '发电量' && 'resetEnergy' || this.type == '湍流' && 'resetTurbulence'
        this.planHttps[putFun](this.projectId, this.id).then(res => {
          this.tableList = Object.assign([], res)
        })
      },
      confirm(){
        // this.$refs.standard.validate(valid => {
        //   if(valid){
            let wts = Object.assign([], this.tableList);
            this.planHttps.updateWtList({
              projectId: this.projectId,
              scheme_id: this.id,
              wts
            }).then(res => {
              if(res) {
                this.$message("保存成功！")
                this.visible = false
              }
            })
          // }else {
          //
          // }
        // })
      },
      // 清除错误信息
      clearError(error){
        let index = this.errorTips.indexOf(error)
        index >= 0 && this.errorTips.splice(index, 1)
      },
    }
  }
</script>

<style lang="less">
  .trust-set{
    .el-dialog__title{
      display: inherit;
    }
    .el-dialog__body{
      padding-top: 10px;
      min-height: 170px;
      >.tips-container{
        padding-top: 10px;
        p{
          color: @whiteColor;
          line-height: 20px;
          font-size: 12px;
          display: flex;
          label{
            display: inline-block;
            width: 118px;
            height: 100%;
            text-align: right;
            padding-right: 10px;
          }
          span{
            flex: 1;
          }
        }
      }
    }
    .radio-container{
      text-align: center;
      line-height: 1;
      padding-bottom: 10px;
      .radio-btn-group {
        li {
          display: inline-block;
          padding: 7px 24px;
          min-width: 120px;
          background-color: transparent;
          border: 1px solid @tborder;
          /*border-left: none;*/
          color: @whiteColor;
          border-radius: 0 !important;
          cursor: pointer;
          white-space: nowrap;
          &:first-child{
            border-left: 1px solid @tborder;
          }
          &.is-active {
            background-color: transparent;
            border-color: @highColor !important;
            color: @highColor;
          }
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
    .el-select{
      .el-input{
        width: 120px;
        height: 18px;
        font-size: 14px;
        .el-input__inner{
          height: 18px !important;
          line-height: 18px;
        }
        .el-input__prefix, .el-input__suffix{
          top: 4px;
        }
        .el-select__caret.is-reverse{
          transform: translateY(-4px);
        }
      }
    }
    .table-list{
      .iconyanjing{
        margin-left: 22px;
        cursor: pointer;
      }
    }
    
    .custom{
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      bottom: 0;
      background-color: rgba(0,0,0,.5);
      .content{
        position: absolute;
        width: 100%;
        bottom: 0;
        padding: 0 20px;
        background:@sideBlack;
        box-shadow:0px -1px 6px 0px rgba(2, 43, 28, 0.35);
        .el-icon-close{
          position: absolute;
          right: 10px;
          top: 10px;
          color: #909399;
          cursor: pointer;
          font-size: 16px;
        }
        .el-input{
          width: auto;
        }
      }
      .table-list{
        .el-input,
        .el-input__inner{
          height: 18px !important;
          line-height: 18px;
        }
        .el-table__body-wrapper tr:hover{
          background-size: calc(100% - 4px) 23px
        }
      }
      .tips-container{
        height: 24px;
      }
      .error-tip{
        color: @error;
        font-size: 12px;
        line-height: 1;
        padding-top: 12px;
      }
      .el-form-item{
        margin-bottom: 0;
        .el-form-item__content{
          line-height: 1;
        }
        .el-input{
          width: 110px;
        }
      }
    }
    .strategy-name{
      font-size: 1;
      line-height: 1;
      display: inline-block;
      min-width: 90px;
      border-bottom: 1px solid @borColor;
      margin-bottom: 1px;
      p{
        margin-bottom: -48px;
        opacity: 0;
        height: 48px;
        padding: 0 30px 0 6px;
      }
      .el-input{
        width: 100% !important;
      }
      .el-input__inner{
        border: none;
      }
      .el-input__icon{
        line-height: 24px;
      }
      &.error{
        .el-input__inner{
          border-color: @error !important;
        }
      }
    }
  }
</style>
