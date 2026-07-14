import { useEffect, useState } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { CardGrid } from '@/components/CardGrid';
import { DeepModal } from '@/components/DeepModal';
import { CommandK } from '@/components/CommandK';
import { useTheme } from '@/lib/theme';
import { getDeep } from '@/lib/deep';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [deepId, setDeepId] = useState<string | null>(null);
  const [cmdkOpen, setCmdkOpen] = useState(false);

  // every sub-topic has deep content, so a card always opens the modal
  const open = (payload: { topicKey: string; subId?: string }) => {
    if (payload.subId && getDeep(payload.subId)) setDeepId(payload.subId);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg">
      {/* paxel terminal-chrome header */}
      <header
        className="material fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-6 py-3"
        style={{ borderBottom: '0.5px solid var(--hairline)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-[var(--r-sm)] text-white"
            style={{ background: 'var(--accent)' }}
          >
            <span className="t-caption t-mono font-bold">L</span>
          </span>
          <span className="t-sm t-mono font-semibold uppercase tracking-wide text-ink">Learning Roadmap</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCmdkOpen(true)}
            className="pressable flex items-center gap-2 rounded-[var(--r-md)] px-3 py-1.5 t-sm t-mono text-ink-2"
            style={{ border: '0.5px solid var(--hairline)', background: 'var(--surface)' }}
          >
            <Search size={13} strokeWidth={2} />
            <span className="hidden sm:inline">[ Search</span>
            <kbd className="t-caption">⌘K ]</kbd>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle appearance"
            className="pressable flex h-[34px] w-[34px] items-center justify-center rounded-[var(--r-md)] text-ink-2"
            style={{ border: '0.5px solid var(--hairline)', background: 'var(--surface)' }}
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
          </button>
        </div>
      </header>

      <main>
        <CardGrid onOpen={open} />
      </main>

      <DeepModal id={deepId} onClose={() => setDeepId(null)} />
      <CommandK
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        onPick={({ topicKey, subId }) => open({ topicKey, subId })}
      />
    </div>
  );
}
