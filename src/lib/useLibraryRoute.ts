import { useCallback, useSyncExternalStore } from 'react';
import { parsePath, serializePath } from '@/lib/library';

// One route param, `?p=<slug/path>`. Browser back and forward walk the tree.
// Deep links work. The modal opens for path segments whose final slug resolves
// to a lesson or an idea, not a folder, so the same URL scheme covers reading
// and browsing.

// useSyncExternalStore compares snapshots by identity, so we must cache the
// derived array and only replace it when the underlying query string changes.
let cachedRaw: string | null | undefined = undefined;
let cachedPath: string[] = [];
const EMPTY: string[] = [];

function read(): string[] {
  if (typeof window === 'undefined') return EMPTY;
  const raw = new URLSearchParams(window.location.search).get('p');
  if (raw === cachedRaw) return cachedPath;
  cachedRaw = raw;
  cachedPath = parsePath(raw);
  return cachedPath;
}

function subscribe(fn: () => void) {
  window.addEventListener('popstate', fn);
  window.addEventListener('librarynav', fn);
  return () => {
    window.removeEventListener('popstate', fn);
    window.removeEventListener('librarynav', fn);
  };
}

export function useLibraryRoute() {
  const path = useSyncExternalStore(subscribe, read, () => []);

  const go = useCallback((next: string[]) => {
    const url = new URL(window.location.href);
    if (next.length === 0) url.searchParams.delete('p');
    else url.searchParams.set('p', serializePath(next));
    // Preserve hash so #library scroll target still works.
    window.history.pushState(null, '', url.toString());
    window.dispatchEvent(new Event('librarynav'));
  }, []);

  const up = useCallback(() => go(path.slice(0, -1)), [go, path]);

  return { path, go, up };
}
