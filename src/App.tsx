import { lazy, Suspense, useEffect, useState } from 'react';
import { Nav } from '@/sections/Nav';
import { Hero } from '@/sections/Hero';
import { Library } from '@/sections/Library';
import { Footer } from '@/sections/Footer';

// Playground is a dev-only route (#playground); code-split so it does not
// ship with the main bundle unless someone actually navigates to it.
const CardPlayground = lazy(() =>
  import('@/sections/CardPlayground').then((m) => ({ default: m.CardPlayground })),
);
import { DeepModal } from '@/components/DeepModal';
import { LessonModal } from '@/components/LessonModal';
import { CommandK } from '@/components/CommandK';
import { getDeep } from '@/lib/deep';
import { useLibraryRoute } from '@/lib/useLibraryRoute';
import { leafBySlug } from '@/lib/library';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash);
  const { leaf, setLeaf } = useLibraryRoute();

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // The URL owns modal state, so a close (which clears `l`) cannot be undone
  // by an effect firing on the next render. This is the fix for the modal
  // "reopens on close" bug: previously Library set component state via a
  // dispatcher effect that read the same URL segment the modal used.
  const leafNode = leaf ? leafBySlug(leaf) : null;
  const lessonId = leafNode?.kind === 'lesson' ? leafNode.slug : null;
  const ideaId = leafNode?.kind === 'idea' && getDeep(leafNode.slug) ? leafNode.slug : null;
  const closeModal = () => setLeaf(null);

  const scrollToLibrary = () => {
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  if (route === '#playground') {
    return (
      <Suspense fallback={<div className="min-h-[100dvh] bg-bg" />}>
        <CardPlayground />
      </Suspense>
    );
  }

  return (
    <div id="top" className="min-h-[100dvh] bg-bg">
      <Nav onSearch={() => setCmdkOpen(true)} />

      <main>
        <Hero onSearch={() => setCmdkOpen(true)} onExplore={scrollToLibrary} />
        <Library onOpenLesson={(id) => setLeaf(id)} onOpenIdea={({ subId }) => setLeaf(subId)} />
      </main>

      <Footer />

      <DeepModal id={ideaId} onClose={closeModal} />
      <LessonModal id={lessonId} onClose={closeModal} />
      <CommandK
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        onPick={({ subId }) => subId && setLeaf(subId)}
      />

      {/* Vercel Analytics + Web Vitals. Both no-op in dev, so the dashboard
          only shows real visitor data. Available at:
          vercel.com/dashboard/ashutosh-projects/ai-ux/analytics */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
