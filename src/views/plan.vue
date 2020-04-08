<template>
  <div class="calculate-a">
    <nav-bread :navList="navList" :index.sync="activeIndex"></nav-bread>
    <component :is="componentName"></component>
  </div>
</template>

<script>
  import navBread from '@/components/project/nav-bread.vue'
  import planInput from '@/views/plan-input.vue'
  import planResult from '@/views/plan-result.vue'
  export default {
    name: "plan",
    data(){
      return {
        activeIndex:0,
        componentName: '',
        navList: [
          {name: '输入设置', icon: 'iconsetting'},
          {name: '计算结果', icon: 'iconjiesuanjieguo'}
        ]
        
      }
    },
    components: {navBread, planInput, planResult},
    computed: {
      hasResult(){
        return this.$route.query.planStatus == 2 // planStatus==2 计算完成，自动跳转到计算结果页
      },
    },
    created(){
      if(this.hasResult){
        this.activeIndex = 1;
        this.componentName = 'planResult'
      }else{
        this.componentName = 'planInput'
        this.$set(this.navList[1], 'disabled', true)
      }
    },
    watch:{
      'activeIndex'(n){
        this.componentName = n==0?'planInput':'planResult';
      },
      '$route.query.planStatus'(){
        this.activeIndex = this.hasResult ? 1 : 0;
      }
    }
  }
</script>

<style lang="less">
  .calculate{

  }
</style>
