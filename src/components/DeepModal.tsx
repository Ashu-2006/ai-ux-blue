import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, Copy, Check, Sparkles, PlayCircle, BookOpen, Send } from 'lucide-react';
import { getDeep, kindTone, demoTemplateFor } from '@/lib/deep';
import { demoConfigFor } from '@/lib/demo-configs';
import { PostHocConfirmDemo } from '@/components/demos/PostHocConfirmDemo';
import { StateMachineDemo, LoopCloseDemo } from '@/components/demos/templates';
import { ArchetypeDemo } from '@/components/demos/archetypes';

// sub-topic id -> its BESPOKE interactive demo (hand-built, highest fidelity)
const DEMOS: Record<string, React.FC> = {
  'ai-agent-legibility-anti-0': PostHocConfirmDemo,
};

// reusable demo templates, for the sub-topics hand-mapped in DEMO_TEMPLATE
const TEMPLATE_DEMOS: Record<string, React.FC> = {
  'state-machine': StateMachineDemo,
  'loop-close': LoopCloseDemo,
};

// Resolve the best demo for a sub-topic: bespoke > hand-mapped template >
// config-driven archetype. Returns undefined for text-only sub-topics.
function resolveDemo(id: string | null): React.FC | undefined {
  if (!id) return undefined;
  if (DEMOS[id]) return DEMOS[id];
  const tpl = demoTemplateFor(id);
  if (tpl) return TEMPLATE_DEMOS[tpl];
  const cfg = demoConfigFor(id);
  if (cfg) return () => <ArchetypeDemo config={cfg} />;
  return undefined;
}

type Tab = 'learn' | 'interactive' | 'post';

interface Props {
  id: string | null;
  onClose: () => void;
}

export function DeepModal({ id, onClose }: Props) {
  const reduce = useReducedMotion();
  const deep = getDeep(id ?? undefined);
  const [tab, setTab] = useState<Tab>('learn');
  const Demo = resolveDemo(id);
  const tone = deep ? kindTone(deep.kindLabel) : { fg: 'var(--ink-2)', tint: 'var(--surface-2)' };

  useEffect(() => {
    if (id) setTab('learn');
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && id) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  const panelEnter = reduce
    ? { type: 'tween' as const, duration: 0.2 }
    : { type: 'spring' as const, bounce: 0.16, duration: 0.5 };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'learn', label: 'Learn', icon: <BookOpen size={14} /> },
    ...(Demo ? [{ key: 'interactive' as Tab, label: 'Interactive', icon: <PlayCircle size={14} /> }] : []),
    { key: 'post', label: 'Post', icon: <Send size={14} /> },
  ];

  return (
    <AnimatePresence>
      {id && deep && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'var(--scrim)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />
          <div
            className="fixed inset-0 z-[61] flex items-end justify-center sm:items-center sm:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.div
              className="material-strong relative flex h-[92dvh] w-full max-w-[1080px] flex-col overflow-hidden rounded-t-[var(--r-xl)] sm:h-auto sm:max-h-[90vh] sm:rounded-[var(--r-xl)]"
              style={{ boxShadow: 'var(--shadow-float)', border: '0.5px solid var(--hairline)', transformOrigin: 'center' }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: '100%' }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: '100%' }}
              transition={panelEnter}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle: mobile-only affordance that this is a sheet */}
              <div className="flex shrink-0 justify-center py-2 sm:hidden">
                <span
                  aria-hidden
                  className="h-1 w-10 rounded-full"
                  style={{ background: 'var(--ink-4)', opacity: 0.4 }}
                />
              </div>

              {/* header: title block spans the full content column so its left
                  edge matches the body; close button floats top-right of the modal */}
              <div className="relative mx-auto w-full max-w-[640px] px-5 pt-2 sm:px-9 sm:pt-7">
                <span
                  className="inline-flex items-center rounded-[var(--r-sm)] px-2.5 py-1 t-caption t-mono font-semibold uppercase"
                  style={{ color: tone.fg, background: tone.tint }}
                >
                  [ {deep.kindLabel} ]
                </span>
                <h1 className="t-title vibrant mt-3 text-ink">{deep.title}</h1>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="pressable absolute right-6 top-6 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3"
                style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
              >
                <X size={15} strokeWidth={2.2} />
              </button>

              {/* tabs */}
              <div className="mx-auto mt-6 w-full max-w-[640px] px-9">
                <div className="flex gap-1" role="tablist">
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      role="tab"
                      aria-selected={tab === t.key}
                      onClick={() => setTab(t.key)}
                      className="pressable relative flex items-center gap-1.5 rounded-[var(--r-md)] px-3 py-2 t-sm font-medium"
                      style={{ color: tab === t.key ? 'var(--ink)' : 'var(--ink-3)' }}
                    >
                      {tab === t.key && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-[var(--r-md)]"
                          style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
                          transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                      <span className="relative flex items-center gap-1.5">{t.icon}{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* body */}
              <div className="scroll min-h-0 flex-1 overflow-y-auto px-9 pb-9 pt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    className="mx-auto w-full max-w-[640px]"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {tab === 'learn' && <LearnTab deep={deep} />}
                    {tab === 'interactive' && (
                      <div>
                        <p className="t-body mb-6 text-ink-3">{deep.demoCaption}</p>
                        {Demo ? <Demo /> : <div className="t-body text-ink-4">Demo coming soon.</div>}
                      </div>
                    )}
                    {tab === 'post' && <PostTab deep={deep} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      {/* sentence-case heading, not an uppercase eyebrow (taste-skill 4.7) */}
      <div className="t-h2 mb-2.5 text-ink">{label}</div>
      {children}
    </section>
  );
}

function LearnTab({ deep }: { deep: NonNullable<ReturnType<typeof getDeep>> }) {
  return (
    <div>
      <Section label="What it is">
        <p className="t-lg text-ink-2">{deep.definition}</p>
      </Section>

      <Section label="How it works (technical)">
        <p className="t-body text-ink-2">{deep.technical}</p>
      </Section>

      <Section label="The metaphor">
        <div
          className="rounded-[var(--r-lg)] p-4"
          style={{ background: 'var(--accent-tint)', border: '0.5px solid var(--accent)' }}
        >
          <div className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
            <Sparkles size={14} />
            <span className="t-sm font-semibold">{deep.metaphor.label}</span>
          </div>
          <p className="t-body mt-1.5 text-ink-2">{deep.metaphor.body}</p>
        </div>
      </Section>

      <Section label="Where it shows up (and why it matters)">
        <div
          className="rounded-[var(--r-lg)] p-4"
          style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
        >
          <div className="t-sm font-semibold text-ink">{deep.example.product}</div>
          <p className="t-body mt-1.5 text-ink-2">{deep.example.scenario}</p>
          <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--hairline)' }}>
            <span className="t-caption font-semibold uppercase" style={{ color: 'var(--anti)' }}>Why it matters</span>
            <p className="t-body mt-1 text-ink-2">{deep.example.why}</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

function PostTab({ deep }: { deep: NonNullable<ReturnType<typeof getDeep>> }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="t-body text-ink-3">
        Three ways to post this on X. Same insight, different angle. Copy, pair it with a screen
        recording of the demo, and ship.
      </p>
      {deep.posts.map((p, i) => (
        <PostCard key={i} kind={p.kind} hook={p.hook} body={p.body} />
      ))}
    </div>
  );
}

function PostCard({ kind, hook, body }: { kind: string; hook: string; body: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div
      className="rounded-[var(--r-lg)] p-5"
      style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="rounded-[var(--r-sm)] px-2 py-0.5 t-caption font-semibold uppercase"
          style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
        >
          {kind}
        </span>
        <button
          onClick={copy}
          className="pressable flex items-center gap-1.5 rounded-[var(--r-md)] px-2.5 py-1.5 t-sm font-medium text-ink-2"
          style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline)' }}
        >
          {copied ? <Check size={13} style={{ color: 'var(--pattern)' }} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="t-body whitespace-pre-line text-ink-2">{body}</p>
    </div>
  );
}
