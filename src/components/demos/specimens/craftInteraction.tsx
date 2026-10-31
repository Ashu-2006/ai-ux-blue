import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Heart, Inbox, Loader2, MoreHorizontal, Plus, X } from 'lucide-react';
import { Dot, Kbd, Row, Segmented, Specimen, Window, useMotion } from './kit';

// Design engineering · Craft · Interaction. One specimen per lesson.

const ISSUES = [
  { id: 'ENG-142', title: 'Login redirect loops on Safari', status: 'In progress', who: 'Mira' },
  { id: 'ENG-139', title: 'CSV export drops the header row', status: 'Todo', who: 'Dev' },
  { id: 'ENG-131', title: 'Avatar upload returns 500', status: 'In review', who: 'Ana' },
  { id: 'ENG-128', title: 'Chart contrast fails in dark mode', status: 'Todo', who: 'Sam' },
];

const MAIL = [
  { from: 'Linear', subject: 'ENG-142 moved to In review', body: 'Mira moved the issue and requested your review on the redirect fix.' },
  { from: 'Vercel', subject: 'Deployment failed on main', body: 'Build step exited with code 1. The type check failed in two files.' },
  { from: 'Figma', subject: 'Ana commented on Checkout v3', body: '"Can the coupon field collapse until someone needs it?"' },
  { from: 'Stripe', subject: 'Payout of $2,150 is on the way', body: 'Expected to arrive in 2 business days.' },
  { from: 'GitHub', subject: 'PR #418 approved', body: 'Dev approved your changes. 1 check still running.' },
  { from: 'Notion', subject: 'Q4 roadmap was updated', body: 'Sam edited three sections and resolved four comments.' },
];

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="t-caption t-mono shrink-0 whitespace-nowrap text-ink-4" style={{ letterSpacing: 0 }}>{children}</span>;
}

function IssueDetail({ i }: { i: (typeof ISSUES)[number] }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <Meta>{i.id}</Meta>
      <div className="t-sm font-medium text-ink">{i.title}</div>
      <div className="t-sm text-ink-3">{i.status} · {i.who}</div>
      <div className="mt-1 h-1.5 w-4/5 rounded-full" style={{ background: 'var(--surface-2)' }} />
      <div className="h-1.5 w-3/5 rounded-full" style={{ background: 'var(--surface-2)' }} />
    </div>
  );
}

// ── DE.CI.01 · progressive disclosure ───────────────────────────────────────
type Reveal = 'expand' | 'peek' | 'drawer' | 'route';

export function ProgressiveDisclosureSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<Reveal>('peek');
  const [open, setOpen] = useState<string | null>(null);
  const issue = ISSUES.find((i) => i.id === open);
  const pick = (id: string) => setOpen((o) => (o === id ? null : id));

  const url = !issue
    ? '/issues'
    : mode === 'route'
      ? `/issues/${issue.id}`
      : mode === 'expand'
        ? '/issues'
        : `/issues?peek=${issue.id}`;
  const listState = !issue ? 'whole' : mode === 'route' ? 'gone' : mode === 'drawer' ? 'behind a veil' : mode === 'peek' ? 'visible, narrowed' : 'visible, pushed down';
  const back = mode === 'route' ? 'Back button' : mode === 'drawer' ? 'Esc or click outside' : 'click the row again';

  return (
    <Specimen
      height={320}
      readout={issue ? <>list: {listState} · return: {back}</> : 'Click an issue'}
      controls={
        <Segmented
          value={mode}
          onChange={(m) => { setMode(m); setOpen(null); }}
          options={[
            { value: 'expand', label: 'Expand' },
            { value: 'peek', label: 'Peek' },
            { value: 'drawer', label: 'Drawer' },
            { value: 'route', label: 'Route' },
          ]}
        />
      }
    >
      <Window width={460} height={250} url={url}>
        <div
          className="relative flex min-h-0 flex-1"
          onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(null); } }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {mode === 'route' && issue ? (
              <motion.div
                key="detail"
                className="absolute inset-0"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={t()}
              >
                <button onClick={() => setOpen(null)} className="flex items-center gap-1 px-3 pt-2.5 t-sm text-ink-3 hover:text-ink">
                  <ChevronLeft size={14} /> Issues
                </button>
                <IssueDetail i={issue} />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                transition={t()}
                className="min-w-0 overflow-y-auto"
                style={{ flex: 1 }}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
              >
                {ISSUES.map((i) => (
                  <div key={i.id}>
                    <Row onClick={() => pick(i.id)} active={open === i.id}>
                      <Meta>{i.id}</Meta>
                      <span className="truncate">{i.title}</span>
                    </Row>
                    <AnimatePresence initial={false}>
                      {mode === 'expand' && open === i.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={t()}
                          className="overflow-hidden"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          <IssueDetail i={i} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {mode === 'peek' && issue && (
              <motion.div
                key="peek"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 190, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={t()}
                className="shrink-0 overflow-hidden"
                style={{ borderLeft: '0.5px solid var(--hairline)' }}
              >
                <div style={{ width: 190 }}><IssueDetail i={issue} /></div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mode === 'drawer' && issue && (
              <>
                <motion.div
                  key="veil"
                  className="absolute inset-0"
                  style={{ background: 'var(--scrim)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={t()}
                  onClick={() => setOpen(null)}
                />
                <motion.div
                  key="drawer"
                  className="absolute inset-y-0 right-0 w-[230px]"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sheet)' }}
                  initial={{ x: 240 }}
                  animate={{ x: 0 }}
                  exit={{ x: 240 }}
                  transition={t(0.28)}
                >
                  <button aria-label="Close" onClick={() => setOpen(null)} className="absolute right-2 top-2 text-ink-4 hover:text-ink">
                    <X size={14} />
                  </button>
                  <IssueDetail i={issue} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CI.02 · overlay choice ───────────────────────────────────────────────
export function OverlayChoiceSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const [replying, setReplying] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(0);
  const msg = replying === null ? null : MAIL[replying];

  const clickRow = (i: number) => {
    if (mode === 'modal' && replying !== null) return;
    setReplying(i);
  };

  return (
    <Specimen
      height={320}
      readout={
        !msg ? 'Open a reply, then try to open another thread'
          : mode === 'modal'
            ? <>list: blocked · thread switches refused: {blocked}</>
            : <>list: live · click any row to retarget the reply</>
      }
      controls={
        <Segmented
          value={mode}
          onChange={(m) => { setMode(m); setReplying(null); setBlocked(0); }}
          options={[{ value: 'modal', label: 'Modal' }, { value: 'drawer', label: 'Drawer' }]}
        />
      }
    >
      <Window width={460} height={250}>
        <div
          className="relative flex min-h-0 flex-1"
          onKeyDown={(e) => { if (e.key === 'Escape' && msg) { e.stopPropagation(); setReplying(null); } }}
        >
          <div className="min-w-0 flex-1 overflow-y-auto">
            {MAIL.slice(0, 5).map((m, i) => (
              <Row key={m.subject} onClick={() => clickRow(i)} active={replying === i}>
                <span className="w-14 shrink-0 font-medium">{m.from}</span>
                <span className="truncate text-ink-3">{m.subject}</span>
              </Row>
            ))}
          </div>

          <AnimatePresence>
            {mode === 'drawer' && msg && (
              <motion.div
                key="drawer"
                className="flex w-[200px] shrink-0 flex-col gap-2 p-3"
                style={{ borderLeft: '0.5px solid var(--hairline)' }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={t()}
              >
                <Composer to={msg.from} onClose={() => setReplying(null)} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mode === 'modal' && msg && (
              <motion.div
                key="modal"
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--scrim)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={t(0.18)}
                onClick={() => setBlocked((b) => b + 1)}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="flex w-[240px] flex-col gap-2 rounded-[var(--r-md)] p-3"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={t(0.2)}
                >
                  <Composer to={msg.from} onClose={() => setReplying(null)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Window>
    </Specimen>
  );
}

function Composer({ to, onClose }: { to: string; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="t-sm text-ink-3">Reply to <span className="text-ink">{to}</span></span>
        <button aria-label="Close" onClick={onClose} className="text-ink-4 hover:text-ink"><X size={14} /></button>
      </div>
      <div className="h-16 rounded-[var(--r-sm)] p-2 t-sm text-ink-4" style={{ background: 'var(--surface-2)' }}>
        Thanks, looking now…
      </div>
      <button onClick={onClose} className="self-end rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
        Send
      </button>
    </>
  );
}

// ── DE.CI.03 · master-detail ────────────────────────────────────────────────
export function MasterDetailSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'modal' | 'split'>('modal');
  const [sel, setSel] = useState<number | null>(null);
  const [read, setRead] = useState<Set<number>>(new Set());
  const [actions, setActions] = useState(0);

  const reset = (m = mode) => { setMode(m); setSel(null); setRead(new Set()); setActions(0); };
  const open = (i: number) => {
    setActions((a) => a + 1);
    setSel(i);
    setRead((r) => new Set(r).add(i));
  };
  const close = () => { setActions((a) => a + 1); setSel(null); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && sel !== null && mode === 'modal') { e.stopPropagation(); close(); return; }
    if (mode !== 'split') return;
    if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); open(Math.min(MAIL.length - 1, (sel ?? -1) + 1)); }
    if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); open(Math.max(0, (sel ?? 1) - 1)); }
  };

  const done = read.size === MAIL.length;

  return (
    <Specimen
      height={320}
      focusable
      onKeyDown={onKey}
      readout={
        <>
          read {read.size}/{MAIL.length} · actions {actions}
          {done && <> · <span className="text-ink">{(actions / MAIL.length).toFixed(1)} per email</span></>}
          {mode === 'split' && !done && <> · or press <Kbd>J</Kbd> <Kbd>K</Kbd></>}
        </>
      }
      controls={
        <div className="flex items-center gap-2">
          <Segmented value={mode} onChange={(m) => reset(m)} options={[{ value: 'modal', label: 'Modal per row' }, { value: 'split', label: 'Master-detail' }]} />
          <button onClick={() => reset()} className="t-sm rounded-[var(--r-pill)] px-3 py-1.5 text-ink-3 hover:text-ink" style={{ background: 'var(--surface-2)' }}>Reset</button>
        </div>
      }
    >
      <Window width={480} height={250}>
        <div className="relative flex min-h-0 flex-1">
          <div className={`${mode === 'split' ? 'w-[200px] shrink-0' : 'flex-1'} overflow-y-auto`} style={{ borderRight: mode === 'split' ? '0.5px solid var(--hairline)' : undefined }}>
            {MAIL.map((m, i) => (
              <Row key={m.subject} onClick={() => open(i)} active={mode === 'split' && sel === i}>
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: read.has(i) ? 'transparent' : 'var(--accent)' }} />
                <span className="w-12 shrink-0 font-medium">{m.from}</span>
                <span className="truncate text-ink-3">{m.subject}</span>
              </Row>
            ))}
          </div>

          {mode === 'split' && (
            <div className="min-w-0 flex-1 p-3">
              <AnimatePresence mode="wait" initial={false}>
                {sel !== null ? (
                  <motion.div key={sel} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={t(0.15)}>
                    <Meta>{MAIL[sel].from}</Meta>
                    <div className="mt-1 t-sm font-medium text-ink">{MAIL[sel].subject}</div>
                    <p className="mt-2 t-sm text-ink-3">{MAIL[sel].body}</p>
                  </motion.div>
                ) : (
                  <div className="flex h-full items-center justify-center t-sm text-ink-4"><Inbox size={16} className="mr-2" />Select an email</div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {mode === 'modal' && sel !== null && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--scrim)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={t(0.18)}
                onClick={close}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="w-[260px] rounded-[var(--r-md)] p-3"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.96 }}
                  transition={t(0.2)}
                >
                  <div className="flex items-start justify-between">
                    <Meta>{MAIL[sel].from}</Meta>
                    <button aria-label="Close" onClick={close} className="text-ink-4 hover:text-ink"><X size={14} /></button>
                  </div>
                  <div className="mt-1 t-sm font-medium text-ink">{MAIL[sel].subject}</div>
                  <p className="mt-2 t-sm text-ink-3">{MAIL[sel].body}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Window>
    </Specimen>
  );
}

// ── DE.CI.04 · keyboard-first ───────────────────────────────────────────────
const PEOPLE = ['Ana', 'Dev', 'Mira', 'Sam'];
const TASKS = ['Fix login redirect', 'Ship CSV export', 'Audit dark mode'];

export function KeyboardFirstSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'mouse' | 'keyboard'>('keyboard');
  const [who, setWho] = useState<(string | null)[]>([null, null, null]);
  const [cur, setCur] = useState(0);
  const [menu, setMenu] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [stats, setStats] = useState({ px: 0, clicks: 0, keys: 0 });
  const [trail, setTrail] = useState<string[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const reset = (m = mode) => {
    setMode(m); setWho([null, null, null]); setCur(0); setMenu(null); setQ('');
    setStats({ px: 0, clicks: 0, keys: 0 }); setTrail([]); last.current = null;
  };

  const assign = (task: number, p: string) => {
    setWho((w) => w.map((x, i) => (i === task ? p : x)));
    setMenu(null); setQ('');
  };

  const matches = PEOPLE.filter((p) => p.toLowerCase().startsWith(q.toLowerCase()));

  const onKey = (e: React.KeyboardEvent) => {
    if (mode !== 'keyboard' || e.metaKey || e.ctrlKey) return;
    const k = e.key;
    const label = k === 'Enter' ? '↵' : k === 'Escape' ? 'Esc' : k.length === 1 ? k.toUpperCase() : null;
    if (!label) return;
    e.preventDefault();
    e.stopPropagation();
    setStats((s) => ({ ...s, keys: s.keys + 1 }));
    setTrail((tr) => [...tr.slice(-7), label]);
    if (menu !== null) {
      if (k === 'Escape') { setMenu(null); setQ(''); }
      else if (k === 'Enter' && matches[0]) { assign(menu, matches[0]); setCur((c) => Math.min(TASKS.length - 1, c + 1)); }
      else if (k === 'Backspace') setQ((s) => s.slice(0, -1));
      else if (/^[a-z]$/i.test(k)) setQ((s) => s + k);
      return;
    }
    if (k === 'j') setCur((c) => Math.min(TASKS.length - 1, c + 1));
    if (k === 'k') setCur((c) => Math.max(0, c - 1));
    if (k === 'a') setMenu(cur);
  };

  const onMove = (e: React.MouseEvent) => {
    const p = { x: e.clientX, y: e.clientY };
    if (last.current) {
      const d = Math.hypot(p.x - last.current.x, p.y - last.current.y);
      setStats((s) => ({ ...s, px: s.px + d }));
    }
    last.current = p;
  };

  useEffect(() => { if (mode === 'keyboard') stage.current?.querySelector<HTMLElement>('[tabindex]')?.focus({ preventScroll: true }); }, [mode]);

  const done = who.every(Boolean);

  return (
    <div ref={stage}>
      <Specimen
        height={300}
        focusable
        onKeyDown={onKey}
        readout={
          <>
            pointer travel {Math.round(stats.px)}px · clicks {stats.clicks} · keys {stats.keys}
            {done && <> · <span className="text-ink">all assigned</span></>}
          </>
        }
        controls={
          <div className="flex items-center gap-2">
            <Segmented value={mode} onChange={(m) => reset(m)} options={[{ value: 'mouse', label: 'Mouse only' }, { value: 'keyboard', label: 'Keyboard-first' }]} />
            <button onClick={() => reset()} className="t-sm rounded-[var(--r-pill)] px-3 py-1.5 text-ink-3 hover:text-ink" style={{ background: 'var(--surface-2)' }}>Reset</button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3" onMouseMove={onMove} onClickCapture={() => setStats((s) => ({ ...s, clicks: s.clicks + 1 }))}>
          <Window width={380} clip={false}>
            {TASKS.map((task, i) => (
              <div
                key={task}
                className="relative flex items-center justify-between px-3 py-2.5 t-sm"
                style={{
                  borderBottom: '0.5px solid var(--hairline-2)',
                  background: mode === 'keyboard' && cur === i ? 'var(--surface-2)' : undefined,
                }}
              >
                <span className="text-ink">{task}</span>
                <button
                  onClick={() => setMenu(menu === i ? null : i)}
                  className="flex items-center gap-1.5 rounded-[var(--r-pill)] px-2 py-0.5 t-sm"
                  style={{ color: who[i] ? 'var(--ink)' : 'var(--ink-4)', border: '0.5px dashed var(--hairline)' }}
                >
                  {who[i] ?? 'Assign'}
                </button>
                <AnimatePresence>
                  {menu === i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={t(0.15)}
                      className="absolute right-2 top-full z-10 w-[140px] overflow-hidden rounded-[var(--r-md)] p-1"
                      style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)', transformOrigin: 'top right' }}
                    >
                      {mode === 'keyboard' && (
                        <div className="px-2 py-1 t-sm text-ink" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                          {q || <span className="text-ink-4">Type a name</span>}
                        </div>
                      )}
                      {matches.map((p, j) => (
                        <button
                          key={p}
                          onClick={() => assign(i, p)}
                          className="block w-full rounded-[var(--r-sm)] px-2 py-1 text-left t-sm hover:bg-[var(--surface-2)]"
                          style={{ background: mode === 'keyboard' && j === 0 ? 'var(--surface-2)' : undefined }}
                        >
                          {p}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </Window>
          <div className="flex h-6 items-center gap-1">
            {mode === 'keyboard'
              ? trail.length
                ? trail.map((k, i) => <Kbd key={i + k + trail.length}>{k}</Kbd>)
                : <span className="t-sm text-ink-4"><Kbd>J</Kbd> <Kbd>K</Kbd> move · <Kbd>A</Kbd> assign · type · <Kbd>↵</Kbd></span>
              : <span className="t-sm text-ink-4">Assign all three with the mouse</span>}
          </div>
        </div>
      </Specimen>
    </div>
  );
}

// ── DE.CI.05 · four states ──────────────────────────────────────────────────
type LoadState = 'empty' | 'spinner' | 'skeleton' | 'error' | 'ready';

const PROJECTS = ['Checkout v3', 'Onboarding flow', 'Billing settings', 'Search results'];

export function FourStatesSpecimen() {
  const { t } = useMotion();
  const [state, setState] = useState<LoadState>('skeleton');
  const card = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState<number | null>(null);
  const before = useRef(0);
  const timer = useRef(0);

  const go = (s: LoadState) => {
    window.clearTimeout(timer.current);
    setState(s);
    setShift(null);
    if (s === 'spinner' || s === 'skeleton') {
      timer.current = window.setTimeout(() => {
        before.current = card.current?.offsetHeight ?? 0;
        setState('ready');
        timer.current = window.setTimeout(() => setShift(Math.abs((card.current?.offsetHeight ?? 0) - before.current)), 350);
      }, 1400);
    }
  };

  useEffect(() => {
    go('skeleton');
    return () => window.clearTimeout(timer.current);
  }, []);

  const note: Record<LoadState, React.ReactNode> = {
    empty: <><Dot tone="good" /> teaches the first action</>,
    spinner: <><Dot tone="warn" /> reserves nothing, loading…</>,
    skeleton: <><Dot tone="good" /> reserves the layout, loading…</>,
    error: <><Dot tone="good" /> says what broke and how to retry</>,
    ready: shift === null ? <>4 projects</> : <>loaded · layout shift <span className={shift > 0 ? 'text-[var(--anti)]' : 'text-ink'}>{shift}px</span></>,
  };

  return (
    <Specimen
      height={300}
      readout={note[state]}
      controls={
        <Segmented
          value={state === 'ready' ? ('ready' as LoadState) : state}
          onChange={go}
          options={[
            { value: 'empty', label: 'Empty' },
            { value: 'spinner', label: 'Spinner' },
            { value: 'skeleton', label: 'Skeleton' },
            { value: 'error', label: 'Error' },
            { value: 'ready', label: 'Ready' },
          ]}
        />
      }
    >
      <div className="flex h-full w-full items-start justify-center pt-8">
        <Window width={320}>
          <div ref={card}>
            <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
              <span className="t-sm font-medium text-ink">Projects</span>
              <Plus size={14} className="text-ink-4" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t(0.15)}>
                {state === 'ready' &&
                  PROJECTS.map((p) => (
                    <div key={p} className="flex h-10 items-center justify-between px-3 t-sm" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                      <span className="text-ink">{p}</span>
                      <ChevronRight size={14} className="text-ink-4" />
                    </div>
                  ))}
                {state === 'skeleton' &&
                  PROJECTS.map((p, i) => (
                    <div key={p} className="flex h-10 items-center justify-between px-3" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                      <motion.span
                        className="h-[10px] rounded-full"
                        style={{ width: `${55 - i * 7}%`, background: 'var(--surface-2)' }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    </div>
                  ))}
                {state === 'spinner' && (
                  <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-ink-4" /></div>
                )}
                {state === 'empty' && (
                  <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
                    <div className="t-sm font-medium text-ink">No projects yet</div>
                    <div className="t-sm text-ink-3">Projects hold your screens and their reviews.</div>
                    <button onClick={() => go('skeleton')} className="mt-1 rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
                      New project
                    </button>
                  </div>
                )}
                {state === 'error' && (
                  <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
                    <div className="t-sm font-medium text-ink">Couldn't load projects</div>
                    <div className="t-sm text-ink-3">The server took longer than 10s. Your work is safe.</div>
                    <button onClick={() => go('skeleton')} className="mt-1 rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium" style={{ border: '0.5px solid var(--hairline)', color: 'var(--ink)' }}>
                      Try again
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Window>
      </div>
    </Specimen>
  );
}

// ── DE.CI.06 · optimistic UI ────────────────────────────────────────────────
type Req = { n: number; status: 'pending' | 200 | 500 };
const LATENCY = 800;

export function OptimisticSpecimen() {
  const { t, reduce } = useMotion();
  const [mode, setMode] = useState<'wait' | 'optimistic'>('wait');
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(41);
  const [pending, setPending] = useState(false);
  const [log, setLog] = useState<Req[]>([]);
  const [toast, setToast] = useState(false);
  const [shake, setShake] = useState(0);
  const n = useRef(0);

  const reset = (m = mode) => { setMode(m); setLiked(false); setCount(41); setPending(false); setLog([]); setToast(false); n.current = 0; };

  const tap = () => {
    if (pending && mode === 'wait') return;
    const id = ++n.current;
    const fails = id % 4 === 0;
    const next = !liked;
    setLog((l) => [{ n: id, status: 'pending' as const }, ...l].slice(0, 4));
    if (mode === 'optimistic') {
      setLiked(next); setCount((c) => c + (next ? 1 : -1));
    } else setPending(true);

    window.setTimeout(() => {
      setLog((l) => l.map((r) => (r.n === id ? { ...r, status: fails ? 500 : 200 } : r)));
      setPending(false);
      if (fails) {
        if (mode === 'optimistic') { setLiked(!next); setCount((c) => c + (next ? -1 : 1)); }
        setShake((s) => s + 1); setToast(true);
        window.setTimeout(() => setToast(false), 2200);
      } else if (mode === 'wait') {
        setLiked(next); setCount((c) => c + (next ? 1 : -1));
      }
    }, LATENCY);
  };

  return (
    <Specimen
      height={300}
      readout={<>felt latency: <span className="text-ink">{mode === 'wait' ? `${LATENCY}ms` : '0ms'}</span> · every 4th request fails</>}
      controls={<Segmented value={mode} onChange={(m) => reset(m)} options={[{ value: 'wait', label: 'Wait for server' }, { value: 'optimistic', label: 'Optimistic' }]} />}
    >
      <div className="flex w-full max-w-[460px] items-center justify-center gap-8 px-4">
        <motion.button
          key={shake}
          onClick={tap}
          animate={shake && !reduce ? { x: [0, -5, 5, -3, 3, 0] } : undefined}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2 rounded-[var(--r-pill)] px-4 py-2 t-sm font-medium"
          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--ink)' }}
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin text-ink-4" />
          ) : (
            <motion.span animate={{ scale: liked && !reduce ? [1, 1.25, 1] : 1 }} transition={t(0.25)} className="flex">
              <Heart size={16} fill={liked ? 'var(--anti)' : 'none'} style={{ color: liked ? 'var(--anti)' : 'var(--ink-3)' }} />
            </motion.span>
          )}
          <span className="t-mono">{count}</span>
        </motion.button>

        <div className="w-[190px] rounded-[var(--r-md)] p-2" style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline-2)' }}>
          <div className="flex justify-between px-1 pb-1.5 t-caption text-ink-4" style={{ letterSpacing: 0 }}>
            <span>Network</span><span>{n.current} {n.current === 1 ? 'request' : 'requests'}</span>
          </div>
          <div className="flex h-[96px] flex-col">
            {log.map((r) => (
              <div key={r.n} className="flex items-center justify-between px-1 py-1 t-caption t-mono" style={{ borderTop: '0.5px solid var(--hairline-2)', letterSpacing: 0 }}>
                <span className="text-ink-3">POST /like</span>
                <span style={{ color: r.status === 'pending' ? 'var(--ink-4)' : r.status === 200 ? 'var(--pattern)' : 'var(--anti)' }}>
                  {r.status === 'pending' ? '…' : r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={t()}
            className="absolute bottom-4 rounded-[var(--r-pill)] px-3 py-1.5 t-sm"
            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
          >
            {mode === 'optimistic' ? "Couldn't save. Your like was undone." : "Couldn't save. Try again."}
          </motion.div>
        )}
      </AnimatePresence>
    </Specimen>
  );
}

// ── DE.CI.07 · z-index budget ───────────────────────────────────────────────
const Z = {
  adhoc: { header: 9999, modal: 1000, toast: 50 },
  budget: { header: 100, modal: 300, toast: 400 },
};

export function ZIndexSpecimen() {
  const { t } = useMotion();
  const [mode, setMode] = useState<'adhoc' | 'budget'>('adhoc');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState(false);
  const z = Z[mode];

  const save = () => { setToast(true); window.setTimeout(() => setToast(false), 2600); };

  const ladder = (Object.entries(z) as [keyof typeof z, number][]).sort((a, b) => b[1] - a[1]);
  const intended = ['toast', 'modal', 'header'];
  const wrong = ladder.map(([k]) => k).join() !== intended.join();

  return (
    <Specimen
      height={320}
      readout={wrong ? <><Dot tone="bad" /> header paints over the modal, toast hides under the veil</> : <><Dot tone="good" /> every layer lands where it was meant to</>}
      controls={<Segmented value={mode} onChange={setMode} options={[{ value: 'adhoc', label: 'Ad-hoc z-index' }, { value: 'budget', label: 'Layer budget' }]} />}
    >
      <div
        className="flex items-center gap-6"
        onKeyDown={(e) => { if (e.key === 'Escape' && modal) { e.stopPropagation(); setModal(false); } }}
      >
        <Window width={320} height={250}>
          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div
              className="sticky top-0 flex items-center justify-between px-3 py-2.5"
              style={{ zIndex: z.header, background: 'var(--surface)', borderBottom: '0.5px solid var(--hairline)' }}
            >
              <span className="t-sm font-medium text-ink">Invoices</span>
              <MoreHorizontal size={14} className="text-ink-4" />
            </div>
            {['INV-1042', 'INV-1041', 'INV-1040', 'INV-1039', 'INV-1038', 'INV-1037'].map((inv) => (
              <div key={inv} className="flex items-center justify-between px-3 py-2.5 t-sm" style={{ borderBottom: '0.5px solid var(--hairline-2)' }}>
                <Meta>{inv}</Meta>
                <button onClick={() => setModal(true)} className="t-sm text-ink-3 hover:text-ink">Edit</button>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {modal && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: z.modal, background: 'var(--scrim)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={t(0.18)}
                onClick={() => setModal(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 flex w-[240px] flex-col gap-2 rounded-[var(--r-md)] p-3"
                  style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}
                >
                  <span className="t-sm font-medium text-ink">Edit invoice</span>
                  <div className="h-7 rounded-[var(--r-sm)]" style={{ background: 'var(--surface-2)' }} />
                  <button onClick={save} className="self-end rounded-[var(--r-pill)] px-3 py-1 t-sm font-medium" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
                    Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {toast && (
              <motion.div
                className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-[var(--r-pill)] px-3 py-1.5 t-sm"
                style={{ zIndex: z.toast, background: 'var(--ink)', color: 'var(--bg)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={t()}
              >
                <Check size={13} /> Invoice saved
              </motion.div>
            )}
          </AnimatePresence>
        </Window>

        <div className="hidden w-[130px] flex-col gap-1 sm:flex">
          <span className="t-caption pb-1 text-ink-4" style={{ letterSpacing: 0 }}>Paint order, top first</span>
          {ladder.map(([k, v], i) => (
            <motion.div
              layout
              transition={t()}
              key={k}
              className="flex items-center justify-between rounded-[var(--r-sm)] px-2 py-1 t-sm"
              style={{ background: 'var(--surface)', border: `0.5px solid ${k !== intended[i] ? 'var(--anti)' : 'var(--hairline-2)'}` }}
            >
              <span className="text-ink">{k}</span>
              <span className="t-mono text-ink-3">{v}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Specimen>
  );
}

export const CRAFT_INTERACTION_SPECIMENS: Record<string, React.FC> = {
  'de-ci-progressive-disclosure': ProgressiveDisclosureSpecimen,
  'de-ci-overlay-choice': OverlayChoiceSpecimen,
  'de-ci-master-detail': MasterDetailSpecimen,
  'de-ci-keyboard-first': KeyboardFirstSpecimen,
  'de-ci-four-states': FourStatesSpecimen,
  'de-ci-optimistic-ui': OptimisticSpecimen,
  'de-ci-z-index-budget': ZIndexSpecimen,
};
