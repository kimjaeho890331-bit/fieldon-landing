/* 산출 계산기 (window.MS_CALC) */

(function () {
  const D = window.MS_DATA;

  const ceil = (n) => Math.ceil(Math.max(0, n) - 1e-9);
  const round1 = (n) => Math.round(n * 10) / 10;
  const round2 = (n) => Math.round(n * 100) / 100;
  const withLoss = (qty, lossPct) => qty * (1 + (lossPct || 0) / 100);

  /* 한 공간의 치수에서 derived 값 계산 — 면별 면적 포함 */
  function spaceDerived(space, ceilingHeight) {
    const d = space.dims;
    let floorArea = 0, perimeter = 0, dimW = 0, dimL = 0;
    if (d.mode === 'wh') {
      dimW = +d.w || 0;
      dimL = +d.l || 0;
      floorArea = dimW * dimL;
      perimeter = 2 * (dimW + dimL);
    } else {
      floorArea = +d.area || 0;
      perimeter = +d.perimeter || 0;
    }
    var h = +ceilingHeight || 0;
    var wallArea = perimeter * h;
    return {
      floorArea: round2(floorArea),
      perimeter: round1(perimeter),
      wallArea:  round2(wallArea),
      ceilingH: h,
      dimW: dimW,
      dimL: dimL,
      /* 면별 면적 (가로×세로 모드에서만 유효) */
      wallA: d.mode === 'wh' ? round2(dimW * h) : null,
      wallB: d.mode === 'wh' ? round2(dimL * h) : null,
    };
  }

  /* 자재별 결과는 { lines: [{name, qty, unit, sub}], debug } 형식 */

  function calcWallpaper(m, derived, loss, ceilingH) {
    var type = D.WALLPAPER_TYPES.find(function(t) { return t.id === m.type; }) || D.WALLPAPER_TYPES[0];
    var h = +ceilingH || 2.4;
    var ceilingArea = m.includeCeiling ? derived.floorArea : 0;
    var totalArea = derived.wallArea + ceilingArea;

    /* 커팅 계산: 천장높이 기준 1롤에서 몇 폭 절단 가능한지 */
    var stripsPerRoll = Math.max(1, Math.floor(type.rollLength / h));
    /* 1m 폭 기준 (보수적) */
    var coveragePerRoll = stripsPerRoll * 1.0 * h;
    var rolls = ceil(withLoss(totalArea, loss) / coveragePerRoll);
    var wastePerRoll = round1(type.rollLength - (stripsPerRoll * h));

    return {
      area: totalArea,
      lines: [
        { name: type.name, qty: rolls, unit: type.unit,
          sub: '시공 ' + round1(totalArea) + '㎡ · 1롤 ' + stripsPerRoll + '폭(' + round1(h) + 'm) 자투리 ' + wastePerRoll + 'm' },
      ],
    };
  }

  function calcFloor(m, derived, loss) {
    const brand = D.FLOOR_BRANDS[m.brand];
    if (!brand) return { lines: [] };
    const list = brand[m.flooringType] || [];
    const item = list.find(s => s.sku === m.sku) || list[0];
    if (!item) return { lines: [] };
    const boxes = ceil(withLoss(derived.floorArea, loss) / item.boxArea);
    const lines = [
      { name: m.brand + ' \xB7 ' + m.flooringType + ' \xB7 ' + item.sku, qty: boxes, unit: '박스',
        sub: '1박스 ' + item.boxArea + '㎡ \xB7 시공면적 ' + round1(derived.floorArea) + '㎡' },
    ];
    if (m.withBaseboard) {
      const pcs = ceil(withLoss(derived.perimeter, loss) / D.TRIM_LENGTH_M);
      lines.push({ name: '걸레받이', qty: pcs, unit: '개',
        sub: '둘레 ' + round1(derived.perimeter) + 'm \xF7 ' + D.TRIM_LENGTH_M + 'm' });
    }
    if (m.withMolding) {
      const pcs = ceil(withLoss(derived.perimeter, loss) / D.TRIM_LENGTH_M);
      lines.push({ name: '천장 몰딩', qty: pcs, unit: '개',
        sub: '둘레 ' + round1(derived.perimeter) + 'm \xF7 ' + D.TRIM_LENGTH_M + 'm' });
    }
    return { lines };
  }

  function calcTile(m, derived, loss) {
    /* 입력: target 'floor'|'wall'|'both', wallArea/floorArea overrides 가능 */
    const size = D.TILE_SIZES.find(s => s.id === m.size) || D.TILE_SIZES[0];
    const method = D.TILE_METHODS.find(x => x.id === m.method) || D.TILE_METHODS[0];

    let area = 0;
    if (m.useCustom) area = +m.customArea || 0;
    else {
      if (m.target === 'floor') area = derived.floorArea;
      else if (m.target === 'wall') area = derived.wallArea;
      else area = derived.floorArea + derived.wallArea;
    }

    const tileArea = withLoss(area, loss);
    const boxes = ceil(tileArea / size.areaPerBox);
    const tiles = ceil(tileArea / (size.areaPerBox / size.tilesPerBox));

    const lines = [
      { name: size.label + ' 타일 \xB7 ' + method.name, qty: boxes, unit: '박스',
        sub: tiles + '장 \xB7 시공면적 ' + round1(area) + '㎡' },
    ];
    method.adhesives.forEach(a => {
      const total = area * a.kgPerM2 * (1 + loss / 100);
      const units = ceil(total / a.kgPerUnit);
      lines.push({ name: a.name, qty: units, unit: a.unit,
        sub: '1㎡당 ' + a.kgPerM2 + 'kg \xB7 1' + a.unit + ' ' + a.kgPerUnit + 'kg' });
    });
    /* 줄눈 */
    lines.push({ name: '줄눈재', qty: ceil(area * 0.4), unit: 'kg',
      sub: '1㎡당 약 0.4kg' });
    return { lines };
  }

  function calcBrick(m, derived, loss) {
    const area = +m.area || 0;
    const isFull = m.thickness === 'full';
    const perM2 = isFull ? D.BRICK.perM2_full : D.BRICK.perM2_half;
    const mortarKg = isFull ? D.BRICK.mortarKgPerM2_full : D.BRICK.mortarKgPerM2_half;
    const bricks = ceil(withLoss(area * perM2, loss));
    const mortar = ceil(withLoss(area * mortarKg, loss) / 40);  /* 시멘트 40kg 포 */
    return {
      lines: [
        { name: '시멘트벽돌 (' + (isFull ? '1.0B' : '0.5B') + ')', qty: bricks, unit: '장',
          sub: '1㎡당 ' + perM2 + '장 \xB7 면적 ' + round1(area) + '㎡' },
        { name: '조적용 모르타르', qty: mortar, unit: '포(40kg)',
          sub: '1㎡당 ' + mortarKg + 'kg' },
      ],
    };
  }

  function calcWood(m, derived, loss) {
    const lines = [];
    const ceilArea = +m.ceilingArea || 0;
    const wallArea = +m.wallArea || 0;

    /* 다루기 각재 */
    const gakPieces = ceil(
      withLoss(ceilArea * D.WOOD.gakjae_pieces_per_m2_ceiling +
               wallArea * D.WOOD.gakjae_pieces_per_m2_wall, loss)
    );
    if (gakPieces > 0) {
      const bundles = ceil(gakPieces / D.WOOD.gakjae_per_bundle);
      lines.push({ name: '다루기 각재 30×30 (2.4m)', qty: gakPieces, unit: '개',
        sub: bundles + '단 (1단=' + D.WOOD.gakjae_per_bundle + '개)' });
    }

    /* 마감재 */
    if (m.finish === 'gypsum' && (ceilArea + wallArea) > 0) {
      const sheets = ceil(withLoss(ceilArea + wallArea, loss) / D.WOOD.gypsum_area_per_sheet);
      lines.push({ name: '석고보드 9.5T (900×1800)', qty: sheets, unit: '장',
        sub: '시공면적 ' + round1(ceilArea + wallArea) + '㎡' });
    } else if (m.finish === 'mdf' && (ceilArea + wallArea) > 0) {
      const sheets = ceil(withLoss(ceilArea + wallArea, loss) / D.WOOD.mdf_area_per_sheet);
      lines.push({ name: 'MDF 4.5T (1220×2440)', qty: sheets, unit: '장',
        sub: '시공면적 ' + round1(ceilArea + wallArea) + '㎡' });
    } else if (m.finish === 'plywood' && (ceilArea + wallArea) > 0) {
      const sheets = ceil(withLoss(ceilArea + wallArea, loss) / D.WOOD.plywood_area_per_sheet);
      lines.push({ name: '합판 12T (1220×2440)', qty: sheets, unit: '장',
        sub: '시공면적 ' + round1(ceilArea + wallArea) + '㎡' });
    }

    /* 칸막이벽 */
    if (m.includePartition) {
      const pLen = +m.partitionLength || 0;
      const pH   = +m.partitionHeight || 2.4;
      const tbf  = ceil(withLoss(pLen * D.WOOD.twobyfour_per_m_partition, loss));
      const pArea = pLen * pH;
      const gyp  = ceil(withLoss(pArea * D.WOOD.partition_gypsum_layers, loss)
                        / D.WOOD.gypsum_area_per_sheet);
      lines.push({ name: '투바이 (2×4, 2.4m)', qty: tbf, unit: '개',
        sub: '칸막이 ' + round1(pLen) + 'm \xB7 스터드 400mm' });
      lines.push({ name: '석고보드 9.5T (양면)', qty: gyp, unit: '장',
        sub: '양면 시공 ' + round1(pArea * 2) + '㎡' });
    }
    return { lines };
  }

  function calcFilm(m, derived, loss) {
    var area = +m.area || 0;
    var lengthNeeded = area / D.FILM.roll_width_m;  /* 1m 폭 기준 */
    var withWaste    = lengthNeeded + D.FILM.waste_below_m;
    var rolls = ceil(withLoss(withWaste, loss) / D.FILM.roll_length_m);
    return {
      lines: [
        { name: '필름지 (1m \xD7 50m)', qty: rolls, unit: '롤',
          sub: '시공 ' + round1(area) + '㎡ · 1m폭 기준 · 자투리 ' + D.FILM.waste_below_m + 'm 미만 폐기' },
      ],
    };
  }

  const CALC_FN = {
    wallpaper: calcWallpaper,
    floor:     calcFloor,
    tile:      calcTile,
    brick:     calcBrick,
    wood:      calcWood,
    film:      calcFilm,
  };

  function calcSpace(space, ceilingHeight, lossRates) {
    var derived = spaceDerived(space, ceilingHeight);
    var result = { derived: derived, materials: {} };
    Object.entries(space.materials).forEach(function(entry) {
      var key = entry[0], mat = entry[1];
      if (!mat || !mat.enabled) return;
      var fn = CALC_FN[key];
      if (!fn) return;
      result.materials[key] = (key === 'wallpaper') ? fn(mat, derived, lossRates[key] || 0, ceilingHeight) : fn(mat, derived, lossRates[key] || 0);
    });
    return result;
  }

  /* 단일 자재 산출 — 카드별 인라인 결과용 */
  function calcMaterial(key, mat, derived, loss, ceilingH) {
    if (!mat || !mat.enabled) return { lines: [] };
    var fn = CALC_FN[key];
    if (!fn) return { lines: [] };
    return (key === 'wallpaper') ? fn(mat, derived, loss, ceilingH) : fn(mat, derived, loss);
  }

  /* 전체 발주 합산 */
  function aggregateOrder(spaces, ceilingHeight, lossRates) {
    /* 자재별로 line.name을 키로 누적 */
    const byMaterial = {};   /* { wallpaper: { 'name|unit': qty } } */
    let totalFloor = 0, totalWall = 0;

    spaces.forEach(sp => {
      const r = calcSpace(sp, ceilingHeight, lossRates);
      totalFloor += r.derived.floorArea;
      totalWall  += r.derived.wallArea;
      Object.entries(r.materials).forEach(([k, mr]) => {
        if (!byMaterial[k]) byMaterial[k] = {};
        mr.lines.forEach(line => {
          const key = line.name + '|' + line.unit;
          byMaterial[k][key] = (byMaterial[k][key] || 0) + line.qty;
        });
      });
    });

    /* 합산 결과를 정돈 */
    const groups = [];
    Object.entries(byMaterial).forEach(([mKey, items]) => {
      const meta = D.MATERIAL_META[mKey];
      const lines = Object.entries(items).map(([k, qty]) => {
        const parts = k.split('|');
        const name = parts[0];
        const unit = parts[1];
        return { name: name, unit: unit, qty: qty };
      });
      groups.push({ key: mKey, label: meta ? meta.label : mKey, color: meta ? meta.color : null, lines: lines });
    });

    return {
      groups: groups,
      totals: {
        floorArea: round1(totalFloor),
        wallArea:  round1(totalWall),
      },
    };
  }

  window.MS_CALC = { spaceDerived: spaceDerived, calcSpace: calcSpace, calcMaterial: calcMaterial, aggregateOrder: aggregateOrder };
})();
