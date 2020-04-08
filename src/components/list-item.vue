<template>
  <div class="table-tr">
    <!-- <div class="line-left"></div> -->
    <div class="td1 chang">{{item.projectId}}</div>
    <div class="table-td over" :title='item.projectName'>{{item.projectName}}</div>
    <div class="table-td over" :title='(item.province+item.city+item.city)||"------"'>{{`${item.province||'--'}${item.city||'--'}${item.town||'--'}`}}</div>
    <div class="table-td">
      <span v-if="item.status===0" style="color:#FF2E76">未完成</span>
      <span v-if="item.status===1" style="color:#009FFF">定向配置中</span>
      <span v-if="item.status===2" style="color:rgba(255,255,255,0.7)">定向计算中</span>
      <span v-if="item.status===3" style="color:#FF2E76">方案</span>
      <span v-if="item.status===4" style="color:#FF2E76">综合计算中</span>
      <span v-if="item.status===5" style="color:#FF2E76">完成</span>
    </div>
    <div class="table-td">{{item.projectGmtCreated}}</div>
    <div class="chang">{{item.userRealName}}</div>
    <div class="table-td flex2">
      <span @click="goto(item)">查看</span>
      <span @click="copyProject(item)">复制</span>
      <span>分享</span>
      <span class="del" @click="delProject(item)">删除</span>
      <span @click="ArchivedProject(item)">归档</span>
    </div>
    <!-- <div class="line-right"></div> -->
  </div>
</template>

<script>
import { EventBus } from "@/config/event-bus.js";
export default {
  name: "",
  data() {
    return {};
  },
  props: ["item"],
  components: {},
  mounted() {},
  methods: {
    goto(item){
      sessionStorage.setItem('detail',JSON.stringify(item));
      sessionStorage.setItem('projectName',item.projectName);
      let routeUrl='';
      if(item.status===0||item.status===1){
        routeUrl=this.$router.resolve({name:'direc-calculate',params:{projectId:item.projectId,projectName:item.projectName}})
      }else if(item.status===2){
        routeUrl=this.$router.resolve({name:'calculate-list',params:{projectId:item.projectId,projectName:item.projectName,status:item.status}})
      }else if(item.status>=3){
        routeUrl=this.$router.resolve({name:'planList',params:{projectId:item.projectId,projectName:item.projectName,status:item.status}})
      }
      else{
        return;
      }
      window.open(routeUrl.href, '_blank');
      EventBus.$emit("addition", {
        projectName: sessionStorage.getItem("projectName")
      });
    },
    copyProject(item) {
      this.projectHttps.copyProject(item).then(() => {
        this.$emit("getList", "");
        this.$message("复制成功");
      });
    },
    delProject(item) {
      this.$confirm("此操作将永久删除该项目, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass:'noborbtn',
        confirmButtonClass:'noborbtn',
        type: "warning"
      })
        .then(() => {
          this.projectHttps.delProject(item).then(() => {
            this.$emit("getList", "");
            this.$message("删除成功");
          });
        })
        .catch(() => {});
    },
    ArchivedProject(item) {
      this.projectHttps.ArchivedProject(item).then(() => {
        this.$emit("getList", "");
        this.$message("归档成功");
      }).catch(err=>console.log(err));
    }
  }
};
</script>

<style lang="less" rel="stylesheet/less">
.table-tr {
  position:relative;
  display: flex;
  padding: 2px 0;
  .borsin(bottom, @listColor);
  .line-left,
  .line-right {
    height: 30px;
    border: 2px solid transparent;
  }
  
  &:hover {
    color: @hWhiteColor;
    background: linear-gradient(
      90deg,
      rgba(0, 159, 255, 0.3),
      rgba(255, 46, 118, 0.3)
    );
    &::before{
      position: absolute;
    left: 0px;
    top: 0px;
    content: "";
    width: 3px;
    height: 30px;
    border-width: 1px;
    border-style: solid;
    border-color: @highColor transparent @highColor @highColor;
    }
    &::after{
      position: absolute;
    right: 0px;
    top: 0px;
    content: "";
    width: 3px;
    height: 30px;
    border-width: 1px;
    border-style: solid;
    border-color: @highColor @highColor @highColor transparent;
    }
    background-clip: content-box;
    .line-right {
      border-image: url("/imgs/right.png") 2 round;
    }
    .line-left {
      border-image: url("/imgs/left.png") 2 round;
    }
  }
  .over{
    overflow: hidden;white-space: nowrap;text-overflow: ellipsis;
  }
  .chang{
    padding: 4px 10px;
    width:95px;
    &.td1 {
      .borsin(right, @listColor);
    }
  }
  .table-td {
    padding: 4px 20px;
    flex: 1;
    display: table-cell;
    &.flex2 {
      flex: 2;
      text-align: center;
      // .borsin(right,@listColor);

      span {
        margin: 0 8px;
        cursor: pointer;
        &:hover {
          color: @highColor;
        }
      }
      .del:hover{
        color:@error;
      }
    }
    &.td1 {
      .borsin(right, @listColor);
    }
  }
}
</style>
