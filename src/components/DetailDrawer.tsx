import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, BookOpen, Target, FlaskConical, Lightbulb, ArrowUpRight } from 'lucide-react';
import { topicById } from '@/lib/data';
import { KIND_LABEL, type SubKind, type SubNode, type Topic } from '@/lib/types';

interface Props {
  selection: { topicKey: string; subId?: string } | null;
  onClose: () => void;
}

const KIND_COLOR: Record<SubKind, { fg: string; tint: string }> = {
  model: { fg: 'var(--model)', tint: 'var(--model-tint)' },
  pattern: { fg: 'var(--pattern)', tint: 'var(--pattern-tint)' },
  anti: { fg: 'var(--anti)', tint: 'var(--anti-tint)' },
  invisible: { fg: 'var(--invisible)', tint: 'var(--invisible-tint)' },
};

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-8 flex items-center gap-2 text-ink-4">
      <span className="opacity-80">{icon}</span>
      <span className="t-caption font-semibold uppercase">{children}</span>
    </div>
  );
}

export function DetailDrawer({ selection, onClose }: Props) {
  const reduce = useReducedMotion();
  const topic = selection ? topicById(selection.topicKey) : undefined;
  const sub =
    topic && selection?.subId ? topic.subNodes.find((s) => s.id === selection.subId) : undefined;

  // Apple sheet spring: drawer feel = damping ~0.8, response ~0.3 (skill).
  // Framer's bounce+duration maps to Apple's damping+response.
  const enter = reduce
    ? { type: 'tween' as const, duration: 0.2 }
    : { type: 'spring' as const, bounce: 0.18, duration: 0.5 };

  return (
    <AnimatePresence>
      {selection && topic && (
        <>
          {/* Dimming scrim: modal task pushes background back (skill §12) */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'var(--scrim)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />
          {/* Sheet: translucent material, enters + exits along the same path */}
          <motion.aside
            className="material-strong scroll fixed right-0 top-0 z-50 flex h-full w-full max-w-[540px] flex-col overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-sheet)' }}
            initial={reduce ? { opacity: 0 } : { x: '100%', filter: 'blur(8px)' }}
            animate={reduce ? { opacity: 1 } : { x: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { x: '100%', filter: 'blur(6px)' }}
            transition={enter}
          >
            {/* Header: sits on the material, scroll-edge separation (no hard divider) */}
            <div
              className="material-strong vibrant sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4"
              style={{ boxShadow: '0 0.5px 0 var(--hairline-2)' }}
            >
              <div className="flex items-center gap-2 text-ink-3">
                <span className="t-sm font-medium">{topic.title}</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="pressable flex h-8 w-8 items-center justify-center rounded-full text-ink-3"
                style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            <div className="px-6 pb-20 pt-5">
              {sub ? (
                <SubContent sub={sub} />
              ) : (
                <TopicContent topic={topic} />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  // ---- sub-topic view ----
  function SubContent({ sub }: { sub: SubNode }) {
    const c = KIND_COLOR[sub.kind];
    return (
      <>
        <span
          className="inline-flex items-center rounded-[var(--r-pill)] px-2.5 py-1 t-caption font-semibold uppercase"
          style={{ color: c.fg, background: c.tint }}
        >
          {KIND_LABEL[sub.kind]}
        </span>
        <h1 className="t-title vibrant mt-3.5 text-ink">{sub.label}</h1>

        <SectionLabel icon={<Lightbulb size={13} />}>
          {sub.kind === 'anti'
            ? 'Why it fails'
            : sub.kind === 'pattern'
              ? 'When to use it'
              : sub.kind === 'invisible'
                ? 'The problem'
                : 'The idea, in one line'}
        </SectionLabel>
        <p className="t-lg text-ink-2">{sub.oneLiner}</p>

        {sub.body && (
          <>
            <SectionLabel icon={<BookOpen size={13} />}>
              {sub.kind === 'model' ? 'Why it matters (for Sam)' : 'More'}
            </SectionLabel>
            <p className="t-body text-ink-2">{sub.body}</p>
          </>
        )}

        <div
          className="mt-9 rounded-[var(--r-lg)] p-4"
          style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
        >
          <div className="t-sm font-semibold text-ink">Run the loop</div>
          <p className="t-sm mt-1 text-ink-3">
            Turn this into proof: find it in a real product, name the leak, annotate a screenshot,
            ship a post. Teardown targets for this topic are in the topic overview.
          </p>
        </div>
      </>
    );
  }

  // ---- topic overview ----
  function TopicContent({ topic }: { topic: Topic }) {
    return (
      <>
        <h1 className="t-title vibrant text-ink">{topic.title}</h1>
        <p className="t-body mt-2 text-ink-3">{topic.fullTitle}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 t-sm text-ink-4">
          <span>{topic.subNodes.length} sub-topics</span>
          <span>{topic.methods.length} methods</span>
          <span>{topic.resources.length} resources</span>
          <span>{topic.teardownTargets.length} teardown targets</span>
        </div>
        <p className="t-body mt-4 text-ink-2">
          Click any node around this topic to read a mental model, pattern, anti-pattern, or
          invisible problem in full.
        </p>

        <SectionLabel icon={<FlaskConical size={13} />}>How to measure it</SectionLabel>
        <ul className="space-y-2.5">
          {topic.methods.map((m, i) => (
            <li key={i} className="t-body text-ink-2">
              <span className="font-semibold text-ink">{m.method}</span>
              <span className="text-ink-3"> - {m.measures}</span>
            </li>
          ))}
        </ul>

        <SectionLabel icon={<Lightbulb size={13} />}>Strategies & tactics</SectionLabel>
        <ul className="space-y-2 pl-1">
          {topic.tactics.map((t, i) => (
            <li key={i} className="t-body flex gap-2.5 text-ink-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--ink-4)' }} />
              {t}
            </li>
          ))}
        </ul>

        <SectionLabel icon={<Target size={13} />}>Teardown targets</SectionLabel>
        <ul className="space-y-2.5">
          {topic.teardownTargets.map((t, i) => (
            <li
              key={i}
              className="rounded-[var(--r-md)] p-3.5"
              style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
            >
              <div className="t-sm font-semibold text-ink">{t.product}</div>
              <div className="t-sm mt-0.5 text-ink-3">{t.why}</div>
            </li>
          ))}
        </ul>

        <SectionLabel icon={<BookOpen size={13} />}>Resources (fact-checked)</SectionLabel>
        <ul className="space-y-3">
          {topic.resources.map((r, i) => (
            <li key={i} className="t-body">
              <div className="flex items-baseline gap-2">
                <span
                  className="rounded-[var(--r-sm)] px-1.5 py-0.5 t-caption uppercase"
                  style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                >
                  {r.type}
                </span>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 font-semibold text-ink transition-colors hover:text-accent"
                  >
                    {r.title}
                    <ArrowUpRight size={13} className="text-ink-4" />
                  </a>
                ) : (
                  <span className="font-semibold text-ink">{r.title}</span>
                )}
              </div>
              <div className="t-sm mt-0.5 text-ink-3">
                {r.source} - {r.why}
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }
}
