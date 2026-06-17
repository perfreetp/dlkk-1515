import type { City, Store } from '@/types';

export const mockCities: City[] = [
  {
    id: 'shanghai',
    name: '上海',
    districts: [
      { id: 'jingan', name: '静安区', popularity: 95 },
      { id: 'pudong', name: '浦东新区', popularity: 92 },
      { id: 'xuhui', name: '徐汇区', popularity: 88 },
      { id: 'huangpu', name: '黄浦区', popularity: 85 },
      { id: 'changning', name: '长宁区', popularity: 78 },
      { id: 'putuo', name: '普陀区', popularity: 70 },
      { id: 'baoshan', name: '宝山区', popularity: 65 },
    ],
  },
  {
    id: 'beijing',
    name: '北京',
    districts: [
      { id: 'chaoyang', name: '朝阳区', popularity: 95 },
      { id: 'haidian', name: '海淀区', popularity: 90 },
      { id: 'xicheng', name: '西城区', popularity: 82 },
      { id: 'dongcheng', name: '东城区', popularity: 78 },
      { id: 'fengtai', name: '丰台区', popularity: 70 },
    ],
  },
  {
    id: 'shenzhen',
    name: '深圳',
    districts: [
      { id: 'nanshan', name: '南山区', popularity: 92 },
      { id: 'futian', name: '福田区', popularity: 90 },
      { id: 'luohu', name: '罗湖区', popularity: 82 },
      { id: 'baoan', name: '宝安区', popularity: 75 },
    ],
  },
  {
    id: 'guangzhou',
    name: '广州',
    districts: [
      { id: 'tianhe', name: '天河区', popularity: 93 },
      { id: 'yuexiu', name: '越秀区', popularity: 85 },
      { id: 'haizhu', name: '海珠区', popularity: 78 },
      { id: 'liwan', name: '荔湾区', popularity: 70 },
    ],
  },
  {
    id: 'hangzhou',
    name: '杭州',
    districts: [
      { id: 'xihu', name: '西湖区', popularity: 90 },
      { id: 'yuhang', name: '余杭区', popularity: 82 },
      { id: 'binjiang', name: '滨江区', popularity: 80 },
      { id: 'xiacheng', name: '下城区', popularity: 75 },
    ],
  },
  {
    id: 'chengdu',
    name: '成都',
    districts: [
      { id: 'jinjiang', name: '锦江区', popularity: 88 },
      { id: 'wuhou', name: '武侯区', popularity: 85 },
      { id: 'qingyang', name: '青羊区', popularity: 78 },
      { id: 'gaoxin', name: '高新区', popularity: 82 },
    ],
  },
];

export const mockStores: Store[] = [
  { id: 'store1', name: '泡泡玛特 静安大悦城店', address: '西藏北路166号大悦城L3-12', district: '静安区', city: '上海' },
  { id: 'store2', name: '泡泡玛特 陆家嘴中心店', address: '浦东南路889号陆家嘴中心L2-08', district: '浦东新区', city: '上海' },
  { id: 'store3', name: '泡泡玛特 徐家汇店', address: '虹桥路1号港汇恒隆广场B1', district: '徐汇区', city: '上海' },
  { id: 'store4', name: '泡泡玛特 南京东路店', address: '南京东路300号恒基名人购物中心L1', district: '黄浦区', city: '上海' },
  { id: 'store5', name: '泡泡玛特 中山公园店', address: '长宁路1018号龙之梦购物中心L2', district: '长宁区', city: '上海' },
  { id: 'store6', name: '泡泡玛特 三里屯店', address: '三里屯路19号三里屯太古里南区', district: '朝阳区', city: '北京' },
  { id: 'store7', name: '泡泡玛特 国贸店', address: '建国门外大街1号国贸商城B2', district: '朝阳区', city: '北京' },
  { id: 'store8', name: '泡泡玛特 万象城店', address: '深南大道9668号万象城B1', district: '南山区', city: '深圳' },
];
