import type { Lesson } from '@/lib/lessons';

// Design Engineering · Craft · Visual (DE.CV.01 through DE.CV.09)
// Vault source: C:\\Users\\ashut\\Vault\\20 Areas\\Design Engineering\\Craft-Visual\\
// Each lesson is a rewrite of one atomic vault note, targeted at a designer who builds.
export const deCraftVisual: Lesson[] = [
  {
    id: 'de-cv-oklch',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.01',
    title: 'OKLCH beats hex for palettes that respect perceived brightness',
    oneLiner:
      'OKLCH separates lightness, chroma, and hue on axes tuned to the human eye, so a palette that varies by one axis at a time actually looks like it varies by one axis at a time.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-oklch.png',
    diagramCaption:
      'The oklch.com interactive picker: L, C, and H sliders driving a color patch, with a live sRGB gamut edge.',
    whyItMatters:
      'A hex or HSL palette lies to you. `#3b82f6` and `#eab308` at "the same" HSL lightness look nothing alike: the yellow burns, the blue sinks. That is why hand-tuned Tailwind ramps have three separate people arguing over step 500. In OKLCH, `oklch(0.72 0.15 250)` and `oklch(0.72 0.15 85)` sit at the same perceived brightness, so a text token at L=0.35 stays legible on every hue, and a hover state at L+0.06 shifts by the same visible amount whether the base is red or teal.',
    sections: [
      {
        heading: 'OKLCH is a perceptual model, not just a syntax',
        body: 'OKLCH is a cylindrical form of Oklab, a color space Bjorn Ottosson published in 2020 to fix the parts of CIELAB that still tilted toward blue. Its three axes are Lightness (0 to 1), Chroma (0 to about 0.4 in sRGB), and Hue (0 to 360). Equal steps in L correspond to roughly equal steps in perceived brightness, and hue rotations do not drift lightness the way HSL does. Browsers shipped CSS Color 4 support in 2023, so `color: oklch(0.6 0.18 30)` works today in Chrome, Safari, and Firefox.',
      },
      {
        heading: 'The design payoff is a ramp you can generate',
        body: 'Once L is honest, you can build a 12 step ramp by walking L in fixed increments and holding C constant, then reuse those L values across every hue in the palette. Radix Colors and Vercel\'s Geist accent tokens work this way in spirit: step 9 is always the vibrant "brand" step, step 11 is always the readable text step. That constraint is what makes semantic tokens portable across themes. In HSL you cannot do this because step 500 blue and step 500 yellow disagree about what 500 means.',
      },
      {
        heading: 'Chroma has a ceiling and OKLCH tells you about it',
        body: 'Not every OKLCH triple is displayable on sRGB. High chroma at extreme lightness falls outside the gamut, and browsers clip silently. This is the one gotcha: a color picker like `oklch.com` shows the gamut edge so you can pull chroma back before shipping. For product palettes, staying around C=0.15 to 0.2 for accents and C=0.03 to 0.06 for surfaces keeps every step inside sRGB and inside P3 for wider-gamut screens. Displays gain, tokens do not need to change.',
      },
      {
        heading: 'Migration is a find and replace, not a rewrite',
        body: 'Since OKLCH is CSS-native, you can adopt it token by token. Define `--accent-9: oklch(0.62 0.19 250);` and hex values still work everywhere else. Tools like `oklch.com` and Evil Martians\' converter output the exact syntax. The upgrade is worth doing before you commit to a dark theme: swapping to dark mode in OKLCH is often a two-line change (invert L, keep C and H), where the hex equivalent means hand-picking 40 new colors.',
      },
    ],
    takeaways: [
      'Pick OKLCH when the palette needs to vary by one axis at a time; hex when you are matching a fixed brand color exactly.',
      'A perceptually uniform L axis is what lets one text token work across every accent hue.',
      'Cap chroma around 0.2 for accents and 0.06 for surfaces to stay inside sRGB.',
      'Dark mode in OKLCH is often an L flip. Dark mode in hex is a second palette.',
    ],
    terms: [
      { term: 'OKLCH', meaning: 'CSS color function with lightness, chroma, and hue on perceptually uniform axes.' },
      { term: 'Oklab', meaning: 'The underlying perceptual color space Bjorn Ottosson published in 2020.' },
      { term: 'Chroma', meaning: 'How saturated the color is, from grey at 0 to fully vivid at the gamut edge.' },
      { term: 'Gamut', meaning: 'The set of colors a display can actually show; sRGB is the safest floor.' },
      { term: 'Ramp', meaning: 'An ordered sequence of tints and shades derived from one hue.' },
      { term: 'Perceptual uniformity', meaning: 'Property where equal numeric steps look like equal visual steps to the eye.' },
    ],
    demoCaption:
      'Flip between the same three-step palette expressed in hex and in OKLCH at a shared L. Watch the OKLCH row hold its perceived brightness across hues; the hex row shifts because "same HSL lightness" is not the same thing.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Accent ramp across three hues',
      badLabel: 'Hex at same HSL L',
      goodLabel: 'OKLCH at same L',
      badLines: [
        'blue #3b82f6 sits low and heavy',
        'yellow #eab308 burns brighter than the others',
        'green #22c55e lands somewhere in the middle',
        'the ramp reads as three different weights of accent',
      ],
      badCaption:
        'HSL lightness is a coordinate, not a brightness. Equal L in HSL means unequal L to the eye, which is why hand-tuned palettes always argue about step 500.',
      goodLines: [
        'oklch(0.72 0.15 250) blue at the target L',
        'oklch(0.72 0.15 85) yellow at the same L',
        'oklch(0.72 0.15 145) green at the same L',
        'one text-on-accent token stays legible on all three',
      ],
      goodCaption:
        'OKLCH\'s L axis is perceptually uniform, so a single L value holds across hue. That is what lets one text token, one hover delta, and one dark-mode flip work on the whole palette.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'hex lies about brightness. that is why your palette fights the eye.',
        body:
          'hex lies about brightness. that is why your palette fights the eye.\n\nhsl says #3b82f6 and #eab308 have the same lightness. your eye says they do not. one sinks, one burns.\n\noklch(L C H) puts L on an axis tuned to human perception, so one number means one brightness across every hue.',
      },
      {
        kind: 'X · design angle',
        hook: 'dark mode in oklch is often a two line change.',
        body:
          'dark mode in oklch is often a two line change.\n\ninvert L, keep C and H, done. because L is honest, the flip preserves every relationship in the palette.\n\ndark mode in hex is a second palette, hand picked, kept in sync forever. that is the tax you pay for a lying color space.',
      },
      {
        kind: 'X · one-liner',
        hook: 'step 9 in radix is always the vibrant one because oklch lets it be.',
        body:
          'step 9 in radix is always the vibrant one because oklch lets it be.\n\npick 12 L values, hold chroma, walk through every hue. one ramp per hue, same semantics at every step.\n\nno more arguing about what step 500 means.',
      },
    ],
    source: {
      label: 'Vault note: OKLCH beats hex for palettes that respect perceived brightness',
      url: 'https://bottosson.github.io/posts/oklab/',
    },
  },

  {
    id: 'de-cv-corner-radius',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.02',
    title: 'Concentric corner radii keep nested shapes from looking pinched',
    oneLiner:
      'When one rounded shape sits inside another, the inner radius must equal the outer radius minus the gap between them, or the corners visibly disagree.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-corner-radius.png',
    diagramCaption:
      'Two card-in-card comparisons: outer 16 with inner 8 (concentric, calm) versus outer 16 with inner 12 (pinched, wrong).',
    whyItMatters:
      'Every card with a button in it hits this. Card radius 16, button radius 8, gap 8, and the corners line up. Card radius 16, button radius 12, gap 8, and the button looks squeezed in the top-right corner because its arc bulges out past the card\'s arc. The rule reads like a one-off but it explains why nested elements in Vercel\'s dashboard look calm and nested elements in a hastily built form look off. It is the single fastest way to make a card, drawer, modal, or tooltip stop looking amateur.',
    sections: [
      {
        heading: 'The math is one subtraction',
        body: 'Inner radius equals outer radius minus padding (or minus the gap to the edge). A 20 pixel card with 12 pixel padding wants an inner element radius of 8. A 24 pixel modal with 16 pixel padding wants inner surfaces at radius 8. This produces concentric arcs: the two curves share a center, so the eye reads them as parallel. Break the rule and the arcs cross, and the visual weight in that corner jumps. Apple\'s Human Interface Guidelines call these "continuous corners" and explicitly recommend the concentric rule for anything nested.',
      },
      {
        heading: 'The rule fails in two predictable directions',
        body: 'The first failure is the pinched corner: inner radius too large, curves cross, the inner shape looks trapped. The second is the floating corner: inner radius set to zero when the outer is rounded, so the sharp inner edge sits inside a soft outer edge and looks like a bug. The second is more common in engineer-authored UI because "radius: 0" reads as "no radius." It is not; it is a rectangle inside a rounded shape, and it reads as unfinished.',
      },
      {
        heading: 'Token the outer radius, derive the inner',
        body: 'Store one radius scale (say 4, 8, 12, 16, 20, 24) and one padding scale on the same grid, then let the inner radius be `--radius-outer - var(--padding)`. In practice this means naming your radii semantically (`--radius-card`, `--radius-control`, `--radius-chip`) and letting each pair sit at a known offset. Vercel Geist and shadcn/ui both bake this in; when you set `--radius: 0.5rem` on the root, controls inside cards get a smaller derived radius automatically.',
      },
      {
        heading: 'Continuous corners are a separate lever',
        body: 'macOS and iOS use "squircles," where the curvature ramps up gradually instead of jumping from straight edge to circular arc. CSS is catching up (`corner-shape: squircle` is in draft), but for now, a slightly larger radius plus a tiny bit of overshoot in an SVG icon container mimics the effect on the web. This matters most at large radii (24 and up), where a circular arc starts to look like a stadium shape and a continuous corner keeps it feeling rectangular.',
      },
    ],
    takeaways: [
      'Set inner radius = outer radius minus padding. That is the whole rule.',
      'Radius 0 inside a rounded parent reads as a bug, not a choice.',
      'Token the outer radius, derive the inner in CSS.',
      'At radii above 20, the difference between circular and continuous corners becomes visible.',
    ],
    terms: [
      { term: 'Concentric', meaning: 'Two arcs sharing the same center, so their curves stay parallel.' },
      { term: 'Continuous corner', meaning: 'A rounding that eases in gradually, like Apple\'s squircle, instead of a hard arc.' },
      { term: 'Radius token', meaning: 'A named value in the design system for a specific role, like `--radius-card`.' },
      { term: 'Padding', meaning: 'The inset from a container\'s edge to its content.' },
      { term: 'Pinched corner', meaning: 'The visual bug where an inner shape\'s arc bulges past its container\'s arc.' },
      { term: 'Overshoot', meaning: 'Deliberately extending a shape past its bounding box to correct optical size.' },
    ],
    demoCaption:
      'A card with a nested button. Flip between the wrong nested radius (button 12 inside card 16 with 8 padding, arcs cross) and the correct one (button 8, arcs share a center).',
    demo: {
      archetype: 'before-after',
      subject: 'Card 16, padding 8',
      badLabel: 'Inner radius 12',
      goodLabel: 'Inner radius 8',
      badLines: [
        'card corner arc: 16',
        'padding to inner edge: 8',
        'inner button radius: 12',
        'inner arc bulges past the outer arc',
        'top-right corner reads as pinched',
      ],
      badCaption:
        'Inner radius larger than outer minus padding means the two arcs cross. The eye reads that as a visual bug even when nothing has been misaligned in the layout.',
      goodLines: [
        'card corner arc: 16',
        'padding to inner edge: 8',
        'inner button radius: 8',
        'both arcs share a center',
        'the corner reads as calm',
      ],
      goodCaption:
        'Inner radius equals outer minus padding, so the two curves stay parallel. Token the outer radius, derive the inner in CSS, and this becomes free at every nesting level.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the pinched corner has one cause and one fix.',
        body:
          'the pinched corner has one cause and one fix.\n\ncause: inner radius larger than outer minus padding. the two arcs cross, the eye reads the bulge as a bug.\n\nfix: inner = outer minus padding. two concentric arcs, one calm corner. token the outer, derive the inner in css.',
      },
      {
        kind: 'X · design angle',
        hook: 'radius 0 inside a rounded parent is not "no radius." it is a rectangle in a squircle.',
        body:
          'radius 0 inside a rounded parent is not "no radius." it is a rectangle in a squircle.\n\nan engineer reads radius: 0 as absent. the eye reads it as present and wrong. sharp inner edge, soft outer edge, unfinished.\n\nif the parent is rounded, the child gets a derived radius, never zero.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the difference between vercel-calm and hastily-built is one subtraction.',
        body:
          'the difference between vercel-calm and hastily-built is one subtraction.\n\ninner radius equals outer radius minus padding. that is it. once you see the rule, every card-in-card in your product either follows it or does not.',
      },
    ],
    source: {
      label: 'Vault note: Concentric corner radii keep nested shapes from looking pinched',
      url: 'https://developer.apple.com/design/human-interface-guidelines/',
    },
  },

  {
    id: 'de-cv-optical-alignment',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.03',
    title: 'Optical alignment beats mathematical alignment when the eye is the judge',
    oneLiner:
      'Mathematically centered shapes often look off-center because the eye weights mass and negative space, not bounding boxes; you nudge until it looks right, not until the numbers match.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-optical-alignment.png',
    diagramCaption:
      'A play triangle in a circular button, shown twice: math-centered (leaning left) and optically nudged 2 px right (balanced).',
    whyItMatters:
      'A play triangle centered in a circular button by CSS transform sits visibly too far left. A capital T centered in a chip sits too high because there is nothing below its baseline. A right-pointing chevron in a button sits too close to the label. Every one of these looks fine in Figma\'s align panel and wrong in the shipped product. The fix is a two to four pixel nudge that no linter will ever suggest. Learning to see the difference is the fastest single upgrade to visual craft: it turns "I don\'t know what feels off" into a specific offset in a token.',
    sections: [
      {
        heading: 'The eye centers optical mass, not bounding boxes',
        body: 'A triangle pointing right has its mass on the left half; the vertical apex has almost no weight. Mathematical center puts equal empty space on both sides, so the mass sits left of center and the shape reads as leaning. Optical center shifts the shape right until the perceived mass is balanced, typically 1 to 3 percent of the containing width. The same happens with letterforms: an "O" is drawn slightly taller than an "H" so both look the same height. Type designers call this overshoot, and every serious typeface uses it.',
      },
      {
        heading: 'Common places the fix pays off',
        body: 'Play buttons in video players (offset the triangle 1 to 2 pixels right). Icons in circular avatar frames (arrows and chevrons want a nudge toward their pointed end). Text on chips and pills (baseline tends to sit too low because letters have descenders below the baseline; nudge the label up 1 pixel). App icons on iOS (the icon grid overshoots the mask). Button labels next to leading icons (the icon feels too close because it has no ascender; add 2 pixels of extra spacing on the icon side).',
      },
      {
        heading: 'Tokenize the nudges, do not hard-code them',
        body: 'Store optical corrections as named tokens: `--icon-nudge-x-play: 1px`, `--label-nudge-y-chip: -1px`. Then wire them into the component. This is what stops a designer\'s optical fix from being reverted by the next engineer who reads "why is this 1 pixel off center." Rauno\'s craft site and Refactoring UI both make this argument: the fix has to survive code review, and a named token is how it does.',
      },
      {
        heading: 'When to skip the correction',
        body: 'Optical alignment is a polish pass, not a foundation. Skip it while wiring states and edges; return to it once the component is otherwise done. Skip it entirely for large text (over 32 px) where the correction is subvisible, and for icons at 12 px or smaller where the render grid rounds everything to whole pixels anyway. And skip it when the container is asymmetric: if a card has different top and bottom padding for a reason, the eye will not read a centered element as centered no matter what you do.',
      },
    ],
    takeaways: [
      'If it looks off by one or two pixels, it is off by one or two pixels; ship the nudge.',
      'Triangles and chevrons want to move toward their pointed end.',
      'Store optical corrections as named tokens so they survive code review.',
      'Do the pass last, once the states are done.',
    ],
    terms: [
      { term: 'Optical center', meaning: 'Where a shape\'s perceived mass balances, not where its bounding box does.' },
      { term: 'Overshoot', meaning: 'A letter or shape drawn slightly beyond its nominal height so it looks the same size as its neighbors.' },
      { term: 'Mathematical center', meaning: 'The midpoint of a bounding box; often visually wrong for asymmetric shapes.' },
      { term: 'Nudge', meaning: 'A small offset (1 to 3 pixels) applied to correct optical alignment.' },
      { term: 'Descender', meaning: 'The part of a letter that drops below the baseline, like the tail of a "y."' },
      { term: 'Baseline', meaning: 'The invisible line letters sit on, ignoring descenders.' },
    ],
    demoCaption:
      'A play triangle inside a circular button. Toggle between math center (transform-based) and optical center (2 px right nudge tokenized). The bounding boxes agree; only one looks right.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Play button',
      badLabel: 'Math center',
      goodLabel: 'Optical center',
      badLines: [
        'triangle placed at transform: translate(-50%, -50%)',
        'bounding box exactly centered in the circle',
        'perceived mass sits left of the vertical apex',
        'the button reads as leaning left',
      ],
      badCaption:
        'The math is right and the picture is wrong. A right-pointing triangle carries its mass on the left, so equal empty space on both sides puts the weight off center.',
      goodLines: [
        'triangle offset +2 px on the x axis',
        'stored as --icon-nudge-x-play',
        'wired into the component, not hand-tuned',
        'the eye reads the shape as balanced',
      ],
      goodCaption:
        'The nudge shifts the mass, not the box, to the center. Tokenize the correction so the next engineer does not undo it in the name of "cleaning up a magic number."',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'the play triangle leans left because triangles carry mass on the flat side.',
        body:
          'the play triangle leans left because triangles carry mass on the flat side.\n\nmath center puts equal empty space on both sides. optical center puts equal mass on both sides. those are different targets.\n\nnudge the triangle 1 to 2 px toward the point. every video player you have ever loved does this.',
      },
      {
        kind: 'X · design angle',
        hook: 'the difference between "feels off" and shipped-craft is 2 pixels.',
        body:
          'the difference between "feels off" and shipped-craft is 2 pixels.\n\nchevrons in buttons, letters in chips, icons in avatar circles. all sit wrong when centered by math. all sit right when nudged toward the mass.\n\ndo the pass last, tokenize the nudge, keep it out of review arguments.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the align panel is a coordinate, not a judgment.',
        body:
          'the align panel is a coordinate, not a judgment.\n\nfigma centers the bounding box. the eye centers the mass. when those disagree, the eye wins and no linter will tell you why.\n\nsee the offset, tokenize the offset, move on.',
      },
    ],
    source: {
      label: 'Vault note: Optical alignment beats mathematical alignment when the eye is the judge',
      url: 'https://www.refactoringui.com',
    },
  },

  {
    id: 'de-cv-type-scale',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.04',
    title: 'A modular type scale is a compression algorithm for hierarchy',
    oneLiner:
      'Picking a base size and a ratio (say 16 px times 1.25) generates every heading you will ever need, so hierarchy stops being a series of guesses and becomes a single decision.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-type-scale.png',
    diagramCaption:
      'The Vercel Geist typography scale: eight steps derived from a base and a ratio, with H1 and body text at non-adjacent steps.',
    whyItMatters:
      'Without a scale, every new template invents new sizes: an h1 at 30, an h2 at 22, a lead at 18, a caption at 13. Six months in, the tokens table has 14 sizes and nobody remembers which is for what. With a scale, you have six or seven steps and every heading maps to one of them. That constraint is what makes a design system portable across surfaces (marketing site, docs, app) and what makes AI generated layouts stop looking chaotic: the model can only pick from the scale you gave it.',
    sections: [
      {
        heading: 'The ratio is a design decision, not a taste one',
        body: 'Common ratios: 1.125 (major second), 1.2 (minor third), 1.25 (major third), 1.333 (perfect fourth), 1.414 (augmented fourth), 1.618 (golden). Smaller ratios (1.125 to 1.2) keep the scale tight, useful for dense apps like Linear or dashboards where a heading is only a step above body text. Larger ratios (1.333 and up) create dramatic hierarchy for marketing sites. Pick once at the start of the system; the ratio propagates through every heading, and swapping it later means retyping every layout.',
      },
      {
        heading: 'The scale generates line-height and spacing too',
        body: 'Once type sizes are on a scale, you can derive line-height as a per-step token (tighter as size grows) and vertical rhythm as multiples of the base. This is where the "compression" part earns its keep: instead of remembering that h1 is 32/40 and h2 is 24/32, you know that each step has a line-height token attached, and the spacing above and below headings falls out of the same grid. Utopia and Type-scale.com both expose this: pick a ratio, get the whole system.',
      },
      {
        heading: 'The scale should not be visible in the UI',
        body: 'A scale is not a hierarchy. Two neighboring text elements in an app should almost always be one step apart on the scale, not adjacent steps in the layout. A card title at step 2 sits next to body text at step 0, skipping step 1 to make the size difference read. If you use every step of the scale in one screen, the hierarchy collapses because there is nowhere for the eye to rest. Vercel Geist ships eight steps and most screens use three of them.',
      },
      {
        heading: 'Fluid scales replace media queries',
        body: 'The next move is to make each step scale with the viewport. Utopia generates a scale where step 3 might be 24 px at 320 px wide and 32 px at 1440 px wide, using `clamp()` and linear interpolation. This kills the "font is too small on mobile" and "font is too big on desktop" tuning that used to happen in a stack of media queries. Combined with a modular scale, you get one function per step that gives you the right size at any width.',
      },
    ],
    takeaways: [
      'Pick one ratio and one base size before writing any headings.',
      'Ratio 1.125 to 1.2 for dense apps; 1.333 and up for marketing.',
      'Two neighboring elements should be a step apart, not adjacent on the scale.',
      'Fluid scales via `clamp()` replace most typography media queries.',
    ],
    terms: [
      { term: 'Type scale', meaning: 'An ordered set of font sizes generated by a base size and a ratio.' },
      { term: 'Ratio', meaning: 'The multiplier between consecutive steps in the scale, like 1.25.' },
      { term: 'Base size', meaning: 'The step everything else is derived from, usually 16 px for body text.' },
      { term: 'Step skipping', meaning: 'Using non-adjacent steps in one layout to make hierarchy legible.' },
      { term: 'Fluid scale', meaning: 'A scale where each step interpolates between two viewport widths.' },
      { term: 'Line-height token', meaning: 'The line-height paired with a specific type size step.' },
    ],
    demoCaption:
      'Drag the ratio slider and watch the H1 pull away from body text. Small ratios keep H1 and body close (dense app feel); large ratios push them apart (marketing feel).',
    demo: {
      archetype: 'slider-map',
      sliderLabel: 'Scale ratio (1.1 to 1.6)',
      outputLabel: 'H1 vs body size ratio',
      badCaption:
        'Without a scale, every heading is its own decision. Six months in you have 14 sizes and no rule for picking the next one.',
      goodCaption:
        'One ratio, one base. Every heading falls out of a small set of steps. The design system stays portable, and AI-generated layouts can only pick from your scale, not their own.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a type scale is not aesthetics, it is a compression algorithm.',
        body:
          'a type scale is not aesthetics, it is a compression algorithm.\n\npick a base (16) and a ratio (1.25). now every heading is a step, not a taste call. line height and vertical rhythm derive from the same grid.\n\n6 tokens replace 40 magic numbers, and nothing in the ui is a coin flip.',
      },
      {
        kind: 'X · design angle',
        hook: 'ai layouts stop looking chaotic when you give the model a scale.',
        body:
          'ai layouts stop looking chaotic when you give the model a scale.\n\nno scale: the model picks a size for every heading. with a scale: it has six options and has to pick one. the constraint is what makes generated ui feel authored.\n\nthe scale is the contract you hand the generator.',
      },
      {
        kind: 'X · one-liner',
        hook: 'two neighboring headings on adjacent steps read as noise.',
        body:
          'two neighboring headings on adjacent steps read as noise.\n\nskip a step. card title on step 2, body on step 0. the size difference has to be big enough that the eye reads intent, not a rounding error.\n\ngeist ships 8 steps and most screens use 3.',
      },
    ],
    source: {
      label: 'Vault note: A modular type scale is a compression algorithm for hierarchy',
      url: 'https://utopia.fyi/type/calculator/',
    },
  },

  {
    id: 'de-cv-clamp',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.05',
    title: 'clamp() ties font size to the viewport without a media query',
    oneLiner:
      '`clamp(min, preferred, max)` picks the middle value while it stays inside the min-max range, and clamps to the edges outside it, so one line replaces a stack of media query overrides.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-clamp.png',
    diagramCaption:
      'The Utopia clamp calculator: two endpoints (16 px at 320 wide, 24 px at 1440 wide) turned into one `clamp()` string.',
    whyItMatters:
      'Media query typography looks like stairs: 18 px until 768, then 20 px until 1024, then 24. Between breakpoints, the size does not respond, and at the breakpoint it jumps. `clamp()` smooths the ramp. `font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem)` starts at 16 px on small screens, grows with viewport width, and stops at 24 px. There are no breakpoints in the rule, no branches to review, and the size is right at every width in between. For a design engineer, this collapses a table of type + breakpoints down to one function per step of the scale.',
    sections: [
      {
        heading: 'The middle argument is a linear function of the viewport',
        body: 'The trick is the `preferred` value: a mix of `rem` and `vw`. `rem` anchors the line, `vw` gives it slope. `0.5rem + 2vw` at 320 px viewport is 14.4 px, at 1440 px viewport is 36.8 px, clamped to the min and max. To get a specific pair of endpoints (say 16 px at 320 and 24 px at 1440), solve two equations for the rem constant and the vw coefficient. Utopia\'s calculator does this for you and outputs the exact `clamp()` string.',
      },
      {
        heading: 'Accessibility does not disappear if you use rem',
        body: 'The one real pitfall: use `rem` for the min and max, not `px`. If the user bumps their browser\'s default font size, a `clamp(16px, ..., 24px)` will not respond, and screen readers will report accessibility complaints. `clamp(1rem, ..., 1.5rem)` scales with user preference. The `vw` in the middle is fine because it drives the interpolation, not the endpoints. This is the single most common bug in fluid typography reviews.',
      },
      {
        heading: 'Fluid spacing works the same way',
        body: 'The same technique works for margins, padding, and gaps. `padding: clamp(1rem, 0.5rem + 2vw, 3rem)` gives you a section that breathes with the viewport. Combining fluid type and fluid spacing at matching slopes keeps the visual rhythm consistent: text and whitespace grow together. Utopia calls this "fluid space," and it is the reason a well-tuned marketing page can drop all its `@media` queries for layout.',
      },
      {
        heading: 'Where to still use a media query',
        body: '`clamp()` is for continuous properties. When the layout structure changes (a sidebar collapses, a nav becomes a hamburger, a two-column grid becomes one), you still need a container query or media query, because the change is discrete. The rule is: use `clamp()` for anything that has a smooth curve between two sizes, and a query for anything that is a switch. Most typography and spacing is smooth; most structural layout is a switch.',
      },
    ],
    takeaways: [
      'Use `clamp()` for one-line fluid type and spacing, not a stack of media queries.',
      'Use `rem` for min and max so the user\'s font-size preference still works.',
      'Utopia generates the exact `clamp()` string from two endpoints.',
      'Media and container queries stay useful for structural switches, not size ramps.',
    ],
    terms: [
      { term: 'clamp()', meaning: 'CSS function that returns the middle value if it is between min and max, otherwise the boundary.' },
      { term: 'Preferred value', meaning: 'The middle argument to `clamp()`, usually a mix of `rem` and `vw`.' },
      { term: 'vw', meaning: 'Viewport width unit: 1 vw is 1 percent of the viewport\'s current width.' },
      { term: 'Fluid typography', meaning: 'Font sizes that interpolate between two viewport widths without breakpoints.' },
      { term: 'Container query', meaning: 'A CSS rule that responds to a container\'s size, not the viewport\'s.' },
      { term: 'rem', meaning: 'Font size relative to the root `html` element; scales with user preference.' },
    ],
    demoCaption:
      'Drag the viewport width slider and watch a single `clamp(1rem, 0.5rem + 2vw, 1.5rem)` produce the right size at every width. No breakpoints, no stairs.',
    demo: {
      archetype: 'slider-map',
      sliderLabel: 'Viewport width (320 to 1440)',
      outputLabel: 'font-size in px',
      badCaption:
        'Media queries produce stairs. Between breakpoints the size does not respond; at each breakpoint it jumps. Reviewers argue about which breakpoints matter.',
      goodCaption:
        '`clamp(min, preferred, max)` is a linear ramp with two ceilings. One line per step of the scale, no branches, the size is right at every width in between.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'clamp is a linear ramp with two ceilings.',
        body:
          'clamp is a linear ramp with two ceilings.\n\nmin holds the low end. max holds the high end. the middle argument (rem + vw) interpolates between them.\n\nno breakpoints, no branches. one function per step, right at every width in between. the stairs are gone.',
      },
      {
        kind: 'X · design angle',
        hook: 'the most common fluid type bug is px in the min and max.',
        body:
          'the most common fluid type bug is px in the min and max.\n\na user bumps browser default font size, clamp(16px, ..., 24px) ignores them. clamp(1rem, ..., 1.5rem) responds.\n\nvw in the middle is fine, it drives the ramp, not the endpoints. rem where the ceilings live.',
      },
      {
        kind: 'X · one-liner',
        hook: 'clamp handles smooth. media queries handle switches.',
        body:
          'clamp handles smooth. media queries handle switches.\n\nsize ramps and padding curves are smooth, use clamp. sidebar collapses and hamburgers appear, use a query. mixing the two is what makes fluid layouts unreviewable.\n\npick the tool per property, not per project.',
      },
    ],
    source: {
      label: 'Vault note: clamp() ties font size to the viewport without a media query',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clamp',
    },
  },

  {
    id: 'de-cv-semantic-tokens',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.06',
    title: 'Semantic tokens name intent; raw values name pigment',
    oneLiner:
      'A palette of raw colors ("blue-500") tells you what the color is; a semantic token ("--color-accent") tells you where it goes, and only the second one survives a theme change.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-semantic-tokens.png',
    diagramCaption:
      'The shadcn/ui theming table: `--background` and `--foreground` semantic tokens on the left, dark-mode reassignments on the right.',
    whyItMatters:
      'If a button reads `background: var(--blue-500)`, dark mode means editing every instance. If it reads `background: var(--color-accent)`, dark mode is one token override in a `[data-theme=\'dark\']` block. The semantic layer is the pointer that lets themes, brand pivots, and per-tenant customization happen without touching component code. shadcn/ui, Radix, and every serious design system since 2020 have converged on the same pattern: two tiers, primitives (raw) and semantics (aliases), and components only reference the second tier.',
    sections: [
      {
        heading: 'The two-tier structure has a reason',
        body: 'Tier one is the primitive: `--gray-100`, `--gray-900`, `--blue-500`. Tier two is the alias: `--surface-1`, `--text-default`, `--accent`. Components only reference tier two. A theme is a redefinition of tier two, pointing at different tier-one values. This is what lets one component library ship in ten brands: the primitives change per brand, the semantics stay identical, the components never move. Nathan Curtis at EightShapes wrote the canonical piece; Amy Hupe has a maturity model for it.',
      },
      {
        heading: 'Naming semantics by intent, not by looks',
        body: 'The trap is naming semantic tokens after appearance: `--color-blue-button` reads like a semantic token and is not. `--color-primary-action` is. Once you rename it "blue button," you cannot theme it, because the name has locked in the appearance. Good semantic names describe role, state, and hierarchy: `--text-primary`, `--text-muted`, `--text-danger`, `--surface-raised`, `--border-subtle`. If the name would still make sense in a completely different color palette, it is a real semantic.',
      },
      {
        heading: 'Tokens are not just colors',
        body: 'The same tier-one and tier-two structure applies to spacing (`--space-4` primitive, `--gap-card` semantic), radii (`--radius-8` primitive, `--radius-card` semantic), and shadow (`--shadow-2` primitive, `--elevation-popover` semantic). Every axis of the design system gets both layers. This is what "tokens all the way down" means when Amy Hupe and Nathan Curtis say it. The payoff is that a redesign becomes a token swap, not a component rewrite.',
      },
      {
        heading: 'Enforce with lint, not with hope',
        body: 'The failure mode is a hurry: a component uses `#3b82f6` instead of `var(--color-accent)`, and a year later, a rebrand touches 200 files. Stylelint plugins and ESLint rules can flag any raw hex, `rgb()`, or px value in a component file. shadcn/ui ships this discipline by default; Vercel\'s Geist enforces it in review. The tokens do not do the work; the enforcement does.',
      },
    ],
    takeaways: [
      'Two tiers: primitives are raw, semantics are aliases; components use semantics.',
      'Name semantics by role, not by appearance ("accent" not "blue").',
      'Apply the two-tier structure to spacing and radii, not just color.',
      'Lint out raw values in component files or the discipline decays.',
    ],
    terms: [
      { term: 'Primitive token', meaning: 'The raw value: a specific color, size, or radius.' },
      { term: 'Semantic token', meaning: 'An alias that names role and points at a primitive.' },
      { term: 'Theme', meaning: 'A set of overrides applied to the semantic layer.' },
      { term: 'Alias', meaning: 'A token whose value is another token.' },
      { term: 'Token tier', meaning: 'A named layer in a two- or three-tier token system.' },
      { term: 'Design token', meaning: 'Any named value in the design system, primitive or semantic.' },
    ],
    demoCaption:
      'Toggle between a component styled with raw hex and one styled with semantic tokens. Only the second responds to a dark-mode flip; the first would need a hand edit at every call site.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Button styling',
      badLabel: 'Raw hex',
      goodLabel: 'Semantic token',
      badLines: [
        '`background: #3b82f6`',
        '`color: #ffffff`',
        '`border: 1px solid #dbeafe`',
        'dark mode requires editing every instance in every component',
        'a rebrand touches 200 files',
      ],
      badCaption:
        'The hex value tells you the pigment. It does not tell you the role. There is no hook a theme can grab, so every theme change is a component rewrite.',
      goodLines: [
        '`background: var(--accent)`',
        '`color: var(--accent-foreground)`',
        '`border: 1px solid var(--accent-border)`',
        'dark mode is one override block',
        'a rebrand is a token swap, not a codebase edit',
      ],
      goodCaption:
        'Semantic names describe role, not appearance. Themes redefine the semantic layer, components never move, and lint catches any component that reaches through to a raw value.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a hex value is a pigment. a semantic token is a pointer.',
        body:
          'a hex value is a pigment. a semantic token is a pointer.\n\ncomponents reference --accent, not #3b82f6. themes rebind --accent, not every component. one indirection, and dark mode goes from a codebase edit to one override block.\n\ntwo tiers, one rule: components use the second tier.',
      },
      {
        kind: 'X · design angle',
        hook: '--color-blue-button reads like a semantic token and is not.',
        body:
          '--color-blue-button reads like a semantic token and is not.\n\nthe name locked in the appearance. you cannot theme it without lying. --color-primary-action is a real semantic, because the name still makes sense in green, in monochrome, in a client\'s brand.\n\nname by role. never by pigment.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the tokens do not do the work. the lint does.',
        body:
          'the tokens do not do the work. the lint does.\n\nany component that reaches through to a raw hex, rgb, or px value is a future rebrand bug. stylelint and eslint can flag them at the review stage.\n\nshadcn ships this by default. geist enforces it in review. no discipline survives a hurry without a rule.',
      },
    ],
    source: {
      label: 'Vault note: Semantic tokens name intent; raw values name pigment',
      url: 'https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e4a0644739a',
    },
  },

  {
    id: 'de-cv-grid',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.07',
    title: 'A 4 or 8 pixel grid is a token library, not a rule',
    oneLiner:
      'Committing to a 4 or 8 pixel spacing grid does not mean every gap is 4 or 8; it means every gap comes from a small set of tokens that are multiples of your base, so spacing decisions collapse to picking a step.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-grid.png',
    diagramCaption:
      'The Vercel Geist spacing scale: eight non-linear steps (4, 8, 12, 16, 24, 32, 48, 64) covering every product surface.',
    whyItMatters:
      'Freeform spacing produces components where the gap above a card is 14, the gap below is 18, and nobody can explain why. On a grid, the same layout uses gap-4 (16 px) or gap-6 (24 px), and the choice is visible in review. Tailwind\'s spacing scale, Material\'s 4 dp grid, Geist\'s 4 pixel base, and Apple\'s 8 point grid all encode the same idea: bound the spacing vocabulary so a designer can pick from six options instead of an integer number line.',
    sections: [
      {
        heading: 'Pick 4 or 8, not both',
        body: 'The two live conventions: base-4 (Tailwind, Vercel Geist) with steps at 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, and base-8 (Apple, most iOS work) with steps at 0, 8, 16, 24, 32, 40, 48. Base-4 is finer, useful for text-heavy dense product UIs. Base-8 is coarser and enforces a stronger rhythm at the cost of some flexibility. Pick one and never mix; the mixing is what causes half-steps to creep in. Material Design uses 4 dp because Android densities are 4 point aligned.',
      },
      {
        heading: 'The scale should not be linear',
        body: 'Once you commit to a base, a linear scale (4, 8, 12, 16, 20, 24, 28, 32) does not compress well. Most systems shift to non-linear steps at the large end (4, 8, 12, 16, 24, 32, 48, 64), matching a rough 1.5x ratio. This is because differences between 40 and 48 read as noise; differences between 32 and 48 read as intent. The gap between a card and its container reads as different from the gap between two cards, and the scale should support that difference.',
      },
      {
        heading: 'The grid applies to every axis',
        body: 'Padding, margin, gap, icon size, radius, and even line-height should be tokens on the grid. If padding steps at 4 and icons come in 12, 16, 20, 24, then icon and text spacing stay aligned by construction. This is the single biggest reason Geist and shadcn look "engineered": the same eight numbers show up everywhere. Radix Colors adds a matching set of alpha steps and even those obey a rhythm.',
      },
      {
        heading: 'Off-grid values earn a comment',
        body: 'There are legitimate reasons to break the grid: a 1 px hairline, an optical offset, a translated string that needs a 2 px overshoot. Break it, but not silently. The rule is that any off-grid value in a component file needs a comment explaining why. That is what stops one exception from becoming permission for the next fifty. Tailwind supports this via arbitrary values `p-[7px]` and the JIT warning that catches it in review.',
      },
    ],
    takeaways: [
      'Pick base-4 or base-8 at system inception and do not mix.',
      'Non-linear steps compress better than linear ones once the values grow.',
      'Apply the grid to padding, gap, icon size, and radius, not just margin.',
      'Off-grid values need a comment; that is what makes exceptions rare.',
    ],
    terms: [
      { term: 'Base grid', meaning: 'The multiple every spacing token derives from, usually 4 or 8.' },
      { term: 'Spacing token', meaning: 'A named step on the grid, like `--space-4` for 16 px.' },
      { term: 'Non-linear scale', meaning: 'A scale where step differences grow, like 4, 8, 12, 16, 24, 32, 48.' },
      { term: 'Rhythm', meaning: 'The consistent spacing pattern that binds a layout together.' },
      { term: 'dp', meaning: 'Density-independent pixel, Android\'s unit that scales with screen density.' },
      { term: 'Half-step', meaning: 'An off-grid value like 6 or 10 that breaks the rhythm.' },
    ],
    demoCaption:
      'The same card laid out with arbitrary pixel spacing (14, 18, 22) versus a base-4 grid (16, 16, 24). One decision, one rhythm.',
    demo: {
      archetype: 'toggle-fix',
      subject: 'Card spacing',
      badLabel: 'Freeform pixels',
      goodLabel: 'Base-4 grid',
      badLines: [
        'padding-top: 14',
        'gap between title and body: 18',
        'padding-bottom: 22',
        'nobody in review can explain why any number was picked',
        'six months in, the tokens table has 14 sizes',
      ],
      badCaption:
        'Freeform spacing is a decision at every gap. Reviewers cannot compare 14 to 18 without asking why, and half-steps creep in because no rule blocks them.',
      goodLines: [
        'padding-top: var(--space-4) (16)',
        'gap: var(--space-4) (16)',
        'padding-bottom: var(--space-6) (24)',
        'the choice is visible: one step or two',
        'the same eight numbers show up everywhere in the product',
      ],
      goodCaption:
        'On a grid, the decision collapses from "which integer" to "which step." Geist ships eight non-linear steps and covers every surface with them; the rhythm is what makes the product look engineered.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'a 4px grid is not a rule. it is a token library.',
        body:
          'a 4px grid is not a rule. it is a token library.\n\nthe grid does not say every gap is 4. it says every gap picks from a small set of multiples of 4. 4, 8, 12, 16, 24, 32, 48. six steps, one rhythm, no half-step arguments in review.\n\nthe constraint is what makes the vocabulary small.',
      },
      {
        kind: 'X · design angle',
        hook: 'linear scales compress badly. non-linear ones read as intent.',
        body:
          'linear scales compress badly. non-linear ones read as intent.\n\n40 to 48 reads as noise. 32 to 48 reads as a decision. that is why every good spacing scale jumps at the large end, roughly 1.5x per step.\n\nthe eye rewards intent. the scale should give it something to notice.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the fastest way to spot a system without a grid is to open devtools.',
        body:
          'the fastest way to spot a system without a grid is to open devtools.\n\nmargin: 14. padding: 18. gap: 22. every number a fresh decision, none of them justifiable in review.\n\non a grid, the same eight numbers show up in every component, and the rhythm binds the product together for free.',
      },
    ],
    source: {
      label: 'Vault note: A 4 or 8 pixel grid is a token library, not a rule',
      url: 'https://vercel.com/geist/design/spacing',
    },
  },

  {
    id: 'de-cv-contrast',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.08',
    title: 'Contrast and hairlines are the whole difference between elevation and noise',
    oneLiner:
      'Elevation is not a shadow: it is a hierarchy of contrast between adjacent surfaces plus a hairline border, and shadows are what you add only when contrast and hairlines are not enough on their own.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-contrast.png',
    diagramCaption:
      'A Linear card at three elevation tiers, each a slightly lighter surface with a 0.5 px hairline; a soft shadow enters only at the top tier.',
    whyItMatters:
      'Cards that use nothing but drop shadows to signal elevation stack into a shadow-on-shadow soup at three levels deep. The Linear, Vercel, and Radix approach shows the alternative: each surface tier is a slightly different background, separated by a 1 px (or 0.5 px on Retina) border in a color one tick above the surface. The eye reads the border, not the shadow, and the design stays crisp at every zoom level. This is the single biggest gap between an "AI-generated dashboard" look and a shipping product look.',
    sections: [
      {
        heading: 'Contrast is quantifiable, guess less',
        body: 'WCAG 2.2 requires 4.5:1 contrast for body text and 3:1 for large text against the surface. That is the floor. Structural elements (borders, dividers, disabled controls) should be visible but subordinate: 1.5:1 to 2:1 against the surface reads as "there but not shouting." APCA, the newer perceptual model that will replace WCAG\'s math, distinguishes text weight and size in a way WCAG 2 does not. For product UI in 2026, ship to WCAG 2.2 AA and check with APCA for the details. `webaim.org/resources/contrastchecker` is the workhorse.',
      },
      {
        heading: 'Hairlines carry information at 1 px or less',
        body: 'A 1 px border in a subtle grey is the cheapest, sharpest way to separate two adjacent surfaces of similar brightness. On Retina and 2x displays, 0.5 px hairlines are drawable via `border-width: 0.5px` (Safari) or `box-shadow: inset 0 0 0 0.5px` and read as even sharper. Linear ships 0.5 px borders on every card in their app. The border color is typically the surface color\'s step 6 or 7 in a Radix-style scale: dark enough to see, light enough not to fight the content.',
      },
      {
        heading: 'Shadows come last, and small',
        body: 'Once contrast and hairlines are working, a shadow adds "this surface is floating above." Keep the elevation shadow soft (blur 8 to 24 px, opacity 4 to 8 percent) and use one direction (usually straight down with a slight y-offset). Two-layer shadows (a tight tight one for the surface edge and a diffuse one for ambient) look more real than a single blurred rectangle. Materials Design 3 and Apple both publish elevation systems in this two-layer form.',
      },
      {
        heading: 'Dark themes need different math',
        body: 'In light mode, elevation moves toward lighter and toward more shadow. In dark mode, elevation moves toward lighter (surfaces become lighter as they rise) and toward less shadow, sometimes with an inner highlight instead. This is because dark surfaces do not "cast" a shadow in the same way; the eye reads lightness as forward. Vercel Geist and Radix both bake this asymmetry in: their dark-mode surface tokens step up in lightness at each elevation, while shadows barely change.',
      },
    ],
    takeaways: [
      'Elevation is contrast between surfaces plus a hairline border; shadow is polish.',
      'Structural borders want 1.5:1 to 2:1 contrast, text wants 4.5:1 (WCAG AA).',
      '0.5 px hairlines are drawable on Retina and read sharper than 1 px.',
      'In dark mode, elevation lightens the surface; do not just add shadow.',
    ],
    terms: [
      { term: 'Elevation', meaning: 'The visual signal that one surface sits above another.' },
      { term: 'Hairline', meaning: 'A very thin border, usually 1 px or 0.5 px, used to separate surfaces.' },
      { term: 'Contrast ratio', meaning: 'The luminance ratio between two colors, as defined by WCAG.' },
      { term: 'WCAG AA', meaning: 'The accessibility level requiring 4.5:1 text contrast and 3:1 for large text.' },
      { term: 'APCA', meaning: 'Newer perceptual contrast algorithm, replacing WCAG 2\'s math in future WCAG 3.' },
      { term: 'Two-layer shadow', meaning: 'An elevation shadow built from a tight-edge shadow plus a diffuse ambient one.' },
    ],
    demoCaption:
      'A card at WCAG-AA-ish contrast, with a breakdown of every element\'s ratio against the surface. The headline number hides what is failing; the breakdown says where.',
    demo: {
      archetype: 'meter',
      headline: 'Overall contrast: 4.7:1',
      breakdown: [
        { label: 'body text on surface', value: 7.2 },
        { label: 'heading on surface', value: 8.9 },
        { label: 'hairline border on surface', value: 1.8 },
        { label: 'muted label on surface', value: 3.4 },
        { label: 'disabled control on surface', value: 2.1 },
      ],
      badCaption:
        'A single "average contrast" number is the elevation-and-noise version of a WCAG audit: it tells you the card passes on average while a specific element (here, the muted label at 3.4) fails the 4.5:1 body-text floor.',
      goodCaption:
        'The breakdown separates text from structure. Text needs 4.5:1; borders and dividers want 1.5:1 to 2:1 so they are "there but not shouting." Different targets per role, not one number for the whole card.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'elevation is not a shadow. it is contrast plus a hairline.',
        body:
          'elevation is not a shadow. it is contrast plus a hairline.\n\nlinear, vercel, radix all stack surfaces this way. each tier a slightly different background, separated by a 0.5 px border. the eye reads the border, not the shadow, and the design stays crisp at every zoom.\n\nshadow is polish, added last.',
      },
      {
        kind: 'X · design angle',
        hook: 'the ai dashboard look is drop-shadow-on-drop-shadow.',
        body:
          'the ai dashboard look is drop-shadow-on-drop-shadow.\n\nthree levels deep and it turns into a soup of blurred rectangles. the shipping-product look is contrast tiers plus a hairline, with shadow only on the top layer.\n\nswap the shadows for surfaces and 90 percent of the fix is done.',
      },
      {
        kind: 'X · one-liner',
        hook: 'in dark mode, elevation lightens. it does not shadow.',
        body:
          'in dark mode, elevation lightens. it does not shadow.\n\ndark surfaces do not cast the same visual shadow. the eye reads lightness as forward. every good dark mode i have shipped raises the surface tint at each tier and barely touches the shadow.\n\ndifferent math, same principle.',
      },
    ],
    source: {
      label: 'Vault note: Contrast and hairlines are the whole difference between elevation and noise',
      url: 'https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum',
    },
  },

  {
    id: 'de-cv-icon-system',
    phase: 'Design engineering',
    part: 'Craft · Visual',
    index: 'DE.CV.09',
    title: 'An icon system is a stroke width and an optical grid, not a set of pictures',
    oneLiner:
      'An icon library is defined by two constants (the stroke width and the drawing grid) and one convention (how each glyph fits an optical bounding box), and every glyph inherits those rules so the set reads as one system.',
    readTime: '~5 min read',
    diagram: '/lessons/de/de-cv-icon-system.png',
    diagramCaption:
      'Phosphor Icons at Regular, Bold, and Fill weights on the same glyph; a shared 24 grid, one stroke width per row, three variants per icon.',
    whyItMatters:
      'Mixing Phosphor with Lucide with a stray Material icon looks worse than any one of them alone, even when each is well drawn, because the eye reads the inconsistency. Icons in one set share a stroke (say 1.5 px on a 24 px grid) and a shared corner rounding style. Break that and every glyph looks like a stranger at the table. When picking an icon library for a product, pick one and stay in it, or commit to drawing your own on the same rules. This is why the shortest fix to "the UI feels off" is often "you have three icon libraries loaded."',
    sections: [
      {
        heading: 'The grid does more than fit the artwork',
        body: 'A 24 px grid with a 2 px safe margin gives every glyph a 20 x 20 optical square to draw in. Icons that visually equal the same "size" are drawn to different actual box sizes: a circle is drawn at 20 x 20, a horizontal rectangle at 22 x 16, a triangle at 22 x 18. Fitting the optical size, not the box size, is why a Phosphor set at 24 px looks even, and a mixed set does not. Lucide, Phosphor, Radix Icons, and Feather all publish these rules and enforce them on contributions.',
      },
      {
        heading: 'Stroke width is the loudest single choice',
        body: 'At the same size, a 1 px stroke reads as delicate and precise (Radix, Geist), 1.5 px reads as balanced (Lucide, Feather), and 2 px reads as bold and app-native (Phosphor Bold, Ionicons filled). Match the stroke to your typography weight: pair Inter Regular with 1.5 px icons, Inter Medium with 1.75 to 2. This one dial changes how "serious" or "friendly" the UI reads, more than the glyph shapes themselves. Filled icons are a separate axis, generally reserved for selected or active states.',
      },
      {
        heading: 'Custom icons need to obey the same rules',
        body: 'The most common failure mode: an in-house icon for a domain-specific concept, drawn ad hoc, sits next to library icons and looks alien. Fix by drawing the custom icon on the same grid, same stroke, same corner style, same terminal style (rounded, squared, or beveled ends). Phosphor and Lucide both ship Figma libraries with the drawing grid visible; use them as a template. The rule is: a stranger should not be able to tell which icons in your app are yours and which came from the library.',
      },
      {
        heading: 'Weight and size are separate dials',
        body: 'Do not scale a 24 px stroked icon down to 16 px and expect it to read. At 16 px, the stroke is 1 px effective on Retina and disappears into the surface. Ship distinct icon variants per size class (16, 20, 24) with hand-tuned strokes and simplified geometry. SF Symbols, Material Symbols, and Radix Icons all publish size-tuned variants. If you cannot ship three sets, ship at 24 px and never go below 20 px in product UI.',
      },
    ],
    takeaways: [
      'One library at a time, or draw your own on the same rules.',
      'Stroke width is the loudest dial: match it to your type weight.',
      'Icons are drawn to optical size, not box size; the grid enforces this.',
      'Ship per-size variants above and below 20 px, or do not shrink.',
    ],
    terms: [
      { term: 'Icon grid', meaning: 'The pixel canvas an icon is drawn on, typically 24 x 24 with a 2 px safe area.' },
      { term: 'Optical bounding box', meaning: 'The visible square inside the grid where the glyph lives.' },
      { term: 'Stroke width', meaning: 'The thickness of the lines that draw the icon, in px.' },
      { term: 'Terminal', meaning: 'How a stroke ends: rounded, squared, or beveled.' },
      { term: 'Filled icon', meaning: 'A solid variant used for active or selected states.' },
      { term: 'Size-tuned variant', meaning: 'A separate hand-drawn version of an icon optimized for a specific size class.' },
    ],
    demoCaption:
      'A toolbar of six icons. Toggle between a mixed set (Phosphor, Lucide, and a stray Material icon) and a unified set (all Phosphor Regular at 24 px). Same glyphs, one system.',
    demo: {
      archetype: 'before-after',
      subject: 'Toolbar icons',
      badLabel: 'Mixed libraries',
      goodLabel: 'One system',
      badLines: [
        'search glyph: Lucide 1.5 px stroke on a 24 grid',
        'settings glyph: Phosphor Regular 1.75 px stroke on a 24 grid',
        'download glyph: Material Symbols 2 px stroke on a 20 grid',
        'strokes disagree, corner styles disagree, sizes disagree',
        'the toolbar reads as a stranger at every third position',
      ],
      badCaption:
        'Each library is well drawn on its own rules. Loaded together they read as inconsistent because the eye compares strokes and terminals, not glyph identity. The ui feels off before anything else is even wrong.',
      goodLines: [
        'all glyphs: Phosphor Regular 1.75 px stroke',
        'all on the same 24 grid with 2 px safe area',
        'rounded terminals, matched corner style',
        'custom in-house glyph drawn on the same template',
        'a stranger cannot tell which icons are yours and which came from the library',
      ],
      goodCaption:
        'One stroke, one grid, one terminal style. Custom icons obey the same rules and disappear into the set. The single loudest dial (stroke) is matched to the type weight, and the toolbar reads as one system.',
    },
    posts: [
      {
        kind: 'X · mechanism',
        hook: 'an icon system is a stroke width and a grid. that is it.',
        body:
          'an icon system is a stroke width and a grid. that is it.\n\nlucide is 1.5 px on 24. phosphor regular is 1.75 on 24. radix is 1 px on 15. every glyph in a set inherits those two constants, and that is what makes the set read as one system.\n\nmix libraries and you break the constants.',
      },
      {
        kind: 'X · design angle',
        hook: 'stroke width is the loudest dial in your ui.',
        body:
          'stroke width is the loudest dial in your ui.\n\n1 px reads as precise (radix, geist). 1.5 px reads as balanced (lucide, feather). 2 px reads as bold and app-native (phosphor bold).\n\nmatch it to your type weight, not to a mood board. that one number changes how serious the product feels, more than the glyphs do.',
      },
      {
        kind: 'X · one-liner',
        hook: 'the shortest fix to "ui feels off" is often "you loaded three icon libraries."',
        body:
          'the shortest fix to "ui feels off" is often "you loaded three icon libraries."\n\neach is well drawn. together they fight. the eye compares strokes and terminals, not glyph identity, so inconsistency reads before anything else.\n\npick one and stay in it. or draw your own on the same rules.',
      },
    ],
    source: {
      label: 'Vault note: An icon system is a stroke width and an optical grid, not a set of pictures',
      url: 'https://phosphoricons.com',
    },
  },
];
