import booleanContains from '@turf/boolean-contains'

/**
 * 将一个MultiPolygon转换成对应的Polygon数组
 * @param {Object} multiPolygon MultiPolygon中的Geometry
 * @returns Polygon数组
 */
function convertMultiPolygon2Polygons (multiPolygon) {
    if (!multiPolygon || !multiPolygon.coordinates) return null;

    let polygons = [];
    multiPolygon.coordinates.forEach(coordArr => {
        let temp = {
            "type": "Polygon",
            "coordinates": coordArr
        };
        polygons.push(temp);
    });
    return polygons;
}

/**
 * 判断Geometry是否包含指定经纬度
 * @param {Object} geometry GeoJSON中的Geometry
 * @param {LatLng} latlng 经纬度
 * @returns Boolean 
 */
function booleanContainsLatlng (geometry, latlng) {
    if (!latlng || !geometry) return false;
    let point = {
        "type": "Point",
        "coordinates": [latlng.lng, latlng.lat]
    };
    let polygons = null;
    switch (geometry.type) {
        case "MultiPolygon":
            polygons = convertMultiPolygon2Polygons(geometry);
            if (!polygons) return false;
            for (let j = 0; j < polygons.length; j++) {
                if (booleanContains(polygons[j], point)) {
                    return true;
                }
            }
            return false;
        case "Polygon":
            return booleanContains(geometry, point);
        default:
            console.log("booleanContainsLatlng方法暂不支持" + geometry.type + "类型Geometry判断。");
            return false;
    }
}

/**
 * 返回图层组中包含指定经纬度的第一个图层
 * @param {LatLng} latlng 经纬度
 * @param {LayerGroup} layerGroup 图层组
 */
function getContainsPointLayer (latlng, layerGroup) {
    if (!latlng || !layerGroup) return null;
    let point = {
        "type": "Point",
        "coordinates": [latlng.lng, latlng.lat]
    };

    let layers = getContainsGeometryLayers(point, layerGroup);
    if (layers && layers.length != 0 && layers[0])
        return layers[0];
    return null;
}

/**
 * 返回图层组中包含指定几何图形的图层数组
 * @param {Object} geometry 符合GeoJSON的Geometry几何图形
 * @param {LayerGroup} layerGroup 图层组
 * @returns {Array} 图层数组
 */
function getContainsGeometryLayers (geometry, layerGroup) {
    if (!geometry || !layerGroup) return null;

    let layers = layerGroup.getLayers();
    let polygons;
    let result = [];
    for (let i = 0; i < layers.length; i++) {
        switch (layers[i].feature.geometry.type) {
            case "MultiPolygon":
                polygons = convertMultiPolygon2Polygons(layers[i].feature.geometry);
                if (!polygons) continue;
                for (let j = 0; j < polygons.length; j++) {
                    if (booleanContains(polygons[j], geometry)) {
                        result.push(layers[i]);
                        break;
                    }
                }
                break;
            case "Polygon":
                if (booleanContains(layers[i].feature.geometry, geometry))
                    result.push(layers[i]);
                break;
        }
    }

    return result;
}

export { convertMultiPolygon2Polygons, getContainsPointLayer, getContainsGeometryLayers, booleanContainsLatlng }
