import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Moon, X } from 'lucide-react';
import { Dot, Segmented, Specimen, Window, useMotion } from './kit';

// Phase 14 · Agent engineering, parts 1-3. One specimen per lesson.

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="t-caption t-mono shrink-0 whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}>{children}</span>;
}

function Mono({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className="t-caption t-mono" style={{ letterSpacing: 0, color: tone ? `var(--${tone})` : 'var(--ink-2)' }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, disabled, solid }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; solid?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium transition-opacity disabled:opacity-40"
      style={solid ? { background: 'var(--ink)', color: 'var(--bg)' } : { border: '0.5px solid var(--hairline)', color: 'var(--ink)' }}
    >
      {children}
    </button>
  );
}

function Controls({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>;
}

function Meter({ value, max, mark, tone = 'ink-3' }: { value: number; max: number; mark?: number; tone?: string }) {
  const { t } = useMotion();
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `var(--${tone})` }}
        initial={false}
        animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        transition={t(0.3)}
      />
      {mark !== undefined && <span className="absolute inset-y-0 w-px" style={{ left: `${(mark / max) * 100}%`, background: 'var(--ink)' }} />}
    </div>
  );
}

function Head({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
      <span className="truncate t-sm font-medium text-ink">{children}</span>
      {right}
    </div>
  );
}

function useTimers() {
  const ids = useRef<number[]>([]);
  const clear = () => {
    ids.current.forEach((i) => { window.clearTimeout(i); window.clearInterval(i); });
    ids.current = [];
  };
  const later = (fn: () => void, ms: number) => { ids.current.push(window.setTimeout(fn, ms)); };
  const every = (fn: () => void, ms: number) => { ids.current.push(window.setInterval(fn, ms)); };
  useEffect(() => clear, []);
  return { later, every, clear };
}

function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [dep]);
  return ref;
}

const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`);
const usd = (n: number) => `$${n.toFixed(3)}`;
const approxTokens = (s: string) => Math.ceil(s.length / 4);

// ── 14.01 · the agent loop ──────────────────────────────────────────────────
const LOOP = [
  { think: 'Need the list price first.', call: 'get_price({ sku: "A-220" })', obs: '{ "price": 129, "currency": "EUR" }', tok: 310 },
  { think: 'Convert to USD for the user.', call: 'fx_rate({ from: "EUR", to: "USD" })', obs: 'Error 429: rate limited, retry after 1s', tok: 280, err: true },
  { think: 'Rate limited. Retry once.', call: 'fx_rate({ from: "EUR", to: "USD" })', obs: '{ "rate": 1.08 }', tok: 260 },
  { think: '129 × 1.08 = 139.32. Check stock too.', call: 'get_stock({ sku: "A-220" })', obs: '{ "in_stock": 14 }', tok: 290 },
  { think: 'Everything is in hand.', call: 'finish({ answer: "$139.32, 14 in stock" })', obs: null, tok: 180, finish: true },
];
const LOOP_BASE = 420;

export function AgentLoopSpecimen() {
  const { t } = useMotion();
  const [cap, setCap] = useState<'3' | '8'>('8');
  const [turn, setTurn] = useState(0);
  const max = Number(cap);
  const done = LOOP.slice(0, turn);
  const stop = done[done.length - 1]?.finish ? 'finished' : turn >= max ? 'capped' : null;
  const tokens = LOOP_BASE + done.reduce((s, x) => s + x.tok, 0);
  const msgs = 1 + done.reduce((s, x) => s + (x.finish ? 1 : 2), 0);
  const scroller = useAutoScroll(turn);

  return (
    <Specimen
      height={330}
      readout={<>turn {turn}/{max} · buffer {msgs} msgs · {k(tokens)} tokens · stop: <span className="text-ink">{stop ?? 'none yet'}</span></>}
      controls={
        <Controls>
          <Segmented value={cap} onChange={(v) => { setCap(v); setTurn(0); }} options={[{ value: '3', label: 'max_turns 3' }, { value: '8', label: 'max_turns 8' }]} />
          <Btn solid onClick={() => setTurn((n) => n + 1)} disabled={!!stop}>Step</Btn>
          <Btn onClick={() => setTurn(0)} disabled={turn === 0}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={460} height={270}>
        <Head right={<div className="flex w-[120px] items-center gap-2"><Meter value={turn} max={max} tone={stop === 'capped' ? 'anti' : 'ink-3'} /><Meta>{turn}/{max}</Meta></div>}>
          Price A-220 in USD
        </Head>
        <div ref={scroller} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {turn === 0 && <span className="t-sm text-ink-4">User request is in the buffer. Step the loop.</span>}
          <AnimatePresence initial={false}>
            {done.map((x, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={t()} className="flex gap-2">
                <Meta>T{i + 1}</Meta>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="t-sm text-ink-3">{x.think}</span>
                  <Mono tone="ink">{x.call}</Mono>
                  {x.obs && <Mono tone={x.err ? 'anti' : 'ink-3'}>→ {x.obs}</Mono>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {stop && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="flex items-center gap-2 rounded-[var(--r-sm)] px-2 py-1.5 t-sm" style={{ background: 'var(--surface-2)' }}>
              <Dot tone={stop === 'finished' ? 'good' : 'bad'} />
              {stop === 'finished' ? <span className="text-ink">Finished: $139.32, 14 in stock</span> : <span className="text-ink">Capped at {max} turns. Partial result, no answer.</span>}
            </motion.div>
          )}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.02 · ReWOO ───────────────────────────────────────────────────────────
const RW_BASE = 400;
const RW_THOUGHT = 120;
const RW_OBS = 500;
const RW_PLAN = 220;
const RW_STEPS = [
  { id: '#E1', call: 'search("Lisbon population 2025")' },
  { id: '#E2', call: 'search("Porto population 2025")' },
  { id: '#E3', call: 'calc("#E1 / #E2")' },
  { id: '#E4', call: 'write_note(#E3)' },
];
type RwEvent = { label: string; call?: string; llm: number };

function rwEvents(mode: 'react' | 'rewoo'): RwEvent[] {
  if (mode === 'react') {
    return [...RW_STEPS.map((s, i) => ({ label: `call ${i + 1}`, call: s.call, llm: RW_BASE + i * (RW_THOUGHT + RW_OBS) + RW_THOUGHT })), { label: 'call 5', call: 'answer', llm: RW_BASE + 4 * (RW_THOUGHT + RW_OBS) + RW_THOUGHT }];
  }
  return [
    { label: 'planner', call: 'plan: #E1 · #E2 · #E3 · #E4', llm: RW_BASE + RW_PLAN },
    ...RW_STEPS.map((s) => ({ label: s.id, call: s.call, llm: 0 })),
    { label: 'solver', call: 'answer from #E1 to #E4', llm: RW_BASE + RW_PLAN + 4 * RW_OBS + RW_THOUGHT },
  ];
}

export function ReWOOSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'react' | 'rewoo'>('react');
  const [n, setN] = useState(0);
  const ev = rwEvents(mode);
  const shown = ev.slice(0, n);
  const calls = shown.filter((e) => e.llm > 0).length;
  const tokens = shown.reduce((s, e) => s + e.llm, 0);
  const scale = Math.max(...rwEvents('react').map((e) => e.llm));
  const planned = mode === 'rewoo' && n >= 1;

  return (
    <Specimen
      height={330}
      readout={<>LLM calls {calls} · <span className="text-ink">{k(tokens)} tokens</span> · plan visible before tools run: {mode === 'rewoo' ? (planned ? 'yes, 4 steps' : 'not yet') : 'never'}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { setMode(m); setN(0); }} options={[{ value: 'react', label: 'Interleaved (ReAct)' }, { value: 'rewoo', label: 'Plan first (ReWOO)' }]} />
          <Btn solid onClick={() => setN((x) => x + 1)} disabled={n >= ev.length}>Step</Btn>
          <Btn onClick={() => setN(0)} disabled={n === 0}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={460} height={270}>
        <Head right={<Meta>tokens per LLM call</Meta>}>Lisbon vs Porto population ratio</Head>
        <div className="flex flex-col gap-1.5 p-3">
          {ev.map((e, i) => {
            const on = i < n;
            const ghost = !on && planned && e.llm === 0;
            if (!on && !ghost) return null;
            return (
              <motion.div key={`${mode}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0.4 }} transition={t()} className="grid items-center gap-2" style={{ gridTemplateColumns: '56px 1fr 120px' }}>
                <Meta>{e.label}</Meta>
                <span className="truncate"><Mono tone={on ? 'ink' : 'ink-4'}>{e.call}</Mono></span>
                {e.llm > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1"><Meter value={e.llm} max={scale} tone="ink-3" /></div>
                    <Meta>{k(e.llm)}</Meta>
                  </div>
                ) : (
                  <Meta>{on ? 'tool only, 0' : 'planned'}</Meta>
                )}
              </motion.div>
            );
          })}
          {n === 0 && <span className="t-sm text-ink-4">Step the run. Each LLM call re-reads its input.</span>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.03 · Reflexion ───────────────────────────────────────────────────────
const RFX_FAIL = [
  { why: 'Used web_search for an order lookup', lesson: 'Order questions need orders_db, not web search.' },
  { why: 'Queried order 88 as a number', lesson: 'Order IDs are strings like "ORD-88-K". Check the format before querying.' },
];

export function ReflexionSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'off' | 'on'>('on');
  const [trials, setTrials] = useState<{ pass: boolean; why?: string; read: number }[]>([]);
  const [memory, setMemory] = useState<string[]>([]);
  const last = trials[trials.length - 1];
  const solved = !!last?.pass;
  const memTokens = memory.reduce((s, m) => s + approxTokens(m), 0);
  const repeats = trials.filter((x, i) => !x.pass && trials.slice(0, i).some((p) => p.why === x.why)).length;

  const run = () => {
    const r = mode === 'on' ? memory.length : 0;
    const fail = RFX_FAIL[r];
    setTrials((ts) => [...ts, { pass: !fail, why: fail?.why, read: r }]);
    if (fail && mode === 'on') setMemory((m) => [...m, fail.lesson]);
  };
  const reset = (m = mode) => { setMode(m); setTrials([]); setMemory([]); };

  return (
    <Specimen
      height={320}
      readout={<>trials {trials.length} · {solved ? <span className="text-ink">passed</span> : 'not passed'} · reflections read {last?.read ?? 0} (+{memTokens} tokens) · same mistake repeated {repeats}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'off', label: 'Reflection memory off' }, { value: 'on', label: 'Reflection memory on' }]} />
          <Btn solid onClick={run} disabled={solved || trials.length >= 4}>Run trial</Btn>
          <Btn onClick={() => reset()} disabled={!trials.length}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={470} height={250}>
        <Head right={<Meta>max 4 trials</Meta>}>Task: status of order ORD-88-K</Head>
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {trials.length === 0 && <span className="p-3 t-sm text-ink-4">Run the first trial.</span>}
            {trials.map((x, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={t()} className="flex items-start gap-2 px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                <span className="pt-1"><Dot tone={x.pass ? 'good' : 'bad'} /></span>
                <div className="flex min-w-0 flex-col">
                  <span className="t-sm text-ink">Trial {i + 1} · {x.pass ? 'pass' : 'fail'}</span>
                  <span className="t-caption text-ink-3">{x.pass ? 'Queried orders_db("ORD-88-K"): shipped' : x.why}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex w-[180px] shrink-0 flex-col gap-2 p-3" style={{ borderLeft: '0.5px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <Meta>reflection memory</Meta>
            {mode === 'off' && <span className="t-caption text-ink-4">Nothing is written. Each trial starts cold.</span>}
            {mode === 'on' && memory.length === 0 && <span className="t-caption text-ink-4">Empty until a trial fails.</span>}
            <AnimatePresence initial={false}>
              {memory.map((m, i) => (
                <motion.div key={m} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={t()} className="t-caption text-ink-2">
                  <span className="t-mono text-ink-4">R{i + 1} </span>{m}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.04 · Tree of Thoughts ────────────────────────────────────────────────
const TOT_L1 = [
  { e: '13 + 10 = 23', left: '4 9 23', v: 'likely' },
  { e: '9 + 4 = 13', left: '10 13 13', v: 'likely' },
  { e: '10 - 4 = 6', left: '6 9 13', v: 'maybe', path: '13 - 9 = 4 → 6 × 4 = 24' },
  { e: '13 - 9 = 4', left: '4 4 10', v: 'maybe', path: '10 - 4 = 6 → 6 × 4 = 24' },
  { e: '10 × 4 = 40', left: '9 13 40', v: 'unlikely' },
  { e: '13 × 9 = 117', left: '4 10 117', v: 'unlikely' },
];
const TOT_GEN = 200;
const TOT_EVAL = 60;
const TOT_FANOUT = 6;

export function TreeOfThoughtsSpecimen() {
  const { t } = useMotion();
  const [b, setB] = useState(1);
  const kept = TOT_L1.slice(0, b);
  const solved = kept.some((x) => x.path);
  const gens = 1 + 2 * b;
  const evals = TOT_FANOUT + TOT_FANOUT * b;
  const tokens = gens * TOT_GEN + evals * TOT_EVAL;
  const chain = 3 * TOT_GEN;
  const verdict = b === 1 ? 'one chain, no backtracking' : b === 2 ? 'narrow beam' : b === 3 ? 'reaches the solving branch' : 'wide, paying for spares';

  return (
    <Specimen
      height={320}
      readout={<>thoughts scored {evals} · LLM calls {gens + evals} · {k(tokens)} tokens ({(tokens / chain).toFixed(1)}× a plain chain) · <span className="text-ink">{solved ? 'reached 24' : 'dead end'}</span></>}
      controls={
        <div className="flex items-center gap-3">
          <span className="t-sm text-ink-3">breadth</span>
          <input type="range" min={1} max={4} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} className="w-36 accent-[var(--ink)]" aria-label="Breadth" />
          <span className="t-sm t-mono w-[220px] text-ink">b = {b} · {verdict}</span>
        </div>
      }
    >
      <Window width={470}>
        <Head right={<Meta>numbers 4 9 10 13</Meta>}>Game of 24</Head>
        <div className="flex flex-col p-2">
          {TOT_L1.map((x, i) => {
            const keep = i < b;
            return (
              <motion.div key={x.e} animate={{ opacity: keep ? 1 : 0.4 }} transition={t()} className="grid items-center gap-2 rounded-[var(--r-sm)] px-2 py-1.5" style={{ gridTemplateColumns: '92px 64px 1fr', background: keep ? 'var(--surface-2)' : undefined }}>
                <Mono tone={keep ? 'ink' : 'ink-4'}>{x.e}</Mono>
                <Meta>{x.v}</Meta>
                <span className="truncate">
                  {keep ? (
                    x.path ? <Mono tone="pattern">→ {x.path}</Mono> : <Mono tone="anti">→ left {x.left}, no way to 24</Mono>
                  ) : (
                    <Mono tone="ink-4">pruned</Mono>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.05 · Self-Refine and CRITIC ──────────────────────────────────────────
const SLUG_TESTS: [string, string][] = [
  ['Hello World', 'hello-world'],
  ['  trim me ', 'trim-me'],
  ['Café', 'cafe'],
  ['a--b', 'a-b'],
  ['', ''],
];
const SLUG_VERSIONS: { code: string; fn: (s: string) => string }[] = [
  { code: "s.toLowerCase().replace(/ /g, '-')", fn: (s) => s.toLowerCase().replace(/ /g, '-') },
  { code: "s.trim().toLowerCase().replace(/\\s+/g, '-')", fn: (s) => s.trim().toLowerCase().replace(/\s+/g, '-') },
  {
    code: String.raw`s.normalize('NFKD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')`,
    fn: (s) => s.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  },
];

export function SelfRefineSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'self' | 'tests'>('self');
  const [v, setV] = useState(0);
  const [verdict, setVerdict] = useState<null | 'approved' | 'capped'>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const results = SLUG_TESTS.map(([i, o]) => SLUG_VERSIONS[v].fn(i) === o);
  const passing = results.filter(Boolean).length;

  const critique = () => {
    if (mode === 'self') { setNotes(['"Looks correct, handles spaces."']); setVerdict('approved'); return; }
    const fails = SLUG_TESTS.filter((_, i) => !results[i]).map(([i, o]) => `"${i}" → got "${SLUG_VERSIONS[v].fn(i)}", want "${o}"`);
    if (!fails.length) { setNotes(['5 of 5 tests pass.']); setVerdict('approved'); return; }
    setNotes(fails);
    if (v + 1 >= SLUG_VERSIONS.length) { setVerdict('capped'); return; }
    setV(v + 1);
  };
  const reset = (m = mode) => { setMode(m); setV(0); setVerdict(null); setNotes([]); };

  return (
    <Specimen
      height={340}
      readout={<>iteration {v + 1}/3 · critic: {verdict ?? 'not run'} · tests actually passing <span className={passing === 5 ? 'text-ink' : 'text-[var(--anti)]'}>{passing}/5</span></>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'self', label: 'Critic: same model' }, { value: 'tests', label: 'Critic: test suite' }]} />
          <Btn solid onClick={critique} disabled={!!verdict}>Critique</Btn>
          <Btn onClick={() => reset()} disabled={v === 0 && !verdict}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={470} height={280}>
        <Head right={verdict === 'approved' ? <span className="flex items-center gap-1 t-caption text-ink"><Check size={12} /> approved</span> : <Meta>v{v + 1}</Meta>}>slugify(s)</Head>
        <motion.pre key={v} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="t-caption t-mono m-0 whitespace-pre-wrap px-3 py-2 text-ink" style={{ letterSpacing: 0, background: 'var(--surface-2)' }}>
          return {SLUG_VERSIONS[v].code}
        </motion.pre>
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
            <Meta>critique</Meta>
            {notes.length === 0 && <span className="t-caption text-ink-4">Not run yet.</span>}
            {notes.map((n) => <span key={n} className="t-caption text-ink-2">{n}</span>)}
          </div>
          <div className="flex w-[170px] shrink-0 flex-col gap-1 p-3" style={{ borderLeft: '0.5px solid var(--hairline)' }}>
            <Meta>ground truth (hidden)</Meta>
            {SLUG_TESTS.map(([i], idx) => (
              <span key={i} className="flex items-center gap-1.5 t-caption t-mono text-ink-3" style={{ letterSpacing: 0 }}>
                <Dot tone={results[idx] ? 'good' : 'bad'} /> {JSON.stringify(i)}
              </span>
            ))}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.06 · tool use ────────────────────────────────────────────────────────
type Desc = 'what' | 'when';
const TOOL_DESCS: Record<Desc, { name: string; desc: string }[]> = {
  what: [
    { name: 'get_invoice(id)', desc: 'Gets invoice data.' },
    { name: 'search_invoices(query)', desc: 'Searches invoices.' },
  ],
  when: [
    { name: 'get_invoice(id)', desc: 'Returns one invoice. Use when the user names an invoice number.' },
    { name: 'search_invoices(query)', desc: 'Up to 20 matches. Use when the user describes an invoice without an ID. Not for maths.' },
  ],
};
const TOOL_QUERIES = [
  {
    q: 'What is on invoice INV-2041?',
    want: 'get_invoice',
    what: { tool: 'get_invoice', call: 'get_invoice({ id: "INV-2041" })', out: '{ total: 2400, status: "paid" }' },
    when: { tool: 'get_invoice', call: 'get_invoice({ id: "INV-2041" })', out: '{ total: 2400, status: "paid" }' },
  },
  {
    q: 'Find the Acme invoice from last March',
    want: 'search_invoices',
    what: { tool: 'get_invoice', call: 'get_invoice({ id: "Acme" })', out: 'Error 404: no invoice with id "Acme"' },
    when: { tool: 'search_invoices', call: 'search_invoices({ query: "Acme 2026-03" })', out: '1 match: INV-1877' },
  },
  {
    q: 'What is 15% of 2,400?',
    want: 'none',
    what: { tool: 'search_invoices', call: 'search_invoices({ query: "15% of 2,400" })', out: '0 matches' },
    when: { tool: 'none', call: 'no tool call', out: '360' },
  },
];

export function ToolUseSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<Desc>('what');
  const [sel, setSel] = useState<number | null>(null);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const right = [...tried].filter((i) => TOOL_QUERIES[i][mode].tool === TOOL_QUERIES[i].want).length;
  const pick = sel === null ? null : TOOL_QUERIES[sel];
  const res = pick ? pick[mode] : null;
  const ok = pick && res ? res.tool === pick.want : false;

  return (
    <Specimen
      height={330}
      readout={tried.size ? <>queries tried {tried.size}/3 · right tool <span className="text-ink">{right}/{tried.size}</span></> : 'Send each query to the model'}
      controls={<Segmented value={mode} onChange={(m) => { setMode(m); setSel(null); setTried(new Set()); }} options={[{ value: 'what', label: 'Descriptions say what' }, { value: 'when', label: 'Descriptions say when' }]} />}
    >
      <Window width={470} height={270}>
        <div className="flex flex-col gap-1 px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)', background: 'var(--surface-2)' }}>
          {TOOL_DESCS[mode].map((d) => (
            <div key={d.name} className="flex gap-2">
              <span className="w-[150px] shrink-0"><Mono tone="ink">{d.name}</Mono></span>
              <motion.span key={mode + d.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="t-caption text-ink-3">{d.desc}</motion.span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 px-3 pt-3">
          {TOOL_QUERIES.map((x, i) => (
            <button
              key={x.q}
              onClick={() => { setSel(i); setTried((s) => new Set(s).add(i)); }}
              className="rounded-[var(--r-pill)] px-2.5 py-1 t-caption transition-colors"
              style={{ border: '0.5px solid var(--hairline)', background: sel === i ? 'var(--ink)' : 'var(--surface)', color: sel === i ? 'var(--bg)' : 'var(--ink-2)' }}
            >
              {x.q}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1 p-3">
          {pick && res ? (
            <motion.div key={`${mode}-${sel}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={t()} className="flex flex-col gap-1">
              <Mono tone="ink">{res.call}</Mono>
              <Mono tone={ok ? 'ink-3' : 'anti'}>→ {res.out}</Mono>
              <span className="flex items-center gap-1.5 t-caption text-ink-3"><Dot tone={ok ? 'good' : 'bad'} /> expected {pick.want === 'none' ? 'no tool' : pick.want}</span>
            </motion.div>
          ) : (
            <span className="t-sm text-ink-4">Click a query to see the call the model emits.</span>
          )}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.11 · HTN planning ────────────────────────────────────────────────────
const HTN = [
  { name: 'verify_account', pre: [] as string[], adds: 'account_verified' },
  { name: 'check_limit', pre: ['account_verified'], adds: 'limit_ok' },
  { name: 'request_approval', pre: ['limit_ok'], adds: 'approval_requested' },
  { name: 'transfer_funds', pre: ['account_verified', 'limit_ok', 'approval_recorded'], adds: 'paid' },
  { name: 'send_receipt', pre: ['paid'], adds: 'receipt_sent' },
];

export function PlanningSpecimen() {
  const { t } = useMotion();
  const timers = useTimers();
  const [mode, setMode] = useState<'prose' | 'pre'>('prose');
  const [facts, setFacts] = useState<string[]>([]);
  const [at, setAt] = useState(0);
  const [running, setRunning] = useState(false);
  const [retries, setRetries] = useState(0);
  const [replans, setReplans] = useState(0);
  const missing = at < HTN.length ? HTN[at].pre.filter((p) => !facts.includes(p)) : [];
  const blocked = !running && at < HTN.length && at > 0 && missing.length > 0;
  const complete = at >= HTN.length;

  const runFrom = (start: number, held: string[]) => {
    timers.clear();
    setRunning(true);
    let i = start;
    let f = held;
    const tick = () => {
      if (i >= HTN.length || HTN[i].pre.some((p) => !f.includes(p))) { setRunning(false); return; }
      f = [...f, HTN[i].adds];
      i += 1;
      setFacts(f); setAt(i);
      timers.later(tick, 320);
    };
    timers.later(tick, 320);
  };
  const reset = (m = mode) => { timers.clear(); setMode(m); setFacts([]); setAt(0); setRunning(false); setRetries(0); setReplans(0); };
  const record = () => { const f = [...facts, 'approval_recorded']; setFacts(f); setReplans((r) => r + 1); runFrom(at, f); };

  const read = complete
    ? <>plan complete 5/5 · re-planned {replans}× from step 4</>
    : blocked
      ? mode === 'pre'
        ? <>blocked at step {at + 1} · missing <span className="text-ink">{missing.join(', ')}</span> · held {facts.filter((f) => HTN[at].pre.includes(f)).length}/{HTN[at].pre.length}</>
        : <>blocked at step {at + 1} · missing fact: <span className="text-ink">unknown</span> · retries {retries}</>
      : running ? <>running step {at + 1}…</> : 'Run the plan';

  return (
    <Specimen
      height={330}
      readout={read}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'prose', label: 'Block reported as prose' }, { value: 'pre', label: 'Block reported as precondition' }]} />
          <Btn solid onClick={() => runFrom(0, [])} disabled={running || at > 0}>Run plan</Btn>
          <Btn onClick={() => reset()} disabled={at === 0}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={460} height={270}>
        <Head right={<Meta>{facts.length} facts held</Meta>}>Pay vendor invoice #771</Head>
        <div className="flex flex-col">
          {HTN.map((s, i) => {
            const state = i < at ? 'done' : i === at && blocked ? 'blocked' : i === at && running ? 'run' : 'todo';
            return (
              <div key={s.name} className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                <Meta>{i + 1}</Meta>
                <span className="w-[130px] shrink-0"><Mono tone={state === 'todo' ? 'ink-4' : 'ink'}>{s.name}</Mono></span>
                <span className="min-w-0 flex-1 truncate">
                  {state === 'done' && <span className="flex items-center gap-1.5 t-caption text-ink-3"><Check size={12} /> + {s.adds}</span>}
                  {state === 'run' && <Loader2 size={12} className="animate-spin text-ink-4" />}
                  {state === 'blocked' && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="t-caption" style={{ color: 'var(--anti)' }}>
                      {mode === 'prose' ? '"I am unable to complete the transfer right now."' : `needs ${missing.join(', ')}`}
                    </motion.span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {blocked && (
          <div className="flex items-center justify-end gap-2 px-3 py-2">
            {mode === 'pre' ? (
              <Btn solid onClick={record}>Record approval, re-plan from 4</Btn>
            ) : (
              <Btn onClick={() => setRetries((r) => r + 1)}>Retry</Btn>
            )}
          </div>
        )}
      </Window>
    </Specimen>
  );
}

// ── 14.07 · virtual context (MemGPT) ────────────────────────────────────────
const VC_CAP = 2000;
const VC_SYS = 400;
const VC_MSGS = [
  { id: 1, text: 'Starting the billing service today.', tok: 180 },
  { id: 2, text: 'We use Postgres, not Mongo, for this one.', tok: 200 },
  { id: 3, text: 'Auth goes through the existing SSO.', tok: 190 },
  { id: 4, text: 'Invoice schema draft, 40 fields.', tok: 420 },
  { id: 5, text: 'Stripe webhooks need retries.', tok: 230 },
  { id: 6, text: '200 lines of webhook logs.', tok: 520 },
  { id: 7, text: 'Which database did we pick?', tok: 120 },
];
type VcMsg = (typeof VC_MSGS)[number];

function vcSimulate(n: number, page: boolean) {
  let ctx: VcMsg[] = [];
  const out: VcMsg[] = [];
  let pagedIn = 0;
  const used = () => VC_SYS + ctx.reduce((s, m) => s + m.tok, 0);
  const fit = () => { while (used() > VC_CAP) out.push(ctx.shift() as VcMsg); };
  for (const m of VC_MSGS.slice(0, n)) { ctx.push(m); fit(); }
  let answer: null | 'hit' | 'miss' = null;
  if (n === VC_MSGS.length) {
    const fact = ctx.find((m) => m.id === 2);
    if (fact) answer = 'hit';
    else if (page) {
      const hit = out.find((m) => m.id === 2) as VcMsg;
      ctx = [hit, ...ctx];
      pagedIn = 1;
      while (used() > VC_CAP) { const victim = ctx.find((m) => m.id !== 2 && m.id !== 7) as VcMsg; ctx = ctx.filter((m) => m !== victim); out.push(victim); }
      answer = 'hit';
    } else answer = 'miss';
  }
  return { ctx, out: out.filter((m) => !ctx.includes(m)), used: used(), pagedIn, answer };
}

export function VirtualContextSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'drop' | 'page'>('drop');
  const [n, setN] = useState(0);
  const sim = vcSimulate(n, mode === 'page');
  const evicted = n === 0 ? 0 : sim.out.length + sim.pagedIn;

  return (
    <Specimen
      height={340}
      readout={<>context {sim.used}/{VC_CAP} tokens · evicted {evicted} · paged back in {sim.pagedIn} · recall: <span className={sim.answer === 'miss' ? 'text-[var(--anti)]' : 'text-ink'}>{sim.answer ?? 'not asked'}</span></>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { setMode(m); setN(0); }} options={[{ value: 'drop', label: 'On overflow: drop oldest' }, { value: 'page', label: 'On overflow: page to archival' }]} />
          <Btn solid onClick={() => setN((x) => x + 1)} disabled={n >= VC_MSGS.length}>Send next</Btn>
          <Btn onClick={() => setN(0)} disabled={n === 0}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={470} height={280}>
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
            <div className="flex items-center justify-between"><Meta>context window (RAM)</Meta><Meta>{sim.used}/{VC_CAP}</Meta></div>
            <Meter value={sim.used} max={VC_CAP} tone={sim.used > VC_CAP * 0.9 ? 'invisible' : 'ink-3'} />
            <div className="mt-1 flex items-center justify-between rounded-[var(--r-sm)] px-2 py-1 t-caption text-ink-4" style={{ background: 'var(--surface-2)' }}>
              <span>system + core memory</span><span className="t-mono">{VC_SYS}</span>
            </div>
            <AnimatePresence initial={false}>
              {sim.ctx.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} transition={t()} className="flex items-center justify-between gap-2 rounded-[var(--r-sm)] px-2 py-1 t-caption" style={{ border: '0.5px solid var(--hairline-2)', color: m.id === 2 ? 'var(--ink)' : 'var(--ink-2)' }}>
                  <span className="truncate">{m.text}</span><span className="t-mono text-ink-4">{m.tok}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {sim.answer && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="mt-1 t-caption" style={{ color: sim.answer === 'hit' ? 'var(--ink)' : 'var(--anti)' }}>
                {sim.answer === 'hit' ? (sim.pagedIn ? 'archival_memory_search("database") → Postgres.' : 'Postgres.') : 'Agent: "I do not have that in context."'}
              </motion.div>
            )}
          </div>
          <div className="flex w-[160px] shrink-0 flex-col gap-1 p-3" style={{ borderLeft: '0.5px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <Meta>{mode === 'page' ? 'archival store (disk)' : 'dropped'}</Meta>
            <AnimatePresence initial={false}>
              {sim.out.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: mode === 'page' ? 1 : 0.45 }} exit={{ opacity: 0 }} transition={t()} className="truncate t-caption text-ink-3" style={{ textDecoration: mode === 'drop' ? 'line-through' : undefined }}>
                  {m.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.08 · memory blocks and sleep-time compute ────────────────────────────
type Consol = 'append' | 'inline' | 'sleep';
const MB_LIMIT = 400;
const MB_SESSIONS: { lines: string[] }[] = [
  { lines: ['user is a designer who likes clean interfaces', 'user prefers dark mode in every tool'] },
  { lines: ['user is a product designer, not a visual designer', 'user works at Ivish AI on the core product', 'user is based in Berlin'] },
  { lines: ['user mentioned dark mode again when testing', 'user ships frontend code in React and TypeScript', 'user said dark mode is a hard requirement'] },
  { lines: ['user is now based in Lisbon after moving in March', 'user asked again about the Lisbon office address'] },
];
const MB_CLEAN = [
  ['Designer', 'Prefers dark mode'],
  ['Product designer', 'Works at Ivish AI', 'Based in Berlin', 'Prefers dark mode'],
  ['Product designer, ships frontend (React, TS)', 'Works at Ivish AI', 'Based in Berlin', 'Prefers dark mode (hard requirement)'],
  ['Product designer, ships frontend (React, TS)', 'Works at Ivish AI', 'Based in Lisbon (was Berlin, invalidated s4)', 'Prefers dark mode (hard requirement)'],
];
const MB_REWRITE_MS = 1800;

export function MemoryBlocksSpecimen() {
  const { t } = useMotion();
  const timers = useTimers();
  const [mode, setMode] = useState<Consol>('append');
  const [s, setS] = useState(0);
  const [rewritten, setRewritten] = useState(0);
  const [latency, setLatency] = useState(0);

  const appended = MB_SESSIONS.slice(0, s).flatMap((x) => x.lines);
  const lines = mode === 'append' || !rewritten ? appended : [...MB_CLEAN[rewritten - 1], ...MB_SESSIONS.slice(rewritten, s).flatMap((x) => x.lines)];
  const chars = lines.join('\n').length;
  const live = lines.filter((l) => !l.includes('invalidated'));
  const cities = ['Berlin', 'Lisbon'].filter((c) => live.some((l) => l.includes(c))).length;
  const darks = lines.filter((l) => l.includes('dark mode')).length;

  const next = () => {
    const ns = s + 1;
    setS(ns);
    if (mode === 'inline') { setLatency(MB_REWRITE_MS); setRewritten(ns); }
    if (mode === 'sleep') { setLatency(0); timers.later(() => setRewritten(ns), 900); }
  };
  const reset = (m = mode) => { timers.clear(); setMode(m); setS(0); setRewritten(0); setLatency(0); };

  return (
    <Specimen
      height={330}
      readout={<>human block <span className={chars > MB_LIMIT ? 'text-[var(--anti)]' : 'text-ink'}>{chars}/{MB_LIMIT} chars</span> · duplicates {Math.max(0, darks - 1)} · contradictions {Math.max(0, cities - 1)} · reply latency +{latency}ms</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'append', label: 'Append only' }, { value: 'inline', label: 'Rewrite inline' }, { value: 'sleep', label: 'Rewrite at sleep-time' }]} />
          <Btn solid onClick={next} disabled={s >= MB_SESSIONS.length}>Next session</Btn>
          <Btn onClick={() => reset()} disabled={s === 0}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={420} height={260}>
        <Head right={<Meta>session {s}/4</Meta>}>Memory block: human</Head>
        <div className="px-3 pt-2"><Meter value={chars} max={MB_LIMIT * 1.3} mark={MB_LIMIT} tone={chars > MB_LIMIT ? 'anti' : 'ink-3'} /></div>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {s === 0 && <span className="t-sm text-ink-4">Empty. Run a session.</span>}
          <AnimatePresence initial={false} mode="popLayout">
            {lines.map((l, i) => (
              <motion.span key={`${rewritten}-${l}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t()} className="t-caption t-mono text-ink-2" style={{ letterSpacing: 0 }}>
                {String(i + 1).padStart(2, '0')} {l}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {mode === 'sleep' && rewritten > 0 && (
            <motion.div key={rewritten} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t()} className="flex items-center gap-1.5 px-3 py-1.5 t-caption text-ink-3" style={{ borderTop: '0.5px solid var(--hairline-2)' }}>
              <Moon size={12} /> v{rewritten} rewritten by the sleep-time agent while the user was away
            </motion.div>
          )}
        </AnimatePresence>
      </Window>
    </Specimen>
  );
}

// ── 14.09 · hybrid memory, fused ranking ────────────────────────────────────
const HM_RECORDS = [
  { text: 'Lives in Lisbon, moved in March', store: 'graph', rel: 0.81, imp: 0.3, rec: 0.4 },
  { text: 'In Berlin this week for a conference', store: 'vector', rel: 0.62, imp: 0.1, rec: 0.95 },
  { text: 'Grew up in Porto', store: 'kv', rel: 0.7, imp: 0.2, rec: 0.05 },
];
const W_REL = 1;
const W_IMP = 0.3;

export function HybridMemorySpecimen() {
  const { t } = useMotion();
  const [w, setW] = useState(0.2);
  const scored = HM_RECORDS.map((r) => ({ ...r, parts: [W_REL * r.rel, W_IMP * r.imp, w * r.rec] }))
    .map((r) => ({ ...r, score: r.parts[0] + r.parts[1] + r.parts[2] }))
    .sort((a, b) => b.score - a.score);
  const top = scored[0];
  const flip = (0.9 - 0.65) / (0.95 - 0.4);
  const verdict = w < 0.25 ? 'relevance leads' : w < flip ? 'balanced, home still wins' : 'recency wins: a trip outranks home';
  const tones = ['var(--ink-2)', 'var(--ink-4)', 'var(--accent)'];

  return (
    <Specimen
      height={300}
      readout={<>rank 1 returned to the model: <span className="text-ink">"{top.text}"</span> · score {top.score.toFixed(2)}</>}
      controls={
        <div className="flex items-center gap-3">
          <span className="t-sm t-mono text-ink-3">w_recency</span>
          <input type="range" min={0} max={1} step={0.05} value={w} onChange={(e) => setW(Number(e.target.value))} className="w-36 accent-[var(--ink)]" aria-label="Recency weight" />
          <span className="t-sm t-mono w-[250px] text-ink">{w.toFixed(2)} · {verdict}</span>
        </div>
      }
    >
      <Window width={470}>
        <Head right={<span className="flex items-center gap-2 t-caption text-ink-4">{['relevance', 'importance', 'recency'].map((l, i) => <span key={l} className="flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: tones[i] }} />{l}</span>)}</span>}>
          search("where does the user live?")
        </Head>
        <div className="flex flex-col p-2">
          {scored.map((r, i) => (
            <motion.div key={r.text} layout transition={t()} className="grid items-center gap-2 rounded-[var(--r-sm)] px-2 py-2" style={{ gridTemplateColumns: '16px 1fr 150px 36px', background: i === 0 ? 'var(--surface-2)' : undefined }}>
              <Meta>{i + 1}</Meta>
              <div className="flex min-w-0 flex-col">
                <span className="truncate t-sm text-ink">{r.text}</span>
                <Meta>{r.store} · rel {r.rel.toFixed(2)} · imp {r.imp.toFixed(2)} · rec {r.rec.toFixed(2)}</Meta>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
                {r.parts.map((p, j) => (
                  <motion.span key={j} initial={false} animate={{ width: `${(p / 1.9) * 100}%` }} transition={t()} style={{ background: tones[j] }} />
                ))}
              </div>
              <span className="t-caption t-mono text-right text-ink" style={{ letterSpacing: 0 }}>{r.score.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.10 · skill libraries (Voyager) ───────────────────────────────────────
const VY_TASKS = ['Mine 3 logs', 'Craft planks', 'Craft a table', 'Craft a pickaxe'];
const VY_INLINE_BASE = ['for (let i = 0; i < 3; i++) {', '  await bot.dig(await bot.findBlock("oak_log"));', '}'];
const VY_OFF: string[][] = [
  VY_INLINE_BASE,
  [...VY_INLINE_BASE, 'await bot.craft("oak_planks", 4);'],
  [...VY_INLINE_BASE, 'await bot.craft("oak_planks", 4);', 'await bot.craft("crafting_table", 1);'],
  [...VY_INLINE_BASE, 'await bot.craft("oak_planks", 4);', 'await bot.craft("crafting_table", 1);', 'await bot.placeBlock("crafting_table");', 'await bot.craft("oak_planks", 4);', 'await bot.craft("stick", 4);', 'await bot.craft("wooden_pickaxe", 1);'],
];
const VY_ON: { name: string; uses: string[]; code: string[] }[] = [
  { name: 'mineLogs', uses: [], code: ['async function mineLogs(n) {', '  for (let i = 0; i < n; i++)', '    await bot.dig(await bot.findBlock("oak_log"));', '}'] },
  { name: 'craftPlanks', uses: ['mineLogs'], code: ['async function craftPlanks() {', '  await mineLogs(1);', '  await bot.craft("oak_planks", 4);', '}'] },
  { name: 'craftTable', uses: ['craftPlanks'], code: ['async function craftTable() {', '  await craftPlanks();', '  await bot.craft("crafting_table", 1);', '}'] },
  { name: 'craftPickaxe', uses: ['craftTable', 'craftPlanks'], code: ['async function craftPickaxe() {', '  await craftTable();', '  await craftPlanks();', '  await bot.craft("wooden_pickaxe", 1);', '}'] },
];
const VY_SIM = [0.84, 0.79, 0.81];

export function SkillLibrarySpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'off' | 'on'>('off');
  const [n, setN] = useState(0);
  const code = n === 0 ? [] : mode === 'off' ? VY_OFF[n - 1] : VY_ON[n - 1].code;
  const total = mode === 'off' ? VY_OFF.slice(0, n).reduce((s, c) => s + c.length, 0) : VY_ON.slice(0, n).reduce((s, c) => s + c.code.length, 0);
  const tokens = mode === 'off' ? VY_OFF.slice(0, n).reduce((s, c) => s + approxTokens(c.join('\n')), 0) : VY_ON.slice(0, n).reduce((s, c) => s + approxTokens(c.code.join('\n')), 0);
  const lib = mode === 'on' ? VY_ON.slice(0, n) : [];
  const reused = mode === 'on' ? VY_ON.slice(0, n).reduce((s, c) => s + c.uses.length, 0) : 0;
  const uses = n > 0 && mode === 'on' ? VY_ON[n - 1].uses : [];

  return (
    <Specimen
      height={330}
      readout={<>task {n}/4 · lines written this task {code.length} · total {total} lines, ~{tokens} tokens · skills reused {reused}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { setMode(m); setN(0); }} options={[{ value: 'off', label: 'Skill library off' }, { value: 'on', label: 'Skill library on' }]} />
          <Btn solid onClick={() => setN((x) => x + 1)} disabled={n >= VY_TASKS.length}>Next task</Btn>
          <Btn onClick={() => setN(0)} disabled={n === 0}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={480} height={270}>
        <Head right={<Meta>{n ? VY_TASKS[n - 1] : 'no task yet'}</Meta>}>Generated code</Head>
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden p-3">
            {uses.length > 0 && <Meta>retrieved: {uses.map((u, i) => `${u} (${VY_SIM[Math.min(i + n - 2, 2)].toFixed(2)})`).join(', ')}</Meta>}
            <motion.pre key={`${mode}-${n}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="t-caption t-mono m-0 whitespace-pre text-ink-2" style={{ letterSpacing: 0 }}>
              {code.map((l, i) => (
                <div key={i} style={{ color: uses.some((u) => l.includes(`${u}(`)) ? 'var(--accent)' : undefined }}>{l}</div>
              ))}
            </motion.pre>
            {n === 0 && <span className="t-sm text-ink-4">Run the first task.</span>}
          </div>
          <div className="flex w-[130px] shrink-0 flex-col gap-1 p-3" style={{ borderLeft: '0.5px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <Meta>skill library</Meta>
            {mode === 'off' && <span className="t-caption text-ink-4">Nothing kept. Every task starts from zero.</span>}
            <AnimatePresence initial={false}>
              {lib.map((s) => (
                <motion.span key={s.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={t()}><Mono tone="ink">{s.name} v1</Mono></motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.34 · repo memory ─────────────────────────────────────────────────────
const RM_FILES_IN_REPO = 14;
const RM_FREE = { notes: 'did the auth refactor, mostly works', todo: 'check the tests? maybe the login one', files: null, status: 'kinda done' };
const RM_SCHEMA = { schema_version: 2, active_task: 'T-104', status: 'blocked', touched_files: ['src/auth/session.ts', 'src/auth/refresh.ts'], blockers: ['needs the staging DB seeded'] };
const RM_FIELDS: { key: string; ok: (v: unknown) => boolean }[] = [
  { key: 'active_task', ok: (v) => typeof v === 'string' && /^T-\d{3,}$/.test(v) },
  { key: 'status', ok: (v) => typeof v === 'string' && ['todo', 'active', 'blocked', 'done'].includes(v) },
  { key: 'touched_files', ok: (v) => Array.isArray(v) && v.length > 0 },
  { key: 'blockers', ok: (v) => Array.isArray(v) },
];

export function RepoMemorySpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'free' | 'schema'>('free');
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const file: Record<string, unknown> = mode === 'free' ? RM_FREE : RM_SCHEMA;
  const checks = RM_FIELDS.map((f) => ({ key: f.key, ok: f.ok(file[f.key]) }));
  const valid = checks.filter((c) => c.ok).length;
  const reread = valid === RM_FIELDS.length ? RM_SCHEMA.touched_files.length : RM_FILES_IN_REPO;

  return (
    <Specimen
      height={340}
      readout={phase < 2 ? (phase === 0 ? 'Session 1 is working. End it.' : 'Chat history is gone. Start session 2.') : <>session 2 · fields recovered <span className="text-ink">{valid}/{RM_FIELDS.length}</span> · files re-read {reread}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { setMode(m); setPhase(0); }} options={[{ value: 'free', label: 'Handoff: free-form notes' }, { value: 'schema', label: 'Handoff: schema-validated JSON' }]} />
          <Btn solid onClick={() => setPhase((p) => (p === 2 ? 0 : ((p + 1) as 1 | 2)))}>{phase === 0 ? 'End session 1' : phase === 1 ? 'Start session 2' : 'Reset'}</Btn>
        </Controls>
      }
    >
      <Window width={470} height={280}>
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
            <Meta>{phase === 2 ? 'session 2 chat' : 'session 1 chat'}</Meta>
            <AnimatePresence mode="wait" initial={false}>
              {phase === 0 && (
                <motion.div key="s1" exit={{ opacity: 0 }} transition={t()} className="flex flex-col gap-1 t-caption text-ink-2">
                  <span>Refactored session.ts and refresh.ts for T-104.</span>
                  <span>Login test fails: staging DB is empty.</span>
                  <span>Waiting on the seed before continuing.</span>
                </motion.div>
              )}
              {phase === 1 && <motion.span key="gone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="t-caption text-ink-4">Process exited. Nothing in memory.</motion.span>}
              {phase === 2 && (
                <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="flex flex-col gap-1 t-caption">
                  {valid === RM_FIELDS.length ? (
                    <span className="text-ink">Resuming T-104, status blocked. Can you seed the staging DB?</span>
                  ) : (
                    <span className="text-ink">What were we working on? Scanning all {RM_FILES_IN_REPO} files to find out.</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex w-[240px] shrink-0 flex-col gap-1 overflow-y-auto p-3" style={{ borderLeft: '0.5px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <Meta>agent_state.json{phase === 2 ? ' · schema check' : ''}</Meta>
            {[...Object.keys(file), ...(phase === 2 ? RM_FIELDS.map((f) => f.key).filter((key) => !(key in file)) : [])].map((key) => {
              const check = checks.find((c) => c.key === key);
              const absent = !(key in file);
              return (
                <div key={key} className="flex items-start gap-1.5 t-caption t-mono" style={{ letterSpacing: 0 }}>
                  <span className="w-1.5 shrink-0 pt-1">{phase === 2 && check && <Dot tone={check.ok ? 'good' : 'bad'} />}</span>
                  <span className="min-w-0 break-words" style={{ color: absent ? 'var(--ink-4)' : 'var(--ink-2)' }}>
                    {key}: {absent ? 'missing' : JSON.stringify(file[key])}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.12 · workflow vs agent ───────────────────────────────────────────────
const WF_STEPS = [
  { name: 'classify', cost: 0.001 },
  { name: 'fetch_order', cost: 0.002 },
  { name: 'check_refund_policy', cost: 0.002 },
  { name: 'draft_reply', cost: 0.004 },
  { name: 'send', cost: 0.001 },
];
const AG_STEPS = [
  { name: 'search_kb("refund")', cost: 0.004 },
  { name: 'fetch_order(5512)', cost: 0.003 },
  { name: 'search_kb("damaged item")', cost: 0.005 },
  { name: 'fetch_customer(c_91)', cost: 0.004 },
  { name: 'check_policy("refund")', cost: 0.006 },
  { name: 'fetch_order(5512)', cost: 0.003 },
  { name: 'draft_reply()', cost: 0.007 },
  { name: 'critique(draft)', cost: 0.005 },
  { name: 'send()', cost: 0.004 },
];

export function WorkflowPatternsSpecimen() {
  const { t } = useMotion();
  const timers = useTimers();
  const [mode, setMode] = useState<'workflow' | 'agent'>('workflow');
  const [n, setN] = useState(0);
  const steps = mode === 'workflow' ? WF_STEPS : AG_STEPS;
  const spent = steps.slice(0, n).reduce((s, x) => s + x.cost, 0);
  const quote = WF_STEPS.reduce((s, x) => s + x.cost, 0);
  const [running, setRunning] = useState(false);
  const scroller = useAutoScroll(n);

  const run = () => {
    timers.clear(); setN(0); setRunning(true);
    steps.forEach((_, i) => timers.later(() => { setN(i + 1); if (i === steps.length - 1) setRunning(false); }, 420 * (i + 1)));
  };

  return (
    <Specimen
      height={330}
      readout={<>quote before run: {mode === 'workflow' ? usd(quote) : 'none possible'} · spent <span className="text-ink">{usd(spent)}</span> · step {n}/{mode === 'workflow' ? WF_STEPS.length : '?'}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { timers.clear(); setMode(m); setN(0); setRunning(false); }} options={[{ value: 'workflow', label: 'Graph owner: engineer' }, { value: 'agent', label: 'Graph owner: model' }]} />
          <Btn solid onClick={run} disabled={running}>{n === steps.length ? 'Run again' : 'Run'}</Btn>
        </Controls>
      }
    >
      <Window width={440} height={270}>
        <Head right={<Meta>{mode === 'workflow' ? `step ${n} of 5` : `step ${n} of ?`}</Meta>}>Refund request #5512</Head>
        <div className="px-3 pt-2">
          {mode === 'workflow' ? (
            <Meter value={n} max={WF_STEPS.length} tone="ink-3" />
          ) : (
            <div className="flex items-center gap-2"><div className="flex-1"><Meter value={spent} max={0.05} tone="invisible" /></div><Meta>spend</Meta></div>
          )}
        </div>
        <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-2">
          {steps.map((s, i) => {
            const done = i < n;
            const now = i === n && running;
            if (mode === 'agent' && !done && !now) return null;
            return (
              <motion.div key={`${mode}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: done || now ? 1 : 0.35 }} transition={t()} className="flex items-center gap-2 py-1">
                <span className="flex w-3.5 justify-center">{done ? <Check size={12} className="text-ink-3" /> : now ? <Loader2 size={12} className="animate-spin text-ink-4" /> : <Meta>{i + 1}</Meta>}</span>
                <span className="flex-1 truncate"><Mono tone={done ? 'ink' : 'ink-3'}>{s.name}</Mono></span>
                {done && <Meta>{usd(s.cost)}</Meta>}
              </motion.div>
            );
          })}
          {n === 0 && mode === 'agent' && <span className="t-sm text-ink-4">The model decides each next step at run time.</span>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.13 · checkpointed state machine ──────────────────────────────────────
const LG_N = 40;
const LG_FAIL = 38;
const LG_EMAIL = 12;
const LG_TOK = 2400;

export function CheckpointSpecimen() {
  const { reduce } = useMotion();
  const timers = useTimers();
  const [mode, setMode] = useState<'none' | 'ckpt'>('none');
  const [runs, setRuns] = useState<number[]>(Array(LG_N).fill(0));
  const [at, setAt] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'run' | 'failed' | 'done'>('idle');
  const paid = runs.reduce((s, x) => s + x, 0);
  const repeated = runs.filter((x) => x > 1).length;
  const emails = runs[LG_EMAIL - 1];

  const play = (from: number, to: number, failAt: number | null) => {
    setPhase('run');
    for (let i = from; i <= to; i++) {
      timers.later(() => {
        setAt(i);
        setRuns((r) => r.map((x, j) => (j === i - 1 ? x + 1 : x)));
        if (i === failAt) setPhase('failed');
        else if (i === to) setPhase('done');
      }, 35 * (i - from + 1));
    }
  };
  const start = () => play(1, LG_FAIL, LG_FAIL);
  const resume = () => play(mode === 'ckpt' ? LG_FAIL : 1, LG_N, null);
  const reset = (m = mode) => { timers.clear(); setMode(m); setRuns(Array(LG_N).fill(0)); setAt(0); setPhase('idle'); };

  return (
    <Specimen
      height={300}
      readout={<>steps paid {paid} for a {LG_N}-step run · repeated {repeated} · {k(paid * LG_TOK)} tokens · emails sent at step {LG_EMAIL}: <span className={emails > 1 ? 'text-[var(--anti)]' : 'text-ink'}>{emails}</span></>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'none', label: 'No checkpointer' }, { value: 'ckpt', label: 'Checkpoint every node' }]} />
          {phase === 'failed' ? <Btn solid onClick={resume}>Resume</Btn> : <Btn solid onClick={start} disabled={phase !== 'idle'}>Run</Btn>}
          <Btn onClick={() => reset()} disabled={phase === 'idle' || phase === 'run'}>Reset</Btn>
        </Controls>
      }
    >
      <Window width={420}>
        <Head right={<Meta>{phase === 'failed' ? `failed at ${LG_FAIL}` : phase === 'done' ? 'finished' : `node ${at}`}</Meta>}>Research run, 40 nodes</Head>
        <div className="grid gap-1.5 p-3" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
          {runs.map((r, i) => {
            const failed = phase === 'failed' && i === LG_FAIL - 1;
            const bg = failed ? 'var(--anti)' : r > 1 ? 'var(--invisible)' : r === 1 ? 'var(--ink-3)' : 'var(--surface-2)';
            return (
              <div key={i} className="relative flex h-6 items-center justify-center rounded-[var(--r-sm)]" style={{ background: bg, transition: reduce ? 'none' : 'background-color 150ms' }}>
                {i === LG_EMAIL - 1 && <span className="t-caption t-mono" style={{ letterSpacing: 0, color: r ? 'var(--bg)' : 'var(--ink-4)' }}>@</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 px-3 pb-3 t-caption text-ink-4">
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm" style={{ background: 'var(--ink-3)' }} />ran once</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm" style={{ background: 'var(--invisible)' }} />ran twice</span>
          <span className="flex items-center gap-1"><span className="t-mono">@</span>sends email</span>
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.14 · actor model ─────────────────────────────────────────────────────
const ACT = [
  { name: 'Linter', ms: 900 },
  { name: 'Tests', ms: 1600 },
  { name: 'Reviewer', ms: 2000, fail: 1100 },
  { name: 'Security', ms: 1900 },
];
const ACT_RETRY = 800;

export function ActorModelSpecimen() {
  const timers = useTimers();
  const [mode, setMode] = useState<'stack' | 'actors'>('stack');
  const [clock, setClock] = useState(-1);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const failAt = ACT[2].fail as number;
  const aborted = mode === 'stack' && clock >= failAt;
  const end = Math.max(...ACT.map((a) => a.ms));

  const status = (a: (typeof ACT)[number]) => {
    if (clock < 0) return { s: 'idle', p: 0 };
    const now = aborted ? failAt : clock;
    if (a.fail !== undefined) {
      if (retryAt !== null) { const p = Math.min(1, (clock - retryAt) / ACT_RETRY); return { s: p >= 1 ? 'done' : 'retry', p }; }
      if (now >= a.fail) return { s: mode === 'stack' ? 'raised' : 'dead', p: a.fail / a.ms };
    }
    const p = Math.min(1, now / a.ms);
    if (aborted) return { s: p >= 1 ? 'lost' : 'killed', p };
    return { s: p >= 1 ? 'done' : 'run', p };
  };
  const rows = ACT.map((a) => ({ a, ...status(a) }));
  const kept = rows.filter((r) => r.s === 'done').length;
  const lost = rows.filter((r) => r.s === 'lost').length;
  const dead = rows.filter((r) => r.s === 'dead').length;

  const tick = (from: number, until: number) => {
    timers.clear();
    let c = from;
    timers.every(() => { c += 50; setClock(c); if (c > until) timers.clear(); }, 50);
  };
  const run = () => { setRetryAt(null); setClock(0); tick(0, end + 100); };
  const retry = () => { setRetryAt(clock); tick(clock, Math.max(end, clock + ACT_RETRY) + 100); };
  const reset = (m = mode) => { timers.clear(); setMode(m); setClock(-1); setRetryAt(null); };

  const label: Record<string, string> = { idle: 'queued', run: 'running', done: 'done', raised: 'raised TimeoutError', dead: 'TimeoutError → dead letter', lost: 'done, result lost', killed: 'killed', retry: 'retrying' };
  const tone = (s: string) => (s === 'done' ? 'good' : s === 'raised' || s === 'dead' || s === 'lost' || s === 'killed' ? 'bad' : 'warn');

  return (
    <Specimen
      height={300}
      readout={clock < 0 ? 'Run the four-agent review' : aborted ? <>run failed at {(failAt / 1000).toFixed(1)}s · results kept <span className="text-[var(--anti)]">0/4</span> · finished work lost {lost}</> : <>results kept <span className="text-ink">{kept}/4</span> · dead letters {dead} · {retryAt !== null ? 'retried: Reviewer only' : dead ? 'retry scope: Reviewer only' : 'no failures yet'}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={reset} options={[{ value: 'stack', label: 'Runtime: call stack' }, { value: 'actors', label: 'Runtime: actors with inboxes' }]} />
          <Btn solid onClick={run}>{clock < 0 ? 'Run' : 'Run again'}</Btn>
        </Controls>
      }
    >
      <Window width={440}>
        <Head right={<Meta>{clock < 0 ? '0.0s' : `${(Math.min(clock, aborted ? failAt : clock) / 1000).toFixed(1)}s`}</Meta>}>Code review, PR #418</Head>
        <div className="flex flex-col">
          {rows.map((r) => (
            <div key={r.a.name} className="grid items-center gap-3 px-3 py-2" style={{ gridTemplateColumns: '72px 1fr 170px', borderBottom: '0.5px solid var(--hairline-2)' }}>
              <span className="t-sm text-ink">{r.a.name}</span>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
                <div className="h-full rounded-full" style={{ width: `${r.p * 100}%`, background: tone(r.s) === 'bad' ? 'var(--anti)' : 'var(--ink-3)', opacity: r.s === 'lost' || r.s === 'killed' ? 0.35 : 1 }} />
              </div>
              <span className="flex items-center gap-1.5 t-caption text-ink-3">
                <Dot tone={tone(r.s)} /> {label[r.s]}
                {r.s === 'dead' && <button onClick={retry} className="ml-auto underline underline-offset-2 text-ink">Retry</button>}
              </span>
            </div>
          ))}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.15 · CrewAI Crew vs Flow ─────────────────────────────────────────────
const CR_CREW = [
  ['researcher: search', 'writer: draft', 'editor: review', 'writer: revise'],
  ['researcher: search', 'researcher: search again', 'writer: draft', 'editor: approve', 'writer: publish'],
];
const CR_FLOW = [
  [['collect_sources', '3 urls'], ['draft', '3 sections'], ['edit', 'Brief, 3 sections'], ['publish', 'gated, ok']],
  [['collect_sources', '3 urls'], ['draft', '3 sections'], ['edit', 'Brief, 4 sections'], ['publish', 'gated, ok']],
];

export function CrewFlowSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'crew' | 'flow'>('crew');
  const [two, setTwo] = useState(false);
  const a = mode === 'crew' ? CR_CREW[0].map((s) => [s, '']) : CR_FLOW[0];
  const b = mode === 'crew' ? CR_CREW[1].map((s) => [s, '']) : CR_FLOW[1];
  const matched = b.filter((s, i) => a[i]?.[0] === s[0]).length;
  const diffs = b.filter((s, i) => a[i]?.[0] === s[0] && a[i]?.[1] !== s[1]).map((s) => s[0]);
  const comparable = matched === b.length && a.length === b.length;

  const col = (steps: string[][], id: string, other?: string[][]) => (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="px-3 py-1.5"><Meta>run {id}</Meta></div>
      {steps.map(([name, out], i) => {
        const same = other ? other[i]?.[0] === name : true;
        const changed = other && same && other[i]?.[1] !== out;
        return (
          <motion.div key={`${id}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="flex flex-col px-3 py-1" style={{ borderTop: '0.5px solid var(--hairline-2)', background: changed ? 'var(--surface-2)' : undefined }}>
            <Mono tone={other && !same ? 'anti' : 'ink'}>{mode === 'flow' ? `@${name}` : `${i + 1}. ${name}`}</Mono>
            {out && <span className="t-caption" style={{ color: changed ? 'var(--ink)' : 'var(--ink-4)' }}>{out}</span>}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <Specimen
      height={320}
      readout={!two ? 'Run it a second time, then compare' : <>steps matched to run 8b02: <span className="text-ink">{matched}/{b.length}</span> · {comparable ? <>diff: {diffs.join(', ')} changed output</> : 'diff: not comparable, shape changed'}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { setMode(m); setTwo(false); }} options={[{ value: 'crew', label: 'Shape: Crew' }, { value: 'flow', label: 'Shape: Flow' }]} />
          <Btn solid onClick={() => setTwo((x) => !x)}>{two ? 'Reset' : 'Run again'}</Btn>
        </Controls>
      }
    >
      <Window width={460} height={250}>
        <Head right={<Meta>{mode === 'crew' ? 'steps chosen by the LLM' : 'steps fixed in code'}</Meta>}>Weekly brief generator</Head>
        <div className="flex min-h-0 flex-1">
          {col(a, '8b02')}
          <div style={{ width: 0.5, background: 'var(--hairline)' }} />
          {two ? col(b, '8c31', a) : <div className="flex flex-1 items-center justify-center t-sm text-ink-4">no second run</div>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.16 · guardrails, blocking vs parallel ────────────────────────────────
const GR_CHECK = 900;
const GR_TOKEN = 40;
const GR_PROMPTS = [
  { q: 'How do I reset my password?', trip: false, a: 'Open Settings, then Security, then Reset password. We email a link that works for 30 minutes. If it expires, request a new one from the same screen.' },
  { q: 'Refund an order I never placed', trip: true, a: 'Sure, I can start that refund. First open Orders, find the order number, then choose Request refund and pick the reason that fits best so the team can process it.' },
];

export function GuardrailModeSpecimen() {
  const { t, reduce } = useMotion();
  const timers = useTimers();
  const [mode, setMode] = useState<'block' | 'parallel'>('block');
  const [p, setP] = useState<number | null>(null);
  const [ms, setMs] = useState(0);
  const prompt = p === null ? null : GR_PROMPTS[p];
  const words = prompt ? prompt.a.split(' ') : [];
  const end = GR_CHECK + words.length * GR_TOKEN + 200;

  const checked = ms >= GR_CHECK;
  const tripped = !!prompt?.trip && checked;
  const streamed = !prompt ? 0 : mode === 'block' ? (checked && !prompt.trip ? Math.min(words.length, Math.floor((ms - GR_CHECK) / GR_TOKEN)) : 0) : Math.min(words.length, Math.floor(Math.min(ms, prompt.trip ? GR_CHECK : Infinity) / GR_TOKEN));
  const retracted = mode === 'parallel' && tripped ? Math.floor(GR_CHECK / GR_TOKEN) : 0;
  const first = mode === 'block' ? (prompt?.trip ? null : GR_CHECK + GR_TOKEN) : GR_TOKEN;

  const send = (i: number) => {
    timers.clear(); setP(i); setMs(0);
    let c = 0;
    timers.every(() => { c += 20; setMs(c); if (c > end) timers.clear(); }, 20);
  };

  return (
    <Specimen
      height={320}
      readout={!prompt ? 'Send a message' : <>first token {first === null ? 'never' : `${first}ms`} · tokens generated then retracted <span className={retracted ? 'text-[var(--anti)]' : 'text-ink'}>{retracted}</span></>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { timers.clear(); setMode(m); setP(null); setMs(0); }} options={[{ value: 'block', label: 'Guardrail: blocking' }, { value: 'parallel', label: 'Guardrail: parallel' }]} />
        </Controls>
      }
    >
      <Window width={440} height={260}>
        <Head right={<Meta>{prompt ? `${Math.min(ms, end)}ms` : 'idle'}</Meta>}>Support assistant</Head>
        <div className="flex flex-wrap gap-1.5 px-3 pt-3">
          {GR_PROMPTS.map((x, i) => (
            <button key={x.q} onClick={() => send(i)} className="rounded-[var(--r-pill)] px-2.5 py-1 t-caption" style={{ border: '0.5px solid var(--hairline)', background: p === i ? 'var(--ink)' : 'var(--surface)', color: p === i ? 'var(--bg)' : 'var(--ink-2)' }}>
              {x.q}
            </button>
          ))}
        </div>
        <div className="relative m-3 min-h-[110px] rounded-[var(--r-sm)] p-3" style={{ background: 'var(--surface-2)' }}>
          {prompt && mode === 'block' && !checked && (
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 t-caption text-ink-3"><Loader2 size={12} className="animate-spin" /> Checking policy</span>
              <motion.span className="h-2 w-4/5 rounded-full" style={{ background: 'var(--hairline)' }} animate={reduce ? undefined : { opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <motion.span className="h-2 w-3/5 rounded-full" style={{ background: 'var(--hairline)' }} animate={reduce ? undefined : { opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            </div>
          )}
          {streamed > 0 && (
            <motion.p animate={{ opacity: tripped ? 0.3 : 1 }} transition={t(0.3)} className="m-0 t-sm text-ink" style={{ textDecoration: tripped ? 'line-through' : undefined }}>
              {words.slice(0, streamed).join(' ')}
            </motion.p>
          )}
          <AnimatePresence>
            {tripped && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={t()} className="mt-2 flex items-center gap-1.5 t-sm" style={{ color: 'var(--anti)' }}>
                <X size={14} /> I cannot help with refunds for orders that are not on your account.
              </motion.div>
            )}
          </AnimatePresence>
          {!prompt && <span className="t-sm text-ink-4">Pick a message to send.</span>}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.17 · subagents and context isolation ─────────────────────────────────
const SA_WINDOW = 100;
const SA_BASE = 5;
const SA_INLINE = 4.6;
const SA_RESULT = 0.35;
const SA_COMPACT_AT = 80;
const SA_SUMMARY = 6;
const SA_N = 20;
const SA_FILES = ['auth.ts', 'session.ts', 'db.ts', 'routes.ts', 'billing.ts'];

function saSim(n: number, inline: boolean) {
  if (!inline) return { used: SA_BASE + SA_RESULT * n, compactions: 0, firedAt: null as number | null };
  let used = SA_BASE;
  let compactions = 0;
  let firedAt: number | null = null;
  for (let i = 1; i <= n; i++) {
    used += SA_INLINE;
    if (used > SA_COMPACT_AT) { used = SA_BASE + SA_SUMMARY; compactions += 1; firedAt = firedAt ?? i; }
  }
  return { used, compactions, firedAt };
}

export function SubagentContextSpecimen() {
  const { t } = useMotion();
  const timers = useTimers();
  const [mode, setMode] = useState<'inline' | 'sub'>('inline');
  const [n, setN] = useState(0);
  const sim = saSim(n, mode === 'inline');
  const scroller = useAutoScroll(n);
  const run = () => { timers.clear(); setN(0); for (let i = 1; i <= SA_N; i++) timers.later(() => setN(i), 110 * i); };

  return (
    <Specimen
      height={330}
      readout={<>orchestrator {sim.used.toFixed(1)}k/{SA_WINDOW}k ({Math.round((sim.used / SA_WINDOW) * 100)}%) · lookups {n}/{SA_N} · compactions <span className={sim.compactions ? 'text-[var(--anti)]' : 'text-ink'}>{sim.compactions}</span>{sim.firedAt ? ` (detail from lookups 1-${sim.firedAt} summarised away)` : ''}</>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { timers.clear(); setMode(m); setN(0); }} options={[{ value: 'inline', label: 'Lookups: inline' }, { value: 'sub', label: 'Lookups: in subagents' }]} />
          <Btn solid onClick={run} disabled={n > 0 && n < SA_N}>Run {SA_N} lookups</Btn>
        </Controls>
      }
    >
      <Window width={460} height={270}>
        <div className="flex flex-col gap-1.5 px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
          <div className="flex items-center justify-between"><span className="t-sm font-medium text-ink">Orchestrator context</span><Meta>compaction at {SA_COMPACT_AT}k</Meta></div>
          <Meter value={sim.used} max={SA_WINDOW} mark={SA_COMPACT_AT} tone={sim.used > 60 ? 'invisible' : 'ink-3'} />
        </div>
        <div ref={scroller} className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
          {n === 0 && <span className="t-sm text-ink-4">Each lookup reads one file and answers one question.</span>}
          {Array.from({ length: n }, (_, i) => {
            const f = SA_FILES[i % SA_FILES.length];
            const summarised = mode === 'inline' && sim.firedAt !== null && i < sim.firedAt;
            return mode === 'inline' ? (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: summarised ? 0.35 : 1 }} transition={t()} className="flex flex-col gap-0.5 rounded-[var(--r-sm)] px-2 py-1" style={{ background: 'var(--surface-2)' }}>
                <div className="flex justify-between"><Mono tone="ink">read_file("src/{f}")</Mono><Meta>{SA_INLINE}k</Meta></div>
                <span className="h-1 w-11/12 rounded-full" style={{ background: 'var(--hairline)' }} />
                <span className="h-1 w-3/4 rounded-full" style={{ background: 'var(--hairline)' }} />
              </motion.div>
            ) : (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t()} className="flex items-center justify-between gap-2">
                <Mono tone="ink">subagent {i + 1}: {f} → 1 line</Mono>
                <Meta>own window {SA_INLINE}k · returns {SA_RESULT}k</Meta>
              </motion.div>
            );
          })}
        </div>
      </Window>
    </Specimen>
  );
}

// ── 14.18 · one schema across the stack ─────────────────────────────────────
const SZ_SITES = [
  { file: 'lookup.tool.ts', line: (f: string) => `execute: ({ ${f} }) => db.find(${f})` },
  { file: 'LookupForm.tsx', line: (f: string) => `<Field name="${f}" />` },
  { file: 'ResultPanel.tsx', line: (f: string) => `<td>{data.${f}}</td>` },
];

export function SharedSchemaSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'copied' | 'shared'>('copied');
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const field = phase === 0 ? 'customerId' : 'accountId';
  const siteField = (i: number) => {
    if (phase === 0) return 'customerId';
    if (mode === 'copied') return i === 0 ? 'accountId' : 'customerId';
    return phase === 2 ? 'accountId' : 'customerId';
  };
  const errors = mode === 'shared' && phase === 1 ? SZ_SITES.length : 0;
  const broken = mode === 'copied' && phase >= 1;
  const shipped = errors === 0;
  const panel = !shipped ? 'build blocked, not deployed' : broken ? 'undefined' : 'ACC-2207';

  return (
    <Specimen
      height={320}
      readout={<>tsc errors <span className="text-ink">{errors}</span> · deployed {shipped ? 'yes' : 'no'} · production panel shows <span className={panel === 'undefined' ? 'text-[var(--anti)]' : 'text-ink'}>{panel}</span></>}
      controls={
        <Controls>
          <Segmented value={mode} onChange={(m) => { setMode(m); setPhase(0); }} options={[{ value: 'copied', label: 'Schema: copied per layer' }, { value: 'shared', label: 'Schema: one shared Zod object' }]} />
          {phase === 0 && <Btn solid onClick={() => setPhase(1)}>Rename to accountId</Btn>}
          {phase === 1 && mode === 'shared' && <Btn solid onClick={() => setPhase(2)}>Fix the {errors} errors</Btn>}
          {phase > 0 && <Btn onClick={() => setPhase(0)}>Reset</Btn>}
        </Controls>
      }
    >
      <Window width={460} height={250}>
        <div className="px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)', background: 'var(--surface-2)' }}>
          <Mono tone="ink">schema.ts </Mono>
          <motion.span key={field} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={t()}><Mono tone="ink-3">z.object({`{ ${field}: z.string() }`})</Mono></motion.span>
          <div><Meta>{mode === 'shared' ? 'imported by all three files below' : 'tool owns this; form and panel keep their own copied types'}</Meta></div>
        </div>
        <div className="flex flex-col">
          {SZ_SITES.map((s, i) => {
            const f = siteField(i);
            const err = mode === 'shared' && phase === 1;
            const stale = broken && f !== field;
            return (
              <div key={s.file} className="flex flex-col gap-0.5 px-3 py-2" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                <Meta>{s.file}</Meta>
                <span style={{ textDecoration: err ? 'underline wavy var(--anti)' : undefined, textUnderlineOffset: 3 }}>
                  <Mono tone={stale ? 'invisible' : 'ink'}>{s.line(f)}</Mono>
                </span>
                {err && <span className="t-caption" style={{ color: 'var(--anti)' }}>Property 'customerId' does not exist. Did you mean 'accountId'?</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <Meta>production · ResultPanel</Meta>
          <span className="t-sm t-mono" style={{ color: panel === 'undefined' ? 'var(--anti)' : 'var(--ink)' }}>Account: {panel}</span>
        </div>
      </Window>
    </Specimen>
  );
}

export const PHASE14A_SPECIMENS: Record<string, React.FC> = {
  'p14-01-agent-loop': AgentLoopSpecimen,
  'p14-02-rewoo': ReWOOSpecimen,
  'p14-03-reflexion': ReflexionSpecimen,
  'p14-04-tree-of-thoughts': TreeOfThoughtsSpecimen,
  'p14-05-self-refine': SelfRefineSpecimen,
  'p14-06-tool-use': ToolUseSpecimen,
  'p14-11-planning': PlanningSpecimen,
  'p14-07-memgpt': VirtualContextSpecimen,
  'p14-08-memory-blocks': MemoryBlocksSpecimen,
  'p14-09-mem0': HybridMemorySpecimen,
  'p14-10-voyager': SkillLibrarySpecimen,
  'p14-34-repo-memory': RepoMemorySpecimen,
  'p14-12-workflow-patterns': WorkflowPatternsSpecimen,
  'p14-13-langgraph': CheckpointSpecimen,
  'p14-14-autogen': ActorModelSpecimen,
  'p14-15-crewai': CrewFlowSpecimen,
  'p14-16-openai-agents-sdk': GuardrailModeSpecimen,
  'p14-17-claude-agent-sdk': SubagentContextSpecimen,
  'p14-18-agno-mastra': SharedSchemaSpecimen,
};
