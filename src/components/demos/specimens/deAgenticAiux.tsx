import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  Mic,
  Paperclip,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Sun,
  Undo2,
  X,
} from 'lucide-react';
import { Dot, Kbd, Segmented, Specimen, Window, useMotion } from './kit';

// Design engineering · Agentic UI + AI UX patterns. One specimen per lesson.

// ── helpers ─────────────────────────────────────────────────────────────────
function useTimers() {
  const ids = useRef<Set<number>>(new Set());
  useEffect(() => {
    const set = ids.current;
    return () => set.forEach((i) => window.clearTimeout(i));
  }, []);
  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      ids.current.delete(id);
      fn();
    }, ms);
    ids.current.add(id);
  }, []);
  const clear = useCallback(() => {
    ids.current.forEach((i) => window.clearTimeout(i));
    ids.current.clear();
  }, []);
  return { after, clear };
}

function useNow(active: boolean, step = 100) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!active) return;
    setNow(performance.now());
    const id = window.setInterval(() => setNow(performance.now()), step);
    return () => window.clearInterval(id);
  }, [active, step]);
  return now;
}

function useStream(total: number, ms: number, runKey: unknown) {
  const [p, setP] = useState(0);
  const iv = useRef(0);
  useEffect(() => {
    setP(0);
    iv.current = window.setInterval(() => setP((x) => x + 1), ms);
    return () => window.clearInterval(iv.current);
  }, [ms, runKey]);
  useEffect(() => {
    if (p >= total) window.clearInterval(iv.current);
  }, [p, total]);
  return Math.min(p, total);
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="t-caption t-mono shrink-0 whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}>{children}</span>;
}

function Btn({
  children,
  onClick,
  primary,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium transition-opacity disabled:opacity-40"
      style={
        primary
          ? { background: 'var(--ink)', color: 'var(--bg)' }
          : { border: `0.5px solid ${danger ? 'var(--anti)' : 'var(--hairline)'}`, color: danger ? 'var(--anti)' : 'var(--ink)' }
      }
    >
      {children}
    </button>
  );
}

function Replay({ onClick, label = 'Replay', icon }: { onClick: () => void; label?: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] px-3.5 py-1.5 t-sm font-medium text-ink-2 transition-colors hover:text-ink"
      style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline-2)' }}
    >
      {icon ?? <RotateCcw size={13} />} {label}
    </button>
  );
}

function Controls({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div className="t-caption t-mono flex flex-col gap-0.5 rounded-[var(--r-sm)] p-2 text-ink-2" style={{ background: 'var(--surface-2)', letterSpacing: 0 }}>
      {children}
    </div>
  );
}

function Bar({ w }: { w: string }) {
  return <div className="h-1.5 rounded-full" style={{ width: w, background: 'var(--surface-2)' }} />;
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  verdict,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  verdict: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[400px] items-center gap-3">
      <span className="t-sm shrink-0 text-ink-3">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1"
        style={{ accentColor: 'var(--accent)' }}
        aria-label={label}
      />
      <span className="t-sm w-[84px] shrink-0 font-medium text-ink">{verdict}</span>
    </div>
  );
}

const dashed = '0.5px dashed var(--hairline)';
const rule = '0.5px solid var(--hairline-2)';

// ── DE.AG.01 · agent loop ───────────────────────────────────────────────────
const STAGES = ['Plan', 'Act', 'Observe', 'Reflect'];
const STAGE_MS = [900, 1600, 700, 800];
const PLAN = [
  { verb: 'Read', target: 'ci/flaky.test.ts' },
  { verb: 'Run', target: 'the test 10 times' },
  { verb: 'Patch', target: 'src/retry.ts' },
];
const STDOUT = ['run 1  pass  1.4s', 'run 2  fail  timeout 2000ms', 'run 3  pass  1.6s', 'run 4  fail  timeout 2000ms', 'run 5  pass  1.3s'];

export function AgentLoopSpecimen() {
  const { t } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'one' | 'four'>('four');
  const [stage, setStage] = useState(-1);
  const [waiting, setWaiting] = useState(false);
  const [lines, setLines] = useState(0);
  const [skip, setSkip] = useState<Set<number>>(new Set());
  const [seams, setSeams] = useState(0);
  const [edits, setEdits] = useState(0);
  const [startAt, setStartAt] = useState(0);
  const [endAt, setEndAt] = useState<number | null>(null);
  const now = useNow(mode === 'one' && stage >= 0 && stage < 4);

  const enter = (i: number, m: 'one' | 'four') => {
    if (i > 3) { setStage(4); setWaiting(false); setEndAt(performance.now()); return; }
    setStage(i);
    setWaiting(false);
    if (i === 1) STDOUT.forEach((_, k) => after(((k + 1) * STAGE_MS[1]) / (STDOUT.length + 1), () => setLines(k + 1)));
    after(STAGE_MS[i], () => (m === 'one' || i === 1 ? enter(i + 1, m) : setWaiting(true)));
  };
  const reset = (m: 'one' | 'four') => {
    clear(); setMode(m); setStage(-1); setWaiting(false); setLines(0); setSkip(new Set()); setSeams(0); setEdits(0); setEndAt(null);
  };
  const run = () => { reset(mode); setStartAt(performance.now()); enter(0, mode); };
  const cross = (edit = false) => { if (edit) setEdits((e) => e + 1); setSeams((s) => s + 1); enter(stage + 1, mode); };
  const toggle = (i: number) => {
    setEdits((e) => e + 1);
    setSkip((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const opaque = Math.max(0, ((endAt ?? now) - startAt) / 1000).toFixed(1);
  const you = <span className="text-ink">{seams + edits}</span>;
  let readout: React.ReactNode = 'Press Run';
  if (stage >= 0 && mode === 'one') readout = <>visible states 1 · opaque for <span className="text-ink">{opaque}s</span> · decisions offered 0</>;
  if (stage >= 0 && mode === 'four')
    readout = stage === 4
      ? <>stages seen 4/4 · seams crossed {seams}/3 · your decisions {you}</>
      : <>stage {stage + 1}/4 {STAGES[stage].toLowerCase()} · seams crossed {seams}/3 · your decisions {you}</>;

  const working = (label: string) => (
    <div className="flex flex-1 items-center justify-center gap-2 t-sm text-ink-3">
      <Loader2 size={14} className="animate-spin" /> {label}
    </div>
  );

  let body: React.ReactNode;
  if (stage === -1) body = <div className="flex flex-1 items-center justify-center t-sm text-ink-3">Task: fix the flaky CI test</div>;
  else if (mode === 'one') {
    body = stage < 4
      ? <div className="flex flex-1 flex-col items-center justify-center gap-2 t-sm text-ink-3"><Loader2 size={18} className="animate-spin" />Thinking… <Meta>{opaque}s</Meta></div>
      : <div className="flex flex-1 items-center justify-center gap-2 t-sm text-ink"><Check size={14} style={{ color: 'var(--pattern)' }} /> Done. Fixed the flaky test.</div>;
  } else if (stage === 0) {
    body = !waiting ? working('Drafting plan…') : (
      <>
        <Meta>plan v1 · click a step to skip it</Meta>
        {PLAN.map((p, i) => (
          <button key={p.verb} onClick={() => toggle(i)} className="flex items-center gap-2 rounded-[var(--r-sm)] px-1.5 py-1 text-left t-sm hover:bg-[var(--surface-2)]">
            <Meta>{i + 1}</Meta>
            <span className="font-medium" style={{ color: skip.has(i) ? 'var(--ink-4)' : 'var(--ink)', textDecoration: skip.has(i) ? 'line-through' : undefined }}>{p.verb}</span>
            <span className="t-mono t-caption text-ink-3" style={{ letterSpacing: 0, textDecoration: skip.has(i) ? 'line-through' : undefined }}>{p.target}</span>
          </button>
        ))}
        <div className="mt-auto flex justify-end"><Btn primary onClick={() => cross()}><Play size={12} /> Start run</Btn></div>
      </>
    );
  } else if (stage === 1) {
    body = (
      <Code>
        <span className="text-ink">run_tests({'{'} file: "ci/flaky.test.ts", runs: 10 {'}'})</span>
        {STDOUT.slice(0, lines).map((l) => (
          <span key={l} style={{ color: l.includes('fail') ? 'var(--anti)' : 'var(--ink-3)' }}>{l}</span>
        ))}
      </Code>
    );
  } else if (stage === 2) {
    body = !waiting ? working('Reading output…') : (
      <>
        <Meta>observation</Meta>
        <div className="t-sm py-1 pl-2.5 text-ink-3" style={{ borderLeft: '2px solid var(--hairline)' }}>
          Runs fail only on a 2000ms timeout. The assertion itself passes, so retry.ts is not the cause.
        </div>
        <div className="mt-auto flex justify-end gap-2">
          <Btn onClick={() => cross(true)}>Correct this</Btn>
          <Btn primary onClick={() => cross()}>Accept</Btn>
        </div>
      </>
    );
  } else if (stage === 3) {
    body = !waiting ? working('Checking stop condition…') : (
      <>
        <Meta>plan v1 → v2 · stop when 10/10 pass</Meta>
        <div className="t-caption t-mono flex flex-col gap-0.5" style={{ letterSpacing: 0 }}>
          {PLAN.slice(0, 2).map((p, i) => (
            <span key={p.verb} className="text-ink-3">{'  '}{p.verb} {p.target}{skip.has(i) ? ' (skipped by you)' : ''}</span>
          ))}
          <span style={{ color: 'var(--anti)' }}>- Patch src/retry.ts</span>
          <span style={{ color: 'var(--pattern)' }}>+ Raise timeout in flaky.test.ts to 5000ms</span>
        </div>
        <div className="mt-auto flex justify-end"><Btn primary onClick={() => cross()}>Approve v2</Btn></div>
      </>
    );
  } else {
    body = <div className="flex flex-1 items-center justify-center gap-2 t-sm text-ink"><Check size={14} style={{ color: 'var(--pattern)' }} /> Done. 10/10 runs pass on plan v2.</div>;
  }

  return (
    <Specimen
      height={320}
      readout={readout}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'one', label: 'One spinner' }, { value: 'four', label: 'Four stages' }]} />
          <Replay onClick={run} label={stage === -1 ? 'Run' : 'Run again'} icon={<Play size={13} />} />
        </Controls>
      }
    >
      <Window width={440} height={244}>
        {mode === 'four' && (
          <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: rule }}>
            {STAGES.map((s, i) => (
              <Fragment key={s}>
                {i > 0 && <span className="h-px flex-1" style={{ background: 'var(--hairline)' }} />}
                <span
                  className="t-caption flex items-center gap-1 rounded-[var(--r-pill)] px-2 py-0.5 font-medium"
                  style={{
                    letterSpacing: 0,
                    background: i === stage ? 'var(--surface-2)' : undefined,
                    color: i === stage ? 'var(--ink)' : i < stage ? 'var(--ink-3)' : 'var(--ink-4)',
                  }}
                >
                  {i < stage && <Check size={11} />}
                  {s}
                  {i === stage && waiting && <span className="size-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
                </span>
              </Fragment>
            ))}
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode === 'one' ? `one-${stage === 4 ? 'done' : stage < 0 ? 'idle' : 'run'}` : `four-${stage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={t(0.15)}
            className="flex min-h-0 flex-1 flex-col gap-1.5 p-3"
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </Window>
    </Specimen>
  );
}

// ── DE.AG.02 · action schema ────────────────────────────────────────────────
type SchemaField = { key: string; type: 'string' | 'EmailAddress' | 'FileRef'; value: string };
type Schema = { name: string; destructive?: boolean; scope?: string; fields: SchemaField[] };
const SCHEMAS: Record<'untyped' | 'typed', Schema> = {
  untyped: {
    name: 'run_task',
    fields: [{ key: 'args', type: 'string', value: '{"to":"board@company.com","subject":"Q3 numbers revised","file":"report-q3-v7.pdf"}' }],
  },
  typed: {
    name: 'send_email',
    destructive: true,
    scope: 'write.email',
    fields: [
      { key: 'to', type: 'EmailAddress', value: 'board@company.com' },
      { key: 'subject', type: 'string', value: 'Q3 numbers revised' },
      { key: 'attachment', type: 'FileRef', value: 'report-q3-v7.pdf · 2.1 MB' },
    ],
  },
};
const FACTS = ['to', 'subject', 'attachment'];

export function ActionSchemaSpecimen() {
  const [mode, setMode] = useState<'untyped' | 'typed'>('untyped');
  const [hover, setHover] = useState<string | null>(null);
  const [answer, setAnswer] = useState<'approved' | 'denied' | null>(null);
  const s = SCHEMAS[mode];
  const legible = FACTS.filter((f) => s.fields.some((x) => x.key === f)).length;
  const to = s.fields.find((f) => f.type === 'EmailAddress')?.value;
  const schemaLines = [
    ...(s.destructive !== undefined ? [{ k: 'destructive', v: String(s.destructive) }] : []),
    ...(s.scope ? [{ k: 'scope', v: `"${s.scope}"` }] : []),
    ...s.fields.map((f) => ({ k: f.key, v: f.type })),
  ];
  const rows = s.fields.length + (s.destructive ? 1 : 0);
  const hl = (k: string) => ({ background: hover === k ? 'var(--surface-2)' : undefined, outline: hover === k ? '0.5px solid var(--accent)' : undefined });
  const link = (k: string) => ({ onMouseEnter: () => setHover(k), onMouseLeave: () => setHover(null) });

  return (
    <Specimen
      height={320}
      readout={
        <>
          prompt rows from schema {rows} · facts readable <span className="text-ink">{legible}/3</span> · destructive flag {s.destructive ? 'set' : 'absent'}
          {answer && <> · {answer}</>}
        </>
      }
      controls={
        <Segmented
          value={mode}
          onChange={(m) => { setMode(m); setAnswer(null); setHover(null); }}
          options={[{ value: 'untyped', label: 'Untyped schema' }, { value: 'typed', label: 'Typed schema' }]}
        />
      }
    >
      <Window width={480} height={240}>
        <div className="flex min-h-0 flex-1">
          <div className="t-caption t-mono flex w-[178px] shrink-0 flex-col gap-0.5 p-3 text-ink-3" style={{ borderRight: rule, letterSpacing: 0 }}>
            <span className="pb-1 text-ink-4">tool schema</span>
            <span className="text-ink">{s.name}({'{'}</span>
            {schemaLines.map((l) => (
              <span key={l.k} {...link(l.k)} className="cursor-default rounded-[3px] px-1" style={hl(l.k)}>
                {l.k}: <span className="text-ink-2">{l.v}</span>
              </span>
            ))}
            <span className="text-ink">{'})'}</span>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center p-3" style={{ background: 'var(--surface-2)' }}>
            <div className="flex w-full flex-col gap-2 rounded-[var(--r-md)] p-3" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}>
              <div className="t-sm font-medium text-ink">Allow the agent to {s.name.replace(/_/g, ' ')}?</div>
              {s.destructive && (
                <div {...link('destructive')} className="t-caption flex items-center gap-1.5 rounded-[3px] px-1" style={{ ...hl('destructive'), color: 'var(--anti)', letterSpacing: 0 }}>
                  <Dot tone="bad" /> Cannot be undone · {s.scope}
                </div>
              )}
              {s.fields.map((f) => (
                <div key={f.key} {...link(f.key)} className="flex min-w-0 items-center gap-2 rounded-[3px] px-1" style={hl(f.key)}>
                  <span className="t-caption w-[58px] shrink-0 text-ink-4" style={{ letterSpacing: 0 }}>{f.key}</span>
                  {f.key === 'args' ? (
                    <span className="t-caption t-mono line-clamp-2 break-all text-ink-3" style={{ letterSpacing: 0 }}>{f.value}</span>
                  ) : f.type === 'string' ? (
                    <span className="t-sm truncate text-ink">{f.value}</span>
                  ) : (
                    <span className="t-sm inline-flex min-w-0 items-center gap-1 rounded-[var(--r-pill)] px-2 py-0.5 text-ink" style={{ background: 'var(--surface-2)' }}>
                      {f.type === 'EmailAddress' ? <Mail size={12} /> : <FileText size={12} />}
                      <span className="truncate">{f.value}</span>
                    </span>
                  )}
                </div>
              ))}
              <div className="mt-1 flex items-center justify-end gap-2">
                {answer ? (
                  <span className="t-sm text-ink-3">{answer === 'approved' ? `${s.name} called` : 'Nothing ran'} · <button className="underline" onClick={() => setAnswer(null)}>ask again</button></span>
                ) : (
                  <>
                    <Btn onClick={() => setAnswer('denied')}>Deny</Btn>
                    <Btn primary onClick={() => setAnswer('approved')}>{to ? `Send to ${to.split('@')[0]}@…` : 'Approve'}</Btn>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AG.03 · trace UI ─────────────────────────────────────────────────────
type Span = { id: string; name: string; depth: number; start: number; dur: number; input: string; output: string; evals?: { name: string; score: number }[] };
const RUN_S = 47.3;
const EVAL_MIN = 0.7;
const SPANS: Span[] = [
  { id: 'root', name: 'answer_question', depth: 0, start: 0, dur: 47.3, input: '"Why was I charged twice in March?"', output: '"You were charged once. The second line is a pending hold."' },
  { id: 'intent', name: 'classify_intent', depth: 1, start: 0, dur: 0.4, input: '"Why was I charged twice in March?"', output: '{ "intent": "billing" }' },
  { id: 'ret', name: 'retrieve', depth: 1, start: 0.4, dur: 41.1, input: '{ "query": "double charge march", "k": 8 }', output: '8 chunks, top score 0.71' },
  { id: 'vs1', name: 'vector_search #1', depth: 2, start: 0.4, dur: 13.2, input: 'index: invoices', output: '3 chunks' },
  { id: 'vs2', name: 'vector_search #2', depth: 2, start: 13.6, dur: 14.1, input: 'index: help_center', output: '3 chunks' },
  { id: 'vs3', name: 'vector_search #3', depth: 2, start: 27.7, dur: 13.8, input: 'index: tickets', output: '2 chunks' },
  { id: 'gen', name: 'generate', depth: 1, start: 41.5, dur: 5.8, input: 'system + 8 chunks + question', output: '"You were charged once…"', evals: [{ name: 'relevance', score: 0.62 }, { name: 'faithfulness', score: 0.94 }] },
];
const pctOfRun = (d: number) => Math.round((d / RUN_S) * 100);
const SLOWEST = SPANS.filter((s) => s.depth === 1).reduce((a, b) => (b.dur > a.dur ? b : a));
const SEARCHES = SPANS.filter((s) => s.depth === 2);
const SEQUENTIAL = SEARCHES.every((k, i) => i === 0 || k.start >= SEARCHES[i - 1].start + SEARCHES[i - 1].dur - 0.001);
const FAILING = SPANS.flatMap((s) => (s.evals ?? []).filter((e) => e.score < EVAL_MIN));

export function TraceSpecimen() {
  const [mode, setMode] = useState<'summary' | 'trace'>('summary');
  const [sel, setSel] = useState<string | null>(null);
  const span = SPANS.find((s) => s.id === sel);

  const readout =
    mode === 'summary' ? (
      <>where the {RUN_S}s went: not recorded · failing evals: not shown</>
    ) : span ? (
      <>
        {span.name} · {span.dur}s · <span className="text-ink">{pctOfRun(span.dur)}% of run</span>
        {span.evals?.map((e) => <Fragment key={e.name}> · {e.name} {e.score.toFixed(2)}</Fragment>)}
      </>
    ) : (
      <>
        slowest: <span className="text-ink">{SLOWEST.name} {SLOWEST.dur}s ({pctOfRun(SLOWEST.dur)}%)</span> · {SEARCHES.length} searches {SEQUENTIAL ? 'in sequence' : 'in parallel'} · {FAILING[0].name} {FAILING[0].score} &lt; {EVAL_MIN}
      </>
    );

  return (
    <Specimen
      height={320}
      readout={readout}
      controls={
        <Segmented
          value={mode}
          onChange={(m) => { setMode(m); setSel(null); }}
          options={[{ value: 'summary', label: 'Run summary' }, { value: 'trace', label: 'Span trace' }]}
        />
      }
    >
      <Window width={470} height={244}>
        {mode === 'summary' ? (
          <div className="flex flex-1 flex-col gap-2.5 p-4">
            <div className="flex items-center gap-2 t-sm font-medium text-ink"><Dot tone="good" /> Run completed</div>
            {[['duration', `${RUN_S}s`], ['tokens', '12,842'], ['steps', '7']].map(([k, v]) => (
              <div key={k} className="flex justify-between t-sm"><span className="text-ink-3">{k}</span><span className="t-mono text-ink">{v}</span></div>
            ))}
            <div className="t-sm mt-1 py-1 pl-2.5 text-ink-3" style={{ borderLeft: '2px solid var(--hairline)' }}>
              "You were charged once. The second line is a pending hold."
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col py-1">
              {SPANS.map((s) => {
                const on = sel === s.id;
                const bad = s.evals?.some((e) => e.score < EVAL_MIN);
                return (
                  <button key={s.id} onClick={() => setSel(on ? null : s.id)} className="flex h-[22px] items-center gap-2 px-3 text-left hover:bg-[var(--surface-2)]" style={{ background: on ? 'var(--surface-2)' : undefined }}>
                    <span className="t-caption t-mono flex w-[132px] shrink-0 items-center gap-1 truncate" style={{ paddingLeft: s.depth * 10, letterSpacing: 0, color: on ? 'var(--ink)' : 'var(--ink-2)' }}>
                      {s.name} {bad && <Dot tone="bad" />}
                    </span>
                    <span className="relative h-2 flex-1">
                      <span
                        className="absolute inset-y-0 rounded-[2px]"
                        style={{ left: `${(s.start / RUN_S) * 100}%`, width: `${Math.max((s.dur / RUN_S) * 100, 1)}%`, background: on ? 'var(--accent)' : 'var(--ink-4)', opacity: on ? 1 : 0.6 }}
                      />
                    </span>
                    <Meta>{s.dur.toFixed(1)}s</Meta>
                  </button>
                );
              })}
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2 p-2.5" style={{ borderTop: rule }}>
              {span ? (
                <>
                  <div className="min-w-0"><Meta>input</Meta><div className="t-caption t-mono mt-0.5 line-clamp-2 text-ink-2" style={{ letterSpacing: 0 }}>{span.input}</div></div>
                  <div className="min-w-0"><Meta>output</Meta><div className="t-caption t-mono mt-0.5 line-clamp-2 text-ink-2" style={{ letterSpacing: 0 }}>{span.output}</div></div>
                </>
              ) : (
                <div className="col-span-2 t-sm text-ink-4">Click a span to see what went in and what came out</div>
              )}
            </div>
          </div>
        )}
      </Window>
    </Specimen>
  );
}

// ── DE.AG.04 · interrupt design ─────────────────────────────────────────────
const JOB = [
  { tool: 'read_file', arg: 'q3-notes.md', kind: 'read' },
  { tool: 'write_file', arg: 'report.md', kind: 'file' },
  { tool: 'write_file', arg: 'summary.md', kind: 'file' },
  { tool: 'send_email', arg: 'board@company.com', kind: 'email' },
  { tool: 'write_file', arg: 'changelog.md', kind: 'file' },
] as const;
type StepState = 'todo' | 'run' | 'done' | 'cancelled' | 'reverted';
type JobStatus = 'idle' | 'running' | 'pausing' | 'paused' | 'cancelled' | 'halted' | 'done';
const STEP_MS = 1100;

export function InterruptSpecimen() {
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'stop' | 'split'>('stop');
  const [steps, setSteps] = useState<StepState[]>(JOB.map(() => 'todo'));
  const [status, setStatus] = useState<JobStatus>('idle');
  const [presses, setPresses] = useState(0);
  const req = useRef<'none' | 'halt' | 'pause'>('none');
  const cur = useRef(-1);
  const next = useRef(0);

  const mark = (i: number, s: StepState) => setSteps((p) => p.map((x, j) => (j === i ? s : x)));
  const step = (i: number) => {
    if (i >= JOB.length) { cur.current = -1; setStatus('done'); return; }
    cur.current = i;
    mark(i, 'run');
    after(STEP_MS, () => {
      mark(i, 'done');
      if (req.current === 'halt') { cur.current = -1; setStatus('halted'); return; }
      if (req.current === 'pause') { cur.current = -1; next.current = i + 1; setStatus(i + 1 >= JOB.length ? 'done' : 'paused'); return; }
      step(i + 1);
    });
  };
  const reset = (m: 'stop' | 'split') => {
    clear(); setMode(m); setSteps(JOB.map(() => 'todo')); setStatus('idle'); setPresses(0); req.current = 'none'; cur.current = -1; next.current = 0;
  };
  const run = () => { reset(mode); setStatus('running'); step(0); };
  const stop = () => { setPresses((p) => p + 1); if (status === 'running') req.current = 'halt'; };
  const cancel = () => { clear(); if (cur.current >= 0) mark(cur.current, 'cancelled'); cur.current = -1; setStatus('cancelled'); };
  const pause = () => { req.current = 'pause'; setStatus('pausing'); };
  const resume = () => { req.current = 'none'; setStatus('running'); step(next.current); };
  const revert = () => setSteps((p) => p.map((x, i) => (x === 'done' && JOB[i].kind === 'file' ? 'reverted' : x)));

  const written = steps.filter((s, i) => s === 'done' && JOB[i].kind === 'file').length;
  const reverted = steps.filter((s) => s === 'reverted').length;
  const emails = steps.filter((s, i) => s === 'done' && JOB[i].kind === 'email').length;
  const at = steps.filter((s) => s !== 'todo').length;
  const settled = status === 'paused' || status === 'cancelled' || status === 'done';

  const note =
    status === 'pausing' ? 'Pausing after this step…'
      : status === 'paused' ? `Paused before ${JOB[next.current].tool}`
        : status === 'cancelled' ? 'Cancelled. Nothing after this ran.'
          : status === 'done' ? (reverted ? `Reverted ${reverted} files. The email stays sent.` : 'Finished')
            : '';

  return (
    <Specimen
      height={320}
      readout={
        status === 'idle' ? 'Press Run, then interrupt it mid-run' : (
          <>
            step {at}/{JOB.length} · files written {written} · reverted {reverted} · emails sent <span className={emails ? 'text-[var(--anti)]' : 'text-ink'}>{emails}</span>
            {mode === 'stop' ? <> · Stop pressed {presses}×, acknowledged: no</> : <> · state: {status}</>}
          </>
        )
      }
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'stop', label: 'One Stop button' }, { value: 'split', label: 'Cancel · Pause · Revert' }]} />
          <Replay onClick={run} label="Run" icon={<Play size={13} />} />
        </Controls>
      }
    >
      <Window width={420} height={248}>
        <div className="flex min-h-0 flex-1 flex-col py-1">
          {JOB.map((j, i) => {
            const s = steps[i];
            return (
              <div key={i} className="flex h-[30px] items-center gap-2.5 px-3 t-sm" style={{ borderBottom: rule }}>
                <span className="flex w-4 justify-center">
                  {s === 'run' ? <Loader2 size={13} className="animate-spin text-ink-3" />
                    : s === 'done' ? <Check size={13} style={{ color: 'var(--pattern)' }} />
                      : s === 'cancelled' ? <X size={13} style={{ color: 'var(--anti)' }} />
                        : s === 'reverted' ? <Undo2 size={13} className="text-ink-3" />
                          : <span className="size-1.5 rounded-full" style={{ background: 'var(--hairline)' }} />}
                </span>
                <span className="t-mono t-caption" style={{ letterSpacing: 0, color: s === 'todo' ? 'var(--ink-4)' : 'var(--ink)', textDecoration: s === 'reverted' || s === 'cancelled' ? 'line-through' : undefined }}>
                  {j.tool}
                </span>
                <span className="truncate text-ink-3">{j.arg}</span>
                {mode === 'split' && j.kind === 'email' && <span className="ml-auto"><Meta>no undo</Meta></span>}
              </div>
            );
          })}
        </div>
        <div className="flex h-[44px] items-center justify-end gap-2 px-3" style={{ borderTop: rule }}>
          {mode === 'stop' ? (
            status !== 'idle' && <Btn onClick={stop}><Square size={11} /> Stop</Btn>
          ) : (
            <>
              <span className="t-sm mr-auto truncate text-ink-3">{note}</span>
              {status === 'running' && <><Btn danger onClick={cancel}><X size={12} /> Cancel</Btn><Btn onClick={pause}><Pause size={12} /> Pause</Btn></>}
              {status === 'pausing' && <Btn disabled><Loader2 size={12} className="animate-spin" /> Pausing</Btn>}
              {settled && written > 0 && <Btn onClick={revert}><Undo2 size={12} /> Revert {written} file {written === 1 ? 'change' : 'changes'}</Btn>}
              {status === 'paused' && <Btn primary onClick={resume}><Play size={12} /> Resume</Btn>}
            </>
          )}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AG.05 · handoff attribution ──────────────────────────────────────────
type AgentKey = 'R' | 'S' | 'E';
const AGENTS: Record<AgentKey, { name: string; bg: string; fg: string }> = {
  R: { name: 'Researcher', bg: 'var(--ink)', fg: 'var(--bg)' },
  S: { name: 'SQL agent', bg: 'var(--accent)', fg: 'var(--bg)' },
  E: { name: 'Editor', bg: 'var(--surface-2)', fg: 'var(--ink)' },
};
const TRANSCRIPT: { a: AgentKey; text: string; handoff?: { to: AgentKey; reason: string; payload: string } }[] = [
  { a: 'R', text: 'Pulled churn mentions from 14 support tickets.' },
  { a: 'R', text: 'Plan-level numbers need the warehouse, passing this on.', handoff: { to: 'S', reason: 'needs SQL access', payload: '14 ticket ids, plan filter' } },
  { a: 'S', text: 'Ran churn_by_plan for Q2 and Q3.' },
  { a: 'S', text: 'Pro churn rose from 2.9% to 4.1%. Team held at 2.3%.', handoff: { to: 'E', reason: 'numbers ready for the deck', payload: 'churn table, 2 rows' } },
  { a: 'E', text: 'Drafted the board summary around the Pro increase.' },
  { a: 'E', text: 'Cut the Team row, it did not move.' },
];
const HANDOFFS = TRANSCRIPT.filter((l) => l.handoff).length;

function Avatar({ k, size = 18 }: { k: AgentKey; size?: number }) {
  return (
    <span
      className="t-caption inline-flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{ width: size, height: size, background: AGENTS[k].bg, color: AGENTS[k].fg, border: '0.5px solid var(--hairline)', letterSpacing: 0 }}
    >
      {k}
    </span>
  );
}

export function HandoffSpecimen() {
  const [mode, setMode] = useState<'off' | 'on'>('off');
  const [sel, setSel] = useState<number | null>(null);
  const on = mode === 'on';

  let origin = 'started the run';
  if (sel !== null) {
    let n = 0;
    TRANSCRIPT.slice(0, sel).forEach((l) => {
      if (!l.handoff) return;
      n += 1;
      if (l.handoff.to === TRANSCRIPT[sel].a) origin = `took over at handoff ${n} (${l.handoff.reason})`;
    });
  }
  const readout =
    sel === null
      ? <>Click any sentence · lines attributable {on ? TRANSCRIPT.length : 0}/{TRANSCRIPT.length} · handoffs visible {on ? HANDOFFS : 0}/{HANDOFFS}</>
      : on
        ? <>who: <span className="text-ink">{AGENTS[TRANSCRIPT[sel].a].name}</span> · {origin}</>
        : <>who: <span className="text-[var(--anti)]">unknown</span> · handoffs visible 0/{HANDOFFS} · lines attributable 0/{TRANSCRIPT.length}</>;

  return (
    <Specimen
      height={330}
      readout={readout}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setSel(null); }} options={[{ value: 'off', label: 'Attribution off' }, { value: 'on', label: 'Attribution on' }]} />}
    >
      <Window width={440} height={262}>
        {on && (
          <div className="t-caption flex items-center gap-2 px-3 py-2 text-ink-3" style={{ borderBottom: rule, letterSpacing: 0 }}>
            <span className="text-ink-4">coordinator</span>
            {(['R', 'S', 'E'] as AgentKey[]).map((k, i) => (
              <Fragment key={k}>
                {i > 0 && <ChevronRight size={11} className="text-ink-4" />}
                <span className="flex items-center gap-1"><Avatar k={k} size={14} />{['tickets', 'numbers', 'summary'][i]}</span>
              </Fragment>
            ))}
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {TRANSCRIPT.map((l, i) => {
            const first = i === 0 || TRANSCRIPT[i - 1].a !== l.a;
            return (
              <Fragment key={i}>
                {on && first && <div className="t-caption flex items-center gap-1.5 px-1.5 pt-1 text-ink-3" style={{ letterSpacing: 0 }}><Avatar k={l.a} size={14} />{AGENTS[l.a].name}</div>}
                <button
                  onClick={() => setSel(sel === i ? null : i)}
                  className="t-sm rounded-[var(--r-sm)] px-1.5 py-0.5 text-left text-ink transition-colors hover:bg-[var(--surface-2)]"
                  style={{ background: sel === i ? 'var(--surface-2)' : undefined, paddingLeft: on ? 26 : undefined }}
                >
                  {l.text}
                </button>
                {on && l.handoff && (
                  <div className="t-caption mx-1.5 my-1 flex items-center gap-1.5 rounded-[var(--r-sm)] px-2 py-1 text-ink-3" style={{ border: dashed, letterSpacing: 0 }}>
                    <Avatar k={l.a} size={14} /><ChevronRight size={11} /><Avatar k={l.handoff.to} size={14} />
                    <span className="text-ink-2">{l.handoff.reason}</span>
                    <span className="t-mono ml-auto truncate text-ink-4">{l.handoff.payload}</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AG.06 · Dia omnibox ──────────────────────────────────────────────────
type Route = 'go' | 'search' | 'ask';
const TAB_URL = 'acme.com/pricing';
const TRIES = ['figma.com', 'best gpu for local llms', 'summarize this page', 'is Pro cheaper yearly?'];
const ROUTES: { value: Route; label: string }[] = [{ value: 'go', label: 'Go' }, { value: 'search', label: 'Search' }, { value: 'ask', label: 'Ask' }];

function intentOf(q: string): Route {
  const s = q.trim();
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) return 'go';
  if (/\?$/.test(s) || /^(what|why|how|is|are|can|does|summarize|explain|compare)\b/i.test(s) || /\bthis (page|tab)\b/i.test(s)) return 'ask';
  return 'search';
}
function askAnswer(q: string) {
  if (/summar/i.test(q)) return 'Three plans: Free, Pro at $16 a seat, Team at $28. Yearly billing saves two months.';
  if (/year|annual/i.test(q)) return 'Yes. Pro is $16 a month or $160 a year, so about two months free.';
  return 'From this tab: Pro is $16 a seat, Team is $28, Free covers 3 projects.';
}

export function OmniboxSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'manual' | 'inferred'>('manual');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Route>('search');
  const [res, setRes] = useState<{ q: string; routed: Route; intent: Route } | null>(null);
  const [stats, setStats] = useState({ n: 0, mis: 0, switches: 0 });

  const reset = (m: 'manual' | 'inferred') => { setMode(m); setQ(''); setRes(null); setPicked('search'); setStats({ n: 0, mis: 0, switches: 0 }); };
  const submit = (text: string) => {
    if (!text.trim()) return;
    const intent = intentOf(text);
    const routed = mode === 'manual' ? picked : intent;
    setQ(text);
    setRes({ q: text.trim(), routed, intent });
    setStats((s) => ({ ...s, n: s.n + 1, mis: s.mis + (routed !== intent ? 1 : 0) }));
  };
  const pick = (r: Route) => { if (r !== picked) setStats((s) => ({ ...s, switches: s.switches + 1 })); setPicked(r); };

  const url = !res ? TAB_URL : res.routed === 'go' ? res.q : res.routed === 'search' ? `search?q=${encodeURIComponent(res.q)}` : TAB_URL;

  return (
    <Specimen
      height={340}
      readout={
        res ? (
          <>
            intent {res.intent} · routed <span className={res.routed !== res.intent ? 'text-[var(--anti)]' : 'text-ink'}>{res.routed}</span> · misroutes {stats.mis}/{stats.n} · mode switches {stats.switches}
            {res.routed === 'ask' && <> · tab context 1</>}
          </>
        ) : 'Type in the bar, or try one below'
      }
      controls={<Segmented value={mode} onChange={reset} options={[{ value: 'manual', label: 'Mode picked by user' }, { value: 'inferred', label: 'Mode inferred by shell' }]} />}
    >
      <div className="flex w-full flex-col items-center gap-2.5">
        <Window width={440} height={226} url={url}>
          <form className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: rule }} onSubmit={(e) => { e.preventDefault(); submit(q); }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={mode === 'manual' ? `${ROUTES.find((r) => r.value === picked)?.label}…` : 'Search, go to a URL, or ask about this tab'}
              className="t-sm min-w-0 flex-1 rounded-[var(--r-sm)] px-2 py-1 text-ink outline-none"
              style={{ background: 'var(--surface-2)' }}
            />
            {mode === 'manual' && (
              <div className="flex rounded-[var(--r-pill)] p-[2px]" style={{ background: 'var(--surface-2)' }}>
                {ROUTES.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => pick(r.value)}
                    className="t-caption rounded-[var(--r-pill)] px-2 py-0.5 font-medium"
                    style={{ letterSpacing: 0, background: picked === r.value ? 'var(--surface)' : undefined, color: picked === r.value ? 'var(--ink)' : 'var(--ink-3)', boxShadow: picked === r.value ? 'var(--shadow-card)' : undefined }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </form>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={res ? `${res.q}-${res.routed}` : 'tab'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t(0.15)} className="flex min-h-0 flex-1 flex-col gap-2 p-3">
              {!res || res.routed === 'go' ? (
                <>
                  <div className="t-sm font-medium text-ink">{res ? res.q : 'Pricing'}</div>
                  <Bar w="80%" /><Bar w="64%" /><Bar w="72%" />
                </>
              ) : res.routed === 'search' ? (
                [0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="t-sm truncate text-ink">{i === 0 ? `“${res.q}”` : `${res.q} · result ${i + 1}`}</span>
                    <Bar w={`${70 - i * 12}%`} />
                  </div>
                ))
              ) : (
                <>
                  <span className="t-caption inline-flex w-fit items-center gap-1 rounded-[var(--r-pill)] px-2 py-0.5 text-ink-3" style={{ border: rule, letterSpacing: 0 }}>
                    <FileText size={11} /> Using tab: {TAB_URL}
                  </span>
                  <div className="t-sm text-ink">{askAnswer(res.q)}</div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Window>
        <div className="flex flex-wrap justify-center gap-1.5">
          {TRIES.map((s) => (
            <button key={s} onClick={() => submit(s)} className="t-caption t-mono rounded-[var(--r-pill)] px-2 py-0.5 text-ink-3 hover:text-ink" style={{ border: rule, letterSpacing: 0 }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.AI.01 · non-determinism ──────────────────────────────────────────────
const ND_PROMPT = 'Is the EU 2035 combustion car ban final?';
const ND_ANSWERS = [
  { src: ['europarl', 'reuters', 'bloomberg'], text: 'Yes. The 2035 ban passed in 2023, with a review clause for e-fuels.' },
  { src: ['reuters', 'bloomberg', 'europarl'], text: 'Mostly. The ban is law, but a 2026 review could carve out e-fuels.' },
  { src: ['reuters', 'europarl', 'bloomberg'], text: 'Yes, it is law, though carmakers are lobbying to soften the review.' },
];
const ND_MAX = 6;
const ndWords = (s: string) => s.toLowerCase().replace(/[.,]/g, '').split(' ');
const ndStamp = (i: number) => {
  const s = 41 + i * 17;
  return `16:${String(2 + Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function NonDeterminismSpecimen() {
  const { t } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'overwrite' | 'versions'>('overwrite');
  const [runs, setRuns] = useState<number[]>([0]);
  const [view, setView] = useState(0);
  const [busy, setBusy] = useState(false);

  const reset = (m: 'overwrite' | 'versions') => { clear(); setMode(m); setRuns([0]); setView(0); setBusy(false); };
  const rerun = () => {
    if (busy || runs.length >= ND_MAX) return;
    setBusy(true);
    after(700, () => {
      setRuns((r) => [...r, r.length % ND_ANSWERS.length]);
      setView(-1);
      setBusy(false);
    });
  };

  const shown = mode === 'overwrite' || view < 0 ? runs.length - 1 : view;
  const cur = ND_ANSWERS[runs[shown]];
  const prev = shown > 0 ? ND_ANSWERS[runs[shown - 1]] : null;
  const prevWords = new Set(prev ? ndWords(prev.text) : []);
  const changed = (w: string) => mode === 'versions' && !!prev && !prevWords.has(w.toLowerCase().replace(/[.,]/g, ''));
  const words = cur.text.split(' ');
  const wordsChanged = words.filter(changed).length;
  const moved = prev ? cur.src.filter((s, i) => prev.src[i] !== s).length : 0;
  const distinct = new Set(runs.map((r) => ND_ANSWERS[r].text)).size;

  return (
    <Specimen
      height={320}
      readout={
        mode === 'overwrite'
          ? <>runs {runs.length} · distinct answers {distinct} · changes you can see <span className="text-ink">0</span></>
          : prev
            ? <>v{shown + 1} vs v{shown} · sources moved {moved}/3 · words changed <span className="text-ink">{wordsChanged}</span> · distinct {distinct}/{runs.length}</>
            : <>v1 · runs {runs.length} · distinct answers {distinct}</>
      }
      controls={<Segmented value={mode} onChange={reset} options={[{ value: 'overwrite', label: 'Overwrite' }, { value: 'versions', label: 'Keep versions' }]} />}
    >
      <Window width={440} height={232}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: rule }}>
          <span className="t-sm min-w-0 flex-1 truncate text-ink">{ND_PROMPT}</span>
          <Btn onClick={rerun} disabled={busy || runs.length >= ND_MAX}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Re-run
          </Btn>
        </div>
        {mode === 'versions' && (
          <div className="flex items-center gap-1 px-3 pt-2">
            {runs.map((_, i) => (
              <button
                key={i}
                onClick={() => setView(i)}
                className="t-caption t-mono rounded-[var(--r-pill)] px-2 py-0.5"
                style={{ letterSpacing: 0, background: i === shown ? 'var(--surface-2)' : undefined, color: i === shown ? 'var(--ink)' : 'var(--ink-4)' }}
              >
                v{i + 1}
              </button>
            ))}
            <span className="ml-auto"><Meta>{ndStamp(shown)}</Meta></span>
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${mode}-${shown}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t(0.18)} className="flex flex-col gap-2.5 p-3">
            <p className="t-sm text-ink">
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span style={changed(w) ? { background: 'var(--surface-2)', boxShadow: 'inset 0 -1.5px 0 var(--accent)' } : undefined}>{w}</span>{' '}
                </Fragment>
              ))}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cur.src.map((s, i) => {
                const mv = mode === 'versions' && !!prev && prev.src[i] !== s;
                return (
                  <span key={s} className="t-caption t-mono rounded-[var(--r-pill)] px-2 py-0.5 text-ink-2" style={{ letterSpacing: 0, border: mv ? '0.5px solid var(--accent)' : rule }}>
                    {i + 1}. {s}{mv && prev ? ` (was ${prev.src.indexOf(s) + 1})` : ''}
                  </span>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.02 · TTFT vs TTLB ─────────────────────────────────────────────────
const TTFT_RUNS = [400, 620, 3000];
const TTLB_MS = 4000;
const TT_WORDS = 'Your March invoice shows two lines because the first card attempt was declined and retried. Only the second charge settled, so you paid once.'.split(' ');

export function TtftSpecimen() {
  const { reduce } = useMotion();
  const { after, clear } = useTimers();
  const [mode, setMode] = useState<'buffer' | 'stream'>('buffer');
  const [arrived, setArrived] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle');
  const [hist, setHist] = useState<{ ttft: number; blank: number; ttlb: number }[]>([]);
  const t0 = useRef(0);
  const firstPaint = useRef(0);
  const now = useNow(phase === 'busy', 50);

  const [ft, setFt] = useState(TTFT_RUNS[0]);
  const runNo = hist.length % TTFT_RUNS.length;
  const ttft = phase === 'idle' ? TTFT_RUNS[runNo] : ft;
  const reset = (m: 'buffer' | 'stream') => { clear(); setMode(m); setArrived(0); setPhase('idle'); setHist([]); };
  const send = () => {
    if (phase === 'busy') return;
    clear();
    const ft = TTFT_RUNS[hist.length % TTFT_RUNS.length];
    const m = mode;
    setFt(ft);
    t0.current = performance.now();
    setArrived(0);
    setPhase('busy');
    TT_WORDS.forEach((_, j) => {
      after(ft + (j * (TTLB_MS - ft)) / (TT_WORDS.length - 1), () => {
        setArrived(j + 1);
        const el = performance.now() - t0.current;
        if (j === 0) firstPaint.current = el;
        if (j === TT_WORDS.length - 1) {
          setHist((h) => [...h, { ttft: ft, blank: m === 'stream' ? firstPaint.current : el, ttlb: el }]);
          setPhase('done');
        }
      });
    });
  };

  const visible = mode === 'stream' ? arrived : arrived === TT_WORDS.length ? arrived : 0;
  const elapsed = phase === 'busy' ? Math.max(0, now - t0.current) : phase === 'done' ? TTLB_MS : 0;
  const last = hist[hist.length - 1];

  return (
    <Specimen
      height={320}
      readout={
        phase === 'busy' ? (
          <>{visible ? 'streaming' : 'screen blank'} · {Math.round(elapsed)}ms</>
        ) : last ? (
          <>run {hist.length} · TTFT {last.ttft}ms · TTLB {Math.round(last.ttlb)}ms · blank for <span className={last.blank > 1000 ? 'text-[var(--anti)]' : 'text-ink'}>{Math.round(last.blank)}ms</span></>
        ) : 'Send the same question three times. TTLB is 4.0s every run.'
      }
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'buffer', label: 'Render at last token' }, { value: 'stream', label: 'Render from first token' }]} />
          <Replay onClick={send} label={`Send run ${runNo + 1}/3`} icon={<ArrowUp size={13} />} />
        </Controls>
      }
    >
      <Window width={420} height={232}>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <div className="t-sm self-end rounded-[var(--r-md)] px-3 py-1.5 text-ink" style={{ background: 'var(--surface-2)' }}>Why was I charged twice?</div>
          <div className="t-sm min-h-[66px] text-ink">
            {visible > 0 ? (
              <>
                {TT_WORDS.slice(0, visible).join(' ')}
                {visible < TT_WORDS.length && <motion.span className="ml-0.5 inline-block h-3.5 w-[2px] align-middle" style={{ background: 'var(--ink-3)' }} animate={reduce ? undefined : { opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />}
              </>
            ) : phase === 'busy' ? (
              <span className="flex gap-1 pt-1">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="size-1.5 rounded-full" style={{ background: 'var(--ink-4)' }} animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1 px-3 pb-3">
          <div className="flex justify-between"><Meta>network · TTFT {ttft}ms</Meta><Meta>TTLB {TTLB_MS}ms</Meta></div>
          <div className="relative h-1.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (elapsed / TTLB_MS) * 100)}%`, background: 'var(--ink-4)' }} />
            <div className="absolute -inset-y-1 w-[2px]" style={{ left: `${(ttft / TTLB_MS) * 100}%`, background: 'var(--accent)' }} />
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.03 · streaming shapes ─────────────────────────────────────────────
type Shape = 'tokens' | 'json' | 'tree';
const SS_TEXT = 'Your team used 4,120 agent runs this month, up 18 percent. Seats are at 12 of 15, so the Team plan still fits.'.split(' ');
const SS_JSON = '{"name":"Mira Chen","email":"mira@acme.co","plan":"Team","seats":12}';
const SS_KEYS = ['name', 'email', 'plan', 'seats'];
const SS_CHUNK = 3;
const SS_NODES = ['UsagePanel', 'Header', 'Stat runs', 'Stat seats', 'Chart', 'Footer'];
const SS_BARS = [30, 42, 38, 55, 48, 62, 58, 70, 66, 80, 74, 88];
const SS_SPEC: Record<Shape, { total: number; ms: number }> = {
  tokens: { total: SS_TEXT.length, ms: 110 },
  json: { total: Math.ceil(SS_JSON.length / SS_CHUNK), ms: 90 },
  tree: { total: SS_NODES.length, ms: 420 },
};

function closedField(partial: string, key: string) {
  const m = new RegExp(`"${key}":("([^"]*)"|(\\d+))(?=[,}])`).exec(partial);
  return m ? (m[2] ?? m[3]) : null;
}

export function StreamingShapesSpecimen() {
  const { t, reduce } = useMotion();
  const [shape, setShape] = useState<Shape>('tokens');
  const [run, setRun] = useState(0);
  const spec = SS_SPEC[shape];
  const p = useStream(spec.total, spec.ms, `${shape}-${run}`);

  const partial = SS_JSON.slice(0, Math.min(SS_JSON.length, p * SS_CHUNK));
  const closed = SS_KEYS.map((k) => closedField(partial, k));
  let parses = true;
  try { JSON.parse(partial); } catch { parses = false; }

  const readout =
    shape === 'tokens' ? <>unit: token · {p}/{spec.total} tokens · partial reads as prose: <span className="text-ink">yes</span></>
      : shape === 'json' ? <>unit: closed field · {partial.length}/{SS_JSON.length} bytes · fields {closed.filter(Boolean).length}/4 · JSON.parse(partial): <span className={parses ? 'text-ink' : 'text-[var(--anti)]'}>{parses ? 'ok' : 'throws'}</span></>
        : <>unit: node · mounted {p}/{SS_NODES.length}{p < SS_NODES.length && <> · next {SS_NODES[p]}</>}</>;

  const mount = (i: number, node: React.ReactNode) => (
    <AnimatePresence initial={false}>
      {p > i && <motion.div initial={{ opacity: 0, y: reduce ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} transition={t(0.2)}>{node}</motion.div>}
    </AnimatePresence>
  );

  return (
    <Specimen
      height={320}
      readout={readout}
      controls={
        <Controls>
          <Segmented value={shape} onChange={setShape} options={[{ value: 'tokens', label: 'Token stream' }, { value: 'json', label: 'Partial JSON' }, { value: 'tree', label: 'Component tree' }]} />
          <Replay onClick={() => setRun((r) => r + 1)} />
        </Controls>
      }
    >
      <Window width={400} height={232}>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          {shape === 'tokens' && (
            <p className="t-sm text-ink">
              {SS_TEXT.slice(0, p).join(' ')}
              {p < spec.total && <span className="ml-0.5 inline-block h-3.5 w-[2px] align-middle" style={{ background: 'var(--ink-3)' }} />}
            </p>
          )}
          {shape === 'json' && (
            <>
              {SS_KEYS.map((k, i) => (
                <div key={k} className="flex h-7 items-center gap-3" style={{ borderBottom: rule }}>
                  <span className="t-caption w-12 shrink-0 text-ink-4" style={{ letterSpacing: 0 }}>{k}</span>
                  {closed[i] !== null ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(0.15)} className="t-sm text-ink">{closed[i]}</motion.span>
                  ) : (
                    <motion.span className="h-[10px] w-28 rounded-full" style={{ background: 'var(--surface-2)' }} animate={reduce ? undefined : { opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  )}
                </div>
              ))}
              <div className="t-caption t-mono mt-auto break-all text-ink-4" style={{ letterSpacing: 0 }}>{partial}<span style={{ color: 'var(--accent)' }}>{p < spec.total ? '▍' : ''}</span></div>
            </>
          )}
          {shape === 'tree' &&
            mount(0, (
              <div className="flex flex-col gap-2 rounded-[var(--r-md)] p-2.5" style={{ border: rule }}>
                {mount(1, <div className="flex items-center justify-between"><span className="t-sm font-medium text-ink">Usage · October</span><Meta>Team plan</Meta></div>)}
                <div className="grid grid-cols-2 gap-2">
                  {mount(2, <div className="rounded-[var(--r-sm)] p-2" style={{ background: 'var(--surface-2)' }}><Meta>agent runs</Meta><div className="t-sm t-mono text-ink">4,120</div></div>)}
                  {mount(3, <div className="rounded-[var(--r-sm)] p-2" style={{ background: 'var(--surface-2)' }}><Meta>seats</Meta><div className="t-sm t-mono text-ink">12 / 15</div></div>)}
                </div>
                {mount(4, (
                  <div className="flex h-10 items-end gap-1">
                    {SS_BARS.map((h, i) => <span key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h}%`, background: 'var(--ink-4)' }} />)}
                  </div>
                ))}
                {mount(5, <Meta>updated just now</Meta>)}
              </div>
            ))}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.04 · generative UI ────────────────────────────────────────────────
type GNode = { type: string; children?: GNode[] };
const FLIGHTS = [
  { airline: 'TAP', price: 412, dep: 'Fri 08:15', stops: 'direct' },
  { airline: 'Ryanair', price: 287, dep: 'Fri 14:40', stops: '1 stop' },
  { airline: 'Iberia', price: 355, dep: 'Sat 06:30', stops: 'direct' },
];
const GEN_TREE: GNode = {
  type: 'Stack',
  children: [{ type: 'FlightList', children: FLIGHTS.map(() => ({ type: 'PriceCard' })) }, { type: 'WeatherWidget' }],
};
const GEN_TARGETS: Record<string, number> = { FlightList: 2, PriceCard: 1 };
const walk = (n: GNode): GNode[] => [n, ...(n.children ?? []).flatMap(walk)];
const GEN_NODES = walk(GEN_TREE);
const GEN_TARGET_COUNT = GEN_NODES.reduce((a, n) => a + (GEN_TARGETS[n.type] ?? 0), 0);
const PROSE = 'Here are three options for flights to Lisbon. TAP Air Portugal, Fri 08:15, from $412. Ryanair, Fri 14:40, from $287, one stop. Iberia, Sat 06:30, from $355. Weather looks clear all weekend, 22 to 27 C.';
const depKey = (d: string) => (d.startsWith('Sat') ? 10000 : 0) + Number(d.slice(4).replace(':', ''));

export function GenerativeUiSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'prose' | 'tree'>('prose');
  const [sort, setSort] = useState<'price' | 'time'>('price');
  const [sel, setSel] = useState<string | null>(null);
  const list = [...FLIGHTS].sort((a, b) => (sort === 'price' ? a.price - b.price : depKey(a.dep) - depKey(b.dep)));
  const picked = FLIGHTS.find((f) => f.airline === sel);

  return (
    <Specimen
      height={330}
      readout={
        mode === 'prose'
          ? <>components 0 · interactive targets 0 · {PROSE.length} chars to scan by eye</>
          : <>tree: {GEN_NODES.length} nodes (FlightList, 3 PriceCard, WeatherWidget) · interactive targets <span className="text-ink">{GEN_TARGET_COUNT}</span>{picked && <> · picked {picked.airline} ${picked.price}</>}</>
      }
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setSel(null); setSort('price'); }} options={[{ value: 'prose', label: 'Prose reply' }, { value: 'tree', label: 'Component tree' }]} />}
    >
      <Window width={420} height={258}>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <div className="t-sm self-end rounded-[var(--r-md)] px-3 py-1.5 text-ink" style={{ background: 'var(--surface-2)' }}>flights to Lisbon this weekend</div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t(0.15)} className="flex flex-col gap-2">
              {mode === 'prose' ? (
                <p className="t-sm text-ink-2">{PROSE}</p>
              ) : (
                <>
                  <div className="rounded-[var(--r-md)]" style={{ border: rule }}>
                    <div className="flex items-center justify-between px-2.5 py-1.5" style={{ borderBottom: rule }}>
                      <Meta>FlightList · 3</Meta>
                      <div className="flex gap-1">
                        {(['price', 'time'] as const).map((s) => (
                          <button key={s} onClick={() => setSort(s)} className="t-caption rounded-[var(--r-pill)] px-2 py-0.5" style={{ letterSpacing: 0, background: sort === s ? 'var(--surface-2)' : undefined, color: sort === s ? 'var(--ink)' : 'var(--ink-3)' }}>
                            {s === 'price' ? 'Price' : 'Time'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {list.map((f) => (
                      <motion.button
                        layout
                        transition={t()}
                        key={f.airline}
                        onClick={() => setSel(sel === f.airline ? null : f.airline)}
                        className="flex w-full items-center gap-3 px-2.5 py-1.5 text-left t-sm hover:bg-[var(--surface-2)]"
                        style={{ boxShadow: sel === f.airline ? 'inset 2px 0 0 var(--accent)' : undefined }}
                      >
                        <span className="w-16 font-medium text-ink">{f.airline}</span>
                        <span className="t-mono text-ink-3">{f.dep}</span>
                        <span className="text-ink-4">{f.stops}</span>
                        <span className="t-mono ml-auto text-ink">${f.price}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-[var(--r-md)] px-2.5 py-1.5 t-sm" style={{ border: rule }}>
                    <Sun size={14} className="text-ink-3" />
                    <span className="text-ink">Lisbon</span>
                    <span className="text-ink-3">clear</span>
                    <span className="t-mono ml-auto text-ink-3">22-27 C</span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.05 · grounding spans ──────────────────────────────────────────────
const CLAIMS = [
  {
    text: 'The EU is phasing out new combustion car sales by 2035.',
    src: [
      { host: 'ec.europa.eu', quote: 'all new cars registered from 2035 must be zero-emission' },
      { host: 'reuters.com', quote: 'gave final approval to the 2035 phase-out' },
    ],
  },
  { text: 'Norway hit a 90 percent EV share of new sales last quarter.', src: [{ host: 'ssb.no', quote: 'electric cars made up 90 percent of new registrations' }] },
  {
    text: 'US purchase subsidies were cut in the 2025 bill.',
    src: [
      { host: 'reuters.com', quote: 'the bill ends the federal purchase credit' },
      { host: 'apnews.com', quote: 'the EV credit expires under the new law' },
      { host: 'nytimes.com', quote: 'removes the subsidy for new electric vehicles' },
    ],
  },
];
const ALL_HOSTS = [...new Set(CLAIMS.flatMap((c) => c.src.map((s) => s.host)))];

export function GroundingSpecimen() {
  const [mode, setMode] = useState<'para' | 'span'>('para');
  const [sel, setSel] = useState<number | null>(null);
  const span = mode === 'span';
  const c = sel === null ? null : CLAIMS[sel];

  return (
    <Specimen
      height={320}
      readout={
        sel === null ? 'Click any sentence, then find the source that backs it'
          : span ? <>clause {sel + 1} · sources <span className="text-ink">{c!.src.length} of {ALL_HOSTS.length}</span> · corroborated by {c!.src.length - 1} more · quote shown</>
            : <>clause {sel + 1} · candidate sources <span className="text-[var(--anti)]">{ALL_HOSTS.length}</span> · the one that backs it: unknown</>
      }
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setSel(null); }} options={[{ value: 'para', label: 'Paragraph citation' }, { value: 'span', label: 'Span citation' }]} />}
    >
      <Window width={460} height={244}>
        <p className="t-sm p-3 text-ink" style={{ lineHeight: 1.7 }}>
          {CLAIMS.map((cl, i) => (
            <Fragment key={i}>
              <span
                role="button"
                tabIndex={0}
                onClick={() => setSel(sel === i ? null : i)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSel(sel === i ? null : i); }}
                className="cursor-pointer rounded-[3px] hover:bg-[var(--surface-2)]"
                style={{ background: sel === i ? 'var(--surface-2)' : undefined }}
              >
                {cl.text}
              </span>
              {span && (
                <span className="t-caption t-mono mx-1 rounded-[var(--r-pill)] px-1.5 py-0.5 text-ink-3" style={{ border: rule, letterSpacing: 0 }}>
                  {cl.src[0].host.split('.')[0]}{cl.src.length > 1 ? ` +${cl.src.length - 1}` : ''}
                </span>
              )}{' '}
            </Fragment>
          ))}
          {!span && <span className="t-caption t-mono rounded-[var(--r-pill)] px-1.5 py-0.5 text-ink-3" style={{ border: rule, letterSpacing: 0 }}>{ALL_HOSTS.length} sources</span>}
        </p>
        <div className="mt-auto flex flex-col gap-1 p-3" style={{ borderTop: rule, background: 'var(--surface-2)', minHeight: 92 }}>
          {!c ? (
            <span className="t-sm text-ink-4">Evidence panel</span>
          ) : span ? (
            c.src.map((s) => (
              <div key={s.host} className="t-sm flex gap-2">
                <Meta>{s.host}</Meta>
                <span className="text-ink-2">"<span style={{ boxShadow: 'inset 0 -1.5px 0 var(--accent)' }}>{s.quote}</span>"</span>
              </div>
            ))
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {ALL_HOSTS.map((h) => <span key={h} className="t-caption t-mono rounded-[var(--r-pill)] px-2 py-0.5 text-ink-3" style={{ border: rule, background: 'var(--surface)', letterSpacing: 0 }}>{h}</span>)}
            </div>
          )}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.06 · confidence UX ────────────────────────────────────────────────
type Band = { name: string; verb: string | null; line: string; actions: string[] };
function bandOf(s: number): Band {
  if (s >= 90) return { name: 'Critical', verb: 'Accept', line: '2px solid var(--anti)', actions: ['Accept', 'Ignore rule'] };
  if (s >= 70) return { name: 'Likely', verb: 'Accept', line: '1.5px solid var(--invisible)', actions: ['Accept', 'Explain'] };
  if (s >= 50) return { name: 'Possible', verb: 'Explain', line: '1.5px dotted var(--ink-4)', actions: ['Explain', 'Accept'] };
  return { name: 'Suppressed', verb: null, line: 'none', actions: [] };
}

export function ConfidenceSpecimen() {
  const { t } = useMotion();
  const [score, setScore] = useState(87);
  const [state, setState] = useState<'open' | 'accepted' | 'ignored' | 'explained'>('open');
  const b = bandOf(score);
  const fixed = state === 'accepted';
  const showCard = b.verb && (state === 'open' || state === 'explained');

  const act = (a: string) => setState(a === 'Accept' ? 'accepted' : a === 'Explain' ? 'explained' : 'ignored');

  return (
    <Specimen
      height={300}
      readout={<>score {(score / 100).toFixed(2)} · band <span className="text-ink">{b.name}</span> · default verb {b.verb ?? 'none'} · percent shown to user: no</>}
      controls={<Slider label="Model score" value={score} min={30} max={99} onChange={(v) => { setScore(v); setState('open'); }} verdict={b.name} />}
    >
      <Window width={380} height={210}>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <p className="t-sm text-ink">
            <span style={{ borderBottom: fixed ? 'none' : b.line, paddingBottom: 1 }}>{fixed ? 'There' : 'Their'}</span> is a review at noon, so bring the Q3 deck.
          </p>
          <AnimatePresence>
            {showCard && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={t(0.18)}
                className="flex flex-col gap-2 rounded-[var(--r-md)] p-3"
                style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)', opacity: b.name === 'Possible' ? 0.85 : 1 }}
              >
                <div className="t-caption flex items-center gap-1.5 text-ink-3" style={{ letterSpacing: 0 }}>
                  <Dot tone={b.name === 'Critical' ? 'bad' : b.name === 'Likely' ? 'warn' : 'good'} /> {b.name} · grammar
                </div>
                <div className="t-sm text-ink"><span className="text-ink-4 line-through">Their</span> → There</div>
                {state === 'explained' && <div className="t-sm text-ink-3">"There" marks existence. "Their" is possessive.</div>}
                <div className="flex gap-2">
                  {b.actions.map((a, i) => <Btn key={a} primary={i === 0} onClick={() => act(a)}>{a}</Btn>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!b.verb && <span className="t-sm text-ink-4">No suggestion shown below 0.50</span>}
          {state === 'accepted' && <span className="t-sm flex items-center gap-1.5 text-ink-3"><Check size={13} style={{ color: 'var(--pattern)' }} /> Fixed</span>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.07 · system prompt as microcopy ───────────────────────────────────
const SYS = {
  neutral: ['You are a helpful assistant.', 'Answer clearly and accurately.', 'Use markdown if helpful.', 'Be polite.'],
  voiced: ['Answer in three sentences or fewer.', 'Never open with praise or restate the question.', 'When unsure, say "likely" or "I could not verify".', 'Cite help articles inline as [help/slug].', 'Only help with this workspace.'],
};
const SP_QS = [
  {
    q: 'Can I export my board to PDF?',
    neutral: 'Great question! Yes, you can definitely export your board to PDF. To do this, simply open the board you would like to export, click on the Share menu in the top right corner, and then select the Export option. From there, choose PDF as the format. Let me know if there is anything else I can help with!',
    voiced: 'Yes. Share, then Export, then PDF. Boards over 50 frames export as a zip [help/export].',
  },
  {
    q: 'Does the free plan keep version history?',
    neutral: 'That is a great question. The free plan includes many useful features. Version history is definitely available and lets you see every previous version of your files. I hope this helps!',
    voiced: 'Likely 30 days on Free, but I could not verify that for your workspace. Check Settings, then Plan [help/plans].',
  },
  {
    q: 'Write me a haiku about invoices.',
    neutral: 'Sure! Here is a haiku about invoices: Numbers line the page, a total waits at the end, paid before the dawn.',
    voiced: 'I only help with this workspace. A general assistant is better for poems.',
  },
];
const spStats = (s: string) => ({
  words: s.split(/\s+/).length,
  filler: /^(great question|that is a great question|sure!|absolutely)/i.test(s),
  hedges: (s.match(/\b(likely|could not verify)\b/gi) ?? []).length,
  cites: (s.match(/\[[^\]]+\]/g) ?? []).length,
});

export function SystemPromptSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'neutral' | 'voiced'>('neutral');
  const [qi, setQi] = useState(0);
  const [peek, setPeek] = useState(false);
  const reply = SP_QS[qi][mode];
  const st = spStats(reply);

  return (
    <Specimen
      height={340}
      readout={<>words <span className="text-ink">{st.words}</span> · filler opener {st.filler ? 'yes' : 'no'} · hedges {st.hedges} · citations {st.cites}</>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'neutral', label: 'Neutral prompt' }, { value: 'voiced', label: 'Voiced prompt' }]} />}
    >
      <div className="flex w-full flex-col items-center gap-2.5">
        <Window width={440} height={238}>
          <button onClick={() => setPeek((p) => !p)} className="t-caption flex items-center gap-1.5 px-3 py-1.5 text-left text-ink-4 hover:text-ink-2" style={{ borderBottom: dashed, letterSpacing: 0 }}>
            {peek ? <EyeOff size={11} /> : <Eye size={11} />} system prompt · {SYS[mode].length} lines · hidden from the user
          </button>
          <AnimatePresence initial={false}>
            {peek && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={t()} className="overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                <div className="t-caption t-mono flex flex-col gap-0.5 px-3 py-2 text-ink-3" style={{ letterSpacing: 0 }}>
                  {SYS[mode].map((l) => <span key={l}>{l}</span>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
            <div className="t-sm self-end rounded-[var(--r-md)] px-3 py-1.5 text-ink" style={{ background: 'var(--surface-2)' }}>{SP_QS[qi].q}</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={`${mode}-${qi}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t(0.15)} className="t-sm text-ink">
                {reply}
              </motion.p>
            </AnimatePresence>
          </div>
        </Window>
        <div className="flex flex-wrap justify-center gap-1.5">
          {SP_QS.map((x, i) => (
            <button key={x.q} onClick={() => setQi(i)} className="t-caption rounded-[var(--r-pill)] px-2 py-0.5" style={{ border: rule, letterSpacing: 0, color: qi === i ? 'var(--ink)' : 'var(--ink-3)', background: qi === i ? 'var(--surface-2)' : undefined }}>
              {x.q}
            </button>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

// ── DE.AI.08 · composer ─────────────────────────────────────────────────────
const COMMANDS = ['/summarize', '/cite', '/rewrite', '/plan'];
const MENTIONS = ['@Q3-deck', '@Mira', '@billing-db'];
const MODELS = ['Sonnet 4', 'Opus 4', 'Haiku 3.5'];
const MODES = ['Chat', 'Agent'];
const REACHABLE = COMMANDS.length + MENTIONS.length + MODELS.length + MODES.length + 2;

export function ComposerSpecimen() {
  const [mode, setMode] = useState<'bare' | 'full'>('bare');
  const [text, setText] = useState('');
  const [model, setModel] = useState(0);
  const [agentMode, setAgentMode] = useState(0);
  const [files, setFiles] = useState<string[]>(['brief.pdf']);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const full = mode === 'full';

  const m = /(?:^|\s)([/@])([\w-]*)$/.exec(text);
  const pool = m ? (m[1] === '/' ? COMMANDS : MENTIONS) : [];
  const items = full && m && !dismissed ? pool.filter((c) => c.slice(1).toLowerCase().startsWith(m[2].toLowerCase())) : [];

  const reset = (v: 'bare' | 'full') => { setMode(v); setText(''); setSent(null); setFiles(['brief.pdf']); setModel(0); setAgentMode(0); setDismissed(false); };
  const pick = (item: string) => { if (!m) return; setText(text.slice(0, text.length - 1 - m[2].length) + item + ' '); setActive(0); };
  const send = () => {
    if (!text.trim()) return;
    const cmd = text.match(/\/\w+/)?.[0];
    setSent(full ? `${MODELS[model]} · ${MODES[agentMode]} · ${files.length} file${files.length === 1 ? '' : 's'}${cmd ? ` · ${cmd}` : ''}` : 'plain text only');
    setText('');
  };
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (items.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % items.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + items.length) % items.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(items[Math.min(active, items.length - 1)]); return; }
      if (e.key === 'Escape') { e.stopPropagation(); setDismissed(true); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const readout = !full
    ? <>actions reachable from the box <span className="text-ink">0</span> · typing / or @ opens nothing{sent && <> · sent: {sent}</>}</>
    : items.length
      ? <>{items.length} {m![1] === '/' ? 'commands' : 'mentions'} match · <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>Enter</Kbd> · <Kbd>Esc</Kbd></>
      : <>actions reachable from the box <span className="text-ink">{REACHABLE}</span> · {sent ? <>sent: {sent}</> : 'type / or @'}</>;

  return (
    <Specimen height={320} readout={readout} controls={<Segmented value={mode} onChange={reset} options={[{ value: 'bare', label: 'Bare textarea' }, { value: 'full', label: 'Full composer' }]} />}>
      <Window width={440} height={236}>
        <div className="flex flex-1 items-center justify-center t-sm text-ink-4">New chat</div>
        <div className="relative m-3 mt-0 flex flex-col gap-1.5 rounded-[var(--r-md)] p-2" style={{ border: '0.5px solid var(--hairline)', background: 'var(--surface)' }}>
          {items.length > 0 && (
            <div className="absolute bottom-full left-2 mb-1 flex w-[200px] flex-col rounded-[var(--r-md)] p-1" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}>
              {items.map((it, i) => (
                <button key={it} onMouseDown={(e) => { e.preventDefault(); pick(it); }} className="t-sm t-mono rounded-[var(--r-sm)] px-2 py-1 text-left text-ink" style={{ background: i === active ? 'var(--surface-2)' : undefined }}>
                  {it}
                </button>
              ))}
            </div>
          )}
          {full && files.length > 0 && (
            <div className="flex gap-1.5">
              {files.map((f) => (
                <span key={f} className="t-caption inline-flex items-center gap-1 rounded-[var(--r-pill)] px-2 py-0.5 text-ink-2" style={{ background: 'var(--surface-2)', letterSpacing: 0 }}>
                  <FileText size={11} /> {f} <Meta>indexed</Meta>
                  <button aria-label={`Remove ${f}`} onClick={() => setFiles((x) => x.filter((y) => y !== f))} className="text-ink-4 hover:text-ink"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
          <textarea
            rows={2}
            value={text}
            onChange={(e) => { setText(e.target.value); setDismissed(false); setActive(0); }}
            onKeyDown={onKey}
            placeholder={full ? 'Ask anything, or press / for actions' : 'Ask anything'}
            className="t-sm w-full resize-none bg-transparent px-1 text-ink outline-none"
          />
          <div className="flex items-center gap-1.5">
            {full && (
              <>
                <button aria-label="Attach" onClick={() => setFiles((x) => (x.includes('screenshot.png') ? x : [...x, 'screenshot.png']))} className="p-1 text-ink-3 hover:text-ink"><Paperclip size={14} /></button>
                <button onClick={() => setModel((v) => (v + 1) % MODELS.length)} className="t-caption rounded-[var(--r-pill)] px-2 py-0.5 text-ink-2" style={{ border: rule, letterSpacing: 0 }}>{MODELS[model]}</button>
                <button onClick={() => setAgentMode((v) => (v + 1) % MODES.length)} className="t-caption rounded-[var(--r-pill)] px-2 py-0.5 text-ink-2" style={{ border: rule, letterSpacing: 0 }}>{MODES[agentMode]}</button>
              </>
            )}
            <span className="flex-1" />
            {full && <button aria-label="Voice" className="p-1 text-ink-3 hover:text-ink"><Mic size={14} /></button>}
            <button aria-label="Send" onClick={send} className="flex size-6 items-center justify-center rounded-full" style={{ background: text.trim() ? 'var(--ink)' : 'var(--surface-2)', color: text.trim() ? 'var(--bg)' : 'var(--ink-4)' }}>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.AI.09 · reply block ──────────────────────────────────────────────────
const RB_SOURCES = ['help/refunds', 'help/card-credits', 'help/partial-refunds'];
const RB_TEXTS = [
  'Refunds post in 5 to 10 business days [1]. On cards they show as a separate credit, not a reversal [2]. A partial refund keeps the order open [3].',
  'Most refunds land within 5 to 10 business days [1]. Card refunds appear as their own credit line [2]. Partial refunds leave the rest of the order open [3].',
];
const RB_TOOL_AT = 5;

export function ReplyBlockSpecimen() {
  const [mode, setMode] = useState<'bubble' | 'block'>('bubble');
  const [versions, setVersions] = useState<number[]>([0]);
  const [view, setView] = useState(0);
  const [run, setRun] = useState(0);
  const [regens, setRegens] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const block = mode === 'block';
  const vi = view < 0 ? versions.length - 1 : view;
  const words = RB_TEXTS[versions[vi]].split(' ');
  const p = useStream(words.length, 70, run);
  const streaming = p < words.length;

  const reset = (m: 'bubble' | 'block') => { setMode(m); setVersions([0]); setView(0); setRegens(0); setCopied(null); setRun((r) => r + 1); };
  const regenerate = () => {
    setRegens((r) => r + 1);
    setCopied(null);
    if (block) { setVersions((v) => [...v, v.length % RB_TEXTS.length]); setView(-1); }
    else setVersions((v) => [(v[0] + 1) % RB_TEXTS.length]);
    setRun((r) => r + 1);
  };
  const copy = () => {
    const payload = `${RB_TEXTS[versions[vi]]}\n\nSources:\n${RB_SOURCES.map((s, i) => `[${i + 1}] ${s}`).join('\n')}`;
    void navigator.clipboard?.writeText(payload).then(() => setCopied(payload.length), () => setCopied(-1));
  };
  const affordances = block ? ['sources', 'copy', 'regenerate', ...(versions.length > 1 ? ['versions'] : [])] : ['regenerate'];

  const renderWord = (w: string, i: number) => {
    const c = /^\[(\d)\](.*)$/.exec(w);
    if (!c || !block) return <Fragment key={i}>{w} </Fragment>;
    return (
      <Fragment key={i}>
        <span className="t-caption t-mono rounded-[var(--r-pill)] px-1 align-[1px] text-ink-3" style={{ border: rule, letterSpacing: 0 }} title={RB_SOURCES[Number(c[1]) - 1]}>{c[1]}</span>{c[2]}{' '}
      </Fragment>
    );
  };

  return (
    <Specimen
      height={330}
      readout={
        <>
          {streaming ? <>streaming {p}/{words.length}</> : 'done'} · versions kept <span className="text-ink">{versions.length}</span>
          {!block && regens > 0 && <> · regenerated {regens}×, earlier answers lost</>}
          {' '}· affordances {affordances.length}
          {copied !== null && (copied < 0 ? <> · clipboard blocked</> : <> · copied {copied} chars with {RB_SOURCES.length} sources</>)}
        </>
      }
      controls={<Segmented value={mode} onChange={reset} options={[{ value: 'bubble', label: 'Prose in a bubble' }, { value: 'block', label: 'Reply block' }]} />}
    >
      <Window width={440} height={262}>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <div className="t-sm self-end rounded-[var(--r-md)] px-3 py-1.5 text-ink" style={{ background: 'var(--surface-2)' }}>How long do refunds take?</div>
          {block ? (
            <div className="flex flex-col gap-2 rounded-[var(--r-md)] p-2.5" style={{ border: rule }}>
              <div className="flex items-center gap-2">
                <span className="t-sm font-medium text-ink">Sonnet 4</span>
                <Meta>10:22</Meta>
                <span className="t-caption ml-auto flex items-center gap-1 text-ink-3" style={{ letterSpacing: 0 }}>
                  {streaming ? <><Loader2 size={11} className="animate-spin" /> streaming</> : <><Check size={11} style={{ color: 'var(--pattern)' }} /> done</>}
                </span>
              </div>
              {p >= RB_TOOL_AT && (
                <div className="t-caption t-mono flex items-center gap-2 rounded-[var(--r-sm)] px-2 py-1 text-ink-3" style={{ background: 'var(--surface-2)', letterSpacing: 0 }}>
                  search_docs("refund timing") <span className="ml-auto">3 results</span>
                </div>
              )}
              <p className="t-sm text-ink">{words.slice(0, p).map(renderWord)}</p>
              {!streaming && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Meta>{RB_SOURCES.length} sources</Meta>
                  <span className="flex-1" />
                  <button aria-label="Copy" onClick={copy} className="p-1 text-ink-3 hover:text-ink"><Copy size={13} /></button>
                  <button aria-label="Regenerate" onClick={regenerate} className="p-1 text-ink-3 hover:text-ink"><RefreshCw size={13} /></button>
                  {versions.length > 1 && (
                    <span className="flex items-center text-ink-3">
                      <button aria-label="Previous version" disabled={vi === 0} onClick={() => { setView(vi - 1); setRun((r) => r + 1); }} className="p-0.5 disabled:opacity-30"><ChevronLeft size={13} /></button>
                      <Meta>{vi + 1}/{versions.length}</Meta>
                      <button aria-label="Next version" disabled={vi === versions.length - 1} onClick={() => { setView(vi + 1); setRun((r) => r + 1); }} className="p-0.5 disabled:opacity-30"><ChevronRight size={13} /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="t-sm w-fit max-w-[92%] rounded-[var(--r-md)] px-3 py-2 text-ink" style={{ background: 'var(--surface-2)' }}>
                {words.slice(0, p).map(renderWord)}
              </div>
              {!streaming && (
                <button aria-label="Regenerate" onClick={regenerate} className="w-fit p-1 text-ink-4 hover:text-ink"><RefreshCw size={12} /></button>
              )}
            </div>
          )}
        </div>
      </Window>
    </Specimen>
  );
}

// ── registry ────────────────────────────────────────────────────────────────
export const DE_AGENTIC_AIUX_SPECIMENS: Record<string, React.FC> = {
  'de-au-agentic-loop': AgentLoopSpecimen,
  'de-au-action-schema': ActionSchemaSpecimen,
  'de-au-trace-ui': TraceSpecimen,
  'de-au-interrupt-design': InterruptSpecimen,
  'de-au-handoff-attribution': HandoffSpecimen,
  'de-au-dia-browser': OmniboxSpecimen,
  'de-ai-non-determinism': NonDeterminismSpecimen,
  'de-ai-ttft-latency': TtftSpecimen,
  'de-ai-streaming-shapes': StreamingShapesSpecimen,
  'de-ai-generative-ui': GenerativeUiSpecimen,
  'de-ai-grounding-spans': GroundingSpecimen,
  'de-ai-confidence-ux': ConfidenceSpecimen,
  'de-ai-system-prompt-microcopy': SystemPromptSpecimen,
  'de-ai-composer': ComposerSpecimen,
  'de-ai-reply-block': ReplyBlockSpecimen,
};
