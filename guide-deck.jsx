// Інтерактивний гайд — повноекранна колода панелей із паралаксом і безкінечним скролом.
const { useState, useEffect, useRef, useCallback, useLayoutEffect } = React;

// ── Брендована картка-посилання ──────────────────────────────────────────────
function ResourceCard({ r }) {
  return (
    <a className={"res res-" + r.kind} href={r.url} target="_blank" rel="noopener noreferrer">
      <span className="res-logo" aria-hidden="true">
        {r.kind === "logos" ? (
          <span className="res-wordmark res-wm-logos">
            <span className="res-dot" />Logos
          </span>
        ) : (
          <span className="res-wordmark res-wm-bibleby">bible<span className="res-by">.by</span></span>
        )}
      </span>
      <span className="res-text">
        <span className="res-label">{r.label}</span>
        <span className="res-host">{r.host}</span>
      </span>
      <svg className="res-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

// ── Блочна діаграма (приклад) ────────────────────────────────────────────────
function Diagram({ d }) {
  return (
    <figure className="diag">
      <figcaption className="diag-cap">
        <span className="diag-ref">{d.ref}</span>
        <span className="diag-sub">{d.caption}</span>
      </figcaption>
      <div className="diag-body">
        {d.lines.map((ln, i) => (
          <div className="diag-line" key={i} style={{ "--ind": ln.indent }}>
            <span className="diag-rail" />
            {ln.conn ? (
              <span className={"diag-conn dk-" + ln.kind}>{ln.conn}</span>
            ) : (
              <span className="diag-conn diag-conn-empty" aria-hidden="true" />
            )}
            <span className="diag-phrase">{ln.text}</span>
          </div>
        ))}
      </div>
      <div className="diag-legend">
        {d.legend.map((g) => (
          <span className={"diag-tag dk-" + g.kind} key={g.kind}>
            <span className="diag-swatch" />
            {g.label}
          </span>
        ))}
      </div>
      {d.plan && (
        <div className="diag-plan">
          <div className="diag-plan-label">Екзегетичний план</div>
          <ol className="diag-plan-list">
            {d.plan.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </div>
      )}
    </figure>
  );
}

// ── Маркований текст ─────────────────────────────────────────────────────────
function GuideText({ e, compact }) {
  return (
    <div className={"gx" + (compact ? " gx-compact" : "")}>
      {e.text && <p className="gx-text">{e.text}</p>}
      {e.key && <p className="gx-key"><mark>{e.key}</mark></p>}
      {e.bullets && (
        <div className="gx-list-wrap">
          {e.bulletsLabel && <div className="gx-list-label">{e.bulletsLabel}</div>}
          <ul className="gx-list">
            {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}
      {e.note && <p className="gx-note">{e.note}</p>}
    </div>
  );
}

// ── Картки підпунктів ────────────────────────────────────────────────────────
function SubCards({ subs }) {
  return subs.map((x) => (
    <div className="gp-sub" key={x.id}>
      <div className="gp-sub-head">
        <span className="gp-sub-l">{x.l}</span>
        <h3 className="gp-sub-title">{x.title}</h3>
      </div>
      <p className="gp-sub-text">{x.explain.text}</p>
      {x.explain.bullets && (
        <ul className="gx-list gx-list-tight">
          {x.explain.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  ));
}

// ── Одна панель гайда ────────────────────────────────────────────────────────
function GuidePanel({ slide, total }) {
  if (slide.kind === "intro") {
    return (
      <div className="gp gp-intro">
        <div className="gp-bg" aria-hidden="true">✦</div>
        <div className="gp-inner">
          <div className="gp-wide">
            <div className="gp-kicker">Вступ · {slide.intro.label}</div>
            <h2 className="gp-intro-title">{slide.intro.lead}</h2>
            <p className="gx-key gp-intro-key"><mark>{slide.intro.key}</mark></p>
            <p className="gp-intro-note">{slide.intro.note}</p>
            <div className="gp-scrollhint">Гортайте далі ↓</div>
          </div>
        </div>
      </div>
    );
  }

  const step = slide.step;
  const heavy = !!(step.sub || step.diagram);
  const subGrid = !!(step.diagram && step.sub); // діаграма праворуч, підпункти — сіткою знизу
  return (
    <div className={"gp" + (heavy ? " gp-heavy" : "")}>
      <div className="gp-bg" aria-hidden="true">{step.n}</div>
      <div className="gp-inner">
        <div className={"gp-grid" + (heavy ? " gp-grid-2" : "")}>
          <div className="gp-lead">
            <div className="gp-head">
              <span className="gp-kicker">Крок {step.n} / {total}</span>
              {step.sup && <span className="gp-sup">{step.sup}</span>}
            </div>
            <h2 className="gp-title">{step.title}</h2>
            <GuideText e={step.explain} />
            {step.resources && (
              <div className="gp-res">
                <div className="gp-res-label">Корисні ресурси</div>
                <div className="gp-res-list">
                  {step.resources.map((r) => <ResourceCard key={r.name} r={r} />)}
                </div>
              </div>
            )}
          </div>

          {heavy && (
            <div className="gp-aside">
              {step.diagram ? (
                <Diagram d={step.diagram} />
              ) : (
                step.sub && <div className="gp-subs"><SubCards subs={step.sub} /></div>
              )}
            </div>
          )}
        </div>

        {subGrid && (
          <div className="gp-subgrid"><SubCards subs={step.sub} /></div>
        )}
      </div>
    </div>
  );
}

// ── Колода з паралаксом і безкінечним скролом ────────────────────────────────
function GuideDeck({ slides, startIndex = 0, onClose }) {
  const M = slides.length;
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(startIndex);
  const jumpingRef = useRef(false);
  const rafRef = useRef(0);
  const settleRef = useRef(0);

  // Рендеримо клони з обох боків для безшовної петлі:
  // [clone(last), 0..M-1, clone(first)]
  const rendered = [slides[M - 1], ...slides, slides[0]];

  const panelH = () => (scrollerRef.current ? scrollerRef.current.clientHeight : window.innerHeight);

  // Паралакс: зсуваємо фоновий номер залежно від позиції панелі у вʼюпорті.
  const updateParallax = useCallback(() => {
    const c = scrollerRef.current;
    if (!c) return;
    const h = c.clientHeight;
    const panels = c.querySelectorAll(".gp");
    panels.forEach((p) => {
      const top = p.offsetTop - c.scrollTop; // позиція верху панелі у вʼюпорті
      const rel = top / h; // 0 коли вирівняна зверху, ±1 сусідні
      const bg = p.querySelector(".gp-bg");
      const inner = p.querySelector(".gp-inner");
      if (bg) bg.style.transform = `translate3d(0, ${(-rel * 26).toFixed(2)}%, 0)`;
      if (inner) {
        const o = Math.max(0, 1 - Math.abs(rel) * 1.15);
        inner.style.opacity = o.toFixed(3);
        inner.style.transform = `translate3d(0, ${(rel * 30).toFixed(1)}px, 0)`;
      }
    });
  }, []);

  // Перехід петлі, коли скрол зупинився на клоні.
  const handleSettle = useCallback(() => {
    const c = scrollerRef.current;
    if (!c) return;
    const h = panelH();
    const idx = Math.round(c.scrollTop / h);
    if (idx <= 0) {
      jumpingRef.current = true;
      c.scrollTop = M * h;
      jumpingRef.current = false;
    } else if (idx >= M + 1) {
      jumpingRef.current = true;
      c.scrollTop = 1 * h;
      jumpingRef.current = false;
    }
    const real = ((Math.round(c.scrollTop / h) - 1) % M + M) % M;
    setActive(real);
    updateParallax();
  }, [M, updateParallax]);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      updateParallax();
    });
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(handleSettle, 90);
  }, [handleSettle, updateParallax]);

  // Перехід до панелі (із петлею).
  const go = useCallback((dir) => {
    const c = scrollerRef.current;
    if (!c) return;
    const h = panelH();
    c.scrollBy({ top: dir * h, behavior: "smooth" });
  }, []);

  const goReal = useCallback((realIdx) => {
    const c = scrollerRef.current;
    if (!c) return;
    const h = panelH();
    c.scrollTo({ top: (realIdx + 1) * h, behavior: "smooth" });
  }, []);

  // Старт на потрібній панелі + блокування скролу сторінки.
  // rAF + повторне присвоєння, щоб подолати початковий re-snap.
  useEffect(() => {
    const c = scrollerRef.current;
    if (!c) return;
    let tries = 0;
    const place = () => {
      const h = c.clientHeight;
      if (!h && tries++ < 12) { requestAnimationFrame(place); return; }
      const target = (startIndex + 1) * h;
      const set = () => { c.style.scrollSnapType = "none"; c.scrollTop = target; c.style.scrollSnapType = ""; };
      set();
      requestAnimationFrame(() => {
        set();
        setActive(startIndex);
        updateParallax();
      });
      // Підстраховка, якщо початковий скрол перебив re-snap чи анімація.
      setTimeout(() => { if (Math.abs(c.scrollTop - target) > 4) set(); updateParallax(); }, 80);
    };
    requestAnimationFrame(place);
  }, []); // eslint-disable-line

  // Wheel: плавна навігація колесом миші з урахуванням внутрішнього скролу панелі
  useEffect(() => {
    const c = scrollerRef.current;
    if (!c) return;
    let wheelLock = false;
    const onWheel = (e) => {
      // Якщо внутрішній контент панелі скролиться — не перехоплюємо
      const inner = e.target.closest(".gp-inner");
      if (inner) {
        const atTop = inner.scrollTop <= 1;
        const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
      }
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      go(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => { wheelLock = false; }, 600);
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [go]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    const onResize = () => { handleSettle(); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [go, onClose, handleSettle]);

  return (
    <div className="guide" role="dialog" aria-modal="true" aria-label="Інтерактивний гайд">
      <div className="guide-top">
        <div className="guide-id">
          <span className="guide-id-n">{slides[active].label}</span>
          <span className="guide-id-t">{slides[active].title}</span>
        </div>
        <button type="button" className="guide-close" onClick={onClose} aria-label="Закрити гайд">
          <svg viewBox="0 0 24 24"><path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <span>Закрити</span>
        </button>
      </div>

      <nav className="guide-rail" aria-label="Кроки">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            className={"rail-dot" + (i === active ? " is-active" : "")}
            onClick={() => goReal(i)}
            aria-label={s.title}
            title={s.title}
          >
            <span className="rail-tick" />
          </button>
        ))}
      </nav>

      <div className="guide-scroller" ref={scrollerRef} onScroll={onScroll}>
        {rendered.map((slide, i) => (
          <section className="gp-wrap" key={i}>
            <GuidePanel slide={slide} total={M - 1} />
          </section>
        ))}
      </div>

      <div className="guide-nav">
        <button type="button" className="gnav" onClick={() => go(-1)} aria-label="Назад">
          <svg viewBox="0 0 24 24"><path d="M18 15 12 9 6 15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className="gnav" onClick={() => go(1)} aria-label="Далі">
          <svg viewBox="0 0 24 24"><path d="M6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

window.GuideDeck = GuideDeck;
window.GuidePanel = GuidePanel;
window.Diagram = Diagram;
window.ResourceCard = ResourceCard;
