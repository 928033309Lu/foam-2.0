import Vue from "vue"
import bus from './bus.js'
import { Loading } from 'element-ui';
import {SchemeServices} from '@/services/scheme.service'
const loadOption={fullscreen: true ,lock: true, text: 'Loading', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)'}
// let template='<el-input  v-if="!isDestroyed" ref="cellInput"  size="mini" clearable ' +'@blur="flag &&restoreCellData($event)"'
//   +' @keyup.enter.native="updateCellData($event)">' +'</el-input>'
let template = `<el-select ref="cellSelect" placeholder="请选择" @change="select">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>`
let inputComponent=Vue.extend({
  template: template,
  props: ['id','selectName','activeName','rowIndex','colIndex','originData','originLabel'],
  data:function () {
    return{
      isDestroyed:false,
      flag:true,
    }
  },
  methods: {
    restoreCellData(evt){ //input blur
      let vm=this;
       vm.isDestroyed=true
       let tdId='cell'+vm.rowIndex+vm.colIndex;
       $('#'+tdId).find('span').show()
    },
    handleParam(param){
      let str=""
      for(let key in param){
        str+=key+"="+param[key]+'&'
      }
      str=str.substring(0,str.length-1)
      return str;
    },
    updateCellData(evt){
      let vm=this;
      vm.flag=false
      vm.isDestroyed=true
      let tdId='cell'+this.rowIndex+this.colIndex;
      let inputValue=$('#'+tdId).find('input').val().trim();
      let loadingInstance = Loading.service(loadOption);
      let changeValue=[vm.originData,inputValue].join('|')
      let param={schemeId:vm.id,source:vm.selectName,iec3Title:vm.activeName,index:vm.rowIndex,value:changeValue,attrName:vm.originLabel}
      let str=vm.handleParam(param)
      let schemeServices = new SchemeServices(vm);
      schemeServices.updateIecOverload(str).then((data)=>{
        loadingInstance.close()
        if(data=='修改成功'){
          _toast(data,'success')
          bus.$emit('updateTableData',{index:this.rowIndex,label:this.originLabel,value:[this.originData,inputValue,this.originData===inputValue]});
        }else {
          _toast(data,'warn')
        }
        $('#'+tdId).find('span').show()
      }).catch(error=>{
        loadingInstance.close();
        $('#'+tdId).find('span').show()
        _toast(error,'error')
      })
      $('#'+tdId).find('span').show()
    },
  }
});
export  default inputComponent
