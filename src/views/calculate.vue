<template>
    <div class="calculate-a">
        <nav-bread :navList="navList" :index.sync="activeIndex"></nav-bread>
        <!--<component :ref="componentName" :is="componentName" :activeIndex="activeIndex"></component>-->
        <direcCalculate v-if="componentName=='direcCalculate'"></direcCalculate>
        <calculateList v-if="componentName=='calculateList'"></calculateList>
    </div>
</template>

<script>
    import navBread from '@/components/project/nav-bread.vue'
    import direcCalculate from '@/views/direc-calculate.vue'
    import calculateList from '@/views/calculate-list.vue'

    export default {
        name: "calculate",
        data() {
            return {
                activeIndex: this.$route.query.status >= 2 ? 1 : 0,
                componentName: this.$route.query.status >= 2 ? 'calculateList' : 'direcCalculate'
            }
        },
        components: {navBread, direcCalculate, calculateList},
        computed: {
            navList() {
                return [
                    {name: '输入设置', icon: 'iconsetting'},
                    {name: '计算结果', icon: 'iconjiesuanjieguo', disabled: this.$route.query.status < 2}
                ]
            }
        },
        watch: {
            'activeIndex'(n) {
                if (n == 0) {
                    if(window.timer){
                        clearTimeout(window.timer);
                        window.timer = null;
                    }
                }
                this.componentName = n == 0 ? 'direcCalculate' : 'calculateList';
            },
            '$route.query.status'(n) {
                this.activeIndex = this.$route.query.status >= 2 ? 1 : 0;
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.activeIndex == 1) {
                if(window.timer){
                    clearTimeout(window.timer);
                    window.timer = null;
                }
            }
            next();
        }
    }
</script>

<style lang="less">
    .calculate {

    }
</style>
