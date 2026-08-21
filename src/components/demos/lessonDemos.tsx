import { useMemo, useState } from 'react';

// Small interactive demos for curriculum lessons. Self-contained, token-styled,
// registered by lesson id in LESSON_DEMOS at the bottom.

const panel: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '0.5px solid var(--hairline)',
};

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2.5" style={panel}>
      <div className="t-caption t-mono uppercase text-ink-4">{label}</div>
      <div
        className="t-lg t-mono mt-0.5 font-semibold"
        style={{ color: accent ? 'var(--accent)' : 'var(--ink)' }}
      >
        {value}
      </div>
    </div>
  );
}

function SegRow<T extends string | number>({
  options, value, onChange, format,
}: { options: T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <div className="flex gap-1 rounded-[var(--r-md)] p-1" style={panel}>
      {options.map((o) => (
        <button
          key={String(o)}
          onClick={() => onChange(o)}
          aria-pressed={o === value}
          className="pressable flex-1 rounded-[var(--r-sm)] px-2.5 py-1.5 t-sm t-mono font-medium"
          style={{
            background: o === value ? 'var(--ink)' : 'transparent',
            color: o === value ? 'var(--bg)' : 'var(--ink-3)',
          }}
        >
          {format ? format(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

// ── 12.01 · patch-grid calculator ───────────────────────────────────────────
export function PatchGridDemo() {
  const [res, setRes] = useState(384);
  const [patch, setPatch] = useState<14 | 16 | 32>(14);

  const grid = Math.floor(res / patch);
  const tokens = grid * grid;
  const CONTEXT = 8192;
  const pct = Math.min(100, (tokens / CONTEXT) * 100);
  const cells = Math.min(grid, 24); // cap the drawn grid so it stays legible

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        {/* the image with its patch grid */}
        <div
          className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-[var(--r-md)]"
          style={{ background: 'linear-gradient(135deg, #7aa7d9 0 55%, #d9c17a 55% 100%)', border: '0.5px solid var(--hairline)' }}
          aria-label={`Image divided into a ${grid} by ${grid} patch grid`}
        >
          <div
            className="absolute inset-0"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cells}, 1fr)`,
              gridTemplateRows: `repeat(${cells}, 1fr)`,
            }}
          >
            {Array.from({ length: cells * cells }, (_, i) => (
              <span key={i} style={{ border: '0.5px solid rgba(20,20,20,0.35)' }} />
            ))}
          </div>
          {grid > cells && (
            <span
              className="absolute bottom-1.5 right-1.5 rounded-[var(--r-sm)] px-1.5 py-0.5 t-caption t-mono"
              style={{ background: 'rgba(20,20,20,0.75)', color: '#fff' }}
            >
              showing {cells}x{cells} of {grid}x{grid}
            </span>
          )}
        </div>

        {/* controls + numbers */}
        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="t-sm font-medium text-ink-2">Resolution</span>
              <span className="t-sm t-mono text-ink-3">{res}px</span>
            </div>
            <input
              type="range" min={224} max={1024} step={32} value={res}
              onChange={(e) => setRes(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
              aria-label="Image resolution in pixels"
            />
          </div>
          <div>
            <span className="t-sm mb-1.5 block font-medium text-ink-2">Patch size</span>
            <SegRow options={[14, 16, 32] as const} value={patch} onChange={setPatch} format={(v) => `${v}px`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Grid" value={`${grid} x ${grid}`} />
            <Stat label="Visual tokens" value={tokens.toLocaleString()} accent />
          </div>
        </div>
      </div>

      {/* context bar */}
      <div className="rounded-[var(--r-md)] p-3.5" style={panel}>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="t-sm font-medium text-ink-2">One image inside an 8k context</span>
          <span className="t-sm t-mono text-ink-3">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--surface)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: pct > 60 ? 'var(--anti)' : 'var(--accent)', transition: 'width 0.25s ease' }}
          />
        </div>
        <p className="t-sm mt-2 text-ink-3">
          tokens = (resolution / patch)&sup2;. Both levers are quadratic; the bar is why image answers cost latency and money.
        </p>
      </div>
    </div>
  );
}

// ── 12.02 · zero-shot similarity ────────────────────────────────────────────
const ZS_IMAGES = [
  { emoji: '🐕', label: 'dog on a beach', sims: [0.31, 0.27, 0.11] },
  { emoji: '🐈', label: 'cat on a sofa', sims: [0.12, 0.33, 0.29] },
  { emoji: '🏔️', label: 'mountain at dawn', sims: [0.24, 0.08, 0.34] },
  { emoji: '🛵', label: 'scooter in a city', sims: [0.19, 0.17, 0.21] },
];
const ZS_PROMPTS = ['a photo of a dog', 'a photo of a cat', 'a photo of a landscape'];

export function ZeroShotDemo() {
  const [img, setImg] = useState(0);
  const sims = ZS_IMAGES[img].sims;
  const max = Math.max(...sims);
  const sorted = [...sims].sort((a, b) => b - a);
  const margin = sorted[0] - sorted[1];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {ZS_IMAGES.map((im, i) => (
          <button
            key={i}
            onClick={() => setImg(i)}
            aria-pressed={i === img}
            className="pressable flex items-center gap-2 rounded-[var(--r-md)] px-3 py-2 t-sm"
            style={{
              background: i === img ? 'var(--ink)' : 'var(--surface-2)',
              color: i === img ? 'var(--bg)' : 'var(--ink-2)',
              border: '0.5px solid var(--hairline)',
            }}
          >
            <span className="text-base">{im.emoji}</span> {im.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 rounded-[var(--r-md)] p-4" style={panel}>
        {ZS_PROMPTS.map((p, i) => {
          const win = sims[i] === max;
          return (
            <div key={i}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="t-sm t-mono" style={{ color: win ? 'var(--accent)' : 'var(--ink-3)' }}>
                  "{p}" {win && '· top-1'}
                </span>
                <span className="t-sm t-mono text-ink-3">{sims[i].toFixed(2)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--surface)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${sims[i] * 250}px`, maxWidth: '100%', background: win ? 'var(--accent)' : 'var(--ink-4)', transition: 'width 0.3s ease' }}
                />
              </div>
            </div>
          );
        })}
        <p className="t-sm mt-1.5 text-ink-3">
          Top-1 wins by a margin of {margin.toFixed(2)}. A ranking this tight is why zero-shot UX should
          show alternatives and allow correction, not present the winner as fact.
        </p>
      </div>
    </div>
  );
}

// ── 12.03 · bridge tradeoff ─────────────────────────────────────────────────
export function BridgeDemo() {
  const [mode, setMode] = useState<'qformer' | 'mlp'>('qformer');
  const tokens = mode === 'qformer' ? 32 : 576;
  const CONTEXT = 8192;
  const perImagePct = (tokens / CONTEXT) * 100;
  const imagesFit = Math.floor((CONTEXT * 0.75) / tokens); // leave room for text
  const sample = 'INVOICE #2214 · Net 30 · $1,842.50';
  // the compressive bridge blurs fine detail; the pass-through keeps it
  const blurred = mode === 'qformer';

  const label = useMemo(
    () => (mode === 'qformer' ? 'Q-Former · compressive (32 tokens/image)' : 'MLP projector · pass-through (576 tokens/image)'),
    [mode],
  );

  return (
    <div className="flex flex-col gap-4">
      <SegRow
        options={['qformer', 'mlp'] as const}
        value={mode}
        onChange={setMode}
        format={(v) => (v === 'qformer' ? 'Q-Former · 32 tok' : 'MLP · 576 tok')}
      />

      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Tokens per image" value={String(tokens)} accent />
        <Stat label="Context per image" value={`${perImagePct.toFixed(1)}%`} />
        <Stat label="Images per chat (8k)" value={`~${imagesFit}`} />
      </div>

      {/* what the LLM "reads" */}
      <div className="rounded-[var(--r-md)] p-4" style={panel}>
        <div className="t-caption t-mono mb-2 uppercase text-ink-4">{label}</div>
        <div
          className="rounded-[var(--r-sm)] px-4 py-6 text-center"
          style={{ background: '#faf6ef', border: '0.5px solid var(--hairline)' }}
        >
          <span
            className="t-lg t-mono font-semibold"
            style={{
              color: '#1a1a1a',
              filter: blurred ? 'blur(2.6px)' : 'none',
              opacity: blurred ? 0.75 : 1,
              transition: 'filter 0.3s ease, opacity 0.3s ease',
            }}
          >
            {sample}
          </span>
        </div>
        <p className="t-sm mt-2.5 text-ink-3">
          {blurred
            ? 'The 32 queries keep the gist ("an invoice, some amounts") and lose the small print. Cheap, fast, more images per conversation.'
            : 'Every patch reaches the LLM, so the exact figures survive. Sharp OCR, but the context fills 18x faster per image.'}
        </p>
      </div>
    </div>
  );
}

// registry: lesson id -> demo component
export const LESSON_DEMOS: Record<string, React.FC> = {
  'p12-01-patch-tokens': PatchGridDemo,
  'p12-02-clip-contrastive': ZeroShotDemo,
  'p12-03-qformer-bridge': BridgeDemo,
};
