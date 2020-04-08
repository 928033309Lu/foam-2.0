<template>
    <div class="calculate-a">
        <nav-bread :navList="navList" :index.sync="activeIndex"></nav-bread>
        <!--<component :ref="componentName" :is="componentName" :activeIndex="activeIndex"></component>-->
        <wrfCalculate v-if="componentName=='wrfCalculate'"></wrfCalculate>
        <wrfList v-if="componentName=='wrfList'"></wrfList>
    </div>
</template>

<script>
    import navBread from '@/components/project/nav-bread.vue'
    import wrfCalculate from '@/views/wrfs/wrf-calculate.vue'
    import wrfList from '@/views/wrfs/wrf-list.vue'

    export default {
        name: "wrf",
        data() {
            return {
                activeIndex: this.$route.query.status >= 2 ? 1 : 0,
                componentName: this.$route.query.status >= 2 ? 'wrfList' : 'wrfCalculate'
            }
        },
        components: {navBread, wrfCalculate, wrfList},
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
