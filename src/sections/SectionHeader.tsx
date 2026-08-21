interface Props {
  eyebrow?: string;
  title: string;
  blurb?: string;
  center?: boolean;
}

// Shared section heading: mono accent eyebrow + sentence-case title + optional
// grey blurb. Matches the interfaces.dev section rhythm.
export function SectionHeader({ eyebrow, title, blurb, center }: Props) {
  return (
    <div className={center ? 'mx-auto max-w-[52ch] text-center' : 'max-w-[52ch]'}>
      {eyebrow && (
        <div className="t-caption t-mono uppercase" style={{ color: 'var(--accent)' }}>
          {eyebrow}
        </div>
      )}
      <h2 className="t-title mt-3 text-ink">{title}</h2>
      {blurb && <p className="t-lg mt-3 text-ink-3">{blurb}</p>}
    </div>
  );
}
