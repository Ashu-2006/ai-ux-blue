import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { Dot, Row, Segmented, Specimen, Window, useMotion } from './kit';

// Phase 16 · Multi-agent and swarms. One specimen per lesson.

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function useTimers() {
  const ids = useRef<number[]>([]);
  const clear = useCallback(() => { ids.current.forEach((i) => window.clearTimeout(i)); ids.current = []; }, []);
  const after = useCallback((ms: number, fn: () => void) => { ids.current.push(window.setTimeout(fn, ms)); }, []);
  useEffect(() => clear, [clear]);
  return { after, clear };
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="t-caption t-mono shrink-0 whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}>{children}</span>;
}

function Hi({ children, tone }: { children: React.ReactNode; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'good' ? 'var(--pattern)' : tone === 'bad' ? 'var(--anti)' : tone === 'warn' ? 'var(--invisible)' : 'var(--ink)';
  return <span style={{ color: c }}>{children}</span>;
}

function Btn({ children, onClick, disabled, quiet }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; quiet?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium transition-opacity disabled:opacity-40"
      style={quiet
        ? { background: 'var(--surface-2)', color: 'var(--ink-2)', border: '0.5px solid var(--hairline)' }
        : { background: 'var(--ink)', color: 'var(--bg)' }}
    >
      {children}
    </button>
  );
}

function Panel({ title, meta, children, className = '' }: { title: React.ReactNode; meta?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--r-md)] p-2 ${className}`} style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline-2)' }}>
      <div className="flex justify-between gap-2 px-1 pb-1.5 t-caption text-ink-4" style={{ letterSpacing: 0 }}>
        <span>{title}</span>
        {meta !== undefined && <span className="t-mono">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

function LogLine({ children, right, tone }: { children: React.ReactNode; right?: React.ReactNode; tone?: 'good' | 'bad' | 'warn' }) {
  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1 t-caption t-mono" style={{ borderTop: '0.5px solid var(--hairline-2)', letterSpacing: 0 }}>
      <span className="truncate text-ink-3">{children}</span>
      {right !== undefined && <span className="shrink-0"><Hi tone={tone}>{right}</Hi></span>}
    </div>
  );
}

function Slider({ label, value, min, max, onChange, verdict }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; verdict: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 t-sm text-ink-3">
      <span className="whitespace-nowrap">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-[180px]"
        style={{ accentColor: 'var(--ink)' }}
      />
      <span className="min-w-[150px] t-mono text-ink">{verdict}</span>
    </div>
  );
}

function Chip({ children, on, tone }: { children: React.ReactNode; on?: boolean; tone?: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'good' ? 'var(--pattern)' : tone === 'bad' ? 'var(--anti)' : tone === 'warn' ? 'var(--invisible)' : on ? 'var(--accent)' : 'var(--hairline)';
  return (
    <span
      className="t-caption t-mono inline-flex items-center rounded-[var(--r-pill)] px-2 py-0.5 whitespace-nowrap"
      style={{ border: `0.5px solid ${c}`, color: tone || on ? c : 'var(--ink-4)', letterSpacing: 0 }}
    >
      {children}
    </span>
  );
}

// ── 16.01 · single-agent ceiling ────────────────────────────────────────────
const STAGES = [
  { k: 'Research', tok: 50, who: 'Researcher' },
  { k: 'Code', tok: 60, who: 'Coder' },
  { k: 'Review', tok: 25, who: 'Reviewer' },
  { k: 'Test', tok: 15, who: 'Reviewer' },
];
const CTX_WINDOW = 200;
const HANDOFF_SUMMARY = 4;
type Seg = { label: string; tok: number; live: boolean };

export function CeilingSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'one' | 'three'>('one');
  const [step, setStep] = useState(0);

  const windows = mode === 'one'
    ? [{ name: 'Agent', active: true, segs: STAGES.slice(0, step + 1).map((s, i): Seg => ({ label: s.k, tok: s.tok, live: i === step })) }]
    : ['Researcher', 'Coder', 'Reviewer'].map((name) => {
        const first = STAGES.findIndex((s) => s.who === name);
        const segs: Seg[] = [];
        if (first > 0 && first <= step) segs.push({ label: 'summary', tok: HANDOFF_SUMMARY, live: false });
        STAGES.forEach((s, i) => { if (s.who === name && i <= step) segs.push({ label: s.k, tok: s.tok, live: i === step }); });
        return { name, active: STAGES[step].who === name, segs };
      });
  const active = windows.find((w) => w.active)!;
  const used = sum(active.segs.map((s) => s.tok));
  const stale = sum(active.segs.filter((s) => !s.live).map((s) => s.tok));
  const jobs = active.segs.filter((s) => s.label !== 'summary').length;

  return (
    <Specimen
      height={300}
      readout={<>{STAGES[step].k} · active window <Hi>{used}k</Hi>/{CTX_WINDOW}k · jobs in it {jobs} · stale <Hi tone={stale > 20 ? 'bad' : undefined}>{stale}k</Hi></>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'one', label: 'One agent' }, { value: 'three', label: 'Three specialists' }]} />}
    >
      <Window width={460}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-1">
            {STAGES.map((s, i) => (
              <div key={s.k} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} className="text-ink-4" />}
                <button
                  onClick={() => setStep(i)}
                  className="rounded-[var(--r-pill)] px-2.5 py-1 t-sm transition-colors"
                  style={{
                    background: i === step ? 'var(--surface-2)' : 'transparent',
                    border: `0.5px solid ${i === step ? 'var(--accent)' : 'var(--hairline-2)'}`,
                    color: i <= step ? 'var(--ink)' : 'var(--ink-4)',
                  }}
                >
                  {s.k}
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {windows.map((w) => (
              <div key={w.name} className="flex items-center gap-3">
                <span className="w-[74px] shrink-0 t-sm" style={{ color: w.active ? 'var(--ink)' : 'var(--ink-4)' }}>{w.name}</span>
                <div className="flex h-3 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
                  {w.segs.map((s) => (
                    <motion.div
                      key={s.label}
                      title={`${s.label} ${s.tok}k`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.tok / CTX_WINDOW) * 100}%` }}
                      transition={t()}
                      style={{
                        background: s.live ? 'var(--accent)' : s.label === 'summary' ? 'var(--ink-3)' : 'var(--ink-4)',
                        opacity: s.live ? 1 : 0.55,
                        borderRight: '1px solid var(--surface)',
                      }}
                    />
                  ))}
                </div>
                <Meta>{sum(w.segs.map((s) => s.tok))}k</Meta>
              </div>
            ))}
          </div>
          <div className="flex gap-3 t-caption text-ink-4" style={{ letterSpacing: 0 }}>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: 'var(--accent)' }} />current job</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: 'var(--ink-4)', opacity: 0.55 }} />earlier jobs</span>
            {mode === 'three' && <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: 'var(--ink-3)', opacity: 0.55 }} />handoff summary</span>}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.04 · four primitives, the orchestrator axis ──────────────────────────
type Orch = 'graph' | 'router' | 'handoff';
const ROLES = ['plan', 'write', 'check'];
const ORCH_PATHS: Record<Orch, number[][]> = {
  graph: [[0, 1, 2]],
  router: [[0, 1, 2], [0, 1, 2, 1, 2], [0, 2, 1, 2], [0, 1, 2], [0, 1, 1, 2], [0, 1, 2, 1, 2]],
  handoff: [[0, 1, 2], [0, 1, 2, 1, 2, 1, 2], [0, 1], [0, 1, 2, 1, 2], [0, 1, 2, 1], [0, 1, 2]],
};
const PICKER: Record<Orch, string> = { graph: 'code', router: 'a router model', handoff: 'the agent holding the floor' };

export function OrchestratorSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<Orch>('graph');
  const [runs, setRuns] = useState<number[][]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = (m: Orch) => { clear(); setMode(m); setRuns([]); setLit(null); setBusy(false); };
  const run = () => {
    const table = ORCH_PATHS[mode];
    const path = table[runs.length % table.length];
    const ms = reduce ? 0 : 260;
    setBusy(true);
    path.forEach((a, i) => after(i * ms, () => setLit(a)));
    after(path.length * ms, () => { setLit(null); setBusy(false); setRuns((r) => [...r, path]); });
  };

  const distinct = new Set(runs.map((p) => p.join())).size;
  const routingCalls = mode === 'router' ? sum(runs.map((p) => p.length)) : 0;

  return (
    <Specimen
      height={300}
      readout={runs.length === 0
        ? <>next agent picked by: <Hi>{PICKER[mode]}</Hi> · press Run a few times</>
        : <>runs {runs.length} · distinct paths <Hi tone={distinct > 1 ? 'warn' : 'good'}>{distinct}</Hi>{mode === 'router' && <> · routing calls {routingCalls}</>} · drawable before it runs: <Hi>{mode === 'graph' ? 'yes' : 'no'}</Hi></>}
      controls={<Segmented value={mode} onChange={reset} options={[{ value: 'graph', label: 'Static graph' }, { value: 'router', label: 'LLM router' }, { value: 'handoff', label: 'Handoffs' }]} />}
    >
      <div className="flex w-full max-w-[480px] items-start gap-4 px-4">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {ROLES.map((r, i) => (
              <div key={r} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} className="text-ink-4" style={{ opacity: mode === 'graph' ? 1 : 0.25 }} />}
                <motion.div
                  animate={{ scale: lit === i && !reduce ? 1.06 : 1 }}
                  className="rounded-[var(--r-md)] px-3 py-2 t-sm"
                  style={{
                    background: 'var(--surface)',
                    boxShadow: 'var(--shadow-card)',
                    outline: lit === i ? '1.5px solid var(--accent)' : '0.5px solid var(--hairline-2)',
                    color: 'var(--ink)',
                  }}
                >
                  {r}
                </motion.div>
              </div>
            ))}
          </div>
          <Meta>shared state: {'{ draft, notes }'}</Meta>
          <Btn onClick={run} disabled={busy}><Play size={12} /> Run</Btn>
        </div>
        <Panel title="Run log" meta={`${runs.length}`} className="w-[200px] shrink-0">
          <div className="flex h-[132px] flex-col">
            {runs.slice(-5).reverse().map((p, i) => (
              <LogLine key={runs.length - i} right={p[p.length - 1] === 2 ? 'ok' : 'no check'} tone={p[p.length - 1] === 2 ? 'good' : 'bad'}>
                {p.map((a) => ROLES[a][0].toUpperCase()).join(' ')}
              </LogLine>
            ))}
          </div>
        </Panel>
      </div>
    </Specimen>
  );
}

// ── 16.05 · supervisor ──────────────────────────────────────────────────────
const SUBQ = ['Market size, 2026', 'Top three competitors', 'Pricing benchmarks'];
const WORK_S = 0.3;
const DISPATCH_S = 0.05;
const RESULT_K = 18;
const SUMMARY_K = 1.5;
const SLOWMO = 3;

export function SupervisorSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'serial' | 'parallel'>('serial');
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);

  const serial = mode === 'serial';
  const total = serial ? SUBQ.length * WORK_S : DISPATCH_S + WORK_S;
  const span = SUBQ.length * WORK_S;
  const start = (i: number) => (serial ? i * WORK_S : DISPATCH_S);
  const leadK = serial ? SUBQ.length * RESULT_K : SUBQ.length * SUMMARY_K;

  const go = () => {
    clear(); setDone(false); setRun((r) => r + 1);
    after(reduce ? 0 : total * SLOWMO * 1000, () => setDone(true));
  };
  const flip = (m: 'serial' | 'parallel') => { clear(); setMode(m); setRun(0); setDone(false); };

  return (
    <Specimen
      height={290}
      readout={!done
        ? (run ? 'running, shown at 1/3 speed' : 'Press Run')
        : <>wall time <Hi>{total.toFixed(2)}s</Hi> · contexts {serial ? 1 : SUBQ.length + 1} · lead window <Hi tone={serial ? 'bad' : 'good'}>{leadK}k</Hi></>}
      controls={<Segmented value={mode} onChange={flip} options={[{ value: 'serial', label: 'Serial' }, { value: 'parallel', label: 'Parallel workers' }]} />}
    >
      <Window width={460}>
        <div className="flex flex-col gap-2.5 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">{serial ? 'One agent, one window' : 'Lead + 3 workers, 4 windows'}</span>
            <Btn onClick={go}><Play size={12} /> Run</Btn>
          </div>
          {SUBQ.map((q, i) => (
            <div key={q} className="flex items-center gap-3">
              <span className="w-[140px] shrink-0 truncate t-sm text-ink-3">{q}</span>
              <div className="relative h-2.5 flex-1 rounded-full" style={{ background: 'var(--surface-2)' }}>
                {run > 0 && (
                  <motion.div
                    key={`${run}-${mode}`}
                    className="absolute inset-y-0 rounded-full"
                    style={{ left: `${(start(i) / span) * 100}%`, background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(WORK_S / span) * 100}%` }}
                    transition={{ duration: reduce ? 0 : WORK_S * SLOWMO, delay: reduce ? 0 : start(i) * SLOWMO, ease: 'linear' }}
                  />
                )}
              </div>
              <Meta>{serial ? `+${RESULT_K}k lead` : `${RESULT_K}k own, ${SUMMARY_K}k up`}</Meta>
            </div>
          ))}
          <div className="flex justify-between pl-[152px] pr-[86px] t-caption t-mono text-ink-4" style={{ letterSpacing: 0 }}>
            <span>0s</span><span>{(span / 2).toFixed(2)}s</span><span>{span.toFixed(2)}s</span>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.06 · hierarchical ────────────────────────────────────────────────────
type HStep = { on: string[]; msg: string; flag?: boolean };
const H_OFF: HStep[] = [
  { on: ['lead'], msg: 'Q: Can we exit the Acme contract early?' },
  { on: ['lead', 'fin'], msg: 'Lead routes to Finance ("contract", "$ value" matched)' },
  { on: ['fin', 'cost', 'fcst'], msg: 'Finance splits: exit cost, cash impact' },
  { on: ['cost', 'fcst'], msg: 'Workers: exit fee $40k, Q3 cash dips 6%' },
  { on: ['lead'], msg: 'Lead: "Exiting early costs $40k and dips Q3 cash 6%."' },
];
const H_ECHO: HStep[] = [
  H_OFF[0],
  H_OFF[1],
  { on: ['fin', 'lead'], msg: 'Finance echoes "what does exiting cost?" Lead: not the question', flag: true },
  { on: ['lead', 'legal'], msg: 'Lead reroutes to Legal' },
  { on: ['legal', 'ctr', 'cmp'], msg: 'Legal splits: termination clause, notice rules' },
  { on: ['lead'], msg: 'Lead: "Yes, with 60 days notice under clause 12.3."' },
];
const TREE = [
  { id: 'legal', label: 'Legal mgr', kids: [{ id: 'ctr', label: 'Contracts' }, { id: 'cmp', label: 'Compliance' }] },
  { id: 'fin', label: 'Finance mgr', kids: [{ id: 'cost', label: 'Costing' }, { id: 'fcst', label: 'Forecast' }] },
];

export function HierarchySpecimen() {
  const [mode, setMode] = useState<'off' | 'echo'>('off');
  const [i, setI] = useState(0);
  const steps = mode === 'off' ? H_OFF : H_ECHO;
  const s = steps[i];
  const end = i === steps.length - 1;
  const calls = sum(steps.slice(0, i + 1).map((x) => x.on.length));
  const visited = new Set(steps.slice(0, i + 1).flatMap((x) => x.on));

  const node = (id: string, label: string) => (
    <div
      key={id}
      className="rounded-[var(--r-sm)] px-2 py-1 t-caption whitespace-nowrap transition-colors"
      style={{
        letterSpacing: 0,
        background: 'var(--surface)',
        border: `0.5px solid ${s.on.includes(id) ? 'var(--accent)' : 'var(--hairline)'}`,
        color: visited.has(id) ? 'var(--ink)' : 'var(--ink-4)',
      }}
    >
      {label}
    </div>
  );

  return (
    <Specimen
      height={310}
      readout={<>step {i + 1}/{steps.length} · model calls {calls}{end && (mode === 'off'
        ? <> · answered: <Hi tone="bad">no</Hi> · flagged: <Hi tone="bad">no</Hi></>
        : <> · mismatch caught at level 2 · answered: <Hi tone="good">yes</Hi></>)}</>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setI(0); }} options={[{ value: 'off', label: 'No intent check' }, { value: 'echo', label: 'Echo-back check' }]} />}
    >
      <Window width={470}>
        <div className="flex flex-col items-center gap-3 p-4">
          {node('lead', 'Lead manager')}
          <div className="flex w-full justify-around">
            {TREE.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                {node(m.id, m.label)}
                <div className="flex gap-1.5">{m.kids.map((k) => node(k.id, k.label))}</div>
              </div>
            ))}
          </div>
          <div
            className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2.5 py-2 t-caption t-mono"
            style={{ background: 'var(--surface-2)', letterSpacing: 0, color: s.flag ? 'var(--invisible)' : 'var(--ink-2)' }}
          >
            <span className="min-w-0 flex-1">{s.msg}</span>
          </div>
          <div className="flex gap-2">
            <Btn onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={end}>Step <ChevronRight size={12} /></Btn>
            <Btn quiet onClick={() => setI(0)}><RotateCcw size={12} /> Reset</Btn>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.08 · critic versus verifier ──────────────────────────────────────────
const SUBS = [
  {
    id: 'PR #41',
    src: "t.toLowerCase()\n  .replace(/[^\\w\\s-]/g, '')\n  .trim().replace(/\\s+/g, '-')",
    fn: (t: string) => t.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-'),
    critic: 'Clean chain, readable. Approve.',
  },
  {
    id: 'PR #42',
    src: "t.toLowerCase()\n  .trim()\n  .replace(/\\s+/g, '-')",
    fn: (t: string) => t.toLowerCase().trim().replace(/\s+/g, '-'),
    critic: 'Concise and idiomatic. Approve.',
  },
  {
    id: 'PR #43',
    src: "t.trim().toLowerCase().split(/\\s+/)\n  .map((w) => w.replace(/[^\\w-]/g, ''))\n  .filter(Boolean).join('-')",
    fn: (t: string) => t.trim().toLowerCase().split(/\s+/).map((w) => w.replace(/[^\w-]/g, '')).filter(Boolean).join('-'),
    critic: 'Handles whitespace well. Approve.',
  },
];
const SLUG_TESTS: [string, string][] = [['Hello World', 'hello-world'], ['Ship it!', 'ship-it'], ['A  B', 'a-b']];

export function VerifierSpecimen() {
  const [gate, setGate] = useState<'critic' | 'verifier'>('critic');
  const [reviewed, setReviewed] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);

  const results = SUBS.map((s) => SLUG_TESTS.map(([input, want]) => ({ input, want, got: s.fn(input) })));
  const passes = (i: number) => results[i].every((r) => r.got === r.want);
  const ships = (i: number) => (gate === 'critic' ? true : passes(i));
  const shipped = reviewed.filter(ships);
  const bugs = shipped.filter((i) => !passes(i)).length;
  const testsRun = gate === 'verifier' ? reviewed.length * SLUG_TESTS.length : 0;

  const review = (i: number) => { setSel(i); setReviewed((r) => (r.includes(i) ? r : [...r, i])); };

  return (
    <Specimen
      height={300}
      readout={reviewed.length === 0
        ? 'Spec: slugify(title), lowercase, hyphens, no punctuation. Review each PR'
        : <>shipped {shipped.length}/{reviewed.length} · bugs shipped <Hi tone={bugs ? 'bad' : 'good'}>{bugs}</Hi> · tests run {testsRun}</>}
      controls={<Segmented value={gate} onChange={(g) => { setGate(g); setReviewed([]); setSel(null); }} options={[{ value: 'critic', label: 'Critic gate' }, { value: 'verifier', label: 'Verifier gate' }]} />}
    >
      <Window width={480} height={230}>
        <div className="flex min-h-0 flex-1">
          <div className="w-[150px] shrink-0" style={{ borderRight: '0.5px solid var(--hairline-2)' }}>
            {SUBS.map((s, i) => (
              <Row key={s.id} onClick={() => review(i)} active={sel === i}>
                <span className="flex-1">{s.id}</span>
                {reviewed.includes(i) && (ships(i) ? <Chip tone="good">ship</Chip> : <Chip tone="bad">block</Chip>)}
              </Row>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
            {sel === null ? (
              <span className="t-sm text-ink-4">Click a PR to send it through the gate.</span>
            ) : (
              <>
                <pre className="t-caption t-mono overflow-hidden rounded-[var(--r-sm)] p-2 text-ink-2" style={{ background: 'var(--surface-2)', letterSpacing: 0 }}>{SUBS[sel].src}</pre>
                {gate === 'critic' ? (
                  <div className="t-sm text-ink-2">"{SUBS[sel].critic}"</div>
                ) : (
                  <div className="flex flex-col">
                    {results[sel].map((r) => (
                      <LogLine key={r.input} right={r.got === r.want ? 'pass' : `got "${r.got}"`} tone={r.got === r.want ? 'good' : 'bad'}>
                        "{r.input}"
                      </LogLine>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.09 · swarm queue ─────────────────────────────────────────────────────
const TASK_S = [10, 2, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3];
const WORKERS = 4;
type Job = { w: number; start: number; dur: number; i: number };

function scheduleJobs(mode: 'pre' | 'queue') {
  const free = Array(WORKERS).fill(0) as number[];
  const jobs: Job[] = [];
  TASK_S.forEach((dur, i) => {
    let w = i % WORKERS;
    if (mode === 'queue') { w = 0; for (let k = 1; k < WORKERS; k++) if (free[k] < free[w]) w = k; }
    jobs.push({ w, start: free[w], dur, i });
    free[w] += dur;
  });
  const makespan = Math.max(...free);
  return { jobs, makespan, idle: makespan * WORKERS - sum(TASK_S), per: free.map((_, w) => jobs.filter((j) => j.w === w).length) };
}

export function QueueSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'pre' | 'queue'>('pre');
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const plan = useMemo(() => scheduleJobs(mode), [mode]);
  const AXIS = 14;
  const K = 0.22;

  const go = () => { clear(); setDone(false); setRun((r) => r + 1); after(reduce ? 0 : plan.makespan * K * 1000, () => setDone(true)); };

  return (
    <Specimen
      height={290}
      readout={done
        ? <>12 tasks · makespan <Hi tone={plan.makespan > 10 ? 'bad' : 'good'}>{plan.makespan}s</Hi> · idle worker-seconds {plan.idle} · tasks per worker {plan.per.join(' / ')}</>
        : run ? 'running' : 'Press Run'}
      controls={<Segmented value={mode} onChange={(m) => { clear(); setMode(m); setRun(0); setDone(false); }} options={[{ value: 'pre', label: 'Pre-assigned' }, { value: 'queue', label: 'Shared queue' }]} />}
    >
      <Window width={470}>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <Meta>durations: {TASK_S.join(' ')} s</Meta>
            <Btn onClick={go}><Play size={12} /> Run</Btn>
          </div>
          {Array.from({ length: WORKERS }, (_, w) => (
            <div key={w} className="flex items-center gap-2">
              <span className="w-[22px] shrink-0 t-caption t-mono text-ink-4" style={{ letterSpacing: 0 }}>w{w + 1}</span>
              <div className="relative h-5 flex-1 rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }}>
                {run > 0 && plan.jobs.filter((j) => j.w === w).map((j) => (
                  <motion.div
                    key={`${run}-${mode}-${j.i}`}
                    className="absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-[var(--r-sm)] t-caption t-mono"
                    style={{
                      left: `${(j.start / AXIS) * 100}%`,
                      background: j.dur >= 10 ? 'var(--accent)' : 'var(--ink-4)',
                      color: 'var(--bg)',
                      borderRight: '1px solid var(--surface)',
                      letterSpacing: 0,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(j.dur / AXIS) * 100}%` }}
                    transition={{ duration: reduce ? 0 : j.dur * K, delay: reduce ? 0 : j.start * K, ease: 'linear' }}
                  >
                    {j.dur}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          <div className="relative ml-[30px] h-3 t-caption t-mono text-ink-4" style={{ letterSpacing: 0 }}>
            {[0, 5, 10, 14].map((s) => (
              <span key={s} className="absolute -translate-x-1/2" style={{ left: `${(s / AXIS) * 100}%` }}>{s}s</span>
            ))}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.03 · A2A task lifecycle ──────────────────────────────────────────────
const A2A_STATES = ['submitted', 'working', 'input-required', 'auth-required', 'completed', 'failed', 'canceled', 'rejected'];
const A2A_SEQ = ['submitted', 'working', 'input-required', 'working', 'auth-required', 'working', 'completed'];
const HUMAN = ['input-required', 'auth-required'];

export function LifecycleSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'failed' | 'paused'>('failed');
  const [i, setI] = useState(-1);
  const [restarts, setRestarts] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const state = i < 0 ? null : A2A_SEQ[i];
  const waiting = state !== null && HUMAN.includes(state);
  const label = state === null ? 'idle' : waiting ? (mode === 'failed' ? 'Failed' : 'Waiting on you') : state === 'completed' ? 'Done' : 'Working';

  const advance = useCallback((from: number) => {
    let k = from;
    const tick = () => {
      setI(k);
      setLog((l) => [...l, A2A_SEQ[k]].slice(-5));
      if (HUMAN.includes(A2A_SEQ[k]) || k === A2A_SEQ.length - 1) return;
      k += 1;
      after(reduce ? 0 : 600, tick);
    };
    tick();
  }, [after, reduce]);

  const start = () => { clear(); setLog([]); advance(0); };
  const retry = () => { clear(); setRestarts((r) => r + 1); setLog([]); advance(0); };
  const answer = (v: string) => { setLog((l) => [...l, `user: ${v}`].slice(-5)); advance(i + 1); };
  const flip = (m: 'failed' | 'paused') => { clear(); setMode(m); setI(-1); setRestarts(0); setLog([]); };

  const labelTone = label === 'Failed' ? 'bad' : label === 'Waiting on you' ? 'warn' : label === 'Done' ? 'good' : undefined;

  return (
    <Specimen
      height={310}
      readout={<>A2A state: <Hi>{state ?? 'none'}</Hi> · UI shows: <Hi tone={labelTone}>{label}</Hi> · restarts {restarts}</>}
      controls={<Segmented value={mode} onChange={flip} options={[{ value: 'failed', label: 'Human states as failed' }, { value: 'paused', label: 'Human states as paused' }]} />}
    >
      <Window width={460}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="t-sm text-ink">Quote agent</span>
              <Meta>remote · task t-8812</Meta>
            </div>
            {labelTone ? <Chip tone={labelTone}>{label}</Chip> : <Chip on={state !== null}>{label}</Chip>}
          </div>
          <div className="flex flex-wrap gap-1">
            {A2A_STATES.map((s) => <Chip key={s} on={s === state}>{s}</Chip>)}
          </div>
          <div className="flex h-[64px] flex-col justify-end">
            {log.map((l, k) => <LogLine key={`${k}-${l}`}>{l}</LogLine>)}
          </div>
          <div className="flex min-h-[28px] items-center gap-2">
            {state === null && <Btn onClick={start}><Play size={12} /> Delegate</Btn>}
            {waiting && mode === 'failed' && <Btn onClick={retry}><RotateCcw size={12} /> Retry</Btn>}
            {state === 'input-required' && mode === 'paused' && (
              <>
                <span className="t-sm text-ink-3">Which region?</span>
                <Btn quiet onClick={() => answer('EU')}>EU</Btn>
                <Btn quiet onClick={() => answer('US')}>US</Btn>
              </>
            )}
            {state === 'auth-required' && mode === 'paused' && (
              <>
                <span className="t-sm text-ink-3">Allow access to pricing API?</span>
                <Btn onClick={() => answer('approved')}>Approve</Btn>
              </>
            )}
            {state === 'completed' && <span className="flex items-center gap-1.5 t-sm text-ink"><Check size={14} /> quote.pdf</span>}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.10 · group chat selector ─────────────────────────────────────────────
type Turn = { who: string; text: string; on: boolean; why: string };
const CHAT_RR: Turn[] = [
  { who: 'Researcher', text: 'The scrape covers 3 EU news domains.', on: true, why: 'cycle slot 1 of 3' },
  { who: 'Coder', text: 'I can add retry logic to the fetcher.', on: false, why: 'cycle slot 2 of 3' },
  { who: 'Counsel', text: 'GDPR applies: bylines are personal data.', on: true, why: 'cycle slot 3 of 3' },
  { who: 'Researcher', text: 'robots.txt allows all three.', on: true, why: 'cycle slot 1 of 3' },
  { who: 'Coder', text: 'Refactored the HTML parser.', on: false, why: 'cycle slot 2 of 3' },
];
const CHAT_LLM: Turn[] = [
  { who: 'Researcher', text: 'The scrape covers 3 EU news domains.', on: true, why: 'opener' },
  { who: 'Counsel', text: 'GDPR applies: bylines are personal data.', on: true, why: '"EU" in last message' },
  { who: 'Coder', text: 'I can strip bylines before storage.', on: true, why: 'Counsel raised a data change' },
  { who: 'Counsel', text: 'With bylines stripped, EU launch is fine.', on: true, why: 'needs legal sign-off' },
  { who: 'Researcher', text: 'Logging the decision. Done.', on: true, why: 'answer reached, close' },
];

export function SelectorSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'rr' | 'llm'>('rr');
  const [n, setN] = useState(1);
  const script = mode === 'rr' ? CHAT_RR : CHAT_LLM;
  const shown = script.slice(0, n);
  const onTopic = shown.filter((x) => x.on).length;
  const last = shown[shown.length - 1];

  return (
    <Specimen
      height={320}
      readout={<>turn {n} · on-topic <Hi tone={onTopic < n ? 'bad' : 'good'}>{onTopic}/{n}</Hi> · selector model calls {mode === 'llm' ? n : 0}</>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setN(1); }} options={[{ value: 'rr', label: 'Round-robin' }, { value: 'llm', label: 'LLM-selected' }]} />}
    >
      <Window width={460} height={256}>
        <div className="px-3 pt-2.5 pb-1 t-sm text-ink">Can we ship the scraper to EU users?</div>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 pb-2">
          <AnimatePresence initial={false}>
            {shown.map((m, k) => (
              <motion.div key={`${mode}-${k}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={t()} className="flex items-baseline gap-2 t-sm">
                <span className="w-[74px] shrink-0 font-medium" style={{ color: m.on ? 'var(--ink)' : 'var(--anti)' }}>{m.who}</span>
                <span className="text-ink-3">{m.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ borderTop: '0.5px solid var(--hairline-2)' }}>
          <Meta>selector: {last.why}</Meta>
          <Btn onClick={() => setN((x) => Math.min(script.length, x + 1))} disabled={n === script.length}>Next turn</Btn>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.11 · handoffs ────────────────────────────────────────────────────────
type Msg = { who: 'user' | 'triage' | 'refunds' | 'handoff'; text: string };
const HANDOFF_PAYLOAD = { order: '#4471', item: 'blender', reason: 'arrived cracked' };

function handoffScript(carry: boolean): { user: string; replies: Msg[] }[] {
  const payload = carry ? JSON.stringify(HANDOFF_PAYLOAD) : '{}';
  const open = { user: 'Refund order #4471, the blender arrived cracked.', replies: [
    { who: 'triage' as const, text: 'Sending you to Refunds.' },
    { who: 'handoff' as const, text: `transfer_to_refunds(${payload})` },
  ] };
  if (carry) return [{ ...open, replies: [...open.replies, { who: 'refunds', text: 'Refund of $89 issued for the cracked blender on #4471.' }] }];
  return [
    { ...open, replies: [...open.replies, { who: 'refunds', text: 'Hi, I handle refunds. What is your order number?' }] },
    { user: '#4471', replies: [{ who: 'refunds', text: 'And what was wrong with the item?' }] },
    { user: 'It arrived cracked.', replies: [{ who: 'refunds', text: 'Refund of $89 issued for order #4471.' }] },
  ];
}

export function HandoffSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'bare' | 'carry'>('bare');
  const [n, setN] = useState(0);
  const script = useMemo(() => handoffScript(mode === 'carry'), [mode]);
  const msgs: Msg[] = script.slice(0, n).flatMap((s) => [{ who: 'user' as const, text: s.user }, ...s.replies]);
  const reasked = msgs.filter((m) => m.who === 'refunds' && m.text.endsWith('?')).length;
  const payloadTok = mode === 'carry' ? Math.ceil(JSON.stringify(HANDOFF_PAYLOAD).length / 4) : 0;
  const done = n === script.length;
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [n]);

  return (
    <Specimen
      height={320}
      readout={<>handoff payload {payloadTok} tokens · user asked again <Hi tone={reasked ? 'bad' : 'good'}>{reasked}</Hi>{done && <> · user turns to resolve {script.length}</>}</>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setN(0); }} options={[{ value: 'bare', label: 'Bare handoff' }, { value: 'carry', label: 'Carried summary' }]} />}
    >
      <Window width={440} height={256}>
        <div ref={list} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3">
          {msgs.map((m, k) => (
            <motion.div key={`${mode}-${k}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={t()}
              className={m.who === 'user' ? 'self-end' : m.who === 'handoff' ? 'self-center' : 'self-start'}>
              {m.who === 'handoff' ? (
                <Meta>{m.text}</Meta>
              ) : (
                <div className="max-w-[300px] rounded-[var(--r-md)] px-2.5 py-1.5 t-sm"
                  style={m.who === 'user' ? { background: 'var(--ink)', color: 'var(--bg)' } : { background: 'var(--surface-2)', color: 'var(--ink)' }}>
                  {m.who !== 'user' && <span className="mr-1.5 t-caption text-ink-4" style={{ letterSpacing: 0 }}>{m.who}</span>}
                  {m.text}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '0.5px solid var(--hairline-2)' }}>
          <span className="min-w-0 flex-1 truncate t-sm text-ink-3">{done ? 'Resolved' : script[n].user}</span>
          {done
            ? <Btn quiet onClick={() => setN(0)}><RotateCcw size={12} /> Again</Btn>
            : <Btn onClick={() => setN((x) => x + 1)}>Send</Btn>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.12 · A2A delegation ──────────────────────────────────────────────────
const LOCAL_EVENTS = [
  { k: 'step', text: 'plan: 3 fares under $600' },
  { k: 'step', text: 'call search_flights(SFO, NRT)' },
  { k: 'step', text: 'result: 14 flights' },
  { k: 'step', text: 'call filter(price < 600)' },
  { k: 'step', text: 'result: 3 flights' },
  { k: 'artifact', text: 'options.json' },
];
const REMOTE_EVENTS = [
  { k: 'state', text: 'submitted' },
  { k: 'state', text: 'working' },
  { k: 'state', text: 'completed' },
  { k: 'artifact', text: 'options.json' },
];

export function DelegationSpecimen() {
  const { t, reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'local' | 'remote'>('local');
  const [n, setN] = useState(0);
  const events = mode === 'local' ? LOCAL_EVENTS : REMOTE_EVENTS;
  const shown = events.slice(0, n);
  const count = (k: string) => events.filter((e) => e.k === k).length;

  const run = () => { clear(); setN(0); events.forEach((_, k) => after(reduce ? 0 : (k + 1) * 450, () => setN(k + 1))); };

  return (
    <Specimen
      height={300}
      readout={n < events.length
        ? 'Press Run'
        : mode === 'local'
          ? <>you can render: <Hi>{count('step')} internal steps</Hi> + {count('artifact')} artifact · component: transcript</>
          : <>you can render: <Hi>{count('state')} states</Hi> + {count('artifact')} artifact · internals: opaque · component: delegation card</>}
      controls={<Segmented value={mode} onChange={(m) => { clear(); setMode(m); setN(0); }} options={[{ value: 'local', label: 'Local agent' }, { value: 'remote', label: 'Remote via A2A' }]} />}
    >
      <Window width={420} height={236}>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
          <div className="flex flex-col">
            <span className="t-sm text-ink">{mode === 'local' ? 'travel-agent (in process)' : 'travel.example.com'}</span>
            <Meta>{mode === 'local' ? 'full transcript' : 'Agent Card · skill: find_flights'}</Meta>
          </div>
          <Btn onClick={run}><Play size={12} /> Run</Btn>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-3">
          {shown.map((e) => (
            <motion.div key={`${mode}-${e.text}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={t()}>
              {e.k === 'artifact' ? (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-2 py-1 t-sm text-ink" style={{ background: 'var(--surface-2)' }}>
                  <Check size={12} /> {e.text}
                </span>
              ) : e.k === 'state' ? (
                <Chip on={e === shown[shown.length - 1] || (n === events.length && e.text === 'completed')}>{e.text}</Chip>
              ) : (
                <span className="t-caption t-mono text-ink-3" style={{ letterSpacing: 0 }}>{e.text}</span>
              )}
            </motion.div>
          ))}
          {mode === 'remote' && n > 0 && n < events.length && <Meta>no steps exposed while working</Meta>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.13 · blackboard poisoning ────────────────────────────────────────────
const BOARD = [
  { id: 1, who: 'Fetcher', text: 'Q3 report: churn 4.2%', from: [] as number[], src: 'report.pdf p3' },
  { id: 2, who: 'Extractor', text: 'churn = 42%', from: [1], src: 'from #1', bad: true },
  { id: 3, who: 'Analyst', text: 'churn is 10x the 4% industry rate', from: [2], src: 'from #2' },
  { id: 4, who: 'Planner', text: 'priority: retention task force', from: [3], src: 'from #3' },
  { id: 5, who: 'Writer', text: 'summary: churn crisis at 42%', from: [2, 4], src: 'from #2, #4' },
];

function dependents(root: number) {
  const out = new Set<number>();
  let grew = true;
  while (grew) {
    grew = false;
    BOARD.forEach((e) => { if (!out.has(e.id) && e.from.some((f) => f === root || out.has(f))) { out.add(e.id); grew = true; } });
  }
  return out;
}

export function BlackboardSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'bare' | 'prov'>('bare');
  const [n, setN] = useState(1);
  const [retracted, setRetracted] = useState(false);
  const shown = BOARD.slice(0, n);
  const deps = dependents(2);
  const depsShown = shown.filter((e) => deps.has(e.id)).length;
  const flagged = mode === 'prov' && n >= 2;
  const struck = (id: number) => retracted && (id === 2 || deps.has(id));

  return (
    <Specimen
      height={320}
      readout={n < 2
        ? 'Step through the writes'
        : mode === 'bare'
          ? <>writes {n} · resting on the bad entry <Hi tone="bad">{depsShown}</Hi> · flagged 0</>
          : <>flagged at write 2 · resting on it {depsShown} · retracted <Hi tone={retracted ? 'good' : 'warn'}>{retracted ? 1 + depsShown : 0}</Hi></>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setN(1); setRetracted(false); }} options={[{ value: 'bare', label: 'Bare entries' }, { value: 'prov', label: 'Provenance + verifier' }]} />}
    >
      <Window width={480} height={250}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {shown.map((e) => (
            <motion.div key={`${mode}-${e.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()}
              className="flex items-center gap-2 px-3 py-1.5 t-sm" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
              <Meta>#{e.id}</Meta>
              <span className="w-[66px] shrink-0 text-ink-3">{e.who}</span>
              <span className="min-w-0 flex-1 truncate" style={{ color: struck(e.id) ? 'var(--ink-4)' : 'var(--ink)', textDecoration: struck(e.id) ? 'line-through' : undefined }}>{e.text}</span>
              {mode === 'prov' && <Meta>{e.src}</Meta>}
              {mode === 'prov' && e.bad && flagged && !retracted && (
                <button onClick={() => setRetracted(true)} className="t-caption font-medium" style={{ color: 'var(--anti)', letterSpacing: 0 }}>Retract</button>
              )}
            </motion.div>
          ))}
          {flagged && (
            <div className="px-3 py-1.5 t-caption t-mono" style={{ color: 'var(--invisible)', letterSpacing: 0 }}>
              verifier (read-only): re-fetched report.pdf p3, source says 4.2%, not 42%
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-3 py-2" style={{ borderTop: '0.5px solid var(--hairline-2)' }}>
          <Btn quiet onClick={() => { setN(1); setRetracted(false); }}><RotateCcw size={12} /> Reset</Btn>
          <Btn onClick={() => setN((x) => Math.min(BOARD.length, x + 1))} disabled={n === BOARD.length}>Next write</Btn>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.14 · consensus ───────────────────────────────────────────────────────
const TRUTH = 4.2;
const OWN_ANSWERS = [4.2, 4.1, 4.3, 4.2, 4.0];
const SHARED_ANSWER = 42;

export function ConsensusSpecimen() {
  const [agg, setAgg] = useState<'plurality' | 'median'>('plurality');
  const [shared, setShared] = useState<Set<number>>(new Set([3, 4]));
  const votes = OWN_ANSWERS.map((v, i) => (shared.has(i) ? SHARED_ANSWER : v));

  const tally = new Map<number, number>();
  votes.forEach((v) => tally.set(v, (tally.get(v) ?? 0) + 1));
  const top = Math.max(...tally.values());
  const leaders = [...tally.entries()].filter(([, c]) => c === top).map(([v]) => v);
  const sorted = [...votes].sort((a, b) => a - b);
  const median = sorted[2];
  const answer = agg === 'plurality' ? (leaders.length === 1 ? leaders[0] : null) : median;
  const correct = answer !== null && Math.abs(answer - TRUTH) < 0.5;
  const toggle = (i: number) => setShared((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const x = (v: number) => 16 + (v / 45) * 368;

  return (
    <Specimen
      height={290}
      readout={<>answer <Hi tone={correct ? 'good' : 'bad'}>{answer === null ? `tie ${leaders.join(' vs ')}` : `${answer}%`}</Hi>{agg === 'plurality' && answer !== null && <> ({top} of 5)</>} · truth {TRUTH}% · shared-model voters {shared.size}/5</>}
      controls={<Segmented value={agg} onChange={setAgg} options={[{ value: 'plurality', label: 'Plurality' }, { value: 'median', label: 'Geometric median' }]} />}
    >
      <Window width={420}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-1.5">
            {votes.map((v, i) => (
              <button key={i} onClick={() => toggle(i)} className="flex flex-col items-center gap-0.5 rounded-[var(--r-sm)] px-2 py-1.5"
                style={{ background: shared.has(i) ? 'var(--surface-2)' : 'transparent', border: `0.5px solid ${shared.has(i) ? 'var(--invisible)' : 'var(--hairline)'}` }}>
                <span className="t-caption text-ink-3" style={{ letterSpacing: 0 }}>V{i + 1} · {shared.has(i) ? 'base-X' : 'own'}</span>
                <span className="t-sm t-mono text-ink">{v}%</span>
              </button>
            ))}
          </div>
          <svg width="100%" viewBox="0 0 400 64" className="overflow-visible">
            <line x1={16} x2={384} y1={40} y2={40} stroke="var(--hairline)" />
            {[0, 10, 20, 30, 40].map((v) => (
              <text key={v} x={x(v)} y={58} textAnchor="middle" fontSize={9} fill="var(--ink-4)" fontFamily="var(--font-mono, monospace)">{v}</text>
            ))}
            {votes.map((v, i) => (
              <circle key={i} cx={x(v)} cy={34 - (votes.slice(0, i).filter((w) => Math.abs(w - v) < 1).length) * 7} r={3} fill={shared.has(i) ? 'var(--invisible)' : 'var(--ink-3)'} />
            ))}
            {answer !== null && (
              <motion.g initial={false} animate={{ x: x(answer) }} transition={{ duration: 0.25 }}>
                <line x1={0} x2={0} y1={4} y2={44} stroke={correct ? 'var(--pattern)' : 'var(--anti)'} strokeWidth={1.5} />
              </motion.g>
            )}
          </svg>
          <Meta>click a voter to put it on the shared base model</Meta>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.07 · society of mind ─────────────────────────────────────────────────
const debateAcc = (agents: number, rounds: number) => 0.66 + 0.05 * (1 - 1 / agents) + 0.15 * (1 - 1 / agents) * (1 - 1 / rounds);
const ROUNDS = 5;

export function DebateSpecimen() {
  const { t } = useMotion();
  const [agents, setAgents] = useState(1);
  const accs = Array.from({ length: ROUNDS }, (_, r) => debateAcc(agents, r + 1));
  const best = accs[ROUNDS - 1];
  const gain = Math.round((best - debateAcc(1, 1)) * 100);
  const verdict = agents === 1 ? 'reflection: flat' : 'debate: rounds pay';

  return (
    <Specimen
      height={290}
      readout={<>{agents} {agents === 1 ? 'agent' : 'agents'} x {ROUNDS} rounds = <Hi>{agents * ROUNDS} calls</Hi> · accuracy {Math.round(best * 100)}% · gain over 1x1 <Hi tone={gain > 5 ? 'good' : undefined}>+{gain} pts</Hi></>}
      controls={<Slider label="Agents" value={agents} min={1} max={5} onChange={setAgents} verdict={verdict} />}
    >
      <Window width={420}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">Debate, accuracy by round</span>
            <Meta>modelled on the Du et al. ablation</Meta>
          </div>
          <div className="flex h-[120px] items-end gap-3">
            {accs.map((a, r) => (
              <div key={r} className="flex flex-1 flex-col items-center gap-1">
                <Meta>{Math.round(a * 100)}%</Meta>
                <motion.div className="w-full rounded-t-[var(--r-sm)]" style={{ background: r === ROUNDS - 1 ? 'var(--accent)' : 'var(--ink-4)' }}
                  animate={{ height: `${((a - 0.6) / 0.25) * 90}px` }} transition={t()} />
                <Meta>R{r + 1} · {agents * (r + 1)}c</Meta>
              </div>
            ))}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.15 · voting topology ─────────────────────────────────────────────────
type Topo = 'star' | 'chain' | 'tree' | 'graph';
const POS: Record<Topo, [number, number][]> = {
  star: [[180, 80], [100, 30], [260, 30], [100, 130], [260, 130]],
  chain: [[40, 80], [110, 80], [180, 80], [250, 80], [320, 80]],
  tree: [[180, 25], [110, 80], [250, 80], [110, 140], [250, 140]],
  graph: [[180, 20], [276, 66], [240, 145], [120, 145], [84, 66]],
};
const ALL_PAIRS: [number, number][] = [];
for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) if (a !== b) ALL_PAIRS.push([a, b]);
const TOPO_ROUNDS: Record<Topo, [number, number][][]> = {
  star: [[[0, 1], [0, 2], [0, 3], [0, 4]], [[1, 0], [2, 0], [3, 0], [4, 0]]],
  chain: [[[0, 1]], [[1, 2]], [[2, 3]], [[3, 4]]],
  tree: [[[0, 1], [0, 2]], [[1, 3], [2, 4]], [[3, 1], [4, 2]], [[1, 0], [2, 0]]],
  graph: [ALL_PAIRS, ALL_PAIRS],
};
const PROGRESS_UI: Record<Topo, (r: number, n: number) => string> = {
  star: (r) => `fan-out: ${r >= 2 ? 4 : 0}/4 replies`,
  chain: (r, n) => `stepper: step ${r} of ${n}`,
  tree: (r, n) => `levels: ${r} of ${n} hops`,
  graph: (r, n) => `bounded rounds: round ${r} of ${n}`,
};

export function TopologySpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [topo, setTopo] = useState<Topo>('chain');
  const [round, setRound] = useState(0);
  const rounds = TOPO_ROUNDS[topo];
  const pos = POS[topo];
  const edges = useMemo(() => {
    const s = new Set<string>();
    rounds.flat().forEach(([a, b]) => s.add([Math.min(a, b), Math.max(a, b)].join('-')));
    return [...s].map((k) => k.split('-').map(Number) as [number, number]);
  }, [rounds]);
  const live = round > 0 && round <= rounds.length ? rounds[round - 1] : [];
  const msgs = sum(rounds.map((r) => r.length));

  const run = () => { clear(); setRound(0); rounds.forEach((_, k) => after(reduce ? 0 : (k + 1) * 550, () => setRound(k + 1))); };

  return (
    <Specimen
      height={310}
      readout={<>edges <Hi>{edges.length}</Hi> · messages {msgs} · serial hops <Hi>{rounds.length}</Hi> · {PROGRESS_UI[topo](round, rounds.length)}</>}
      controls={<Segmented value={topo} onChange={(v) => { clear(); setTopo(v); setRound(0); }} options={[{ value: 'star', label: 'Star' }, { value: 'chain', label: 'Chain' }, { value: 'tree', label: 'Tree' }, { value: 'graph', label: 'Graph' }]} />}
    >
      <div className="flex w-[360px] max-w-full flex-col items-center gap-2">
        <svg width="100%" viewBox="0 0 360 170" style={{ maxWidth: 360 }}>
          {edges.map(([a, b]) => {
            const on = live.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
            return <line key={`${a}-${b}`} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} stroke={on ? 'var(--accent)' : 'var(--hairline)'} strokeWidth={on ? 2 : 1} />;
          })}
          {pos.map(([cx, cy], i) => {
            const on = live.some(([, q]) => q === i);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={13} fill="var(--surface)" stroke={on ? 'var(--accent)' : 'var(--hairline)'} strokeWidth={on ? 2 : 1} />
                <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={10} fill="var(--ink-2)" fontFamily="var(--font-mono, monospace)">{String.fromCharCode(65 + i)}</text>
              </g>
            );
          })}
        </svg>
        <Btn onClick={run}><Play size={12} /> Run one pass</Btn>
      </div>
    </Specimen>
  );
}

// ── 16.16 · negotiation ─────────────────────────────────────────────────────
const SELLER_FLOOR = 90;
const BUYER_CEIL = 120;
type Offer = { side: 'seller' | 'buyer'; price: number; text: string; accept?: boolean };
const MODEL_OFFERS: Offer[] = [
  { side: 'seller', price: 150, text: 'Hand-built, lifetime warranty. 150.' },
  { side: 'buyer', price: 70, text: 'Similar ones go for 70.' },
  { side: 'seller', price: 110, text: 'For you, 110.' },
  { side: 'buyer', price: 88, text: '88 and I pay today.' },
  { side: 'seller', price: 88, text: 'You have been lovely. Deal at 88.', accept: true },
];
const PITCHES = ['Hand-built, lifetime warranty.', 'Similar ones go for less.', 'Shipping is included.', 'I can pay today.', 'Last move from me.', 'Meeting you halfway.', 'Final offer.'];

function generatorOffers(): Offer[] {
  const out: Offer[] = [];
  for (let k = 0; k < 6; k++) {
    const ask = 130 - 8 * k;
    const bid = 80 + 10 * k;
    out.push({ side: 'seller', price: ask, text: PITCHES[(2 * k) % PITCHES.length] });
    if (bid >= ask) { out.push({ side: 'buyer', price: ask, text: 'Agreed.', accept: true }); break; }
    out.push({ side: 'buyer', price: bid, text: PITCHES[(2 * k + 1) % PITCHES.length] });
  }
  return out;
}

export function NegotiationSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'model' | 'generator'>('model');
  const [n, setN] = useState(1);
  const offers = useMemo(() => (mode === 'model' ? MODEL_OFFERS : generatorOffers()), [mode]);
  const shown = offers.slice(0, n);
  const breaks = (o: Offer) => (o.side === 'seller' ? o.price < SELLER_FLOOR : o.price > BUYER_CEIL);
  const broke = shown.filter(breaks).length;
  const last = shown[shown.length - 1];
  const closed = !!last.accept;
  const x = (p: number) => `${((p - 60) / 100) * 100}%`;

  return (
    <Specimen
      height={320}
      readout={<>offers {shown.length} · broke own limit <Hi tone={broke ? 'bad' : 'good'}>{broke}</Hi>{closed && <> · deal at <Hi tone={breaks(last) ? 'bad' : 'good'}>{last.price}</Hi>{breaks(last) ? `, below seller floor ${SELLER_FLOOR}` : `, inside ZOPA ${SELLER_FLOOR}-${BUYER_CEIL}`}</>}</>}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setN(1); }} options={[{ value: 'model', label: 'Model sets price' }, { value: 'generator', label: 'Generator sets price' }]} />}
    >
      <Window width={460} height={260}>
        <div className="relative mx-4 mt-4 h-6 rounded-full" style={{ background: 'var(--surface-2)' }}>
          <div className="absolute inset-y-0 rounded-full" style={{ left: x(SELLER_FLOOR), width: `${BUYER_CEIL - SELLER_FLOOR}%`, background: 'var(--pattern)', opacity: 0.18 }} />
          {shown.map((o, k) => (
            <motion.div key={`${mode}-${k}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()}
              className="absolute top-0 h-full w-[2px]" style={{ left: x(o.price), background: k === shown.length - 1 ? 'var(--accent)' : 'var(--ink-4)' }} />
          ))}
          <span className="absolute -bottom-4 t-caption t-mono text-ink-4" style={{ left: x(SELLER_FLOOR), letterSpacing: 0 }}>90</span>
          <span className="absolute -bottom-4 -translate-x-full t-caption t-mono text-ink-4" style={{ left: x(BUYER_CEIL), letterSpacing: 0 }}>120</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1 overflow-hidden px-4 pt-5 pb-2">
          {shown.slice(-4).map((o, k) => (
            <div key={`${mode}-${shown.length - 4 + k}`} className="flex items-center gap-2 t-sm">
              <span className="w-[46px] shrink-0 text-ink-3">{o.side}</span>
              <Chip tone={breaks(o) ? 'bad' : undefined} on={!breaks(o)}>{o.price} · {mode === 'model' ? 'model' : 'computed'}</Chip>
              <span className="truncate text-ink-2">{o.text}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end px-3 py-2" style={{ borderTop: '0.5px solid var(--hairline-2)' }}>
          {closed
            ? <Btn quiet onClick={() => setN(1)}><RotateCcw size={12} /> Again</Btn>
            : <Btn onClick={() => setN((v) => Math.min(offers.length, v + 1))}>Next offer</Btn>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.17 · generative agents retrieval ─────────────────────────────────────
const MEMORIES = [
  { text: 'Brushed teeth', hours: 0.2, imp: 1, rel: 0 },
  { text: 'Ate toast at Hobbs Cafe', hours: 0.5, imp: 1, rel: 0.05 },
  { text: 'Walked past the pharmacy', hours: 1, imp: 1, rel: 0.02 },
  { text: 'Read a paper on gentrification', hours: 2, imp: 4, rel: 0.1 },
  { text: 'Maria said she will be at the party', hours: 6, imp: 6, rel: 0.8 },
  { text: 'Isabella invited me to her party at 5pm', hours: 20, imp: 8, rel: 0.95 },
  { text: 'Reflection: I want to know my neighbours', hours: 30, imp: 7, rel: 0.55 },
];
const norm = (xs: number[]) => { const lo = Math.min(...xs); const hi = Math.max(...xs); return xs.map((v) => (v - lo) / (hi - lo || 1)); };

export function RetrievalSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'recency' | 'full'>('recency');
  const rec = norm(MEMORIES.map((m) => Math.pow(0.9, m.hours)));
  const imp = norm(MEMORIES.map((m) => m.imp));
  const rel = norm(MEMORIES.map((m) => m.rel));
  const scored = MEMORIES.map((m, i) => ({ ...m, i, r: rec[i], im: imp[i], re: rel[i], s: mode === 'recency' ? rec[i] : rec[i] + imp[i] + rel[i] }))
    .sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 3);
  const partyRank = scored.findIndex((m) => m.i === 5) + 1;
  const goes = top.some((m) => m.rel > 0.5);

  return (
    <Specimen
      height={320}
      readout={<>invite memory ranks <Hi tone={partyRank <= 3 ? 'good' : 'bad'}>#{partyRank}</Hi> of {MEMORIES.length} · Klaus {goes ? <Hi tone="good">goes to the party</Hi> : <Hi tone="bad">stays home</Hi>}</>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'recency', label: 'Recency only' }, { value: 'full', label: 'Recency + importance + relevance' }]} />}
    >
      <Window width={480}>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
          <span className="t-sm text-ink">Query: should Klaus go out tonight?</span>
          <Meta>rec · imp · rel</Meta>
        </div>
        <div className="flex flex-col">
          {scored.map((m, k) => (
            <motion.div layout transition={t()} key={m.i} className="flex items-center gap-2 px-3 py-1 t-sm"
              style={{ background: k < 3 ? 'var(--surface-2)' : undefined, borderBottom: '0.5px solid var(--hairline-2)' }}>
              <span className="w-3 shrink-0">{k < 3 && <Dot tone="good" />}</span>
              <span className="min-w-0 flex-1 truncate" style={{ color: k < 3 ? 'var(--ink)' : 'var(--ink-4)' }}>{m.text}</span>
              <Meta>{m.r.toFixed(2)} · {mode === 'full' ? m.im.toFixed(2) : '-'} · {mode === 'full' ? m.re.toFixed(2) : '-'}</Meta>
              <span className="w-[34px] text-right t-caption t-mono text-ink" style={{ letterSpacing: 0 }}>{m.s.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.18 · theory of mind ──────────────────────────────────────────────────
const NO_TOM_DUP = 0.35;
const tomDup = (turn: number) => 0.05 + 0.3 * (turn - 1) / 29;
const draw = (turn: number) => (turn * 0.6180339887) % 1;

export function TheoryOfMindSpecimen() {
  const [h, setH] = useState(10);
  const turns = Array.from({ length: h }, (_, k) => k + 1);
  const noTom = turns.map((k) => draw(k) < NO_TOM_DUP);
  const tom = turns.map((k) => draw(k) < tomDup(k));
  const pNo = Math.round((noTom.filter(Boolean).length / h) * 100);
  const pTom = Math.round((tom.filter(Boolean).length / h) * 100);
  const adv = pNo - pTom;
  const verdict = adv >= 25 ? 'ToM holding' : adv >= 15 ? 'ToM eroding' : 'advantage mostly gone';

  const strip = (label: string, cells: boolean[]) => (
    <div key={label} className="flex items-center gap-2">
      <span className="w-[86px] shrink-0 t-sm text-ink-3">{label}</span>
      <div className="flex flex-1 flex-wrap gap-[2px]">
        {cells.map((d, k) => (
          <span key={k} title={`turn ${k + 1}${d ? ', duplicate' : ''}`} className="h-4 w-[9px] rounded-[2px]" style={{ background: d ? 'var(--anti)' : 'var(--surface-2)' }} />
        ))}
      </div>
    </div>
  );

  return (
    <Specimen
      height={250}
      readout={<>duplicate effort: no ToM <Hi tone="bad">{pNo}%</Hi> · first-order ToM <Hi>{pTom}%</Hi> · advantage {adv} pts</>}
      controls={<Slider label="Horizon" value={h} min={10} max={30} onChange={setH} verdict={`${h} turns · ${verdict}`} />}
    >
      <Window width={440}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">Two agents, one token field</span>
            <Meta>red = both reached for one token</Meta>
          </div>
          {strip('No ToM', noTom)}
          {strip('First-order', tom)}
          <Meta>modelled: belief binding decays as the context fills</Meta>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.21 · Shapley credit ──────────────────────────────────────────────────
const PLAYERS = ['Search', 'Draft', 'Check'];
const COALITION: Record<string, number> = { '': 0, '0': 0.2, '1': 0.3, '2': 0, '01': 0.6, '02': 0.3, '12': 0.4, '012': 0.8 };
const ORDERS = [[0, 1, 2], [2, 1, 0], [1, 0, 2], [0, 2, 1], [1, 2, 0], [2, 0, 1]];
const coal = (s: number[]) => COALITION[[...s].sort().join('')];
const marginals = (order: number[]) => {
  const m = [0, 0, 0];
  order.forEach((p, k) => { m[p] = coal(order.slice(0, k + 1)) - coal(order.slice(0, k)); });
  return m;
};

export function ShapleySpecimen() {
  const [rule, setRule] = useState<'equal' | 'shapley'>('shapley');
  const [n, setN] = useState(0);
  const total = coal([0, 1, 2]);
  const sampled = ORDERS.slice(0, n).map(marginals);
  const shares = rule === 'equal'
    ? PLAYERS.map(() => total / 3)
    : PLAYERS.map((_, p) => (n ? sum(sampled.map((m) => m[p])) / n : 0));
  const solo = PLAYERS.map((_, p) => coal([p]));

  return (
    <Specimen
      height={320}
      readout={rule === 'shapley' && n === 0
        ? 'Sample an ordering to start the estimate'
        : <>{PLAYERS.map((p, k) => `${p} ${shares[k].toFixed(2)}`).join(' · ')} · sum <Hi tone={Math.abs(sum(shares) - total) < 1e-9 ? 'good' : 'bad'}>{sum(shares).toFixed(2)}</Hi> of {total.toFixed(2)}{rule === 'shapley' && ` · ${n}/6 orderings`}</>}
      controls={<Segmented value={rule} onChange={(r) => { setRule(r); setN(0); }} options={[{ value: 'equal', label: 'Equal split' }, { value: 'shapley', label: 'Shapley' }]} />}
    >
      <Window width={460}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">Run result 0.80 · credit split</span>
            {rule === 'shapley' && <Btn onClick={() => setN((v) => Math.min(ORDERS.length, v + 1))} disabled={n === ORDERS.length}>Sample ordering</Btn>}
          </div>
          {PLAYERS.map((p, k) => (
            <div key={p} className="flex items-center gap-3">
              <span className="w-[54px] shrink-0 t-sm text-ink">{p}</span>
              <div className="h-2.5 flex-1 rounded-full" style={{ background: 'var(--surface-2)' }}>
                <motion.div className="h-full rounded-full" style={{ background: 'var(--accent)' }} animate={{ width: `${(shares[k] / total) * 100}%` }} transition={{ duration: 0.2 }} />
              </div>
              <Meta>alone {solo[k].toFixed(1)}</Meta>
            </div>
          ))}
          {rule === 'shapley' && (
            <div className="flex h-[66px] flex-col overflow-hidden">
              {ORDERS.slice(0, n).slice(-3).map((o, k) => {
                const m = marginals(o);
                return (
                  <LogLine key={o.join()} right={o.map((p) => `+${m[p].toFixed(1)}`).join(' ')}>
                    {n - Math.min(n, 3) + k + 1}. {o.map((p) => PLAYERS[p]).join(' > ')}
                  </LogLine>
                );
              })}
            </div>
          )}
          {rule === 'equal' && <Meta>Check scores 0 alone yet gets a third. Equal split ignores marginal value.</Meta>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.02 · FIPA-ACL performatives ──────────────────────────────────────────
const ACL_MSGS = [
  { text: 'Can you book 50 units at $4?', perf: 'request', content: 'book(units: 50, price: 4)' },
  { text: "What's the price for 50 units?", perf: 'query-ref', content: 'price(units: 50)' },
  { text: "I won't accept $5 per unit.", perf: 'reject-proposal', content: 'proposal(price: 5)' },
];
const HANDLERS: Record<string, string> = {
  request: 'book()',
  'query-ref': 'quote()',
  'reject-proposal': 'counter()',
  'query-if': 'answerYesNo()',
  'accept-proposal': 'confirmOrder()',
  'not-understood': 'askAgain()',
};
const guessPerformative = (s: string) => {
  const t = s.toLowerCase();
  if (/\b(accept|agree)\b/.test(t)) return 'accept-proposal';
  if (/^(can|could) you\b/.test(t)) return 'query-if';
  if (/^(what|how much)\b/.test(t)) return 'query-ref';
  if (/\b(please|book|send)\b/.test(t)) return 'request';
  return 'not-understood';
};

export function PerformativeSpecimen() {
  const [mode, setMode] = useState<'text' | 'acl'>('text');
  const [sent, setSent] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const parsed = (i: number) => (mode === 'acl' ? ACL_MSGS[i].perf : guessPerformative(ACL_MSGS[i].text));
  const right = sent.filter((i) => parsed(i) === ACL_MSGS[i].perf).length;
  const send = (i: number) => { setSel(i); setSent((s) => (s.includes(i) ? s : [...s, i])); };
  const m = sel === null ? null : ACL_MSGS[sel];

  return (
    <Specimen
      height={320}
      readout={sent.length === 0 ? 'Send each message to the supplier agent'
        : <>sent {sent.length} · routed to the right handler <Hi tone={right < sent.length ? 'bad' : 'good'}>{right}/{sent.length}</Hi></>}
      controls={<Segmented value={mode} onChange={(v) => { setMode(v); setSent([]); setSel(null); }} options={[{ value: 'text', label: 'Free text' }, { value: 'acl', label: 'Performative' }]} />}
    >
      <Window width={480} height={250}>
        <div className="flex min-h-0 flex-1">
          <div className="w-[200px] shrink-0" style={{ borderRight: '0.5px solid var(--hairline-2)' }}>
            <div className="px-3 py-1.5"><Meta>buyer-7 outbox</Meta></div>
            {ACL_MSGS.map((x, i) => (
              <Row key={x.text} onClick={() => send(i)} active={sel === i}>
                <span className="min-w-0 flex-1 truncate">{x.text}</span>
                {sent.includes(i) && <Dot tone={parsed(i) === x.perf ? 'good' : 'bad'} />}
              </Row>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
            {!m ? <span className="t-sm text-ink-4">Click a message to send it.</span> : (
              <>
                <pre className="t-caption t-mono overflow-hidden rounded-[var(--r-sm)] p-2 text-ink-2" style={{ background: 'var(--surface-2)', letterSpacing: 0 }}>
                  {mode === 'acl'
                    ? `(${m.perf}\n  :sender buyer-7\n  :receiver supplier-2\n  :content ${m.content}\n  :ontology procurement)`
                    : `"${m.text}"`}
                </pre>
                <Meta>supplier-2 {mode === 'acl' ? 'reads the performative' : 'guesses intent'}</Meta>
                <LogLine right={parsed(sel!) === m.perf ? 'right' : `meant ${m.perf}`} tone={parsed(sel!) === m.perf ? 'good' : 'bad'}>
                  {parsed(sel!)} → {HANDLERS[parsed(sel!)]}
                </LogLine>
              </>
            )}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.19 · ACO routing ─────────────────────────────────────────────────────
const ROUTE_AGENTS = [
  { name: 'Fast', lat: 1, q: 0.55 },
  { name: 'Balanced', lat: 2, q: 0.85 },
  { name: 'Careful', lat: 4, q: 0.97 },
];
const EVAPORATE = 0.95;
const DEPOSIT = 0.3;
const ROUTE_TOTAL = 100;

function routeTasks(gated: boolean) {
  const r = mulberry32(11);
  let tau = [1, 1, 1];
  const frames: { tau: number[]; picks: number[]; wrong: number }[] = [];
  const picks = [0, 0, 0];
  let wrong = 0;
  for (let i = 0; i < ROUTE_TOTAL; i++) {
    const w = tau.map((tv, k) => tv * Math.sqrt(1 / ROUTE_AGENTS[k].lat));
    let u = r() * sum(w);
    let k = 0;
    while (k < 2 && u > w[k]) { u -= w[k]; k++; }
    const ok = r() < ROUTE_AGENTS[k].q;
    picks[k]++;
    if (!ok) wrong++;
    tau = tau.map((tv) => tv * EVAPORATE);
    if (!gated) tau[k] += (DEPOSIT * 2) / ROUTE_AGENTS[k].lat;
    else if (ok) tau[k] += DEPOSIT;
    frames.push({ tau: [...tau], picks: [...picks], wrong });
  }
  return frames;
}

export function PheromoneSpecimen() {
  const { t } = useMotion();
  const [gate, setGate] = useState<'off' | 'on'>('off');
  const [n, setN] = useState(0);
  const frames = useMemo(() => routeTasks(gate === 'on'), [gate]);
  const f = n ? frames[n - 1] : { tau: [1, 1, 1], picks: [0, 0, 0], wrong: 0 };
  const tauSum = sum(f.tau);
  const fastShare = n ? Math.round((f.picks[0] / n) * 100) : 0;

  return (
    <Specimen
      height={290}
      readout={<>tasks {n}/{ROUTE_TOTAL} · routed to Fast <Hi tone={fastShare > 60 ? 'bad' : undefined}>{fastShare}%</Hi> · wrong answers served <Hi tone={f.wrong > 25 ? 'bad' : undefined}>{f.wrong}</Hi></>}
      controls={<Segmented value={gate} onChange={(g) => { setGate(g); setN(0); }} options={[{ value: 'off', label: 'Quality gate off' }, { value: 'on', label: 'Quality gate on' }]} />}
    >
      <Window width={440}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">Router pheromone</span>
            <div className="flex gap-2">
              <Btn quiet onClick={() => setN(0)}><RotateCcw size={12} /></Btn>
              <Btn onClick={() => setN((v) => Math.min(ROUTE_TOTAL, v + 10))} disabled={n === ROUTE_TOTAL}>Route 10 tasks</Btn>
            </div>
          </div>
          {ROUTE_AGENTS.map((a, k) => (
            <div key={a.name} className="flex items-center gap-3">
              <span className="w-[64px] shrink-0 t-sm text-ink">{a.name}</span>
              <div className="h-2.5 flex-1 rounded-full" style={{ background: 'var(--surface-2)' }}>
                <motion.div className="h-full rounded-full" style={{ background: k === 0 ? 'var(--accent)' : 'var(--ink-4)' }} animate={{ width: `${(f.tau[k] / tauSum) * 100}%` }} transition={t()} />
              </div>
              <Meta>{a.lat}s · {Math.round(a.q * 100)}% right · {f.picks[k]} tasks</Meta>
            </div>
          ))}
          <Meta>{gate === 'off' ? 'every finished run deposits, faster deposits more' : 'only runs that pass verification deposit'}</Meta>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.20 · MARL, CTDE ──────────────────────────────────────────────────────
const line = (...stops: number[]) => {
  const out = [stops[0]];
  for (let k = 1; k < stops.length; k++) {
    let p = out[out.length - 1];
    while (p !== stops[k]) { p += p < stops[k] ? 1 : -1; out.push(p); }
  }
  return out;
};
const EPISODES: Record<'ind' | 'ctde', [number[], number[]][]> = {
  ind: [[line(3, 0), line(3, 6)], [line(3, 0), line(3, 0, 6)], [line(3, 6), line(3, 0)], [line(3, 6), line(3, 6, 0)]],
  ctde: [[line(3, 0), line(3, 6)], [line(3, 0), line(3, 2, 6)], [line(3, 6), line(3, 0)], [line(3, 0), line(3, 6)]],
};
const epLen = (ep: [number[], number[]]) => Math.max(ep[0].length, ep[1].length) - 1;

export function CtdeSpecimen() {
  const { reduce, t } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'ind' | 'ctde'>('ind');
  const [ep, setEp] = useState(0);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const eps = EPISODES[mode];
  const cur = ep ? eps[ep - 1] : null;
  const at = (path: number[]) => path[Math.min(tick, path.length - 1)];
  const done = ep ? eps.slice(0, ep).map(epLen) : [];
  const finished = !busy && ep > 0;
  const mean = finished ? sum(done) / done.length : 0;

  const play = () => {
    const next = (ep % eps.length) + 1;
    const len = epLen(eps[next - 1]);
    clear(); setEp(next); setTick(0); setBusy(true);
    for (let s = 1; s <= len; s++) after(reduce ? 0 : s * 220, () => setTick(s));
    after(reduce ? 0 : len * 220 + 40, () => setBusy(false));
  };

  return (
    <Specimen
      height={270}
      readout={!finished
        ? (busy ? `episode ${ep} · step ${tick}` : 'Play episodes from the trained policies')
        : <>episode {ep} · {epLen(cur!)} steps · mean over {done.length}: <Hi tone={mean > 4 ? 'bad' : 'good'}>{mean.toFixed(1)}</Hi> · optimal 3</>}
      controls={<Segmented value={mode} onChange={(m) => { clear(); setMode(m); setEp(0); setTick(0); setBusy(false); }} options={[{ value: 'ind', label: 'Independent learners' }, { value: 'ctde', label: 'CTDE' }]} />}
    >
      <Window width={420}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">Cover both goals</span>
            <Btn onClick={play} disabled={busy}><Play size={12} /> Play episode</Btn>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }, (_, c) => {
              const goal = c === 0 || c === 6;
              return (
                <div key={c} className="relative flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-[var(--r-sm)]"
                  style={{ background: goal ? 'var(--surface-2)' : 'transparent', border: `0.5px solid ${goal ? 'var(--accent)' : 'var(--hairline-2)'}` }}>
                  {cur && at(cur[0]) === c && <motion.span layoutId={`ctde-a-${mode}`} transition={t(0.18)} className="t-caption t-mono rounded-full px-1.5" style={{ background: 'var(--ink)', color: 'var(--bg)', letterSpacing: 0 }}>A</motion.span>}
                  {cur && at(cur[1]) === c && <motion.span layoutId={`ctde-b-${mode}`} transition={t(0.18)} className="t-caption t-mono rounded-full px-1.5" style={{ background: 'var(--ink-3)', color: 'var(--bg)', letterSpacing: 0 }}>B</motion.span>}
                </div>
              );
            })}
          </div>
          <Meta>at execution both agents see only their own cell and the goals · {mode === 'ind' ? 'trained alone' : 'trained with a joint critic'}</Meta>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.22 · checkpoints ─────────────────────────────────────────────────────
const RUN_STEPS = 50;
const CRASH_AT = 37;
const SIDE_EFFECTS: Record<number, string> = { 12: 'POST /email', 30: 'POST /charge' };
type Frame = { worker: number; step: number; crash?: boolean };

function runFrames(checkpoint: boolean): Frame[] {
  const f: Frame[] = [];
  for (let s = 1; s < CRASH_AT; s++) f.push({ worker: 1, step: s });
  f.push({ worker: 1, step: CRASH_AT, crash: true });
  for (let s = checkpoint ? CRASH_AT : 1; s <= RUN_STEPS; s++) f.push({ worker: 2, step: s });
  return f;
}

export function CheckpointSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'off' | 'on'>('off');
  const [n, setN] = useState(0);
  const frames = useMemo(() => runFrames(mode === 'on'), [mode]);
  const played = frames.slice(0, n);
  const crashed = played.some((f) => f.crash);
  const effects = played.filter((f) => !f.crash && SIDE_EFFECTS[f.step]);
  const fired = new Map<number, number>();
  effects.forEach((f) => fired.set(f.step, (fired.get(f.step) ?? 0) + 1));
  const refired = effects.length - fired.size;
  const reran = played.filter((f) => f.worker === 2 && f.step < CRASH_AT).length;
  const cur = played[played.length - 1];
  const doneSteps = cur ? (cur.crash ? CRASH_AT - 1 : cur.step) : 0;
  const status = !cur ? 'idle' : cur.crash ? 'crashed' : !crashed ? 'running' : n === frames.length ? (mode === 'on' ? 'resumed, completed' : 'restarted, completed') : mode === 'on' ? `resumed at ${CRASH_AT}` : 'retrying from 1';

  const run = () => {
    clear(); setN(0);
    frames.forEach((_, k) => after(reduce ? 0 : (k + 1) * 35 + (k >= CRASH_AT ? 500 : 0), () => setN(k + 1)));
  };

  return (
    <Specimen
      height={290}
      readout={<>status: <Hi tone={!crashed || cur?.crash ? undefined : mode === 'off' ? 'bad' : 'good'}>{status}</Hi> · steps re-run {reran} · side effects re-fired <Hi tone={refired ? 'bad' : undefined}>{refired}</Hi></>}
      controls={<Segmented value={mode} onChange={(m) => { clear(); setMode(m); setN(0); }} options={[{ value: 'off', label: 'No checkpoints' }, { value: 'on', label: 'Checkpoint every step' }]} />}
    >
      <Window width={460}>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">Run r-219 · {cur ? `worker-${cur.worker}` : 'queued'}</span>
            <Btn onClick={run}><Play size={12} /> Run</Btn>
          </div>
          <div className="flex gap-[2px]">
            {Array.from({ length: RUN_STEPS }, (_, k) => {
              const s = k + 1;
              const isDone = s <= doneSteps;
              return (
                <span key={s} className="h-4 flex-1 rounded-[1px]" title={`step ${s}`}
                  style={{ background: s === CRASH_AT && crashed && cur?.worker === 1 ? 'var(--anti)' : isDone ? (SIDE_EFFECTS[s] ? 'var(--accent)' : 'var(--ink-4)') : 'var(--surface-2)' }} />
              );
            })}
          </div>
          <Panel title="Side effects" meta={`${effects.length} sent`}>
            <div className="flex h-[66px] flex-col">
              {effects.slice(-3).map((f, k) => {
                const dup = effects.slice(0, effects.length - Math.min(3, effects.length) + k).some((g) => g.step === f.step);
                return <LogLine key={`${f.worker}-${f.step}`} right={dup ? 'duplicate' : 'ok'} tone={dup ? 'bad' : 'good'}>step {f.step} · {SIDE_EFFECTS[f.step]} · worker-{f.worker}</LogLine>;
              })}
            </div>
          </Panel>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.23 · retry storm ─────────────────────────────────────────────────────
const BASE_RPS = 100;
const CAPACITY = 120;
const RETRIES_PER_FAIL = 3;
const TRIP_AT = 0.15;
const TICKS = 20;
const LOAD_MAX = 1000;

function storm(breaker: boolean) {
  let retries = 0;
  let open = false;
  return Array.from({ length: TICKS }, () => {
    const load = Math.min(LOAD_MAX, BASE_RPS + retries);
    const fail = load <= CAPACITY ? 0.1 : Math.min(0.95, 0.1 + (load - CAPACITY) / load);
    if (breaker && !open && fail > TRIP_AT) open = true;
    retries = open ? 0 : Math.round(load * fail) * RETRIES_PER_FAIL;
    return { load, fail, open };
  });
}

export function RetryStormSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'retry' | 'breaker'>('retry');
  const [n, setN] = useState(0);
  const ticks = useMemo(() => storm(mode === 'breaker'), [mode]);
  const shown = ticks.slice(0, n);
  const peak = shown.length ? Math.max(...shown.map((s) => s.load)) : 0;
  const last = shown[shown.length - 1];
  const state = !last ? 'idle' : last.fail >= 0.9 ? 'cluster down' : last.open ? 'breaker open, serving degraded' : last.load > CAPACITY ? 'over capacity' : 'healthy';

  const run = () => { clear(); setN(0); ticks.forEach((_, k) => after(reduce ? 0 : (k + 1) * 140, () => setN(k + 1))); };

  return (
    <Specimen
      height={300}
      readout={<>peak load <Hi tone={peak > 3 * BASE_RPS ? 'bad' : undefined}>{(peak / BASE_RPS).toFixed(1)}x</Hi> base · {last ? `failing ${Math.round(last.fail * 100)}%` : 'base failure 10%'} · <Hi tone={state === 'cluster down' ? 'bad' : last?.open ? 'good' : undefined}>{state}</Hi></>}
      controls={<Segmented value={mode} onChange={(m) => { clear(); setMode(m); setN(0); }} options={[{ value: 'retry', label: 'Retry 3x, no breaker' }, { value: 'breaker', label: 'Circuit breaker' }]} />}
    >
      <Window width={440}>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <span className="t-sm text-ink">payments-api · requests/s</span>
            <Btn onClick={run}><Play size={12} /> Run</Btn>
          </div>
          <div className="relative flex h-[130px] items-end gap-[3px]">
            <div className="absolute inset-x-0" style={{ bottom: `${(CAPACITY / LOAD_MAX) * 100}%`, borderTop: '1px dashed var(--ink-4)' }} />
            {Array.from({ length: TICKS }, (_, k) => {
              const s = shown[k];
              return (
                <motion.div key={k} className="flex-1 rounded-t-[2px]"
                  style={{ background: !s ? 'var(--surface-2)' : s.fail >= 0.9 ? 'var(--anti)' : s.open ? 'var(--pattern)' : s.load > CAPACITY ? 'var(--invisible)' : 'var(--ink-4)' }}
                  animate={{ height: `${s ? Math.max(2, (s.load / LOAD_MAX) * 100) : 2}%` }}
                  transition={{ duration: reduce ? 0 : 0.12 }} />
              );
            })}
          </div>
          <Meta>dashed line: capacity {CAPACITY} rps · each failed call retried {RETRIES_PER_FAIL}x</Meta>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 16.24 · benchmark split ─────────────────────────────────────────────────
const SPLITS = { verified: 0.7, pro: 0.23 };
const TASKS_N = 100;

export function SplitSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [split, setSplit] = useState<'verified' | 'pro'>('verified');
  const [n, setN] = useState(0);
  const rate = SPLITS[split];
  const ok = (i: number) => Math.floor((i + 1) * rate) > Math.floor(i * rate);
  const solved = Array.from({ length: n }, (_, i) => ok(i)).filter(Boolean).length;

  const run = () => { clear(); setN(0); for (let k = 1; k <= TASKS_N; k++) after(reduce ? 0 : k * 14, () => setN(k)); };

  return (
    <Specimen
      height={290}
      readout={n === 0 ? 'Dispatch 100 tickets at the rate this split reports'
        : <>solved {solved}/{n} · into your recovery flow <Hi tone={n - solved > solved ? 'bad' : undefined}>{n - solved}</Hi> · primary flow: <Hi>{n - solved > solved ? 'failure handling' : 'success'}</Hi></>}
      controls={<Segmented value={split} onChange={(s) => { clear(); setSplit(s); setN(0); }} options={[{ value: 'verified', label: 'SWE-bench Verified rate' }, { value: 'pro', label: 'SWE-bench Pro rate' }]} />}
    >
      <Window width={420}>
        <div className="flex items-center gap-5 p-4">
          <div className="grid shrink-0 grid-cols-10 gap-[3px]">
            {Array.from({ length: TASKS_N }, (_, i) => (
              <span key={i} className="size-[13px] rounded-[2px]"
                style={{ background: i >= n ? 'var(--surface-2)' : ok(i) ? 'var(--pattern)' : 'var(--anti)', opacity: i >= n ? 1 : 0.85 }} />
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="t-sm text-ink">Agent fixes tickets</span>
            <Meta>claimed rate {Math.round(rate * 100)}%</Meta>
            <div className="flex items-center gap-1.5 t-caption text-ink-3" style={{ letterSpacing: 0 }}><span className="size-2 rounded-[2px]" style={{ background: 'var(--pattern)' }} />merged</div>
            <div className="flex items-center gap-1.5 t-caption text-ink-3" style={{ letterSpacing: 0 }}><span className="size-2 rounded-[2px]" style={{ background: 'var(--anti)' }} />needs a human</div>
            <Btn onClick={run}><Play size={12} /> Dispatch</Btn>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

export const PHASE16_SPECIMENS: Record<string, FC> = {
  'p16-01-why-multi-agent': CeilingSpecimen,
  'p16-02-fipa-acl': PerformativeSpecimen,
  'p16-03-communication-protocols': LifecycleSpecimen,
  'p16-04-primitive-model': OrchestratorSpecimen,
  'p16-05-supervisor': SupervisorSpecimen,
  'p16-06-hierarchical': HierarchySpecimen,
  'p16-07-society-of-mind': DebateSpecimen,
  'p16-08-role-specialization': VerifierSpecimen,
  'p16-09-parallel-swarm': QueueSpecimen,
  'p16-10-group-chat': SelectorSpecimen,
  'p16-11-handoffs': HandoffSpecimen,
  'p16-12-a2a': DelegationSpecimen,
  'p16-13-blackboard': BlackboardSpecimen,
  'p16-14-consensus-bft': ConsensusSpecimen,
  'p16-15-voting-topology': TopologySpecimen,
  'p16-16-negotiation': NegotiationSpecimen,
  'p16-17-generative-agents': RetrievalSpecimen,
  'p16-18-theory-of-mind': TheoryOfMindSpecimen,
  'p16-19-swarm-optimization': PheromoneSpecimen,
  'p16-20-marl': CtdeSpecimen,
  'p16-21-agent-economies': ShapleySpecimen,
  'p16-22-production-scaling': CheckpointSpecimen,
  'p16-23-failure-modes-mast': RetryStormSpecimen,
  'p16-24-eval-coordination': SplitSpecimen,
};
