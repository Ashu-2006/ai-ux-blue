import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Folder as FolderIcon } from 'lucide-react';
import type { Node } from '@/lib/library';

interface Props {
  title: string;
  meta?: string; // mono label under the title (phase, part)
  blurb?: string;
  // Whatever lives inside: sub-folders, lessons, or ideas. Only the first few
  // are drawn as peek cards; the count pill carries the true total.
  items: Node[];
  count?: number; // override for the count pill (deep count vs peek length)
  index: number; // stagger position in the shelf
  onOpenFolder: () => void; // click the flap/label to descend into the folder
  onOpenItem: (node: Node) => void; // click a peek card
}

// One continuous silhouette: tab and body share an outline, joined by a wide
// concave sweep (r=34). A tight fillet reads as a notch cut out of a card; the
// long curve is what makes it read as a folder. viewBox matches the wrapper's
// aspect so nothing skews. Ported from the portfolio template's Folder.astro.
const SILHOUETTE = `M0,26 A26,26 0 0 1 26,0 L154,0 A26,26 0 0 1 180,26
  A34,34 0 0 0 214,60 L370,60 A30,30 0 0 1 400,90 L400,310
  A30,30 0 0 1 370,340 L30,340 A30,30 0 0 1 0,310 Z`;

const ease = [0.23, 1, 0.32, 1] as const;

// Hashed off the index rather than Math.random, so a card is tilted the same
// way every visit. A card that lands at a different angle each time reads as a
// glitch, not as character.
function tiltOf(i: number) {
  const n = Math.sin((i + 1) * 127.1) * 43758.5453;
  return (n - Math.floor(n)) * 8 - 4;
}

export function LessonFolder({ title, meta, blurb, items, count, index, onOpenFolder, onOpenItem }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // At most 5 peek cards; more reads as clutter rather than a stack.
  const peek = useMemo(() => items.slice(0, 5), [items]);
  const mid = (peek.length - 1) / 2;
  const gaps = Math.max(peek.length - 1, 1);

  // Fanned out, the stack should just about span the folder.
  const CARD_W = 34; // % of folder width
  const step = (100 - CARD_W) / gaps;
  const PUSH = 4; // how far neighbours yield when one is singled out

  const poseOf = (i: number) => {
    const offset = i - mid;
    if (!open) {
      return {
        x: `${(offset * 6 * 100) / CARD_W}%`,
        y: '0%',
        rotate: offset * (6 / gaps),
        scale: 1,
      };
    }
    // The singled-out card straightens up and rises, the way you would pull
    // one print out of a fanned stack; the rest lean away.
    const isFocus = i === focused;
    const yields = focused !== null && !isFocus;
    const pct = offset * step + (yields ? Math.sign(i - focused) * PUSH : 0);
    return {
      x: `${(pct * 100) / CARD_W}%`,
      y: isFocus ? '-42%' : '-32%',
      rotate: isFocus ? 0 : offset * (11 / gaps),
      scale: isFocus ? 1.06 : 1,
    };
  };

  // Centre card sits on top of the stack, the rest tuck behind it.
  const zOf = (i: number) =>
    i === focused ? peek.length + 1 : peek.length - Math.round(Math.abs(i - mid));

  // Keyboard parity: open the fan on focus-within.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => setOpen(true);
    const off = () => {
      setOpen(false);
      setFocused(null);
    };
    el.addEventListener('focusin', on);
    el.addEventListener('focusout', off);
    return () => {
      el.removeEventListener('focusin', on);
      el.removeEventListener('focusout', off);
    };
  }, []);

  const spring = reduce
    ? { duration: 0 }
    : ({ type: 'spring', bounce: open ? 0.32 : 0.1, duration: open ? 0.55 : 0.3 } as const);

  const total = count ?? items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease, delay: Math.min(index, 6) * 0.05 }}
      className="flex max-w-[320px] flex-col"
    >
      <div
        ref={ref}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => {
          setOpen(false);
          setFocused(null);
        }}
        className="lesson-folder relative aspect-[20/17] w-full [perspective:1000px]"
      >
        {/* back panel: the folder silhouette */}
        <svg viewBox="0 0 400 340" className="folder-back absolute inset-0 h-full w-full" aria-hidden>
          <path d={SILHOUETTE} fill="var(--surface-2)" />
          <path d={SILHOUETTE} fill="none" stroke="var(--hairline)" strokeWidth="1" />
        </svg>

        {/* the items inside, sized in % of the folder */}
        <div className="absolute inset-0 z-0">
          {peek.map((node, i) => (
            <motion.button
              key={node.slug}
              onClick={(e) => {
                e.stopPropagation();
                onOpenItem(node);
              }}
              onMouseEnter={() => setFocused(i)}
              onFocus={() => setFocused(i)}
              aria-label={node.title}
              className="absolute left-1/2 cursor-pointer text-left"
              style={{
                top: '4%',
                width: `${CARD_W}%`,
                marginLeft: `${-CARD_W / 2}%`,
                aspectRatio: '3 / 4',
                zIndex: zOf(i),
              }}
              animate={poseOf(i)}
              transition={{ ...spring, delay: open ? Math.abs(i - mid) * 0.04 : Math.abs(i - mid) * 0.02 }}
            >
              <PeekCard node={node} tilt={tiltOf(i)} />
            </motion.button>
          ))}
        </div>

        {/* front flap: the only other edge, so it reads as a fold, not a card.
            Clicking the flap (title / label) descends into the folder. */}
        <motion.button
          type="button"
          onClick={onOpenFolder}
          aria-label={`Open folder ${title}`}
          className="folder-flap pressable absolute inset-x-0 bottom-0 top-[24%] z-10 cursor-pointer text-left [transform-origin:bottom_center]"
          animate={{ rotateX: open ? -30 : 0 }}
          transition={spring}
        >
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="t-body truncate font-semibold text-ink">{title}</p>
              {meta && <p className="t-caption t-mono mt-1 truncate uppercase text-ink-4">{meta}</p>}
            </div>
            <span
              className="t-caption t-mono shrink-0 rounded-full px-2 py-0.5 text-ink-3"
              style={{ background: 'var(--surface)', border: '0.5px solid var(--hairline)' }}
            >
              {total}
            </span>
          </div>
        </motion.button>
      </div>

      {/* the folder's own blurb, below the object */}
      {blurb && <p className="t-sm mt-5 line-clamp-3 text-ink-3">{blurb}</p>}
    </motion.div>
  );
}

// A miniature of whatever's inside: a lesson renders its diagram or its title,
// an idea renders its kind pill + title, a folder renders a folder icon + name.
// Everything is sized in cqw so it stays proportional at folder scale.
function PeekCard({ node, tilt }: { node: Node; tilt: number }) {
  return (
    <div className="peek-frame h-full w-full" style={{ rotate: `${tilt}deg` }}>
      {node.kind === 'lesson' && node.lesson.diagram ? (
        <figure className="peek-photo">
          {/* Peek diagrams are visible whenever the folder is on-screen (they
              stick out above the flap). Eager decode is fine; lazy caused a
              hover -> visible latency of a second or more on cold edge cache. */}
          <img src={node.lesson.diagram} alt="" decoding="async" />
        </figure>
      ) : node.kind === 'lesson' ? (
        <div className="peek-note">
          <p className="peek-index">{node.lesson.index}</p>
          <p className="peek-title">{node.title}</p>
          <p className="peek-body">{node.lesson.oneLiner}</p>
        </div>
      ) : node.kind === 'idea' ? (
        <div className="peek-note">
          <p className="peek-index" style={{ color: `var(--${node.idea.kind})` }}>
            {node.idea.kind === 'anti' ? 'anti-pattern' : node.idea.kind}
          </p>
          <p className="peek-title">{node.title}</p>
          <p className="peek-body">{node.idea.oneLiner}</p>
        </div>
      ) : (
        <div className="peek-note flex flex-col items-start gap-[6cqw]">
          <span
            className="flex h-[16cqw] w-[16cqw] items-center justify-center rounded-[4cqw]"
            style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
          >
            <FolderIcon size={12} strokeWidth={1.8} />
          </span>
          <p className="peek-title">{node.title}</p>
          <p className="peek-body">{node.blurb}</p>
        </div>
      )}
      <span className="peek-arrow">
        <ArrowUpRight size={10} strokeWidth={2.4} />
      </span>
    </div>
  );
}
