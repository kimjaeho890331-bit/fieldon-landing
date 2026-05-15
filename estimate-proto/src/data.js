/* 물량산출기 - 자재 데이터 (window.MS_DATA) */

window.MS_DATA = {
  WALLPAPER_TYPES: [
    { id: 'silk',  name: '실크벽지',   rollLength: 15.6, rollWidth: 1.06, unit: '롤', desc: '폭 1.06m × 길이 15.6m' },
    { id: 'wide',  name: '광폭합지',   rollLength: 17.5, rollWidth: 0.93, unit: '롤', desc: '폭 0.93m × 길이 17.5m' },
    { id: 'hapji', name: '소폭합지',   rollLength: 12.5, rollWidth: 0.53, unit: '롤', desc: '폭 0.53m × 길이 12.5m' },
  ],

  FLOOR_BRANDS: {
    '동화자연마루': {
      '강마루':   [
        { sku: '클릭마루 NEW나투스', boxArea: 1.323 },
        { sku: '나투스강',            boxArea: 1.323 },
        { sku: '베이직 강마루',       boxArea: 1.323 },
      ],
      '강화마루': [
        { sku: '아우라',              boxArea: 2.398 },
        { sku: '엘에그조틱',          boxArea: 2.398 },
      ],
      '원목마루': [
        { sku: '플로링 원목마루',     boxArea: 1.700 },
      ],
    },
    '구정마루': {
      '강마루':   [
        { sku: '디아망',              boxArea: 1.196 },
        { sku: '프라하',              boxArea: 1.196 },
      ],
      '원목마루': [
        { sku: '브러쉬골드',          boxArea: 1.620 },
        { sku: '리얼우드',            boxArea: 1.620 },
      ],
    },
    'LX하우시스': {
      '강마루':   [
        { sku: '지아마루 강 베이직',  boxArea: 1.323 },
        { sku: '지아마루 강 프리미엄', boxArea: 1.323 },
      ],
      '강화마루': [
        { sku: '지아마루 강화',       boxArea: 2.398 },
      ],
    },
    '한솔홈데코': {
      '강마루':   [
        { sku: 'SB 강마루 베이직',    boxArea: 1.323 },
      ],
      '강화마루': [
        { sku: 'SB 강화마루',         boxArea: 2.398 },
      ],
    },
    '이건마루': {
      '원목마루': [
        { sku: '카라 원목마루',       boxArea: 1.660 },
      ],
      '강마루':   [
        { sku: '이건 강마루',         boxArea: 1.323 },
      ],
    },
    '노바마루': {
      '강마루':   [
        { sku: '노바 강마루 베이직',  boxArea: 1.323 },
      ],
    },
    '예건마루': {
      '강마루':   [
        { sku: '예건 강마루',         boxArea: 1.323 },
      ],
    },
  },

  /* 걸레받이 / 몰딩 1개 길이(m) */
  TRIM_LENGTH_M: 2.4,

  TILE_SIZES: [
    { id: '300x300',  label: '300×300',  tilesPerBox: 11, areaPerBox: 0.99 },
    { id: '300x600',  label: '300×600',  tilesPerBox: 5,  areaPerBox: 0.90 },
    { id: '400x800',  label: '400×800',  tilesPerBox: 3,  areaPerBox: 0.96 },
    { id: '600x600',  label: '600×600',  tilesPerBox: 4,  areaPerBox: 1.44 },
    { id: '600x1200', label: '600×1200', tilesPerBox: 2,  areaPerBox: 1.44 },
    { id: '800x800',  label: '800×800',  tilesPerBox: 2,  areaPerBox: 1.28 },
  ],

  TILE_METHODS: [
    {
      id: 'press',
      name: '압착시공',
      adhesives: [
        { name: '압착시멘트', unit: '포', kgPerUnit: 25, kgPerM2: 5 },
      ],
      desc: '벽 타일 표준',
    },
    {
      id: 'bond',
      name: '타일본드',
      adhesives: [
        { name: '타일본드',   unit: '통', kgPerUnit: 4,  kgPerM2: 2 },
      ],
      desc: '소형·인테리어 타일',
    },
    {
      id: 'mortar',
      name: '떠붙임(모르타르)',
      adhesives: [
        { name: '모르타르',   unit: '포', kgPerUnit: 40, kgPerM2: 30 },
      ],
      desc: '바닥/대형 타일',
    },
    {
      id: 'cemmortar',
      name: '시멘트몰탈',
      adhesives: [
        { name: '시멘트',     unit: '포', kgPerUnit: 40, kgPerM2: 8 },
        { name: '모래',       unit: '루베', kgPerUnit: 1500, kgPerM2: 24 },
      ],
      desc: '바닥 시공 정통식',
    },
  ],

  /* 시멘트벽돌 — 표준 190x90x57 */
  BRICK: {
    perM2_half: 75,   /* 0.5B 쌓기 */
    perM2_full: 149,  /* 1.0B 쌓기 */
    mortarKgPerM2_half: 50,
    mortarKgPerM2_full: 100,
  },

  /* 목작업 자재 단위 */
  WOOD: {
    /* 다루기각재 30x30 — 1단(50개) 단위. 표준 길이 2.4m */
    gakjae_pieces_per_m2_ceiling: 3.0,   /* 천장틀 m2당 다루기 개수(2.4m 기준) */
    gakjae_pieces_per_m2_wall:    2.6,   /* 벽틀 m2당 */
    gakjae_per_bundle: 50,
    /* 석고보드 9.5T — 900x1800 */
    gypsum_area_per_sheet: 1.62,
    /* MDF 4.5T — 1220x2440 */
    mdf_area_per_sheet: 2.978,
    /* 합판 12T — 1220x2440 */
    plywood_area_per_sheet: 2.978,
    /* 칸막이 투바이(2"x4") — 길이 2.4m, 스터드 400mm 간격 */
    twobyfour_per_m_partition: 2.7,   /* 벽 길이 1m당 투바이 개수(상하 + 스터드) */
    /* 양면 석고 */
    partition_gypsum_layers: 2,
  },

  /* 필름 — 보수적 1m 폭 기준 계산 (실제 1.22m) */
  FILM: {
    roll_area: 50,         /* m2 / 롤 (1.0m × 50m) */
    roll_width_m: 1.0,
    roll_length_m: 50,
    waste_below_m: 2.4,    /* 자투리 2.4m 미만 폐기 */
  },

  /* 기본 로스율 (%) — 회사별 수정 가능 */
  LOSS_DEFAULTS: {
    wallpaper: 10,
    floor:      8,
    tile:      10,
    brick:      5,
    wood:       5,
    film:      15,
  },

  /* 공간 프리셋 */
  SPACE_PRESETS: [
    { type: '거실',     icon: '🛋', materials: ['wallpaper', 'floor'] },
    { type: '안방',     icon: '🛏', materials: ['wallpaper', 'floor'] },
    { type: '작은방',   icon: '🚪', materials: ['wallpaper', 'floor'] },
    { type: '서재',     icon: '📚', materials: ['wallpaper', 'floor'] },
    { type: '드레스룸', icon: '👗', materials: ['wallpaper', 'floor'] },
    { type: '주방',     icon: '🍳', materials: ['wallpaper', 'tile'] },
    { type: '욕실',     icon: '🛁', materials: ['tile', 'brick'] },
    { type: '현관',     icon: '🚪', materials: ['tile', 'film'] },
    { type: '베란다',   icon: '🪟', materials: ['tile'] },
    { type: '팬트리',   icon: '📦', materials: ['wallpaper'] },
  ],

  MATERIAL_META: {
    wallpaper: { label: '도배',          color: '#0066ff' },
    floor:     { label: '마루',          color: '#d96b00' },
    tile:      { label: '타일',          color: '#0098b2' },
    brick:     { label: '벽돌\xB7시멘트',   color: '#46474f' },
    wood:      { label: '목작업',        color: '#7a3ed1' },
    film:      { label: '필름',          color: '#d63a87' },
  },
};
