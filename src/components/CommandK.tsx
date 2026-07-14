import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search } from 'lucide-react';
import { allSubs, topics } from '@/lib/data';
import { KIND_LABEL, type SubKind } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (payload: { topicKey: string; subId?: string; focusId?: string }) => void;
}

const KIND_FG: Record<SubKind, string> = {
  model: 'var(--model)',
  pattern: 'var(--pattern)',
  anti: 'var(--anti)',
  invisible: 'var(--invisible)',
};

export function CommandK({ open, onClose, onPick }: Props) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let pool = allSubs;
    if (filter) pool = pool.filter((s) => s.topicId === filter);
    if (!needle) return pool.slice(0, 80);
    return pool
      .filter(
        (s) =>
          s.sub.label.toLowerCase().includes(needle) ||
          s.sub.oneLiner.toLowerCase().includes(needle) ||
          s.topicTitle.toLowerCase().includes(needle),
      )
      .slice(0, 80);
  }, [q, filter]);

  useEffect(() => setActive(0), [q, filter]);

  const pick = (i: number) => {
    const r = results[i];
    if (!r) return;
    onPick({ topicKey: r.topicId, subId: r.sub.id, focusId: r.sub.id });
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  // Modal: centered, so transform-origin center; start at 0.96 not 0 (skill).
  const panelEnter = reduce
    ? { type: 'tween' as const, duration: 0.16 }
    : { type: 'spring' as const, bounce: 0.16, duration: 0.42 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55]"
            style={{ background: 'var(--scrim)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-[11vh] z-[56] w-[92vw] max-w-[620px] -translate-x-1/2"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8, filter: 'blur(6px)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6, filter: 'blur(4px)' }}
            transition={panelEnter}
            style={{ transformOrigin: 'center top' }}
          >
            <div
              className="material-strong overflow-hidden rounded-[var(--r-xl)]"
              style={{ boxShadow: 'var(--shadow-float)', border: '0.5px solid var(--hairline)' }}
            >
              <div className="flex items-center gap-3 px-5 py-4" style={{ boxShadow: '0 0.5px 0 var(--hairline-2)' }}>
                <Search size={17} className="text-ink-4" strokeWidth={2.2} />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search 256 sub-topics"
                  className="t-lg vibrant w-full bg-transparent text-ink outline-none placeholder:text-ink-4"
                />
                <kbd
                  className="t-caption rounded-[var(--r-sm)] px-1.5 py-0.5 text-ink-4"
                  style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
                >esc</kbd>
              </div>

              {/* filter chips */}
              <div className="scroll flex gap-1.5 overflow-x-auto px-4 py-2.5" style={{ boxShadow: '0 0.5px 0 var(--hairline-2)' }}>
                <Chip label="All" active={filter === null} onClick={() => setFilter(null)} />
                {topics.map((t) => (
                  <Chip key={t.id} label={t.title} active={filter === t.id} onClick={() => setFilter(filter === t.id ? null : t.id)} />
                ))}
              </div>

              <div ref={listRef} className="scroll max-h-[54vh] overflow-y-auto py-2">
                {results.length === 0 && (
                  <div className="t-body px-5 py-10 text-center text-ink-3">No matches.</div>
                )}
                {results.map((r, i) => (
                  <button
                    key={r.sub.id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(i)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ background: i === active ? 'var(--accent-tint)' : 'transparent' }}
                  >
                    <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_FG[r.sub.kind] }} />
                    <span className="min-w-0 flex-1">
                      <span className="t-body block truncate text-ink">{r.sub.label}</span>
                      <span className="t-sm block truncate text-ink-4">
                        <span style={{ color: KIND_FG[r.sub.kind] }}>{KIND_LABEL[r.sub.kind]}</span>
                        {'  ·  '}{r.topicTitle}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="t-sm pressable shrink-0 rounded-[var(--r-pill)] px-3 py-1"
      style={{
        background: active ? 'var(--accent)' : 'var(--surface-2)',
        color: active ? '#fff' : 'var(--ink-2)',
        border: '0.5px solid var(--hairline)',
      }}
    >
      {label}
    </button>
  );
}
