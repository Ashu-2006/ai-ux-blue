import { useEffect, useState } from 'react';
import { Search, Moon, Sun, Command } from 'lucide-react';
import { RoadmapGraph } from '@/components/RoadmapGraph';
import { DetailDrawer } from '@/components/DetailDrawer';
import { DeepModal } from '@/components/DeepModal';
import { CommandK } from '@/components/CommandK';
import { useTheme } from '@/lib/theme';
import { roadmap } from '@/lib/data';
import { getDeep } from '@/lib/deep';

type Selection = { topicKey: string; subId?: string } | null;

const NODE_TYPES = [
  { label: 'Mental model', c: 'var(--model)' },
  { label: 'Pattern', c: 'var(--pattern)' },
  { label: 'Anti-pattern', c: 'var(--anti)' },
  { label: 'Invisible problem', c: 'var(--invisible)' },
];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [selection, setSelection] = useState<Selection>(null);
  const [deepId, setDeepId] = useState<string | null>(null);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  // A sub-topic opens the deep modal if it has authored content; else the side sheet.
  const open = (payload: { topicKey: string; subId?: string }) => {
    if (payload.subId && getDeep(payload.subId)) {
      setDeepId(payload.subId);
      setSelection(null);
    } else {
      setSelection(payload);
    }
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
    <div className="relative h-[100dvh] overflow-hidden bg-bg">
      {/* Floating translucent header - content scrolls under (skill §12) */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 p-4">
        <div
          className="material pointer-events-auto flex items-center gap-3 rounded-[var(--r-lg)] px-4 py-2.5"
          style={{ boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}
        >
          <span className="t-lg vibrant font-semibold text-ink">Learning Roadmap</span>
          <span className="hidden h-4 w-px sm:block" style={{ background: 'var(--hairline)' }} />
          <span className="t-sm vibrant hidden text-ink-3 sm:inline">
            {roadmap.meta.topicCount} topics · {roadmap.meta.subTopicCount} sub-topics
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setCmdkOpen(true)}
            className="material pressable flex items-center gap-2 rounded-[var(--r-lg)] px-3 py-2.5 t-sm text-ink-2"
            style={{ boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}
          >
            <Search size={14} strokeWidth={2.2} />
            <span className="hidden sm:inline">Search</span>
            <kbd
              className="t-caption ml-0.5 hidden items-center gap-0.5 rounded-[var(--r-sm)] px-1 py-0.5 text-ink-4 sm:flex"
              style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
            >
              <Command size={9} />K
            </kbd>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle appearance"
            className="material pressable flex h-[38px] w-[38px] items-center justify-center rounded-[var(--r-lg)] text-ink-2"
            style={{ boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}
          >
            {theme === 'dark' ? <Sun size={15} strokeWidth={2.2} /> : <Moon size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </header>

      {/* Graph fills the screen; header floats above it */}
      <main className="h-full w-full">
        <RoadmapGraph onSelect={open} focusNodeId={focusNodeId} />
      </main>

      {/* Floating legend card */}
      <div
        className="material pointer-events-none absolute bottom-4 left-4 z-20 flex flex-col gap-2 rounded-[var(--r-lg)] px-4 py-3"
        style={{ boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--hairline)' }}
      >
        <div className="t-caption mb-0.5 font-semibold uppercase text-ink-4">Node types</div>
        {NODE_TYPES.map((n) => (
          <div key={n.label} className="flex items-center gap-2.5 t-sm text-ink-2">
            <span className="h-2 w-2 rounded-full" style={{ background: n.c }} />
            {n.label}
          </div>
        ))}
      </div>

      <DetailDrawer selection={selection} onClose={() => setSelection(null)} />
      <DeepModal id={deepId} onClose={() => setDeepId(null)} />
      <CommandK
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        onPick={({ topicKey, subId, focusId }) => {
          setFocusNodeId(focusId);
          open({ topicKey, subId });
        }}
      />
    </div>
  );
}
