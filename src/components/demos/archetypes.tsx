import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, RotateCcw, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────────
 * Config-driven interactive demo archetypes.
 * Each sub-topic supplies a DemoConfig (authored by the workflow); the engine
 * renders a de-slopped, screen-recordable demo from it. This keeps 190+ demos
 * correct and typesafe: agents fill content, the archetype guarantees the craft
 * (flat neutral stage, one accent, no glow/mesh/candy, calm springs, a11y).
 * ────────────────────────────────────────────────────────────────────────── */

export type Archetype = 'toggle-fix' | 'slider-map' | 'sequence' | 'reveal' | 'meter' | 'before-after';

export interface DemoConfig {
  archetype: Archetype;
  // shared
  badLabel?: string;   // toggle segment / column label for the broken side
  goodLabel?: string;  // ...for the fixed side
  badCaption: string;  // "the failure" explanation
  goodCaption: string; // "the fix" explanation
  // toggle-fix / before-after: a small UI described as lines of content
  badLines?: string[];
  goodLines?: string[];
  subject?: string;    // card heading (e.g. "Checkout", "Agent run")
  // slider-map
  sliderLabel?: string;   // what the slider controls
  outputLabel?: string;   // what tracks (wrongly in bad, rightly in good)
  // sequence: ordered steps; marker index where the irreversible thing happens
  badSequence?: string[];
  goodSequence?: string[];
  // reveal: a hidden payload behind an opaque summary
  opaqueLabel?: string;   // what the bad version shows
  revealedLines?: string[]; // what the good version exposes
  // meter: a headline number that hides a distribution
  headline?: string;      // the misleading roll-up (e.g. "avg 200ms")
  breakdown?: { label: string; value: number }[]; // the truth underneath
}

const spring = (r: boolean) => (r ? { duration: 0.16 } : ({ type: 'spring', bounce: 0, duration: 0.42 } as const));

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[var(--r-xl)] px-6 py-8"
      style={{ background: 'var(--bg)', border: '0.5px solid var(--hairline)' }}>
      {children}
    </div>
  );
}
function Toggle({ a, b, on, set }: { a: string; b: string; on: 'a' | 'b'; set: (v: 'a' | 'b') => void }) {
  return (
    <div className="inline-flex rounded-[var(--r-md)] p-0.5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
      {(['a', 'b'] as const).map((k) => (
        <button key={k} onClick={() => set(k)}
          className="pressable rounded-[calc(var(--r-md)-2px)] px-3.5 py-1.5 t-sm font-medium"
          style={{ background: on === k ? 'var(--surface)' : 'transparent', color: on === k ? 'var(--ink)' : 'var(--ink-3)', boxShadow: on === k ? 'var(--shadow-card)' : 'none' }}>
          {k === 'a' ? a : b}
        </button>
      ))}
    </div>
  );
}
function Caption({ good, children }: { good: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--r-md)] px-4 py-3.5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
      <span className="t-sm font-semibold" style={{ color: good ? 'var(--pattern)' : 'var(--anti)' }}>{good ? 'The fix' : 'The failure'}</span>
      <div className="t-body mt-1.5 text-ink-2">{children}</div>
    </div>
  );
}
function Card({ subject, children }: { subject?: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[320px] rounded-[var(--r-lg)] p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}>
      {subject && <div className="t-caption mb-2.5 uppercase text-ink-4">{subject}</div>}
      {children}
    </div>
  );
}

export function ArchetypeDemo({ config: c }: { config: DemoConfig }) {
  const reduce = !!useReducedMotion();
  const [good, setGood] = useState(false);
  const on = good ? 'b' : 'a';
  const set = (v: 'a' | 'b') => setGood(v === 'b');

  return (
    <div className="flex flex-col gap-5">
      {c.archetype !== 'reveal' && c.archetype !== 'meter' && (
        <Toggle a={c.badLabel ?? 'Before'} b={c.goodLabel ?? 'After'} on={on} set={set} />
      )}

      {c.archetype === 'toggle-fix' && <ToggleFix c={c} good={good} />}
      {c.archetype === 'before-after' && <ToggleFix c={c} good={good} />}
      {c.archetype === 'slider-map' && <SliderMap c={c} good={good} reduce={reduce} />}
      {c.archetype === 'sequence' && <Sequence c={c} good={good} reduce={reduce} />}
      {c.archetype === 'reveal' && <Reveal c={c} reduce={reduce} />}
      {c.archetype === 'meter' && <Meter c={c} reduce={reduce} />}

      {c.archetype !== 'reveal' && c.archetype !== 'meter' && (
        <Caption good={good}>{good ? c.goodCaption : c.badCaption}</Caption>
      )}
    </div>
  );
}

function ToggleFix({ c, good }: { c: DemoConfig; good: boolean }) {
  const lines = good ? (c.goodLines ?? []) : (c.badLines ?? []);
  return (
    <Stage>
      <Card subject={c.subject}>
        <div className="flex flex-col gap-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-start gap-2 t-sm text-ink-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: good ? 'var(--pattern)' : 'var(--anti)' }} />
              {l}
            </div>
          ))}
          {lines.length === 0 && <div className="t-sm text-ink-4">(nothing shown)</div>}
        </div>
      </Card>
    </Stage>
  );
}

function SliderMap({ c, good, reduce }: { c: DemoConfig; good: boolean; reduce: boolean }) {
  const [v, setV] = useState(30);
  // bad: output ignores the slider (flat/decoupled). good: output tracks it.
  const output = good ? v : 68;
  return (
    <Stage>
      <div className="w-full max-w-[340px]">
        <label className="t-sm text-ink-3">{c.sliderLabel ?? 'Input'}</label>
        <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)}
          className="mt-2 w-full accent-[var(--accent)]" />
        <div className="mt-5 flex items-end justify-between">
          <span className="t-sm text-ink-3">{c.outputLabel ?? 'Output'}</span>
          <span className="t-mono t-lg font-semibold" style={{ color: good ? 'var(--pattern)' : 'var(--anti)' }}>{output}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
          <motion.div className="h-full rounded-full" style={{ background: good ? 'var(--pattern)' : 'var(--anti)' }}
            animate={{ width: `${output}%` }} transition={spring(reduce)} />
        </div>
        <div className="mt-2 t-sm text-ink-4">
          {good ? 'The output tracks the input.' : 'The output ignores the input. It sits where the signal put it, not where reality is.'}
        </div>
      </div>
    </Stage>
  );
}

function Sequence({ c, good, reduce }: { c: DemoConfig; good: boolean; reduce: boolean }) {
  const [step, setStep] = useState(-1);
  const seq = good ? (c.goodSequence ?? []) : (c.badSequence ?? []);
  return (
    <Stage>
      <div className="w-full max-w-[340px]">
        <div className="flex flex-col gap-1.5">
          {seq.map((s, i) => (
            <motion.div key={i}
              initial={false}
              animate={{ opacity: i <= step ? 1 : 0.32 }}
              transition={spring(reduce)}
              className="flex items-center gap-2.5 rounded-[var(--r-md)] px-3 py-2 t-sm t-mono"
              style={{ background: i <= step ? 'var(--surface)' : 'transparent', border: '0.5px solid var(--hairline)', color: 'var(--ink-2)' }}>
              <span className="t-caption text-ink-4">{i + 1}</span>{s}
            </motion.div>
          ))}
        </div>
        <button onClick={() => setStep((s) => (s + 1) % (seq.length + 1) - (s + 1 > seq.length ? 1 : 0))}
          onDoubleClick={() => setStep(-1)}
          className="pressable mt-3 w-full rounded-[var(--r-md)] py-2 t-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
          {step < seq.length - 1 ? 'Step through the handler' : 'Replay'}
        </button>
      </div>
    </Stage>
  );
}

function Reveal({ c, reduce }: { c: DemoConfig; reduce: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <Stage>
        <Card subject={c.subject}>
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink-2">{open ? 'Decoded' : (c.opaqueLabel ?? 'Approve action')}</span>
            <button onClick={() => setOpen((o) => !o)} className="pressable flex items-center gap-1.5 rounded-[var(--r-md)] px-2.5 py-1.5 t-sm text-ink-2" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
              {open ? <EyeOff size={13} /> : <Eye size={13} />}{open ? 'Hide' : 'Reveal'}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={spring(reduce)} className="overflow-hidden">
                <div className="mt-3 flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'var(--hairline)' }}>
                  {(c.revealedLines ?? []).map((l, i) => <div key={i} className="t-sm t-mono text-ink-2">{l}</div>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </Stage>
      <Caption good={open}>{open ? c.goodCaption : c.badCaption}</Caption>
    </div>
  );
}

function Meter({ c, reduce }: { c: DemoConfig; reduce: boolean }) {
  const [open, setOpen] = useState(false);
  const bd = c.breakdown ?? [];
  const max = Math.max(1, ...bd.map((x) => x.value));
  return (
    <div className="flex flex-col gap-5">
      <Stage>
        <div className="w-full max-w-[340px]">
          <div className="flex items-center justify-between">
            <span className="t-mono t-lg font-semibold text-ink">{c.headline ?? 'avg'}</span>
            <button onClick={() => setOpen((o) => !o)} className="pressable rounded-[var(--r-md)] px-2.5 py-1.5 t-sm text-ink-2" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>{open ? 'Hide breakdown' : 'Break it down'}</button>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={spring(reduce)} className="overflow-hidden">
                <div className="mt-4 flex flex-col gap-2 border-t pt-3" style={{ borderColor: 'var(--hairline)' }}>
                  {bd.map((row, i) => (
                    <div key={i}>
                      <div className="flex justify-between t-sm text-ink-2"><span>{row.label}</span><span className="t-mono">{row.value}</span></div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: i === bd.length - 1 ? 'var(--anti)' : 'var(--ink-4)' }} animate={{ width: `${(row.value / max) * 100}%` }} transition={spring(reduce)} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Stage>
      <Caption good={open}>{open ? c.goodCaption : c.badCaption}</Caption>
    </div>
  );
}
