// Конспект — головний застосунок (стиль Browserbase): hero + чек-лист + гайд-оверлей.
const { useState, useEffect, useCallback, useMemo, useRef } = React;

const STORAGE_KEY = "konspekt-exegesis-v1";

const ACCENTS = ["#EC6016", "#C9501C", "#E08A2B"];
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#EC6016",
  "scale": 100
} /*EDITMODE-END*/;

function allItemIds(data) {
  const ids = [];
  data.steps.forEach((s) => {
    ids.push(s.id);
    (s.sub || []).forEach((x) => ids.push(x.id));
  });
  return ids;
}

// Слайди гайда: вступ + кроки. Підпункти живуть усередині панелі кроку.
function buildSlides(data) {
  const slides = [
  { kind: "intro", label: "00", title: "Вступ", intro: data.intro }];

  data.steps.forEach((s) => {
    slides.push({ kind: "step", label: s.n, title: s.title, step: s });
  });
  return slides;
}

// stepId -> індекс слайда (підпункт відкриває панель свого кроку)
function buildIndexMap(data) {
  const map = {};
  data.steps.forEach((s, i) => {
    const slideIdx = i + 1; // +1 за вступ
    map[s.id] = slideIdx;
    (s.sub || []).forEach((x) => {map[x.id] = slideIdx;});
  });
  return map;
}

// ── Чекбокс ──────────────────────────────────────────────────────────────────
function Check({ checked, onToggle, size = "lg" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`chk chk-${size}` + (checked ? " is-on" : "")}
      onClick={(e) => {e.stopPropagation();onToggle();}}>
      
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5 10 17.5 19 7" fill="none" strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>);

}

// ── Рядок чек-листа (відкриває гайд) ─────────────────────────────────────────
function Row({ item, isSub, state, toggle, onOpen }) {
  const on = !!state[item.id];
  return (
    <div className={"row" + (isSub ? " row-sub" : "") + (on ? " done" : "")}>
      <Check checked={on} onToggle={() => toggle(item.id)} size={isSub ? "sm" : "lg"} />
      <button type="button" className="row-link" onClick={() => onOpen(item.id)}>
        <span className="row-mark">{isSub ? item.l : item.n}</span>
        <span className="row-title">{item.title}</span>
        {item.sup && <span className="row-sup">{item.sup}</span>}
        <span className="row-go" aria-hidden="true">↗</span>
      </button>
    </div>);

}

function App() {
  const data = window.KONSPEKT_DATA;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const slides = useMemo(() => buildSlides(data), [data]);
  const indexMap = useMemo(() => buildIndexMap(data), [data]);

  const ids = useMemo(() => allItemIds(data), [data]);
  const [state, setState] = useState(() => {
    try {return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};}
    catch (e) {return {};}
  });
  useEffect(() => {
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(state));} catch (e) {}
  }, [state]);

  const toggle = useCallback((id) => {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const reset = useCallback(() => setState({}), []);

  // Гайд-оверлей
  const [guide, setGuide] = useState(null); // null | startIndex
  const openGuide = useCallback((id) => {
    setGuide(id == null ? 0 : indexMap[id] ?? 0);
  }, [indexMap]);
  const closeGuide = useCallback(() => setGuide(null), []);

  useEffect(() => {
    document.body.style.overflow = guide !== null ? "hidden" : "";
    return () => {document.body.style.overflow = "";};
  }, [guide]);

  // Паралакс hero
  const heroBgRef = useRef(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        if (heroBgRef.current) {
          heroBgRef.current.style.transform = `translate3d(0, ${(y * 0.32).toFixed(1)}px, 0)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const done = ids.filter((id) => state[id]).length;
  const total = ids.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const rootStyle = {
    "--accent": t.accent || "#EC6016",
    "--scale": (t.scale || 100) / 100
  };

  return (
    <div className="root" style={rootStyle}>
      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-bg" ref={heroBgRef} aria-hidden="true">ΛΌΓΟΣ</div>
        <div className="hero-inner">
          <div className="eyebrow">{data.meta.eyebrow}</div>
          <h1 className="hero-title">{data.meta.title}</h1>
          <p className="hero-sub">{data.meta.subtitle}</p>
          <div className="hero-src">{data.meta.source}</div>
        </div>
      </header>

      <main className="wrap">
        {/* ── Чек-лист ── */}
        <section className="block" id="checklist">
          <div className="block-head">
            <span className="kicker">01 — Чек-лист</span>
            <h2 className="block-title">Кроки дослідження</h2>
          </div>

          <div className="progress no-print">
            <div className="progress-meta">
              <span className="progress-count">Виконано <b>{done}</b> з {total}</span>
              <button type="button" className="reset" onClick={reset}>Очистити</button>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + "%" }} />
            </div>
          </div>

          <div className="list">
            {data.steps.map((s) =>
            <div className="list-item" key={s.id}>
                <Row item={s} state={state} toggle={toggle} onOpen={openGuide} />
                {s.sub &&
              <div className="sublist">
                    {s.sub.map((x) =>
                <Row key={x.id} item={x} isSub state={state} toggle={toggle} onOpen={openGuide} />
                )}
                  </div>
              }
              </div>
            )}
          </div>
        </section>

        {/* ── Запуск гайда ── */}
        <section className="cta no-print">
          <div className="cta-inner">
            <div className="cta-kicker">02 — Інтерактивний гайд</div>
            <h2 className="cta-title">Гайд для проповідника</h2>
            <p className="cta-sub">
              Покрокові пояснення з ключовими тезами, ресурсами та прикладом блочної діаграми.
            </p>
            <button type="button" className="cta-btn" onClick={() => openGuide(null)}>
              Відкрити гайд
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </section>
      </main>

      {guide !== null &&
      <GuideDeck slides={slides} startIndex={guide} onClose={closeGuide} />
      }

      <TweaksPanel title="Tweaks">
        <TweakSection label="Акцент" />
        <TweakColor
          label="Колір"
          value={t.accent}
          options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        
        <TweakSection label="Типографіка" />
        <TweakSlider
          label="Розмір"
          value={t.scale}
          min={90}
          max={115}
          step={5}
          unit="%"
          onChange={(v) => setTweak("scale", v)} />
        
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);