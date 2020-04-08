/**
 * 地图相关配置
 */
const MapConfig = {
    centerlon: 105.0,
    centerlat: 35.5,
    initZoom: 5,
    minZoom: 4,
    maxZoom: 18,
    baseMap: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
    // baseMap: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
    Google:
    {
        Satellite: {
            Map: "http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}",
            Annotion: "http://www.google.cn/maps/vt?lyrs=h&x={x}&y={y}&z={z}",
        }
    }
}

/**
 * 行政区划数据相关配置
 */
const RegionConfig = {
    //国、省、市、县地图级别
    mapLevel: {
        province: 4,
        city: 7,
        county: 9,
    },
    //是否显示到对应层级的政区图层
    regionVisible: {
        province: true,
        city: true,
        county: true,
    }

}

/**
 * 各个区域省区对应关系
 */
const RegionProvinces = {
    0: ["11", "12", "13", "14", "15"],
    1: ["21", "22", "23"],
    2: ["31", "32", "33", "34", "35", "36", "37", "71"],
    3: ["41", "42", "43"],
    4: ["44", "45", "46", "81", "82"],
    5: ["50", "51", "52", "53", "54"],
    6: ["61", "62", "63", "64", "65"]
}

/**
 * 获取政区样式
 * @param {Number} type
 * 10：省级政区默认样式；
 * 11：省级政区高亮样式；
 * 20：地市、县级政区默认样式；
 * 21：地市、县级政区高亮样式；
 * 30：省级政区默认样式（透明）；
 * 31：省级政区高亮样式；
 */
function getRegionStyle (type) {
    switch (type) {
        case 10:
            return { color: "#545659", opacity: 1, weight: 2, fillColor: "#112E45", fillOpacity: 0.8 };
        case 11:
            return { color: "#99CC99", opacity: 1, weight: 2, fillColor: "#99CC99", fillOpacity: 0.8 };
        case 20:
            return { color: "#545659", opacity: 0.8, weight: 1, fillColor: "#112E45", fillOpacity: 0.8 };
        case 21:
            return { color: "#99CC99", opacity: 0.8, weight: 1, fillColor: "#99CC99", fillOpacity: 0.8 };
        case 30:
            return { color: "#545659", opacity: 0, weight: 1, fillColor: "#112E45", fillOpacity: 0 };
        case 31:
            return { color: "#99CC99", opacity: 1, weight: 2, fillColor: "#99CC99", fillOpacity: 0.8 };
    }
    return {};
}

const MachineIcons = ['/images/icon_machine.png', '/images/icon_machine_prod.png', '/images/icon_machine_overlap.png'];
const getRegionTooltipContent=function(content){
return '<div style="font-size:14px;color:rgba(255,255,255,1);">'+content+'</div>';
}
const RegionTooltipOptions={
    direction: "center",
    className: 'basemap-region-tooltip',
    opacity: 1
}
export { MapConfig, RegionConfig, MachineIcons, RegionProvinces, getRegionStyle,getRegionTooltipContent,RegionTooltipOptions }
