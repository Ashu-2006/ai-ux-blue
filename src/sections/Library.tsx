import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Search, FolderOpen, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import { ancestors, collectLeaves, nodeAtPath, ROOT, type FolderNode, type IdeaNode, type Node } from '@/lib/library';
import { useLibraryRoute } from '@/lib/useLibraryRoute';
import { LessonCard } from '@/components/LessonCard';
import { LessonFolder } from '@/components/LessonFolder';
import { SectionHeader } from './SectionHeader';
import type { SubKind } from '@/lib/types';
import { KIND_LABEL } from '@/lib/types';

interface Props {
  onOpenLesson: (id: string) => void;
  onOpenIdea: (payload: { topicKey: string; subId: string }) => void;
}

type SortMode = 'curriculum' | 'a-z';
type KindFilter = 'all' | 'lesson' | 'idea' | SubKind;

const KIND_CHIPS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'lesson', label: 'Lessons' },
  { key: 'model', label: 'Mental models' },
  { key: 'pattern', label: 'Patterns' },
  { key: 'anti', label: 'Anti-patterns' },
  { key: 'invisible', label: 'Invisible problems' },
];

const ease = [0.23, 1, 0.32, 1] as const;

export function Library({ onOpenLesson, onOpenIdea }: Props) {
  const reduce = useReducedMotion();
  const { path, go, up } = useLibraryRoute();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [sort, setSort] = useState<SortMode>('curriculum');

  // Reset search when the folder changes.
  useEffect(() => setQuery(''), [path.join('/')]);

  // Escape and Backspace go up one level.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const typing =
        active instanceof HTMLElement && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (typing) return;
      if (path.length === 0) return;
      if (e.key === 'Escape' || (e.key === 'Backspace' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        up();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [path, up]);

  // Resolve the target: if the path ends on a lesson/idea, open the modal and
  // keep the parent folder as the visible directory.
  const target = useMemo(() => nodeAtPath(path), [path]);
  const currentFolder: FolderNode =
    target && target.kind === 'folder' ? target : ancestors(path).slice(-1)[0] ?? ROOT;

  useEffect(() => {
    if (!target) return;
    if (target.kind === 'lesson') onOpenLesson(target.slug);
    else if (target.kind === 'idea') {
      const node = target as IdeaNode;
      onOpenIdea({ topicKey: node.topicId, subId: node.slug });
    }
  }, [target, onOpenLesson, onOpenIdea]);

  const crumbs = ancestors(currentFolder.path);

  // What we render: either just this folder's direct children (browsing), or a
  // flat, filtered list of every leaf reachable from here (searching/filtering).
  const isSearching = query.trim().length > 0 || kind !== 'all';
  const contents: Node[] = useMemo(() => {
    if (!isSearching) return sortNodes(currentFolder.children, sort);
    const leaves = collectLeaves(currentFolder);
    const q = query.trim().toLowerCase();
    const filtered = leaves.filter((n) => {
      // kind filter
      if (kind === 'lesson' && n.kind !== 'lesson') return false;
      if (kind === 'idea' && n.kind !== 'idea') return false;
      if (kind !== 'all' && kind !== 'lesson' && kind !== 'idea') {
        if (n.kind !== 'idea' || n.idea.kind !== kind) return false;
      }
      // query filter (title + one-liner + phase/topic hint)
      if (!q) return true;
      const hay =
        n.kind === 'lesson'
          ? `${n.title} ${n.lesson.oneLiner} ${n.lesson.phase} ${n.lesson.part}`
          : `${n.title} ${n.idea.oneLiner} ${n.topicId}`;
      return hay.toLowerCase().includes(q);
    });
    return sortNodes(filtered, sort);
  }, [currentFolder, query, kind, sort, isSearching]);

  return (
    <section id="library" className="mx-auto max-w-[1180px] px-8 pb-32 pt-8 sm:px-14 lg:px-20">
      <SectionHeader
        eyebrow="The library"
        title="Everything, one shelf"
        blurb="Twelve topic folders that group the whole curriculum and roadmap by what the material is about. Open a folder to go inside, click a file to read it."
      />

      {/* breadcrumb + up button */}
      <nav aria-label="Breadcrumb" className="mt-10 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {path.length > 0 && (
          <button onClick={up} className="btn btn-secondary pressable mr-2 !px-2.5 !py-1.5 t-sm inline-flex items-center gap-1.5">
            <ArrowLeft size={13} strokeWidth={2} /> Back
          </button>
        )}
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          const Icon = i === 0 ? HomeIcon : FolderOpen;
          return (
            <span key={c.slug || 'home'} className="inline-flex items-center gap-x-1.5">
              <button
                onClick={() => go(c.path)}
                disabled={last}
                className="pressable inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-2 py-1 t-sm"
                style={{
                  color: last ? 'var(--ink)' : 'var(--ink-3)',
                  background: last ? 'var(--surface-2)' : 'transparent',
                  border: last ? '0.5px solid var(--hairline)' : 'none',
                  fontWeight: last ? 600 : 500,
                  cursor: last ? 'default' : 'pointer',
                }}
              >
                <Icon size={13} strokeWidth={1.8} /> {i === 0 ? 'Home' : c.title}
              </button>
              {!last && <ChevronRight size={12} strokeWidth={1.8} className="text-ink-4" />}
            </span>
          );
        })}
      </nav>

      {/* filter rail */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 t-sm flex-1 min-w-[220px] max-w-[380px]"
          style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
        >
          <Search size={14} strokeWidth={1.8} className="text-ink-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${currentFolder.title.toLowerCase()}...`}
            className="w-full bg-transparent outline-none placeholder:text-ink-4"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="t-caption t-mono uppercase text-ink-4 hover:text-ink-2"
            >
              clear
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-1.5">
          {KIND_CHIPS.map((c) => {
            const active = kind === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setKind(c.key)}
                aria-pressed={active}
                className="pressable rounded-full px-3 py-1.5 t-sm"
                style={{
                  background: active ? 'var(--ink)' : 'var(--surface-2)',
                  color: active ? 'var(--bg)' : 'var(--ink-3)',
                  border: '0.5px solid var(--hairline)',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}>
          {(['curriculum', 'a-z'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSort(m)}
              aria-pressed={sort === m}
              className="pressable rounded-full px-3 py-1 t-caption t-mono uppercase"
              style={{
                background: sort === m ? 'var(--ink)' : 'transparent',
                color: sort === m ? 'var(--bg)' : 'var(--ink-3)',
              }}
            >
              {m === 'curriculum' ? 'Curriculum' : 'A-Z'}
            </button>
          ))}
        </div>
      </div>

      {/* current directory blurb, only meaningful when browsing */}
      {!isSearching && currentFolder.blurb && (
        <p className="t-lg mt-8 max-w-[70ch] text-ink-3">{currentFolder.blurb}</p>
      )}

      {/* the grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={path.join('/') + (isSearching ? ':search' : ':browse')}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease }}
          className="mt-10 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {contents.length === 0 && (
            <p className="t-body col-span-full max-w-[52ch] text-ink-3">
              Nothing here. Try a different filter or clear the search.
            </p>
          )}
          {contents.map((n, i) =>
            n.kind === 'folder' ? (
              <LessonFolder
                key={n.slug}
                title={n.title}
                blurb={n.blurb}
                items={n.children}
                count={n.lessonCount}
                index={i}
                onOpenFolder={() => go(n.path)}
                onOpenItem={(item) => go(item.path)}
              />
            ) : n.kind === 'lesson' ? (
              <LessonCard key={n.slug} lesson={n.lesson} index={i} onOpen={() => go(n.path)} />
            ) : (
              <IdeaTile key={n.slug} node={n} index={i} onOpen={() => go(n.path)} />
            ),
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function sortNodes<T extends Node>(nodes: T[], mode: SortMode): T[] {
  if (mode === 'curriculum') return nodes;
  return [...nodes].sort((a, b) => a.title.localeCompare(b.title));
}

function IdeaTile({ node, index, onOpen }: { node: IdeaNode; index: number; onOpen: () => void }) {
  const color = `var(--${node.idea.kind})`;
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease, delay: Math.min(index, 8) * 0.03 }}
      className="card pressable flex flex-col items-start gap-4 p-6 text-left"
    >
      <span
        className="kind-pill text-ink-2"
        style={{ borderColor: 'var(--hairline)' }}
      >
        <span className="kind-dot" style={{ background: color }} />
        {KIND_LABEL[node.idea.kind]}
      </span>
      <div>
        <h4 className="t-lg font-semibold leading-snug text-ink">{node.title}</h4>
        <p className="t-sm mt-1.5 line-clamp-3 text-ink-3">{node.idea.oneLiner}</p>
      </div>
    </motion.button>
  );
}
