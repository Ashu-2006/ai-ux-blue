import { ArrowUp } from 'lucide-react';
import { roadmap } from '@/lib/data';

// Quiet interfaces.dev-style footer: wordmark + blurb, a back-to-top, and a
// hairline credit line.
export function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--hairline)', background: 'var(--surface-2)' }}>
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-8 py-16 sm:px-14 lg:px-20">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-[46ch]">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)]"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                <span className="t-caption font-semibold" style={{ letterSpacing: 0 }}>L</span>
              </span>
              <span className="t-lg font-semibold text-ink" style={{ letterSpacing: '-0.01em' }}>
                Learning Roadmap
              </span>
            </div>
            <p className="t-body mt-4 text-ink-3">{roadmap.meta.title}. {roadmap.meta.subtitle}.</p>
          </div>

          <a href="#top" className="btn btn-secondary pressable self-start !px-4 !py-2 t-sm sm:self-end">
            Back to top
            <ArrowUp size={15} strokeWidth={2.2} />
          </a>
        </div>

        <div
          className="flex flex-col gap-1 border-t pt-6 t-sm text-ink-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--hairline)' }}
        >
          <span>
            {roadmap.meta.topicCount} topics · {roadmap.meta.subTopicCount} ideas
          </span>
          <span className="t-mono t-caption">
            Design language extracted from interfaces.dev
          </span>
        </div>
      </div>
    </footer>
  );
}
