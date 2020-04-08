// import L from 'leaflet'

L.TileLayer.ChinaProvider = L.TileLayer.extend({

  initialize: function (type, options) { // (type, Object)
    var providers = L.TileLayer.ChinaProvider.providers;

    var parts = type.split('.');

    var providerName = parts[0];
    var mapName = parts[1];
    var mapType = parts[2];

    var url = providers[providerName][mapName][mapType];
    options.subdomains = providers[providerName].Subdomains;
    if (providerName == "TianDiTu4326" || providerName == "TianDiTuWMTS4326") {
      //如果是4326的参考系
      options.tileSize = 256;
      options.zoomOffset = 1;
    }
    if (providerName.indexOf("TianDiTu") >= 0 && options.token) {
      //附加天地图token
      url += "&tk=" + options.token;
    }
    L.TileLayer.prototype.initialize.call(this, url, options);
  }
});

L.TileLayer.ChinaProvider.providers = {
  TianDiTu: {
    Normal: {
      Map: "http://t{s}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
      Annotion: "http://t{s}.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}",
    },
    Satellite: {
      Map: "http://t{s}.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}",
      Annotion: "http://t{s}.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}",
    },
    Terrain: {
      Map: "http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}",
      Annotion: "http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}",
    },
    Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  },
  //天地图WMTS WGS84(CGCS2000) EPSG:4326
  TianDiTuWMTS4326: {
    Normal: {
      Map: "http://t{s}.tianditu.com/vec_c/wmts?layer=vec&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}",
      Annotion: "http://t{s}.tianditu.com/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}"
    },
    Satellite: {
      Map: "http://t{s}.tianditu.com/img_c/wmts?layer=img&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}",
      Annotion: "http://t{s}.tianditu.com/cia_c/wmts?layer=cia&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}"
    },
    Terrain: {
      Map: "http://t{s}.tianditu.com/ter_c/wmts?layer=ter&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}",
      Annotion: "http://t{s}.tianditu.com/cta_c/wmts?layer=cta&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}"
    },
    BoundLayer: {
      Map: "https://t{s}.tianditu.gov.cn/ibo_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}"
  },
    Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  },

  GaoDe: {
    Normal: {
      Map: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    },
    Satellite: {
      Map: 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      Annotion: 'http://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
    },
    Subdomains: ["1", "2", "3", "4"]
  },

  Google: {
    // Normal: {
    //   Map: "http://ditu.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
    // },
    Normal: {
      Map: "http://ditu.google.cn/maps/vt?lyrs=m&x={x}&y={y}&z={z}"
    },
    // Satellite: {
    //   Map: "http://ditu.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
    // },
    Satellite: {
      Map: "http://ditu.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}" //无偏移gl=en或无
      // Map: "http://ditu.google.cn/maps/vt?lyrs=s&gl=cn&x={x}&y={y}&z={z}"//有偏移gl=cn
    },
    Subdomains: []
  },

  Geoq: {
    Normal: {
      Map: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
      Color: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}", // no
      PurplishBlue: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
      Gray: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
      Warm: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}", // no
      Cold: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetCold/MapServer/tile/{z}/{y}/{x}" // no
    },
    Subdomains: []

  }
};

L.tileLayer.chinaProvider = function (type, options) {
  return new L.TileLayer.ChinaProvider(type, options);
};