<template>
  <el-dialog class="param-set-more" title="更多设置" :visible.sync="visible" :modal-append-to-body="false"
             :close-on-click-modal="disabled" width="710px" top="90px">
    <el-form :model="standard" ref="standard" label-width="160px" :disabled="disabled" id="standard">
      <el-collapse v-model="collapse">
        <el-collapse-item v-for="(collapse, index) in collapseList" :key="collapse.title" :title="collapse.title" :name="'col'+index">
          <el-form-item v-for="form in collapse.form" :key="form.label" :label="form.label" label-position="right"
            :prop="collapse.name+'.'+form.name"
            :rules="setRules(form)"
            :ref="collapse.name+form.name"
          >
            <template slot="label"><span :title="form.title || ''">{{form.label}}</span></template>
            <el-input v-if="form.type == 'input' && form.number" v-model="standard[collapse.name][form.name]"
                      type='number' :min="form.min" :max="form.max" :title="form.title || ''"
                      :placeholder="form.placeholder || ''"
                      :disabled="form.disabled"
                      @blur="inputBlur(collapse, form)"
            ></el-input>
            <el-input v-else-if="form.type == 'input'" v-model="standard[collapse.name][form.name]" :title="form.title || ''"
                      :disabled="form.disabled"></el-input>
            <el-select v-else-if="form.type == 'select'" v-model="standard[collapse.name][form.name]" :title="form.title || ''">
              <el-option v-for="item in form.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <template slot="footer" v-if="!disabled">
      <el-button type="primary" @click="resetMoreParam">恢复默认</el-button>
      <el-button type="primary" @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
  import cfdConfig from '@/config/cfd.config'
  var _this = '';
  var validators = function (rule, value, call){
    let coll = _this.collapseList.filter(v =>{
      return v.name == rule.field.split('.')[0]
    })[0]
    let form = coll.form.filter(v => {
      return v.name == rule.field.split('.')[1]
    })[0]
    let leftS = form.placeholder.substr(0,1)
    let rightS = form.placeholder.substr(form.placeholder.length-1, 1)
    if((leftS == '(' && value <= form.min) || (leftS == '[' && value < form.min)){
      call(new Error('必须大于' + (leftS == '[' && '等于' || '') + form.min))
    }else if((rightS == ')' && value >= form.max) || (rightS == ']' && value > form.max)){
      call(new Error('必须小于' + (rightS == ']' && '等于' || '') + form.max))
    }else{
      call()
    }
  }
  export default {
    name: "param-set",
    data(){
      return {
        projectId: this.$route.params.projectId || 1,
        visible: false,
        collapseList: [
        {
          title: '求解参数设置',
          name: 'simulate',
          form: [{label: '最大迭代步数', name: 'maxIterateStep', value: '3000',type: 'input', number: true, min: 1000, max: 10000, placeholder: '[1000,10000]', Ntype: 'int', title: '迭代求解过程中，最大的迭代步数。当达到收敛残差条件时，迭代停止。若达到了最大迭代步数，仍未满足收敛残差条件，则迭代也停止'}]
        /*},{
          title: '斜坡分析设置',
          name: 'slope',
          form: [
            { label: '是否大坡加密', name: 'contcrit', value: '3000', type: 'select', options: [{label: '是', value: '0'},{label: '否', value: '1'}]},
            { label: '斜坡分辨率', name: 'slopeGres', value: '3000', type: 'input'},
            { label: '斜坡分析半径', name: 'slopeRad', value: '3000', type: 'input'},
            { label: '斜坡切分半径', name: 'slopeRes', value: '3000', type: 'input'},
            { label: '斜坡扇区数', name: 'slopeNcalc', value: '3000', type: 'input'},
            { label: '自动斜坡等级', name: 'slopeAutocontour', value: '3000', type: 'input'},
            { label: '斜坡最大尺寸限制', name: 'slopeContourLimit', value: '3000', type: 'input'},
          ]*/
        },{
          title: '垂直网格参数设置',
          name: 'meshV',
          form: [
            // { label: 'Z方向首层高度', name: 'dzmin', value: 3000, type: 'input', disabled: true, Ntype: 'float', decimal: 2},
            // { label: '森林区网格最大尺寸', name: 'dzcanop', value: 3, type: 'input', number: true, min: 2, max: 5, placeholder: '(2,5]', Ntype: 'float', decimal: 1},
            // { label: '风机区网格最大尺寸', name: 'dzturb', value: 6, type: 'input', number: true, min: 5, max: 20, placeholder: '[5,20]', Ntype: 'float', decimal: 1},
            // { label: '整体网格最大尺寸', name: 'dztop', value: 500, type: 'input', number: true, min: 100, max: 1000, placeholder: '[100,1000]', Ntype: 'float', decimal: 1},
            // { label: '森林区扩展比例', name: 'expcanop', value: 1.1, type: 'input', number: true, min: 1, max: 1.5, placeholder: '[1,1.5]', Ntype: 'float', decimal: 1},
            // { label: '风机区扩展比例', name: 'expturb', value: 1.1, type: 'input', number: true, min: 1, max: 1.5, placeholder: '[1,1.5]', Ntype: 'float', decimal: 1},
            { label: '高层扩展比例', name: 'exptop', value: 1.2, type: 'input', number: true, min: 1, max: 1.5, placeholder: '[1,1.5]', Ntype: 'float', decimal: 1, title: '风机区域高度以外，后续每层网格的高度与前一层网格高度的比例'},
            // { label: '森林区高度', name: 'hcanop', value: 10, type: 'input', number: true, min: 10, max: 80, placeholder: '[10,80]', Ntype: 'float', decimal: 1},
            // { label: '风机区高度', name: 'hturb', value: 150, type: 'input', number: true, min: 80, max: 2000, placeholder: '[80,2000]', Ntype: 'float', decimal: 1},
            // { label: '整体高度', name: 'htop', value: '3000', type: 'input', number: true, min: 2000, max: 20000, placeholder: '[80,2000]', Ntype: 'float', decimal: 1},
          ]
        },{
          title: '光滑参数设置',
          name: 'smoothing',
          form: [
            { label: '光滑处理循环次数', name: 'nSmooth', value: 1, type: 'input', number: true, min: 1, max: 5, placeholder: '[1, 5]', Ntype: 'int', title: '地图和网格的平滑处理次数，默认为1'},
            { label: '光滑系数', name: 'smoothCoef', value: 0.3, type: 'input', number: true, min: 0.1, max: 0.9, placeholder: '(0.1, 0.9]', Ntype: 'float', decimal: 1, title: '平滑处理中的系统参数，默认为0.3'},
            { label: '光滑方法', name: 'inSmooth', value: 'GaussSeidel', type: 'select', options: cfdConfig.smoothMethod, title: '平滑处理的方法，默认为不平滑'}
          ]
        },{
          title: '求解器参数设置',
          name: 'solver',
          form: [
            { label: '压力求解器', name: 'pSolver', value: '3000', type: 'select', options: cfdConfig.pSolverOptions, title: '求解器类型，默认为GAMG'},
            { label: '速度求解器', name: 'uSolver', value: '3000', type: 'select', options: cfdConfig.uSolverOptions, title: '求解器类型，默认为smoothSolver'},
            { label: '光滑方法', name: 'uSmoother', value: '3000', type: 'select', options: cfdConfig.uSmootherOptions, title: '求解过程中的光滑处理方法，默认为GaussSeidel'},
            { label: '压力预处理方法', name: 'pPreconditioner', value: 'DIC', type: 'select', options: cfdConfig.pPreconditionerOptions, title: '求解过程中的压力预处理方法，默认为DIC'}
          ]
        },{
          title: '残差设置',
          name: 'residual',
          form: [
            { label: '压力收敛残差', name: 'p', value: 0.0005, type: 'input', number: true, min: 0.00001, max: 0.02, placeholder: '[0.00001,0.02]', Ntype: 'float', decimal: 6, title: '当所有残差项均低于预设值时，计算收敛，默认收敛残差为0.0005'},
            { label: '速度收敛残差', name: 'u', value: 0.00001, type: 'input', number: true, min: 0.00001, max: 0.001, placeholder: '[0.00001,0.001]', Ntype: 'float', decimal: 6, title: '当所有残差项均低于预设值时，计算收敛，默认收敛残差为0.00001'},
            { label: 'k收敛残差', name: 'k', value: 0.00001, type: 'input', number: true, min: 0.00001, max: 0.001, placeholder: '[0.00001,0.001]', Ntype: 'float', decimal: 6, title: '当所有残差项均低于预设值时，计算收敛，默认收敛残差为0.00001'},
            { label: 'epsilon收敛残差', name: 'epsilon', value: 0.00001, type: 'input', number: true, min: 0.00001, max: 0.001, placeholder: '[0.00001,0.001]', Ntype: 'float', decimal: 6, title:'当所有残差项均低于预设值时，计算收敛，默认收敛残差为0.00001'},
          ]
        },{
          title: '松弛因子设置',
          name: 'relaxztionFactor',
          form: [
            { label: '压力松弛因子', name: 'p', value: 0.3, type: 'input', number: true, min: 0, max: 1, placeholder: '(0, 1)', Ntype: 'float', decimal: 3, title: '当计算发散时，可尝试调整此参数。默认为0.3'},
            { label: '速度松弛因子', name: 'u', value: 0.7, type: 'input', number: true, min: 0, max: 1, placeholder: '(0, 1)', Ntype: 'float', decimal: 3, title: '当计算发散时，可尝试调整此参数。默认为0.7'},
            { label: 'k松弛因子', name: 'k', value: 0.5, type: 'input', number: true, min: 0, max: 1, placeholder: '(0, 1)', Ntype: 'float', decimal: 3, title: '当计算发散时，可尝试调整此参数。默认为0.5'},
            { label: 'epsilon松弛因子', name: 'epsilon', value: 0.5, type: 'input', number: true, min: 0, max: 1, placeholder: '(0, 1)', Ntype: 'float', decimal: 3, title: '当计算发散时，可尝试调整此参数。默认为0.5'},
          ]
        }],
        standard: {
          simulate: {
            maxIterateStep: 3000   //最大迭代步数
          },
          // slope: {
          //   slopeGres: 200,//斜坡分辨率
          //   slopeRad: 100,//斜坡分析半径
          //   slopeRes: 100,//斜坡切分半径
          //   slopeNcalc: 8,//斜坡扇区数
          //   slopeAutocontour: 8,//自动斜坡等级
          //   slopeContourLimit: 5000,//斜坡最大尺寸限制
          // },
          meshV: {
            dzmin: 2,//Z方向首层高度
            dzcanop: 3,//森林区网格最大尺寸
            dzturb: 6,//风机区网格最大尺寸
            dztop: 500,//整体网格最大尺寸
            expcanop: 1.1,//森林区域扩展比例
            expturb: 1.1,//风机区扩展比例
            exptop: 1.2,//高层扩展比例
            hcanop: 10,//森林区高度
            hturb: 150,//风机区高度
            htop: 2000,//整体高度
          },
          smoothing: {
            nSmooth: 1,//光滑处理循环次数
            smoothCoef: 0.3,//光滑系数
            inSmooth: 'without',//光滑方法
          },
          solver: {
            pSolver: 'GAMG',//压力求解器
            uSolver: 'smoothSolver',//速度求解器
            uSmoother: 'GaussSeidel',//光滑方法
            pPreconditioner: 'DIC',//压力预处理方法
          },
          residual: {
            p: 0.0005,//压力收敛残差
            u: 0.00001,//速度收敛残差
            k: 0.00001,//k收敛残差
            epsilon: 0.00001,//epsilon收敛残差
          },
          relaxztionFactor: {
            p: 0.3,//压力松弛因子
            u: 0.7,//速度松弛因子
            k: 0.5,//k松弛因子
            epsilon: 0.5,//epsilon松弛因子
          }
        },
        hasGetSet: false,
        collapse: ['col0']
      }
    },
    props: {
      disabled: {
        default: false
      },
      dzmin: {}
    },
    computed: {
    },
    created () {
      _this = this;
      // this.collapseList.forEach(v=>{
      //   this.standard[v.name] = {}
      // })
    },
    mounted(){
    },
    methods: {
      setRules(form){
        let rules = [
          { required: true, message: form.label+'不能为空', trigger: ['blur', 'change']},
        ]
        if(form.number && (form.min || form.min===0) && form.max){
          rules.push({validator: validators, trigger: 'blur'})
        }
        return rules
      },
      inputBlur(collapse, form){
        let value = this.standard[collapse.name][form.name]
        if(value >= form.min && value <= form.max){
          if(collapse.name === 'relaxztionFactor'){
            form.name === 'p' && this.$set(this.standard[collapse.name], 'u', Number((1-value).toFixed(3)))
            form.name === 'u' && this.$set(this.standard[collapse.name], 'p', Number((1-value).toFixed(3)))
            form.name === 'k' && this.$set(this.standard[collapse.name], 'epsilon', Number((1-value).toFixed(3)))
            form.name === 'epsilon' && this.$set(this.standard[collapse.name], 'k', Number((1-value).toFixed(3)))
          }
          if(form.Ntype == 'float' && form.decimal){
            this.$set(this.standard[collapse.name], form.name, Number(Number(value).toFixed(form.decimal)))
          }
          if(form.Ntype == 'int'){
            this.$set(this.standard[collapse.name], form.name, parseInt(value))
          }
        }
      },
      showDialog(){
        this.visible = true;
        this.getMoreParam();
      },
      getMoreParam(){
        // if(this.hasGetSet) return;
        this.caculateHttps.getMoreParam(this.projectId).then(res => {
          this.hasGetSet = true;
          this.standard = Object.assign(res, {
            simulate: {
              maxIterateStep: res.maxIterateStep
            }
          })
          // 等于垂直分辨率，不可编辑
          // this.standard.meshV.dzmin = this.dzmin
        })
      },
      confirm(){
        let vm = this;
        this.$refs.standard.validate(valid => {
          if(valid){
            let advancedConfigure = Object.assign({},this.standard);
            advancedConfigure.maxIterateStep = advancedConfigure.simulate.maxIterateStep;
            delete advancedConfigure.simulate
            this.caculateHttps.updateMoreParam({
              projectId: this.projectId,
              advancedConfigure
            }).then(res => {
              if(res) {
                this.$message("保存成功！")
                this.visible = false
              }
            })
          }else {
            let isFirst = false;
            for(let i = 0; i < vm.collapseList.length; i++){
              let item = vm.collapseList[i];
              for(let j = 0; j < item.form.length; j++){
                let jtem = item.form[j];
                if(isFirst){
                  break
                }
                vm.$refs.standard.validateField(item.name+'.'+jtem.name, err => {
                  if(err){
                    if(vm.collapse.indexOf('col'+i) == -1){
                      vm.collapse.push('col'+i)
                    }
                    if(!isFirst){
                      isFirst = true
                      vm.$nextTick(()=>{
                        let top = vm.$refs[item.name + jtem.name][0].$el.offsetTop;
                        document.getElementsByClassName("el-dialog__body")[0].scrollTo(0, top)
                      })
                    }
                  }
                })
              }
              if(isFirst){
                break
              }
            }
          }
        })
      },
      resetMoreParam(){
        this.caculateHttps.resetMoreParam(this.projectId).then(res => {
          this.standard = Object.assign(res, {
            simulate: {
              maxIterateStep: res.maxIterateStep
            }
          })
        })
      }
    },
    watch: {
      dzmin(cur){
        this.standard.meshV.dzmin = cur
      }
    }
  }
</script>

<style lang="less">
  .param-set-more {
    .el-dialog__body{
      max-height: calc(100vh - 380px);
      overflow: auto;
    }
    .el-form-item{
      width: 50%;
      float: left;
      margin-bottom: 18px;
      &:nth-child(2n){
        padding-left: 10px;
      }
      .el-form-item__label{
        text-align: right;
        &::after{
          content: ' :';
        }
      }
      .el-input{
        width: 150px;
      }
      &.is-error {
        .el-input__inner {
          border-color: @error !important;
        }
        .el-form-item__error{
          color: @error;
          white-space: nowrap;
        }
      }
    }
  }
</style>
