<template>
  <div class="swiper-container swiper-no-swiping">
    <div class="swiper-wrapper">
      <div class="swiper-slide">
        <div class="main first">
          <div class="text">
            <p class="title">让风资源评估更加<span>精准、高效</span></p>
            <p class="tip">Make wind resource assessment more accurate and efficient</p>
          </div>
          <div class="imgs">
            <img src="../../../public/imgs/login/bg3.png" alt="">
            <img src="../../../public/imgs/login/bg4.png" alt="">
            <img src="../../../public/imgs/login/bg5.png" alt="">
          </div>
        </div>
      </div>
      <!--<div class="swiper-slide">-->
        <!--<div class="main">-->
          <!--<p>slide 2</p>-->
        <!--</div>-->
      <!--</div>-->
      <!--<div class="swiper-slide">-->
        <!--<div class="main">-->
          <!--<p>slide 3</p>-->
        <!--</div>-->
      <!--</div>-->
    </div>
    <!-- 如果需要分页器 -->
    <div class="swiper-pagination"></div>

    <!-- 如果需要导航按钮 -->
    <!--<div class="swiper-button-prev"></div>-->
    <!--<div class="swiper-button-next"></div>-->
  </div>
</template>

<script>
  import Swiper from 'swiper'

  export default {
    name: "swiper",
    mounted() {
      var swiper = new Swiper('.swiper-container', {
        // loop:true,
        // autoplay: {
        //   autoplay: true,
        //   delay: 3000,
        //   disableOnInteraction: false
        // },
        // speed: 800,
        // mousewheel: true,
        // pagination: {
        //   el: '.swiper-pagination',
        //   clickable:true
        // },
        // on: {
        //   init: function (swiper) {
        //     let slide = this.slides.eq(0);
        //     slide.addClass('ani-slide');
        //   },
        //   transitionStart: function () {
        //     for (let i = 0; i < this.slides.length; i++) {
        //       let slide = this.slides.eq(i);
        //       slide.removeClass('ani-slide');
        //     }
        //   },
        //   transitionEnd: function () {
        //     let slide = this.slides.eq(this.activeIndex);
        //     slide.addClass('ani-slide');
        //
        //   },
        // }
      });

    }
  }
</script>

<style lang="less">
  .swiper-container {
    width: 100%;
    height: 551px;
    color:#fff;
    .swiper-slide {
      background: #0C1C26;
      .main{
        width:1200px;
        height:100%;
        margin:0 auto;
        position:relative;
        display:flex;
        flex-direction: row;
        align-items: center;
        &.first{
          background:url("../../../public/imgs/login/bg1.png") no-repeat right 40px bottom;
        }
        .text{
          margin-top:-60px;
          p{
            &.title{
              font-size:42px;
              span{
                color:@highColor;
              }
            }
            &.tip{
              font-size:19px;
              margin-top:20px;
            }
          }
        }
        .imgs{
          width:380px;
          height:372px;
          position:relative;
          margin-left:150px;
          img:nth-child(1){
            animation:rotate 5s linear infinite;
          }
          img:nth-child(2){
            position:absolute;
            left:50%;
            top:50%;
            z-index:2;
            transform: translate(-50%,-50%);
          }
          img:nth-child(3){
            position:absolute;
            left:66px;
            top:92px;
            z-index:3;
            animation:move 5s linear infinite;
          }
        }
      }
    }
    .swiper-pagination-bullets {
      bottom: 20px;
    }
    .swiper-pagination-bullet {
      width: 80px;
      height: 6px;
      background: rgba(252, 252, 252, 1);
      opacity: 0.5;
      border-radius: 3px;
      &.swiper-pagination-bullet-active {
        opacity: 1;
      }
    }

    /*动画*/
    @keyframes rotate{
      0%{transform:rotate(0deg);}

      25%{transform:rotate(90deg);}

      50%{transform:rotate(180deg);}

      75%{transform:rotate(270deg);}

      100%{transform:rotate(360deg);}

    }
    @keyframes move{
      0%{transform:translate3d(0,0,0);}

      50%{transform:translate3d(20px,0px,100px);}

      100%{transform:translate3d(0,0,-100px);}

    }
  }
</style>