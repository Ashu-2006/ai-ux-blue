import { Sparkles, BookOpen } from 'lucide-react';
import type { Lesson } from '@/lib/lessons';
import { HeroCard, HeroBadge } from '@/components/HeroCard';
import { DemoSpecimen, TypeSpecimen, type SpecimenKind } from '@/components/specimens';

interface Props {
  lesson: Lesson;
  index: number;
  onOpen: () => void;
}

// Lesson card on the unified hero-card system. Hero priority: the lesson's own
// diagram on paper > type specimen (for future lessons without an asset).
export function LessonCard({ lesson, index, onOpen }: Props) {
  // hero priority: image > demo specimen (mini UI of its archetype) > type
  const hero = lesson.diagram ? (
    <img
      src={lesson.diagram}
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover object-top p-2.5 transition-transform duration-300 group-hover:scale-[1.02]"
      // Cards inside an opened folder are visible immediately; lazy waits for
      // scroll into view, which reads as slow on Vercel's cold edge cache.
      decoding="async"
    />
  ) : lesson.demo ? (
    <div className="absolute inset-0 p-3 pt-11">
      <DemoSpecimen kind={lesson.demo.archetype as SpecimenKind} color="var(--accent)" />
    </div>
  ) : (
    <div className="absolute inset-0">
      <TypeSpecimen label={lesson.title} sub={`${lesson.readTime} · click to open`} />
    </div>
  );

  return (
    <HeroCard
      onOpen={onOpen}
      index={index}
      hero={hero}
      heroBg={lesson.diagram ? '#faf6ef' : undefined}
      badge={
        index === 0 ? (
          <HeroBadge color="var(--accent)">
            <Sparkles size={10} strokeWidth={2.6} /> Lesson {lesson.index}
          </HeroBadge>
        ) : (
          <HeroBadge>
            <BookOpen size={10} strokeWidth={2.4} /> Lesson {lesson.index}
          </HeroBadge>
        )
      }
      title={lesson.title}
      oneLiner={lesson.oneLiner}
      meta={
        <span className="t-caption t-mono flex items-center justify-between uppercase text-ink-4">
          <span>{lesson.readTime}</span>
          <span>read · interactive · post</span>
        </span>
      }
    />
  );
}
