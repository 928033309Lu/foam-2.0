let FILE_TYPE = {
  FIELD_HEIGHT: 0,
  FIELD_ROUGH: 1,
  WIND_TOWER: 2,
  WIND: 3,
  RADAR: 4,
  MESOSCALE: 5,
  WEATHER: 6,
  POWER_CURVE: 7,
  WIND_TOWER_CALCULATE: 8, //综合计算测风塔文件
  WIND_CALCULATE: 9,   //综合计算风机文件
  MAST: 8,
  WT: 9
};
const UPLOAD_STATUS = {
  STOP: 0,
  START: 1,
  FINISHED: 2
};
let fileConfig = {
  [FILE_TYPE.FIELD_HEIGHT]: {
    accept: '.map',
    service: 'uploadTerrainFile',
    type: 'terrain',
    regex: /.*[\u4e00-\u9fa5\s]+/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.FIELD_ROUGH]: {
    accept: '.map',
    service: 'uploadRoughnessFile',
    type: 'roughness',
    regex: /.*[\u4e00-\u9fa5\s]+/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.WIND]: {
    accept: '.txt,.xyh,.XYH',
    service: 'uploadFanFile',
    type: 'wt',
    regex: /.*[\u4e00-\u9fa5\s]+/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.WIND_TOWER]: {
    accept: '.txt,.xyh,.XYH',
    service: 'uploadWindTowerFile',
    type: 'mast',
    regex: /.*[\u4e00-\u9fa5\s]+/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.RADAR]: {
    accept: '.map',
    service: 'uploadWindRadarFile',
    type: 'lidar'
  },
  [FILE_TYPE.MESOSCALE]: {
    accept: '.map',
    service: 'uploadMesoFile',
    type: 'meso'
  },
  [FILE_TYPE.WEATHER]: {
    accept: '.zsvds,.tim',
    service: 'uploadWeatherFile',
    type: '',
    regex: /.*[\u4e00-\u9fa5\s]{1,20}/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.POWER_CURVE]: {
    accept: '.gfwtg,.wtg',
    service: 'uploadPowerCurveFile',
    type: '',
    regex: /.*[\u4e00-\u9fa5\s]{1,20}/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.WIND_CALCULATE]: {
    accept: '.txt,.xyh,.XYH',
    service: 'uploadWindCalculate',
    type: '',
    regex: /.*[\u4e00-\u9fa5\s]{1,20}/,
    regexText: '文件名不能包含空格和中文字符'
  },
  [FILE_TYPE.WIND_TOWER_CALCULATE]: {
    accept: '.txt,.xyh,.XYH',
    service: 'uploadWindTowerCalculate',
    type: '',
    regex: /.*[\u4e00-\u9fa5\s]{1,20}/,
    regexText: '文件名不能包含空格和中文字符'
  },
};

export {
  FILE_TYPE,
  fileConfig,
  UPLOAD_STATUS
}
