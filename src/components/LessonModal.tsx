import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, Copy, Check, Lightbulb, BookOpen, PlayCircle, Send, ArrowUpRight } from 'lucide-react';
import { getLesson, type Lesson, type LessonPost } from '@/lib/lessons';
import { LESSON_DEMOS } from '@/components/demos/lessonDemos';
import { ArchetypeDemo } from '@/components/demos/archetypes';

// Lesson reader on the exact DeepModal shell: scrim + centered material panel,
// [ badge ] + title header, Learn / Interactive / Post tab pill, 640px column.

type Tab = 'learn' | 'interactive' | 'post';

interface Props {
  id: string | null;
  onClose: () => void;
}

export function LessonModal({ id, onClose }: Props) {
  const reduce = useReducedMotion();
  const lesson = getLesson(id ?? undefined);
  const [tab, setTab] = useState<Tab>('learn');
  // bespoke demo component wins; otherwise a config-driven archetype demo
  const Bespoke = id ? LESSON_DEMOS[id] : undefined;
  const Demo = Bespoke ?? (lesson?.demo ? () => <ArchetypeDemo config={lesson.demo!} /> : undefined);

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
      {id && lesson && (
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
          {/* This wrapper sits above the scrim and would otherwise swallow
              outside clicks, so it forwards clicks that land on itself (not on
              the modal panel) to onClose. */}
          {/* Mobile: bottom sheet pinned to the bottom, 92dvh tall, rounded
              top corners, drag handle. sm: and up: centered dialog with the
              earlier scale+blur enter. One JSX branch, two responsive layouts. */}
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
              role="dialog"
              aria-modal="true"
              aria-label={lesson.title}
            >
              {/* Drag handle: mobile-only visual affordance that this is a sheet */}
              <div className="flex shrink-0 justify-center py-2 sm:hidden">
                <span
                  aria-hidden
                  className="h-1 w-10 rounded-full"
                  style={{ background: 'var(--ink-4)', opacity: 0.4 }}
                />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="pressable absolute right-4 top-3 z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 sm:right-6 sm:top-6"
                style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
              >
                <X size={15} strokeWidth={2.2} />
              </button>

              {/* body: header + tabs + tab content in one scroll container.
                  Tighter side padding on mobile so long lesson titles do not
                  wrap into a wall of text. */}
              <div className="scroll min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-9 sm:pb-9 sm:pt-7">
                <div className="mx-auto w-full max-w-[640px]">
                  {/* header, scrolls with the body */}
                  <span
                    className="inline-flex items-center rounded-[var(--r-sm)] px-2.5 py-1 t-caption t-mono font-semibold uppercase"
                    style={{ color: 'var(--accent)', background: 'var(--accent-tint)' }}
                  >
                    [ Lesson {lesson.index} · {lesson.readTime} ]
                  </span>
                  <h1 className="t-title vibrant mt-3 text-ink">{lesson.title}</h1>

                  {/* tabs, still inline so they scroll too */}
                  <div className="mt-6 flex gap-1" role="tablist">
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
                            layoutId="lesson-tab-pill"
                            className="absolute inset-0 rounded-[var(--r-md)]"
                            style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
                            transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className="relative flex items-center gap-1.5">{t.icon}{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* tab content */}
                  <div className="pt-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tab}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      >
                        {tab === 'learn' && <LearnTab lesson={lesson} />}
                        {tab === 'interactive' && (
                          <div>
                            {lesson.demoCaption && <p className="t-body mb-6 text-ink-3">{lesson.demoCaption}</p>}
                            {Demo ? <Demo /> : <div className="t-body text-ink-4">Demo coming soon.</div>}
                          </div>
                        )}
                        {tab === 'post' && <PostTab posts={lesson.posts} />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
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
      <div className="t-h2 mb-2.5 text-ink">{label}</div>
      {children}
    </section>
  );
}

function LearnTab({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <p className="t-lg text-ink-2">{lesson.oneLiner}</p>

      {/* diagram on paper (the curriculum SVGs are ink-on-cream) */}
      {lesson.diagram && (
        <figure className="mt-6">
          <div
            className="overflow-x-auto rounded-[var(--r-lg)] p-4"
            style={{ background: '#faf6ef', border: '0.5px solid var(--hairline)' }}
          >
            <img
              src={lesson.diagram}
              alt={lesson.diagramCaption ?? lesson.title}
              className="mx-auto w-full min-w-[520px]"
              loading="lazy"
            />
          </div>
          {lesson.diagramCaption && (
            <figcaption className="t-sm mt-2 text-ink-3">{lesson.diagramCaption}</figcaption>
          )}
        </figure>
      )}

      {/* the lens, in the accent-tint treatment the app uses for "the metaphor" */}
      <div className="mt-8 rounded-[var(--r-lg)] p-4" style={{ background: 'var(--accent-tint)', border: '0.5px solid var(--accent)' }}>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
          <Lightbulb size={14} />
          <span className="t-sm font-semibold">Why this matters for your work</span>
        </div>
        <p className="t-body mt-1.5 text-ink-2">{lesson.whyItMatters}</p>
      </div>

      {lesson.sections.map((s, i) => (
        <Section key={i} label={s.heading}>
          <p className="t-body whitespace-pre-line text-ink-2">{s.body}</p>
        </Section>
      ))}

      <Section label="Key takeaways">
        <ul className="flex flex-col gap-2.5">
          {lesson.takeaways.map((t, i) => (
            <li key={i} className="t-body flex gap-2.5 text-ink-2">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Terms, precisely">
        <dl className="flex flex-col gap-1">
          {lesson.terms.map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-[130px_1fr] gap-3 rounded-[var(--r-md)] px-3 py-2"
              style={{ background: i % 2 ? 'transparent' : 'var(--surface-2)' }}
            >
              <dt className="t-sm t-mono text-ink">{t.term}</dt>
              <dd className="t-sm text-ink-2">{t.meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <a
        href={lesson.source.url}
        target="_blank"
        rel="noreferrer"
        className="btn btn-secondary pressable mt-9 inline-flex items-center gap-1.5"
      >
        {lesson.source.label}
        <ArrowUpRight size={14} strokeWidth={1.8} />
      </a>
    </div>
  );
}

function PostTab({ posts }: { posts: LessonPost[] }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="t-body text-ink-3">
        Three ways to post this lesson on X. Same mechanism, different angle. Copy, pair it with a
        screen recording of the interactive demo, and ship.
      </p>
      {posts.map((p, i) => (
        <PostCard key={i} kind={p.kind} body={p.body} />
      ))}
    </div>
  );
}

function PostCard({ kind, body }: { kind: string; body: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="rounded-[var(--r-lg)] p-5" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
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
