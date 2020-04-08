<template>
    <div class="container">
        <div class="pre-btn btn" @click="preHandle" v-if="false"></div>
        <div class="swiper-container">
            <div class="swiper-wrapper">
                <div class="swiper-slide" :class="[flag?'active1':'active2']">
                    <img src="../../../public/imgs/mobile/logo.png" alt="" class="logo">
                    <img class="banner11" src="../../../public/imgs/mobile/banner11.png" alt="">
                    <img class="banner12" src="../../../public/imgs/mobile/banner12.png" alt="">
                    <img class="banner13" src="../../../public/imgs/mobile/banner13.png" alt="">
                    <img class="banner21" src="../../../public/imgs/mobile/banner21.png" alt="">
                    <img class="banner22" src="../../../public/imgs/mobile/banner22.png" alt="">
                    <img class="banner23" src="../../../public/imgs/mobile/banner23.png" alt="">
                    <img class="banner1" src="../../../public/imgs/mobile/banner2.png" alt="">
                    <img class="banner2" src="../../../public/imgs/mobile/banner.png" alt="">
                </div>
                <div class="swiper-slide">
                    <img class="title" src="../../../public/imgs/mobile/24.png" alt="">
                    <p>
                        <i class="iconfont iconrdsError"></i>
                        <span>链接国家超算中心</span>
                        <span>云端架构</span>
                        <span>极致体验</span>
                    </p>
                    <p>
                        <i class="iconfont iconwanggexian"></i>
                        <span>自适应网格</span>
                        <span>致动盘模型</span>
                    </p>
                    <p>
                        <i class="iconfont iconfuwu"></i>
                        <span>一站式服务</span>
                        <span>一键推送方案结果</span>
                    </p>
                    <img src="../../../public/imgs/mobile/11.png" alt="" class="img11">
                    <el-button @click="jump">预约体验</el-button>
                </div>
                <div class="swiper-slide">
                    <div class="infos">
                        <h3>关于我们</h3>
                        <div class="company">
                            <p>北京金风科创风电设备有限公司</p>
                            <p>Beijing Goldwind Science & Creation Windpower Equipment Co., Ltd.</p>
                        </div>
                        <ul class="concat-info">
                           <li>
                               <img src="../../../public/imgs/mobile/phone.png" alt="">
                               <span>电话：+86-(0)10-87857500</span>
                           </li>
                            <li>
                                <img src="../../../public/imgs/mobile/local.png" alt="">
                                <span>地址: 北京市北京经济技术开发区康定街 19 号(一期) </span>
                            </li>
                            <li>
                                <img src="../../../public/imgs/mobile/phone.png" alt="">
                                <span>电话: +86-(0)10-67511888</span>
                            </li>
                            <li>
                                <img src="../../../public/imgs/mobile/local.png" alt="">
                                <span>地址: 北京市北京经济技术开发区博兴一路 8 号(二期)</span>
                            </li>
                            <li>
                                <img src="../../../public/imgs/mobile/email.png" alt="">
                                <span>邮箱：fengjiang@goldwind.com.cn</span>
                            </li>
                        </ul>
                        <div class="imgs">
                            <div class="logos">
                                <img src="../../../public/imgs/mobile/text1.png" alt="">
                                <span></span>
                                <img src="../../../public/imgs/mobile/wind-logo.png" alt="">
                            </div>
                            <div class="qr">
                                <div class="one">
                                    <img src="../../../public/imgs/mobile/logo1.png" alt="">
                                    <p>金风科技微平台</p>
                                </div>
                                <div class="one">
                                    <img src="../../../public/imgs/mobile/windMaker.png" alt="">
                                    <p>风匠</p>
                                </div>
                            </div>
                        </div>
                        <div class="business-cooperation">
                            <h3>咨询</h3>
                            <p>
                                <span>郭经理</span>
                                <a href="tel:18516864860">185 1686 4860</a>
                            </p>
                            <p>
                                <span>董经理</span>
                                <a href="tel:18701512565">187 0151 2565</a>
                            </p>
                        </div>
                    </div>
                    <div class="footer">
                        © Copyright 2019 goldwind.com.cn All Right Reserved.
                    </div>
                </div>
            </div>
        </div>
        <div class="next-btn btn" @click="nextHandle" v-if="activeIndex!=2"></div>
    </div>
</template>

<script>
    import Swiper from 'swiper'

    export default {
        name: "swiper1",
        data(){
            return {
                activeIndex:0,
                swiper:null,
                flag:true,
                imgList: [
                    {
                        src: require('../../../public/imgs/mobile/1.png')
                    },
                    {
                        src: require('../../../public/imgs/mobile/2.png')
                    },
                    {
                        src: require('../../../public/imgs/mobile/3.png')
                    },
                    {
                        src: require('../../../public/imgs/mobile/4.png')
                    },
                    {
                        src: require('../../../public/imgs/mobile/5.png')
                    }
                ]
            }
        },
        mounted() {
            let vm = this;
            this.swiper = new Swiper('.swiper-container', {
                direction: 'vertical',
                speed: 800,
                on: {
                    init: function (swiper) {

                    },
                    transitionStart: function () {
                        vm.activeIndex = vm.swiper.activeIndex;
                    },
                    transitionEnd: function () {


                    },
                }
            });
            setInterval(()=>{
                this.flag = !this.flag;
            },8000);
        },
        methods:{
            preHandle(){
                this.swiper.slidePrev();
            },
            nextHandle(){
                this.swiper.slideNext();
            },
            jump(){
                location.href = 'http://invitation.wrinternet.goldwind.com.cn/';
            }
        }
    }
</script>

<style lang="less">
    .container {
        width: 100%;
        height: 100%;
        position: relative;
        .btn {
            width: 26px;
            height: 28px;
            background: url("../../../public/imgs/mobile/btn.png") no-repeat center;
            position: fixed;
            left: 50%;
            z-index:99;
            transform: translate3d(-50%,0,0);
            &.pre-btn {
                top: 30px;
                transform: translate3d(-50%,0,0) rotate(180deg);
                animation: top 2s linear 1s infinite alternate;
            }
            &.next-btn {
                bottom: 30px;
                transform: translate3d(-50%,0,0);
                animation: bottom 2s linear 1s infinite alternate;
            }
        }
        .swiper-container {
            width: 100%;
            height: 100%;
            .swiper-slide {
                width: 100%;
                height: 100%;
                overflow: auto;
                background: #060607;
                position:relative;
                &:nth-child(1){
                    /*background:#060607 url("../../../public/imgs/mobile/banner.png") no-repeat center;*/
                    /*background-size:100% auto;*/
                    >img {
                        width:70%;
                        position:absolute;
                        left:50%;
                        top:50%;
                        opacity: 0;
                        z-index:2;
                        &.logo{
                            width:15.3%;
                            left:8%;
                            top:20px;
                            z-index:3;
                            opacity: 1;
                            transform: none;
                        }
                        &.banner1,&.banner2{
                            width:100%;
                            left:50%;
                            top:50%;
                            transition: opacity .6s;
                            z-index:1;
                            transform: translate(-50%,-50%);
                        }
                        &.banner11,&.banner21{
                            width:66%;
                        }
                        &.banner12,&.banner22{
                            width:85.5%;
                        }
                        &.banner13,&.banner23{
                            width:79.1%;
                        }
                    }
                    &.active2{
                        .banner11{
                            display:none;
                            transform: none;
                        }
                        .banner1{
                            opacity: 0;
                        }
                        .banner2{
                            opacity: 1;
                        }
                        .banner21{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% - 60px));
                            animation: fadeInTop .6s;
                        }
                        .banner12{
                            display:none;
                            transform: none;
                        }
                        .banner22{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 10px));
                            animation: fadeInLeft .6s;
                        }
                        .banner13{
                            display:none;
                            transform: none;
                        }
                        .banner23{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 30px));
                            animation: fadeInLeft .6s;
                        }
                    }
                    &.active1{
                        .banner1{
                            opacity: 1;
                        }
                        .banner2{
                            opacity: 0;
                        }
                        .banner11{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% - 60px));
                            animation: fadeInTop .6s;
                        }
                        .banner21{
                            display:none;
                            transform: none;
                        }
                        .banner12{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 10px));
                            animation: fadeInLeft .6s;
                        }
                        .banner22{
                            display:none;
                            transform: none;
                        }
                        .banner13{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 30px));
                            animation: fadeInLeft .6s;
                        }
                        .banner23{
                            display:none;
                            transform: none;
                        }
                    }
                    @keyframes fadeInTop {
                        0% {
                            opacity:0;
                            top:53%;
                        }
                        50% {
                            opacity: .4;
                        }
                        100% {
                            opacity:1;
                            top:50%;
                        }
                    }
                    @keyframes fadeInLeft {
                        0% {
                            opacity:0;
                            top:55%;
                        }
                        100% {
                            opacity:1;
                            top:50%;
                        }
                    }
                }
                &:nth-child(2){
                    text-align:center;
                    background:#060607 url(../../../public/imgs/mobile/bottom.png) no-repeat left bottom;
                    background-size:100% auto;
                    .title{
                        width:58%;
                        margin:30px auto;
                    }
                    >p{
                        disply:flex;
                        flex-direction: row;
                        align-items: center;
                        text-align:left;
                        padding:0 10%;
                        margin-bottom:10px;
                        font-size:14px;
                        i{
                            background: -webkit-gradient(linear,left top,right bottom,from(#009FFF),to(#FF2EAE));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        span{
                            margin:0 10px;
                        }
                    }
                    .img11{
                        width:100%;
                        margin:70px 0 55px;
                    }
                    .el-button{
                        width:200px;
                        height:40px;
                        background:rgba(14,121,255,1);
                        border-radius:2px;
                        padding:0;
                        border:none;
                        text-align:center;
                        line-height:40px;
                        color:rgba(255,255,255,1);
                        font-size:16px;
                    }
                    @media screen and (max-height:575px){
                        &:nth-child(2){
                            >p{
                                font-size:12px;
                                margin-bottom:5px;
                                span{
                                    margin:0 8px;
                                }
                            }
                            .img11{
                                width:100%;
                                margin:35px 0 30px;
                            }
                        }
                    }
                }

                &:nth-child(3){
                    font-size:50%;
                    padding-bottom:30px;
                    overflow: hidden;
                    .footer{
                        width:100%;
                        height:30px;
                        line-height:30px;
                        background:rgba(13,17,21,1);
                        color:rgba(245,245,245,1);
                        opacity:0.3;
                        text-align:center;
                        position:absolute;
                        left:0;
                        bottom:0;
                        font-size:14px;
                    }
                    .infos{
                        height:100%;
                        overflow-x: hidden;
                        overflow-y: scroll;
                        padding:30px 0 0 20px;
                        h3{
                            font-size:20px;
                        }
                        .company{
                            margin:20px 0;
                            font-size:14px;
                            color:rgba(255,255,255,.5);
                        }
                        .concat-info{
                            li{
                                display:flex;
                                flex-direction: row;
                                align-items: center;
                                font-size:13px;
                                color:rgba(255,255,255,.5);
                                margin-bottom:6px;
                                img{
                                    margin-right:10px;
                                    opacity: .5;
                                }
                            }
                        }
                        .imgs{
                            margin:20px 0 15px;
                            .logos{
                                display:flex;
                                flex-direction: row;
                                align-items: center;
                                img{
                                    height:22px;
                                }
                                span{
                                    width:1px;
                                    height:18px;
                                    background:rgba(255,255,255,1);
                                    opacity:0.2;
                                    margin:0 20px;
                                }
                            }
                            .qr{
                                display:flex;
                                flex-direction: row;
                                align-items: center;
                                margin-top:20px;
                                .one{
                                    width:30%;
                                    overflow: hidden;
                                    font-size:22%;
                                    &:nth-child(1){
                                        margin-right:12%;
                                    }
                                    img{
                                        width:100%;
                                    }
                                    p{
                                        font-size:12px;
                                        text-align:center;
                                        margin-top:5px;
                                    }
                                }
                            }
                        }
                        .business-cooperation{
                            h3{
                                font-size:20px;
                                margin-bottom:10px;
                            }
                            p{
                                font-size:14px;
                                span{
                                    color:rgba(255,255,255,.5);
                                    margin-right:5px;
                                }
                                a{
                                    text-decoration: underline;
                                    color:@highColor;
                                }
                            }
                        }
                    }
                }
                @media screen and (max-height:575px){
                    &:nth-child(3){
                        font-size:50%;
                        padding-bottom:24px;
                        overflow: hidden;
                        .footer{
                            width:100%;
                            height:24px;
                            line-height:24px;
                            background:rgba(13,17,21,1);
                            color:rgba(245,245,245,1);
                            opacity:0.3;
                            text-align:center;
                            position:absolute;
                            left:0;
                            bottom:0;
                            font-size:12px;
                        }
                        .infos{
                            height:100%;
                            overflow-x: hidden;
                            overflow-y: scroll;
                            padding:18px 0 0 13px;
                            h3{
                                font-size:18px;
                            }
                            .company{
                                margin:16px 0;
                                font-size:12px;
                                color:rgba(255,255,255,.5);
                            }
                            .concat-info{
                                li{
                                    display:flex;
                                    flex-direction: row;
                                    align-items: center;
                                    font-size:10px;
                                    color:rgba(255,255,255,.5);
                                    margin-bottom:3px;
                                    img{
                                        margin-right:6px;
                                        opacity: .5;
                                    }
                                }
                            }
                            .imgs{
                                margin:15px 0 10px;
                                .logos{
                                    display:flex;
                                    flex-direction: row;
                                    align-items: center;
                                    img{
                                        height:20px;
                                    }
                                    span{
                                        width:1px;
                                        height:16px;
                                        background:rgba(255,255,255,1);
                                        opacity:0.2;
                                        margin:0 12px;
                                    }
                                }
                                .qr{
                                    display:flex;
                                    flex-direction: row;
                                    align-items: center;
                                    margin-top:14px;
                                    .one{
                                        width:28%;
                                        overflow: hidden;
                                        font-size:22%;
                                        &:nth-child(1){
                                            margin-right:12%;
                                        }
                                        img{
                                            width:100%;
                                        }
                                        p{
                                            font-size:12px;
                                            text-align:center;
                                            margin-top:5px;
                                        }
                                    }
                                }
                            }
                            .business-cooperation{
                                h3{
                                    font-size:18px;
                                    margin-bottom:8px;
                                }
                                p{
                                    font-size:12px;
                                    span{
                                        color:rgba(255,255,255,.5);
                                        margin-right:5px;
                                    }
                                    a{
                                        text-decoration: underline;
                                        color:@highColor;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        @keyframes top
        {
            0% {
                top:30px;
                opacity: .5;
            }
            50% {
                top:50px;
                opacity: 1;
            }
            100% {
                top:30px;
                opacity: .5;
            }
        }
        @keyframes bottom
        {
            0% {
                bottom:30px;
                opacity: .5;
            }
            50% {
                bottom:50px;
                opacity: 1;
            }
            100% {
                bottom:30px;
                opacity: .5;
            }
        }
    }
</style>