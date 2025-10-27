import { Country, Facility, UnitType, UnitSize, User, FormEntry } from '@/types/facility';

export const countries: Country[] = [
  { id: '1', name: 'Singapore', code: 'SG' },
  { id: '2', name: 'Malaysia', code: 'MY' },
  { id: '3', name: 'Korea', code: 'KR' },
  { id: '4', name: 'Hong Kong', code: 'HK' },
];

// Multilingual translations
export const facilityTranslations: Record<string, { ko?: string; zh?: string; ms?: string }> = {
  // Korea facilities
  '17': { ko: '압구정' },
  '18': { ko: '반포' },
  '19': { ko: '분당' },
  '20': { ko: '가산' },
  '21': { ko: '양재' },
  '22': { ko: '영등포' },
  '23': { ko: '용산' },

  // Malaysia facilities
  '13': { zh: '陈秀莲', ms: 'Chan Sow Lin' },
  '14': { zh: '哥打白沙罗', ms: 'Kota Damansara' },
  '15': { zh: '第51A区', ms: 'Seksyen 51A' },
  '16': { zh: '士甘末', ms: 'Segambut' },
};

export const unitTypeTranslations: Record<string, { ko: string; zh: string; ms: string }> = {
  'Aircon': { ko: '에어컨', zh: '空调', ms: 'Berhawa Dingin' },
  'Non-aircon': { ko: '비에어컨', zh: '非空调', ms: 'Tidak Berhawa Dingin' },
  'Non Aircon': { ko: '비에어컨', zh: '非空调', ms: 'Tidak Berhawa Dingin' },
  'Premium': { ko: '프리미엄', zh: '高级', ms: 'Premium' },
  'Executive Storage': { ko: '이그제큐티브 스토리지', zh: '行政储存', ms: 'Stor Eksekutif' },
  'Wine Storage': { ko: '와인 저장고', zh: '葡萄酒储存', ms: 'Stor Wain' },
  'Drive Up': { ko: '드라이브 업', zh: '免下车', ms: 'Pandu Naik' },
};

export const unitSizeTranslations: Record<string, { ko: string; zh: string; ms: string }> = {
  'Extra Small': { ko: '아주 작은', zh: '特小', ms: 'Sangat Kecil' },
  'Small': { ko: '작은', zh: '小', ms: 'Kecil' },
  'Medium': { ko: '중간', zh: '中', ms: 'Sederhana' },
  'Large': { ko: '큰', zh: '大', ms: 'Besar' },
  'Extra Large': { ko: '아주 큰', zh: '特大', ms: 'Sangat Besar' },
};

export const promotionTranslations: Record<string, { ko?: string; zh?: string; ms?: string }> = {
  'New Year Special': { ko: '신년 특별 행사', zh: '新年特惠', ms: 'Istimewa Tahun Baru' },
  'Summer Sale': { ko: '여름 세일', zh: '夏季促销', ms: 'Jualan Musim Panas' },
  'Spring Discount': { ko: '봄 할인', zh: '春季折扣', ms: 'Diskaun Musim Bunga' },
};

export const facilities: Facility[] = [
  // Singapore
  { id: '1', name: 'Ang Mo Kio', locationCode: 'AMK', countryId: '1' },
  { id: '2', name: 'Boon Keng', locationCode: 'BK', countryId: '1' },
  { id: '3', name: 'Commonwealth', locationCode: 'CW', countryId: '1' },
  { id: '4', name: 'Eunos Link', locationCode: 'EL', countryId: '1' },
  { id: '5', name: 'Hillview', locationCode: 'HV', countryId: '1' },
  { id: '6', name: 'IMM', locationCode: 'IMM', countryId: '1' },
  { id: '7', name: 'Kallang Way', locationCode: 'KW', countryId: '1' },
  { id: '8', name: 'Marymount', locationCode: 'MM', countryId: '1' },
  { id: '9', name: 'Tai Seng', locationCode: 'TS', countryId: '1' },
  { id: '10', name: 'Toa Payoh', locationCode: 'TP', countryId: '1' },
  { id: '11', name: 'West Coast', locationCode: 'WC', countryId: '1' },
  { id: '12', name: 'Woodlands', locationCode: 'WL', countryId: '1' },

  // Malaysia
  { id: '13', name: 'Chan Sow Lin', locationCode: 'CSL', countryId: '2' },
  { id: '14', name: 'Kota Damansara', locationCode: 'KD', countryId: '2' },
  { id: '15', name: 'Section 51A', locationCode: 'S51A', countryId: '2' },
  { id: '16', name: 'Segambut', locationCode: 'SEG', countryId: '2' },

  // Korea
  { id: '17', name: 'Apgujeong', locationCode: 'APG', countryId: '3' },
  { id: '18', name: 'Banpo', locationCode: 'BP', countryId: '3' },
  { id: '19', name: 'Bundang', locationCode: 'BD', countryId: '3' },
  { id: '20', name: 'Gasan', locationCode: 'GS', countryId: '3' },
  { id: '21', name: 'Yangjae', locationCode: 'YJ', countryId: '3' },
  { id: '22', name: 'Yeongdeungpo', locationCode: 'YDP', countryId: '3' },
  { id: '23', name: 'Yongsan', locationCode: 'YS', countryId: '3' },

  // Hong Kong
  { id: '24', name: 'Sai Wan', locationCode: 'SW', countryId: '4' },
  { id: '25', name: 'Hung Hom', locationCode: 'HH', countryId: '4' },
];

export const unitTypes: UnitType[] = [
  // Singapore unit types
  { id: '1', name: 'Aircon', facilityId: '1' },
  { id: '2', name: 'Non-aircon', facilityId: '1' },
  { id: '3', name: 'Premium', facilityId: '1' },
  { id: '4', name: 'Executive Storage', facilityId: '1' },
  { id: '5', name: 'Wine Storage', facilityId: '1' },
  { id: '6', name: 'Drive Up', facilityId: '1' },

  // Tai Seng specific
  { id: '7', name: 'Aircon', facilityId: '9' },
  { id: '8', name: 'Non Aircon', facilityId: '9' },

  // Malaysia unit types
  { id: '9', name: 'Aircon', facilityId: '13' },
  { id: '10', name: 'Non-aircon', facilityId: '13' },
  { id: '11', name: 'Wine Storage', facilityId: '13' },
  { id: '12', name: 'Drive Up', facilityId: '13' },

  // Korea unit types
  { id: '13', name: 'Aircon', facilityId: '17' },

  // Hong Kong unit types
  { id: '14', name: 'Aircon', facilityId: '24' },
  { id: '15', name: 'Non-aircon', facilityId: '24' },
];

export const unitSizes: UnitSize[] = [
  // Singapore - Ang Mo Kio Aircon
  { id: '1', name: 'Extra Small', unitTypeId: '1' },
  { id: '2', name: 'Small', unitTypeId: '1' },
  { id: '3', name: 'Medium', unitTypeId: '1' },
  { id: '4', name: 'Large', unitTypeId: '1' },
  { id: '5', name: 'Extra Large', unitTypeId: '1' },

  // Singapore - Wine Storage
  { id: '6', name: 'Extra Small', unitTypeId: '5' },
  { id: '7', name: 'Small', unitTypeId: '5' },

  // Singapore - Tai Seng Aircon
  { id: '8', name: 'Extra Small', unitTypeId: '7' },
  { id: '9', name: 'Small', unitTypeId: '7' },
  { id: '10', name: 'Medium', unitTypeId: '7' },

  // Singapore - Tai Seng Non Aircon
  { id: '11', name: 'Extra Small', unitTypeId: '8' },
  { id: '12', name: 'Small', unitTypeId: '8' },
  { id: '13', name: 'Medium', unitTypeId: '8' },

  // Malaysia - Chan Sow Lin Aircon
  { id: '14', name: 'Small', unitTypeId: '9' },
  { id: '15', name: 'Medium', unitTypeId: '9' },
  { id: '16', name: 'Large', unitTypeId: '9' },

  // Malaysia - Chan Sow Lin Non-aircon
  { id: '17', name: 'Small', unitTypeId: '10' },
  { id: '18', name: 'Medium', unitTypeId: '10' },

  // Malaysia - Chan Sow Lin Wine Storage
  { id: '19', name: 'Small', unitTypeId: '11' },

  // Malaysia - Chan Sow Lin Drive Up
  { id: '20', name: 'Large', unitTypeId: '12' },
  { id: '21', name: 'Extra Large', unitTypeId: '12' },

  // Korea - Apgujeong Aircon
  { id: '22', name: 'Small', unitTypeId: '13' },
  { id: '23', name: 'Medium', unitTypeId: '13' },
  { id: '24', name: 'Large', unitTypeId: '13' },
];

export const users: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@admin.com',
    phone: '+65 8888 8888',
    role: 'superadmin',
    countries: ['1', '2', '3', '4'],
    facilities: [],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Operations',
    email: 'jane@operations.com',
    phone: '+65 9999 9999',
    role: 'operations',
    countries: ['1'],
    facilities: ['1', '9'],
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bob Marketing',
    email: 'bob@marketing.com',
    phone: '+65 7777 7777',
    role: 'marketing',
    countries: ['1', '2'],
    facilities: ['1', '2', '13'],
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const formEntries: FormEntry[] = [
  {
    id: '1',
    formId: '12345678',
    facility: 'Ang Mo Kio',
    unitType: 'Aircon',
    unitSize: 'Medium',
    duration: '6 months',
    name: 'Alice Customer',
    email: 'alice@customer.com',
    contact: '+65 8888 1111',
    promoCodes: ['SAVE10'],
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'quoted',
    quotedAmount: 250,
    unitsAvailable: 5,
    pricePerUnit: 250,
    moveInFee: 50
  },
  {
    id: '2',
    formId: '87654321',
    facility: 'Tai Seng',
    unitType: 'Non Aircon',
    unitSize: 'Small',
    duration: '12 months',
    name: 'Bob Customer',
    email: 'bob@customer.com',
    contact: '+65 9999 2222',
    promoCodes: [],
    submittedAt: '2024-01-20T14:15:00Z',
    status: 'processing',
    unitsAvailable: 3,
    pricePerUnit: 180,
    moveInFee: 30
  }
];
