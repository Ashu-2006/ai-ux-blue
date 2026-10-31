import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Specimen kit. One real piece of UI, one control that flips one variable,
// one readout that makes the invisible part visible. See docs/interactive-specimens.md.

export const EASE = [0.23, 1, 0.32, 1] as const;

export function useMotion() {
  const reduce = useReducedMotion();
  return {
    reduce: !!reduce,
    t: (duration = 0.22) => ({ duration: reduce ? 0 : duration, ease: EASE }),
  };
}

export function Specimen({
  children,
  controls,
  readout,
  height = 300,
  onKeyDown,
  focusable,
}: {
  children: React.ReactNode;
  controls?: React.ReactNode;
  readout?: React.ReactNode;
  height?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  focusable?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        tabIndex={focusable ? 0 : undefined}
        onKeyDown={onKeyDown}
        className="relative flex w-full items-center justify-center overflow-hidden rounded-[var(--r-lg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        style={{ height, background: 'var(--bg)', border: '0.5px solid var(--hairline)', isolation: 'isolate' }}
      >
        {children}
      </div>
      {readout && <div className="t-sm t-mono min-h-[20px] text-center text-ink-3">{readout}</div>}
      {controls}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const id = useId();
  const { t } = useMotion();
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-[var(--r-pill)] p-[3px]"
      style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline-2)' }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className="relative rounded-[var(--r-pill)] px-3.5 py-1.5 t-sm font-medium transition-colors"
            style={{ color: on ? 'var(--ink)' : 'var(--ink-3)' }}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={t(0.25)}
                className="absolute inset-0 rounded-[var(--r-pill)]"
                style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Window({
  children,
  width = 360,
  height,
  url,
  className = '',
  clip = true,
}: {
  children: React.ReactNode;
  width?: number;
  height?: number;
  url?: string;
  className?: string;
  clip?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col ${clip ? 'overflow-hidden' : ''} rounded-[var(--r-md)] ${className}`}
      style={{
        width,
        height,
        maxWidth: 'calc(100% - 32px)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
        isolation: 'isolate',
      }}
    >
      {url !== undefined && (
        <div
          className="t-caption t-mono flex items-center gap-1.5 px-3 py-2 text-ink-4"
          style={{ borderBottom: '0.5px solid var(--hairline-2)', letterSpacing: 0 }}
        >
          <span className="size-1.5 rounded-full" style={{ background: 'var(--hairline)' }} />
          <motion.span key={url} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="truncate">
            {url}
          </motion.span>
        </div>
      )}
      {children}
    </div>
  );
}

export function Row({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left t-sm transition-colors hover:bg-[var(--surface-2)]"
      style={{
        borderBottom: '0.5px solid var(--hairline-2)',
        background: active ? 'var(--surface-2)' : undefined,
        color: 'var(--ink)',
      }}
    >
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="t-caption t-mono inline-flex min-w-[20px] items-center justify-center rounded-[var(--r-sm)] px-1.5 py-0.5 text-ink-2"
      style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)', letterSpacing: 0 }}
    >
      {children}
    </kbd>
  );
}

export function Dot({ tone }: { tone: 'good' | 'bad' | 'warn' }) {
  const c = tone === 'good' ? 'var(--pattern)' : tone === 'bad' ? 'var(--anti)' : 'var(--invisible)';
  return <span className="inline-block size-1.5 rounded-full align-middle" style={{ background: c }} />;
}
