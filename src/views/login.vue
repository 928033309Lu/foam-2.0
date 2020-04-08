<template>
    <div class="login-container">
        <div class="box box1" v-if="type==1">
            <el-header>
                <el-main>
                    <img src="../../public/imgs/login/logo3.png" alt="">
                    <el-button class="register-btn" @click="goRegister" v-if="$route.params.type=='common'">注册
                    </el-button>
                    <el-button class="login-btn" @click="loginVisible=true">登录</el-button>
                </el-main>
            </el-header>
            <el-main>
                <swiper></swiper>
                <div class="img-info">
                    <img-model v-for="item in imgList.slice(0,3)" :src="item.src" :text="item.text"></img-model>
                </div>
                <div class="img-info">
                    <img-model v-for="item in imgList.slice(3)" :src="item.src" :text="item.text"></img-model>
                </div>
                <div class="advantage-list">
                    <h2>技术优势</h2>
                    <div class="imgs">
                        <advantage-model v-for="item in technicalAdvantageList" :src="item.src"
                                         :text="item.text"></advantage-model>
                    </div>
                </div>
                <div class="experience" v-if="$route.params.type=='common'">
                    <h2>现在开始体验<span>风匠</span></h2>
                    <!--<p>宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字</p>-->
                    <el-button @click="goRegister">立即注册</el-button>
                </div>
            </el-main>
            <el-footer>
                <el-main>
                    <div class="content">
                        <div class="content-left">
                            <h3>关于我们</h3>
                            <p>金风科技股份有限公司</p>
                            <p>Beijing Goldwind Science & Creation Windpower Equipment Co., Ltd.</p>
                            <p class="tel"><i class="iconfont iconweibiaoti-"></i>电话：+86-(0)10-6751 1888-3047</p>
                            <p><i class="iconfont icondizhi"></i>地址：北京市北京经济技术开发区博兴一路 8 号(二期)</p>
                            <p>
                                <i class="iconfont iconyouxiang"></i>
                                <a href="mailto:fengjiang@goldwind.com.cn">邮箱：fengjiang@goldwind.com.cn</a>
                            </p>
                        </div>
                        <div class="content-right">
                            <div class="imgs">
                                <img src="../../public/imgs/login/logo.png" alt="">
                                <span class="line"></span>
                                <img src="../../public/imgs/login/logo1.png" alt="">
                            </div>
                            <ul class="QR">
                                <li>
                                    <img src="../../public/imgs/login/Wechat.png" alt="">
                                    <p>金风科技平台</p>
                                </li>
                                <li>
                                    <img src="../../public/imgs/login/windMaker.png" alt="">
                                    <p>风匠</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </el-main>
                <el-footer>
                    © Copyright 2019 goldwind.com.cn All Right Reserved.
                </el-footer>
            </el-footer>
        </div>
        <div class="box box2" id="box" v-if="type==2">
            <el-header class="header" :class="[flag?'active1':'active2']">
                <el-main>
                    <img src="../../public/imgs/login2/logo-header.png" alt="">
                    <el-button class="register-btn" @click="goRegister" v-if="$route.params.type=='common'">注册
                    </el-button>
                    <el-button class="login-btn" @click.stop="goLogin">登录</el-button>
                </el-main>
                <video src="https://goldfoam2.s3.cn-northwest-1.amazonaws.com.cn/video/formal.mp4" id="video-index" preload="auto" data-setup="{'autoplay':true}" autoplay="true" loop="true" muted="true"
                poster=""></video>
                <img class="banner11" src="../../public/imgs/banner/banner11.png" alt="">
                <img class="banner12" src="../../public/imgs/banner/banner12.png" alt="">
                <img class="banner13" src="../../public/imgs/banner/banner13.png" alt="">
                <img class="banner21" src="../../public/imgs/banner/banner21.png" alt="">
                <img class="banner22" src="../../public/imgs/banner/banner22.png" alt="">
                <img class="banner23" src="../../public/imgs/banner/banner23.png" alt="">
            </el-header>
            <el-main>
                <ul class="img-info">
                    <li v-for="item in imgList1.slice(0,3)">
                        <img class="bg" :src="item.src" alt="">
                        <img :class="{'active':scrollTop>=screenHeight/2}" class="bg1" :src="item.src1" alt="">
                        <p v-html="item.text"></p>
                    </li>
                </ul>
                <ul class="img-info">
                    <li v-for="item in imgList1.slice(3)">
                        <img class="bg" :src="item.src" alt="">
                        <img :class="{'active':scrollTop>=screenHeight/2}" class="bg1" :src="item.src1" alt="">
                        <p v-html="item.text"></p>
                    </li>
                </ul>
                <div class="advantage-list">
                    <h2>技术优势</h2>
                    <p>technical advantage</p>
                    <div class="imgs">
                        <advantage-model v-for="item in technicalAdvantageList" :src="item.src1" :src1="item.src2" :width="item.width"
                                         :text="item.text" :screenHeight="screenHeight" :scrollTop="scrollTop"></advantage-model>
                    </div>
                </div>
                <div class="experience" v-if="$route.params.type=='common'">
                    <h2>现在开始体验<span>风匠</span></h2>
                    <!--<p>宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字宣传文字</p>-->
                    <el-button @click="goRegister">立即注册</el-button>
                </div>
                <video src="https://goldfoam2.s3.cn-northwest-1.amazonaws.com.cn/video/bottom.mp4?v=2" autoplay="true" loop="true" muted="true"
                       poster="" id="video-footer"></video>
                <img class="bg" src="../../public/imgs/login2/line.png" alt="" :style="{'left':(scrollTop/screenHeight)*150+'px'}">
            </el-main>
            <el-footer>
                <el-main>
                    <div class="content">
                        <div class="content-left">
                            <h3>关于我们</h3>
                            <p>金风科技股份有限公司</p>
                            <p>Beijing Goldwind Science & Creation Windpower Equipment Co., Ltd.</p>
                            <p class="tel"><i class="iconfont iconweibiaoti-"></i>电话：+86-(0)10-6751 1888-3047</p>
                            <p><i class="iconfont icondizhi"></i>地址：北京市北京经济技术开发区博兴一路 8 号(二期)</p>
                            <p>
                                <i class="iconfont iconyouxiang"></i>
                                <a href="mailto:fengjiang@goldwind.com.cn">邮箱：fengjiang@goldwind.com.cn</a>
                            </p>
                        </div>
                        <div class="content-right">
                            <div class="imgs">
                                <img src="../../public/imgs/login2/logo-new.png" alt="">
                                <span class="line"></span>
                                <img src="../../public/imgs/login2/logo1.png" alt="">
                            </div>
                            <ul class="QR">
                                <li>
                                    <img src="../../public/imgs/login2/Wechat.png" alt="">
                                    <p>金风科技平台</p>
                                </li>
                                <li>
                                    <img src="../../public/imgs/login2/windMaker.png" alt="">
                                    <p>风匠</p>
                                </li>
                            </ul>
                            <div class="cooperation">
                                <h3>商务合作</h3>
                                <p>
                                    <span>郭经理</span>
                                    <span>18516864860</span>
                                </p>
                                <p>
                                    <span>董经理</span>
                                    <span>18701512565</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </el-main>
                <el-footer>
                    © Copyright 2019 goldwind.com.cn All Right Reserved.
                </el-footer>
            </el-footer>
        </div>
        <div class="box box3" v-if="type==3">
            <swiper1></swiper1>
        </div>
        <login-model v-if="loginVisible" :loginVisible.sync="loginVisible"></login-model>
    </div>
</template>

<script>
    import loginModel from "@/components/user/login-dialog.vue"
    import swiper from "@/components/login/swiper.vue"
    import swiper1 from "@/components/login/swiper1.vue"
    import imgModel from "@/components/login/img-info.vue"
    import advantageModel from "@/components/login/advantage-info.vue"

    export default {
        data() {
            return {
                flag:true,
                type: this.$route.query.type || 2,
                loginVisible: false,
                imgList: [
                    {
                        src: require('../../public/imgs/login/pic1.png'),
                        text: '高性能计算，链接国家超算中心，<br>裸金属级的计算能力'
                    },
                    {
                        src: require('../../public/imgs/login/pic4.png'),
                        text: '融合最新的尾流研究成果，提升大<br>基地项目评估精准'
                    },
                    {
                        src: require('../../public/imgs/login/pic2.png'),
                        text: '内置地图和风数据处理工具，一站<br>式服务完成工作流程'
                    },
                    {
                        src: require('../../public/imgs/login/pic5.png'),
                        text: '按需计算，用户为项目实际计算资<br>源付费，无需大量的资金投入即可<br>完成风资源的评估'
                    },
                    {
                        src: require('../../public/imgs/login/pic3.png'),
                        text: '持续升级，用户实时享受最新版，<br>无需升级付费'
                    }
                ],
                imgList1: [
                    {
                        src: require('../../public/imgs/login2/1.png'),
                        src1: require('../../public/imgs/login2/11.png'),
                        text: '高性能计算，链接国家超算中<br>心，裸金属级的计算能力'
                    },
                    {
                        src: require('../../public/imgs/login2/2.png'),
                        src1: require('../../public/imgs/login2/11.png'),
                        text: '融合最新的尾流研究成果，提<br>升大基地项目评估精准'
                    },
                    {
                        src: require('../../public/imgs/login2/3.png'),
                        src1: require('../../public/imgs/login2/11.png'),
                        text: '内置地图和风数据处理工具，<br>一站式服务完成工作流程'
                    },
                    {
                        src: require('../../public/imgs/login2/4.png'),
                        src1: require('../../public/imgs/login2/11.png'),
                        text: '按需计算，用户为项目实际计<br>算付费，无需大量资金投入'
                    },
                    {
                        src: require('../../public/imgs/login2/5.png'),
                        src1: require('../../public/imgs/login2/11.png'),
                        text: '持续升级，用户实时享受最新<br>版，无需升级付费'
                    }
                ],
                technicalAdvantageList: [
                    {
                        width:95,
                        src: require('../../public/imgs/login/pic6.png'),
                        src1: require('../../public/imgs/login2/21.png'),
                        src2: require('../../public/imgs/login2/221.png'),
                        text: '采用真正的流体力学<br>软件，求解完备的流<br>场信息'
                    },
                    {
                        width:76,
                        src: require('../../public/imgs/login/pic9.png'),
                        src1: require('../../public/imgs/login2/22.png'),
                        src2: require('../../public/imgs/login2/222.png'),
                        text: '采用非结构化网格，<br>对地形，机位点，测<br>风塔等进行局地加密'
                    },
                    {
                        width:84,
                        src: require('../../public/imgs/login/pic7.png'),
                        src1: require('../../public/imgs/login2/23.png'),
                        src2: require('../../public/imgs/login2/223.png'),
                        text: '采用最新的湍流分析<br>标准，精准分析湍流<br>分布'
                    },
                    {
                        width:91,
                        src: require('../../public/imgs/login/pic11.png'),
                        src1: require('../../public/imgs/login2/24.png'),
                        src2: require('../../public/imgs/login2/224.png'),
                        text: '融入最新的尾流研究<br>成果，实现精细化的<br>尾流计算'
                    },
                    {
                        width:86,
                        src: require('../../public/imgs/login/pic10.png'),
                        src1: require('../../public/imgs/login2/25.png'),
                        src2: require('../../public/imgs/login2/225.png'),
                        text: '利用超算中心的超<br>强算力，实现超大<br>项目的快速计算'
                    },
                    {
                        width:86,
                        src: require('../../public/imgs/login/pic8.png'),
                        src1: require('../../public/imgs/login2/26.png'),
                        src2: require('../../public/imgs/login2/226.png'),
                        text: '地图处理工具，风数<br>据处理工具，无缝兼<br>容现有的数据格式'
                    }
                ],
                scrollTop:0,
                screenHeight:0
            }
        },
        components: {
            loginModel, swiper, imgModel, advantageModel,swiper1
        },
        props: [],
        created() {
            let userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo && Object.keys(userInfo).length > 0) {
                let isadmin = 0;
                isadmin = userInfo.isadmin >= 0 ? userInfo.isadmin : '';
                let type = isadmin == 0 ? 'common' : isadmin == 1 ? 'enterAdminLogin' : 'sysAdminLogin';
                if (this.$route.params.type == type) {
                    let path = isadmin == 0 ? '/project/list' : isadmin == 1 ? '/customer/personList' : '/customer/list';
                    this.$router.push(path);
                } else {
                    localStorage.clear();
                }
            }
        },
        mounted() {
            this.screenHeight = document.body.offsetHeight;
            if(this.type==2){
                document.getElementById('box').onscroll = (e)=>{
                    this.scrollTop = document.getElementById('box').scrollTop;
                }
            }
            if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
                !function (userAgent) {
                    var screen_w = parseInt(window.screen.width),
                        scale = screen_w / 750;
                    if (/Android (\d+\.\d+)/.test(userAgent)) {
                        var version = parseFloat(RegExp.$1);
                        document.write(version > 2.3 ? '<meta name="viewport" content="width=750, minimum-scale=' + scale + ', maximum-scale=' + scale + ', target-densitydpi=device-dpi">' : '<meta name="viewport" content="width=1080, target-densitydpi=device-dpi">');
                    } else {
                        document.write('<meta name="viewport" content="width=750, minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no, target-densitydpi=device-dpi">');
                    }
                }(navigator.userAgent);
                this.type = 3;
            }else{
                setInterval(()=>{
                    this.flag = !this.flag;
                },8000)
            }
        },
        methods: {
            goRegister() {
                this.$router.push('/register/1');
            },
            goLogin(){
                this.loginVisible = true;
            }
        },
        watch: {}
    }
</script>

<style lang="less">
    .login-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        .box {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            overflow-y: scroll;
            &.box3{
                overflow: hidden;
            }
            &.box1 {
                background: url(../../public/imgs/login/bg2.png) no-repeat center;
                .el-header {
                    height: 49px !important;
                    background: rgba(12, 28, 38, 1);
                    border: 1px solid #030303;
                    .el-main {
                        width: 1200px;
                        height: 48px;
                        margin: 0 auto;
                        padding: 0;
                        overflow: hidden;
                        > img {
                            display: inline-block;
                            vertical-align: middle;
                            margin-top: 10px;
                        }
                        .el-button {
                            float: right;
                            padding: 0;
                            text-align: center;
                            line-height: 28px;
                            width: 68px;
                            height: 28px;
                            background: rgba(0, 159, 255, 1);
                            border-radius: 2px;
                            color: rgba(255, 255, 255, .7);
                            margin: 10px;
                            border: none;
                            &.register-btn {
                                background: transparent;
                            }
                        }
                    }
                }
                .el-main {
                    padding: 0;
                    .img-info {
                        width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                    }
                    .advantage-list {
                        overflow: hidden;
                        background: rgba(0, 159, 255, 1);
                        text-align: center;
                        h2 {
                            font-size: 32px;
                            color: #f2f2f2;
                            margin: 57px 0 50px;
                        }
                        .imgs {
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: center;
                        }
                    }
                }
                .experience {
                    text-align: center;
                    color: #013249;
                    h2 {
                        font-size: 36px;
                        margin: 65px 0 20px;
                        span {
                            font-size: 36px;
                            color: @highColor;
                            margin-left: 20px;
                            letter-spacing: 18px;
                        }
                    }
                    .el-button {
                        width: 200px;
                        height: 44px;
                        background: rgba(0, 159, 255, 1);
                        border-radius: 2px;
                        padding: 0;
                        border: none;
                        text-align: center;
                        line-height: 44px;
                        font-size: 20px;
                        color: #013249;
                        margin: 40px 0 112px;
                    }
                }
                .el-footer {
                    padding: 0;
                    height: auto !important;
                    .el-main {
                        height: 420px !important;
                        padding: 0;
                        background: rgba(12, 28, 38, .9);
                        .content {
                            width: 1000px;
                            height: 100%;
                            margin: 0 auto;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: space-between;
                            .content-left {
                                h3 {
                                    font-size: 20px;
                                    color: #F5F5F5;
                                }
                                p {
                                    font-size: 16px;
                                    color: #849094;
                                    margin-top: 20px;
                                    i {
                                        font-size: 14px;
                                        color: #F5F5F5;
                                        margin-right: 10px;
                                    }
                                    &.tel {
                                        margin-top: 50px;
                                    }
                                }
                            }
                            .content-right {
                                .imgs {
                                    margin-bottom: 34px;
                                    > * {
                                        display: inline-block;
                                        vertical-align: middle;
                                    }
                                    .line {
                                        width: 1px;
                                        height: 18px;
                                        background: rgba(255, 255, 255, 1);
                                        opacity: 0.2;
                                        margin: 0 20px;
                                    }
                                }
                                .QR {
                                    display: flex;
                                    flex-direction: row;
                                    margin-bottom:34px;
                                    li {
                                        width: 130px;
                                        overflow: hidden;
                                        margin-right: 20px;
                                        p {
                                            margin-top: 13px;
                                            font-size: 12px;
                                            color: #849094;
                                            text-align: center;
                                        }
                                    }
                                }
                                .cooperation{
                                    h3{
                                        font-size:20px;
                                        color:#fff;
                                        margin-bottom:20px;
                                    }
                                    p{
                                        color:rgba(255,255,255,.4);
                                        span:nth-child(1){
                                            margin-right:24px;
                                        }
                                        line-height:27px;
                                    }
                                }
                            }
                        }
                    }
                    .el-footer {
                        padding: 0;
                        height: 40px !important;
                        background: rgba(9, 22, 30, 1);
                        line-height: 40px;
                        color: #F5F5F5;
                        text-align: center;
                    }
                }
            }
            &.box2 {
                background: rgba(6, 6, 7, 1);
                .header {
                    width: 100%;
                    height:100%!important;
                    overflow: hidden;
                    padding:0;
                    position:relative;
                    >img {
                        position:absolute;
                        left:50%;
                        top:50%;
                        opacity: 0;
                        transition: opacity 2s;
                    }
                    &.active2{
                        .banner11{
                            display:none;
                            transform: none;
                        }
                        .banner21{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% - 110px));
                            animation: fadeInTop .6s;
                        }
                        .banner12{
                            display:none;
                            transform: none;
                        }
                        .banner22{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 40px));
                            animation: fadeInLeft .6s;
                        }
                        .banner13{
                            display:none;
                            transform: none;
                        }
                        .banner23{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 80px));
                            animation: fadeInRight .6s;
                        }
                    }
                    &.active1{
                        .banner11{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% - 110px));
                            animation: fadeInTop .6s;
                        }
                        .banner21{
                            display:none;
                            transform: none;
                        }
                        .banner12{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 40px));
                            animation: fadeInLeft .6s;
                        }
                        .banner22{
                            display:none;
                            transform: none;
                        }
                        .banner13{
                            opacity: 1;
                            transform: translate(-50%,calc(-50% + 80px));
                            animation: fadeInRight .6s;
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
                    @keyframes fadeInBottom {
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
                    @keyframes fadeInRight {
                        0% {
                            opacity:0;
                            top:55%;
                        }
                        100% {
                            opacity:1;
                            top:50%;
                        }
                    }
                    video{
                        width:100%;
                        height:100%;
                        object-fit:fill;
                    }
                    .el-main {
                        width: 1200px;
                        height: 48px;
                        margin: 0 auto;
                        padding: 0;
                        overflow: hidden;
                        position:fixed;
                        left:50%;
                        top:0;
                        z-index:99;
                        transform: translate(-50%,0);
                        > img {
                            display: inline-block;
                            vertical-align: middle;
                            margin-top: 10px;
                        }
                        .el-button {
                            float: right;
                            padding: 0;
                            text-align: center;
                            line-height: 28px;
                            width: 68px;
                            height: 28px;
                            background: rgba(0, 159, 255, 1);
                            border-radius: 2px;
                            color: rgba(255, 255, 255, .7);
                            margin: 10px;
                            border: none;
                            &.register-btn {
                                background: transparent;
                            }
                        }
                    }
                }
                >.el-main{
                    padding-top:122px;
                    position:relative;
                    overflow: hidden;
                    >img.bg{
                        position:absolute;
                        left:0px;
                        bottom:116px;
                    }
                    video{
                        width:100%;
                        position:absolute;
                        left:0;
                        bottom:0;
                    }
                    .img-info {
                        width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        position:relative;
                        z-index:9;
                        &:first-child{
                            margin-bottom:97px;
                        }
                        li{
                            position:relative;
                            width:295px;
                            height:342px;
                            margin:0 44px;
                            img{
                                position:absolute;
                                left:0;
                                top:0;
                                z-index:2;
                                &.bg1{
                                    z-index:1;
                                    opacity: 0;
                                    transition: opacity .5s;
                                    &.active{
                                        opacity: 1;
                                    }
                                }
                            }
                            p{
                                color:#fff;
                                font-size:16px;
                                margin-top:252px;
                                padding-left: 40px;
                                position:relative;
                                z-index:3;
                            }
                        }
                    }
                    .advantage-list {
                        overflow: hidden;
                        text-align: center;
                        position:relative;
                        z-index:9;
                        h2 {
                            font-size: 36px;
                            color: #0E79FF;
                            margin: 241px 0 15px;
                        }
                        p{
                            text-align:center;
                            color:#f2f2f2;
                            margin-bottom:110px;
                        }
                        .text p{
                            text-align:left;
                        }
                        .imgs {
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: center;
                            .img-container{
                                margin:0 auto;
                            }
                        }
                    }
                    .experience {
                        text-align: center;
                        color: #fff;
                        position:relative;
                        z-index:9;
                        h2 {
                            font-size: 32px;
                            margin: 202px 0 20px;
                            span {
                                font-size: 36px;
                                color: @highColor;
                                margin-left: 20px;
                                letter-spacing: 18px;
                            }
                        }
                        .el-button {
                            width: 200px;
                            height: 44px;
                            background:rgba(14,121,255,1);
                            border-radius:2px;
                            padding: 0;
                            border: none;
                            text-align: center;
                            line-height: 44px;
                            font-size: 20px;
                            color: #fff;
                            margin: 40px 0 176px;
                        }
                    }
                }
                .el-footer {
                    padding: 0;
                    height: auto !important;
                    .el-main {
                        height: 420px !important;
                        padding: 0;
                        background: #060607;
                        .content {
                            width: 1000px;
                            height: 100%;
                            margin: 0 auto;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: space-between;
                            .content-left {
                                h3 {
                                    font-size: 20px;
                                    color: #F5F5F5;
                                    opacity: .8;
                                }
                                p {
                                    font-size: 16px;
                                    color: #fff;
                                    margin-top: 20px;
                                    opacity: .4;
                                    i {
                                        font-size: 14px;
                                        margin-right: 10px;
                                    }
                                    a{
                                        color:#fff;
                                    }
                                    &.tel {
                                        margin-top: 50px;
                                    }
                                }
                            }
                            .content-right {
                                .imgs {
                                    margin-bottom: 34px;
                                    > * {
                                        display: inline-block;
                                        vertical-align: middle;
                                    }
                                    .line {
                                        width: 1px;
                                        height: 18px;
                                        background: rgba(255, 255, 255, 1);
                                        opacity: 0.2;
                                        margin: 0 20px;
                                    }
                                }
                                .QR {
                                    display: flex;
                                    flex-direction: row;
                                    margin-bottom:34px;
                                    li {
                                        width: 130px;
                                        overflow: hidden;
                                        margin-right: 20px;
                                        p {
                                            margin-top: 6px;
                                            font-size: 12px;
                                            color: #849094;
                                            text-align: center;
                                        }
                                    }
                                }
                                .cooperation{
                                    h3{
                                        font-size:20px;
                                        color:#fff;
                                        margin-bottom:20px;
                                    }
                                    p{
                                        color:rgba(255,255,255,.4);
                                        span:nth-child(1){
                                            margin-right:24px;
                                        }
                                        line-height:27px;
                                    }
                                }
                            }
                        }
                    }
                    .el-footer {
                        padding: 0;
                        height: 40px !important;
                        background: rgba(9, 22, 30, 1);
                        line-height: 40px;
                        color: #F5F5F5;
                        text-align: center;
                    }
                }
            }
        }
    }
</style>
