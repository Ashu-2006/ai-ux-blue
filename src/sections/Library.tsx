import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Search, FolderOpen, ArrowLeft, Home as HomeIcon, ListOrdered, ArrowDownAZ } from 'lucide-react';
import {
  ancestorsOfFolder,
  collectLeaves,
  folderBySlug,
  ROOT,
  type FolderNode,
  type IdeaNode,
  type Node,
} from '@/lib/library';
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
  const { folder: folderSlug, setFolder } = useLibraryRoute();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [sort, setSort] = useState<SortMode>('curriculum');

  const currentFolder: FolderNode = folderBySlug(folderSlug) ?? ROOT;
  const crumbs = ancestorsOfFolder(currentFolder);

  // Reset the local search when the folder changes.
  useEffect(() => setQuery(''), [currentFolder.slug]);

  // Escape / Backspace go up one level (unless typing).
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const typing =
        active instanceof HTMLElement &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (typing) return;
      if (currentFolder.slug === '') return;
      if (e.key === 'Escape' || (e.key === 'Backspace' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        const parent = crumbs[crumbs.length - 2];
        setFolder(parent && parent.slug ? parent.slug : null);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [currentFolder.slug, crumbs, setFolder]);

  // What the grid renders.
  const isSearching = query.trim().length > 0 || kind !== 'all';
  const contents: Node[] = useMemo(() => {
    if (!isSearching) return sortNodes(currentFolder.children, sort);

    // Filter mode: matching sub-folders first, then matching leaves. Folders
    // survive the kind filter only when kind === 'all' (folders don't have a
    // "kind"); a specific-kind filter is a leaf-only view by definition.
    const q = query.trim().toLowerCase();
    const matchQuery = (hay: string) => (!q ? true : hay.toLowerCase().includes(q));

    const folders =
      kind === 'all'
        ? currentFolder.children.filter(
            (n) => n.kind === 'folder' && matchQuery(`${n.title} ${n.blurb}`),
          )
        : [];

    const leaves = collectLeaves(currentFolder).filter((n) => {
      if (kind === 'lesson' && n.kind !== 'lesson') return false;
      if (kind === 'idea' && n.kind !== 'idea') return false;
      if (kind !== 'all' && kind !== 'lesson' && kind !== 'idea') {
        if (n.kind !== 'idea' || n.idea.kind !== kind) return false;
      }
      const hay =
        n.kind === 'lesson'
          ? `${n.title} ${n.lesson.oneLiner} ${n.lesson.phase} ${n.lesson.part}`
          : `${n.title} ${n.idea.oneLiner} ${n.topicId}`;
      return matchQuery(hay);
    });

    return [...sortNodes(folders, sort), ...sortNodes(leaves as Node[], sort)];
  }, [currentFolder, query, kind, sort, isSearching]);

  // Dispatchers for leaf clicks: modals open via the route setter, not local
  // component state, so Close (which clears `l`) actually stays closed.
  const openLeaf = (n: LeafNode) => {
    if (n.kind === 'lesson') onOpenLesson(n.slug);
    else onOpenIdea({ topicKey: (n as IdeaNode).topicId, subId: n.slug });
  };

  return (
    <section id="library" className="mx-auto max-w-[1180px] px-6 pb-24 pt-8 sm:px-14 sm:pb-32 lg:px-20">
      <SectionHeader
        eyebrow="The library"
        title="Everything, one shelf"
        blurb="Twelve topic folders that group the whole curriculum and roadmap by what the material is about. Open a folder to go inside, click a file to read it."
      />

      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="mt-10 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {currentFolder.slug !== '' && (
          <button
            onClick={() => setFolder(crumbs[crumbs.length - 2]?.slug || null)}
            className="btn btn-secondary pressable mr-2 !px-2.5 !py-1.5 t-sm inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={13} strokeWidth={2} /> Back
          </button>
        )}
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          const Icon = i === 0 ? HomeIcon : FolderOpen;
          return (
            <span key={c.slug || 'home'} className="inline-flex items-center gap-x-1.5">
              <button
                onClick={() => setFolder(c.slug || null)}
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

      {/* sticky filter rail: pinned to the top on scroll so search stays
          reachable without a long scroll back up. The material class carries
          the frosted-glass tint from the design system. */}
      {/* On mobile the rail collapses to a single horizontal row that scrolls
          if it overflows, so the whole control set (search + kind chips + sort)
          takes one line of vertical space instead of three. From sm: up it
          returns to the wrap layout with the sort pushed to the far right. */}
      <div
        className="material sticky top-[60px] z-30 -mx-6 mt-6 px-6 py-2.5 sm:-mx-14 sm:px-14 sm:py-3 lg:-mx-20 lg:px-20"
        style={{ borderBottom: '0.5px solid var(--hairline)' }}
      >
        <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:gap-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <label
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 t-sm sm:flex-1 sm:min-w-[220px] sm:max-w-[380px]"
            style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
          >
            <Search size={14} strokeWidth={1.8} className="text-ink-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              // longer placeholder on wider screens; keep it compact on mobile
              onFocus={(e) => (e.currentTarget.placeholder = `Search ${currentFolder.title.toLowerCase()}...`)}
              onBlur={(e) => (e.currentTarget.placeholder = 'Search')}
              className="w-32 bg-transparent outline-none placeholder:text-ink-4 sm:w-full"
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

          {KIND_CHIPS.map((c) => {
            const active = kind === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setKind(c.key)}
                aria-pressed={active}
                className="pressable shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 t-sm"
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

          <div
            className="flex shrink-0 items-center gap-1 rounded-full p-1 sm:ml-auto"
            style={{ background: 'var(--surface-2)', border: '0.5px solid var(--hairline)' }}
          >
            {(
              [
                { key: 'curriculum' as const, Icon: ListOrdered, label: 'Curriculum order' },
                { key: 'a-z' as const, Icon: ArrowDownAZ, label: 'Sort A to Z' },
              ]
            ).map(({ key, Icon, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                aria-label={label}
                title={label}
                className="pressable flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  background: sort === key ? 'var(--ink)' : 'transparent',
                  color: sort === key ? 'var(--bg)' : 'var(--ink-3)',
                }}
              >
                <Icon size={14} strokeWidth={1.9} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* current folder blurb, only meaningful when browsing */}
      {!isSearching && currentFolder.blurb && (
        <p className="t-lg mt-8 max-w-[70ch] text-ink-3">{currentFolder.blurb}</p>
      )}

      {/* the grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={(currentFolder.slug || 'home') + (isSearching ? ':search' : ':browse')}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease }}
          className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-cols-3"
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
                onOpenFolder={() => setFolder(n.slug)}
                onOpenItem={(item) => {
                  if (item.kind === 'folder') setFolder(item.slug);
                  else openLeaf(item as LeafNode);
                }}
              />
            ) : n.kind === 'lesson' ? (
              <LessonCard key={n.slug} lesson={n.lesson} index={i} onOpen={() => openLeaf(n)} />
            ) : (
              <IdeaTile key={n.slug} node={n} index={i} onOpen={() => openLeaf(n)} />
            ),
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

type LeafNode = { kind: 'lesson'; slug: string } | { kind: 'idea'; slug: string; topicId: string };

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
      <span className="kind-pill text-ink-2" style={{ borderColor: 'var(--hairline)' }}>
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
