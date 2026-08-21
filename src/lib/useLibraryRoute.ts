import { useCallback, useSyncExternalStore } from 'react';

// URL is the source of truth for two orthogonal pieces of state:
//   ?f=<folder-slug>    : which folder the Explorer is currently inside
//   ?l=<lesson-or-idea> : which leaf's modal is open, if any
//
// Every folder slug and every leaf id is unique across the whole tree
// (verified: no duplicates), so single-segment identifiers replace the
// old nested `?p=a/b/c` path. Deep links stay compact and, more
// importantly, closing the modal only clears `l` without disturbing `f`,
// so the effect that dispatches the modal cannot re-open itself.

// useSyncExternalStore compares snapshots by identity, so we memoize
// the derived tuple until the underlying search string changes.
let cachedSearch: string | undefined = undefined;
let cachedState: RouteState = { folder: null, leaf: null };

export interface RouteState {
  folder: string | null;
  leaf: string | null;
}

function read(): RouteState {
  if (typeof window === 'undefined') return cachedState;
  const s = window.location.search;
  if (s === cachedSearch) return cachedState;
  cachedSearch = s;
  const q = new URLSearchParams(s);
  cachedState = {
    folder: q.get('f') || null,
    leaf: q.get('l') || null,
  };
  return cachedState;
}

function subscribe(fn: () => void) {
  window.addEventListener('popstate', fn);
  window.addEventListener('librarynav', fn);
  return () => {
    window.removeEventListener('popstate', fn);
    window.removeEventListener('librarynav', fn);
  };
}

function write(next: Partial<RouteState>, replace = false): void {
  const url = new URL(window.location.href);
  const merged: RouteState = { ...read(), ...next };
  if (merged.folder) url.searchParams.set('f', merged.folder);
  else url.searchParams.delete('f');
  if (merged.leaf) url.searchParams.set('l', merged.leaf);
  else url.searchParams.delete('l');
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method](null, '', url.toString());
  window.dispatchEvent(new Event('librarynav'));
}

export function useLibraryRoute() {
  const state = useSyncExternalStore(subscribe, read, () => cachedState);

  const setFolder = useCallback((folder: string | null) => write({ folder }), []);
  const setLeaf = useCallback((leaf: string | null) => write({ leaf }), []);
  const set = useCallback((next: Partial<RouteState>) => write(next), []);

  return { ...state, setFolder, setLeaf, set };
}
