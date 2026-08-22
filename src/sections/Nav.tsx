import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface Props {
  onSearch: () => void;
}

// Minimal interfaces.dev-style nav: wordmark left, a pill search + theme toggle
// right, translucent chrome that content scrolls under.
export function Nav({ onSearch }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="material fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-5 py-3 sm:px-8"
      style={{ borderBottom: '0.5px solid var(--hairline)' }}
    >
      <a href="#top" className="flex items-center gap-2.5">
        <img
          src="/favicon.svg"
          alt="AI UX"
          width={24}
          height={24}
          className="rounded-[var(--r-md)]"
          decoding="async"
        />
        <span className="t-sm font-semibold text-ink" style={{ letterSpacing: '-0.01em' }}>
          AI UX
        </span>
      </a>

      <div className="flex items-center gap-2">
        <button
          onClick={onSearch}
          className="btn btn-secondary pressable !py-2 !px-3.5 t-sm text-ink-2"
          aria-label="Search ideas"
        >
          <Search size={14} strokeWidth={2.2} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="t-caption t-mono ml-0.5 rounded-[var(--r-sm)] px-1.5 py-0.5"
               style={{ background: 'var(--surface-2)', color: 'var(--ink-3)' }}>
            ⌘K
          </kbd>
        </button>
        <button
          onClick={toggleTheme}
          aria-label="Toggle appearance"
          className="btn btn-secondary pressable !h-[38px] !w-[38px] !p-0 text-ink-2"
        >
          {theme === 'dark' ? <Sun size={15} strokeWidth={2.2} /> : <Moon size={15} strokeWidth={2.2} />}
        </button>
      </div>
    </header>
  );
}
