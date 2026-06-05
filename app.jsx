// Чек-лист екзегетичного дослідження — інтерактивний застосунок.
const { useState, useEffect, useCallback, useMemo } = React;

// ── Палітри (усі спокійні, без кричущих відтінків) ───────────────────────────
const PALETTES = {
  "wine": {
    label: "Ніч і вино",
    bg: "#F3EFE7", surface: "#FBFAF5", ink: "#1E2A44", muted: "#5C6273",
    accent: "#8C3A4A", accentSoft: "#F0E2E2", line: "#E4DDCF", checkInk: "#FBFAF5",
    swatch: ["#8C3A4A", "#1E2A44", "#F3EFE7"],
  },
  "sage": {
    label: "Камінь і шавлія",
    bg: "#EBEEEA", surface: "#F8FAF6", ink: "#24332D", muted: "#586259",
    accent: "#3E6B5E", accentSoft: "#DFEAE3", line: "#DCE2DA", checkInk: "#F8FAF6",
    swatch: ["#3E6B5E", "#24332D", "#EBEEEA"],
  },
  "ink": {
    label: "Чорнило",
    bg: "#F1F1EE", surface: "#FAFAF8", ink: "#23262B", muted: "#62656B",
    accent: "#7C6A55", accentSoft: "#E9E4DB", line: "#E2E1DB", checkInk: "#FAFAF8",
    swatch: ["#7C6A55", "#23262B", "#F1F1EE"],
  },
};

const FONTS = {
  "Manrope": '"Manrope", system-ui, sans-serif',
  "Onest": '"Onest", system-ui, sans-serif',
  "Commissioner": '"Commissioner", system-ui, sans-serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  "palette": ["#8C3A4A", "#1E2A44", "#F3EFE7"],
  "font": "Manrope",
  "scale": 100,
} /*EDITMODE-END*/;

const STORAGE_KEY = "exegesis-checklist-v1";

// ── Допоміжне: усі id, які можна відмітити ───────────────────────────────────
function allItemIds(data) {
  const ids = [];
  data.steps.forEach((s) => {
    ids.push(s.id);
    (s.sub || []).forEach((x) => ids.push(x.id));
  });
  return ids;
}

// ── Кастомний чекбокс ────────────────────────────────────────────────────────
function Check({ checked, onToggle, size = "lg" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`chk chk-${size}` + (checked ? " is-on" : "")}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5 10 17.5 19 7" fill="none" strokeWidth="2.6"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Один крок ────────────────────────────────────────────────────────────────
function Step({ step, state, toggle }) {
  const checked = !!state[step.id];
  const subDone = (step.sub || []).filter((x) => state[x.id]).length;
  return (
    <article className={"step" + (checked ? " done" : "")}>
      <div className="step-main">
        <Check checked={checked} onToggle={() => toggle(step.id)} />
        <div className="step-body">
          <h2 className="step-title">
            <span className="step-n">{step.n}</span>
            {step.title}
            {step.sup && <span className="step-sup">{step.sup}</span>}
          </h2>
          <p className="step-desc">{step.desc}</p>
        </div>
      </div>

      {step.sub && (
        <div className="sublist">
          {step.sub.map((x) => {
            const on = !!state[x.id];
            return (
              <div key={x.id} className={"sub" + (on ? " done" : "")}>
                <Check checked={on} onToggle={() => toggle(x.id)} size="sm" />
                <div className="sub-body">
                  <h3 className="sub-title">
                    <span className="sub-l">{x.l}</span>
                    {x.title}
                  </h3>
                  <p className="sub-desc">{x.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function App() {
  const data = window.CHECKLIST_DATA;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const ids = useMemo(() => allItemIds(data), [data]);
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const toggle = useCallback((id) => {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const reset = useCallback(() => setState({}), []);

  const done = ids.filter((id) => state[id]).length;
  const total = ids.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Розвʼязати поточну палітру з tweak-значення (масив swatch).
  const palKey = useMemo(() => {
    const key = JSON.stringify(t.palette);
    return (
      Object.keys(PALETTES).find((k) => JSON.stringify(PALETTES[k].swatch) === key) ||
      "wine"
    );
  }, [t.palette]);
  const P = PALETTES[palKey];
  const scale = (t.scale || 100) / 100;

  const rootStyle = {
    "--bg": P.bg, "--surface": P.surface, "--ink": P.ink, "--muted": P.muted,
    "--accent": P.accent, "--accent-soft": P.accentSoft, "--line": P.line,
    "--check-ink": P.checkInk,
    "--font": FONTS[t.font] || FONTS.Manrope,
    "--scale": scale,
  };

  return (
    <div className="root" style={rootStyle} data-pal={palKey}>
      <main className="sheet">
        <header className="masthead">
          <div className="eyebrow">{data.eyebrow}</div>
          <h1 className="title">{data.title}</h1>
          <p className="lede">{data.intro}</p>

          <div className="progress" aria-hidden={false}>
            <div className="progress-meta">
              <span className="progress-count">
                Виконано <b>{done}</b> з {total}
              </span>
              <button type="button" className="reset" onClick={reset}>
                Очистити
              </button>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + "%" }} />
            </div>
          </div>
        </header>

        <section className="steps">
          {data.steps.map((s) => (
            <Step key={s.id} step={s} state={state} toggle={toggle} />
          ))}
        </section>

        <footer className="foot">
          <span className="foot-mark" />
          <span>Екзегетичне дослідження · Новий Завіт</span>
        </footer>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Палітра" />
        <TweakColor
          label="Кольори"
          value={t.palette}
          options={Object.values(PALETTES).map((p) => p.swatch)}
          onChange={(v) => setTweak("palette", v)}
        />
        <TweakSection label="Типографіка" />
        <TweakSelect
          label="Шрифт"
          value={t.font}
          options={Object.keys(FONTS)}
          onChange={(v) => setTweak("font", v)}
        />
        <TweakSlider
          label="Розмір"
          value={t.scale}
          min={85}
          max={120}
          step={5}
          unit="%"
          onChange={(v) => setTweak("scale", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
