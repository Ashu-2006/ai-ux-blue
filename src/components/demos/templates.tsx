import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';

// Reusable, de-slopped interactive demo templates mapped by sub-topic kind.
// Not bespoke like the pilot, but real, calm, and screen-recordable: flat
// neutral stages, one accent, no glow, no mesh gradient, no candy pills.

const spring = (reduce: boolean) =>
  reduce ? { duration: 0.16 } : ({ type: 'spring', bounce: 0, duration: 0.42 } as const);

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[220px] items-center justify-center rounded-[var(--r-xl)] px-6 py-9"
      style={{ background: 'var(--bg)', border: '0.5px solid var(--hairline)' }}
    >
      {children}
    </div>
  );
}

function Toggle({
  a, b, on, set,
}: { a: string; b: string; on: 'a' | 'b'; set: (v: 'a' | 'b') => void }) {
  return (
    <div className="inline-flex rounded-[var(--r-md)] p-0.5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
      {(['a', 'b'] as const).map((k) => (
        <button
          key={k}
          onClick={() => set(k)}
          className="pressable rounded-[calc(var(--r-md)-2px)] px-3.5 py-1.5 t-sm font-medium"
          style={{
            background: on === k ? 'var(--surface)' : 'transparent',
            color: on === k ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: on === k ? 'var(--shadow-card)' : 'none',
          }}
        >
          {k === 'a' ? a : b}
        </button>
      ))}
    </div>
  );
}

function Caption({ good, children }: { good: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--r-md)] px-4 py-3.5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
      <span className="t-sm font-semibold" style={{ color: good ? 'var(--pattern)' : 'var(--anti)' }}>
        {good ? 'The fix' : 'The failure'}
      </span>
      <p className="t-body mt-1.5 text-ink-2">{children}</p>
    </div>
  );
}

// ── confirm-order: an action fires before vs after a confirm (anti-patterns) ──
export function ConfirmOrderDemo() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<'a' | 'b'>('a'); // a = after (bug), b = before (fix)
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'done'>('idle');
  const [dead, setDead] = useState(false);
  const bug = mode === 'a';
  const reset = (m: 'a' | 'b' = mode) => { setMode(m); setPhase('idle'); setDead(false); };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Toggle a="Act, then confirm" b="Confirm, then act" on={mode} set={(v) => reset(v)} />
        <button onClick={() => reset()} className="pressable flex items-center gap-1.5 t-sm text-ink-3"><RotateCcw size={13} /> Reset</button>
      </div>
      <Stage>
        <div className="relative w-full max-w-[300px] rounded-[var(--r-lg)] p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}>
          <div className="t-sm text-ink-3">Delete workspace</div>
          <div className="t-lg mt-1 font-semibold text-ink">Acme Production</div>
          <div className="mt-5">
            {phase === 'done' ? (
              <div className="flex items-center justify-center gap-2 rounded-[var(--r-md)] py-2.5" style={{ background: 'var(--pattern-tint)', color: 'var(--pattern)' }}>
                <Check size={15} strokeWidth={2.5} /><span className="t-sm font-semibold">Done</span>
              </div>
            ) : (
              <button onClick={() => setPhase('confirm')} className="pressable w-full rounded-[var(--r-md)] py-2.5 t-sm font-semibold text-white" style={{ background: 'var(--anti)' }}>Delete</button>
            )}
          </div>
          {bug && phase !== 'idle' && (
            <div className="mt-2.5 text-center t-sm" style={{ color: 'var(--anti)' }}>Row deleted the moment you clicked</div>
          )}
          <AnimatePresence>
            {phase === 'confirm' && (
              <motion.div className="absolute inset-0 flex items-end" style={{ background: 'color-mix(in srgb, var(--ink) 20%, transparent)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
                <motion.div className="w-full rounded-t-[var(--r-lg)] p-4" style={{ background: 'var(--surface)', borderTop: '0.5px solid var(--hairline)', boxShadow: 'var(--shadow-float)' }} initial={reduce ? { opacity: 0 } : { y: '100%' }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={reduce ? { opacity: 0 } : { y: '100%' }} transition={spring(!!reduce)}>
                  <div className="t-sm font-semibold text-ink">Delete Acme Production?</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { if (bug) { setDead(true); setTimeout(() => { setDead(false); setPhase('done'); }, 1000); } else reset(mode); }} className="pressable flex-1 rounded-[var(--r-md)] py-2 t-sm font-medium" style={{ background: dead ? 'var(--anti-tint)' : 'var(--surface-2)', color: dead ? 'var(--anti)' : 'var(--ink-2)', border: '0.5px solid var(--hairline)' }}>{dead ? 'Nothing to cancel' : 'Cancel'}</button>
                    <button onClick={() => setPhase('done')} className="pressable flex-1 rounded-[var(--r-md)] py-2 t-sm font-semibold text-white" style={{ background: 'var(--anti)' }}>Confirm</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Stage>
      <Caption good={!bug}>
        {bug
          ? 'The delete runs the instant you click. The confirm slides up after, so Cancel has nothing left to stop.'
          : 'The confirm gates the delete. Cancel keeps the workspace; Confirm is the moment it actually goes.'}
      </Caption>
    </div>
  );
}

// ── state-machine: a region that shows (or collapses) its real states (invisible problems) ──
const STATES = ['loading', 'empty', 'error', 'success'] as const;
type St = (typeof STATES)[number];
export function StateMachineDemo() {
  const [mode, setMode] = useState<'a' | 'b'>('a'); // a = collapsed (bug), b = distinct (fix)
  const [st, setSt] = useState<St>('loading');
  const bug = mode === 'a';
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Toggle a="One blank state" b="Distinct states" on={mode} set={setMode} />
        <div className="flex gap-1">
          {STATES.map((s) => (
            <button key={s} onClick={() => setSt(s)} className="pressable rounded-[var(--r-sm)] px-2.5 py-1 t-caption font-medium" style={{ background: st === s ? 'var(--accent-tint)' : 'var(--surface-2)', color: st === s ? 'var(--accent)' : 'var(--ink-3)', border: '0.5px solid var(--hairline)' }}>{s}</button>
          ))}
        </div>
      </div>
      <Stage>
        <div className="flex w-full max-w-[300px] items-center justify-center rounded-[var(--r-lg)] p-6" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)', minHeight: 120 }}>
          {bug ? (
            <div className="t-sm text-ink-4">{st === 'loading' ? '' : 'No data'}</div>
          ) : (
            <StateView st={st} />
          )}
        </div>
      </Stage>
      <Caption good={!bug}>
        {bug
          ? 'Every state collapses to the same blank panel. The user cannot tell loading from empty from a failed request, so they invent the scariest reading.'
          : 'Each state gets its own render: a skeleton, a real empty message, an error with retry, the ideal result. The panel never lies about what happened.'}
      </Caption>
    </div>
  );
}
function StateView({ st }: { st: St }) {
  if (st === 'loading') return <div className="h-3 w-32 animate-pulse rounded-full" style={{ background: 'var(--surface-2)' }} />;
  if (st === 'empty') return <div className="t-sm text-ink-3">Nothing here yet. Add your first item.</div>;
  if (st === 'error') return <div className="flex items-center gap-2 t-sm" style={{ color: 'var(--anti)' }}><AlertCircle size={14} /> Request failed. Retry</div>;
  return <div className="flex items-center gap-2 t-sm" style={{ color: 'var(--pattern)' }}><Check size={14} strokeWidth={2.5} /> 3 results loaded</div>;
}

// ── loop-close: an action that dead-ends vs routes to the next step (patterns) ──
export function LoopCloseDemo() {
  const [mode, setMode] = useState<'a' | 'b'>('a'); // a = dead end (bug), b = closes loop (fix)
  const [done, setDone] = useState(false);
  const bug = mode === 'a';
  return (
    <div className="flex flex-col gap-5">
      <Toggle a="Fire and forget" b="Close the loop" on={mode} set={(v) => { setMode(v); setDone(false); }} />
      <Stage>
        <div className="w-full max-w-[300px] rounded-[var(--r-lg)] p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}>
          {!done ? (
            <button onClick={() => setDone(true)} className="pressable w-full rounded-[var(--r-md)] py-2.5 t-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Publish</button>
          ) : (
            <div>
              <div className="flex items-center gap-2 t-sm font-semibold" style={{ color: 'var(--pattern)' }}><Check size={15} strokeWidth={2.5} /> Published</div>
              {bug ? (
                <div className="mt-2 t-sm text-ink-4">(nothing happens next)</div>
              ) : (
                <button className="pressable mt-3 flex w-full items-center justify-center gap-1.5 rounded-[var(--r-md)] py-2 t-sm font-medium" style={{ background: 'var(--surface-2)', color: 'var(--ink)', border: '0.5px solid var(--hairline)' }}>Share the link <ArrowRight size={13} /></button>
              )}
            </div>
          )}
        </div>
      </Stage>
      <Caption good={!bug}>
        {bug
          ? 'The action succeeds and the flow ends. The user is stranded on a success screen with no path to what they actually came to do next.'
          : 'Success routes straight into the next intent. The loop closes: the user is handed the obvious next action instead of a dead end.'}
      </Caption>
    </div>
  );
}
