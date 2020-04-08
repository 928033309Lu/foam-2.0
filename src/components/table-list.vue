<template>
  <div class="table-list">
    <el-table
      class="common-list-table bill-table"
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      v-if="tableHeight"
      border
      row-key="id"
      :default-sort="{'order':'descending','prop':orderDefault}"
      :sort-orders="['descending','ascending','descending']"
      @sort-change="sortChange"
      :max-height="tableHeight">
      <el-table-column
        v-for="(item,index) in tableStructure"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        :show-overflow-tooltip="item.isShowTip"
        :sortable="item.sortable"
        :min-width="item.width">
        <template slot-scope="scope">
          <span v-if="item.prop!='powerStability'"  class="hover" :class="{'noHand':item.prop=='memo','full':item.prop=='projectName'}" :title="scope.row[item.prop]">{{ scope.row[item.prop] }}</span>
          <span v-else class="hover" :title="scope.row[item.prop]">{{ changeValue(scope.row[item.prop],true) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {swicthValue} from '../utils/switchBorderValue'
  export default {
    name: "table-list",
    mixins: [swicthValue],
    props:['tableHeight','tableData','tableStructure','orderDefault'],
    methods:{
      sortChange(column, prop, order){
        this.$emit('update:condition',column.prop=='gmtStart'?'STARTTIME':'ENDTIME');
        this.$emit('update:order',column.order=='ascending'?'ASC':'DESC');
        this.$emit('getAgain')
      }
    }
  }
</script>

<style lang="less">
  @import "../assets/less/common-list.less";
</style>