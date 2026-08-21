import { demoConfigFor } from '@/lib/demo-configs';
import { demoTemplateFor } from '@/lib/deep';

// Miniature, inert UI specimens for card heroes. Each mirrors the archetype of
// the sub-topic's real interactive demo (slider-map / toggle-fix / sequence /
// reveal), so the card previews actual UI instead of text bullets.
// Pure CSS, pointer-events: none, cheap enough for hundreds of cards.

export type SpecimenKind = 'slider-map' | 'toggle-fix' | 'sequence' | 'reveal' | 'before-after' | 'meter';

export function specimenKindFor(id: string): SpecimenKind | null {
  const cfg = demoConfigFor(id);
  if (cfg?.archetype) return cfg.archetype as SpecimenKind;
  const tpl = demoTemplateFor(id);
  if (tpl === 'state-machine') return 'sequence';
  if (tpl === 'loop-close') return 'toggle-fix';
  if (id === 'ai-agent-legibility-anti-0') return 'sequence'; // bespoke demo
  return null;
}

const hairline = '0.5px solid var(--hairline)';

function MiniPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none flex h-full w-full flex-col justify-center gap-2 rounded-[var(--r-sm)] p-3"
      style={{ background: 'var(--surface)', border: hairline }}
      aria-hidden
    >
      {children}
    </div>
  );
}

// slider-map: a labeled slider with a thumb + an output meter it maps to
function SliderSpecimen({ color }: { color: string }) {
  return (
    <MiniPanel>
      <span className="t-caption t-mono uppercase text-ink-4">input</span>
      <div className="relative h-1.5 rounded-full" style={{ background: 'var(--surface-2)', border: hairline }}>
        <span className="absolute left-0 top-0 h-full w-3/5 rounded-full" style={{ background: 'var(--ink-4)' }} />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full"
          style={{ left: '58%', background: 'var(--ink)', border: '2px solid var(--surface)', boxShadow: 'var(--shadow-card)' }}
        />
      </div>
      <span className="t-caption t-mono mt-1 uppercase text-ink-4">output</span>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--surface-2)', border: hairline }}>
        <span className="block h-full w-4/5 rounded-full" style={{ background: color }} />
      </div>
    </MiniPanel>
  );
}

// toggle-fix: a bad/good segmented control with the good side active + result lines
function ToggleSpecimen({ color }: { color: string }) {
  return (
    <MiniPanel>
      <div className="flex gap-1 rounded-[var(--r-sm)] p-0.5" style={{ background: 'var(--surface-2)', border: hairline }}>
        <span className="flex-1 rounded-[3px] px-1.5 py-1 text-center t-caption t-mono uppercase text-ink-4">broken</span>
        <span
          className="flex-1 rounded-[3px] px-1.5 py-1 text-center t-caption t-mono uppercase"
          style={{ background: 'var(--ink)', color: 'var(--bg)' }}
        >
          fixed
        </span>
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        {[0.9, 0.7, 0.8].map((w, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: i === 2 ? color : 'var(--ink-4)' }} />
            <span className="h-1 rounded-full" style={{ width: `${w * 100}%`, background: 'var(--surface-2)', border: hairline }} />
          </span>
        ))}
      </div>
    </MiniPanel>
  );
}

// sequence: numbered step rows with a spine, the gate step accented
function SequenceSpecimen({ color }: { color: string }) {
  const steps = [false, false, true, false];
  return (
    <MiniPanel>
      <div className="relative flex flex-col gap-2 pl-1">
        <span className="absolute bottom-1 left-[7.5px] top-1 w-px" style={{ background: 'var(--hairline)' }} />
        {steps.map((hot, i) => (
          <span key={i} className="relative flex items-center gap-2">
            <span
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full t-caption t-mono"
              style={{
                background: hot ? color : 'var(--surface-2)',
                border: hot ? 'none' : hairline,
                color: hot ? 'var(--bg)' : 'var(--ink-4)',
                fontSize: '8px',
              }}
            >
              {i + 1}
            </span>
            <span
              className="h-1 rounded-full"
              style={{ width: `${[62, 78, 88, 54][i]}%`, background: hot ? `color-mix(in oklab, ${color} 28%, var(--surface-2))` : 'var(--surface-2)', border: hot ? 'none' : hairline }}
            />
          </span>
        ))}
      </div>
    </MiniPanel>
  );
}

// reveal: a claim row, then hidden lines with one revealed in the accent
function RevealSpecimen({ color }: { color: string }) {
  return (
    <MiniPanel>
      <span className="h-1.5 w-11/12 rounded-full" style={{ background: 'var(--ink-4)', opacity: 0.55 }} />
      <div className="mt-1 flex flex-col gap-1.5 rounded-[var(--r-sm)] p-2" style={{ background: 'var(--surface-2)', border: hairline }}>
        <span className="h-1 w-4/5 rounded-full" style={{ background: 'var(--hairline)', filter: 'blur(1.5px)' }} />
        <span className="h-1 w-3/5 rounded-full" style={{ background: 'var(--hairline)', filter: 'blur(1.5px)' }} />
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          <span className="h-1 w-5/6 rounded-full" style={{ background: color, opacity: 0.65 }} />
        </span>
      </div>
      <span className="t-caption t-mono uppercase" style={{ color }}>reveal</span>
    </MiniPanel>
  );
}

// before-after: two mini panes, broken left and fixed right, with an arrow
function BeforeAfterSpecimen({ color }: { color: string }) {
  const Pane = ({ good }: { good: boolean }) => (
    <div
      className="flex flex-1 flex-col gap-1.5 rounded-[var(--r-sm)] p-2"
      style={{ background: 'var(--surface-2)', border: good ? `1px solid ${color}` : '0.5px solid var(--hairline)' }}
    >
      <span className="t-caption t-mono uppercase" style={{ color: good ? color : 'var(--ink-4)', fontSize: '8px' }}>
        {good ? 'after' : 'before'}
      </span>
      {[0.85, 0.6, 0.75].map((w, i) => (
        <span
          key={i}
          className="h-1 rounded-full"
          style={{
            width: `${w * 100}%`,
            background: good ? `color-mix(in oklab, ${color} 45%, var(--surface))` : 'var(--hairline)',
          }}
        />
      ))}
    </div>
  );
  return (
    <MiniPanel>
      <div className="flex items-center gap-2">
        <Pane good={false} />
        <span className="t-caption text-ink-4">&rarr;</span>
        <Pane good />
      </div>
    </MiniPanel>
  );
}

// meter: a gauge with tick marks and a fill that overshoots into the hot zone
function MeterSpecimen({ color }: { color: string }) {
  return (
    <MiniPanel>
      <span className="t-caption t-mono uppercase text-ink-4">measured</span>
      <div className="relative h-2.5 rounded-full" style={{ background: 'var(--surface-2)', border: hairline }}>
        <span className="absolute left-0 top-0 h-full w-[68%] rounded-full" style={{ background: color, opacity: 0.85 }} />
        {[25, 50, 75].map((t) => (
          <span key={t} className="absolute top-0 h-full w-px" style={{ left: `${t}%`, background: 'var(--surface)' }} />
        ))}
        <span className="absolute -top-1 h-[calc(100%+8px)] w-[2px] rounded-full" style={{ left: '68%', background: 'var(--ink)' }} />
      </div>
      <div className="flex justify-between">
        <span className="t-caption t-mono text-ink-4">0</span>
        <span className="t-caption t-mono font-semibold" style={{ color }}>68</span>
        <span className="t-caption t-mono text-ink-4">100</span>
      </div>
    </MiniPanel>
  );
}

export function DemoSpecimen({ kind, color }: { kind: SpecimenKind; color: string }) {
  switch (kind) {
    case 'slider-map': return <SliderSpecimen color={color} />;
    case 'toggle-fix': return <ToggleSpecimen color={color} />;
    case 'sequence': return <SequenceSpecimen color={color} />;
    case 'reveal': return <RevealSpecimen color={color} />;
    case 'before-after': return <BeforeAfterSpecimen color={color} />;
    case 'meter': return <MeterSpecimen color={color} />;
  }
}

// type-specimen fallback: the big first-words treatment, for heroes with
// neither an image nor a demo
export function TypeSpecimen({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="pointer-events-none relative flex h-full w-full flex-col justify-end p-4" aria-hidden>
      <span
        className="pointer-events-none absolute inset-x-4 top-1/2 h-px"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--hairline) 0 4px, transparent 4px 8px)' }}
      />
      <span className="block truncate leading-none text-ink" style={{ fontSize: '1.9rem', fontWeight: 560, letterSpacing: '-0.03em', opacity: 0.9 }}>
        {label.split(' ').slice(0, 2).join(' ')}
      </span>
      {sub && <span className="mt-1.5 block t-caption t-mono text-ink-4">{sub}</span>}
    </div>
  );
}
