import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileVideo, MousePointer2, X } from 'lucide-react';
import { Dot, Segmented, Specimen, Window, useMotion } from './kit';

// Phase 12 · Multimodal AI, parts 2 to 5. One specimen per lesson.

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="t-caption t-mono shrink-0 whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}>{children}</span>;
}

function Pill({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="t-sm rounded-[var(--r-pill)] px-3 py-1.5 text-ink-3 hover:text-ink disabled:opacity-40"
      style={{ background: 'var(--surface-2)' }}
    >
      {children}
    </button>
  );
}

function Range({
  label, value, min, max, step = 1, onChange, shown, verdict,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; shown: React.ReactNode; verdict: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 t-sm">
        <span className="text-ink-3">{label} <span className="t-mono text-ink">{shown}</span></span>
        <span className="text-right text-ink-2">{verdict}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  );
}

function useTimers() {
  const ids = useRef<number[]>([]);
  const api = useMemo(() => ({
    after(fn: () => void, ms: number) { ids.current.push(window.setTimeout(fn, ms)); },
    every(fn: () => void, ms: number) { ids.current.push(window.setInterval(fn, ms)); },
    clear() { ids.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); }); ids.current = []; },
  }), []);
  useEffect(() => api.clear, [api]);
  return api;
}

function rand(i: number) {
  let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// A cat silhouette in [0,1]². The "image" every generation specimen produces.
function cat(x: number, y: number) {
  const head = Math.hypot(x - 0.5, y - 0.6) < 0.27;
  const ear = (cx: number) => y > 0.16 && y < 0.42 && Math.abs(x - cx) < (y - 0.16) * 0.5;
  const eye = Math.hypot(x - 0.4, y - 0.57) < 0.045 || Math.hypot(x - 0.6, y - 0.57) < 0.045;
  if (eye) return 0.2;
  if (head || ear(0.31) || ear(0.69)) return 0.85;
  return 0.08 + 0.1 * y;
}
const CAT32 = Array.from({ length: 1024 }, (_, i) => cat(((i % 32) + 0.5) / 32, (Math.floor(i / 32) + 0.5) / 32));

const fmt = (n: number) => n.toLocaleString('en-US');

// ── 12.04 · Flamingo: masked cross-attention ───────────────────────────────
type Shot = 'A' | 'B' | 'C';
const TURNS: { img: Shot; text: string }[] = [
  { img: 'A', text: 'Q3 dipped, see the third bar.' },
  { img: 'B', text: 'This is the new sign-in screen.' },
  { img: 'C', text: 'What went wrong in this one?' },
];

function Thumb({ id }: { id: Shot }) {
  return (
    <div className="relative flex h-[40px] w-[58px] shrink-0 items-end justify-center gap-1 rounded-[var(--r-sm)] p-1.5" style={{ background: 'var(--surface-2)' }}>
      {id === 'A' && [12, 20, 8, 16].map((h, i) => (
        <span key={i} className="w-1.5 rounded-[1px]" style={{ height: h, background: i === 2 ? 'var(--ink-2)' : 'var(--ink-4)' }} />
      ))}
      {id === 'B' && (
        <div className="flex w-full flex-col gap-1 self-center pt-2">
          <span className="h-1.5 rounded-full" style={{ background: 'var(--hairline)' }} />
          <span className="h-1.5 rounded-full" style={{ background: 'var(--hairline)' }} />
          <span className="h-1.5 w-1/2 self-end rounded-full" style={{ background: 'var(--ink-3)' }} />
        </div>
      )}
      {id === 'C' && (
        <div className="mt-2 flex h-[22px] w-full flex-col items-center justify-center gap-0.5 rounded-[2px]" style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline)' }}>
          <X size={9} style={{ color: 'var(--anti)' }} />
          <span className="h-[3px] w-3/4 rounded-full" style={{ background: 'var(--hairline)' }} />
        </div>
      )}
      <span className="absolute left-1 top-0.5 t-caption t-mono text-ink-4" style={{ letterSpacing: 0 }}>{id}</span>
    </div>
  );
}

export function FlamingoSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'recent' | 'all'>('recent');
  const [sel, setSel] = useState(2);
  const seen = TURNS.slice(0, sel + 1).map((x) => x.img).filter((_, i) => mode === 'all' || i === sel);

  return (
    <Specimen
      height={280}
      readout={
        <>
          "{TURNS[sel].text.split(' ').slice(0, 3).join(' ')}…" reads {seen.length > 1 ? 'images' : 'image'} <span className="text-ink">{seen.join(', ')}</span>
          {' '}· {seen.length * 64} visual tokens via cross-attention · 0 added to the text stream
        </>
      }
      controls={
        <Segmented value={mode} onChange={setMode} options={[{ value: 'recent', label: 'Most recent image' }, { value: 'all', label: 'All earlier images' }]} />
      }
    >
      <Window width={380}>
        <div className="flex flex-col gap-2.5 p-3">
          {TURNS.map((turn, i) => {
            const on = seen.includes(turn.img);
            return (
              <div key={turn.img} className="flex items-center gap-3">
                <motion.div
                  animate={{ opacity: on ? 1 : 0.35 }}
                  transition={t()}
                  className="rounded-[var(--r-sm)]"
                  style={{ outline: `1.5px solid ${on ? 'var(--accent)' : 'transparent'}`, outlineOffset: 2 }}
                >
                  <Thumb id={turn.img} />
                </motion.div>
                <button
                  onClick={() => setSel(i)}
                  className="min-w-0 truncate rounded-[var(--r-md)] px-2.5 py-1.5 text-left t-sm transition-colors"
                  style={{
                    background: sel === i ? 'var(--surface-2)' : 'transparent',
                    border: `0.5px solid ${sel === i ? 'var(--hairline)' : 'var(--hairline-2)'}`,
                    color: sel === i ? 'var(--ink)' : 'var(--ink-3)',
                  }}
                >
                  {turn.text}
                </button>
              </div>
            );
          })}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.05 · LLaVA: projector vs Q-Former ────────────────────────────────────
function screenshot(x: number, y: number) {
  if (y < 0.125) return 0.55;
  if (y > 0.25 && y < 0.67) {
    const line = Math.floor((y - 0.25) / (2 / 24));
    const ink = ((y - 0.25) / (2 / 24)) % 1 < 0.5;
    const len = [0.85, 0.62, 0.92, 0.5, 0.74][line] ?? 0.5;
    return ink && x > 0.08 && x < 0.08 + len * 0.84 ? 0.45 : 0.06;
  }
  if (y > 0.75 && y < 0.875 && x > 0.58 && x < 0.92) return 0.8;
  return 0.06;
}
const SHOT = Array.from({ length: 576 }, (_, i) => screenshot(((i % 24) + 0.5) / 24, (Math.floor(i / 24) + 0.5) / 24));

export function LlavaSpecimen() {
  const [mode, setMode] = useState<'qformer' | 'mlp'>('qformer');
  const [cell, setCell] = useState(19 * 24 + 18);
  const r = Math.floor(cell / 24);
  const c = cell % 24;
  const tokens = mode === 'mlp' ? 576 : 32;
  const share = ((tokens / 4096) * 100).toFixed(1);

  return (
    <Specimen
      height={290}
      readout={
        mode === 'mlp'
          ? <>patch ({r}, {c}) → token #{cell} alone · 576 tokens · 1 patch per token · {share}% of a 4k context</>
          : <>patch ({r}, {c}) → blended into all 32 queries · 18 patches per token · {share}% of a 4k context</>
      }
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'qformer', label: 'Q-Former, 32 queries' }, { value: 'mlp', label: 'MLP projector' }]} />}
    >
      <div className="flex items-center gap-5">
        <div className="flex flex-col gap-1.5">
          <Meta>336px · 24x24 patches · hover</Meta>
          <div className="grid overflow-hidden rounded-[var(--r-sm)]" style={{ gridTemplateColumns: 'repeat(24, 8px)', boxShadow: 'var(--shadow-card)', background: 'var(--surface)' }}>
            {SHOT.map((v, i) => (
              <span
                key={i}
                onMouseEnter={() => setCell(i)}
                className="size-2"
                style={{
                  background: i === cell ? 'var(--accent)' : 'var(--ink)',
                  opacity: i === cell ? 1 : v,
                }}
              />
            ))}
          </div>
        </div>
        <span className="t-sm text-ink-4">→</span>
        <div className="flex w-[140px] flex-col gap-1.5">
          <Meta>to the LLM · {tokens} tokens</Meta>
          {mode === 'mlp' ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(24, 5px)', gap: 0 }}>
              {SHOT.map((_, i) => (
                <span key={i} className="size-[5px]" style={{ background: i === cell ? 'var(--accent)' : 'var(--hairline)', outline: '0.5px solid var(--bg)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-[3px]">
              {Array.from({ length: 32 }, (_, i) => (
                <span key={i} className="size-[13px] rounded-[2px]" style={{ background: 'var(--accent)', opacity: 0.25 + 0.5 * rand(i + cell) }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Specimen>
  );
}

// ── 12.06 · any-resolution: square-resize vs AnyRes vs native ───────────────
type Fit = 'square' | 'anyres' | 'native';
const GLYPH = 10;
const FITS: Record<Fit, { w: number; h: number; sx: number; sy: number; tokens: number; content: number }> = {
  square: { w: 336, h: 336, sx: 336 / 600, sy: 336 / 1500, tokens: 576, content: 336 },
  anyres: { w: 336, h: 1008, sx: 0.56, sy: 0.56, tokens: 3 * 576 + 576, content: 840 },
  native: { w: 600, h: 1500, sx: 1, sy: 1, tokens: Math.round(600 / 14) * Math.round(1500 / 14), content: 1500 },
};

function glyphBitmap(text: string, sx: number, sy: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { w: 0, a: [] as number[] };
  const font = `bold ${GLYPH * 1.35}px ui-monospace, monospace`;
  ctx.font = font;
  const w = Math.max(1, Math.ceil(ctx.measureText(text).width * sx));
  const h = Math.max(1, Math.ceil(GLYPH * 1.6 * sy));
  canvas.width = w;
  canvas.height = h;
  ctx.setTransform(sx, 0, 0, sy, 0, 0);
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';
  ctx.fillText(text, 0, GLYPH * 0.8);
  const d = ctx.getImageData(0, 0, w, h).data;
  const a: number[] = [];
  for (let i = 3; i < d.length; i += 4) a.push(d[i] / 255);
  return { w, a };
}

function ReceiptBody() {
  return (
    <div className="flex flex-col gap-0 px-10 pt-10" style={{ width: 600, height: 1500 }}>
      <div className="mx-auto mb-4 h-8 w-1/2 rounded-full" style={{ background: 'var(--ink-3)' }} />
      <div className="mx-auto mb-16 h-4 w-1/3 rounded-full" style={{ background: 'var(--hairline)' }} />
      {Array.from({ length: 38 }, (_, i) => (
        <div key={i} className="flex h-[30px] items-center justify-between">
          <span className="h-[10px] rounded-full" style={{ width: 160 + rand(i) * 200, background: 'var(--ink-4)' }} />
          <span className="h-[10px] w-[70px] rounded-full" style={{ background: 'var(--ink-4)' }} />
        </div>
      ))}
      <div className="mt-6 flex h-[30px] items-center justify-between">
        <span className="h-[14px] w-[120px] rounded-full" style={{ background: 'var(--ink-2)' }} />
        <span className="h-[14px] w-[110px] rounded-full" style={{ background: 'var(--ink-2)' }} />
      </div>
    </div>
  );
}

export function NativeResolutionSpecimen() {
  const [fit, setFit] = useState<Fit>('square');
  const f = FITS[fit];
  const bmp = useMemo(() => glyphBitmap('TOTAL $84.20', f.sx, f.sy), [f.sx, f.sy]);
  const block = Math.min(14, 230 / Math.max(1, bmp.w));
  const D = 0.13;

  return (
    <Specimen
      height={300}
      readout={<>receipt 600x1500 → encoder input {f.w}x{f.h} · {fmt(f.tokens)} tokens · TOTAL glyphs <span className="text-ink">{(GLYPH * f.sy).toFixed(1)}px</span> tall against a 14px patch</>}
      controls={
        <Segmented value={fit} onChange={setFit} options={[{ value: 'square', label: 'Square-resize' }, { value: 'anyres', label: 'AnyRes 1x3' }, { value: 'native', label: 'Native + pack' }]} />
      }
    >
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-[200px] items-center">
            <div className="relative overflow-hidden rounded-[2px]" style={{ width: f.w * D, height: f.h * D, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ transform: `scale(${f.sx * D}, ${f.sy * D})`, transformOrigin: 'top left' }}>
                <ReceiptBody />
              </div>
              {fit === 'anyres' && [1, 2].map((k) => (
                <span key={k} className="absolute inset-x-0" style={{ top: (k * f.h * D) / 3, borderTop: '0.5px dashed var(--accent)' }} />
              ))}
            </div>
          </div>
          <Meta>as the encoder sees it</Meta>
        </div>
        <div className="flex w-[230px] flex-col items-start gap-1.5">
          <div className="flex h-[60px] items-center">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${bmp.w}, ${block}px)` }}>
              {bmp.a.map((v, i) => (
                <span key={i} style={{ width: block, height: block, background: 'var(--ink)', opacity: v }} />
              ))}
            </div>
          </div>
          <Meta>TOTAL line, at encoder pixels</Meta>
        </div>
      </div>
    </Specimen>
  );
}

// ── 12.08 · LLaVA-OneVision: one budget, three shapes ───────────────────────
type Scen = 'single' | 'multi' | 'video';
const SCEN: Record<Scen, { items: number; pool: number; what: string }> = {
  single: { items: 10, pool: 2, what: 'crops (3x3 + overview)' },
  multi: { items: 6, pool: 1, what: 'images' },
  video: { items: 32, pool: 3, what: 'frames' },
};

export function OneVisionSpecimen() {
  const { t } = useMotion();
  const [scen, setScen] = useState<Scen>('single');
  const s = SCEN[scen];
  const per = Math.floor(729 / (s.pool * s.pool));
  const side = 27 / s.pool;
  const total = per * s.items;
  const SCALE = 400 / 5000;

  return (
    <Specimen
      height={290}
      readout={<>{s.items} {s.what} x 729, pooled {s.pool}x per side → {per} each · <span className="text-ink">{fmt(total)}</span> visual tokens</>}
      controls={<Segmented value={scen} onChange={setScen} options={[{ value: 'single', label: 'Single image' }, { value: 'multi', label: 'Multi-image' }, { value: 'video', label: 'Video' }]} />}
    >
      <Window width={440}>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex h-[92px] items-center gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {scen === 'single' && (
                <>
                  <div className="relative h-[84px] w-[112px] rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }}>
                    {[1, 2].map((k) => (
                      <span key={`v${k}`} className="absolute inset-y-0" style={{ left: `${(k * 100) / 3}%`, borderLeft: '0.5px dashed var(--ink-4)' }} />
                    ))}
                    {[1, 2].map((k) => (
                      <span key={`h${k}`} className="absolute inset-x-0" style={{ top: `${(k * 100) / 3}%`, borderTop: '0.5px dashed var(--ink-4)' }} />
                    ))}
                  </div>
                  <div className="h-[28px] w-[38px] rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }} />
                </>
              )}
              {scen === 'multi' && Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-[40px] w-[54px] rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }} />
              ))}
              {scen === 'video' && (
                <div className="flex items-center gap-[2px] rounded-[var(--r-sm)] p-1" style={{ background: 'var(--surface-2)' }}>
                  {Array.from({ length: 32 }, (_, i) => (
                    <span key={i} className="h-[30px] w-[6px] rounded-[1px]" style={{ background: 'var(--hairline)' }} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className="size-[64px] rounded-[2px]"
                style={{
                  background: 'var(--surface-2)',
                  backgroundImage: `repeating-linear-gradient(0deg, var(--hairline) 0 0.5px, transparent 0.5px ${64 / side}px), repeating-linear-gradient(90deg, var(--hairline) 0 0.5px, transparent 0.5px ${64 / side}px)`,
                }}
              />
              <Meta>{per} tokens per item</Meta>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between"><Meta>visual tokens</Meta><Meta>5,000</Meta></div>
            <div className="relative flex h-3 w-[400px] max-w-full gap-[1px] overflow-hidden rounded-[2px]" style={{ background: 'var(--surface-2)' }}>
              {Array.from({ length: s.items }, (_, i) => (
                <motion.span
                  key={`${scen}-${i}`}
                  initial={{ width: 0 }}
                  animate={{ width: Math.max(1, per * SCALE - 1) }}
                  transition={t(0.3)}
                  className="h-full shrink-0"
                  style={{ background: 'var(--accent)', opacity: 0.85 }}
                />
              ))}
            </div>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.09 · Qwen2.5-VL: dynamic FPS under a token budget ────────────────────
const BUDGET = 32768;
const TPF = 81;

export function DynamicFpsSpecimen() {
  const [T, setT] = useState(60);
  const ceiling = BUDGET / (T * TPF);
  const fps = [8, 4, 2, 1].find((f) => f <= ceiling) ?? 1;
  const frames = Math.floor(T * fps);
  const events: number[] = [];
  for (let k = 0; 3.7 + 6 * k + 0.25 <= T; k++) events.push(3.7 + 6 * k);
  const caught = events.map((s) => Math.ceil(s * fps - 1e-9) / fps <= s + 0.25 + 1e-9);
  const hits = caught.filter(Boolean).length;
  const W = 440;

  return (
    <Specimen
      height={250}
      readout={<>ceiling 32,768 / ({T}s x 81) = {ceiling.toFixed(1)} fps → sample at {fps} · {fmt(frames)} frames · {fmt(frames * TPF)} tokens</>}
      controls={
        <Range
          label="Clip length" value={T} min={15} max={240} step={15} onChange={setT}
          shown={`${Math.floor(T / 60)}:${String(T % 60).padStart(2, '0')}`}
          verdict={hits === events.length ? <><Dot tone="good" /> every racket contact sampled</> : <><Dot tone="bad" /> {events.length - hits} of {events.length} contacts fall between frames</>}
        />
      }
    >
      <Window width={480}>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 t-sm text-ink-2">
            <FileVideo size={14} className="text-ink-4" /> rally.mp4 <Meta>{fps} FPS · budget 32k</Meta>
          </div>
          <svg width={W} height={58} className="max-w-full overflow-visible">
            <rect x={0} y={14} width={W} height={30} rx={3} fill="var(--surface-2)" />
            {Array.from({ length: frames }, (_, j) => {
              const x = ((j / fps) / T) * W;
              return <line key={j} x1={x} x2={x} y1={16} y2={42} stroke="var(--ink-3)" strokeWidth={0.6} />;
            })}
            {events.map((s, i) => (
              <g key={s}>
                <rect x={(s / T) * W} y={10} width={Math.max(2, (0.25 / T) * W)} height={38} fill={caught[i] ? 'var(--pattern)' : 'var(--anti)'} opacity={0.85} />
                <circle cx={(s / T) * W + 1} cy={5} r={2.5} fill={caught[i] ? 'var(--pattern)' : 'var(--anti)'} />
              </g>
            ))}
            <text x={0} y={57} fontSize={10} fill="var(--ink-4)" fontFamily="ui-monospace, monospace">0s</text>
            <text x={W} y={57} fontSize={10} fill="var(--ink-4)" textAnchor="end" fontFamily="ui-monospace, monospace">{T}s</text>
          </svg>
          <Meta>ticks: sampled frames · marks: 0.25s racket contacts</Meta>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.11 · Chameleon: one vocabulary out ───────────────────────────────────
type Tok = { kind: 'text' | 'sep' | 'img'; s: string; id: number; cell?: number };
const textId = (s: string) => 100 + Math.floor(rand([...s].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7)) * 31800);
const IMG_STREAM: Tok[] = [
  ...['Here', ' is', ' a', ' cat', ':'].map((s) => ({ kind: 'text' as const, s, id: textId(s) })),
  { kind: 'sep', s: '<image>', id: 40192 },
  ...CAT32.map((_, i) => ({ kind: 'img' as const, s: '', id: 32000 + Math.floor(rand(i + 77) * 8192), cell: i })),
  { kind: 'sep', s: '</image>', id: 40193 },
  ...[' Grey', ' cat', ',', ' ears', ' up', '.'].map((s) => ({ kind: 'text' as const, s, id: textId(s) })),
];
const TEXT_STREAM: Tok[] = ['I', ' can', "'t", ' draw', ',', ' but', ' picture', ' a', ' grey', ' cat', ' with', ' ears', ' up', '.']
  .map((s) => ({ kind: 'text' as const, s, id: textId(s) }));

export function ChameleonSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<'text' | 'shared'>('shared');
  const [n, setN] = useState(0);
  const timers = useTimers();
  const stream = mode === 'shared' ? IMG_STREAM : TEXT_STREAM;

  const play = (m = mode) => {
    timers.clear();
    const st = m === 'shared' ? IMG_STREAM : TEXT_STREAM;
    if (reduce) { setN(st.length); return; }
    setN(0);
    let k = 0;
    timers.every(() => {
      k = st[k]?.kind === 'img' ? k + 32 : k + 1;
      setN(Math.min(k, st.length));
      if (k >= st.length) timers.clear();
    }, 60);
  };

  useEffect(() => { play('shared'); }, []);

  const out = stream.slice(0, n);
  const imgCount = out.filter((x) => x.kind === 'img').length;
  const last = out[out.length - 1];
  const range = !last ? '' : last.id < 32000 ? 'text BPE' : last.id < 40192 ? 'image code' : 'separator';
  const before = out.filter((x, i) => x.kind === 'text' && i < 6).map((x) => x.s).join('');
  const after = out.filter((x, i) => x.kind === 'text' && i > 6).map((x) => x.s).join('');

  return (
    <Specimen
      height={300}
      readout={
        <>
          {n} tokens out · text {n - imgCount - out.filter((x) => x.kind === 'sep').length} · image {imgCount}
          {last && <> · last id {fmt(last.id)} = {range}</>}
          {mode === 'text' && <> · head covers ids 0-31,999 only</>}
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => { setMode(m); play(m); }} options={[{ value: 'text', label: 'Text-only head' }, { value: 'shared', label: 'Shared vocabulary' }]} />
          <Pill onClick={() => play()}>Replay</Pill>
        </div>
      }
    >
      <Window width={400} height={250}>
        <div className="flex flex-col gap-2.5 p-3">
          <div className="self-end rounded-[var(--r-md)] px-2.5 py-1.5 t-sm text-ink" style={{ background: 'var(--surface-2)' }}>Draw a cat and describe it.</div>
          {mode === 'text' ? (
            <p className="t-sm text-ink">{out.map((x) => x.s).join('')}</p>
          ) : (
            <>
              <p className="min-h-[20px] t-sm text-ink">{before}</p>
              {n > 5 && (
                <div className="grid w-fit overflow-hidden rounded-[var(--r-sm)]" style={{ gridTemplateColumns: 'repeat(32, 3.5px)', background: 'var(--surface-2)' }}>
                  {CAT32.map((v, i) => (
                    <span key={i} style={{ width: 3.5, height: 3.5, background: 'var(--ink)', opacity: i < imgCount ? v : 0 }} />
                  ))}
                </div>
              )}
              <p className="t-sm text-ink">{after}</p>
            </>
          )}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.12 · Emu3: autoregressive pixels are quadratic ───────────────────────
export function ArImageSpecimen() {
  const { reduce } = useMotion();
  const [R, setR] = useState(1024);
  const [p, setP] = useState<number | null>(null);
  const timers = useTimers();
  const tokens = (R / 8) ** 2;
  const secs = tokens / 30;
  const SPEED = 120;
  const time = (s: number) => (s < 60 ? `${s.toFixed(0)}s` : `${(s / 60).toFixed(1)} min`);

  const generate = () => {
    timers.clear();
    if (reduce) { setP(1); return; }
    const start = performance.now();
    const wall = (secs / SPEED) * 1000;
    setP(0);
    timers.every(() => {
      const f = Math.min(1, (performance.now() - start) / wall);
      setP(f);
      if (f >= 1) timers.clear();
    }, 40);
  };

  useEffect(() => { timers.clear(); setP(null); }, [R, timers]);

  const size = 56 * (R / 512);
  const verdict = secs <= 180 ? 'inline, with a progress bar' : secs <= 900 ? 'a background job' : 'a queue and a notification';

  return (
    <Specimen
      height={300}
      readout={
        <>
          ({R}/8)² = {fmt(tokens)} tokens · <span className="text-ink">{time(secs)}</span> at 30 tok/s
          {p !== null && <> · emitted {fmt(Math.round(p * tokens))} (playback x{SPEED})</>}
        </>
      }
      controls={
        <div className="flex w-full flex-col items-center gap-3">
          <Range label="Resolution" value={R} min={512} max={2048} step={128} onChange={setR} shown={`${R}px`} verdict={verdict} />
          <Pill onClick={generate}>Generate</Pill>
        </div>
      }
    >
      <motion.div
        className="relative overflow-hidden rounded-[var(--r-sm)]"
        animate={{ width: size, height: size }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        style={{ boxShadow: 'var(--shadow-card)', background: 'var(--surface-2)' }}
      >
        <div className="grid size-full" style={{ gridTemplateColumns: 'repeat(32, 1fr)' }}>
          {CAT32.map((v, i) => <span key={i} style={{ background: 'var(--ink)', opacity: v }} />)}
        </div>
        <div className="absolute inset-x-0 bottom-0" style={{ top: `${(p ?? 0) * 100}%`, background: 'var(--surface-2)' }} />
        {p !== null && p < 1 && <div className="absolute inset-x-0 h-px" style={{ top: `${p * 100}%`, background: 'var(--accent)' }} />}
      </motion.div>
    </Specimen>
  );
}

// ── 12.13 · Transfusion: one mask, two losses ───────────────────────────────
const SEQ: { s: string; patch: boolean }[] = [
  ...['a', 'red', 'kite', '<BOI>'].map((s) => ({ s, patch: false })),
  ...Array.from({ length: 16 }, (_, i) => ({ s: `P${i + 1}`, patch: true })),
  ...['<EOI>', 'in', 'sky'].map((s) => ({ s, patch: false })),
];

export function TransfusionSpecimen() {
  const [mode, setMode] = useState<'causal' | 'transfusion'>('transfusion');
  const [sel, setSel] = useState(9);
  const sees = (i: number, j: number) => j <= i || (mode === 'transfusion' && SEQ[i].patch && SEQ[j].patch);
  const visible = SEQ.filter((_, j) => sees(sel, j)).length;
  const ahead = SEQ.filter((_, j) => j > sel && sees(sel, j)).length;
  const C = 7;

  const chip = (i: number) => {
    const on = i === sel;
    const vis = sees(sel, i);
    return {
      onClick: () => setSel(i),
      style: {
        background: on ? 'var(--accent)' : vis ? 'var(--surface-2)' : 'transparent',
        color: on ? 'var(--bg)' : vis ? 'var(--ink)' : 'var(--ink-4)',
        border: '0.5px solid var(--hairline-2)',
      },
    };
  };

  return (
    <Specimen
      height={300}
      readout={
        <>
          {SEQ[sel].s} attends to {visible} of {SEQ.length} · {ahead} ahead of it · loss: <span className="text-ink">{SEQ[sel].patch ? 'denoise (diffusion)' : 'next token (LM)'}</span>
        </>
      }
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'causal', label: 'Causal everywhere' }, { value: 'transfusion', label: 'Transfusion mask' }]} />}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-1">
          {SEQ.slice(0, 4).map((x, i) => (
            <button key={x.s} {...chip(i)} className="rounded-[var(--r-sm)] px-1.5 py-0.5 t-caption t-mono" >{x.s}</button>
          ))}
          <div className="grid grid-cols-4 gap-[2px] px-1">
            {SEQ.slice(4, 20).map((x, k) => (
              <button key={x.s} aria-label={x.s} {...chip(k + 4)} className="size-[11px] rounded-[2px]" />
            ))}
          </div>
          {SEQ.slice(20).map((x, k) => (
            <button key={x.s} {...chip(k + 20)} className="rounded-[var(--r-sm)] px-1.5 py-0.5 t-caption t-mono">{x.s}</button>
          ))}
        </div>
        <div className="relative" style={{ width: SEQ.length * C, height: SEQ.length * C }}>
          {SEQ.map((_, i) => SEQ.map((__, j) => {
            const vis = sees(i, j);
            return (
              <span
                key={`${i}-${j}`}
                onClick={() => setSel(i)}
                className="absolute"
                style={{
                  left: j * C, top: i * C, width: C - 1, height: C - 1,
                  background: vis ? (i === sel ? 'var(--accent)' : 'var(--ink-4)') : 'var(--surface-2)',
                  opacity: vis && i !== sel ? 0.55 : 1,
                }}
              />
            );
          }))}
          {mode === 'transfusion' && (
            <span className="pointer-events-none absolute" style={{ left: 4 * C - 1, top: 4 * C - 1, width: 16 * C + 1, height: 16 * C + 1, border: '1px dashed var(--accent)' }} />
          )}
        </div>
      </div>
    </Specimen>
  );
}

// ── 12.14 · Show-o: sixteen parallel unmask rounds ──────────────────────────
const STEPS = 16;
const PASS_MS = 90;
const masked = (t: number) => Math.round(1024 * Math.cos((Math.PI / 2) * (t / STEPS)));
const CONF = Array.from({ length: 1024 }, (_, i) => i).sort((a, b) => rand(b + 5) - rand(a + 5));
const RANK = (() => { const r = new Array<number>(1024); CONF.forEach((cell, k) => { r[cell] = k; }); return r; })();

export function ShowOSpecimen() {
  const { reduce } = useMotion();
  const [mode, setMode] = useState<'ar' | 'parallel'>('parallel');
  const [pass, setPass] = useState(0);
  const timers = useTimers();
  const total = mode === 'ar' ? 1024 : STEPS;

  const play = (m = mode) => {
    timers.clear();
    const end = m === 'ar' ? 1024 : STEPS;
    if (reduce) { setPass(end); return; }
    setPass(0);
    let k = 0;
    timers.every(() => { k += 1; setPass(k); if (k >= end) timers.clear(); }, PASS_MS);
  };

  useEffect(() => { play('parallel'); }, []);

  const committed = mode === 'ar' ? pass : 1024 - masked(pass);
  const prev = mode === 'ar' ? pass - 1 : 1024 - masked(Math.max(0, pass - 1));
  const state = (i: number) => {
    const order = mode === 'ar' ? i : RANK[i];
    if (order >= committed) return 'mask';
    return order >= prev ? 'new' : 'done';
  };

  return (
    <Specimen
      height={300}
      readout={
        <>
          passes {pass}/{total} · committed {fmt(committed)}/1,024 · ~{fmt(pass * 25)}ms of model time at 25ms a pass
          {mode === 'ar' && pass < 1024 && <> · {Math.ceil(((1024 - pass) * PASS_MS) / 1000)}s of playback left</>}
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => { setMode(m); play(m); }} options={[{ value: 'ar', label: 'Autoregressive' }, { value: 'parallel', label: 'Masked parallel' }]} />
          <Pill onClick={() => play()}>Replay</Pill>
        </div>
      }
    >
      <div className="grid overflow-hidden rounded-[var(--r-sm)]" style={{ gridTemplateColumns: 'repeat(32, 6px)', gap: 1, boxShadow: 'var(--shadow-card)', background: 'var(--surface)', padding: 4 }}>
        {CAT32.map((v, i) => {
          const s = state(i);
          return (
            <span
              key={i}
              className="size-[6px]"
              style={{
                background: s === 'mask' ? 'var(--surface-2)' : s === 'new' ? 'var(--accent)' : 'var(--ink)',
                opacity: s === 'done' ? v : 1,
              }}
            />
          );
        })}
      </div>
    </Specimen>
  );
}

// ── 12.17 · temporal grounding: an answer you can seek to ───────────────────
const CLIP = 16;
const JUMP: [number, number] = [6.3, 6.8];

export function TemporalGroundingSpecimen() {
  const [mode, setMode] = useState<'clip' | 'time'>('clip');
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timers = useTimers();
  const seekTo = mode === 'clip' ? 4 : JUMP[0];
  const win: [number, number] = mode === 'clip' ? [4, 8] : JUMP;

  const play = (from: number) => {
    timers.clear();
    setT(from);
    setPlaying(true);
    const start = performance.now();
    const until = Math.min(CLIP, from + 3);
    timers.every(() => {
      const now = Math.min(until, from + (performance.now() - start) / 1000);
      setT(now);
      if (now >= until) { timers.clear(); setPlaying(false); }
    }, 33);
  };

  const switchMode = (m: 'clip' | 'time') => { timers.clear(); setPlaying(false); setT(0); setMode(m); };
  const jumpY = t >= JUMP[0] && t <= JUMP[1] ? Math.sin((Math.PI * (t - JUMP[0])) / (JUMP[1] - JUMP[0])) * 34 : 0;
  const W = 400;

  return (
    <Specimen
      height={320}
      readout={<>answer resolves to {win[0].toFixed(1)}-{win[1].toFixed(1)}s · seek lands <span className="text-ink">{(JUMP[0] - seekTo).toFixed(1)}s</span> before the jump</>}
      controls={<Segmented value={mode} onChange={switchMode} options={[{ value: 'clip', label: 'Per-clip position' }, { value: 'time', label: 'Timestamp tokens' }]} />}
    >
      <Window width={440}>
        <div className="relative h-[120px]" style={{ background: 'var(--surface-2)' }}>
          <span className="absolute inset-x-0 bottom-6" style={{ borderTop: '0.5px solid var(--hairline)' }} />
          <div className="absolute bottom-6 left-[55%] flex flex-col items-center" style={{ transform: `translateY(${-jumpY}px)` }}>
            <div className="flex gap-2.5"><span className="size-0 border-x-[4px] border-b-[6px] border-x-transparent" style={{ borderBottomColor: 'var(--ink-2)' }} /><span className="size-0 border-x-[4px] border-b-[6px] border-x-transparent" style={{ borderBottomColor: 'var(--ink-2)' }} /></div>
            <span className="h-[16px] w-[24px] rounded-[6px]" style={{ background: 'var(--ink-2)' }} />
          </div>
          <span className="absolute right-2 top-2 t-caption t-mono text-ink-3" style={{ letterSpacing: 0 }}>0:{t.toFixed(1).padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <svg width={W} height={22} className="max-w-full cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); timers.clear(); setPlaying(false); setT(((e.clientX - r.left) / r.width) * CLIP); }}>
            <rect x={0} y={6} width={W} height={10} rx={2} fill="var(--surface-2)" />
            <rect x={(win[0] / CLIP) * W} y={6} width={((win[1] - win[0]) / CLIP) * W} height={10} fill="var(--accent)" opacity={0.35} />
            {mode === 'clip' && [1, 2, 3].map((k) => <line key={k} x1={(k * W) / 4} x2={(k * W) / 4} y1={2} y2={20} stroke="var(--hairline)" />)}
            <line x1={(t / CLIP) * W} x2={(t / CLIP) * W} y1={0} y2={22} stroke="var(--ink)" strokeWidth={1.5} />
          </svg>
          <div className="flex items-center gap-2 t-sm">
            <span className="text-ink-3">At what second does the cat jump?</span>
            <button
              onClick={() => play(seekTo)}
              disabled={playing}
              className="t-mono rounded-[var(--r-pill)] px-2.5 py-0.5 t-caption"
              style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline)', color: 'var(--ink)', letterSpacing: 0 }}
            >
              {mode === 'clip' ? '"Early in segment 2."' : `{"start": ${JUMP[0]}, "end": ${JUMP[1]}}`}
            </button>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.18 · long video: duration hits walls ─────────────────────────────────
const DURS = [1, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180];

export function LongVideoSpecimen() {
  const [k, setK] = useState(5);
  const min = DURS[k];
  const tokens = min * 60 * TPF;
  const tier =
    tokens <= 32768 ? { chip: 'Fits 32k', path: 'any open VLM, one pass', tone: 'good' as const }
      : tokens <= 131072 ? { chip: 'Fits 128k', path: 'brute context: an open 72B, one pass', tone: 'good' as const }
        : min < 120 ? { chip: 'Compress', path: 'token compression or ring attention, or rent a 1M context', tone: 'warn' as const }
          : { chip: 'Retrieve', path: 'agentic retrieval: search the video, never load it', tone: 'bad' as const };
  const LO = Math.log10(4000);
  const HI = Math.log10(2_000_000);
  const x = (v: number) => ((Math.log10(v) - LO) / (HI - LO)) * 100;

  return (
    <Specimen
      height={240}
      readout={<>{min} min x 60 x 81 = <span className="text-ink">{fmt(tokens)}</span> tokens · {tier.path}</>}
      controls={<Range label="Recording" value={k} min={0} max={DURS.length - 1} onChange={setK} shown={`${min} min`} verdict={<><Dot tone={tier.tone} /> {tier.chip}</>} />}
    >
      <Window width={440}>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between t-sm">
            <span className="flex items-center gap-2 text-ink"><FileVideo size={14} className="text-ink-4" /> all-hands.mp4</span>
            <Meta>{Math.floor(min / 60)}:{String(min % 60).padStart(2, '0')}:00 · 1 FPS</Meta>
          </div>
          <div className="relative h-[46px]">
            <div className="absolute inset-x-0 top-[14px] h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
              <motion.div className="h-full rounded-full" animate={{ width: `${Math.min(100, x(tokens))}%` }} transition={{ duration: 0.2 }} style={{ background: tier.tone === 'bad' ? 'var(--anti)' : 'var(--accent)' }} />
            </div>
            {[{ v: 32768, l: '32k' }, { v: 131072, l: '128k' }, { v: 1_000_000, l: '1M' }].map((m) => (
              <div key={m.l} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${x(m.v)}%` }}>
                <span className="h-[34px]" style={{ borderLeft: '1px dashed var(--ink-4)' }} />
                <Meta>{m.l}</Meta>
              </div>
            ))}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.19 · audio-language: what the transcript drops ───────────────────────
const A0 = 38;
const A1 = 44;
const AUDIO: { from: number; to: number; word: string | null; amp: number; cue: string }[] = [
  { from: 38.0, to: 40.1, word: null, amp: 0.03, cue: 'pause: 2.1s of silence before the reply' },
  { from: 40.1, to: 40.6, word: 'Fine.', amp: 0.8, cue: 'tone: clipped, flat pitch, 40% louder than her baseline' },
  { from: 40.6, to: 41.3, word: null, amp: 0.05, cue: 'impulse at 00:41: a keyboard slam' },
  { from: 41.3, to: 42.3, word: "Let's go with", amp: 0.4, cue: 'speaker: Priya, not Sam' },
  { from: 42.3, to: 42.8, word: 'your', amp: 0.72, cue: 'stress peak on "your": sarcasm' },
  { from: 42.8, to: 44.0, word: 'plan then.', amp: 0.35, cue: 'falling pitch, trailing off' },
];
const BARS = 96;
const segAt = (t: number) => AUDIO.find((s) => t >= s.from && t < s.to) ?? AUDIO[AUDIO.length - 1];
const AMPS = Array.from({ length: BARS }, (_, i) => {
  const t = A0 + ((i + 0.5) / BARS) * (A1 - A0);
  const s = segAt(t);
  const slam = Math.abs(t - 41.0) < 0.05 ? 0.95 : 0;
  return Math.max(slam, s.amp * (0.55 + 0.45 * rand(i + 3)));
});

export function AudioCuesSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [at, setAt] = useState<number | null>(null);
  const W = 420;
  const seg = at === null ? null : segAt(at);
  const slamHover = at !== null && Math.abs(at - 41.0) < 0.15;

  const info = !seg
    ? <>cues reaching the model: <span className="text-ink">{mode === 'text' ? 0 : 5}/5</span> · hover the waveform</>
    : mode === 'text'
      ? seg.word && !slamHover ? <>model receives: "{seg.word}" · no speaker, tone, or timing</> : <>model receives: nothing · silence and noise never reach a transcript</>
      : <>model receives: {slamHover ? 'impulse at 00:41: a keyboard slam' : seg.cue}</>;

  return (
    <Specimen
      height={280}
      readout={info}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'Transcript in' }, { value: 'audio', label: 'Audio in' }]} />}
    >
      <Window width={460}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex justify-between"><Meta>standup.m4a · 00:38-00:44</Meta><Meta>{mode === 'text' ? 'ASR text' : 'audio tokens'}</Meta></div>
          <div
            className="relative h-[70px]"
            style={{ width: W, maxWidth: '100%' }}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAt(A0 + ((e.clientX - r.left) / r.width) * (A1 - A0)); }}
            onMouseLeave={() => setAt(null)}
          >
            <div className="absolute inset-0 flex items-center gap-[1px]">
              {AMPS.map((a, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-full"
                  animate={{ height: Math.max(2, a * 64), opacity: mode === 'text' ? 0.12 : 0.75 }}
                  transition={t()}
                  style={{ background: 'var(--ink)' }}
                />
              ))}
            </div>
            <AnimatePresence>
              {mode === 'text' && AUDIO.filter((s) => s.word).map((s) => (
                <motion.span
                  key={s.from}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={t()}
                  className="absolute top-1/2 -translate-y-1/2 truncate rounded-[var(--r-sm)] px-1 text-center t-sm text-ink"
                  style={{ left: `${((s.from - A0) / (A1 - A0)) * 100}%`, width: `${((s.to - s.from) / (A1 - A0)) * 100}%`, background: 'var(--surface)', border: '0.5px solid var(--hairline)' }}
                >
                  {s.word}
                </motion.span>
              ))}
            </AnimatePresence>
            {at !== null && <span className="pointer-events-none absolute inset-y-0" style={{ left: `${((at - A0) / (A1 - A0)) * 100}%`, borderLeft: '1px solid var(--accent)' }} />}
          </div>
          <div className="rounded-[var(--r-sm)] px-2.5 py-2 t-sm" style={{ background: 'var(--surface-2)' }}>
            <span className="text-ink-4">Notes · </span>
            <span className="text-ink">
              {mode === 'text' ? 'Speaker 2 agreed to the plan.' : 'Priya agreed after a 2.1s pause, clipped and loud. Likely not on board.'}
            </span>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.20 · Thinker-Talker: the Talker must keep up ─────────────────────────
const TALKER = [0.2, 0.3, 0.5, 1, 2, 3, 7, 14];
const SPEECH_HZ = 50;
const SPEECH_TOKENS = 300;
const PREBUFFER = 10;

function talk(rate: number) {
  const g = (k: number) => (k + 1) / rate;
  const segs: [number, number][] = [];
  let t = g(PREBUFFER - 1);
  let start = t;
  let k = 0;
  while (k < SPEECH_TOKENS) {
    if (g(k) <= t + 1e-9) { t += 1 / SPEECH_HZ; k++; }
    else { segs.push([start, t]); t = g(Math.min(k + PREBUFFER - 1, SPEECH_TOKENS - 1)); start = t; }
  }
  segs.push([start, t]);
  return { first: g(PREBUFFER - 1), segs, end: t };
}

export function TalkerSpecimen() {
  const { reduce } = useMotion();
  const [k, setK] = useState(1);
  const [head, setHead] = useState(0);
  const timers = useTimers();
  const params = TALKER[k];
  const rate = 280 / params;
  const sim = useMemo(() => talk(rate), [rate]);
  const stalls = sim.segs.length - 1;
  const span = Math.max(9, Math.ceil(sim.end));

  useEffect(() => {
    timers.clear();
    if (reduce) { setHead(sim.end); return; }
    setHead(0);
    const start = performance.now();
    timers.every(() => {
      const now = (performance.now() - start) / 1000;
      setHead(Math.min(now, sim.end));
      if (now >= sim.end) timers.clear();
    }, 33);
  }, [sim, reduce, timers]);

  const speaking = sim.segs.some(([a, b]) => head >= a && head < b);
  const done = head >= sim.end;

  return (
    <Specimen
      height={250}
      readout={<>{params}B Talker ≈ {Math.round(rate)} speech tok/s (sim: 280 / params) · needs 50 · first audio +{Math.round(sim.first * 1000)}ms · stalls <span className={stalls ? 'text-[var(--anti)]' : 'text-ink'}>{stalls}</span></>}
      controls={
        <Range
          label="Talker size" value={k} min={0} max={TALKER.length - 1} onChange={setK} shown={`${params}B`}
          verdict={rate >= SPEECH_HZ ? <><Dot tone="good" /> keeps up, {(rate / SPEECH_HZ).toFixed(1)}x headroom</> : <><Dot tone="bad" /> starves: 6.0s of speech takes {sim.end.toFixed(1)}s</>}
        />
      }
    >
      <Window width={460}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 items-center gap-[3px] rounded-[var(--r-pill)] px-3" style={{ background: 'var(--surface-2)' }}>
              {Array.from({ length: 7 }, (_, i) => (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full"
                  animate={{ height: speaking && !reduce ? [4, 6 + 10 * rand(i), 4] : 4 }}
                  transition={{ duration: 0.4, repeat: speaking && !reduce ? Infinity : 0, delay: i * 0.05 }}
                  style={{ background: speaking ? 'var(--ink)' : 'var(--ink-4)' }}
                />
              ))}
            </span>
            <span className="t-sm text-ink-3">{done ? 'reply finished' : speaking ? 'speaking' : head < sim.first ? 'thinking' : 'buffering…'}</span>
          </div>
          <svg width="100%" height={34} viewBox={`0 0 420 34`} preserveAspectRatio="none">
            <rect x={0} y={8} width={420} height={14} rx={2} fill="var(--surface-2)" />
            {sim.segs.map(([a, b], i) => (
              <rect key={i} x={(a / span) * 420} y={8} width={Math.max(0.5, ((b - a) / span) * 420)} height={14} fill="var(--ink-3)" />
            ))}
            {sim.segs.slice(1).map(([a], i) => (
              <rect key={`g${i}`} x={(sim.segs[i][1] / span) * 420} y={24} width={Math.max(1, ((a - sim.segs[i][1]) / span) * 420)} height={3} fill="var(--anti)" />
            ))}
            <line x1={(Math.min(head, span) / span) * 420} x2={(Math.min(head, span) / span) * 420} y1={2} y2={30} stroke="var(--accent)" strokeWidth={1.5} />
          </svg>
          <div className="flex justify-between"><Meta>0s</Meta><Meta>bars: audio playing · red: stalled</Meta><Meta>{span}s</Meta></div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 12.21 · embodied VLAs: actions as 256 bins ──────────────────────────────
const BINS = [4, 8, 16, 32, 64, 128, 256];
const WS = { w: 600, h: 400, px: 0.6 };

export function ActionBinsSpecimen() {
  const { t } = useMotion();
  const [k, setK] = useState(2);
  const [target, setTarget] = useState({ x: 412, y: 168 });
  const n = BINS[k];
  const bin = (v: number, size: number) => Math.min(n - 1, Math.floor((v / size) * n));
  const bx = bin(target.x, WS.w);
  const by = bin(target.y, WS.h);
  const gx = ((bx + 0.5) / n) * WS.w;
  const gy = ((by + 0.5) / n) * WS.h;
  const err = Math.hypot(gx - target.x, gy - target.y);
  const lands = Math.abs(gx - target.x) < 10 && Math.abs(gy - target.y) < 10;

  return (
    <Specimen
      height={300}
      readout={<>x bin {bx}/{n} · y bin {by}/{n} · error <span className="text-ink">{err.toFixed(1)}mm</span> · {Math.log2(n)} bits per action token · click the table</>}
      controls={
        <Range
          label="Bins per action dimension" value={k} min={0} max={BINS.length - 1} onChange={setK} shown={n}
          verdict={lands ? <><Dot tone="good" /> lands on the 20mm part</> : <><Dot tone="bad" /> misses the 20mm part</>}
        />
      }
    >
      <div
        className="relative cursor-crosshair overflow-hidden rounded-[var(--r-md)]"
        style={{ width: WS.w * WS.px, height: WS.h * WS.px, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTarget({ x: ((e.clientX - r.left) / r.width) * WS.w, y: ((e.clientY - r.top) / r.height) * WS.h }); }}
      >
        {n <= 64 && Array.from({ length: n - 1 }, (_, i) => (
          <span key={`v${i}`} className="absolute inset-y-0" style={{ left: `${((i + 1) / n) * 100}%`, borderLeft: '0.5px solid var(--hairline-2)' }} />
        ))}
        {n <= 64 && Array.from({ length: n - 1 }, (_, i) => (
          <span key={`h${i}`} className="absolute inset-x-0" style={{ top: `${((i + 1) / n) * 100}%`, borderTop: '0.5px solid var(--hairline-2)' }} />
        ))}
        <span className="absolute rounded-[2px]" style={{ left: (target.x - 10) * WS.px, top: (target.y - 10) * WS.px, width: 20 * WS.px, height: 20 * WS.px, background: 'var(--ink-3)' }} />
        <motion.div className="pointer-events-none absolute" animate={{ left: gx * WS.px - 9, top: gy * WS.px - 9 }} transition={t(0.3)} style={{ width: 18, height: 18 }}>
          <span className="absolute inset-x-0 top-1/2" style={{ borderTop: '1.5px solid var(--accent)' }} />
          <span className="absolute inset-y-0 left-1/2" style={{ borderLeft: '1.5px solid var(--accent)' }} />
          <span className="absolute inset-[4px] rounded-full" style={{ border: '1.5px solid var(--accent)' }} />
        </motion.div>
      </div>
    </Specimen>
  );
}

// ── 12.22 · document AI: reading order vs layout ────────────────────────────
type Word = { s: string; x: number; y: number; region: 'header' | 'table' | 'summary' | 'footer'; money?: boolean };
const INVOICE: Word[] = [
  { s: 'ACME Corp', x: 14, y: 12, region: 'header' },
  { s: 'Invoice #8841', x: 196, y: 12, region: 'header' },
  { s: 'Net 30', x: 196, y: 28, region: 'header' },
  { s: 'Item', x: 14, y: 54, region: 'table' },
  { s: 'Qty', x: 130, y: 54, region: 'table' },
  { s: 'Amount', x: 220, y: 54, region: 'table' },
  { s: 'Widget A', x: 14, y: 72, region: 'table' },
  { s: '12', x: 130, y: 72, region: 'table' },
  { s: '$340.00', x: 220, y: 72, region: 'table', money: true },
  { s: 'Widget B', x: 14, y: 90, region: 'table' },
  { s: '3', x: 130, y: 90, region: 'table' },
  { s: '$905.00', x: 220, y: 90, region: 'table', money: true },
  { s: 'Subtotal', x: 140, y: 118, region: 'summary' },
  { s: 'Tax 10%', x: 140, y: 134, region: 'summary' },
  { s: 'Total', x: 140, y: 150, region: 'summary' },
  { s: '$1,245.00', x: 212, y: 118, region: 'summary', money: true },
  { s: '$124.50', x: 212, y: 134, region: 'summary', money: true },
  { s: '$1,369.50', x: 212, y: 150, region: 'summary', money: true },
  { s: 'Thank you', x: 14, y: 178, region: 'footer' },
];
const TOTAL_IX = INVOICE.findIndex((w) => w.s === 'Total');
const FLAT_ANSWER = INVOICE.findIndex((w, i) => i > TOTAL_IX && w.money);
const LAYOUT_ANSWER = INVOICE.findIndex((w) => w.money && Math.abs(w.y - INVOICE[TOTAL_IX].y) < 4 && w.x > INVOICE[TOTAL_IX].x);
const REGIONS = [
  { r: 'header', x: 8, y: 6, w: 284, h: 38 },
  { r: 'table', x: 8, y: 48, w: 284, h: 60 },
  { r: 'summary', x: 134, y: 112, w: 158, h: 54 },
];

export function DocLayoutSpecimen() {
  const [mode, setMode] = useState<'flat' | 'layout'>('flat');
  const [hover, setHover] = useState<number | null>(null);
  const answer = mode === 'flat' ? FLAT_ANSWER : LAYOUT_ANSWER;
  const h = hover === null ? null : INVOICE[hover];

  return (
    <Specimen
      height={320}
      readout={
        h
          ? mode === 'flat'
            ? <>"{h.s}" · token {hover! + 1} of {INVOICE.length} · position and role: unknown</>
            : <>"{h.s}" · box at ({h.x}, {h.y}) · region: {h.region}</>
          : mode === 'flat'
            ? <>"Total" is token {TOTAL_IX + 1} · next number in reading order: <span className="text-[var(--anti)]">{INVOICE[answer].s}</span> (the subtotal)</>
            : <>"Total" at y={INVOICE[TOTAL_IX].y} · value on the same row: <span className="text-ink">{INVOICE[answer].s}</span></>
      }
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'flat', label: 'Flat OCR text' }, { value: 'layout', label: 'Layout-aware' }]} />}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 t-sm"><span className="text-ink-3">Q:</span><span className="text-ink">What is the total?</span><span className="t-mono text-ink-3">→ {INVOICE[answer].s}</span></div>
        <div className="relative rounded-[var(--r-sm)]" style={{ width: 300, height: 196, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
          {mode === 'layout' && REGIONS.map((r) => (
            <span key={r.r} className="absolute rounded-[3px]" style={{ left: r.x, top: r.y, width: r.w, height: r.h, border: '0.5px dashed var(--ink-4)' }} />
          ))}
          {INVOICE.map((w, i) => (
            <span
              key={w.s}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="absolute cursor-default whitespace-nowrap rounded-[2px] px-0.5 t-caption"
              style={{
                left: w.x, top: w.y, letterSpacing: 0,
                color: w.region === 'header' && i === 0 ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: i === 0 || w.s === 'Total' ? 600 : 400,
                background: i === answer ? 'var(--accent)' : i === hover ? 'var(--surface-2)' : undefined,
                ...(i === answer ? { color: 'var(--bg)' } : {}),
              }}
            >
              {w.s}
            </span>
          ))}
        </div>
        {mode === 'flat' && (
          <div className="w-[420px] max-w-full truncate t-caption t-mono text-ink-4" style={{ letterSpacing: 0 }}>
            {INVOICE.map((w, i) => (
              <span key={w.s} style={{ color: i === hover ? 'var(--ink)' : i === answer ? 'var(--accent)' : undefined }}>{w.s} </span>
            ))}
          </div>
        )}
      </div>
    </Specimen>
  );
}

// ── 12.23 · ColPali: MaxSim over patches ────────────────────────────────────
type Vec = [number, number, number, number];
type Patch = { v: Vec; text: boolean; draw: 'bar' | 'line' | 'title' | 'blank' | 'label'; h?: number };
const QUERY = ['Q3', 'revenue', 'growth'] as const;
const QVEC: Record<(typeof QUERY)[number], Vec> = { Q3: [0, 1, 0, 0], revenue: [1, 0, 0, 0], growth: [0, 0, 1, 0] };
const COLS = 6;
const ROWS = 8;

function pageA(r: number, c: number): Patch {
  if (r === 0) return { v: [0.6, 0, 0, 0.3], text: true, draw: 'title' };
  if (r === 7) return { v: [0.3, 0, 0, 0.5], text: true, draw: 'line' };
  if (r === 6) return c >= 1 && c <= 4 ? { v: [0, c === 3 ? 0.5 : 0, 0, 0], text: true, draw: 'label' } : { v: [0, 0, 0, 0], text: false, draw: 'blank' };
  const heights = [0, 2, 3, 5, 4, 0];
  const inBar = heights[c] > 0 && 6 - r <= heights[c];
  if (!inBar) return { v: [0.2, 0, 0, 0], text: false, draw: 'blank' };
  return c === 3 ? { v: [0.2, 0.8, 0.7, 0], text: false, draw: 'bar', h: 1 } : { v: [0.2, 0, 0, 0], text: false, draw: 'bar', h: 1 };
}
function pageB(r: number): Patch {
  return r === 0 ? { v: [0.5, 0, 0, 0.6], text: true, draw: 'title' } : { v: [0.5, 0.1, 0.4, 0.8], text: true, draw: 'line' };
}
const PAGES = [
  { name: 'Q3 report p.7', patches: Array.from({ length: COLS * ROWS }, (_, i) => pageA(Math.floor(i / COLS), i % COLS)) },
  { name: 'Strategy memo p.3', patches: Array.from({ length: COLS * ROWS }, (_, i) => pageB(Math.floor(i / COLS))) },
];
const dot = (a: Vec, b: Vec) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = (a: Vec) => Math.sqrt(dot(a, a));

export function ColPaliSpecimen() {
  const [mode, setMode] = useState<'text' | 'maxsim'>('maxsim');
  const [q, setQ] = useState<(typeof QUERY)[number]>('Q3');

  const scored = PAGES.map((p) => {
    const best = Object.fromEntries(QUERY.map((qt) => {
      let bi = 0;
      p.patches.forEach((pt, i) => { if (dot(QVEC[qt], pt.v) > dot(QVEC[qt], p.patches[bi].v)) bi = i; });
      return [qt, { i: bi, s: dot(QVEC[qt], p.patches[bi].v) }];
    })) as Record<(typeof QUERY)[number], { i: number; s: number }>;
    const maxsim = QUERY.reduce((s, qt) => s + best[qt].s, 0);
    const texts = p.patches.filter((pt) => pt.text);
    const mean = texts.reduce<Vec>((m, pt) => m.map((x, i) => x + pt.v[i] / texts.length) as Vec, [0, 0, 0, 0]);
    const qv = QUERY.reduce<Vec>((m, qt) => m.map((x, i) => x + QVEC[qt][i] / QUERY.length) as Vec, [0, 0, 0, 0]);
    const cos = dot(qv, mean) / (norm(qv) * norm(mean));
    return { ...p, best, score: mode === 'maxsim' ? maxsim : cos, lost: p.patches.filter((pt) => !pt.text && pt.draw === 'bar').length };
  });
  const top = scored[0].score >= scored[1].score ? 0 : 1;
  const P = 15;

  return (
    <Specimen
      height={310}
      readout={
        mode === 'maxsim'
          ? <>"{q}" best patch: p.7 {scored[0].best[q].s.toFixed(2)} · p.3 {scored[1].best[q].s.toFixed(2)} · page scores {scored[0].score.toFixed(2)} vs {scored[1].score.toFixed(2)}</>
          : <>one vector per page · cosine p.7 {scored[0].score.toFixed(2)} vs p.3 {scored[1].score.toFixed(2)} · chart patches extracted: 0 of {scored[0].lost}</>
      }
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'Text-RAG, one vector' }, { value: 'maxsim', label: 'ColPali, MaxSim' }]} />}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5 t-sm">
          <span className="text-ink-3">Query</span>
          {QUERY.map((qt) => (
            <button
              key={qt}
              onClick={() => setQ(qt)}
              className="rounded-[var(--r-pill)] px-2.5 py-0.5 t-sm"
              style={{ background: q === qt && mode === 'maxsim' ? 'var(--accent)' : 'var(--surface-2)', color: q === qt && mode === 'maxsim' ? 'var(--bg)' : 'var(--ink-2)' }}
            >
              {qt}
            </button>
          ))}
        </div>
        <div className="flex gap-6">
          {scored.map((p, pi) => (
            <div key={p.name} className="flex flex-col items-center gap-1.5">
              <div className="relative grid overflow-hidden rounded-[2px] p-1" style={{ gridTemplateColumns: `repeat(${COLS}, ${P}px)`, background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
                {p.patches.map((pt, i) => {
                  const hit = mode === 'maxsim' && p.best[q].i === i;
                  const gone = mode === 'text' && !pt.text;
                  return (
                    <span key={i} className="relative flex items-center justify-center" style={{ width: P, height: P, outline: hit ? '1.5px solid var(--accent)' : undefined, outlineOffset: -1, zIndex: hit ? 1 : 0, opacity: gone ? 0.15 : 1 }}>
                      {pt.draw === 'bar' && <span className="absolute inset-x-[2px] inset-y-0" style={{ background: pi === 0 && i % COLS === 3 ? 'var(--ink-2)' : 'var(--ink-4)' }} />}
                      {pt.draw === 'line' && <span className="h-[2px] w-full" style={{ background: 'var(--hairline)' }} />}
                      {pt.draw === 'title' && <span className="h-[4px] w-full" style={{ background: 'var(--ink-3)' }} />}
                      {pt.draw === 'label' && <span className="h-[2px] w-1/2" style={{ background: 'var(--ink-4)' }} />}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Meta>{p.name}</Meta>
                <span className="t-caption t-mono rounded-[var(--r-sm)] px-1" style={{ letterSpacing: 0, background: pi === top ? 'var(--ink)' : 'var(--surface-2)', color: pi === top ? 'var(--bg)' : 'var(--ink-3)' }}>
                  #{pi === top ? 1 : 2}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

// ── 12.24 · multimodal RAG: fusion hides a dead retriever ───────────────────
const W3 = [0.6, 0.3, 0.1] as const;
const FLOOR = 0.5;
const PLACES = [
  { name: 'Cafe Flora', s: [0.92, 0.88, 0.21] },
  { name: 'Plum Bistro', s: [0.78, 0.74, 0.81] },
  { name: 'Juniper', s: [0.72, 0.8, 0.75] },
];
const MODS = ['Reviews', 'Photos', 'Ambience audio'];

export function FusionSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'sum' | 'floor'>('sum');
  const rows = PLACES.map((p) => ({ ...p, c: p.s.reduce((a, v, i) => a + v * W3[i], 0), weak: p.s.findIndex((v) => v < FLOOR) }))
    .sort((a, b) => (mode === 'floor' && (a.weak >= 0) !== (b.weak >= 0) ? (a.weak >= 0 ? 1 : -1) : b.c - a.c));
  const flora = rows.find((r) => r.name === 'Cafe Flora')!;

  return (
    <Specimen
      height={300}
      readout={
        mode === 'sum'
          ? <>Cafe Flora = 0.6 x 0.92 + 0.3 x 0.88 + 0.1 x 0.21 = <span className="text-ink">{flora.c.toFixed(2)}</span> · top result · "quiet" has no evidence</>
          : <>audio {flora.s[2].toFixed(2)} &lt; {FLOOR} floor → Cafe Flora drops to #{rows.indexOf(flora) + 1} · top: {rows[0].name} {rows[0].c.toFixed(2)}</>
      }
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'sum', label: 'Weighted sum' }, { value: 'floor', label: 'Sum + per-modality floor' }]} />}
    >
      <Window width={440}>
        <div className="px-3 py-2 t-sm text-ink-3" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>quiet vegan brunch with natural light</div>
        {rows.map((r, i) => (
          <motion.div key={r.name} layout transition={t()} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
            <span className="t-mono t-sm w-4 text-ink-4">{i + 1}</span>
            <span className="w-[92px] t-sm font-medium text-ink">{r.name}</span>
            <div className="flex flex-1 flex-col gap-1">
              {r.s.map((v, m) => (
                <div key={m} className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
                    <span className="block h-full rounded-full" style={{ width: `${v * 100}%`, background: v < FLOOR ? 'var(--anti)' : 'var(--ink-3)' }} />
                  </span>
                  <span className="w-[90px] truncate t-caption text-ink-4" style={{ letterSpacing: 0 }}>{MODS[m]}</span>
                </div>
              ))}
            </div>
            <span className="flex w-[64px] flex-col items-end">
              <span className="t-mono t-sm text-ink">{r.c.toFixed(2)}</span>
              {mode === 'floor' && r.weak >= 0 && <span className="t-caption" style={{ color: 'var(--anti)', letterSpacing: 0 }}>no {MODS[r.weak].split(' ')[0].toLowerCase()}</span>}
            </span>
          </motion.div>
        ))}
      </Window>
    </Specimen>
  );
}

// ── 12.25 · computer-use agents: gate the irreversible click ────────────────
const FLIGHTS = [
  { code: 'NH 110', time: '06:40', price: 910 },
  { code: 'JL 62', time: '11:05', price: 1240 },
  { code: 'ZG 24', time: '17:30', price: 760 },
];
type Frame = { page: 'results' | 'checkout'; cursor: [number, number] | null; pick: number | null; log: string; gate?: boolean; charge?: number };
const SELECT = (i: number): [number, number] => [262, 30 + i * 42];
const INPUT: [number, number] = [150, 44];
const PAY: [number, number] = [150, 120];
const attempt = (pick: number, read: string, opener: string): Frame[] => [
  { page: 'results', cursor: null, pick: null, log: opener },
  { page: 'results', cursor: SELECT(pick), pick, log: `{"click": "Select ${FLIGHTS[pick].code}", "read": "${read}"}` },
  { page: 'checkout', cursor: INPUT, pick, log: '{"type": "A. Rana"}' },
  { page: 'checkout', cursor: PAY, pick, log: '{"click": "Confirm and pay"}', gate: true },
  { page: 'checkout', cursor: PAY, pick, log: `charged $${fmt(FLIGHTS[pick].price)}`, charge: FLIGHTS[pick].price },
];
const FIRST = attempt(1, '$740', 'screenshot: 3 results');
const RETRY = attempt(2, '$760', 'observe: price is $1,240, over $800. back');

export function ComputerUseSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'open' | 'gated'>('open');
  const [frames, setFrames] = useState<Frame[]>(FIRST);
  const [ix, setIx] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [unreviewed, setUnreviewed] = useState(0);
  const timers = useTimers();
  const rejectRef = useRef<HTMLButtonElement>(null);
  const f = frames[ix];

  useEffect(() => { if (waiting) rejectRef.current?.focus({ preventScroll: true }); }, [waiting]);

  const run = (fr: Frame[], from: number, m: 'open' | 'gated') => {
    timers.clear();
    let k = from;
    timers.every(() => {
      if (k >= fr.length - 1) { timers.clear(); return; }
      if (fr[k].gate && m === 'gated') { timers.clear(); setWaiting(true); return; }
      if (fr[k].gate) setUnreviewed((u) => u + 1);
      k += 1;
      setIx(k);
    }, 1000);
  };

  const start = (m = mode) => {
    setMode(m); setFrames(FIRST); setIx(0); setWaiting(false); setUnreviewed(0);
    run(FIRST, 0, m);
  };

  useEffect(() => { start('open'); }, []);

  const decide = (ok: boolean) => {
    setWaiting(false);
    if (ok) { setIx(ix + 1); return; }
    const next = [...frames.slice(0, ix + 1), ...RETRY];
    setFrames(next);
    setIx(ix + 1);
    run(next, ix + 1, mode);
  };

  const charged = frames.slice(0, ix + 1).reduce((s, x) => s + (x.charge ?? 0), 0);
  const pick = f.pick ?? 0;

  return (
    <Specimen
      height={320}
      readout={
        <>
          step {ix + 1} · irreversible clicks without review {unreviewed} · charged {charged ? <span className={charged > 800 ? 'text-[var(--anti)]' : 'text-ink'}>${fmt(charged)}</span> : '$0'}
          {charged > 800 && <> (limit $800)</>}
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => start(m)} options={[{ value: 'open', label: 'No gate' }, { value: 'gated', label: 'Gate irreversible actions' }]} />
          <Pill onClick={() => start()}>Replay</Pill>
        </div>
      }
    >
      <div className="flex items-start gap-3" onKeyDown={(e) => { if (e.key === 'Escape' && waiting) { e.stopPropagation(); decide(false); } }}>
        <Window width={300} height={226} url={f.page === 'results' ? 'flights.app/results?to=TYO' : 'flights.app/checkout'}>
          <div className="relative min-h-0 flex-1">
            {f.page === 'results' ? (
              FLIGHTS.map((fl, i) => (
                <div key={fl.code} className="absolute inset-x-0 flex h-[42px] items-center justify-between px-3 t-sm" style={{ top: 9 + i * 42, borderBottom: '0.5px solid var(--hairline-2)', background: f.pick === i ? 'var(--surface-2)' : undefined }}>
                  <span className="text-ink">{fl.code} <span className="text-ink-4">{fl.time}</span></span>
                  <span className="flex items-center gap-3">
                    <span className="t-mono text-ink-2">${fmt(fl.price)}</span>
                    <span className="rounded-[var(--r-pill)] px-2 py-0.5 t-caption" style={{ border: '0.5px solid var(--hairline)', color: 'var(--ink-2)', letterSpacing: 0 }}>Select</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-3 p-3">
                <div className="t-sm text-ink">{FLIGHTS[pick].code} · <span className="t-mono">${fmt(FLIGHTS[pick].price)}</span></div>
                <div className="h-7 rounded-[var(--r-sm)] px-2 py-1 t-sm text-ink" style={{ background: 'var(--surface-2)' }}>A. Rana</div>
                <div className="mt-6 self-center rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium" style={{ background: f.charge ? 'var(--pattern)' : 'var(--ink)', color: 'var(--bg)' }}>
                  {f.charge ? 'Booked' : `Confirm and pay $${fmt(FLIGHTS[pick].price)}`}
                </div>
              </div>
            )}
            {f.cursor && (
              <motion.div className="pointer-events-none absolute" animate={{ left: f.cursor[0], top: f.cursor[1] }} transition={t(0.4)}>
                <MousePointer2 size={16} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
              </motion.div>
            )}
            <AnimatePresence>
              {waiting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={t(0.18)}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'var(--scrim)' }}
                >
                  <div className="flex w-[230px] flex-col gap-2 rounded-[var(--r-md)] p-3" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}>
                    <span className="t-sm font-medium text-ink">Agent wants to pay ${fmt(FLIGHTS[pick].price)}</span>
                    <span className="t-sm text-ink-3">Irreversible. Your limit is $800.</span>
                    <div className="flex justify-end gap-2">
                      <button ref={rejectRef} onClick={() => decide(false)} className="rounded-[var(--r-pill)] px-3 py-1 t-sm text-ink" style={{ border: '0.5px solid var(--hairline)' }}>Reject</button>
                      <button onClick={() => decide(true)} className="rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Approve</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Window>
        <div className="hidden w-[170px] flex-col gap-1 sm:flex">
          <span className="t-caption pb-1 text-ink-4" style={{ letterSpacing: 0 }}>Action log</span>
          {frames.slice(0, ix + 1).slice(-7).map((x, i) => (
            <div key={`${i}-${x.log}`} className="truncate t-caption t-mono" style={{ letterSpacing: 0, color: x.charge ? (x.charge > 800 ? 'var(--anti)' : 'var(--pattern)') : 'var(--ink-3)' }} title={x.log}>
              {x.log}
            </div>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

export const PHASE12_SPECIMENS: Record<string, React.FC> = {
  'p12-04-flamingo': FlamingoSpecimen,
  'p12-05-llava': LlavaSpecimen,
  'p12-06-patch-n-pack': NativeResolutionSpecimen,
  'p12-08-llava-onevision': OneVisionSpecimen,
  'p12-09-qwen-vl': DynamicFpsSpecimen,
  'p12-11-chameleon': ChameleonSpecimen,
  'p12-12-emu3': ArImageSpecimen,
  'p12-13-transfusion': TransfusionSpecimen,
  'p12-14-show-o': ShowOSpecimen,
  'p12-17-temporal-grounding': TemporalGroundingSpecimen,
  'p12-18-long-video': LongVideoSpecimen,
  'p12-19-audio-language': AudioCuesSpecimen,
  'p12-20-omni-thinker-talker': TalkerSpecimen,
  'p12-21-embodied-vlas': ActionBinsSpecimen,
  'p12-22-document-understanding': DocLayoutSpecimen,
  'p12-23-colpali': ColPaliSpecimen,
  'p12-24-multimodal-rag': FusionSpecimen,
  'p12-25-computer-use': ComputerUseSpecimen,
};
