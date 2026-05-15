/* Material cards — one per material type */

const { useMemo: useMemoM } = React;
const D = window.MS_DATA;

function fmt1(n) { return Math.round(n * 10) / 10; }

/* 산출 결과 인라인 표시 */
function ResultLines({ result }) {
  if (!result || !result.lines || result.lines.length === 0) return null;
  return (
    <div className="calc-result">
      {result.lines.map(function(l, i) {
        return (
          <div className="calc-result__row" key={i}>
            <span className="calc-result__name">{l.name}</span>
            <span className="calc-result__qty">
              <strong>{typeof l.qty === 'number' ? l.qty.toLocaleString() : l.qty}</strong>
              {' ' + l.unit}
            </span>
            {l.sub && <div className="calc-result__sub">{l.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── 도배 ─────────────────────────── */
function WallpaperCard({ mat, onChange, derived, loss, result }) {
  var types = D.WALLPAPER_TYPES;
  var areaText = '벽 ' + fmt1(derived.wallArea) + '㎡';
  if (derived.wallA !== null) {
    areaText = areaText + ' (가로 ' + fmt1(derived.wallA) + '×2 + 세로 ' + fmt1(derived.wallB) + '×2)';
  }
  if (mat.includeCeiling) areaText = areaText + ' + 천장 ' + fmt1(derived.floorArea) + '㎡';
  return (
    <div className="card">
      <CardHead title="도배" color={D.MATERIAL_META.wallpaper.color}
                sub={areaText} />
      <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Field label="벽지 종류">
          <Select value={mat.type} onChange={function(v) { onChange({ ...mat, type: v }); }}>
            {types.map(function(t) { return <option key={t.id} value={t.id}>{t.name + ' \xB7 ' + t.desc}</option>; })}
          </Select>
        </Field>
      </div>
      <div className="suboptions">
        <CheckboxRow
          checked={mat.includeCeiling}
          onChange={function(v) { onChange({ ...mat, includeCeiling: v }); }}
          label="천장 도배 포함"
          meta={mat.includeCeiling ? '+' + fmt1(derived.floorArea) + '㎡' : ''}
        />
      </div>
      <ResultLines result={result} />
    </div>
  );
}

/* ─── 마루 ─────────────────────────── */
function FloorCard({ mat, onChange, derived, loss, result }) {
  var brandKeys = Object.keys(D.FLOOR_BRANDS);
  var brand = D.FLOOR_BRANDS[mat.brand] || D.FLOOR_BRANDS[brandKeys[0]];
  var typeKeys = Object.keys(brand);
  var list = brand[mat.flooringType] || brand[typeKeys[0]];
  var skuList = list || [];

  function setBrand(v) {
    var b = D.FLOOR_BRANDS[v];
    var types = Object.keys(b);
    var ft = types.includes(mat.flooringType) ? mat.flooringType : types[0];
    var sk = (b[ft] || [])[0] ? (b[ft] || [])[0].sku : '';
    onChange({ ...mat, brand: v, flooringType: ft, sku: sk });
  }
  function setType(v) {
    var sk = (brand[v] || [])[0] ? (brand[v] || [])[0].sku : '';
    onChange({ ...mat, flooringType: v, sku: sk });
  }

  return (
    <div className="card">
      <CardHead title="마루 (바닥)" color={D.MATERIAL_META.floor.color}
                sub={'바닥 ' + fmt1(derived.floorArea) + '㎡ \xB7 둘레 ' + fmt1(derived.perimeter) + 'm'} />
      <div className="fields">
        <Field label="브랜드">
          <Select value={mat.brand} onChange={setBrand}>
            {brandKeys.map(function(b) { return <option key={b} value={b}>{b}</option>; })}
          </Select>
        </Field>
        <Field label="종류">
          <Select value={mat.flooringType} onChange={setType}>
            {typeKeys.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
          </Select>
        </Field>
        <Field label="제품">
          <Select value={mat.sku} onChange={function(v) { onChange({ ...mat, sku: v }); }}>
            {skuList.map(function(s) {
              return <option key={s.sku} value={s.sku}>{s.sku + ' \xB7 박스 ' + s.boxArea + '㎡'}</option>;
            })}
          </Select>
        </Field>
      </div>
      <div className="suboptions">
        <CheckboxRow checked={mat.withBaseboard}
          onChange={function(v) { onChange({ ...mat, withBaseboard: v }); }}
          label="걸레받이"
          meta={mat.withBaseboard ? '둘레 ' + fmt1(derived.perimeter) + 'm' : ''}
        />
        <CheckboxRow checked={mat.withMolding}
          onChange={function(v) { onChange({ ...mat, withMolding: v }); }}
          label="천장 몰딩"
          meta={mat.withMolding ? '둘레 ' + fmt1(derived.perimeter) + 'm' : ''}
        />
      </div>
      <ResultLines result={result} />
    </div>
  );
}

/* ─── 타일 ─────────────────────────── */
function TileCard({ mat, onChange, derived, loss, result }) {
  var areaInfo = '';
  if (derived.wallA !== null) {
    areaInfo = '바닥 ' + fmt1(derived.floorArea) + '㎡ · 벽 ' + fmt1(derived.wallArea) + '㎡ (가로 ' + fmt1(derived.wallA) + '×2 + 세로 ' + fmt1(derived.wallB) + '×2)';
  } else {
    areaInfo = '바닥 ' + fmt1(derived.floorArea) + '㎡ · 벽 ' + fmt1(derived.wallArea) + '㎡';
  }
  return (
    <div className="card">
      <CardHead title="타일" color={D.MATERIAL_META.tile.color} sub={areaInfo} />
      <div className="fields">
        <Field label="시공 위치">
          <Select value={mat.target} onChange={function(v) { onChange({ ...mat, target: v }); }}>
            <option value="floor">{'바닥만 (' + fmt1(derived.floorArea) + '㎡)'}</option>
            <option value="wall">{'벽만 (' + fmt1(derived.wallArea) + '㎡)'}</option>
            <option value="both">{'바닥+벽 (' + fmt1(derived.floorArea + derived.wallArea) + '㎡)'}</option>
          </Select>
        </Field>
        <Field label="타일 사이즈">
          <Select value={mat.size} onChange={function(v) { onChange({ ...mat, size: v }); }}>
            {D.TILE_SIZES.map(function(s) {
              return <option key={s.id} value={s.id}>{s.label + ' \xB7 박스 ' + s.areaPerBox + '㎡ (' + s.tilesPerBox + '장)'}</option>;
            })}
          </Select>
        </Field>
        <Field label="시공법">
          <Select value={mat.method} onChange={function(v) { onChange({ ...mat, method: v }); }}>
            {D.TILE_METHODS.map(function(tm) {
              return <option key={tm.id} value={tm.id}>{tm.name + ' \xB7 ' + tm.desc}</option>;
            })}
          </Select>
        </Field>
      </div>
      <div className="suboptions" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <CheckboxRow checked={mat.useCustom}
          onChange={function(v) { onChange({ ...mat, useCustom: v }); }}
          label="면적 직접 입력"
          meta={mat.useCustom ? '' : '자동: ' + (
            mat.target === 'floor' ? fmt1(derived.floorArea) :
            mat.target === 'wall'  ? fmt1(derived.wallArea)  :
            fmt1(derived.floorArea + derived.wallArea)) + '㎡'}
        />
        {mat.useCustom && (
          <Field label="시공 면적">
            <NumberInput value={mat.customArea || 0}
              onChange={function(v) { onChange({ ...mat, customArea: v }); }}
              unit="㎡" placeholder="0" />
          </Field>
        )}
      </div>
      <ResultLines result={result} />
    </div>
  );
}

/* ─── 벽돌·시멘트 ──────────────────── */
function BrickCard({ mat, onChange, derived, loss, result }) {
  return (
    <div className="card">
      <CardHead title="벽돌 \xB7 시멘트" color={D.MATERIAL_META.brick.color}
                sub="조적 (시멘트벽돌 + 모르타르)" />
      <div className="fields">
        <Field label="조적 면적">
          <NumberInput value={mat.area || 0}
            onChange={function(v) { onChange({ ...mat, area: v }); }}
            unit="㎡" placeholder="0" />
        </Field>
        <Field label="조적 두께">
          <Segmented value={mat.thickness}
            onChange={function(v) { onChange({ ...mat, thickness: v }); }}
            options={[
              { value: 'half', label: '0.5B (75장/㎡)' },
              { value: 'full', label: '1.0B (149장/㎡)' },
            ]} />
        </Field>
      </div>
      <ResultLines result={result} />
    </div>
  );
}

/* ─── 목작업 ───────────────────────── */
function WoodCard({ mat, onChange, derived, loss, result }) {
  return (
    <div className="card">
      <CardHead title="목작업" color={D.MATERIAL_META.wood.color}
                sub="다루기 + 마감판재 + 칸막이" />
      <div className="fields">
        <Field label="천장 작업 면적" hint="틀+마감">
          <NumberInput value={mat.ceilingArea || 0}
            onChange={function(v) { onChange({ ...mat, ceilingArea: v }); }}
            unit="㎡" />
        </Field>
        <Field label="벽 작업 면적" hint="틀+마감">
          <NumberInput value={mat.wallArea || 0}
            onChange={function(v) { onChange({ ...mat, wallArea: v }); }}
            unit="㎡" />
        </Field>
        <Field label="마감재">
          <Select value={mat.finish} onChange={function(v) { onChange({ ...mat, finish: v }); }}>
            <option value="gypsum">석고보드 9.5T</option>
            <option value="mdf">MDF 4.5T</option>
            <option value="plywood">합판 12T</option>
            <option value="none">마감재 없음</option>
          </Select>
        </Field>
      </div>
      <div className="suboptions">
        <CheckboxRow checked={mat.includePartition}
          onChange={function(v) { onChange({ ...mat, includePartition: v }); }}
          label="칸막이벽 추가 (투바이 + 양면 석고)"
        />
        {mat.includePartition && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="칸막이 길이">
              <NumberInput value={mat.partitionLength || 0}
                onChange={function(v) { onChange({ ...mat, partitionLength: v }); }}
                unit="m" />
            </Field>
            <Field label="칸막이 높이">
              <NumberInput value={mat.partitionHeight || 2.4}
                onChange={function(v) { onChange({ ...mat, partitionHeight: v }); }}
                unit="m" />
            </Field>
          </div>
        )}
      </div>
      <ResultLines result={result} />
    </div>
  );
}

/* ─── 필름 ─────────────────────────── */
function FilmCard({ mat, onChange, derived, loss, result }) {
  return (
    <div className="card">
      <CardHead title="필름" color={D.MATERIAL_META.film.color}
                sub="1m 폭 기준 (보수적) \xB7 자투리 2.4m 미만 폐기" />
      <div className="fields" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Field label="필름 시공 면적" hint="문/창틀/면판 합계">
          <NumberInput value={mat.area || 0}
            onChange={function(v) { onChange({ ...mat, area: v }); }}
            unit="㎡" />
        </Field>
      </div>
      <ResultLines result={result} />
    </div>
  );
}

const MATERIAL_CARDS = {
  wallpaper: WallpaperCard,
  floor:     FloorCard,
  tile:      TileCard,
  brick:     BrickCard,
  wood:      WoodCard,
  film:      FilmCard,
};

Object.assign(window, { MATERIAL_CARDS });
