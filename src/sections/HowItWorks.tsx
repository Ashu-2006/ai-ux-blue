import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';
import type { SubKind } from '@/lib/types';
import { KINDS } from '@/lib/copy';
import { SectionHeader } from './SectionHeader';

const ICON: Record<SubKind, typeof Lightbulb> = {
  model: Lightbulb,
  pattern: CheckCircle2,
  anti: AlertTriangle,
  invisible: EyeOff,
};

const ease = [0.23, 1, 0.32, 1] as const;

// The "How it works" steps section: explains the four kinds every idea is sorted
// into, one soft card each with its semantic color.
export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1120px] px-8 sm:px-14 lg:px-20 py-20 sm:py-24">
      <SectionHeader
        center
        eyebrow="How it works"
        title="Every idea is one of four kinds"
        blurb="So you always know what you are looking at — and what to do with it."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KINDS.map((k, i) => {
          const Icon = ICON[k.kind];
          const color = `var(--${k.varName})`;
          const tint = `var(--${k.varName}-tint)`;
          return (
            <motion.div
              key={k.kind}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease, delay: 0.06 * i }}
              className="card flex flex-col gap-3 p-5"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-[var(--r-md)]"
                style={{ background: tint, color }}
              >
                <Icon size={17} strokeWidth={2.2} />
              </span>
              <div className="t-caption t-mono uppercase" style={{ color }}>
                {String(i + 1).padStart(2, '0')} · {k.label}
              </div>
              <p className="t-body text-ink-2">{k.blurb}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
