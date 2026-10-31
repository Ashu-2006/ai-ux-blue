import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { Bell, Check, Download, Loader2, Moon, Search, Settings, Share2, Sun, Trash2, X } from 'lucide-react';
import { Dot, EASE, Row, Segmented, Specimen, Window, useMotion } from './kit';

// Design engineering · Craft · Motion, Craft · Visual, Practice. One specimen per lesson.

type Bez = [number, number, number, number];

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="t-caption t-mono shrink-0 whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}>{children}</span>;
}

function Pill({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="t-sm rounded-[var(--r-pill)] px-3 py-1.5 text-ink-3 hover:text-ink" style={{ background: 'var(--surface-2)' }}>
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  shown,
  verdict,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  shown?: string;
  verdict?: React.ReactNode;
  onChange: (v: number) => void;
  onCommit?: () => void;
}) {
  return (
    <div className="flex w-full max-w-[520px] items-center gap-3 px-2">
      <span className="t-sm t-mono shrink-0 text-ink-3" style={{ letterSpacing: 0 }}>{label}</span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="min-w-0 flex-1"
        style={{ accentColor: 'var(--accent)' }}
      />
      <span className="t-sm t-mono w-[56px] shrink-0 text-right text-ink" style={{ letterSpacing: 0 }}>{shown ?? `${value}${unit}`}</span>
      {verdict !== undefined && <span className="t-sm w-[150px] shrink-0 text-ink-2">{verdict}</span>}
    </div>
  );
}

function bezier([x1, y1, x2, y2]: Bez) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 40; i++) {
      t = (lo + hi) / 2;
      if (sx(t) < x) lo = t; else hi = t;
    }
    return sy(t);
  };
}

const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
type RGB = [number, number, number];

function oklabL([r, g, b]: RGB) {
  const R = toLin(r), G = toLin(g), B = toLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

function oklchToRgb(L: number, C: number, h: number): RGB {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((x) => clamp01(toGam(clamp01(x)))) as RGB;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

const rgbCss = (c: RGB) => `rgb(${c.map((x) => Math.round(x * 255)).join(' ')})`;
const luminance = ([r, g, b]: RGB) => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ── DE.CM.01 · motion tokens ────────────────────────────────────────────────
const MT_ROWS: { name: string; ms: number; ease: Bez; raw: string; token: 'fast' | 'base' | 'slow' }[] = [
  { name: 'Modal', ms: 250, ease: [0.4, 0, 0.2, 1], raw: '250ms (.4,0,.2,1)', token: 'base' },
  { name: 'Drawer', ms: 300, ease: [0.32, 0.72, 0, 1], raw: '300ms (.32,.72,0,1)', token: 'slow' },
  { name: 'Toast', ms: 180, ease: [0.25, 0.1, 0.25, 1], raw: '180ms ease', token: 'fast' },
  { name: 'Popover', ms: 220, ease: [0.2, 0.8, 0.2, 1], raw: '220ms (.2,.8,.2,1)', token: 'fast' },
  { name: 'Tooltip', ms: 320, ease: [0, 0, 0.58, 1], raw: '320ms ease-out', token: 'fast' },
];
const LADDER = { fast: 150, base: 240, slow: 300 };

export function MotionTokensSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<'adhoc' | 'token'>('adhoc');
  const [run, setRun] = useState(0);
  const rows = MT_ROWS.map((r) =>
    mode === 'adhoc'
      ? { ...r, label: r.raw }
      : { ...r, ms: LADDER[r.token], ease: [...EASE] as Bez, label: `--motion-${r.token}` },
  );
  const durations = [...new Set(rows.map((r) => r.ms))].sort((a, b) => a - b);
  const curves = new Set(rows.map((r) => r.ease.join(',')));

  return (
    <Specimen
      height={280}
      readout={<>durations in use: {durations.length} ({durations.join(', ')}ms) · curves in use: {curves.size}</>}
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => { setMode(m); setRun((n) => n + 1); }} options={[{ value: 'adhoc', label: 'Inline values' }, { value: 'token', label: 'Token ladder' }]} />
          <Pill onClick={() => setRun((n) => n + 1)}>Replay</Pill>
        </div>
      }
    >
      <Window width={470}>
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
            <span className="t-sm w-14 shrink-0 text-ink">{r.name}</span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
              <motion.div
                key={`${run}-${r.name}`}
                className="h-full rounded-full"
                style={{ background: 'var(--ink-2)', transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : r.ms / 1000, ease: r.ease }}
              />
            </div>
            <span className="t-caption t-mono w-[150px] shrink-0 truncate text-ink-3" style={{ letterSpacing: 0 }}>{r.label}</span>
          </div>
        ))}
      </Window>
    </Specimen>
  );
}

// ── DE.CM.02 · perceived performance ────────────────────────────────────────
const LATENCY = { steady: [300, 300, 300, 300, 300, 300, 300, 300], split: [80, 520, 80, 520, 80, 520, 80, 520] };
const BANDS: { label: string; tone: 'good' | 'warn' | 'bad' }[] = [
  { label: 'under 100ms', tone: 'good' },
  { label: '100 to 300', tone: 'good' },
  { label: '300 to 1000', tone: 'warn' },
  { label: 'over 1000', tone: 'bad' },
];
const bandOf = (ms: number) => (ms < 100 ? 0 : ms <= 300 ? 1 : ms <= 1000 ? 2 : 3);

export function PerceivedPerformanceSpecimen() {
  const [mode, setMode] = useState<'steady' | 'split'>('steady');
  const [taps, setTaps] = useState<number[]>([]);
  const [pending, setPending] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = (m = mode) => { window.clearTimeout(timer.current); setMode(m); setTaps([]); setPending(false); };
  const save = () => {
    if (pending || taps.length >= 8) return;
    const ms = LATENCY[mode][taps.length];
    setPending(true);
    timer.current = window.setTimeout(() => { setTaps((t) => [...t, ms]); setPending(false); }, ms);
  };

  const n = taps.length;
  const mean = n ? Math.round(taps.reduce((a, b) => a + b, 0) / n) : 0;
  const p75 = n ? [...taps].sort((a, b) => a - b)[Math.ceil(0.75 * n) - 1] : 0;
  const counts = BANDS.map((_, i) => taps.filter((ms) => bandOf(ms) === i).length);

  return (
    <Specimen
      height={290}
      readout={n ? <>taps {n}/8 · mean {mean}ms · p75 {p75}ms · last {taps[n - 1]}ms</> : 'Press Save eight times'}
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => reset(m)} options={[{ value: 'steady', label: 'Every tap 300ms' }, { value: 'split', label: '80ms or 520ms' }]} />
          <Pill onClick={() => reset()}>Reset</Pill>
        </div>
      }
    >
      <Window width={400}>
        <div className="flex items-center gap-2 p-3" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
          <div className="t-sm flex-1 rounded-[var(--r-sm)] px-2.5 py-1.5 text-ink" style={{ background: 'var(--surface-2)' }}>Q4 roadmap</div>
          <button
            onClick={save}
            disabled={n >= 8}
            className="t-sm flex w-[84px] items-center justify-center gap-1.5 rounded-[var(--r-pill)] py-1.5 font-medium disabled:opacity-50"
            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : n ? <><Check size={14} /> Saved</> : 'Save'}
          </button>
        </div>
        <div className="flex items-end gap-3 px-4 pb-3 pt-4">
          {BANDS.map((b, i) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="t-sm t-mono text-ink" style={{ letterSpacing: 0 }}>{counts[i]}</span>
              <div className="flex h-[96px] w-full items-end justify-center rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }}>
                <motion.div
                  className="w-full rounded-[var(--r-sm)]"
                  style={{ background: b.tone === 'good' ? 'var(--pattern)' : b.tone === 'warn' ? 'var(--invisible)' : 'var(--anti)' }}
                  animate={{ height: `${(counts[i] / 8) * 100}%` }}
                  transition={{ duration: 0.2, ease: EASE }}
                />
              </div>
              <span className="t-caption whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}><Dot tone={b.tone} /> {b.label}</span>
            </div>
          ))}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CM.03 · spring vs tween ──────────────────────────────────────────────
export function SpringTweenSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<'tween' | 'spring'>('tween');
  const [result, setResult] = useState<{ release: number; handoff: number; dismissed: boolean } | null>(null);
  const y = useMotionValue(0);
  const ctrl = useRef<AnimationPlaybackControls | null>(null);
  const raf = useRef(0);
  useEffect(() => () => { ctrl.current?.stop(); cancelAnimationFrame(raf.current); }, []);

  const reset = (m = mode) => { ctrl.current?.stop(); cancelAnimationFrame(raf.current); y.set(0); setMode(m); setResult(null); };

  const release = (v: number) => {
    const target = y.get() > 70 || v > 500 ? 240 : 0;
    ctrl.current?.stop();
    if (reduce) { y.set(target); setResult({ release: v, handoff: 0, dismissed: target > 0 }); return; }
    ctrl.current = animate(
      y,
      target,
      mode === 'tween'
        ? { type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        : { type: 'spring', stiffness: 380, damping: 36, velocity: v },
    );
    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => setResult({ release: v, handoff: y.getVelocity(), dismissed: target > 0 }));
    });
  };

  return (
    <Specimen
      height={300}
      readout={
        result
          ? <>release {Math.round(result.release)}px/s · first frames {Math.round(result.handoff)}px/s · {result.dismissed ? 'dismissed' : 'snapped back'}</>
          : 'Drag the sheet down and let go, once slowly, once with a flick'
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => reset(m)} options={[{ value: 'tween', label: 'Tween 300ms' }, { value: 'spring', label: 'Spring' }]} />
          <Pill onClick={() => reset()}>Reset</Pill>
        </div>
      }
    >
      <Window width={340} height={250}>
        {['Ship CSV export', 'Fix login redirect', 'Audit dark mode', 'Review PR #418'].map((s) => (
          <Row key={s}><span className="text-ink-3">{s}</span></Row>
        ))}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.04}
          dragMomentum={false}
          onDragStart={() => ctrl.current?.stop()}
          onDragEnd={(_, info) => release(info.velocity.y)}
          style={{ y, background: 'var(--surface)', boxShadow: 'var(--shadow-sheet)', touchAction: 'none' }}
          className="absolute inset-x-0 bottom-0 h-[150px] cursor-grab rounded-t-[var(--r-lg)] px-4 pt-2 active:cursor-grabbing"
        >
          <div className="mx-auto mb-3 h-1 w-9 rounded-full" style={{ background: 'var(--hairline)' }} />
          <div className="t-sm font-medium text-ink">Share Q4 roadmap</div>
          <div className="mt-2 h-1.5 w-4/5 rounded-full" style={{ background: 'var(--surface-2)' }} />
          <div className="mt-1.5 h-1.5 w-3/5 rounded-full" style={{ background: 'var(--surface-2)' }} />
        </motion.div>
      </Window>
    </Specimen>
  );
}

// ── DE.CM.04 · motion for state ─────────────────────────────────────────────
const CHANNELS = {
  busy: [
    { name: 'color', delay: 0, dur: 300 },
    { name: 'scale', delay: 0, dur: 450 },
    { name: 'lift', delay: 0, dur: 450 },
    { name: 'stroke', delay: 150, dur: 300 },
  ],
  honest: [{ name: 'stroke', delay: 0, dur: 180 }],
};

function StateCheck({ busy, label, onToggle }: { busy: boolean; label: string; onToggle: () => void }) {
  const { reduce } = useMotion();
  const [on, setOn] = useState(false);
  const stroke = (busy ? CHANNELS.busy[3] : CHANNELS.honest[0]);
  const k = reduce ? 0 : 1;
  return (
    <button
      onClick={() => { setOn((v) => !v); onToggle(); }}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left t-sm"
      style={{ borderBottom: '0.5px solid var(--hairline-2)' }}
    >
      <motion.span
        aria-hidden
        className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px]"
        animate={busy && on ? { scale: [1, 1.3, 0.9, 1], y: [0, -6, 0, 0] } : { scale: 1, y: 0 }}
        transition={{ duration: 0.45 * k, ease: EASE }}
        style={{
          background: on ? 'var(--ink)' : 'transparent',
          border: `1px solid ${on ? 'var(--ink)' : 'var(--hairline)'}`,
          transition: busy && !reduce ? 'background-color 300ms, border-color 300ms' : 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <motion.path
            d="M5 10.5l3.2 3.2L15 7"
            stroke="var(--bg)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: on ? 1 : 0 }}
            transition={{ duration: (stroke.dur / 1000) * k, delay: on ? (stroke.delay / 1000) * k : 0, ease: EASE }}
          />
        </svg>
      </motion.span>
      <span className={on ? 'text-ink-3' : 'text-ink'}>{label}</span>
    </button>
  );
}

export function MotionForStateSpecimen() {
  const [mode, setMode] = useState<'busy' | 'honest'>('busy');
  const [toggles, setToggles] = useState(0);
  const ch = CHANNELS[mode];
  const settle = Math.max(...ch.map((c) => c.delay + c.dur));
  return (
    <Specimen
      height={250}
      readout={toggles ? <>animated channels: {ch.map((c) => c.name).join(', ')} ({ch.length}) · settles at {settle}ms</> : 'Tick a task'}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setToggles(0); }} options={[{ value: 'busy', label: '4 channels' }, { value: 'honest', label: '1 channel' }]} />}
    >
      <Window width={320}>
        {['Ship CSV export', 'Fix login redirect', 'Audit dark mode'].map((s) => (
          <StateCheck key={`${mode}-${s}`} busy={mode === 'busy'} label={s} onToggle={() => setToggles((n) => n + 1)} />
        ))}
      </Window>
    </Specimen>
  );
}

// ── DE.CM.05 · reduced motion ───────────────────────────────────────────────
const RM = {
  full: { y: 24, scale: 0.96, fade: true, ms: 240 },
  off: { y: 0, scale: 1, fade: false, ms: 0 },
  designed: { y: 0, scale: 1, fade: true, ms: 120 },
};

export function ReducedMotionSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<keyof typeof RM>('full');
  const [open, setOpen] = useState(false);
  const os = reduce && mode === 'full';
  const s = os ? RM.designed : RM[mode];
  const from = { opacity: s.fade ? 0 : 1, y: s.y, scale: s.scale };

  return (
    <Specimen
      height={290}
      readout={
        open
          ? <>translate {s.y}px · scale {s.scale} · fade {s.fade ? '0 to 1' : 'none'} · {s.ms}ms{os && ' · your OS asks for reduced motion'}</>
          : 'Open the dialog, then switch the spec and open it again'
      }
      controls={
        <Segmented
          value={mode}
          onChange={(m) => { setMode(m); setOpen(false); }}
          options={[{ value: 'full', label: 'Full motion' }, { value: 'off', label: 'transition: none' }, { value: 'designed', label: 'Reduced variant' }]}
        />
      }
    >
      <Window width={400} height={230}>
        <div
          className="relative flex min-h-0 flex-1 flex-col"
          onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}
        >
          <div className="t-sm px-3 pt-3 font-medium text-ink">Project settings</div>
          <Row><span className="text-ink-3">Name</span><span className="ml-auto text-ink">Q4 roadmap</span></Row>
          <Row><span className="text-ink-3">Visibility</span><span className="ml-auto text-ink">Team</span></Row>
          <div className="p-3">
            <button onClick={() => setOpen(true)} className="t-sm rounded-[var(--r-pill)] px-3 py-1 font-medium" style={{ color: 'var(--anti)', border: '0.5px solid var(--hairline)' }}>
              Delete project
            </button>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--scrim)' }}
                initial={{ opacity: s.fade ? 0 : 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: s.fade ? 0 : 1 }}
                transition={{ duration: s.ms / 1000, ease: EASE }}
                onClick={() => setOpen(false)}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="w-[240px] rounded-[var(--r-md)] p-3"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}
                  initial={from}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={from}
                  transition={{ duration: s.ms / 1000, ease: EASE }}
                >
                  <div className="t-sm font-medium text-ink">Delete Q4 roadmap?</div>
                  <p className="t-sm mt-1 text-ink-3">This removes 14 issues for everyone.</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button autoFocus onClick={() => setOpen(false)} className="t-sm rounded-[var(--r-pill)] px-3 py-1 text-ink-2" style={{ background: 'var(--surface-2)' }}>Cancel</button>
                    <button onClick={() => setOpen(false)} className="t-sm rounded-[var(--r-pill)] px-3 py-1 font-medium" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Delete</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CM.06 · stagger ──────────────────────────────────────────────────────
const BARS = [42, 68, 55, 90, 74, 110, 96, 128];

export function StaggerSpecimen() {
  const { reduce } = useMotion();
  const [step, setStep] = useState(50);
  const [run, setRun] = useState(0);
  const verdict = step < 30 ? 'Reads as one event' : step <= 80 ? 'Reads as a sequence' : 'Last bar arrives late';
  const lastStart = step * (BARS.length - 1);
  return (
    <Specimen
      height={250}
      readout={<>{BARS.length} bars · {step}ms step · last bar starts {lastStart}ms · done {lastStart + 240}ms</>}
      controls={
        <div className="flex w-full flex-col items-center gap-3">
          <Slider label="stagger" value={step} min={0} max={150} step={5} unit="ms" verdict={verdict} onChange={setStep} onCommit={() => setRun((n) => n + 1)} />
          <Pill onClick={() => setRun((n) => n + 1)}>Replay</Pill>
        </div>
      }
    >
      <Window width={340}>
        <div className="flex h-[160px] items-end gap-2.5 px-5 pb-4 pt-5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
          {BARS.map((h, i) => (
            <motion.div
              key={`${run}-${i}`}
              className="flex-1 rounded-t-[3px]"
              style={{ height: h, background: i === BARS.length - 1 ? 'var(--accent)' : 'var(--ink-3)', transformOrigin: 'bottom' }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.24, delay: reduce ? 0 : (i * step) / 1000, ease: EASE }}
            />
          ))}
        </div>
        <div className="t-caption t-mono flex justify-between px-5 py-2 text-ink-4" style={{ letterSpacing: 0 }}>
          <span>Mon</span><span>Weekly signups</span><span>Sun</span>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CM.07 · framer motion, layout ────────────────────────────────────────
const TAGS = ['Design', 'Engineering', 'AI', 'Research', 'Motion', 'Typography'];
const ORDERS = [[0, 1, 2, 3, 4, 5], [3, 5, 1, 0, 4, 2], [5, 2, 4, 1, 0, 3], [2, 0, 5, 4, 3, 1]];

export function LayoutAnimationSpecimen() {
  const { reduce } = useMotion();
  const [on, setOn] = useState(true);
  const [step, setStep] = useState(0);
  const [moved, setMoved] = useState<{ n: number; max: number } | null>(null);
  const els = useRef<Record<string, HTMLElement | null>>({});
  const before = useRef<Record<string, { x: number; y: number }>>({});

  const snap = () => {
    const out: Record<string, { x: number; y: number }> = {};
    for (const k of TAGS) { const el = els.current[k]; if (el) out[k] = { x: el.offsetLeft, y: el.offsetTop }; }
    return out;
  };

  const shuffle = () => { before.current = snap(); setStep((s) => (s + 1) % ORDERS.length); };

  useLayoutEffect(() => {
    if (!step && !Object.keys(before.current).length) return;
    const after = snap();
    let n = 0, max = 0;
    for (const k of TAGS) {
      const a = before.current[k], b = after[k];
      if (!a || !b) continue;
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d > 0.5) { n++; max = Math.max(max, d); }
    }
    setMoved({ n, max: Math.round(max) });
  }, [step]);

  return (
    <Specimen
      height={240}
      readout={
        moved
          ? <>moved {moved.n}/{TAGS.length} · largest jump {moved.max}px · {on && !reduce ? 'interpolated over 300ms' : 'teleported in one frame'}</>
          : 'Press Shuffle and track the outlined tag'
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={on ? 'on' : 'off'} onChange={(v) => { setOn(v === 'on'); setMoved(null); }} options={[{ value: 'off', label: 'No layout prop' }, { value: 'on', label: 'layout' }]} />
          <Pill onClick={shuffle}>Shuffle</Pill>
        </div>
      }
    >
      <Window width={330}>
        <div className="t-sm px-3 pt-3 text-ink-3">Filters</div>
        <div className="relative flex flex-wrap gap-2 p-3">
          {ORDERS[step].map((i) => {
            const k = TAGS[i];
            return (
              <motion.div
                key={k}
                ref={(el) => { els.current[k] = el; }}
                layout={on ? 'position' : false}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                className="t-sm rounded-[var(--r-pill)] px-3 py-1.5 text-ink"
                style={{ background: 'var(--surface-2)', border: `0.5px solid ${k === 'Design' ? 'var(--accent)' : 'var(--hairline-2)'}` }}
              >
                {k}
              </motion.div>
            );
          })}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CV.01 · OKLCH ────────────────────────────────────────────────────────
const HUES = [
  { name: 'blue', hsl: 220, ok: 255 },
  { name: 'yellow', hsl: 50, ok: 95 },
  { name: 'green', hsl: 140, ok: 150 },
];

export function OklchSpecimen() {
  const [mode, setMode] = useState<'hsl' | 'oklch'>('hsl');
  const chips = HUES.map((h) => {
    const rgb = mode === 'hsl' ? hslToRgb(h.hsl, 0.75, 0.55) : oklchToRgb(0.72, 0.13, h.ok);
    const L = oklabL(rgb);
    return { ...h, rgb, L, gray: oklchToRgb(L, 0, 0) };
  });
  const Ls = chips.map((c) => c.L);
  const spread = Math.max(...Ls) - Math.min(...Ls);

  return (
    <Specimen
      height={260}
      readout={<>perceived L {chips.map((c) => `${c.name} ${c.L.toFixed(2)}`).join(' · ')} · spread {spread.toFixed(2)}</>}
      controls={
        <Segmented value={mode} onChange={setMode} options={[{ value: 'hsl', label: 'hsl(h 75% 55%)' }, { value: 'oklch', label: 'oklch(0.72 0.13 h)' }]} />
      }
    >
      <div className="flex flex-col gap-3">
        {(['as rendered', 'chroma removed'] as const).map((rowLabel, r) => (
          <div key={rowLabel} className="flex items-center gap-3">
            <span className="t-caption w-[96px] text-right text-ink-4" style={{ letterSpacing: 0 }}>{rowLabel}</span>
            {chips.map((c) => (
              <div
                key={c.name}
                className="flex h-[60px] w-[104px] items-end rounded-[var(--r-md)] p-2"
                style={{ background: rgbCss(r ? c.gray : c.rgb), border: '0.5px solid var(--hairline-2)', transition: 'background 200ms' }}
              >
                {r === 1 && <span className="t-caption t-mono rounded-[var(--r-sm)] px-1 text-ink" style={{ background: 'var(--surface)', letterSpacing: 0 }}>L {c.L.toFixed(2)}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Specimen>
  );
}

// ── DE.CV.02 · concentric corner radius ─────────────────────────────────────
export function CornerRadiusSpecimen() {
  const R = 16, P = 8, S = 2;
  const [r, setR] = useState(12);
  const ideal = R - P;
  const verdict = r === ideal ? 'Concentric' : r > ideal ? 'Inner corner bulges' : 'Inner corner too tight';
  const off = Math.SQRT2 * Math.abs(ideal - r);
  return (
    <Specimen
      height={270}
      readout={<>outer {R} minus padding {P} = {ideal} · inner {r} · arc centres {off.toFixed(1)}px apart</>}
      controls={<Slider label="inner radius" value={r} min={0} max={16} unit="px" verdict={verdict} onChange={setR} />}
    >
      <div className="relative" style={{ width: 300, height: 200 }}>
        <div className="absolute inset-0" style={{ borderRadius: R * S, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }} />
        <div
          className="absolute flex items-end p-3"
          style={{ inset: P * S, bottom: 64, borderRadius: r * S, background: 'var(--surface-2)', border: '0.5px solid var(--hairline-2)' }}
        >
          <span className="t-sm text-ink-3">Cover image</span>
        </div>
        <div className="t-sm absolute bottom-5 left-5 font-medium text-ink">Q4 roadmap</div>
        <svg className="pointer-events-none absolute left-0 top-0" width="120" height="120" overflow="visible">
          <circle cx={R * S} cy={R * S} r={R * S} fill="none" stroke="var(--ink-4)" strokeDasharray="3 3" strokeWidth="1" />
          {r > 0 && <circle cx={(P + r) * S} cy={(P + r) * S} r={r * S} fill="none" stroke="var(--accent)" strokeDasharray="3 3" strokeWidth="1" />}
          <circle cx={R * S} cy={R * S} r="3" fill="var(--ink-3)" />
          <circle cx={(P + r) * S} cy={(P + r) * S} r="3" fill="var(--accent)" />
        </svg>
      </div>
    </Specimen>
  );
}

// ── DE.CV.03 · optical alignment ────────────────────────────────────────────
export function OpticalAlignmentSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'box' | 'centroid'>('box');
  const D = 128, W = 44, H = 50;
  const off = W / 2 - W / 3;
  const dx = mode === 'centroid' ? off : 0;
  return (
    <Specimen
      height={260}
      readout={mode === 'box'
        ? <>bounding box on centre · centroid {off.toFixed(1)}px left of centre</>
        : <>bounding box {off.toFixed(1)}px right · centroid on centre (w/2 minus w/3 = {off.toFixed(1)}px)</>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'box', label: 'Box centre' }, { value: 'centroid', label: 'Centroid' }]} />}
    >
      <div className="flex items-center gap-10">
        <div className="relative rounded-full" style={{ width: D, height: D, background: 'var(--surface)', border: '0.5px solid var(--hairline)', boxShadow: 'var(--shadow-card)' }}>
          <div className="absolute inset-y-2 left-1/2 w-px" style={{ background: 'var(--hairline)' }} />
          <motion.div className="absolute" style={{ left: D / 2 - W / 2, top: D / 2 - H / 2, width: W, height: H }} animate={{ x: dx }} transition={t()}>
            <svg width={W} height={H} className="absolute inset-0" overflow="visible">
              <polygon points={`0,0 ${W},${H / 2} 0,${H}`} fill="var(--ink)" />
              <rect x="0" y="0" width={W} height={H} fill="none" stroke="var(--ink-4)" strokeDasharray="2 3" strokeWidth="1" />
              <circle cx={W / 2} cy={H / 2} r="3.5" fill="var(--bg)" stroke="var(--ink-3)" strokeWidth="1.5" />
              <circle cx={W / 3} cy={H / 2} r="3.5" fill="var(--accent)" />
            </svg>
          </motion.div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button aria-label="Play" className="relative flex size-10 items-center justify-center rounded-full" style={{ background: 'var(--ink)' }}>
            <motion.span animate={{ x: mode === 'centroid' ? 14 / 6 : 0 }} transition={t()} className="flex">
              <svg width="14" height="16" viewBox="0 0 14 16"><polygon points="0,0 14,8 0,16" fill="var(--bg)" /></svg>
            </motion.span>
          </button>
          <Meta>actual size</Meta>
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.CV.04 · type scale ───────────────────────────────────────────────────
const NAMED = [
  { r: 1.125, n: 'major second' }, { r: 1.2, n: 'minor third' }, { r: 1.25, n: 'major third' },
  { r: 1.333, n: 'perfect fourth' }, { r: 1.414, n: 'augmented fourth' }, { r: 1.5, n: 'perfect fifth' }, { r: 1.618, n: 'golden ratio' },
];

export function TypeScaleSpecimen() {
  const [ratio, setRatio] = useState(1.25);
  const base = 14;
  const size = (step: number) => base * ratio ** step;
  const named = NAMED.find((x) => Math.abs(x.r - ratio) < 0.006);
  const feel = ratio < 1.17 ? 'Flat, levels blur' : ratio <= 1.27 ? 'Dense, app UI' : ratio <= 1.42 ? 'Balanced, docs' : 'Loud, marketing';
  const steps = [3, 2, 1, 0, -1].map((s) => +size(s).toFixed(1));
  return (
    <Specimen
      height={300}
      readout={<>h1 {steps[0]} · h2 {steps[1]} · h3 {steps[2]} · body {steps[3]} · caption {steps[4]}px · h1 is {(ratio ** 3).toFixed(2)}x body</>}
      controls={<Slider label="ratio" value={ratio} min={1.1} max={1.6} step={0.005} shown={ratio.toFixed(3)} verdict={named ? `${feel} (${named.n})` : feel} onChange={setRatio} />}
    >
      <Window width={420}>
        <div className="flex flex-col p-4">
          <div className="font-semibold text-ink" style={{ fontSize: size(3), lineHeight: 1.1, letterSpacing: '-0.01em' }}>Quarterly report</div>
          <div className="mt-2 font-semibold text-ink" style={{ fontSize: size(2), lineHeight: 1.2 }}>Revenue</div>
          <div className="mt-1.5 font-medium text-ink-2" style={{ fontSize: size(1), lineHeight: 1.3 }}>By region</div>
          <p className="mt-1 text-ink-2" style={{ fontSize: size(0), lineHeight: 1.5 }}>EMEA grew 18 percent on the back of two enterprise renewals.</p>
          <span className="mt-1 text-ink-4" style={{ fontSize: size(-1), lineHeight: 1.4 }}>Updated 2 Oct</span>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CV.05 · clamp ────────────────────────────────────────────────────────
const fluid = (vw: number) => Math.min(24, Math.max(16, 13.714 + 0.007143 * vw));
const stepped = (vw: number) => (vw >= 1200 ? 24 : vw >= 768 ? 20 : 16);

export function ClampSpecimen() {
  const [vw, setVw] = useState(760);
  const [mode, setMode] = useState<'mq' | 'clamp'>('mq');
  const fs = mode === 'clamp' ? fluid(vw) : stepped(vw);
  const X = (v: number) => 20 + ((v - 320) / 1120) * 400;
  const Y = (f: number) => 96 - ((f - 14) / 12) * 84;
  const linePath = `M${X(320)},${Y(16)} L${X(1440)},${Y(24)}`;
  const stepPath = `M${X(320)},${Y(16)} H${X(768)} V${Y(20)} H${X(1200)} V${Y(24)} H${X(1440)}`;
  const rule = mode === 'clamp'
    ? 'clamp(1rem, 0.857rem + 0.714vw, 1.5rem)'
    : vw >= 1200 ? '@media (min-width: 1200px) 24px' : vw >= 768 ? '@media (min-width: 768px) 20px' : 'base 16px';
  return (
    <Specimen
      height={270}
      readout={<>viewport {vw}px · font-size {fs.toFixed(2)}px · {rule}</>}
      controls={
        <div className="flex w-full flex-col items-center gap-3">
          <Slider label="viewport" value={vw} min={320} max={1440} step={8} unit="" onChange={setVw} />
          <Segmented value={mode} onChange={setMode} options={[{ value: 'mq', label: 'Media queries' }, { value: 'clamp', label: 'clamp()' }]} />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3">
        <svg width="440" height="104" className="max-w-full">
          <line x1="20" y1="96" x2="420" y2="96" stroke="var(--hairline)" />
          <path d={mode === 'clamp' ? stepPath : linePath} fill="none" stroke="var(--hairline)" strokeWidth="1.5" />
          <path d={mode === 'clamp' ? linePath : stepPath} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" />
          <circle cx={X(vw)} cy={Y(fs)} r="4" fill="var(--accent)" />
          <text x="20" y="10" fontSize="10" fill="var(--ink-4)" fontFamily="var(--font-mono, monospace)">font-size, 16 to 24px</text>
          <text x="420" y="92" fontSize="10" fill="var(--ink-4)" textAnchor="end" fontFamily="var(--font-mono, monospace)">viewport</text>
        </svg>
        <div
          className="flex h-[64px] items-center overflow-hidden rounded-[var(--r-md)] px-3"
          style={{ width: 140 + ((vw - 320) / 1120) * 300, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <span className="whitespace-nowrap font-semibold text-ink" style={{ fontSize: fs }}>Ship faster</span>
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.CV.06 · semantic tokens ──────────────────────────────────────────────
const PRIM = { white: '#ffffff', stone50: '#fafaf9', stone100: '#f5f5f4', gray200: '#e5e5e5', gray400: '#a3a3a3', gray600: '#525252', gray700: '#404040', gray800: '#262626', gray900: '#171717', blue400: '#60a5fa', blue500: '#3b82f6' };
type Role = 'surface' | 'ink' | 'muted' | 'border' | 'action' | 'onAction';
const SEM: Record<'light' | 'dark', Record<Role | 'page', string>> = {
  light: { page: PRIM.stone100, surface: PRIM.white, ink: PRIM.gray900, muted: PRIM.gray600, border: PRIM.gray200, action: PRIM.blue500, onAction: PRIM.white },
  dark: { page: PRIM.gray900, surface: PRIM.gray800, ink: PRIM.stone50, muted: PRIM.gray400, border: PRIM.gray700, action: PRIM.blue400, onAction: PRIM.gray900 },
};
const ELEMENTS: { name: string; prop: string; role: Role }[] = [
  { name: 'card', prop: 'background', role: 'surface' },
  { name: 'title', prop: 'color', role: 'ink' },
  { name: 'body', prop: 'color', role: 'muted' },
  { name: 'divider', prop: 'border', role: 'border' },
  { name: 'button', prop: 'background', role: 'action' },
];

export function SemanticTokensSpecimen() {
  const [mode, setMode] = useState<'raw' | 'semantic'>('raw');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const v = (role: Role) => (mode === 'semantic' ? SEM[theme][role] : SEM.light[role]);
  const stuck = ELEMENTS.filter((e) => v(e.role) !== SEM[theme][e.role]);
  return (
    <Specimen
      height={280}
      readout={<>theme {theme} · followed the theme {ELEMENTS.length - stuck.length}/{ELEMENTS.length}{stuck.length > 0 && <> · stuck on hex: {stuck.map((s) => s.name).join(', ')}</>}</>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setTheme('light'); }} options={[{ value: 'raw', label: 'Raw hex' }, { value: 'semantic', label: 'Semantic tokens' }]} />}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-[220px] w-[220px] flex-col overflow-hidden rounded-[var(--r-md)]" style={{ background: SEM[theme].page, boxShadow: 'var(--shadow-card)', transition: 'background 200ms' }}>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="t-caption t-mono" style={{ color: SEM[theme].muted, letterSpacing: 0 }}>app shell</span>
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme((x) => (x === 'light' ? 'dark' : 'light'))}
              className="flex size-7 items-center justify-center rounded-full"
              style={{ color: SEM[theme].ink, border: `0.5px solid ${SEM[theme].border}` }}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
          <div className="mx-3 flex flex-1 flex-col rounded-[10px] p-3" style={{ background: v('surface'), transition: 'background 200ms' }}>
            <span className="t-sm font-medium" style={{ color: v('ink') }}>Invite your team</span>
            <span className="t-sm mt-1" style={{ color: v('muted') }}>Three seats left on this plan.</span>
            <div className="my-3" style={{ borderTop: `1px solid ${v('border')}` }} />
            <button className="t-sm self-start rounded-[var(--r-pill)] px-3 py-1 font-medium" style={{ background: v('action'), color: v('onAction') }}>Invite</button>
          </div>
          <div className="h-3" />
        </div>
        <div className="flex w-[230px] flex-col gap-1.5">
          {ELEMENTS.map((e) => {
            const ok = v(e.role) === SEM[theme][e.role];
            return (
              <div key={e.name} className="t-caption t-mono flex items-center gap-2 rounded-[var(--r-sm)] px-2 py-1.5" style={{ background: 'var(--surface)', border: `0.5px solid ${ok ? 'var(--hairline-2)' : 'var(--anti)'}`, letterSpacing: 0 }}>
                <span className="w-12 text-ink-3">{e.name}</span>
                <span className="truncate text-ink">{mode === 'raw' ? SEM.light[e.role] : `var(--${e.role === 'onAction' ? 'on-action' : e.role})`}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.CV.07 · spacing grid ─────────────────────────────────────────────────
const SPACING = {
  free: { x: 15, top: 14, g1: 7, g2: 18, bottom: 22 },
  grid: { x: 16, top: 16, g1: 8, g2: 24, bottom: 16 },
};

export function GridSpecimen() {
  const [mode, setMode] = useState<'free' | 'grid'>('free');
  const sp = SPACING[mode];
  const card = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLParagraphElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [gaps, setGaps] = useState<{ name: string; top: number; size: number }[]>([]);
  const [cardH, setCardH] = useState(0);

  useLayoutEffect(() => {
    const c = card.current, a = title.current, b = body.current, d = btn.current;
    if (!c || !a || !b || !d) return;
    setCardH(c.clientHeight);
    const aEnd = a.offsetTop + a.offsetHeight, bEnd = b.offsetTop + b.offsetHeight, dEnd = d.offsetTop + d.offsetHeight;
    setGaps([
      { name: 'pad-top', top: 0, size: a.offsetTop },
      { name: 'title to body', top: aEnd, size: b.offsetTop - aEnd },
      { name: 'body to action', top: bEnd, size: d.offsetTop - bEnd },
      { name: 'pad-bottom', top: dEnd, size: c.clientHeight - dEnd },
    ]);
  }, [mode]);

  const offGrid = gaps.filter((g) => g.size % 4 !== 0).length;
  return (
    <Specimen
      height={270}
      readout={gaps.length ? <>{gaps.map((g) => `${g.name} ${g.size}`).join(' · ')} · off the 4px grid: {offGrid}</> : null}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'free', label: 'Freeform px' }, { value: 'grid', label: 'Base-4 grid' }]} />}
    >
      <div className="flex items-start gap-3">
        <div
          ref={card}
          className="relative w-[260px] rounded-[var(--r-md)]"
          style={{ padding: `${sp.top}px ${sp.x}px ${sp.bottom}px`, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[var(--r-md)]"
            style={{ backgroundImage: 'repeating-linear-gradient(to bottom, var(--hairline-2) 0 1px, transparent 1px 4px)' }}
          />
          {gaps.map((g) => (
            <div key={g.name} className="pointer-events-none absolute inset-x-0" style={{ top: g.top, height: g.size, background: g.size % 4 ? 'var(--anti)' : 'var(--accent)', opacity: 0.16 }} />
          ))}
          <div ref={title} className="relative t-sm font-medium text-ink" style={{ lineHeight: '20px' }}>Invite your team</div>
          <p ref={body} className="relative t-sm text-ink-3" style={{ lineHeight: '20px', marginTop: sp.g1 }}>Three seats left on this plan. Invites expire in 7 days.</p>
          <button ref={btn} className="t-sm relative h-8 rounded-[var(--r-pill)] px-3 font-medium" style={{ marginTop: sp.g2, background: 'var(--ink)', color: 'var(--bg)' }}>Invite</button>
        </div>
        <div className="relative w-[44px]" style={{ height: cardH }}>
          {gaps.map((g) => (
            <span key={g.name} className="t-caption t-mono absolute left-0 -translate-y-1/2" style={{ top: g.top + g.size / 2, color: g.size % 4 ? 'var(--anti)' : 'var(--ink-3)', letterSpacing: 0 }}>
              {g.size}
            </span>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.CV.08 · contrast ─────────────────────────────────────────────────────
function useThemeVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const mo = new MutationObserver(() => setV((n) => n + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    return () => mo.disconnect();
  }, []);
  return v;
}

function resolveOver(vars: string[], base: string): Record<string, RGB> {
  const probe = document.createElement('div');
  document.body.appendChild(probe);
  const read = (v: string) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const baseCss = read(base);
  const out: Record<string, RGB> = {};
  for (const v of [base, ...vars]) {
    if (!ctx) break;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = baseCss;
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = read(v);
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    out[v] = [r / 255, g / 255, b / 255];
  }
  probe.remove();
  return out;
}

export function ContrastSpecimen() {
  const [meta, setMeta] = useState<'--ink-2' | '--ink-3' | '--ink-4'>('--ink-3');
  const themeV = useThemeVersion();
  const [cols, setCols] = useState<Record<string, RGB> | null>(null);
  useEffect(() => { setCols(resolveOver(['--ink', '--ink-2', '--ink-3', '--ink-4', '--hairline'], '--surface')); }, [themeV]);

  const rows: { name: string; token: string; need: number }[] = [
    { name: 'heading', token: '--ink', need: 4.5 },
    { name: 'body', token: '--ink-2', need: 4.5 },
    { name: 'meta label', token: meta, need: 4.5 },
    { name: 'divider', token: '--hairline', need: 3 },
  ];
  const ratios = cols ? rows.map((r) => contrast(cols[r.token], cols['--surface'])) : [];
  const metaR = ratios[2] ?? 0;
  const mean = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;

  return (
    <Specimen
      height={270}
      readout={cols ? <>meta label {metaR.toFixed(2)}:1 on --surface · text needs 4.5:1 · {metaR >= 4.5 ? 'passes AA' : 'fails AA'} · mean of all four {mean.toFixed(1)}:1</> : null}
      controls={<Segmented value={meta} onChange={setMeta} options={[{ value: '--ink-2', label: '--ink-2' }, { value: '--ink-3', label: '--ink-3' }, { value: '--ink-4', label: '--ink-4' }]} />}
    >
      <div className="flex items-center gap-4">
        <div className="w-[220px] rounded-[var(--r-md)] p-4" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
          <div className="t-sm font-medium" style={{ color: 'var(--ink)' }}>Usage this month</div>
          <p className="t-sm mt-1" style={{ color: 'var(--ink-2)' }}>2.4M tokens across 18 projects.</p>
          <div className="my-3" style={{ borderTop: '1px solid var(--hairline)' }} />
          <span className="t-sm" style={{ color: `var(${meta})` }}>Updated 2 min ago</span>
        </div>
        <div className="flex w-[210px] flex-col gap-1.5">
          {rows.map((r, i) => (
            <div key={r.name} className="t-caption t-mono flex items-center gap-2 rounded-[var(--r-sm)] px-2 py-1.5" style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline-2)', letterSpacing: 0 }}>
              <Dot tone={ratios[i] >= r.need ? 'good' : 'bad'} />
              <span className="flex-1 text-ink-3">{r.name}</span>
              <span className="text-ink">{ratios[i] ? `${ratios[i].toFixed(2)}:1` : '...'}</span>
            </div>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.CV.09 · icon system ──────────────────────────────────────────────────
const ICONS = [
  { I: Search, name: 'search', mixed: { s: 1.25, z: 18 } },
  { I: Settings, name: 'settings', mixed: { s: 2, z: 22 } },
  { I: Download, name: 'download', mixed: { s: 1.5, z: 20 } },
  { I: Bell, name: 'bell', mixed: { s: 2.5, z: 24 } },
  { I: Share2, name: 'share', mixed: { s: 1.75, z: 19 } },
  { I: Trash2, name: 'trash', mixed: { s: 2, z: 20 } },
];

export function IconSystemSpecimen() {
  const [mode, setMode] = useState<'mixed' | 'system'>('mixed');
  const specs = ICONS.map((ic) => (mode === 'mixed' ? ic.mixed : { s: 1.5, z: 20 }));
  const rendered = specs.map((p) => +((p.s * p.z) / 24).toFixed(2));
  const weights = [...new Set(rendered)].sort((a, b) => a - b);
  const sizes = new Set(specs.map((p) => p.z));
  return (
    <Specimen
      height={220}
      readout={<>rendered stroke {weights.join(', ')}px · {weights.length} weight{weights.length > 1 ? 's' : ''} · {sizes.size} size{sizes.size > 1 ? 's' : ''}</>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'mixed', label: 'Per-icon stroke and size' }, { value: 'system', label: '1.5 stroke at 20px' }]} />}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 rounded-[var(--r-md)] p-1.5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
          {ICONS.map(({ I, name }, i) => (
            <button key={name} aria-label={name} className="flex size-10 items-center justify-center rounded-[var(--r-sm)] text-ink hover:bg-[var(--surface-2)]">
              <I size={specs[i].z} strokeWidth={specs[i].s} />
            </button>
          ))}
        </div>
        <div className="flex gap-1 px-1.5">
          {rendered.map((w, i) => (
            <span key={ICONS[i].name} className="t-caption t-mono w-10 text-center text-ink-4" style={{ letterSpacing: 0 }}>{w}</span>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.PR.01 · Linear, review the live preview ──────────────────────────────
type DataCase = 'mock' | 'long' | 'many' | 'loading';
const BASE_ISSUES = [
  { id: 'ENG-142', title: 'Login redirect loops', who: 'Mira' },
  { id: 'ENG-139', title: 'CSV export header', who: 'Dev' },
  { id: 'ENG-131', title: 'Avatar upload 500', who: 'Ana' },
  { id: 'ENG-128', title: 'Dark mode chart', who: 'Sam' },
];

function issuesFor(c: DataCase) {
  if (c === 'loading') return [];
  if (c === 'long') return [{ id: 'ENG-142', title: 'Login redirect loops on Safari when the session cookie expires mid-checkout', who: 'Maximilian Featherstonehaugh' }, ...BASE_ISSUES.slice(1)];
  if (c === 'many') return Array.from({ length: 400 }, (_, i) => ({ ...BASE_ISSUES[i % 4], id: `ENG-${542 - i}` }));
  return BASE_ISSUES;
}

export function LinearPreviewSpecimen() {
  const [c, setC] = useState<DataCase>('mock');
  const [seen, setSeen] = useState<Set<DataCase>>(new Set(['mock']));
  const list = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ rows: 0, h: 0, clipped: 0 });
  const rows = issuesFor(c);

  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    el.scrollTop = 0;
    const titles = [...el.querySelectorAll<HTMLElement>('[data-clip]')];
    setM({ rows: el.querySelectorAll('[data-row]').length, h: el.scrollHeight, clipped: titles.filter((x) => x.scrollWidth > x.clientWidth + 1).length });
  }, [c]);

  return (
    <Specimen
      height={290}
      readout={<>rows {m.rows} · list {m.h.toLocaleString()}px tall · text clipped {m.clipped} · cases checked {seen.size}/4</>}
      controls={
        <Segmented
          value={c}
          onChange={(v) => { setC(v); setSeen((s) => new Set(s).add(v)); }}
          options={[{ value: 'mock', label: 'Mockup data' }, { value: 'long', label: 'Long names' }, { value: 'many', label: '400 rows' }, { value: 'loading', label: 'Loading' }]}
        />
      }
    >
      <Window width={420} height={230} url="preview-eng-142.vercel.app/issues">
        <div ref={list} className="min-h-0 flex-1 overflow-y-auto">
          {c === 'loading'
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                  <div className="h-2 w-12 animate-pulse rounded-full" style={{ background: 'var(--surface-2)' }} />
                  <div className="h-2 flex-1 animate-pulse rounded-full" style={{ background: 'var(--surface-2)' }} />
                </div>
              ))
            : rows.map((r, i) => (
                <div data-row key={`${r.id}-${i}`} className="t-sm flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                  <Meta>{r.id}</Meta>
                  <span data-clip className="min-w-0 flex-1 truncate text-ink">{r.title}</span>
                  <span data-clip className="w-[72px] shrink-0 truncate text-right text-ink-3">{r.who}</span>
                </div>
              ))}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.PR.02 · Vercel Geist, motion as a token ──────────────────────────────
const GEIST = [
  { name: 'Drawer', inline: null as number | null },
  { name: 'Sheet', inline: 200 },
  { name: 'Tooltip', inline: 150 },
];

export function GeistTokenSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<'inline' | 'token'>('inline');
  const [base, setBase] = useState(240);
  const [run, setRun] = useState(0);
  const rows = GEIST.map((g) => {
    const usesToken = mode === 'token' || g.inline === null;
    return { ...g, usesToken, ms: usesToken ? base : (g.inline as number) };
  });
  const followed = rows.filter((r) => r.usesToken).length;
  const durations = [...new Set(rows.map((r) => r.ms))].sort((a, b) => a - b);
  return (
    <Specimen
      height={250}
      readout={<>--motion-base {base}ms · components that followed the edit {followed}/3 · durations in use {durations.join(', ')}ms</>}
      controls={
        <div className="flex w-full flex-col items-center gap-3">
          <Slider label="--motion-base" value={base} min={100} max={400} step={10} unit="ms" onChange={setBase} onCommit={() => setRun((n) => n + 1)} />
          <Segmented value={mode} onChange={(m) => { setMode(m); setRun((n) => n + 1); }} options={[{ value: 'inline', label: 'Inline in components' }, { value: 'token', label: 'Read from token' }]} />
        </div>
      }
    >
      <Window width={460}>
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
            <span className="t-sm w-16 shrink-0 text-ink">{r.name}</span>
            <div className="relative h-6 min-w-0 flex-1 overflow-hidden rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }}>
              <motion.div
                key={`${run}-${r.name}`}
                className="absolute inset-y-0 left-0 w-1/2 rounded-[var(--r-sm)]"
                style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: reduce ? 0 : r.ms / 1000, ease: EASE }}
              />
            </div>
            <span className="t-caption t-mono w-[150px] shrink-0 truncate" style={{ color: r.usesToken ? 'var(--ink-2)' : 'var(--anti)', letterSpacing: 0 }}>
              {r.usesToken ? 'var(--motion-base)' : `${r.ms}ms inline`}
            </span>
          </div>
        ))}
      </Window>
    </Specimen>
  );
}

// ── DE.PR.03 · Emil Kowalski, the 200ms ease-out ────────────────────────────
const CURVES: Record<'ease' | 'out', { ms: number; c: Bez; label: string }> = {
  ease: { ms: 300, c: [0.25, 0.1, 0.25, 1], label: 'ease 300ms' },
  out: { ms: 200, c: [0.23, 1, 0.32, 1], label: 'ease-out 200ms' },
};

export function EaseOutSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<'ease' | 'out'>('ease');
  const [open, setOpen] = useState(false);
  const cur = CURVES[mode];
  const other = CURVES[mode === 'ease' ? 'out' : 'ease'];
  const at = (k: typeof cur, ms: number) => (ms >= k.ms ? 1 : bezier(k.c)(ms / k.ms));
  const W = 150, H = 120;
  const path = (k: typeof cur) =>
    Array.from({ length: 61 }, (_, i) => {
      const ms = (i / 60) * 300;
      return `${i ? 'L' : 'M'}${((ms / 300) * W).toFixed(1)},${(H - at(k, ms) * H).toFixed(1)}`;
    }).join(' ');
  const p100 = at(cur, 100);

  return (
    <Specimen
      height={270}
      readout={<>at 100ms the drawer is {Math.round(p100 * 100)}% of the way · settles at {cur.ms}ms · {cur.label}</>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'ease', label: 'ease 300ms' }, { value: 'out', label: 'ease-out 200ms' }]} />}
    >
      <div className="flex items-center gap-5">
        <Window width={280} height={210}>
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
            <span className="t-sm text-ink-3">Deployments</span>
            <button onClick={() => setOpen((o) => !o)} className="t-sm rounded-[var(--r-pill)] px-2.5 py-0.5 font-medium" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
              {open ? 'Close' : 'Details'}
            </button>
          </div>
          {['main · Ready', 'feat/ui · Building', 'fix/auth · Error'].map((s) => <Row key={s}><span className="text-ink-3">{s}</span></Row>)}
          <motion.div
            className="absolute bottom-0 right-0 top-[37px] w-[150px] p-3"
            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sheet)' }}
            initial={false}
            animate={{ x: open ? 0 : 160 }}
            transition={{ duration: reduce ? 0 : cur.ms / 1000, ease: cur.c }}
          >
            <Meta>main</Meta>
            <div className="t-sm mt-1 font-medium text-ink">Ready in 42s</div>
            <div className="mt-2 h-1.5 w-4/5 rounded-full" style={{ background: 'var(--surface-2)' }} />
          </motion.div>
        </Window>
        <svg width={W + 8} height={H + 22} overflow="visible">
          <rect x="0" y="0" width={W} height={H} fill="none" stroke="var(--hairline-2)" />
          <path d={path(other)} fill="none" stroke="var(--hairline)" strokeWidth="1.5" />
          <path d={path(cur)} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" />
          <line x1={(100 / 300) * W} y1="0" x2={(100 / 300) * W} y2={H} stroke="var(--accent)" strokeDasharray="2 3" />
          <circle cx={(100 / 300) * W} cy={H - p100 * H} r="4" fill="var(--accent)" />
          <text x="0" y={H + 14} fontSize="10" fill="var(--ink-4)" fontFamily="var(--font-mono, monospace)">0</text>
          <text x={(100 / 300) * W} y={H + 14} fontSize="10" fill="var(--ink-4)" textAnchor="middle" fontFamily="var(--font-mono, monospace)">100ms</text>
          <text x={W} y={H + 14} fontSize="10" fill="var(--ink-4)" textAnchor="end" fontFamily="var(--font-mono, monospace)">300</text>
        </svg>
      </div>
    </Specimen>
  );
}

// ── DE.PR.04 · Paco Coursey, interrupt less ─────────────────────────────────
const INVOICES = ['INV-2041 Acme', 'INV-2040 Globex', 'INV-2039 Initech', 'INV-2038 Umbrella', 'INV-2037 Hooli', 'INV-2036 Stark', 'INV-2035 Wayne', 'INV-2034 Wonka'];

export function InterruptLessSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const [open, setOpen] = useState<number | null>(null);
  const [sel, setSel] = useState<Set<number>>(new Set([1]));
  const [edits, setEdits] = useState(0);
  const [refused, setRefused] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const reset = (m = mode) => { setMode(m); setOpen(null); setEdits(0); setRefused(0); setFocus(null); };
  const toggle = (i: number) => {
    setSel((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
    if (open !== null) setEdits((e) => e + 1);
  };

  useEffect(() => {
    if (open === null) return;
    const id = requestAnimationFrame(() => {
      const a = document.activeElement as HTMLElement | null;
      setFocus(a?.closest('[data-panel]') ? 'the dialog' : a?.closest('[data-inv]') ? 'the row' : 'the page');
    });
    return () => cancelAnimationFrame(id);
  }, [open, mode]);

  const panel = open !== null && (
    <>
      <div className="flex items-start justify-between">
        <Meta>{INVOICES[open].split(' ')[0]}</Meta>
        <button autoFocus={mode === 'modal'} aria-label="Close" onClick={() => setOpen(null)} className="text-ink-4 hover:text-ink"><X size={14} /></button>
      </div>
      <div className="t-sm mt-1 font-medium text-ink">{INVOICES[open].split(' ')[1]}</div>
      <div className="t-sm mt-2 flex justify-between text-ink-3"><span>3 line items</span><span className="text-ink">$2,150</span></div>
    </>
  );

  return (
    <Specimen
      height={300}
      readout={
        open === null
          ? 'Tick a row, open another invoice, then try to change the selection'
          : <>focus on {focus ?? '...'} · selection edits while open {edits} · clicks refused {refused}</>
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => reset(m)} options={[{ value: 'modal', label: 'Modal' }, { value: 'drawer', label: 'Drawer' }]} />
          <Pill onClick={() => reset()}>Reset</Pill>
        </div>
      }
    >
      <Window width={440} height={250}>
        <div
          ref={wrap}
          className="relative flex min-h-0 flex-1"
          onKeyDown={(e) => { if (e.key === 'Escape' && open !== null) { e.stopPropagation(); setOpen(null); } }}
        >
          <div className="min-w-0 flex-1 overflow-y-auto">
            {INVOICES.map((inv, i) => (
              <div key={inv} data-inv className="t-sm flex items-center gap-3 px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)', background: open === i ? 'var(--surface-2)' : undefined }}>
                <input type="checkbox" checked={sel.has(i)} onChange={() => toggle(i)} aria-label={`Select ${inv}`} style={{ accentColor: 'var(--accent)' }} />
                <button onClick={() => setOpen(i)} className="min-w-0 flex-1 truncate text-left text-ink">{inv}</button>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {mode === 'drawer' && open !== null && (
              <motion.div
                key="drawer"
                data-panel
                className="w-[180px] shrink-0 overflow-hidden"
                style={{ borderLeft: '0.5px solid var(--hairline)' }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 180, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={t()}
              >
                <div className="w-[180px] p-3">{panel}</div>
              </motion.div>
            )}
            {mode === 'modal' && open !== null && (
              <motion.div
                key="modal"
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--scrim)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={t(0.18)}
                onClick={() => setRefused((n) => n + 1)}
              >
                <motion.div
                  data-panel
                  role="dialog"
                  onClick={(e) => e.stopPropagation()}
                  className="w-[220px] rounded-[var(--r-md)] p-3"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.96 }}
                  transition={t(0.2)}
                >
                  {panel}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.PR.05 · Anthropic, model behaviour is a design surface ───────────────
type Span = { text: string; fact?: boolean; src?: number };
const SOURCES = [
  'Nepal and China joint survey, announced December 2020: 8,848.86 m.',
  'Royal Geographical Society archive: first ascent 29 May 1953.',
  'National Geographic: the summit sits on the Nepal and Tibet border.',
];
const ANSWERS: Record<'none' | 'cite', Span[]> = {
  none: [
    { text: 'Everest is about 8,849 metres tall', fact: true },
    { text: ', according to recent sources. ' },
    { text: 'Edmund Hillary and Tenzing Norgay first reached the top in 1953', fact: true },
    { text: ', and ' },
    { text: 'the summit straddles the border of Nepal and Tibet', fact: true },
    { text: '.' },
  ],
  cite: [
    { text: 'Everest is 8,848.86 metres tall', fact: true, src: 0 },
    { text: '. ' },
    { text: 'Edmund Hillary and Tenzing Norgay first reached the top on 29 May 1953', fact: true, src: 1 },
    { text: ', and ' },
    { text: 'the summit straddles the border of Nepal and Tibet', fact: true, src: 2 },
    { text: '.' },
  ],
};

export function ModelBehaviourSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'none' | 'cite'>('none');
  const [hover, setHover] = useState<number | null>(null);
  const spans = ANSWERS[mode];
  const facts = spans.filter((s) => s.fact);
  const cited = facts.filter((s) => s.src !== undefined).length;
  return (
    <Specimen
      height={290}
      readout={<>factual spans {facts.length} · cited {cited}/{facts.length} · footnote components rendered {cited}</>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setHover(null); }} options={[{ value: 'none', label: 'Prompt without cite rule' }, { value: 'cite', label: 'Prompt with cite rule' }]} />}
    >
      <Window width={440} clip={false}>
        <div className="t-caption t-mono truncate px-3 py-2 text-ink-4" style={{ borderBottom: '0.5px solid var(--hairline-2)', letterSpacing: 0 }}>
          system: {mode === 'cite' ? 'Cite each factual span with [n] from the retrieved sources.' : 'Answer helpfully and concisely.'}
        </div>
        <div className="flex flex-col gap-3 p-3">
          <div className="t-sm self-end rounded-[var(--r-md)] px-3 py-1.5 text-ink" style={{ background: 'var(--surface-2)' }}>How tall is Everest, and who climbed it first?</div>
          <p className="t-sm relative leading-relaxed text-ink">
            {spans.map((s, i) => (
              <span key={i}>
                {s.text}
                {s.src !== undefined && (
                  <span className="relative">
                    <button
                      onMouseEnter={() => setHover(s.src ?? null)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(s.src ?? null)}
                      onBlur={() => setHover(null)}
                      className="t-caption t-mono mx-0.5 rounded-[var(--r-sm)] px-1 align-super"
                      style={{ background: 'var(--surface-2)', color: 'var(--accent)', letterSpacing: 0 }}
                    >
                      {s.src + 1}
                    </button>
                    <AnimatePresence>
                      {hover === s.src && (
                        <motion.span
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={t(0.15)}
                          className="t-sm absolute bottom-full left-1/2 z-10 mb-1 w-[220px] -translate-x-1/2 rounded-[var(--r-md)] p-2 text-ink-2"
                          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}
                        >
                          {SOURCES[s.src]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.PR.06 · token theory, the alias chain ────────────────────────────────
const BRAND = { 'blue-500': '#3b82f6', 'violet-500': '#8b5cf6' };
const CONSUMERS = [
  { name: 'HeaderCTA', reads: 'action-primary' },
  { name: 'DialogConfirm', reads: 'action-primary' },
  { name: 'PricingButton', reads: 'action-primary' },
  { name: 'CheckoutFooter', reads: 'blue-500' },
] as const;

export function AliasChainSpecimen() {
  const [brand, setBrand] = useState<keyof typeof BRAND>('blue-500');
  const resolve = (reads: string) => (reads === 'action-primary' ? BRAND[brand] : BRAND[reads as keyof typeof BRAND]);
  const target = BRAND[brand];
  const stuck = CONSUMERS.filter((c) => resolve(c.reads) !== target);
  return (
    <Specimen
      height={280}
      readout={
        <>
          matching the brand {CONSUMERS.length - stuck.length}/{CONSUMERS.length}
          {stuck.length ? <> · out of sync: {stuck.map((s) => `${s.name} (reads --${s.reads})`).join(', ')}</> : ' · the bypass is invisible until a rebrand'}
        </>
      }
      controls={<Segmented value={brand} onChange={setBrand} options={[{ value: 'blue-500', label: 'action-primary: blue-500' }, { value: 'violet-500', label: 'action-primary: violet-500' }]} />}
    >
      <Window width={470}>
        {CONSUMERS.map((c) => {
          const ok = resolve(c.reads) === target;
          return (
            <div key={c.name} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
              <button className="t-sm w-[92px] shrink-0 rounded-[var(--r-pill)] py-1 font-medium" style={{ background: resolve(c.reads), color: '#ffffff', transition: 'background 200ms' }}>
                Continue
              </button>
              <span className="t-caption t-mono min-w-0 flex-1 truncate text-ink-3" style={{ letterSpacing: 0 }}>
                {c.name} <span className="text-ink-4">{'>'}</span> {c.reads === 'action-primary' ? <>--action-primary <span className="text-ink-4">{'>'}</span> --{brand}</> : <span style={{ color: ok ? undefined : 'var(--anti)' }}>--{c.reads}</span>}
              </span>
              <Dot tone={ok ? 'good' : 'bad'} />
            </div>
          );
        })}
      </Window>
    </Specimen>
  );
}

export const DE_CRAFT_MOTION_VISUAL_SPECIMENS: Record<string, React.FC> = {
  'de-cm-motion-tokens': MotionTokensSpecimen,
  'de-cm-perceived-performance': PerceivedPerformanceSpecimen,
  'de-cm-spring-vs-tween': SpringTweenSpecimen,
  'de-cm-motion-for-state': MotionForStateSpecimen,
  'de-cm-reduced-motion': ReducedMotionSpecimen,
  'de-cm-stagger': StaggerSpecimen,
  'de-cm-framer-motion': LayoutAnimationSpecimen,
  'de-cv-oklch': OklchSpecimen,
  'de-cv-corner-radius': CornerRadiusSpecimen,
  'de-cv-optical-alignment': OpticalAlignmentSpecimen,
  'de-cv-type-scale': TypeScaleSpecimen,
  'de-cv-clamp': ClampSpecimen,
  'de-cv-semantic-tokens': SemanticTokensSpecimen,
  'de-cv-grid': GridSpecimen,
  'de-cv-contrast': ContrastSpecimen,
  'de-cv-icon-system': IconSystemSpecimen,
  'de-pr-linear': LinearPreviewSpecimen,
  'de-pr-vercel-geist': GeistTokenSpecimen,
  'de-pr-emil-kowalski': EaseOutSpecimen,
  'de-pr-paco-coursey': InterruptLessSpecimen,
  'de-pr-anthropic-design': ModelBehaviourSpecimen,
  'de-pr-token-theory': AliasChainSpecimen,
};
