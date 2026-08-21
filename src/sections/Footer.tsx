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
                <span className="t-caption font-semibold" style={{ letterSpacing: 0 }}>A</span>
              </span>
              <span className="t-lg font-semibold text-ink" style={{ letterSpacing: '-0.01em' }}>
                AI UX
              </span>
            </div>
            <p className="t-body mt-4 text-ink-3">
              A library for design engineers. 150 lessons on designing interfaces on top of AI models.
            </p>
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
            12 folders · 150 lessons · by{' '}
            <a
              href="https://github.com/Ashu-2006"
              target="_blank"
              rel="noreferrer"
              className="text-ink-3 hover:text-ink"
            >
              Ashutosh Rana
            </a>
          </span>
          <span className="t-mono t-caption">
            Curriculum adapted from AI Engineering from Scratch (MIT)
          </span>
        </div>
      </div>
    </footer>
  );
}
