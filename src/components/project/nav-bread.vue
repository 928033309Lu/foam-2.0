<template>
  <ul class="my-tab-style">
    <li v-for="(nav,index) in navList" :key="nav.name" :class="{'active': activeIndex === index,'no-allowed': nav.disabled}">
      <a href="javascript:void(0);" @click="jump(index)" >
        <i :class="'iconfont '+ nav.icon"></i>
        <span>{{nav.name}}</span>
      </a>
    </li>
  </ul>
</template>

<script>
  export default {
    name: "nav-bread",
    data(){
      return{
        activeIndex:0
      }
    },
    computed:{
      isCalculate(){
        return this.$route.query.status>1;
      }
    },
    watch:{
      '$route.query.status'(n){
        this.activeIndex = this.$route.query.status>=2?1:0;
      }
    },
    props: [
      'index','navList'
    ],
    mounted(){
      this.activeIndex = this.index;
    },
    methods:{
      jump(index){
        if(this.navList[index].disabled){
          return;
        }
        // if(this.activeIndex==0){
        //   if(!this.isCalculate) {
        //     return;
        //   }
        // }
        this.activeIndex = index;
        this.$emit('update:index',this.activeIndex);
      }
    },
    watch: {
      'index'(){
        this.activeIndex = this.index
      }
    }
  }
</script>

<style scoped lang="less">
  .my-tab-style {
    padding: 10px;
    @active: #FF2E76;
    text-align: center;
    font-size: 0;
    li {
      position: relative;
      /*width: 260px;*/
      height: 28px;
      display: inline-block;
      background-color: @inputColor;
      padding: 3px;
      border: 1px solid #2B678B;
      border-left: none;
      border-right: none;
      text-align: center;
      vertical-align: top;
      cursor: pointer;
      &.no-allowed{
        cursor:not-allowed;
        a{
          cursor:not-allowed;
        }
      }
      > * {
        vertical-align: top;
      }
      a {
        position: relative;
        display: inline-block;
        /*width: calc(100% - 14px);*/
        width: 240px;
        font-size: 14px;
        height: 20px;
        line-height: 20px;
        color: rgba(255, 255, 255, .4);
        i {
          margin-right: 6px;
          font-size:16px;
        }
        >*{
          display:inline-block;
          vertical-align: middle;
        }
      }
      &:not(:first-child) {
        padding-left: 10px;
      }
      &:not(:last-child) {
        padding-right: 10px;
        a::after {
          content: "";
          display: inline-block;
          position: absolute;
          right: 0px;
          top: 0px;
          border-left: 13px solid transparent;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          z-index: 1;
        }
      }
      &:first-child {
        border-left: 1px solid #2B678B;
      }
      &:last-child {
        border-right: 1px solid #2B678B;
      }
      &.active {
        background-color: #024266;
        cursor:default;
        a {
          width: 264px;
          color: @highColor;
          font-size: 16px;
          cursor:default;
          background: linear-gradient(90deg, rgba(0, 159, 255, .4), rgba(255, 46, 118, .4));
          /*border-color: @active;*/
        }
        &:not(:last-child) {
          &::after {
            content: "";
            display: inline-block;
            width: 23px;
            height: 28px;
            position: absolute;
            right: 0;
            top: -1px;
            background: #024266 url('/imgs/nav-head.png') no-repeat right center / contain;
          }
          a::after {
            border-left-color: rgba(255, 46, 118, .4);
          }
        }
        &:not(:first-child) {
          &::before {
            content: "";
            display: inline-block;
            background: #024266 url('/imgs/nav-foot.png') no-repeat left center / contain;
            position: absolute;
            width: 17px;
            height: 28px;
            left: 0;
            top: -1px;
            z-index: 3;
          }
          a {
            &::before {
              content: "";
              display: inline-block;
              border-left: 13px solid #024266;
              border-top: 10px solid transparent;
              border-bottom: 10px solid transparent;
              position: absolute;
              left: 7px;
              top: 0;
              z-index: 3;
            }
          }
        }
        &:not(:last-child):not(:first-child) {
          background-color: #024266;
          background-image: url('/imgs/nav-head.png'), url('/imgs/nav-foot.png');
          background-repeat: no-repeat;
          background-position: right center, left center;
          background-size: contain;
        }
        &:first-child {
          border-left: none;
          &::before {
            content: "";
            width: 6px;
            height: 26px;
            position: absolute;
            left: -1px;
            top: -1px;
            border: 1px solid @active;
            border-right: none;
          }
        }
        &:last-child {
          border-right: none;
          &::after {
            content: "";
            width: 6px;
            height: 26px;
            position: absolute;
            right: -1px;
            top: -1px;
            border: 1px solid @active;
            border-left: none;
          }
        }
      }
      &:first-child{
        a{
          i{
            font-size:24px;
          }
        }
      }
    }
  }

</style>
