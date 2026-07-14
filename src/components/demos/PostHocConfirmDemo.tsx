import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ArrowUp, RotateCcw } from 'lucide-react';

type Mode = 'bad' | 'good';
type Phase = 'idle' | 'confirming' | 'sent';

// A restrained, real-looking wallet "Send" card. De-slopped per the taste-skill:
// no mesh/aurora gradient, no purple blob avatar, no outer glow, no decorative
// status pill. One accent, flat neutral surfaces, a real ETH mark, honest copy.
// BAD: the transfer fires on Send, the confirm shows after (Cancel is dead).
// GOOD: the confirm gates before the send.
export function PostHocConfirmDemo() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>('bad');
  const [phase, setPhase] = useState<Phase>('idle');
  const [cancelDead, setCancelDead] = useState(false);

  // calmer spring: near critically-damped, no bounce (Apple default)
  const spring = reduce ? { duration: 0.16 } : { type: 'spring' as const, bounce: 0, duration: 0.42 };

  const reset = (m: Mode = mode) => {
    setMode(m);
    setPhase('idle');
    setCancelDead(false);
  };

  const onSend = () => {
    if (phase !== 'idle') return;
    setPhase('confirming'); // bad: money already gone (see stamp); good: nothing sent yet
  };
  const onConfirm = () => setPhase('sent');
  const onCancel = () => {
    if (mode === 'bad') {
      setCancelDead(true);
      setTimeout(() => { setCancelDead(false); setPhase('sent'); }, 1100);
    } else {
      reset('good');
    }
  };

  const alreadyGone = mode === 'bad' && (phase === 'confirming' || phase === 'sent');

  return (
    <div className="flex flex-col gap-5">
      {/* honest segmented control */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-[var(--r-md)] p-0.5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
          <Seg active={mode === 'bad'} onClick={() => reset('bad')}>Confirm after</Seg>
          <Seg active={mode === 'good'} onClick={() => reset('good')}>Confirm before</Seg>
        </div>
        <button
          onClick={() => reset()}
          className="pressable flex items-center gap-1.5 t-sm text-ink-3"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* ── record stage: flat neutral, no gradient ── */}
      <div
        data-record-stage
        className="flex items-center justify-center rounded-[var(--r-xl)] px-6 py-9"
        style={{ background: 'var(--bg)', border: '0.5px solid var(--hairline)' }}
      >
        {/* the wallet Send card */}
        <div
          className="relative w-full max-w-[340px] overflow-hidden rounded-[var(--r-lg)]"
          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}
        >
          {/* card header row */}
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="t-sm font-semibold text-ink">Send</span>
            <span className="t-sm text-ink-4">Ethereum</span>
          </div>

          {/* amount block. mock sample data (illustrative, not real figures) */}
          <div className="flex flex-col items-center px-5 py-6">
            <EthMark />
            <div className="mt-3.5 flex items-baseline gap-1.5">
              <span className="t-mono leading-none text-ink" style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>2.5</span>
              <span className="t-lg font-medium text-ink-3">ETH</span>
            </div>
            <div className="t-sm mt-1 text-ink-4">$8,240 at $3,296/ETH</div>
          </div>

          {/* recipient row (real address, no avatar blob) */}
          <div className="flex items-center justify-between border-t px-5 py-3.5" style={{ borderColor: 'var(--hairline)' }}>
            <span className="t-sm text-ink-3">To</span>
            <span className="t-sm t-mono text-ink">0x8f4a…c3d1</span>
          </div>
          <div className="flex items-center justify-between border-t px-5 py-3.5" style={{ borderColor: 'var(--hairline)' }}>
            <span className="t-sm text-ink-3">Network fee</span>
            <span className="t-sm t-mono text-ink">0.0012 ETH</span>
          </div>

          {/* action */}
          <div className="border-t px-5 py-4" style={{ borderColor: 'var(--hairline)' }}>
            <AnimatePresence mode="wait">
              {phase === 'sent' ? (
                <motion.div
                  key="done"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={spring}
                  className="flex items-center justify-center gap-2 rounded-[var(--r-md)] py-3"
                  style={{ background: 'var(--pattern-tint)', color: 'var(--pattern)' }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span className="t-body font-semibold">Transaction sent</span>
                </motion.div>
              ) : (
                <motion.button
                  key="send"
                  onClick={onSend}
                  disabled={phase !== 'idle'}
                  className="pressable w-full rounded-[var(--r-md)] py-3 t-body font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  Send
                </motion.button>
              )}
            </AnimatePresence>

            {/* honest "already gone" line: only in the bug, only after click */}
            <AnimatePresence>
              {alreadyGone && (
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="mt-2.5 flex items-center justify-center gap-1.5 t-sm"
                  style={{ color: 'var(--anti)' }}
                >
                  <ArrowUp size={13} strokeWidth={2.5} />
                  Broadcast on-chain the moment you tapped Send
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* confirm sheet: same visual both modes, only the ORDER differs */}
          <AnimatePresence>
            {phase === 'confirming' && (
              <motion.div
                className="absolute inset-0 flex items-end"
                style={{ background: 'color-mix(in srgb, var(--ink) 22%, transparent)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
              >
                {/* bottom-sheet style confirm, like a real wallet */}
                <motion.div
                  className="w-full rounded-t-[var(--r-lg)] px-5 pb-5 pt-5"
                  style={{ background: 'var(--surface)', borderTop: '0.5px solid var(--hairline)', boxShadow: 'var(--shadow-float)' }}
                  initial={reduce ? { opacity: 0 } : { y: '100%' }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: '100%' }}
                  transition={reduce ? { duration: 0.16 } : { type: 'spring', bounce: 0, duration: 0.4 }}
                >
                  <div className="t-body font-semibold text-ink">Confirm transfer</div>
                  <div className="t-sm mt-1 text-ink-3">2.5 ETH to 0x8f4a…c3d1. This can&rsquo;t be reversed.</div>
                  <div className="mt-4 flex gap-2.5">
                    <button
                      onClick={onCancel}
                      className="pressable flex-1 rounded-[var(--r-md)] py-2.5 t-sm font-medium"
                      style={{
                        background: cancelDead ? 'var(--anti-tint)' : 'var(--surface-2)',
                        color: cancelDead ? 'var(--anti)' : 'var(--ink-2)',
                        border: '0.5px solid var(--hairline)',
                      }}
                    >
                      {cancelDead ? 'Nothing to cancel' : 'Cancel'}
                    </button>
                    <button
                      onClick={onConfirm}
                      className="pressable flex-1 rounded-[var(--r-md)] py-2.5 t-sm font-semibold text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* caption strip: the mechanism, honest */}
      <div className="rounded-[var(--r-md)] px-4 py-3.5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: mode === 'bad' ? 'var(--anti)' : 'var(--pattern)' }} />
          <span className="t-sm font-semibold" style={{ color: mode === 'bad' ? 'var(--anti)' : 'var(--pattern)' }}>
            {mode === 'bad' ? 'The send fires first' : 'The gate fires first'}
          </span>
        </div>
        <p className="t-body mt-2 text-ink-2">
          {mode === 'bad' ? (
            <>Tap Send and the ETH broadcasts right away. The confirm slides up a beat later, so Cancel has
            nothing left to stop. Same shape as a real wallet where the signature already went through.</>
          ) : (
            <>The confirm slides up before anything is sent. Cancel keeps the funds put; Confirm is the moment
            the transfer actually fires.</>
          )}
        </p>
      </div>
    </div>
  );
}

// Real Ethereum diamond mark (not a generic gradient blob avatar)
function EthMark() {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full"
      style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
    >
      <svg width="20" height="20" viewBox="0 0 256 417" aria-hidden fill="none">
        <path d="M127.96 0 125.16 9.5v275.7l2.8 2.79 127.96-75.64z" fill="var(--ink-3)" />
        <path d="M127.96 0 0 212.32l127.96 75.64V154.16z" fill="var(--ink)" />
        <path d="m127.96 312.19-1.58 1.92v98.2l1.58 4.6L256 236.59z" fill="var(--ink-3)" />
        <path d="M127.96 416.9v-104.7L0 236.59z" fill="var(--ink)" />
        <path d="m127.96 287.96 127.96-75.64-127.96-58.16z" fill="var(--ink-4)" />
        <path d="m0 212.32 127.96 75.64V154.16z" fill="var(--ink-3)" />
      </svg>
    </div>
  );
}

function Seg({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="pressable rounded-[calc(var(--r-md)-2px)] px-3.5 py-1.5 t-sm font-medium"
      style={{
        background: active ? 'var(--surface)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        boxShadow: active ? 'var(--shadow-card)' : 'none',
      }}
    >
      {children}
    </button>
  );
}
