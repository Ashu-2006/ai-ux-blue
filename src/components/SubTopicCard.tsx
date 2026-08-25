import { Sparkles } from 'lucide-react';
import type { SubNode } from '@/lib/types';
import { KIND_LABEL } from '@/lib/types';
import { HeroCard, HeroBadge } from '@/components/HeroCard';
import { DemoSpecimen, TypeSpecimen, specimenKindFor } from '@/components/specimens';

interface Props {
  sub: SubNode;
  index: number;
  onOpen: () => void;
}

// Roadmap idea card on the unified hero-card system. Hero priority:
// image (subs have none today) > demo specimen (mini UI mirroring the
// sub-topic's interactive archetype) > type specimen.
export function SubTopicCard({ sub, index, onOpen }: Props) {
  const color = `var(--${sub.kind})`;
  const specimen = specimenKindFor(sub.id);

  const hero = specimen ? (
    <div className="absolute inset-0 p-3 pt-11">
      <DemoSpecimen kind={specimen} color={color} />
    </div>
  ) : (
    <div className="absolute inset-0">
      <TypeSpecimen label={sub.label} sub="click to open" />
    </div>
  );

  return (
    <HeroCard
      onOpen={onOpen}
      index={index}
      hero={hero}
      badge={
        index === 0 ? (
          <HeroBadge color="var(--accent)">
            <Sparkles size={10} strokeWidth={2.6} /> New
          </HeroBadge>
        ) : (
          <HeroBadge>
            <span className="kind-dot" style={{ background: color }} />
            {KIND_LABEL[sub.kind]}
          </HeroBadge>
        )
      }
      title={sub.label}
      oneLiner={sub.oneLiner}
    />
  );
}
