function GetUrlParam(paraName) {
  var url = document.location.toString();
  var arrObj = url.split("?");

  if (arrObj.length > 1) {
    var arrPara = arrObj[1].split("&");
    var arr;

    for (var i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");

      if (arr != null && arr[0] == paraName) {
        //return arr[1];
        let userInfo = JSON.parse(decodeURIComponent(arr[1]));
        sessionStorage.setItem('userInfo',JSON.stringify(userInfo));
        sessionStorage.setItem('accessToken',userInfo.token);
      }
    }
    return "";
  }
  else {
    return "";
  }
}

export default GetUrlParam