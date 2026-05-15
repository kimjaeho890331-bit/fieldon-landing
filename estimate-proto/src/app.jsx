/* 메인 앱 — 공종별 구조 */

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA, useRef: useRefA } = React;
const DA = window.MS_DATA;

function uid() { return Math.random().toString(36).slice(2, 9); }

/* 새 공간 생성 — 프리셋 자재 자동 활성 */
function makeSpace(preset) {
  const mats = {};
  (preset.materials || []).forEach(function(k) {
    mats[k] = defaultMaterial(k);
  });
  return {
    id: uid(),
    name: preset.type,
    icon: preset.icon,
    dims: { mode: 'wh', w: 0, l: 0, area: 0, perimeter: 0 },
    materials: mats,
  };
}

function defaultMaterial(key) {
  switch (key) {
    case 'wallpaper': return { enabled: true, type: 'silk', includeCeiling: false };
    case 'floor': {
      const brand = Object.keys(DA.FLOOR_BRANDS)[0];
      const b = DA.FLOOR_BRANDS[brand];
      const ft = Object.keys(b)[0];
      const sku = b[ft][0].sku;
      return { enabled: true, brand: brand, flooringType: ft, sku: sku, withBaseboard: true, withMolding: true };
    }
    case 'tile':  return { enabled: true, target: 'floor', size: '300x600', method: 'press', useCustom: false, customArea: 0 };
    case 'brick': return { enabled: true, area: 0, thickness: 'half' };
    case 'wood':  return { enabled: true, ceilingArea: 0, wallArea: 0, finish: 'gypsum', includePartition: false, partitionLength: 0, partitionHeight: 2.4 };
    case 'film':  return { enabled: true, area: 0 };
    default: return { enabled: true };
  }
}

const ALL_MATERIAL_KEYS = ['wallpaper', 'floor', 'tile', 'brick', 'wood', 'film'];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontScale": 1,
  "lossWallpaper": 10,
  "lossFloor": 8,
  "lossTile": 10,
  "lossBrick": 5,
  "lossWood": 5,
  "lossFilm": 15
}/*EDITMODE-END*/;

function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);

  const [ceiling, setCeiling] = useStateA(2.4);
  const [spaces, setSpaces]   = useStateA(() => [
    makeSpace(DA.SPACE_PRESETS[0]),
    makeSpace(DA.SPACE_PRESETS[1]),
  ]);
  /* 현재 선택된 공종 탭: 'spaces' | 'wallpaper' | 'floor' | ... */
  const [activeTab, setActiveTab] = useStateA('spaces');
  const [addOpen, setAddOpen]     = useStateA(false);
  const [summaryOpen, setSummaryOpen] = useStateA(false);

  const lossRates = {
    wallpaper: +t.lossWallpaper, floor: +t.lossFloor, tile: +t.lossTile,
    brick: +t.lossBrick, wood: +t.lossWood, film: +t.lossFilm,
  };

  const order = useMemoA(
    () => window.MS_CALC.aggregateOrder(spaces, ceiling, lossRates),
    [spaces, ceiling, t]
  );

  function addSpace(preset) {
    const s = makeSpace(preset);
    setSpaces(prev => [...prev, s]);
    setAddOpen(false);
  }
  function removeSpace(id) {
    setSpaces(prev => prev.filter(s => s.id !== id));
  }
  function updateSpace(id, patch) {
    setSpaces(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }
  function updateMaterial(spaceId, key, mat) {
    setSpaces(prev => prev.map(s => {
      if (s.id !== spaceId) return s;
      return { ...s, materials: { ...s.materials, [key]: mat } };
    }));
  }
  function toggleSpaceMaterial(spaceId, matKey) {
    setSpaces(prev => prev.map(s => {
      if (s.id !== spaceId) return s;
      var exists = s.materials[matKey];
      if (exists) {
        var next = { ...s.materials };
        delete next[matKey];
        return { ...s, materials: next };
      }
      /* 자재 추가 */
      var newMats = { ...s.materials, [matKey]: defaultMaterial(matKey) };
      /* 필름 추가 시 목작업 자동 연동 (각재+MDF 작업 필요) */
      if (matKey === 'film' && !newMats.wood) {
        newMats.wood = defaultMaterial('wood');
      }
      return { ...s, materials: newMats };
    }));
  }
  /* 현재 공종에 공간 일괄 추가/제거 */
  function enableAllSpaces(matKey) {
    setSpaces(prev => prev.map(s => {
      if (s.materials[matKey]) return s;
      return { ...s, materials: { ...s.materials, [matKey]: defaultMaterial(matKey) } };
    }));
  }

  /* 현재 공종 탭에서 해당 자재가 활성된 공간 수 */
  function countEnabled(matKey) {
    return spaces.filter(s => !!s.materials[matKey]).length;
  }

  return (
    <div className="app" style={{ fontSize: (t.fontScale * 100) + '%' }}>
      <header className="app__header">
        <div className="brand">
          <span style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'var(--color-primary-normal)', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-brand)',
          }}>F</span>
          <span className="title">물량산출기</span>
        </div>
        <div className="header__spacer" />
        <div className="ceiling-pill">
          <span className="ceiling-pill__label">천장 높이</span>
          <input className="ceiling-pill__input" type="number" step="0.1" min="2" max="4"
            value={ceiling}
            onChange={(e) => setCeiling(parseFloat(e.target.value) || 0)} />
          <span className="ceiling-pill__unit">m</span>
        </div>
        <div className="header__accent" />
      </header>

      {/* 좌측 레일: 공종 탭 */}
      <aside className="rail">
        <div className="rail__head">
          <span className="rail__title">공종</span>
        </div>

        {/* 공간 설정 탭 */}
        <button
          className={'trade-tab ' + (activeTab === 'spaces' ? 'active' : '')}
          onClick={() => setActiveTab('spaces')}>
          <span className="trade-tab__icon" style={{ background: 'var(--color-fill-strong)' }}>⚙</span>
          <span className="trade-tab__label">공간 설정</span>
          <span className="trade-tab__count">{spaces.length + '개'}</span>
        </button>

        <div className="rail__divider" />

        {/* 공종 탭들 */}
        {ALL_MATERIAL_KEYS.map(k => {
          const meta = DA.MATERIAL_META[k];
          const cnt = countEnabled(k);
          return (
            <button key={k}
              className={'trade-tab ' + (activeTab === k ? 'active' : '')}
              onClick={() => setActiveTab(k)}>
              <span className="trade-tab__dot" style={{ background: meta.color }} />
              <span className="trade-tab__label">{meta.label}</span>
              {cnt > 0 && <span className="trade-tab__count">{cnt + '개 공간'}</span>}
            </button>
          );
        })}
      </aside>

      {/* 중앙 콘텐츠 */}
      <main className="main">
        {activeTab === 'spaces' ? (
          <SpacesSetup
            spaces={spaces}
            ceiling={ceiling}
            onUpdate={updateSpace}
            onRemove={removeSpace}
            addOpen={addOpen}
            setAddOpen={setAddOpen}
            onAdd={addSpace}
          />
        ) : (
          <TradeView
            matKey={activeTab}
            spaces={spaces}
            ceiling={ceiling}
            lossRates={lossRates}
            onToggle={toggleSpaceMaterial}
            onMaterial={updateMaterial}
            onEnableAll={enableAllSpaces}
          />
        )}
      </main>

      <Summary
        order={order}
        spaces={spaces}
        open={summaryOpen}
        onToggle={() => setSummaryOpen(o => !o)}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="글자 크기" />
        <TweakSlider label="배율" value={t.fontScale} onChange={(v) => setT('fontScale', v)}
          min={0.9} max={1.3} step={0.05} />
        <TweakSection label="로스율 (%)" />
        <TweakSlider label="도배"      value={t.lossWallpaper} onChange={(v) => setT('lossWallpaper', v)} min={0} max={30} step={1} />
        <TweakSlider label="마루"      value={t.lossFloor}     onChange={(v) => setT('lossFloor', v)}     min={0} max={30} step={1} />
        <TweakSlider label="타일"      value={t.lossTile}      onChange={(v) => setT('lossTile', v)}      min={0} max={30} step={1} />
        <TweakSlider label="벽돌"      value={t.lossBrick}     onChange={(v) => setT('lossBrick', v)}     min={0} max={30} step={1} />
        <TweakSlider label="목작업"    value={t.lossWood}      onChange={(v) => setT('lossWood', v)}      min={0} max={30} step={1} />
        <TweakSlider label="필름"      value={t.lossFilm}      onChange={(v) => setT('lossFilm', v)}      min={0} max={40} step={1} />
      </TweaksPanel>
    </div>
  );
}

/* ─── 공간 설정 화면 ─────────────────── */
function SpacesSetup({ spaces, ceiling, onUpdate, onRemove, addOpen, setAddOpen, onAdd }) {
  const menuRef = useRefA(null);
  useEffectA(() => {
    if (!addOpen) return;
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAddOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addOpen]);

  const existing = spaces.map(s => s.name);

  return (
    <div>
      <div className="section-header">
        <h2 className="section-header__title">공간 설정</h2>
        <span className="section-header__sub">{'공간의 치수를 입력하면 공종별 탭에서 자재 수량이 자동 산출됩니다'}</span>
      </div>

      {spaces.map(s => {
        const d = window.MS_CALC.spaceDerived(s, ceiling);
        return (
          <div className="card space-setup-card" key={s.id}>
            <div className="space-setup-head">
              <span className="space-setup-head__icon">{s.icon || '🏠'}</span>
              <input className="space-setup-head__name" value={s.name}
                onChange={(e) => onUpdate(s.id, { name: e.target.value })} />
              <span className="space-setup-head__meta">
                {'바닥 ' + d.floorArea + '㎡ \xB7 벽 ' + d.wallArea + '㎡'}
              </span>
              <button className="space-setup-head__del"
                onClick={() => onRemove(s.id)}>✕</button>
            </div>
            <div className="space-setup-dims">
              <Segmented value={s.dims.mode}
                onChange={(v) => onUpdate(s.id, { dims: { ...s.dims, mode: v } })}
                options={[
                  { value: 'wh',   label: '가로×세로' },
                  { value: 'area', label: '직접입력' },
                ]} />
              {s.dims.mode === 'wh' ? (
                <div className="space-setup-fields">
                  <Field label="가로">
                    <NumberInput value={s.dims.w}
                      onChange={(v) => onUpdate(s.id, { dims: { ...s.dims, w: v } })}
                      unit="m" />
                  </Field>
                  <Field label="세로">
                    <NumberInput value={s.dims.l}
                      onChange={(v) => onUpdate(s.id, { dims: { ...s.dims, l: v } })}
                      unit="m" />
                  </Field>
                </div>
              ) : (
                <div className="space-setup-fields">
                  <Field label="면적">
                    <NumberInput value={s.dims.area}
                      onChange={(v) => onUpdate(s.id, { dims: { ...s.dims, area: v } })}
                      unit="㎡" />
                  </Field>
                  <Field label="둘레">
                    <NumberInput value={s.dims.perimeter}
                      onChange={(v) => onUpdate(s.id, { dims: { ...s.dims, perimeter: v } })}
                      unit="m" />
                  </Field>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button className="add-space" onClick={() => setAddOpen(o => !o)}>
          + 공간 추가
        </button>
        {addOpen && (
          <div className="add-menu" style={{ top: 50, left: 0, right: 0, maxWidth: 320 }}>
            {DA.SPACE_PRESETS.map(p => {
              const count = existing.filter(n => n === p.type || n.startsWith(p.type + ' ')).length;
              return (
                <button key={p.type} className="add-menu__item"
                  onClick={() => {
                    const preset = count
                      ? { ...p, type: p.type + ' ' + (count + 1) }
                      : p;
                    onAdd(preset);
                  }}>
                  <span style={{
                    width: 24, height: 24, display: 'grid', placeItems: 'center',
                    background: 'var(--color-fill-normal)', borderRadius: 6,
                  }}>{p.icon}</span>
                  <span>{p.type}{count ? ' (' + (count + 1) + ')' : ''}</span>
                </button>
              );
            })}
            <div className="add-menu__divider" />
            <button className="add-menu__item"
              onClick={() => onAdd({
                type: '공간 ' + (existing.length + 1), icon: '📐',
                materials: ['wallpaper', 'floor'],
              })}>
              <span style={{
                width: 24, height: 24, display: 'grid', placeItems: 'center',
                background: 'var(--color-fill-normal)', borderRadius: 6,
              }}>＋</span>
              <span>커스텀 공간</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 공종별 뷰 ──────────────────────── */
function TradeView({ matKey, spaces, ceiling, lossRates, onToggle, onMaterial, onEnableAll }) {
  const meta = DA.MATERIAL_META[matKey];
  const Card = window.MATERIAL_CARDS[matKey];
  const enabledSpaces = spaces.filter(s => !!s.materials[matKey]);
  const disabledSpaces = spaces.filter(s => !s.materials[matKey]);
  const loss = lossRates[matKey] || 0;

  return (
    <div>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: meta.color, display: 'inline-block' }} />
          <h2 className="section-header__title">{meta.label}</h2>
          <span className="section-header__badge">{enabledSpaces.length + ' / ' + spaces.length + '개 공간'}</span>
        </div>
        <span className="section-header__sub">{'로스율 ' + loss + '%'}</span>
      </div>

      {enabledSpaces.length === 0 && (
        <div className="empty-trade">
          <p>{'이 공종에 활성화된 공간이 없습니다.'}</p>
          {spaces.length > 0 && (
            <button className="btn-enable-all" onClick={() => onEnableAll(matKey)}>
              {'전체 공간 추가'}
            </button>
          )}
        </div>
      )}

      {/* 활성 공간별 자재 카드 */}
      {enabledSpaces.map(s => {
        var derived = window.MS_CALC.spaceDerived(s, ceiling);
        var result = window.MS_CALC.calcMaterial(matKey, s.materials[matKey], derived, loss, ceiling);
        /* 면별 면적 표시 */
        var dimsText = '바닥 ' + derived.floorArea + '㎡ \xB7 벽 ' + derived.wallArea + '㎡';
        if (derived.wallA !== null && derived.dimW > 0) {
          dimsText = dimsText + ' (가로 ' + derived.wallA + '×2 + 세로 ' + derived.wallB + '×2)';
        }
        return (
          <div className="trade-space-block" key={s.id}>
            <div className="trade-space-head">
              <span className="trade-space-head__icon">{s.icon}</span>
              <span className="trade-space-head__name">{s.name}</span>
              <span className="trade-space-head__dims">{dimsText}</span>
              <button className="trade-space-head__remove"
                onClick={() => onToggle(s.id, matKey)}
                title="이 공간에서 제거">✕</button>
            </div>
            <Card
              mat={s.materials[matKey]}
              onChange={(m) => onMaterial(s.id, matKey, m)}
              derived={derived}
              loss={loss}
              result={result}
            />
          </div>
        );
      })}

      {/* 비활성 공간들 — 클릭으로 추가 */}
      {disabledSpaces.length > 0 && (
        <div className="disabled-spaces">
          <div className="disabled-spaces__title">{'공간 추가'}</div>
          <div className="disabled-spaces__list">
            {disabledSpaces.map(s => (
              <button key={s.id} className="disabled-space-btn"
                onClick={() => onToggle(s.id, matKey)}>
                <span>{s.icon}</span>
                <span>{s.name}</span>
                <span className="disabled-space-btn__plus">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 우측 합산 패널 ─────────────────── */
function Summary({ order, spaces, open, onToggle }) {
  const empty = order.groups.length === 0 || spaces.length === 0;
  return (
    <aside className={'summary ' + (open ? 'open' : '')}>
      <div className="summary__handle" onClick={onToggle}>
        <h2 className="summary__title">발주 합산</h2>
        <span className="summary__sub">{spaces.length + '개 공간'}</span>
      </div>
      <div className="summary__head" style={{ marginTop: 0 }}>
        <h2 className="summary__title">발주 합산</h2>
        <span className="summary__sub">{spaces.length + '개 공간'}</span>
      </div>
      <div className="summary__totals">
        <div className="stat-label">총 바닥 면적</div>
        <div className="stat-val" style={{ textAlign: 'right' }}>{order.totals.floorArea}<span>㎡</span></div>
        <div className="stat-label">총 벽 면적</div>
        <div className="stat-val" style={{ textAlign: 'right' }}>{order.totals.wallArea}<span>㎡</span></div>
      </div>

      {empty ? (
        <div className="sum-empty">치수와 자재를 입력하면<br/>합산 결과가 표시됩니다.</div>
      ) : (
        order.groups.map(g => (
          <div className="sum-group" key={g.key}>
            <div className="sum-group__title">
              <span className="sum-group__dot" style={{ background: g.color }} />
              {g.label}
            </div>
            {g.lines.map((l, i) => (
              <div className="sum-row" key={i}>
                <div className="sum-row__name">{l.name}</div>
                <div className="sum-row__qty">{l.qty.toLocaleString()}<span>{l.unit}</span></div>
              </div>
            ))}
          </div>
        ))
      )}
    </aside>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
