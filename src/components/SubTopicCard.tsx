import { DitherGradient } from '@/components/dither-kit/gradient';
import type { SubNode, SubKind } from '@/lib/types';

// A paxel-style card: a dithered blue texture top, a mono question/kind label,
// and a bold title. Rounded corners + blue accent per the brief. Click -> modal.
const KIND_QUESTION: Record<SubKind, string> = {
  model: 'Which mental model?',
  pattern: 'Which pattern?',
  anti: 'Which anti-pattern?',
  invisible: 'Which invisible problem?',
};
const KIND_FG: Record<SubKind, string> = {
  model: 'var(--model)',
  pattern: 'var(--pattern)',
  anti: 'var(--anti)',
  invisible: 'var(--invisible)',
};

interface Props {
  sub: SubNode;
  index: number;
  onOpen: () => void;
}

export function SubTopicCard({ sub, index, onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="pressable group relative flex flex-col overflow-hidden rounded-[var(--r-lg)] text-left"
      style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* dithered texture top */}
      <div className="relative h-28 w-full overflow-hidden" style={{ borderBottom: '0.5px solid var(--hairline)' }}>
        <DitherGradient from="blue" to="transparent" direction="down" cell={3} opacity={0.9} />
        {/* three window dots, like the reference */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--surface)', opacity: 0.9 }} />
          ))}
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="t-caption t-mono uppercase" style={{ color: KIND_FG[sub.kind] }}>
          {KIND_QUESTION[sub.kind]}
        </span>
        <span className="t-lg font-semibold leading-tight text-ink">{sub.label}</span>
        <span className="t-sm mt-auto pt-2 t-mono text-ink-4">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </button>
  );
}
