<template>
  <div class='sin-box'>
      <div class='header'>{{single.name}}
          <i class='iconfont iconquanping1' @click='backFu'></i>   
      </div>
      <e-linec :windSet='single.windSet' :did='single.name' :inverse='single.inverse'></e-linec>
  </div>
</template>

<script>
import eLinec from "@/components/echarts/linec.vue";
export default {
  name: '',
  data () {
    return {
      
    };
  },
  props:['single'],
  components: {eLinec},
  mounted () {},
  methods: {
      backFu(){
        
          this.$emit('backFu',this.single)
      }
  }
}
</script>

<style lang='less'>
    .sin-box{
        height:100%;
        background:@sideBlack;
        color:@whiteColor;
        .header{
            padding: 10px 22px;
            .borsin(bottom,@inputColor);
            .iconfont{
                float:right;
                margin-top:4px;
                cursor:pointer;
            }
        }     
    }
</style>