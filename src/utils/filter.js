const ToTime=function(timestamp) {
    if(!timestamp){
        return '--';
    }
    let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = (date.getDate() <10 ? '0'+date.getDate():date.getDate())+ ' ';
    let h = (date.getHours() <10 ? '0'+date.getHours():date.getHours())+ ':';
    let m = (date.getMinutes() <10 ? '0'+date.getMinutes():date.getMinutes())+ ':';
    let s = (date.getSeconds() <10 ? '0'+date.getSeconds():date.getSeconds());

    return Y+M+D+h+m+s;
}

const ToDate=function(timestamp) {
    if(!timestamp){
        return '--';
    }
    let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '年';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '月';
    let D = (date.getDate() <10 ? '0'+date.getDate():date.getDate())+ '日';

    return Y+M+D;
}
const ToDian=function(timestamp) {
    if(!timestamp){
        return '--';
    }
    let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '.';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '.';
    let D = (date.getDate() <10 ? '0'+date.getDate():date.getDate())+ '.';

    return Y+M+D;
}

export default {
  ToTime,
  ToDate,
    ToDian
}
