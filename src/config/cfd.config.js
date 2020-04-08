let refineCenterOptions = [
  {
    value: 'wt',
    label: 'wt'
  },
  {
    value: 'mast',
    label: 'mast'
  },
  {
    value: 'wrg',
    label: 'wrg'
  },
  {
    value: 'meso',
    label: 'meso'
  },
  {
    value: 'lidar',
    label: 'lidar'
  }
];

let refineMethodOptions = [
  {
    value: 'bary',
    label: 'bary'
  },
  {
    value: 'mid',
    label: 'mid'
  },
];

let multiZoneOptions = [
  {
    value: 1,
    label: '是'
  },
  {
    value: 0,
    label: '否'
  }
];

let contcritOptions = [
  {
    value: 1,
    label: '是'
  },
  {
    value: 0,
    label: '否'
  }
];

let slopeNcalcOptions = [
  {
    value: 8,
    label: 8
  },
  {
    value: 12,
    label: 12
  },
  {
    value: 16,
    label: 16
  },
  {
    value: 24,
    label: 24
  },
  {
    value: 36,
    label: 36
  },
  {
    value: 48,
    label: 48
  },
  {
    value: 72,
    label: 72
  },
  {
    value: 144,
    label: 144
  },
  {
    value: 360,
    label: 360
  }
];
//光滑方法
let smoothMethod = [
  {
    value: 'flat',
    label: 'flat'
  },
  {
    value: 'without',
    label: 'without'
  },
  {
    value: 'extra',
    label: 'extra'
  },
];
//压力求解器
let pSolverOptions = [
  {
    value: 'PCG',
    label: 'PCG'
  },
  {
    value: 'GAMG',
    label: 'GAMG'
  },
  {
    value: 'smoothSolver',
    label: 'smoothSolver'
  },
  {
    value: 'diagonal',
    label: 'diagonal'
  }
];

let uSolverOptions = [
  {
    value: 'PCG',
    label: 'PCG'
  },
  {
    value: 'GAMG',
    label: 'GAMG'
  },
  {
    value: 'smoothSolver',
    label: 'smoothSolver'
  },
  {
    value: 'diagonal',
    label: 'diagonal'
  }
];

let uSmootherOptions = [
  {
    value: 'symGaussSeidel',
    label: 'symGaussSeidel'
  },
  {
    value: 'DICGaussSeidel',
    label: 'DICGaussSeidel'
  },
  {
    value: 'DIC',
    label: 'DIC'
  },
  {
    value: 'GaussSeidel',
    label: 'GaussSeidel'
  }
];
//压力预处理方法
let pPreconditionerOptions = [
  {
    value: 'FIDC',
    label: 'FIDC'
  },
  {
    value: 'diagonal',
    label: 'diagonal'
  },
  {
    value: 'DIC',
    label: 'DIC'
  }
];
//边界条件方式
let borderOptions = [
  {
    value: 'heat',
    label: '热力稳定度等级'
  }
];

let diction = {
  ['mesh']: {
    minX: '西北角X',
    minY: '西北角Y',
    maxX: '东南角X',
    maxY: '东南角Y',
    wrgHeights: '绘图区域高度',
    angles: '扇区',
    levels: '热力稳定度',
    resolutionHorizontal: '水平分辨率',
    resolutionVertical: '垂直分辨率',
    sectionCount: '扇区数',
    wrgResolution: '绘图区域步长',
    stepLength: '步长'
  },
  ['simulate']: {
    maxIterateStep: '最大迭代步数'
  },
  ['border']: {
    borderMethods: '边界条件方式',
    // borderValues: '边界值'
  },
  ['refine']: {
    xc: '加密区中心点x',
    yc: '加密区中心点y',
    diaref: '加密区直径',
    diadom: '总区域外扩距离',
    centre: '参考因素',
  },
  ['horizontal']: {
    meshlim: '网格量限制',
    resfine: '加密区网格分辨率',
    rescoarse: '粗网格分辨率',
    multizone: '是否多连通区域',
    contcrit: '是否大坡度加密'
  },
  ['slope']: {
    slopeGres: '斜坡分辨率',
    slopeRad: '斜坡分析半径',
    slopeRes: '斜坡切分半径',
    slopeNcalc: '斜坡扇区数',
    slopeAutocontour: '自动斜坡等级',
    slopeContourLimit: '斜坡最大尺寸限制'
  },
  ['vertical']: {
    dzmin: 'Z方向首层高度',
    dzcanop: '森林区网格最大尺寸',
    dzturb: '风机区网格最大尺寸',
    dztop: '整体网格最大尺寸',
    expcanop: '森林区扩展比例',
    expturb: '风机区扩展比例',
    exptop: '高层扩展比例',
    hcanop: '森林区高度',
    hturb: '风机区高度',
    htop: '整体高度'
  },
  ['smooth']: {
    nSmooth: '光滑处理循环次数',
    smoothCoef: '光滑系数',
    inSmooth: '光滑方法'
  },
  ['solver']: {
    pSolver: '压力求解器',
    uSolver: '速度求解器',
    uSmoother: '光滑方法',
    pPreconditioner: '压力预处理方法'
  },
  ['wrg']: {
    wrgExtradist: '绘图区域外延尺寸'
  },
  ['residual']: {
    p: '压力收敛残差',
    u: '速度收敛残差',
    k: 'k收敛残差',
    epsilon: 'epsilon收敛残差'
  },
  ['relaxztion']: {
    p: '压力松弛因子',
    u: '速度松弛因子',
    k: 'k松弛因子',
    epsilon: 'epsilon松弛因子'
  }

};

let projectStatus = {
  0: '未完成',
  1: '定向配置中',
  2: '定向计算中',
  3: '方案',
  4: '综合计算中',
  5: '完成'
}

let minRectLength = 2000

let errTip = {
  terrainLess: '请上传地图文件',
  roughnessLess: '请上传粗糙度文件',
  mapFileError: '地图文件解析失败，请检查文件格式!',
  markOverflow: '测风塔/机位点必须绘制在虚线矩形内部！',
  rectOverflow: '虚线圆不可超出地图范围，请更换更大的地图或重新绘制矩形加密区!',
  rectLessThanMin: '虚线矩形边长距离不能小于' + minRectLength/1000 + '公里!',
  resolutionH: '水平分辨率必须大于1小于等于50！',
  resolutionV: '垂直分辨率必须大于0.1小于等于2！',
  wtMastH: 'h 必须大于0小于1000！',
  wtMastTag: '标签名应为数字、字母、下划线、中划线、点、#的组合，且不超过10个字符！',
  roughnessGenerating: '粗糙度文件未生成完成，请稍后再试',
  sectionLess: '请选择扇区！',
  wtLess: '请设置机位点',
  mastLess: '请设置测风塔!'
}

let steadyOptions = [
  {
    label: '热稳定度等级：0-非常不稳定',
    value: -80
  }, {
    label: '热稳定度等级：1-不稳定',
    value: -500
  }, {
    label: '热稳定度等级：2-中性',
    value: 10000
  }, {
    label: '热稳定度等级：3-弱稳定',
    value: 1500
  }, {
    label: '热稳定度等级：4-弱稳定',
    value: 800
  }, {
    label: '热稳定度等级：5-稳定',
    value: 500
  }, {
    label: '热稳定度等级：6-稳定',
    value: 300
  }, {
    label: '热稳定度等级：7-稳定',
    value: 200
  }, {
    label: '热稳定度等级：8-非常稳定',
    value: 130
  }, {
    label: '热稳定度等级：9-非常稳定',
    value: 60
  }
]

export default {
  refineCenterOptions,
  refineMethodOptions,
  multiZoneOptions,
  contcritOptions,
  slopeNcalcOptions,
  smoothMethod,
  pSolverOptions,
  uSolverOptions,
  uSmootherOptions,
  pPreconditionerOptions,
  borderOptions,
  diction,
  projectStatus,
  errTip,
  minRectLength,
  steadyOptions
}

