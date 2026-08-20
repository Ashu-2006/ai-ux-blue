import { ArrowLeft, BookOpen, Sparkles, Clock, PlayCircle, Send } from 'lucide-react';
import { LESSONS, type Lesson } from '@/lib/lessons';

// Frontend-only playground for choosing the lesson-card direction.
// Reached at /#playground. Nothing here is wired to the modal; it is a
// side-by-side specimen sheet rendered with real lesson data.

const sample: Lesson = LESSONS[0];
const sample2: Lesson = LESSONS[1] ?? LESSONS[0];

function Frame({
  n, name, note, children, wide,
}: { n: string; name: string; note: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'lg:col-span-2' : ''}>
      <div className="mb-3 flex items-baseline gap-2.5">
        <span
          className="t-caption t-mono rounded-[var(--r-sm)] px-1.5 py-0.5 font-semibold"
          style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
        >
          {n}
        </span>
        <span className="t-body font-semibold text-ink">{name}</span>
        <span className="t-sm text-ink-3">{note}</span>
      </div>
      {children}
    </div>
  );
}

const badgeRow = (l: Lesson, isNew?: boolean) => (
  <div className="flex items-center justify-between px-1 pb-2.5 pt-1">
    {isNew ? (
      <span className="inline-flex items-center gap-1 t-caption font-semibold" style={{ color: 'var(--accent)' }}>
        <Sparkles size={11} strokeWidth={2.4} /> New
      </span>
    ) : (
      <span className="kind-pill text-ink-2">
        <span className="kind-dot" style={{ background: 'var(--accent)' }} />
        Lesson
      </span>
    )}
    <span className="inline-flex items-center gap-1.5 t-caption t-mono text-ink-4">
      Lesson
      <span
        className="rounded-[var(--r-sm)] px-1.5 py-0.5 text-ink-3"
        style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
      >
        {l.index}
      </span>
    </span>
  </div>
);

// V1 · shipped default: diagram specimen on paper
function V1({ l }: { l: Lesson }) {
  return (
    <button className="card pressable group flex w-full flex-col p-3 text-left">
      {badgeRow(l, true)}
      <div
        className="relative h-36 w-full overflow-hidden rounded-[var(--r-md)]"
        style={{ background: '#faf6ef', border: '0.5px solid var(--hairline)' }}
      >
        <img src={l.diagram} alt="" className="absolute inset-0 h-full w-full object-cover object-top p-2" />
        <span
          className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-1.5 t-caption t-mono"
          style={{ background: 'rgba(250,246,239,0.92)', borderTop: '0.5px solid var(--hairline)', color: '#555' }}
        >
          <span className="uppercase">{l.readTime}</span>
          <span>click to open</span>
        </span>
      </div>
      <div className="px-1 pt-3">
        <h4 className="t-lg font-semibold leading-snug text-ink">{l.title}</h4>
        <p className="t-sm mt-1.5 line-clamp-2 text-ink-3">{l.oneLiner}</p>
      </div>
    </button>
  );
}

// V2 · type specimen, exactly like the roadmap's idea cards
function V2({ l }: { l: Lesson }) {
  return (
    <button className="card pressable flex w-full flex-col p-3 text-left">
      {badgeRow(l)}
      <div
        className="relative flex h-36 w-full flex-col justify-between overflow-hidden rounded-[var(--r-md)] p-4"
        style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
      >
        <span
          className="pointer-events-none absolute inset-x-4 top-1/2 h-px"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--hairline) 0 4px, transparent 4px 8px)' }}
        />
        <div className="relative flex items-center justify-between">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)]"
            style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
          >
            <BookOpen size={16} strokeWidth={2.2} />
          </span>
          <span className="t-caption t-mono uppercase" style={{ color: 'var(--accent)' }}>Lesson</span>
        </div>
        <div className="relative">
          <span className="block truncate leading-none text-ink" style={{ fontSize: '2rem', fontWeight: 560, letterSpacing: '-0.03em', opacity: 0.9 }}>
            {l.title.split(' ').slice(0, 2).join(' ')}
          </span>
          <span className="mt-1 block t-caption t-mono text-ink-4">{l.readTime} · click to open</span>
        </div>
      </div>
      <div className="px-1 pt-3">
        <h4 className="t-lg font-semibold leading-snug text-ink">{l.title}</h4>
        <p className="t-sm mt-1.5 line-clamp-2 text-ink-3">{l.oneLiner}</p>
      </div>
    </button>
  );
}

// V3 · editorial index: serif numeral, hairline rules, no preview panel
function V3({ l }: { l: Lesson }) {
  return (
    <button className="card pressable flex w-full flex-col p-6 text-left">
      <div className="flex items-start justify-between">
        <span className="t-serif leading-none text-ink" style={{ fontSize: '2.6rem', opacity: 0.85 }}>
          {l.index}
        </span>
        <span className="kind-pill text-ink-2">
          <span className="kind-dot" style={{ background: 'var(--accent)' }} />
          Lesson
        </span>
      </div>
      <div className="mt-4 h-px w-full" style={{ background: 'var(--hairline)' }} />
      <h4 className="t-lg mt-4 font-semibold leading-snug text-ink">{l.title}</h4>
      <p className="t-sm mt-2 line-clamp-3 text-ink-3">{l.oneLiner}</p>
      <span className="t-caption t-mono mt-4 flex items-center gap-1.5 uppercase text-ink-4">
        <Clock size={11} strokeWidth={1.8} /> {l.readTime} · read · interactive · post
      </span>
    </button>
  );
}

// V4 · compact row: thumbnail left, text right; scales to long lists
function V4({ l }: { l: Lesson }) {
  return (
    <button className="card pressable flex w-full items-stretch gap-4 p-3 text-left">
      <div
        className="relative w-32 shrink-0 overflow-hidden rounded-[var(--r-md)]"
        style={{ background: '#faf6ef', border: '0.5px solid var(--hairline)' }}
      >
        <img src={l.diagram} alt="" className="absolute inset-0 h-full w-full object-cover object-left-top p-1.5" />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2">
          <span className="t-caption t-mono rounded-[var(--r-sm)] px-1.5 py-0.5 text-ink-3" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
            {l.index}
          </span>
          <span className="t-caption t-mono uppercase text-ink-4">{l.readTime}</span>
        </div>
        <h4 className="t-body mt-1.5 font-semibold leading-snug text-ink">{l.title}</h4>
        <p className="t-sm mt-1 line-clamp-2 text-ink-3">{l.oneLiner}</p>
      </div>
    </button>
  );
}

// V5 · diagram hero: full-bleed paper top, minimal chrome
function V5({ l }: { l: Lesson }) {
  return (
    <button className="card pressable flex w-full flex-col overflow-hidden !p-0 text-left">
      <div className="relative h-44 w-full" style={{ background: '#faf6ef' }}>
        <img src={l.diagram} alt="" className="absolute inset-0 h-full w-full object-cover object-top p-3" />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 t-caption t-mono font-semibold"
          style={{ background: 'rgba(20,20,20,0.8)', color: '#fff' }}
        >
          Lesson {l.index}
        </span>
      </div>
      <div className="p-5" style={{ borderTop: '0.5px solid var(--hairline)' }}>
        <h4 className="t-lg font-semibold leading-snug text-ink">{l.title}</h4>
        <p className="t-sm mt-1.5 line-clamp-2 text-ink-3">{l.oneLiner}</p>
        <span className="t-caption t-mono mt-3 block uppercase text-ink-4">{l.readTime}</span>
      </div>
    </button>
  );
}

// V6 · spec sheet: mono-driven data card with a capability meta row
function V6({ l }: { l: Lesson }) {
  return (
    <button className="card pressable flex w-full flex-col p-5 text-left">
      <div className="flex items-center justify-between">
        <span className="t-caption t-mono uppercase" style={{ color: 'var(--accent)' }}>
          {l.phase}
        </span>
        <span className="t-caption t-mono text-ink-4">{l.index}</span>
      </div>
      <h4 className="t-lg mt-3 font-semibold leading-snug text-ink">{l.title}</h4>
      <p className="t-sm mt-2 line-clamp-2 text-ink-3">{l.oneLiner}</p>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {[
          { icon: BookOpen, label: l.readTime.replace('~', '') },
          { icon: PlayCircle, label: 'interactive' },
          { icon: Send, label: '3 posts' },
        ].map(({ icon: Icon, label }, i) => (
          <span
            key={i}
            className="flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] px-2 py-1.5 t-caption t-mono uppercase text-ink-3"
            style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
          >
            <Icon size={11} strokeWidth={2} /> {label}
          </span>
        ))}
      </div>
    </button>
  );
}

export function CardPlayground() {
  return (
    <div className="min-h-[100dvh] bg-bg">
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <a href="#top" onClick={() => (window.location.hash = '')} className="btn btn-secondary pressable inline-flex items-center gap-1.5">
          <ArrowLeft size={14} strokeWidth={2} /> Back to the app
        </a>

        <div className="mt-8 max-w-[52ch]">
          <div className="t-caption t-mono uppercase" style={{ color: 'var(--accent)' }}>Playground</div>
          <h1 className="t-title mt-3 text-ink">Lesson card variations</h1>
          <p className="t-lg mt-3 text-ink-3">
            Six directions for the lesson list item, rendered with real data. Pick one (or a hybrid)
            and I wire it in. Nothing here opens the modal.
          </p>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-12 lg:grid-cols-2">
          <Frame n="V1" name="Diagram specimen" note="shipped default · issue card with the lesson's own diagram on paper">
            <div className="max-w-[360px]"><V1 l={sample} /></div>
          </Frame>
          <Frame n="V2" name="Type specimen" note="identical anatomy to the roadmap idea cards; quietest option">
            <div className="max-w-[360px]"><V2 l={sample} /></div>
          </Frame>
          <Frame n="V3" name="Editorial index" note="serif numeral + hairline rule; magazine table-of-contents energy">
            <div className="max-w-[360px]"><V3 l={sample} /></div>
          </Frame>
          <Frame n="V6" name="Spec sheet" note="mono meta row surfaces the three tabs (read / interactive / post)">
            <div className="max-w-[360px]"><V6 l={sample} /></div>
          </Frame>
          <Frame n="V5" name="Diagram hero" note="full-bleed paper header; loudest, best at low counts">
            <div className="max-w-[360px]"><V5 l={sample} /></div>
          </Frame>
          <Frame n="V4" name="Compact row" note="horizontal list item; the scale option for 20+ lessons per folder" wide>
            <div className="flex max-w-[560px] flex-col gap-3">
              <V4 l={sample} />
              <V4 l={sample2} />
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
