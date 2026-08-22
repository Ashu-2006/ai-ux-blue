import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { roadmap } from '@/lib/data';

interface Props {
  onSearch: () => void;
  onExplore: () => void;
}

const ease = [0.23, 1, 0.32, 1] as const;
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.06 * i } }),
};
// annotation tags fade in a beat later, like a design tool drawing its guides
const anno = {
  hidden: { opacity: 0 },
  show: (i: number) => ({ opacity: 1, transition: { duration: 0.5, ease, delay: 0.6 + 0.12 * i } }),
};

// interfaces.dev hero: a layered, mixed-type display headline presented like an
// annotated design canvas — floating Figma-style labels connected by dotted lines
// to parts of the composition. Annotations are relevant to OUR content.
export function Hero({ onSearch, onExplore }: Props) {
  return (
    <section className="relative mx-auto max-w-[1180px] px-8 sm:px-14 lg:px-20 pb-24 pt-36 sm:pt-44">
      {/* the annotated composition, left-anchored like the reference */}
      <div className="relative mx-auto max-w-[880px]">
        {/* ── the layered headline ── */}
        <div className="relative z-10">
          <motion.div custom={0} variants={rise} initial="hidden" animate="show">
            <span
              className="t-hero inline-block text-ink"
              style={{ textDecoration: 'underline', textDecorationColor: 'var(--accent)', textUnderlineOffset: '8px', textDecorationThickness: '2px' }}
            >
              Designing
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={rise} initial="hidden" animate="show" className="t-hero text-ink">
            on top of AI models,
          </motion.h1>

          <motion.div custom={2} variants={rise} initial="hidden" animate="show">
            <span className="t-hero t-serif" style={{ color: 'var(--ink)', fontWeight: 500 }}>
              interfaces.
            </span>
          </motion.div>
        </div>

        {/* ── byline pill (mirrors "by Jakub Krehel") ── */}
        <motion.div
          custom={3}
          variants={rise}
          initial="hidden"
          animate="show"
          className="relative z-10 mt-8 inline-flex items-center gap-2.5 rounded-[var(--r-pill)] px-3 py-1.5"
          style={{ border: '0.5px solid var(--hairline)', background: 'var(--surface)' }}
        >
          <img src="/favicon.svg" alt="" aria-hidden width={20} height={20} className="rounded-full" decoding="async" />
          <span className="t-sm text-ink-2">AI UX, by Ashutosh</span>
        </motion.div>

        {/* ── CTAs (the cyan pill is the "Call To Action") ── */}
        <motion.div
          custom={4}
          variants={rise}
          initial="hidden"
          animate="show"
          className="relative z-10 mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
        >
          <button onClick={onExplore} className="btn btn-primary pressable !px-6 !py-3 t-lg">
            Start exploring
            <ArrowRight size={17} strokeWidth={2.2} />
          </button>
          <button onClick={onSearch} className="btn btn-secondary pressable !px-5 !py-3">
            <Search size={15} strokeWidth={2.2} />
            Search ideas
            <kbd className="t-caption t-mono ml-0.5 rounded-[var(--r-sm)] px-1.5 py-0.5"
                 style={{ background: 'var(--surface-2)', color: 'var(--ink-3)' }}>⌘K</kbd>
          </button>
        </motion.div>

        {/* ══ floating annotation layer (hidden on small screens) ══ */}
        <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block" aria-hidden>
          {/* token value tag, top-left over "Designing" */}
          <Annotation i={0} x="-2%" y="-14%" line={{ toX: '6%', toY: '2%' }} swatch>
            oklch(0.173 0 0)
          </Annotation>

          {/* metric tag, top-right */}
          <Annotation i={1} x="60%" y="-16%" line={{ toX: '52%', toY: '6%' }}>
            12 folders · 150 lessons
          </Annotation>

          {/* font tag pointing at the serif accent word */}
          <Annotation i={2} x="48%" y="52%" line={{ toX: '38%', toY: '54%' }}>
            font-libre-baskerville
          </Annotation>

          {/* pink measurement tag in the gap between byline and CTA */}
          <Annotation i={3} x="60%" y="70%" measure line={{ toX: '52%', toY: '72%' }}>
            32px
          </Annotation>

          {/* "Call To Action" tag pointing at the primary button, off to the right */}
          <Annotation i={4} x="62%" y="88%" line={{ toX: '54%', toY: '90%' }}>
            Call To Action
          </Annotation>
        </div>
      </div>
    </section>
  );
}

// A single Figma-canvas annotation: a mono label chip plus a dotted connector
// line + endpoint dot pointing back into the composition.
function Annotation({
  i, x, y, children, swatch, measure, line,
}: {
  i: number; x: string; y: string; children: React.ReactNode;
  swatch?: boolean; measure?: boolean; line?: { toX: string; toY: string };
}) {
  return (
    <motion.div
      custom={i}
      variants={anno}
      initial="hidden"
      animate="show"
      className="absolute"
      style={{ left: x, top: y }}
    >
      <span
        className="t-caption t-mono inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--r-sm)] px-2 py-1"
        style={{
          border: '0.5px solid var(--hairline)',
          background: 'var(--surface)',
          color: measure ? 'var(--anno-mag)' : 'var(--ink-3)',
        }}
      >
        {swatch && (
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'var(--bg)', border: '0.5px solid var(--hairline)' }} />
        )}
        {children}
      </span>
      {line && (
        <>
          <span
            className="absolute h-px"
            style={{
              left: 0, top: '100%',
              width: '48px', marginTop: '6px',
              backgroundImage: 'repeating-linear-gradient(90deg, var(--anno-line) 0 3px, transparent 3px 6px)',
            }}
          />
          <span
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ left: '46px', top: 'calc(100% + 3px)', border: '1px solid var(--anno-line)', background: 'var(--bg)' }}
          />
        </>
      )}
    </motion.div>
  );
}
