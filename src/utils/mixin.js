import userServices from '../services/user.service'

const mixin = {
    mounted() {
        if (!sessionStorage.getItem(this.$route.params.projectId + "fileInfo")) {
            this.$store.commit('delRouteList', this.$store.state.routeList.length - 1);
            this.$router.push({name: 'upload', params: this.$route.params, query: this.$route.query});
        }
    }
};
const autoList = {
    data() {
        return {
            pageSize: 10
        };
    },
    methods: {
        displayWindowSize(bb) {
            // var w = document.documentElement.clientWidth;
            let h = document.documentElement.clientHeight;
            if (h < 534) {
                this.pageSize = 10;
            } else {
                this.pageSize = Math.floor((h - 550) / 36) + 10;
            }
            bb();
        },
        debounce(fn, wait = 500, immediate) {

            let timer = null;
            if (immediate && !timer) {
                fn.apply(this);
            }
            return function (...args) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(this, args);
                }, wait);
            };
        }
    }
};


const bill = {
    data() {
        return {
            search: '',
            loading: false,
            filterData: [],
            pageIndex: 1,
            pos:''
        };
    },
    watch: {
        'search'(n) {
            //根据id获取想目账单
            this.pageIndex = 1;
            this[this.$store.state.userInfo.isadmin == 1 ? 'getEnterpriseBill' : 'getUserBill']();
            if (!n) {
                this.pageIndex = 1;
                this.filterData = [];
            }
        }
    },
    methods: {
        remoteMethod(query) {
            if (query !== '') {
                this.loading = true;
                this.getSearchData(query);
                //调后台方法
            } else {
                this.pageIndex = 1;
                this.filterData = [];
            }
        },
        getSearchData(query) {
            userServices.getProjectNameList(encodeURIComponent(query)).then(res => {
                this.filterData = [].concat(res);
                // this.pageIndex = 1;
                this.loading = false;
            }).catch(err => {
                console.log(err)
            })
        }
    }
};
const addZone = {
    data() {
        return {
            polyline: [],
            myGroup: undefined,
            lineArr: [],
            rectangle1:null,
            rectangle2:null
        };
    },
    methods: {
        autoMaker(arr, mid) {
            if (this.myGroup) {
                this.map.removeLayer(this.myGroup);
            }
            let makers = [];
            let wai = [];
            if(arr.length==2){
                if(this.pos == 'left'){
                    wai = [mid, mid + 1];
                }else{
                    wai = [mid - 1,mid];
                }
            }else{
                wai = [mid, mid - 1, mid + 1];
            }
            let nei = [this.map.getBounds().getSouth(), this.map.getBounds().getNorth()];
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < nei.length; j++) {
                    let myIcon = L.divIcon({className: 'my-div-icon', html: `<p class=a${j}>${wai[i]}</p>`});
                    let layer = new L.marker([nei[j], arr[i]], {icon: myIcon});
                    makers.push(layer)
                }
            }
            this.myGroup = L.layerGroup(makers)

            this.map.addLayer(this.myGroup);
        },
        addLineMaker(arr, mid) {
            this.autoMaker(arr, mid);
            this.map.on("zoomend", () => {
                // this.map.removeLayer(myGroup);
                this.autoMaker(arr, mid);
            });
            this.map.on("moveend", () => {
                // this.map.removeLayer(myGroup);
                this.autoMaker(arr, mid);
            });

        },
        drawRectangle(){
            if(this.rectangle1){
                this.rectangle1.remove();
                this.rectangle1 = null;
            }
            if(this.rectangle2){
                this.rectangle2.remove();
                this.rectangle2 = null;
            }
            let bounds1 = [],bounds2 = [];
            if(this.pos=='left'){
                bounds1 = [[0,this.lineArr[0]], [90,(this.lineArr[0]+this.lineArr[1])/2]];
                bounds2 = [[0,this.lineArr[0]], [-90,(this.lineArr[0]+this.lineArr[1])/2]];
            }else if(this.pos=='right'){
                bounds1 = [[0,this.lineArr[1]], [90,(this.lineArr[0]+this.lineArr[1])/2]];
                bounds2 = [[0,this.lineArr[1]], [-90,(this.lineArr[0]+this.lineArr[1])/2]];
            }else{
                bounds1 = [[0,(this.lineArr[0]+this.lineArr[1])/2], [90,(this.lineArr[2]+this.lineArr[1])/2]];
                bounds2 = [[0,(this.lineArr[0]+this.lineArr[1])/2], [-90,(this.lineArr[2]+this.lineArr[1])/2]];
            }
            this.rectangle1 = L.rectangle(bounds1, {
                color: "#FF2E76",
                weight: 0,
                fillColor: "rgba(255,0,0,.7)"
            });
            this.rectangle2 = L.rectangle(bounds2, {
                color: "#FF2E76",
                weight: 0,
                fillColor: "rgba(255,0,0,.7)"
            });
            this.map.addLayer(this.rectangle1);
            this.map.addLayer(this.rectangle2);
        },
        drawLine(val, val1) {
            
            let zone = undefined;
            let zone1 = undefined;
            let zone2 = undefined;
            let mid = parseInt(val);

            if (this.polyline.length) {
                this.polyline.forEach(item=>{
                    item.remove();
                });
                this.polyline = [];
            }
            if (val1 == "3") {
                // if(mid==25){
                //     mid=26
                // }
                // if(mid==45){
                //     mid=44
                // }
                zone = 3 * mid;
                zone1 = 3 * (mid - 1);
                zone2 = 3 * (mid + 1);
            } else {
                // if(mid==13){
                //     mid=14
                // }
                // if(mid==23){
                //     mid=22
                // }
                zone = 6 * mid - 3;
                zone1 = 6 * (mid - 1) - 3;
                zone2 = 6 * (mid + 1) - 3;
            }
            this.lineArr = [];
            this.map.setView([37, zone])
            let latlngs = [[-90, zone], [0, zone], [90, zone]];
            let latlngs1 = [[-90, zone1], [0, zone1], [90, zone1]];
            let latlngs2 = [[-90, zone2], [0, zone2], [90, zone2]];
            let lineStyle = {
                color: "red",
                weight: "1"
            }
            if (mid != 13 && mid != 25 && mid != 23 && mid != 45) {
                lineStyle.dashArray = '4';
            }
            this.polyline[0] = L.polyline(latlngs, lineStyle).addTo(this.map);
            if (mid != 13 && mid != 25) {
                this.polyline[1] = L.polyline(latlngs1, Object.assign(lineStyle,{dashArray:null})).addTo(this.map);
            }
            if (mid != 23 && mid != 45) {
                this.polyline[2] = L.polyline(latlngs2, Object.assign(lineStyle,{dashArray:null})).addTo(this.map);
            }
            if (mid == 13 || mid == 25) {
                this.lineArr.push(zone);
                this.lineArr.push(zone2);
                this.pos = 'left';
                this.addLineMaker([zone, zone2], mid);
            } else if (mid == 23 || mid == 45) {
                this.lineArr.push(zone1);
                this.lineArr.push(zone);
                this.pos = 'right';
                this.addLineMaker([zone1,zone], mid);
            } else {
                this.lineArr.push(zone1);
                this.lineArr.push(zone);
                this.lineArr.push(zone2);
                this.pos = 'mid';
                this.addLineMaker([zone, zone1, zone2], mid);
            }
            this.drawRectangle();
        },
    }
}
export {mixin, autoList, bill, addZone};
