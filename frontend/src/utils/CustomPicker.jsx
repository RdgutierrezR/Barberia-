import { useState, useEffect, useRef } from 'react';
import { formatHora12h, formatFechaMostrar } from './fecha';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const SLOTS = [];
for (let h = 7; h <= 23; h++) {
  for (let m = 0; m < 60; m += 30) {
    SLOTS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

export function TimePicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (open && value && listRef.current) {
      const btn = listRef.current.querySelector(`[data-value="${value}"]`);
      if (btn) btn.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [open, value]);

  return (
    <div className="cpicker cpicker-time" ref={ref}>
      {label && <label className="cpicker-label">{label}</label>}
      <button type="button" className="cpicker-trigger" onClick={() => setOpen(!open)}>
        <Clock size={16} className="cpicker-icon" />
        <span className={`cpicker-value ${!value ? 'placeholder' : ''}`}>
          {value ? formatHora12h(value) : 'Seleccionar hora'}
        </span>
        <ChevronDown size={14} className={`cpicker-arrow ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="cpicker-dropdown" ref={listRef}>
          {SLOTS.map(time => (
            <button
              key={time}
              type="button"
              data-value={time}
              className={`cpicker-option ${value === time ? 'selected' : ''}`}
              onClick={() => { onChange(time); setOpen(false); }}
            >
              {formatHora12h(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DatePicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const parsedValue = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(parsedValue ? parsedValue.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue ? parsedValue.getMonth() : new Date().getMonth());

  useClickOutside(ref, () => setOpen(false));

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const days = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day) => {
    const month = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${month}-${d}`);
    setOpen(false);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const month = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return value === `${viewYear}-${month}-${d}`;
  };

  return (
    <div className="cpicker cpicker-date" ref={ref}>
      {label && <label className="cpicker-label">{label}</label>}
      <button type="button" className="cpicker-trigger" onClick={() => setOpen(!open)}>
        <Calendar size={16} className="cpicker-icon" />
        <span className={`cpicker-value ${!value ? 'placeholder' : ''}`}>
          {value ? formatFechaMostrar(value) : 'Seleccionar fecha'}
        </span>
        <ChevronDown size={14} className={`cpicker-arrow ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="cpicker-popover">
          <div className="cpicker-popover-header">
            <button type="button" className="cpicker-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className="cpicker-popover-title">
              {months[viewMonth]} {viewYear}
            </span>
            <button type="button" className="cpicker-nav-btn" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="cpicker-weekdays">
            {days.map(d => <span key={d} className="cpicker-weekday">{d}</span>)}
          </div>
          <div className="cpicker-days">
            {Array.from({ length: firstDay }, (_, i) => (
              <span key={`e${i}`} className="cpicker-day empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <button
                  key={day}
                  type="button"
                  className={`cpicker-day ${isSelected(day) ? 'selected' : ''} ${dayStr === todayStr ? 'today' : ''}`}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function MonthPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [y, m] = value
    ? value.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  const [year, setYear] = useState(y);

  useClickOutside(ref, () => setOpen(false));

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  useEffect(() => {
    if (value) {
      const [vy] = value.split('-').map(Number);
      setYear(vy);
    }
  }, [value]);

  const prev = () => {
    let ny = year;
    let nm = m - 1;
    if (nm < 1) { nm = 12; ny--; }
    onChange(`${ny}-${String(nm).padStart(2, '0')}`);
  };

  const next = () => {
    let ny = year;
    let nm = m + 1;
    if (nm > 12) { nm = 1; ny++; }
    onChange(`${ny}-${String(nm).padStart(2, '0')}`);
  };

  const selectMonth = (month) => {
    onChange(`${year}-${String(month).padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <div className="cpicker cpicker-month" ref={ref}>
      {label && <label className="cpicker-label">{label}</label>}
      <div className="cpicker-month-nav">
        <button type="button" className="cpicker-nav-btn" onClick={prev}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" className="cpicker-month-display" onClick={() => setOpen(!open)}>
          {months[m - 1]} {year}
          <ChevronDown size={14} className={`cpicker-arrow ${open ? 'open' : ''}`} />
        </button>
        <button type="button" className="cpicker-nav-btn" onClick={next}>
          <ChevronRight size={18} />
        </button>
      </div>
      {open && (
        <div className="cpicker-popover">
          <div className="cpicker-popover-header">
            <button type="button" className="cpicker-nav-btn" onClick={() => setYear(y => y - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="cpicker-popover-title">{year}</span>
            <button type="button" className="cpicker-nav-btn" onClick={() => setYear(y => y + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="cpicker-month-grid">
            {months.map((name, i) => (
              <button
                key={i}
                type="button"
                className={`cpicker-month-opt ${m === i + 1 ? 'selected' : ''}`}
                onClick={() => selectMonth(i + 1)}
              >
                {name.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
