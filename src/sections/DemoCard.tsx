import { useState } from 'react';
import { motion } from 'framer-motion';
import { allSubs } from '@/lib/data';
import { KIND_COLOR } from '@/lib/copy';
import { KIND_LABEL } from '@/lib/types';
import { SectionHeader } from './SectionHeader';

// A real sample idea to demo the card anatomy against.
const sample = allSubs.find((s) => s.sub.id === 'ai-agent-legibility-mm-0') ?? allSubs[0];

type Toggle = { key: 'kind' | 'oneLiner' | 'index'; label: string };
const TOGGLES: Toggle[] = [
  { key: 'kind', label: 'Kind pill' },
  { key: 'oneLiner', label: 'One-liner' },
  { key: 'index', label: 'Index' },
];

const ease = [0.23, 1, 0.32, 1] as const;

// Signature interactive demo, in the spirit of interfaces.dev's live "Hide guides"
// card: flip the anatomy of a real idea card on and off and watch it update.
export function DemoCard() {
  const [on, setOn] = useState<Record<Toggle['key'], boolean>>({
    kind: true,
    oneLiner: true,
    index: true,
  });
  const color = KIND_COLOR[sample.sub.kind];

  return (
    <section className="mx-auto max-w-[1120px] px-8 sm:px-14 lg:px-20 py-20 sm:py-24">
      <SectionHeader
        center
        eyebrow="Interactive"
        title="Anatomy of an idea"
        blurb="Every card carries the same parts. Toggle them to see what each one does for you."
      />

      <div className="mx-auto mt-12 grid max-w-[860px] grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
        {/* the live sample card */}
        <motion.div layout className="card mx-auto w-full max-w-[380px] p-5" style={{ borderRadius: 'var(--r-lg)' }}>
          <div className="flex items-center justify-between">
            {on.kind ? (
              <span className="kind-pill text-ink-2">
                <span className="kind-dot" style={{ background: color }} />
                {KIND_LABEL[sample.sub.kind]}
              </span>
            ) : (
              <span className="t-caption t-mono uppercase text-ink-4">idea</span>
            )}
            {on.index && (
              <span className="t-sm t-mono text-ink-4">01</span>
            )}
          </div>

          <h3 className="t-h2 mt-3 text-ink" style={{ fontWeight: 540 }}>
            {sample.sub.label}
          </h3>

          {on.oneLiner && (
            <p className="t-body mt-2 text-ink-3">{sample.sub.oneLiner}</p>
          )}

          <div className="mt-4 t-caption t-mono uppercase text-ink-4">
            {sample.topicTitle}
          </div>
        </motion.div>

        {/* the toggle rail */}
        <div className="flex flex-row flex-wrap justify-center gap-2 md:flex-col md:items-stretch">
          {TOGGLES.map((t) => {
            const active = on[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setOn((o) => ({ ...o, [t.key]: !o[t.key] }))}
                aria-pressed={active}
                className="btn pressable !justify-between !gap-3 !px-3.5 !py-2 t-sm"
                style={{
                  background: active ? 'var(--accent-tint)' : 'var(--surface)',
                  color: active ? 'var(--accent)' : 'var(--ink-2)',
                  border: `0.5px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {t.label}
                <span
                  className="relative inline-flex h-4 w-7 items-center rounded-full transition-colors"
                  style={{ background: active ? 'var(--accent)' : 'var(--ink-4)' }}
                >
                  <span
                    className="absolute h-3 w-3 rounded-full bg-white transition-all"
                    style={{ left: active ? '14px' : '2px' }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
