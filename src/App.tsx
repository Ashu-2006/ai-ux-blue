import { useEffect, useState } from 'react';
import { Nav } from '@/sections/Nav';
import { Hero } from '@/sections/Hero';
import { DemoCard } from '@/sections/DemoCard';
import { Library } from '@/sections/Library';
import { CardPlayground } from '@/sections/CardPlayground';
import { Footer } from '@/sections/Footer';
import { DeepModal } from '@/components/DeepModal';
import { LessonModal } from '@/components/LessonModal';
import { CommandK } from '@/components/CommandK';
import { getDeep } from '@/lib/deep';

export default function App() {
  const [deepId, setDeepId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Library dispatches: a lesson opens LessonModal, an idea with authored deep
  // content opens DeepModal (fallback: ideas without deep content still get a
  // modal-worthy card, but we do not force an empty modal open).
  const openLesson = (id: string) => setLessonId(id);
  const openIdea = ({ subId }: { topicKey: string; subId: string }) => {
    if (getDeep(subId)) setDeepId(subId);
  };

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

  if (route === '#playground') return <CardPlayground />;

  return (
    <div id="top" className="min-h-[100dvh] bg-bg">
      <Nav onSearch={() => setCmdkOpen(true)} />

      <main>
        <Hero onSearch={() => setCmdkOpen(true)} onExplore={scrollToLibrary} />
        <DemoCard />
        <Library onOpenLesson={openLesson} onOpenIdea={openIdea} />
      </main>

      <Footer />

      <DeepModal id={deepId} onClose={() => setDeepId(null)} />
      <LessonModal id={lessonId} onClose={() => setLessonId(null)} />
      <CommandK
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        onPick={({ topicKey, subId }) => subId && openIdea({ topicKey, subId })}
      />
    </div>
  );
}
