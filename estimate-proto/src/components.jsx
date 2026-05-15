/* UI primitives shared across the app */

const { useState, useRef, useEffect } = React;

/* 숫자 입력 — 한국식: 빈값 허용, 소수점 가능 */
function NumberInput({ value, onChange, unit, placeholder, min = 0, max = 999, step = 0.1 }) {
  return (
    <div className="input-with-unit">
      <input
        type="number"
        className="input"
        value={value === 0 || value === '' ? '' : value}
        placeholder={placeholder}
        inputMode="decimal"
        min={min} max={max} step={step}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') onChange(0);
          else onChange(parseFloat(v));
        }}
        onWheel={(e) => e.currentTarget.blur()}
      />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {hint && <span className="field__hint">{'\xB7 ' + hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented">
      {options.map(o => (
        <button key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, children, ...rest }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {children}
    </select>
  );
}

function CheckboxRow({ checked, onChange, label, meta }) {
  return (
    <div className="checkbox-row">
      <input type="checkbox" className="cb" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label onClick={() => onChange(!checked)}>{label}</label>
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}

function MaterialChip({ active, color, label, onClick }) {
  return (
    <button className={'mt-chip ' + (active ? 'on' : '')} onClick={onClick}>
      <span className="mt-chip__dot" style={{ background: active ? '#fff' : color }} />
      {label}
    </button>
  );
}

/* 카드 헤더 */
function CardHead({ title, sub, color, children }) {
  return (
    <div className="card__head">
      {color && <span style={{
        width: 10, height: 10, borderRadius: 9999, background: color, display: 'inline-block',
      }} />}
      <h3>{title}</h3>
      {sub && <span className="card__sub">{sub}</span>}
      {children}
    </div>
  );
}

/* 계산결과 hint bar */
function CalcHint({ children }) {
  return <div className="calc-hint">{children}</div>;
}

/* simple lucide icon refresher hook */
function useLucide(deps = []) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, deps);
}

Object.assign(window, {
  NumberInput, Field, Segmented, Select, CheckboxRow, MaterialChip, CardHead, CalcHint, useLucide,
});
