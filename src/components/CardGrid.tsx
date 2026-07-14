import { DitherGradient } from '@/components/dither-kit/gradient';
import { SubTopicCard } from '@/components/SubTopicCard';
import { topics } from '@/lib/data';

interface Props {
  onOpen: (payload: { topicKey: string; subId?: string }) => void;
}

// paxel-style card grid: dither side rails, terminal chrome, topic sections
// each with a mono header + a responsive grid of sub-topic cards.
export function CardGrid({ onOpen }: Props) {
  return (
    <div className="relative min-h-full">
      {/* dither side rails (fixed, behind content) */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-[7vw] max-w-[130px] lg:block">
        <DitherGradient from="blue" to="transparent" direction="left" cell={4} opacity={0.5} />
      </div>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-0 hidden w-[7vw] max-w-[130px] lg:block">
        <DitherGradient from="blue" to="transparent" direction="right" cell={4} opacity={0.5} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px] px-6 pb-24 pt-28 lg:px-[9vw]">
        {/* hero */}
        <div className="mb-14 border-b pb-10" style={{ borderColor: 'var(--hairline)' }}>
          <div className="t-caption t-mono uppercase" style={{ color: 'var(--accent)' }}>
            [ 8 topics · 256 sub-topics ]
          </div>
          <h1 className="t-hero mt-4 text-ink">How do you design for AI &amp; crypto?</h1>
          <p className="t-lg mt-4 max-w-[60ch] text-ink-3">
            256 things worth knowing, each with a mental model, a live interactive teardown, and
            three ready-to-post takes. Pick a card.
          </p>
        </div>

        {/* topic sections */}
        {topics.map((t) => (
          <section key={t.id} className="mb-16">
            <div className="mb-5 flex items-baseline gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: `var(--h-${hueKey(t.hue)})` }} />
              <h2 className="t-h2 text-ink">{t.title}</h2>
              <span className="t-caption t-mono uppercase text-ink-4">{t.subNodes.length} cards</span>
              <div className="ml-2 h-px flex-1" style={{ background: 'var(--hairline)' }} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {t.subNodes.map((sub, i) => (
                <SubTopicCard
                  key={sub.id}
                  sub={sub}
                  index={i}
                  onOpen={() => onOpen({ topicKey: t.id, subId: sub.id })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function hueKey(h: string): string {
  const map: Record<string, string> = {
    violet: 'systems', blue: 'model', cyan: 'data', teal: 'dash',
    green: 'task', amber: 'deceptive', rose: 'buying', slate: 'methods',
  };
  return map[h] ?? 'methods';
}
