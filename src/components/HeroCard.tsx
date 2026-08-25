import { motion } from 'framer-motion';

const ease = [0.23, 1, 0.32, 1] as const;

interface Props {
  onOpen: () => void;
  index: number; // stagger position within its grid
  hero: React.ReactNode; // full-bleed hero content (image / specimen / type)
  heroBg?: string; // hero panel background (paper for diagrams, surface-2 for specimens)
  badge: React.ReactNode; // overlay pill, top-left of the hero
  title: string;
  oneLiner?: string;
  meta?: React.ReactNode; // caption row under the one-liner
}

// The single card system (playground V5, "diagram hero"): a full-bleed hero
// panel with an overlay badge, then title + one-liner + meta below a hairline.
// What fills the hero follows the priority: image > demo specimen > type.
export function HeroCard({ onOpen, index, hero, heroBg, badge, title, oneLiner, meta }: Props) {
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease, delay: Math.min(index, 8) * 0.03 }}
      className="card pressable group flex flex-col overflow-hidden !p-0 text-left"
    >
      <div className="relative h-40 w-full overflow-hidden" style={{ background: heroBg ?? 'var(--surface-2)' }}>
        {hero}
        <span className="absolute left-3 top-3">{badge}</span>
      </div>
      <div className="flex flex-1 flex-col p-4" style={{ borderTop: '0.5px solid var(--hairline)' }}>
        {/* Title: bigger than body, truncated after 2 lines with tighter leading
            so a 3-line title reads as one clean block instead of tumbling. */}
        <h4
          className="line-clamp-2 font-semibold text-ink"
          style={{
            fontSize: '1.125rem',
            lineHeight: 1.2,
            letterSpacing: '-0.018em',
          }}
        >
          {title}
        </h4>
        {oneLiner && <p className="t-sm mt-2 line-clamp-2 text-ink-3">{oneLiner}</p>}
        {meta && <div className="mt-auto pt-3">{meta}</div>}
      </div>
    </motion.button>
  );
}

// The standard overlay pill used on hero panels
export function HeroBadge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 t-caption font-semibold uppercase"
      style={{
        background: 'color-mix(in oklab, var(--surface) 88%, transparent)',
        border: '0.5px solid var(--hairline)',
        color: color ?? 'var(--ink-2)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </span>
  );
}
