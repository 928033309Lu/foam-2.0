function valid(startTime, endTime, zones) {
    return exclude(startTime, endTime, zones)
}

function invalid(startTime, endTime, zones) {
    return union(startTime, endTime, zones)
}

//将区间加入zones
function union(startTime, endTime, zones) {
    //将zones加入timeSet并排序
    var timeSets = new Set()
    for (var i = 0; i < zones.length; i++) {
        timeSets.add(zones[i].value)
    }
    timeSets.add(startTime)
    timeSets.add(endTime)
    var longList = Array.from(timeSets).sort((a, b) => {return a - b}
)
    ;
    //获取参数
    var indexOfStart = longList.indexOf(startTime);//起始位角标
    var indexOfEnd = longList.indexOf(endTime);
    var lengthb = longList.length % 2 == 0;//数据list长度的奇偶值,偶true
    var indexOfStartb = indexOfStart % 2 == 0;  //起始位奇偶值,偶true
    var indexOfEndb = indexOfEnd % 2 == 0;

    var result = new Array()
    if ((lengthb && indexOfStartb && indexOfEndb) || (!lengthb && indexOfStartb && !indexOfEndb)) {//ooo || joj
        jojOrooo(result, longList, indexOfStart, indexOfEnd);
    } else if ((lengthb && indexOfStartb && !indexOfEndb) || (!lengthb && indexOfStartb && indexOfEndb)) {//ooj || joo
        jooOrooj(result, longList, indexOfStart, indexOfEnd);
    } else if ((lengthb && !indexOfStartb && indexOfEndb) || (!lengthb && !indexOfStartb && !indexOfEndb)) {//ojo || jjj
        ojoOrjjj(result, longList, indexOfStart, indexOfEnd);
    } else {//ojj || jjo
        jjoOrojj(result, longList, indexOfStart, indexOfEnd);
    }
    return result;
}

function jojOrooo(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start) {
            lStart = longs[i]
            lEnd = longs[end + 1]
            i = end + 1;
        } else {
            lStart = longs[i]
            lEnd = longs[i + 1]
            i++;
        }
        list.push(lStart)
        list.push(lEnd)
    }
}

function jooOrooj(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start) {
            lStart = longs[i];
            lEnd = longs[end];
            i = end;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            i++;
        }
        list.push(lStart)
        list.push(lEnd)
    }
}

function ojoOrjjj(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start - 1) {
            lStart = longs[i];
            lEnd = longs[end + 1];
            i = end + 1;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            i++;
        }
        list.push(lStart)
        list.push(lEnd)
    }
}

function jjoOrojj(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start - 1) {
            lStart = longs[i];
            lEnd = longs[end];
            i = end;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            i++;
        }
        list.push(lStart)
        list.push(lEnd)
    }
}


//从zones排除区间
function exclude(startTime, endTime, zones) {
    //将zones加入timeSet并排序
    var timeSets = new Set()
    for (var i = 0; i < zones.length; i++) {
        timeSets.add(zones[i].value)
    }
    timeSets.add(startTime)
    timeSets.add(endTime)
    var longList = Array.from(timeSets).sort((a, b) => {return a - b}
)
    ;
    //获取参数
    var indexOfStart = longList.indexOf(startTime);//起始位角标
    var indexOfEnd = longList.indexOf(endTime);
    var lengthb = longList.length % 2 == 0;//数据list长度的奇偶值,偶true
    var indexOfStartb = indexOfStart % 2 == 0;  //起始位奇偶值,偶true
    var indexOfEndb = indexOfEnd % 2 == 0;

    var result = new Array()
    if ((lengthb && indexOfStartb && indexOfEndb) || (!lengthb && indexOfStartb && !indexOfEndb)) {//ooo || joj
        jojOrooo2(result, longList, indexOfStart, indexOfEnd);
    } else if ((lengthb && indexOfStartb && !indexOfEndb) || (!lengthb && indexOfStartb && indexOfEndb)) {//ooj || joo
        jooOrooj2(result, longList, indexOfStart, indexOfEnd);
    } else if ((lengthb && !indexOfStartb && indexOfEndb) || (!lengthb && !indexOfStartb && !indexOfEndb)) {//ojo || jjj
        ojoOrjjj2(result, longList, indexOfStart, indexOfEnd);
    } else {//ojj || jjo
        jjoOrojj2(result, longList, indexOfStart, indexOfEnd);
    }
    return result;
}

/*
 *B+1-->B+2
 * */
function jooOrooj2(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start) {
            i = end;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            list.push(lStart)
            list.push(lEnd)
            i++;
        }
    }
}

/*
 * A-1-->A,B-->B+1
 * */
function ojoOrjjj2(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start - 1) {
            lStart = longs[i];
            lEnd = longs[start];
            //A-1-->A
            list.push(lStart)
            list.push(lEnd)
            //B-->B+1
            list.push(longs[end])
            list.push(longs[end + 1])

            i = end + 1;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            i++;
            list.push(lStart)
            list.push(lEnd)
        }
    }
}

/*
 * A-1-->A,B+1-->B+2
 * */
function jjoOrojj2(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start - 1) {
            lStart = longs[i];
            lEnd = longs[start];
            i = end;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            i++;
        }
        list.push(lStart)
        list.push(lEnd)
    }
}

/*
 * B-->B+1
 * */
function jojOrooo2(list, longs, start, end) {
    for (var i = 0; i < longs.length; i++) {
        var lStart, lEnd;
        if (i == start) {
            lStart = longs[end];
            lEnd = longs[end + 1];
            i = end + 1;
        } else {
            lStart = longs[i];
            lEnd = longs[i + 1];
            i++;
        }
        list.push(lStart)
        list.push(lEnd)
    }
}

export {
  invalid,valid
}