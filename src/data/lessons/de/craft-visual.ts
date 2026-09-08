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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-oklch.png',
    diagramCaption:
      'The oklch.com interactive picker: L, C, and H sliders driving a color patch, with a live sRGB gamut edge.',
    whyItMatters:
      'A hex or HSL palette lies to you. `#3b82f6` and `#eab308` at "the same" HSL lightness look nothing alike: the yellow burns, the blue sinks. That is why hand-tuned Tailwind ramps have three people arguing over step 500. In OKLCH, `oklch(0.72 0.15 250)` and `oklch(0.72 0.15 85)` sit at the same perceived brightness, so a text token at L=0.35 stays legible on every hue, and Vercel Geist can flip its whole dark theme by inverting one number.',
    learningObjectives: [
      'Explain why two colors at the same HSL lightness can look nothing alike, using L, C, and H as the mechanism.',
      'Convert a hand-tuned HSL accent ramp into an OKLCH ramp that holds lightness constant across hues.',
      'Compare hex, HSL, and OKLCH on gamut awareness, browser support, and how much work a dark-mode flip takes in each.',
      'Cap chroma for accent and surface tokens so every step stays inside sRGB and inside Display P3.',
      'Decide when a fixed brand hex should stay hex instead of migrating to OKLCH.',
    ],
    sections: [
      {
        heading: 'OKLCH is a perceptual model, not just a syntax',
        body: 'OKLCH is a cylindrical form of Oklab, a color space Bjorn Ottosson published in December 2020 to fix the parts of CIELAB (from 1976) that still tilted toward blue and green. Its three axes are Lightness (0 to 1), Chroma (0 to about 0.4 in sRGB), and Hue (0 to 360 degrees). Equal steps in L correspond to roughly equal steps in perceived brightness, and rotating hue does not drift lightness the way it does in HSL. Browser support arrived fast once CSS Color 4 stabilized: Safari 15.4 in March 2022, Chrome 111 in March 2023, Firefox 113 in May 2023. By 2024, `color: oklch(0.6 0.18 30)` worked everywhere that mattered for production.',
      },
      {
        heading: 'Hex and HSL lie about brightness in different ways',
        body: 'Hex encodes red, green, and blue channel values, none of which map to how bright a color looks; `#eab308` and `#3b82f6` can share no numeric relationship at all and still need to read as "equally loud." HSL is worse in a specific way: it defines lightness as `(max + min) / 2` of the RGB channels, a formula with zero connection to human vision. That is why pure yellow at HSL lightness 50% looks far brighter than pure blue at the same 50%. OKLCH\'s L axis is derived from actual perceptual response curves, so `oklch(0.72 0.15 250)` (blue) and `oklch(0.72 0.15 85)` (yellow) genuinely read as the same brightness side by side.',
      },
      {
        heading: 'The design payoff is a ramp you can generate',
        body: 'Once L is honest, you build a 12-step ramp by walking L in fixed increments and holding C constant, then reuse those exact L values across every hue in the palette. Radix Colors and Vercel\'s Geist accent tokens work this way in spirit: step 9 is always the vibrant "brand" step, step 11 is always the readable text-on-background step, no matter which of the twenty-plus hues you pick. That constancy is what makes semantic tokens portable across themes. In HSL, step 500 blue and step 500 yellow disagree about what "500" even means, so every new hue needs its own hand-tuned ramp.',
      },
      {
        heading: 'Chroma has a ceiling and OKLCH tells you about it',
        body: 'Not every OKLCH triple is displayable on sRGB. High chroma at extreme lightness (very pale or very dark) falls outside the gamut, and browsers clip it silently to the nearest displayable color, which can shift the hue you asked for. A picker like `oklch.com` draws the gamut edge live so you can pull chroma back before shipping. For product palettes, staying around C=0.15 to 0.2 for accents and C=0.03 to 0.06 for surfaces keeps every step inside sRGB, and comfortably inside Display P3 for the wider-gamut screens that shipped on every iPhone since the iPhone 7 in 2016.',
      },
      {
        heading: 'Migration is a find and replace, not a rewrite',
        body: 'Because OKLCH is CSS-native, you adopt it token by token. Define `--accent-9: oklch(0.62 0.19 250);` and hex values keep working everywhere else in the file; nothing else has to change on day one. Tools like `oklch.com` and Evil Martians\' converter output the exact syntax from an existing hex value, so the first migration pass can be almost mechanical. The upgrade earns its keep fastest right before you commit to a dark theme: flipping to dark mode in OKLCH is often a two-line change (invert L, keep C and H), where the hex equivalent means hand-picking 40 new colors and hoping they still relate to each other the way the light-mode set did.',
      },
      {
        heading: 'Gamut is bigger than sRGB now, and OKLCH maps to it directly',
        body: 'sRGB has been the safe floor since 1996, but Display P3 (roughly 25 percent more colors, mostly in saturated reds and greens) has shipped on Apple displays since 2016 and on most flagship Android phones since 2019. CSS lets you write `color(display-p3 1 0 0)` directly, and OKLCH triples translate to P3 more predictably than hex ever did, because the perceptual math does not change between color spaces, only the displayable range does. A palette authored in OKLCH with headroom in chroma (say C=0.2 instead of the sRGB max of about 0.18 for that hue) will look identical on an sRGB screen and slightly richer on a P3 one, for free.',
      },
      {
        heading: 'Where OKLCH still is not perfect',
        body: 'OKLCH is a large improvement over HSL, not a perfect model of human vision. Hue linearity is weakest in the blue-purple range, where two hues 30 degrees apart can still look closer together than the same 30-degree gap in orange-red. Researchers point to CAM16-UCS as a more accurate (and much more expensive to compute) alternative, and Google\'s Material Design uses a CAM16-derived space internally for its dynamic color engine, introduced in Android 12 (2021). For product palette work in 2026, OKLCH is the right tradeoff: precise enough to kill the "why does yellow always look brighter" argument, cheap enough to compute in a browser at 60fps, and directly supported by CSS.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-oklch-gamut.svg',
        alt: 'OKLCH gamut slice at fixed lightness',
        caption: 'A horizontal slice through OKLCH at L=0.72: the sRGB-displayable region sits inside a larger OKLCH chroma-hue disc, with a visible clip edge.',
        diagramBrief: 'Cream paper background, black ink, one accent color (blue). Draw a large circle representing the full OKLCH chroma-hue plane at a fixed L=0.72, with hue running around the circumference (label four cardinal points: 0/red, 90/yellow-green, 180/cyan, 270/purple-blue) and chroma increasing outward from center. Overlay a smaller, slightly irregular closed curve inside it labeled "sRGB gamut" in accent color; shade the region between the two curves with a light hatch pattern labeled "clipped outside sRGB". Mark one point just outside the sRGB curve with a dot and an arrow pulling it inward, labeled "oklch(0.72 0.35 250) clips to nearest displayable color".',
      },
      {
        src: '/lessons/de/de-cv-oklch-ramp-compare.svg',
        alt: 'HSL ramp vs OKLCH ramp brightness graph',
        caption: 'Three hues (blue, yellow, green) plotted at matched HSL lightness versus matched OKLCH L; only the OKLCH row holds a flat perceived-brightness line.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two horizontal rows of three color swatches each (blue, yellow, green), stacked vertically. Top row labeled "HSL, same L=50%": draw a jagged line above the swatches connecting their apparent brightness (peaking sharply over yellow, dipping over blue) labeled "perceived brightness, uneven". Bottom row labeled "OKLCH, same L=0.72": draw a flat horizontal line above the three swatches at equal height, labeled "perceived brightness, flat". Style: three swatches per row as simple rounded rectangles, the connecting line drawn freehand-straight in the accent color.',
      },
    ],
    takeaways: [
      'Pick OKLCH when the palette needs to vary by one axis at a time; hex when you are matching a fixed brand color exactly.',
      'A perceptually uniform L axis is what lets one text token work across every accent hue.',
      'Cap chroma around 0.2 for accents and 0.06 for surfaces to stay inside sRGB.',
      'Dark mode in OKLCH is often an L flip. Dark mode in hex is a second palette.',
    ],
    terms: [
      { term: 'OKLCH', gloss: '"a newer, nicer color picker format"', meaning: 'A CSS color function, `oklch(L C H)`, that expresses color on three perceptually uniform axes derived from the Oklab space.' },
      { term: 'Oklab', gloss: '"the math behind OKLCH"', meaning: 'The rectangular (non-cylindrical) perceptual color space Bjorn Ottosson published in 2020; OKLCH is Oklab\'s polar-coordinate form.' },
      { term: 'Lightness (L)', gloss: '"how light or dark it is"', meaning: 'A 0 to 1 axis where equal numeric steps correspond to roughly equal steps in perceived brightness, unlike HSL\'s lightness channel.' },
      { term: 'Chroma', gloss: '"saturation, basically"', meaning: 'The OKLCH axis for colorfulness, running from 0 (grey) to roughly 0.4 in sRGB (the practical gamut edge); it is not identical to HSL saturation.' },
      { term: 'Hue', gloss: '"which color it is"', meaning: 'The 0 to 360 degree angle around the OKLCH color wheel; unlike HSL hue, rotating it does not shift perceived lightness.' },
      { term: 'Gamut', gloss: '"the colors a screen can show"', meaning: 'The bounded set of colors a specific display or color space can render; sRGB is the narrowest common gamut, Display P3 is wider.' },
      { term: 'sRGB', gloss: '"regular colors"', meaning: 'The default color space assumed by most web content since 1996; the safe floor gamut that every screen can display.' },
      { term: 'Display P3', gloss: '"the vivid mode on newer screens"', meaning: 'A wider gamut, roughly 25 percent more colors than sRGB (mostly saturated reds and greens), shipped on Apple displays since 2016.' },
      { term: 'Ramp', gloss: '"the palette shades, like 100 to 900"', meaning: 'An ordered sequence of tints and shades derived from one hue by walking a fixed axis (usually L) in even steps.' },
      { term: 'Perceptual uniformity', gloss: '"looks smooth"', meaning: 'The property that equal numeric steps on an axis produce equal visually-perceived steps; OKLCH\'s L has this property, HSL\'s lightness does not.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given `oklch(0.72 0.15 250)`, predict what happens to perceived brightness if you change only the hue to 85 while keeping L and C fixed. Then predict what happens if you instead raise L to 0.9 at that same hue and chroma.' },
      { level: 'medium', prompt: 'A designer built a Tailwind-style gray ramp in HSL at lightness values 95%, 85%, 70%, 50%, 30%, 15%, 5%. Explain why steps at the light end (95, 85) will look closer together than the numbers suggest, and rewrite the plan as OKLCH L values that actually space evenly.' },
      { level: 'hard', prompt: 'Two brand colors, an orange and a teal, need to read as equally "loud" as CTA buttons on a white background, and both need to pass WCAG AA text contrast when used with white label text. Set up the constraint as two target L values plus a chroma ceiling, and explain why the orange will likely need a lower L than the teal to hit the same contrast ratio.' },
      { level: 'design', prompt: 'Spec a 9-step OKLCH accent ramp for a new product (steps 1 to 9, step 9 being the vibrant CTA color). Name the L value pattern you would walk, the chroma cap you would set, and write one sentence of onboarding text for engineers explaining why dark mode is "flip L, keep C and H" instead of a second hand-picked palette.' },
    ],
    furtherReading: [
      { label: 'Bjorn Ottosson, "A perceptual color space for image processing"', url: 'https://bottosson.github.io/posts/oklab/', why: 'The original 2020 write-up defining Oklab and the OKLCH derived from it, with the math shown in full.' },
      { label: 'Evil Martians, "OKLCH in CSS: why we moved from RGB and HSL"', url: 'https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl', why: 'The clearest production-team account of migrating a real palette, including the gamut-clipping gotcha.' },
      { label: 'MDN, CSS `oklch()` function', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch', why: 'The reference syntax and browser support table, useful for checking whether a target browser needs a fallback.' },
      { label: 'Radix Colors', url: 'https://www.radix-ui.com/colors', why: 'A shipping example of the 12-step OKLCH-based ramp pattern, viewable across dozens of hues with the same step semantics.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'A 9-step OKLCH accent ramp',
      body: '/* Accent ramp: walk L, hold C, keep H fixed per hue.\n   Swap H per brand color; the L steps below stay constant. */\n:root {\n  --accent-1: oklch(0.99 0.01 250); /* app background tint */\n  --accent-3: oklch(0.94 0.03 250); /* subtle surface */\n  --accent-5: oklch(0.85 0.08 250); /* border, hover surface */\n  --accent-7: oklch(0.72 0.14 250); /* secondary UI element */\n  --accent-9: oklch(0.62 0.19 250); /* vibrant CTA, the brand step */\n  --accent-11: oklch(0.40 0.16 250); /* readable text on light bg */\n  --accent-12: oklch(0.22 0.10 250); /* max-contrast text */\n}\n\n/* Dark mode: invert L, keep C and H. No new hex values, no second palette. */\n[data-theme=\'dark\'] {\n  --accent-1: oklch(0.18 0.02 250);\n  --accent-9: oklch(0.68 0.19 250);\n  --accent-11: oklch(0.82 0.12 250);\n}',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-corner-radius.png',
    diagramCaption:
      'Two card-in-card comparisons: outer 16 with inner 8 (concentric, calm) versus outer 16 with inner 12 (pinched, wrong).',
    whyItMatters:
      'Every card with a button in it hits this. Card radius 16, button radius 8, gap 8, and the corners line up. Card radius 16, button radius 12, gap 8, and the button looks squeezed in the top-right corner because its arc bulges out past the card\'s arc. It is the single fastest way to make a card, drawer, modal, or tooltip stop looking amateur, and it is why Vercel\'s dashboard cards feel calm while a hastily built form does not.',
    learningObjectives: [
      'Compute an inner element\'s radius from an outer container\'s radius and the padding between them.',
      'Identify the two failure directions: the pinched corner and the floating (radius-zero) corner.',
      'Set up a design system so the inner radius derives from the outer radius in CSS, instead of being hand-picked per component.',
      'Explain why continuous corners (squircles) diverge visibly from circular arcs at large radii.',
      'Decide when breaking the concentric rule on purpose (pill shapes, fully rounded avatars) is the right call.',
    ],
    sections: [
      {
        heading: 'The math is one subtraction',
        body: 'Inner radius equals outer radius minus padding (or minus the gap to the edge). A 20px card with 12px padding wants an inner element radius of 8px. A 24px modal with 16px padding wants inner surfaces at radius 8px. A 12px chip with 6px padding wants an inner radius of 6px. This produces concentric arcs: the two curves share a center, so the eye reads them as parallel. Break the rule and the arcs cross, and the visual weight in that corner jumps. Apple\'s Human Interface Guidelines call this family "continuous corners" and explicitly recommend the concentric relationship for anything nested inside anything else.',
      },
      {
        heading: 'The rule fails in two predictable directions',
        body: 'The first failure is the pinched corner: inner radius too large for the available padding, the curves cross, and the inner shape looks trapped or squeezed in that corner. The second is the floating corner: inner radius set to zero when the outer shape is rounded, so a sharp inner edge sits inside a soft outer edge and reads like a rendering bug. The second is more common in engineer-authored UI, because `border-radius: 0` reads in code as "no radius," when visually it is a rectangle wedged inside a rounded shape, and it reads as unfinished the instant it ships.',
      },
      {
        heading: 'Token the outer radius, derive the inner',
        body: 'Store one radius scale (say 4, 8, 12, 16, 20, 24) and one padding scale on the same grid, then let the inner radius be `calc(var(--radius-outer) - var(--padding))`. In practice this means naming radii semantically (`--radius-card`, `--radius-control`, `--radius-chip`) and letting each pair sit at a known offset instead of a memorized number. Vercel Geist and shadcn/ui both bake this in: set `--radius: 0.5rem` on the root and controls inside cards derive a smaller radius automatically, so a single token change ripples correctly through every nesting level in the product.',
      },
      {
        heading: 'Continuous corners are a separate lever',
        body: 'macOS and iOS use "squircles" (technically superellipses), where curvature ramps up gradually instead of jumping from a straight edge to a circular arc. Apple documents its icon grid this way since iOS 7 in 2013, and macOS Big Sur (2020) extended the treatment to windows and controls. CSS is catching up: `corner-shape: squircle` exists in a 2024 draft spec but ships in no browser yet. Until it does, a slightly larger radius plus a small amount of overshoot on an SVG icon container approximates the effect. This matters most at radii of 24px and above, where a plain circular arc starts to read as a stadium shape rather than a rounded rectangle.',
      },
      {
        heading: 'Nesting compounds the rule at every level',
        body: 'A button inside a card inside a modal is three concentric relationships, not one. Modal radius 24, padding 16, card radius 8; card padding 8, button radius 0 (a text link) or the button gets its own radius derived the same way. Skip the math at any one level and the whole stack reads as slightly off, even if the other two levels are correct, because the eye compares the nearest pair of edges, not the whole hierarchy at once. The fix scales the same way the problem does: derive every level from its immediate parent, never from a fixed constant chosen in isolation.',
      },
      {
        heading: 'Radius scales across real systems',
        body: 'Vercel Geist ships a base radius token (`--ds-gap-radius`, typically 8px) with derived component radii at roughly 4, 6, 8, and 12. shadcn/ui defaults to a single `--radius: 0.5rem` (8px) with `calc()`-derived variants at `-2` and `-4` steps. Material Design 3 (Google, 2021) publishes a named scale from "none" through "full" (a pill), with seven stops in between. Apple\'s HIG does not publish exact pixel values but documents the concentric relationship as a rule rather than a number, which is the point: the specific radius is a brand decision, the concentric relationship is not optional.',
      },
      {
        heading: 'When to break the rule on purpose',
        body: 'Pills and fully rounded avatars are the accepted exception: a 9999px radius on a small element inside a rounded card is not "wrong," because a pill shape has no meaningful arc-crossing to compare against a rectangular container\'s corner. The same goes for a circular avatar sitting inside a square card corner region, since a circle and a rounded-rectangle corner are different shape families and the eye does not expect them to share a center. The rule to remember: concentricity applies when both shapes are rounded rectangles nested in the same corner, not to every pair of rounded things on a screen.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-radius-concentric.svg',
        alt: 'Concentric versus crossing corner arcs',
        caption: 'Outer radius 16 with 8px padding: an inner radius of 8 keeps the arcs concentric; an inner radius of 12 makes them cross and pinch.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Draw two card-in-card diagrams side by side. Left diagram labeled "correct": a large rounded square (outer radius 16, drawn with a visible dashed circle showing its corner\'s center point) containing a smaller rounded square inset by 8px (inner radius 8), with a small marker showing both corners share the same center point, labeled "concentric, arcs parallel". Right diagram labeled "wrong": same outer shape, but the inner rounded square has radius 12, drawn so its arc visibly pokes past the outer arc in the corner region, circled in accent color and labeled "arcs cross, corner pinches".',
      },
      {
        src: '/lessons/de/de-cv-radius-nesting.svg',
        alt: 'Three-level nested radius derivation',
        caption: 'Modal, card, and button radii each derived from the parent above: 24 minus 16 padding gives 8, 8 minus 8 padding gives 0.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Draw three nested rounded rectangles (modal outermost, card in the middle, button innermost) as a simple diagram with callout labels and arrows pointing inward: "modal radius 24" -> arrow labeled "minus 16px padding" -> "card radius 8" -> arrow labeled "minus 8px padding" -> "button radius 0 (text link, no radius needed)". Keep the shapes simple rounded rectangles, no shading, just outlines and labeled arrows.',
      },
    ],
    takeaways: [
      'Set inner radius = outer radius minus padding. That is the whole rule.',
      'Radius 0 inside a rounded parent reads as a bug, not a choice.',
      'Token the outer radius, derive the inner in CSS.',
      'At radii above 20, the difference between circular and continuous corners becomes visible.',
    ],
    terms: [
      { term: 'Concentric', gloss: '"the corners match"', meaning: 'Two arcs that share the same center point, so their curves stay a constant distance apart and read as parallel to the eye.' },
      { term: 'Continuous corner', gloss: '"apple\'s rounded corners"', meaning: 'A rounding whose curvature increases gradually (a superellipse), rather than jumping from a straight edge directly into a circular arc.' },
      { term: 'Squircle', gloss: '"the ios icon shape"', meaning: 'The specific continuous-corner superellipse Apple uses for app icons and, since macOS Big Sur, for windows and controls.' },
      { term: 'Radius token', gloss: '"the border-radius value"', meaning: 'A named design-system value assigned to a specific role, such as `--radius-card`, distinct from a raw pixel number typed inline.' },
      { term: 'Padding', gloss: '"the space inside the box"', meaning: 'The inset distance from a container\'s edge to its content or to a nested element, which determines the derived inner radius.' },
      { term: 'Pinched corner', gloss: '"looks squeezed"', meaning: 'The specific visual defect where an inner shape\'s radius is too large for its padding, so its arc bulges past the outer container\'s arc.' },
      { term: 'Floating corner', gloss: '"looks unfinished"', meaning: 'The defect where an inner element has zero radius inside a rounded parent, producing a sharp edge inside a soft one.' },
      { term: 'Overshoot', gloss: '"nudging it a bit extra"', meaning: 'Deliberately extending a shape slightly past its bounding box or expected radius to correct an optical mismatch, distinct from a design error.' },
      { term: 'Superellipse', gloss: '"the squircle math"', meaning: 'A mathematical curve family (generalizing the ellipse with an exponent) that produces the continuous-corner effect used in squircles.' },
      { term: 'corner-shape', gloss: '"the css property for squircles"', meaning: 'A draft CSS property (as of 2024) intended to let `corner-shape: squircle` render continuous corners natively; not yet shipped in any browser.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A card has outer radius 20px and 12px of padding on every side. What radius should an inner button have to stay concentric?' },
      { level: 'medium', prompt: 'A modal (radius 24, padding 16) contains a card (radius to be determined, padding 8) which contains a button. Compute the card\'s radius and the button\'s radius so all three levels stay concentric.' },
      { level: 'hard', prompt: 'Your design system currently hard-codes button radius at 8px regardless of container. Write the `calc()`-based CSS rule that would derive it correctly from any parent\'s `--radius` and `--padding` custom properties instead, and explain what breaks if a designer sets padding to 4px on a card with radius 6px.' },
      { level: 'design', prompt: 'Audit a real product\'s settings modal (pick one you use) for the pinched-corner and floating-corner defects. Screenshot or describe one instance of each, and write the one-line fix you would hand to the engineer who owns that component.' },
    ],
    furtherReading: [
      { label: 'Apple Human Interface Guidelines, "Materials and layout"', url: 'https://developer.apple.com/design/human-interface-guidelines/', why: 'The canonical source for the concentric-corner rule and the "continuous corner" terminology.' },
      { label: 'Apple Design Resources, icon templates', url: 'https://developer.apple.com/design/resources/', why: 'Shows the squircle superellipse grid Apple uses for app icons, the clearest real example of continuous corners at scale.' },
      { label: 'Vercel Geist design principles', url: 'https://vercel.com/geist', why: 'A shipping design system that derives inner radii from a single root token, the pattern this lesson recommends.' },
      { label: 'MDN, `border-radius`', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius', why: 'Reference for the CSS property itself, including how `calc()` composes with custom properties for derived radii.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Derived inner radius via calc()',
      body: '/* Token the outer radius and padding once, derive the inner radius everywhere. */\n.card {\n  --radius-outer: 16px;\n  --padding-inner: 8px;\n  border-radius: var(--radius-outer);\n  padding: var(--padding-inner);\n}\n\n.card > .button {\n  /* Never hard-code this. Always derive it. */\n  border-radius: calc(var(--radius-outer) - var(--padding-inner));\n}',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-optical-alignment.png',
    diagramCaption:
      'A play triangle in a circular button, shown twice: math-centered (leaning left) and optically nudged 2 px right (balanced).',
    whyItMatters:
      'A play triangle centered in a circular button by CSS transform sits visibly too far left. A capital T centered in a chip sits too high because there is nothing below its baseline. Every one of these looks fine in Figma\'s align panel and wrong the moment it ships. The fix is a two to four pixel nudge that no linter will ever suggest. It is the fastest single upgrade to visual craft, turning "I don\'t know what feels off" into a specific offset stored in a token, the way Apple\'s own SF Symbols quietly nudge dozens of glyphs inside their containers.',
    learningObjectives: [
      'Explain why a shape\'s bounding-box center and its perceived visual center are often different points.',
      'Identify the five most common places optical misalignment shows up in product UI.',
      'Store an optical correction as a named token instead of a hard-coded inline offset.',
      'Decide when to skip the optical pass entirely (very large text, very small icons, asymmetric containers).',
      'Measure an optical nudge as a percentage of the containing element\'s width, not just eyeball it.',
    ],
    sections: [
      {
        heading: 'The eye centers optical mass, not bounding boxes',
        body: 'A triangle pointing right carries its mass on the left half; the vertical apex on the right has almost no visual weight. Mathematical center puts equal empty space on both sides of the bounding box, so the mass sits left of center and the shape reads as leaning. Optical center shifts the shape right until the perceived mass balances, typically 1 to 3 percent of the containing width, often just 1 to 2 pixels at UI scale. The same phenomenon happens in letterforms: a capital "O" is drawn slightly taller and wider than a capital "H" so both read as the same height. Type designers call this overshoot, and every serious typeface since Gutenberg\'s era has used some form of it.',
      },
      {
        heading: 'Common places the fix pays off',
        body: 'Play buttons in video players want the triangle offset 1 to 2 pixels right of geometric center; Apple Music and Spotify\'s play buttons both do this at a 2x screenshot check. Arrows and chevrons in circular avatar frames want a nudge toward their pointed end. Text on chips and pills tends to sit visually too low, because letters have descenders below the baseline that eat into the bottom padding; nudging the label up 1 pixel usually fixes it. App icons on iOS deliberately overshoot their nominal grid box to fill the squircle mask evenly. Button labels next to leading icons often feel too close, because the icon has no ascender to balance the letter spacing; add 1 to 2 pixels of extra gap on the icon side.',
      },
      {
        heading: 'Tokenize the nudges, do not hard-code them',
        body: 'Store optical corrections as named tokens: `--icon-nudge-x-play: 1px`, `--label-nudge-y-chip: -1px`. Then wire them into the component so they live next to the property they correct, not scattered as unexplained inline styles. This is what stops a designer\'s optical fix from being reverted by the next engineer who reads "why is this 1 pixel off center" and cleans it up in good faith. Rauno Freiberg\'s craft notes and Refactoring UI both make the same argument from opposite sides of the discipline: the fix has to survive a code review months later, and a named token with a comment is the only form that reliably does.',
      },
      {
        heading: 'Measuring the offset instead of guessing it',
        body: 'For a symmetric shape like a triangle, the visual center sits closer to the centroid (the average position of all points in the filled area) than to the bounding-box midpoint. A right-pointing equilateral triangle\'s centroid sits at roughly one-third of its width from the flat side, not one-half; nudging the shape so the centroid, not the box, aligns with the container\'s center closes most of the gap in one calculation instead of trial and error. For type, the fix is usually smaller and empirical: measure the cap-height-to-baseline gap in the rendered font and split the difference against the descender space below. Either way, the target is a specific number, not a vibe.',
      },
      {
        heading: 'The history behind overshoot',
        body: 'Overshoot in letterforms predates digital type by centuries: Renaissance punchcutters already drew round letters (O, C, G) slightly taller than flat ones (H, E, I) because a circle inscribed exactly at cap height looks shorter than a square at the same height. Digital font tools inherited the practice directly; Adobe\'s Multiple Master format in 1991 and every OpenType spec since bakes overshoot values into the glyph metrics. Variable fonts, standardized in 2016, complicate the picture further, since overshoot now has to hold across a whole weight axis, not just one static cut. The UI-icon version of this problem is the same fight in miniature, just with triangles and chevrons instead of O\'s and C\'s.',
      },
      {
        heading: 'When to skip the correction',
        body: 'Optical alignment is a polish pass, not a foundation. Skip it while wiring states and edge cases; return to it once the component is otherwise functionally done. Skip it entirely for large text (above roughly 32px) where the correction becomes subvisible relative to the letterform size, and for icons at 12px or smaller, where the render grid rounds every coordinate to a whole pixel anyway and a 1px nudge either does nothing or overshoots. Skip it too when the container is asymmetric on purpose: if a card has different top and bottom padding for a documented reason, the eye will not read a centered element as centered no matter what correction you apply, because the asymmetry is the actual cause.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-optical-triangle.svg',
        alt: 'Triangle centroid versus bounding box center',
        caption: 'A right-pointing triangle\'s bounding-box center sits left of its centroid; nudging to the centroid is what "optical center" means in practice.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Draw a right-pointing filled triangle inside a square bounding box. Mark the bounding-box midpoint with a small cross labeled "mathematical center". Mark the triangle\'s centroid (roughly one-third of the width from the flat left edge) with a dot in the accent color labeled "centroid / optical center". Draw a short horizontal arrow from the cross to the dot labeled "nudge, ~1-2px at UI scale". Below, draw the same triangle centered inside a circle (a play-button style icon) twice: once aligned to the bounding-box center (labeled "leans left") and once aligned to the centroid (labeled "balanced").',
      },
      {
        src: '/lessons/de/de-cv-optical-common-spots.svg',
        alt: 'Five common optical-misalignment spots in UI',
        caption: 'Play buttons, chevrons in circles, chip text, app icon grids, and icon-plus-label pairs: the five recurring places a 1-3px nudge is needed.',
        diagramBrief: 'Cream paper background, black ink, one accent color. A 5-panel grid, each panel a small labeled UI fragment with an arrow pointing to the nudge direction: (1) circular play button with triangle, arrow pointing right; (2) circular avatar frame with a chevron icon, arrow pointing toward the chevron\'s tip; (3) a pill-shaped chip with a capital letter, arrow pointing up; (4) an iOS-style rounded-square icon grid showing the artwork slightly overshooting the grid box, arrow pointing outward at the corners; (5) a button with a leading icon and label text, arrow showing extra gap being added between icon and text. Keep each panel minimal, just outline shapes and one accent-colored arrow per panel.',
      },
    ],
    takeaways: [
      'If it looks off by one or two pixels, it is off by one or two pixels; ship the nudge.',
      'Triangles and chevrons want to move toward their pointed end.',
      'Store optical corrections as named tokens so they survive code review.',
      'Do the pass last, once the states are done.',
    ],
    terms: [
      { term: 'Optical center', gloss: '"where it looks centered"', meaning: 'The point where a shape\'s perceived visual mass balances left-to-right and top-to-bottom, which is often not the same point as its bounding-box midpoint.' },
      { term: 'Mathematical center', gloss: '"the align-panel center"', meaning: 'The exact midpoint of a shape\'s bounding box, computed by geometry alone with no regard for how the filled area is distributed inside it.' },
      { term: 'Centroid', gloss: '"the balance point"', meaning: 'The average position of all points within a filled shape; for an asymmetric shape like a right-pointing triangle, it sits closer to the visual center than the bounding-box midpoint does.' },
      { term: 'Overshoot', gloss: '"drawn a bit bigger on purpose"', meaning: 'Deliberately drawing a letterform or icon slightly beyond its nominal size so it reads as the same visual size as its neighbors; used in type since the Renaissance and in every OpenType spec since.' },
      { term: 'Nudge', gloss: '"moving it a pixel or two"', meaning: 'A small, deliberate offset, usually 1 to 3 pixels at UI scale, applied to correct a specific optical mismatch, distinct from an unintentional misalignment.' },
      { term: 'Baseline', gloss: '"where the letters sit"', meaning: 'The invisible horizontal line that letterforms rest on, ignoring any part of a letter (a descender) that drops below it.' },
      { term: 'Descender', gloss: '"the tail on a y or g"', meaning: 'The portion of a letterform that extends below the baseline, present in letters like g, j, p, q, and y.' },
      { term: 'Ascender', gloss: '"the tall part of a b or h"', meaning: 'The portion of a lowercase letterform that extends above the x-height, present in letters like b, d, h, k, and l.' },
      { term: 'x-height', gloss: '"how tall lowercase letters look"', meaning: 'The height of a font\'s lowercase letters excluding ascenders and descenders, measured from the baseline to the top of a letter like x.' },
      { term: 'Visual weight', gloss: '"how heavy a shape looks"', meaning: 'The perceived density or mass of a shape or glyph, driven by its filled area and its position, which is what optical alignment actually balances.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A right-pointing arrow icon inside a 24px circular button is centered by bounding box and looks like it leans left. In which direction, and roughly how many pixels, would you nudge it?' },
      { level: 'medium', prompt: 'A capital letter "A" sits inside a 32px square chip, vertically centered by bounding box. Explain why it likely reads as sitting slightly too high, and describe the nudge you would apply and in which CSS property.' },
      { level: 'hard', prompt: 'You are building an icon component that accepts any glyph from a 24px icon set and centers it inside a circular avatar frame at three sizes (24, 32, 48px). Design the token structure that lets each glyph carry its own optical nudge without hard-coding pixel values into the component itself.' },
      { level: 'design', prompt: 'Pick a real product\'s play button, pause button, and one chevron-in-a-circle control. Screenshot each at 2x or 3x, drop in alignment guides, and report which ones are optically nudged and which are dead-centered by the bounding box. Write the one-line spec you would hand an engineer for the worst offender.' },
    ],
    furtherReading: [
      { label: 'Refactoring UI (Adam Wathan and Steve Schoger), chapter on optical adjustments', url: 'https://www.refactoringui.com', why: 'The canonical worked example of the play-triangle nudge, written for engineers who do not have a design background.' },
      { label: 'Rauno Freiberg, "Craft"', url: 'https://rauno.me/craft', why: 'A practicing design engineer\'s running notes on exactly this class of pixel-level correction, argued from inside real shipped products.' },
      { label: 'Apple Human Interface Guidelines, "App icons"', url: 'https://developer.apple.com/design/human-interface-guidelines/app-icons', why: 'Documents the iOS icon-grid overshoot convention, a production example of optical correction at the platform level.' },
      { label: 'Erik Kennedy, "Design tricks"', url: 'https://learnui.design', why: 'Practical, example-driven coverage of optical correction aimed at engineers picking up visual design skills.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Optical alignment review pass',
      body: '- Play/pause triangles in circular buttons: nudged 1-2px toward the point, not dead-centered by bounding box?\n- Chevrons and arrows in circular frames: nudged toward their pointed end?\n- Single characters or short labels in pill/chip shapes: checked for baseline sitting too low from unused descender space?\n- Icon-plus-label button pairs: extra 1-2px gap added on the icon side to compensate for its lack of ascender?\n- Any nudge applied: is it stored as a named token (`--icon-nudge-x-*`) next to the component, not an unexplained inline style?\n- Skipped on purpose: text above 32px, icons at 12px or smaller, or containers with intentional asymmetric padding?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-type-scale.png',
    diagramCaption:
      'The Vercel Geist typography scale: eight steps derived from a base and a ratio, with H1 and body text at non-adjacent steps.',
    whyItMatters:
      'Without a scale, every new template invents new sizes: an h1 at 30, an h2 at 22, a lead at 18, a caption at 13. Six months in, the tokens table has 14 sizes and nobody remembers which is for what. With a scale, you have six or seven steps and every heading maps to one of them, the way Linear\'s dense app UI and Vercel\'s marketing site both derive from a single ratio decision made once, at the start.',
    learningObjectives: [
      'Generate a full type scale from a base size and a ratio, and explain what each ratio choice signals about the product.',
      'Compare tight ratios (1.125 to 1.2) against dramatic ratios (1.333 and up) for dense apps versus marketing sites.',
      'Apply the "step skipping" rule so two neighboring UI elements read as intentionally different sizes.',
      'Derive line-height and vertical rhythm tokens from the same scale instead of picking them separately.',
      'Convert a static scale into a fluid one using `clamp()` so it no longer needs breakpoint overrides.',
    ],
    sections: [
      {
        heading: 'The ratio is a design decision, not a taste one',
        body: 'Common ratios, named after musical intervals: 1.125 (major second), 1.2 (minor third), 1.25 (major third), 1.333 (perfect fourth), 1.414 (augmented fourth), 1.618 (golden ratio). Smaller ratios (1.125 to 1.2) keep the scale tight, useful for dense apps like Linear or internal dashboards where a heading is only a step above body text and vertical space is precious. Larger ratios (1.333 and up) create dramatic hierarchy suited to marketing sites, where a hero headline needs to visibly dominate the page. Pick once at the start of the system; the ratio propagates through every heading, and swapping it later means retyping every layout that assumed the old proportions.',
      },
      {
        heading: 'The scale generates line-height and spacing too',
        body: 'Once type sizes sit on a scale, you derive line-height as a per-step token, typically tighter as size grows (a 1.5 ratio at 16px body text, closer to 1.1 at 48px display text), and vertical rhythm as multiples of the base. This is where the "compression" earns its keep: instead of memorizing that H1 is 32/40 and H2 is 24/32 as two unrelated facts, every step carries its own line-height token, and the spacing above and below headings falls out of the same grid. Utopia and Type-scale.com both expose this directly: pick a ratio, get the whole system, not just the font sizes.',
      },
      {
        heading: 'The scale should not be visible in the UI',
        body: 'A scale is not a hierarchy. Two neighboring text elements in an app should almost always be one step apart on the scale, not adjacent steps used side by side. A card title at step 2 sits next to body text at step 0, deliberately skipping step 1 so the size difference reads as intentional rather than a rounding error. If a single screen uses every step of the scale at once, the hierarchy collapses because there is nowhere for the eye to rest; Vercel Geist ships eight steps and most individual screens in the product use no more than three of them.',
      },
      {
        heading: 'Fluid scales replace media queries',
        body: 'The next move makes each step scale with the viewport instead of jumping at breakpoints. Utopia (launched 2020) generates a scale where, say, step 3 is 24px at a 320px viewport and 32px at a 1440px viewport, computed via `clamp()` and linear interpolation between the two endpoints. This eliminates the "font is too small on mobile" and "font is too big on desktop" tuning that used to live in a stack of `@media` overrides. Combined with a modular scale, you get one function per step that returns the right size at any width in between, not just at the breakpoints you happened to test.',
      },
      {
        heading: 'Named scales in the wild look different for a reason',
        body: 'Linear\'s compact interface effectively runs a tight ratio near 1.15, keeping headings close to body text because the product is a dense list-and-detail tool, not a storytelling surface. Vercel Geist publishes eight named steps from 12px to 64px, roughly following a 1.25 to 1.333 blend that tightens at the small end and widens at the large end. Material Design 3 (Google, 2021) defines thirteen named type styles across five roles (display, headline, title, body, label), a much larger vocabulary aimed at covering entire native apps rather than a single product surface. Tailwind CSS ships ten default text-size utilities (`text-xs` through `text-9xl`) on a scale that is close to, but not exactly, a single fixed ratio.',
      },
      {
        heading: 'Building a scale by hand versus with a tool',
        body: 'Modular-scale calculators go back to at least 2015 (Tim Brown\'s modularscale.com), long before fluid type existed; they solved the "what size comes next" problem for static designs. Utopia\'s 2020 addition of fluid `clamp()` output solved the second problem, "what size at this width," without asking designers to learn the underlying algebra. By 2026, most new design systems skip the hand-calculation step entirely and paste a Utopia-generated block directly into their token file, checking only that the chosen ratio and base match the product\'s density, not re-deriving the numbers from scratch.',
      },
      {
        heading: 'Step skipping in practice, with numbers',
        body: 'At base 16 and ratio 1.25, the scale runs roughly 16, 20, 25, 31, 39, 49, 61, 76. A card title at 25px (step 2) next to a body paragraph at 16px (step 0) reads clearly as "title, then content," because the gap is 56 percent, comfortably above the roughly 20 percent threshold where the eye starts to notice a size difference as deliberate rather than accidental. Placing that same title at step 1 (20px) next to the same 16px body text produces only a 25 percent gap, just above the noticing threshold and easy to read as a rendering inconsistency rather than an intended hierarchy, which is exactly why step skipping is the rule rather than a suggestion.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-type-scale-ratios.svg',
        alt: 'Comparison of tight versus dramatic type ratios',
        caption: 'Ratio 1.125 keeps H1 close to body text for dense apps; ratio 1.5 pushes H1 far above body text for marketing pages.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two vertical bar-chart-style columns side by side. Left column labeled "ratio 1.125, dense app": a stack of short horizontal bars of gradually increasing width, all fairly close in size, topped with a label "H1" on the tallest and "body" on the shortest, gap between them small. Right column labeled "ratio 1.5, marketing site": a stack of horizontal bars with dramatically increasing width, the tallest ("H1") much larger than the shortest ("body"), the gap large. Keep bars simple horizontal rectangles, left-aligned, increasing in length top to bottom or bottom to top consistently.',
      },
      {
        src: '/lessons/de/de-cv-type-scale-skip.svg',
        alt: 'Step skipping versus adjacent steps',
        caption: 'A card title at step 2 next to body at step 0 reads as intentional hierarchy; step 1 next to step 0 reads as a rounding error.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two mock UI fragments stacked vertically. Top fragment labeled "adjacent steps, step 1 next to step 0": a heading and a body line with only a slightly larger heading, connected by a bracket labeled "25% gap, reads as noise". Bottom fragment labeled "skipped step, step 2 next to step 0": a heading noticeably larger than the body line, connected by a bracket labeled "56% gap, reads as intent". Use simple placeholder text bars (thick horizontal line for heading, thinner lines for body paragraph) rather than actual letterforms.',
      },
    ],
    takeaways: [
      'Pick one ratio and one base size before writing any headings.',
      'Ratio 1.125 to 1.2 for dense apps; 1.333 and up for marketing.',
      'Two neighboring elements should be a step apart, not adjacent on the scale.',
      'Fluid scales via `clamp()` replace most typography media queries.',
    ],
    terms: [
      { term: 'Type scale', gloss: '"the font sizes we use"', meaning: 'An ordered set of font sizes generated by repeatedly multiplying a base size by a fixed ratio, rather than picked one at a time.' },
      { term: 'Ratio', gloss: '"how big the jump is"', meaning: 'The fixed multiplier between consecutive steps in a type scale, such as 1.25; often named after a musical interval.' },
      { term: 'Base size', gloss: '"the default text size"', meaning: 'The single step every other step in the scale is derived from, almost always the body-text size, usually 16px on the web.' },
      { term: 'Step skipping', gloss: '"making the heading bigger"', meaning: 'The deliberate practice of using non-adjacent steps of the scale for two elements shown together, so the size gap reads as intentional hierarchy rather than noise.' },
      { term: 'Fluid scale', gloss: '"responsive font sizes"', meaning: 'A type scale where each step\'s value interpolates smoothly between two endpoint sizes at two viewport widths, computed with `clamp()` instead of fixed per-breakpoint values.' },
      { term: 'Line-height token', gloss: '"the spacing between lines"', meaning: 'A line-height value explicitly paired with a specific type-scale step, rather than one line-height applied uniformly across every size.' },
      { term: 'Modular scale', gloss: '"another name for type scale"', meaning: 'The general technique of generating a size series (type, spacing, or otherwise) from a base value and a constant ratio; the term predates fluid type entirely.' },
      { term: 'Vertical rhythm', gloss: '"consistent spacing down the page"', meaning: 'The practice of keeping all vertical spacing (line-height, margins between elements) as multiples of a single base unit, so the page feels evenly gridded.' },
      { term: 'Type role', gloss: '"what the text is for"', meaning: 'A named category (display, headline, title, body, label) that a type-scale step is assigned to, distinct from the raw pixel size itself.' },
      { term: 'Perfect fourth', gloss: '"a bigger jump"', meaning: 'The musical-interval name for the 1.333 ratio, one of the more dramatic common choices for a type scale, often used on marketing and editorial sites.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given a base size of 16px and a ratio of 1.25, compute the first five steps of the scale (round to the nearest whole pixel).' },
      { level: 'medium', prompt: 'Generate the same five steps using a ratio of 1.125 instead, and explain in one sentence which product (a dense internal tool or a marketing landing page) each resulting scale suits better and why.' },
      { level: 'hard', prompt: 'Design a fluid version of a single scale step: it should render at 24px at a 320px viewport and 32px at a 1440px viewport. Write the `clamp()` expression, showing the rem-plus-vw math that produces those two endpoints.' },
      { level: 'design', prompt: 'Audit a real product screen for step-skipping violations: find one place where two text elements sit on adjacent scale steps and read as noise rather than hierarchy. Propose which step to move one of them to, and justify the choice with the percentage gap it produces.' },
    ],
    furtherReading: [
      { label: 'Utopia, "Fluid type scale"', url: 'https://utopia.fyi/type/calculator/', why: 'The tool that generates production-ready `clamp()` values for an entire fluid scale from two endpoint sizes.' },
      { label: 'Type-scale.com', url: 'https://type-scale.com', why: 'An interactive ratio picker that shows every named musical ratio applied live to a sample page.' },
      { label: 'Butterick\'s Practical Typography', url: 'https://practicaltypography.com', why: 'Robert Bringhurst-adjacent, plain-language typographic principles that inform how a scale should be used, not just generated.' },
      { label: 'Vercel Geist typography', url: 'https://vercel.com/geist/typography', why: 'A shipping eight-step scale you can inspect directly in devtools, a real reference point for how few sizes a product actually needs.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'An 8-step type scale token block',
      body: '/* Base 16px, ratio 1.25. Eight steps, most screens use three. */\n:root {\n  --text-0: 1rem;      /* 16px, body */\n  --text-1: 1.25rem;   /* 20px, skip this next to body */\n  --text-2: 1.563rem;  /* 25px, card title, pairs with --text-0 */\n  --text-3: 1.953rem;  /* 31px, section heading */\n  --text-4: 2.441rem;  /* 39px, page heading */\n  --text-5: 3.052rem;  /* 49px, hero subhead */\n  --text-6: 3.815rem;  /* 61px, hero headline */\n  --text-7: 4.768rem;  /* 76px, display */\n\n  /* Line-height tightens as size grows */\n  --leading-0: 1.5;\n  --leading-2: 1.35;\n  --leading-4: 1.2;\n  --leading-6: 1.05;\n}',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-clamp.png',
    diagramCaption:
      'The Utopia clamp calculator: two endpoints (16 px at 320 wide, 24 px at 1440 wide) turned into one `clamp()` string.',
    whyItMatters:
      'Media query typography looks like stairs: 18px until 768, then 20px until 1024, then 24. Between breakpoints, the size does not respond, and at the breakpoint it jumps. `clamp()` smooths the ramp: `font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem)` starts at 16px on small screens, grows with viewport width, and stops at 24px, with no breakpoints in the rule and no branches to review. For a design engineer, this is what collapses a table of type-size-per-breakpoint down to one function per step of the scale, the trick behind why well-built marketing pages in 2026 often ship with zero typography media queries.',
    learningObjectives: [
      'Explain what each of the three arguments to `clamp()` does and how the middle one behaves as a linear function of viewport width.',
      'Solve for the rem-plus-vw coefficients that produce a specific pair of size endpoints at two viewport widths.',
      'Identify the rem-versus-px accessibility bug that is the most common mistake in fluid typography.',
      'Apply the same `clamp()` technique to spacing, not just font size.',
      'Decide when a property needs a discrete media or container query instead of a continuous `clamp()`.',
    ],
    sections: [
      {
        heading: 'The middle argument is a linear function of the viewport',
        body: 'The trick is the `preferred` value: a mix of `rem` and `vw`. The `rem` term anchors the line at a fixed offset, the `vw` term gives it slope. `0.5rem + 2vw` evaluates to 14.4px at a 320px viewport and to 36.8px at a 1440px viewport, before clamping caps it at the outer min and max. To hit a specific pair of endpoints, say 16px at 320px wide and 24px at 1440px wide, you solve two linear equations for the rem constant and the vw coefficient. Utopia\'s calculator (launched 2020) does this arithmetic for you and outputs the exact `clamp()` string, so in practice nobody derives it by hand anymore.',
      },
      {
        heading: 'Accessibility does not disappear if you use rem',
        body: 'The one real pitfall: use `rem` for the min and max, never `px`. If a user bumps their browser\'s default font size (a common low-vision accommodation), `clamp(16px, ..., 24px)` will not respond to that preference at all, because pixel values are absolute. `clamp(1rem, ..., 1.5rem)` scales correctly with the user\'s root font-size setting. The `vw` unit inside the middle argument is fine to leave as-is, since it only drives the interpolation slope, not the hard ceiling and floor. This single mistake, px in the endpoints, is the most common bug flagged in fluid-typography accessibility reviews.',
      },
      {
        heading: 'Worked example: solving the two-point equation',
        body: 'Say you want 1rem (16px) at a 320px viewport and 1.5rem (24px) at a 1440px viewport. The slope is `(24 - 16) / (1440 - 320) = 0.00714px per px of viewport`, which converts to `0.714vw` (since 1vw is 1 percent of viewport width). The rem-anchor is found by plugging back into the line equation at either endpoint: `16px = rem_constant + 0.714vw * 320px / 100`, giving a rem constant close to `0.714rem`. The resulting expression, `clamp(1rem, 0.714rem + 0.714vw, 1.5rem)`, is exactly the kind of string Utopia\'s calculator produces instantly, which is why hand-deriving it is a useful exercise once and a waste of time every time after.',
      },
      {
        heading: 'Fluid spacing works the same way',
        body: 'The identical technique applies to margins, padding, and gaps. `padding: clamp(1rem, 0.5rem + 2vw, 3rem)` gives a section that breathes with the viewport instead of jumping at breakpoints. Combining fluid type and fluid spacing at matching slopes keeps visual rhythm consistent as the viewport changes: text and whitespace grow together rather than the gap between them stretching or compressing unevenly. Utopia calls this pattern "fluid space," and it is the specific reason a well-tuned marketing page can drop nearly all its layout-related `@media` queries, keeping only the ones for structural changes.',
      },
      {
        heading: 'Where to still use a media query',
        body: '`clamp()` is built for continuous properties: anything with a smooth curve between two sizes. When the layout structure changes categorically, a sidebar collapses, a nav becomes a hamburger menu, a two-column grid becomes one column, that is a discrete switch, and it still needs a container query or media query, because there is no meaningful "in-between" state to interpolate toward. The working rule: `clamp()` for anything smooth, a query for anything that is a binary or multi-state switch. Most typography and spacing decisions are smooth; most structural layout decisions are switches, and conflating the two categories is what makes a fluid layout hard to review.',
      },
      {
        heading: 'Where fluid type and container queries meet',
        body: 'Container queries, standardized and shipped across all major browsers by 2023, solve a related but distinct problem: sizing based on a parent container\'s width rather than the viewport\'s. A card component that needs to look different inside a narrow sidebar versus a wide main column benefits from a container query for its layout (single column of text versus two), while its font size inside either layout can still use `clamp()` bound to the container\'s own width via `cqw` units. The two tools compose rather than compete: `clamp()` handles the smooth interpolation, container queries handle the discrete layout branch, and a 2026 component built with both rarely needs a traditional `@media` rule at all.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-clamp-stairs.svg',
        alt: 'Media query stairs versus clamp ramp',
        caption: 'Media queries produce a stair-step size curve across viewport width; clamp() produces a smooth ramp with two flat ceilings.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two line graphs side by side sharing the same x-axis (viewport width, 320 to 1440) and y-axis (font size, 16 to 24px). Left graph labeled "media queries": a stair-step line with two or three flat horizontal segments connected by vertical jumps. Right graph labeled "clamp()": a line that starts flat at 16px, rises smoothly and linearly through the middle range, then flattens again at 24px, drawn as one continuous curve with no jumps. Mark the two flat zones on the clamp graph as "min" and "max" and the sloped middle as "preferred (rem + vw)".',
      },
      {
        src: '/lessons/de/de-cv-clamp-equation.svg',
        alt: 'Solving the clamp two-point equation',
        caption: 'Two known points (16px at 320px viewport, 24px at 1440px viewport) solve for the rem constant and vw coefficient in the preferred value.',
        diagramBrief: 'Cream paper background, black ink, one accent color. A simple annotated line graph: x-axis viewport width from 320 to 1440, y-axis font size from 16 to 24. Plot two points, one at (320, 16) and one at (1440, 24), each labeled with its coordinates. Draw a straight line connecting them, and along the line write the slope calculation "(24-16)/(1440-320) = 0.00714px per px = 0.714vw" and the resulting expression "clamp(1rem, 0.714rem + 0.714vw, 1.5rem)" in a small text box near the line.',
      },
    ],
    takeaways: [
      'Use `clamp()` for one-line fluid type and spacing, not a stack of media queries.',
      'Use `rem` for min and max so the user\'s font-size preference still works.',
      'Utopia generates the exact `clamp()` string from two endpoints.',
      'Media and container queries stay useful for structural switches, not size ramps.',
    ],
    terms: [
      { term: 'clamp()', gloss: '"caps a value between two limits"', meaning: 'A CSS function, `clamp(min, preferred, max)`, that returns the middle value whenever it falls between min and max, and the nearest boundary otherwise.' },
      { term: 'Preferred value', gloss: '"the responsive part"', meaning: 'The middle argument to `clamp()`, typically a linear combination of `rem` and `vw`, that determines the value while it is inside the min-max range.' },
      { term: 'vw', gloss: '"percent of screen width"', meaning: 'A CSS length unit where 1vw equals 1 percent of the current viewport\'s width; it drives the slope of a fluid value, not its floor or ceiling.' },
      { term: 'rem', gloss: '"font-relative unit"', meaning: 'A length unit relative to the root `html` element\'s font size, which scales correctly if the user changes their browser\'s default font size.' },
      { term: 'Fluid typography', gloss: '"text that resizes smoothly"', meaning: 'Font sizes that interpolate continuously between two viewport widths using `clamp()`, rather than jumping at fixed breakpoints.' },
      { term: 'Container query', gloss: '"responsive to the parent, not the screen"', meaning: 'A CSS rule (`@container`) that applies styles based on the size of a containing element rather than the browser viewport; shipped across major browsers by 2023.' },
      { term: 'Media query', gloss: '"breakpoint styling"', meaning: 'A CSS rule (`@media`) that applies styles based on the viewport\'s characteristics, most commonly its width, in discrete steps rather than continuously.' },
      { term: 'min() / max()', gloss: '"clamp\'s siblings"', meaning: 'CSS functions that return the smaller or larger of a list of values respectively; `clamp(a, b, c)` is defined as equivalent to `max(a, min(b, c))`.' },
      { term: 'Interpolation', gloss: '"filling in the in-between values"', meaning: 'The process of computing a smooth intermediate value between two known endpoints, which is what the `vw`-driven preferred value of `clamp()` performs.' },
      { term: 'Breakpoint', gloss: '"where the layout changes"', meaning: 'A specific viewport width at which a media query\'s styles switch on or off; a discrete threshold, in contrast to `clamp()`\'s continuous interpolation.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Evaluate `clamp(1rem, 0.5rem + 2vw, 1.5rem)` at a 320px viewport and at a 1440px viewport (assume 1rem = 16px), and state whether either result is clamped to a boundary.' },
      { level: 'medium', prompt: 'Solve for the rem constant and vw coefficient needed to produce exactly 18px at a 375px viewport and 28px at a 1280px viewport, and write the full `clamp()` expression.' },
      { level: 'hard', prompt: 'Design a fluid spacing scale (three tokens: tight, base, loose) that grows at the same slope as a fluid type scale you have already built, so text and whitespace expand together across the viewport. Show the three `clamp()` expressions.' },
      { level: 'design', prompt: 'Take a hero heading currently styled with three `@media` breakpoints (18px, 24px, 32px at three widths). Rewrite it as a single `clamp()` line, and write the one-sentence rationale you would give a reviewer for why the media queries are no longer needed for this property, while noting one nearby property that should still keep its media query.' },
    ],
    furtherReading: [
      { label: 'MDN, CSS `clamp()`', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clamp', why: 'The formal syntax reference, including the `max(a, min(b, c))` equivalence and browser support notes.' },
      { label: 'web.dev, "min(), max(), and clamp()"', url: 'https://web.dev/articles/min-max-clamp', why: 'Graphed explanations of each function with labeled diagrams, useful for building intuition before writing the CSS.' },
      { label: 'Utopia fluid type calculator', url: 'https://utopia.fyi/type/calculator/', why: 'Generates production-ready `clamp()` strings from two endpoint sizes, the tool referenced throughout this lesson.' },
      { label: 'Josh Comeau, "Full-bleed layout and fluid typography"', url: 'https://www.joshwcomeau.com/css/full-bleed/', why: 'A practical walkthrough combining fluid type with full-bleed layout techniques on a real page.' },
    ],
    shipIt: {
      kind: 'snippet',
      name: 'Fluid type and spacing scale',
      body: '/* Endpoints: 320px viewport to 1440px viewport.\n   Always rem for min/max, vw is fine in the middle only. */\n:root {\n  --text-body: clamp(1rem, 0.86rem + 0.36vw, 1.125rem);      /* 16px -> 18px */\n  --text-heading: clamp(1.5rem, 1.15rem + 1.07vw, 2rem);      /* 24px -> 32px */\n  --text-display: clamp(2.25rem, 1.5rem + 2.14vw, 3.5rem);    /* 36px -> 56px */\n\n  --space-section: clamp(1.5rem, 0.5rem + 3vw, 4rem);\n  --space-card: clamp(1rem, 0.75rem + 1vw, 1.5rem);\n}\n\n/* Discrete layout switch: keep a real breakpoint here, clamp() cannot do this. */\n@media (max-width: 768px) {\n  .layout { grid-template-columns: 1fr; }\n}',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-semantic-tokens.png',
    diagramCaption:
      'The shadcn/ui theming table: `--background` and `--foreground` semantic tokens on the left, dark-mode reassignments on the right.',
    whyItMatters:
      'If a button reads `background: var(--blue-500)`, dark mode means editing every instance. If it reads `background: var(--color-accent)`, dark mode is one token override in a `[data-theme=\'dark\']` block. The semantic layer is the pointer that lets themes, brand pivots, and per-tenant customization happen without touching component code. shadcn/ui, Radix, and every serious design system since 2020 have converged on the same pattern: two tiers, primitives and semantics, and components only reference the second tier.',
    learningObjectives: [
      'Distinguish a primitive token from a semantic token by checking whether the name still makes sense under a different color palette.',
      'Explain why dark mode is a one-block token override under semantic tokens but a component rewrite under raw values.',
      'Apply the two-tier pattern to spacing, radii, and shadow, not just color.',
      'Identify a badly-named "semantic" token that has actually locked in an appearance rather than a role.',
      'Design a lint rule that would catch a raw hex value inside a component file.',
    ],
    sections: [
      {
        heading: 'The two-tier structure has a reason',
        body: 'Tier one is the primitive: `--gray-100`, `--gray-900`, `--blue-500`, raw values with no opinion about where they are used. Tier two is the alias: `--surface-1`, `--text-default`, `--accent`, names that describe a role. Components only ever reference tier two. A theme is a redefinition of tier two, pointing the same names at different tier-one values. This structure is what lets one component library ship in ten brands at once: the primitives change per brand, the semantics stay identical, and the components never move. Nathan Curtis at EightShapes wrote the canonical explanation of this pattern; Amy Hupe later published a maturity model tracking how design teams adopt it in stages.',
      },
      {
        heading: 'Naming semantics by intent, not by looks',
        body: 'The trap is naming a semantic token after appearance rather than role: `--color-blue-button` reads like a semantic token but is not one, because the word "blue" has locked in the appearance. `--color-primary-action` is a real semantic, because it would still make sense if the brand color shifted to green, orange, or monochrome tomorrow. Good semantic names describe role, state, and hierarchy: `--text-primary`, `--text-muted`, `--text-danger`, `--surface-raised`, `--border-subtle`. A quick test: if the name would still make sense in a completely different color palette, it is a real semantic; if it would sound wrong, it is a primitive wearing a semantic\'s clothes.',
      },
      {
        heading: 'Tokens are not just colors',
        body: 'The same two-tier structure applies to spacing (`--space-4` as the primitive, `--gap-card` as the semantic that currently points at it), radii (`--radius-8` primitive, `--radius-card` semantic), and shadow (`--shadow-2` primitive, `--elevation-popover` semantic). Every axis of a design system gets both layers, which is what "tokens all the way down" means when Amy Hupe and Nathan Curtis use the phrase. The payoff compounds: a redesign that changes card padding from 16px to 20px becomes a single primitive-tier edit, and every semantic alias pointing at that primitive updates automatically, with zero component-level changes required.',
      },
      {
        heading: 'Enforce with lint, not with hope',
        body: 'The failure mode is a hurry: a component uses `#3b82f6` directly instead of `var(--color-accent)`, ships, and a year later a rebrand has to touch 200 files instead of one token definition. Stylelint plugins and ESLint rules can flag any raw hex, `rgb()`, or literal pixel value found inside a component file, turning a discipline into an enforced constraint rather than a suggestion. shadcn/ui ships this discipline by default in its generated components; Vercel\'s internal Geist tooling enforces the same rule at code review. The tokens themselves do not do the work of keeping a system consistent; the linter that blocks a raw value from merging does.',
      },
      {
        heading: 'Three-tier systems for larger organizations',
        body: 'Some systems add a third tier, component tokens, between semantic and the component itself: Adobe Spectrum, Spectrum 2 (2024) documents global tokens (primitives), alias tokens (semantics), and component tokens (`--spectrum-button-background-color`, scoped to exactly one component). The extra tier buys isolation, a change to how one specific button variant looks does not risk touching every other place `--color-accent` is used, at the cost of more tokens to maintain and name well. Two tiers are enough for most product teams; three tiers earn their complexity mainly at the scale of a platform serving dozens of independent product teams, which is the situation Adobe designed Spectrum for.',
      },
      {
        heading: 'The historical arc of the pattern',
        body: 'Salesforce\'s Lightning Design System coined the term "design token" publicly around 2014, initially just meaning any named value pulled out of code into a shared file. The two-tier primitive-versus-semantic split crystallized separately across multiple teams by 2020, visible in shadcn/ui, Radix, and Adobe Spectrum around the same period, once enough teams had independently hit the same dark-mode pain. The W3C Design Tokens Community Group published a draft format specification in 2023, aiming to standardize how tokens are stored and exchanged between tools like Figma and code, which by 2026 is what lets a Figma Variables collection round-trip into a codebase\'s token file without manual retyping.',
      },
      {
        heading: 'A worked example: shadcn/ui\'s actual override block',
        body: 'shadcn/ui defines `--background` and `--foreground` as semantic tokens at the root, then reassigns both inside a `.dark` class selector, nothing else in the component tree changes. A card component written once as `background: hsl(var(--background))` renders correctly in both themes without a single conditional in the component\'s own code. This is the concrete version of the abstract claim earlier in this lesson: the semantic layer is not a naming convention for its own sake, it is the actual mechanism that makes a one-block theme override possible instead of a per-component rewrite.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-token-tiers.svg',
        alt: 'Two-tier token architecture diagram',
        caption: 'Primitives (raw values) feed semantic aliases (role names); components reference only the semantic tier, so a theme swap only touches the middle layer.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Three-column flowchart. Left column labeled "primitives" with boxes: --gray-900, --blue-500, --space-4, --radius-8. Middle column labeled "semantics" with boxes: --text-default, --color-accent, --gap-card, --radius-card, each connected by an arrow from a primitive box on the left (label the arrows "points to"). Right column labeled "components" with boxes: Button, Card, Input, each connected by an arrow from a semantic box in the middle (label the arrows "references"). Draw a dashed box around the primitives column labeled "changes per theme" and a solid box around the semantics and components columns labeled "stays identical across themes".',
      },
      {
        src: '/lessons/de/de-cv-semantic-naming-test.svg',
        alt: 'Semantic naming test: appearance versus role',
        caption: 'A token name that still makes sense under a different palette is a real semantic; one that names a color has locked in the appearance.',
        diagramBrief: 'Cream paper background, black ink, one accent color. A simple two-column comparison table drawn as boxes. Left column header "names appearance, breaks under theming": list --color-blue-button, --text-red, --border-light-gray, each with a small red X mark. Right column header "names role, survives theming": list --color-primary-action, --text-danger, --border-subtle, each with a small checkmark in the accent color. Below the table, draw one small swatch strip showing the same --color-primary-action token rendered as blue in one theme and green in a second theme, both checked, labeled "same name, different value, still correct".',
      },
    ],
    takeaways: [
      'Two tiers: primitives are raw, semantics are aliases; components use semantics.',
      'Name semantics by role, not by appearance ("accent" not "blue").',
      'Apply the two-tier structure to spacing and radii, not just color.',
      'Lint out raw values in component files or the discipline decays.',
    ],
    terms: [
      { term: 'Primitive token', gloss: '"the raw color/size value"', meaning: 'A named value with no opinion about usage context, such as `--gray-900` or `--space-4`; the raw material a semantic token points at.' },
      { term: 'Semantic token', gloss: '"the token components actually use"', meaning: 'A named alias that describes a role or intent (`--color-accent`, `--gap-card`) and resolves to a primitive token; the only tier a component should reference directly.' },
      { term: 'Theme', gloss: '"light mode / dark mode"', meaning: 'A complete set of primitive-token reassignments applied to the same semantic-token names, letting one component tree render differently without any component-level branching.' },
      { term: 'Alias', gloss: '"a token that points at another token"', meaning: 'A token whose value is a reference to another token rather than a raw literal; every semantic token is an alias of some primitive (or of another semantic, in a three-tier system).' },
      { term: 'Token tier', gloss: '"a layer in the token system"', meaning: 'One named layer in a multi-layer token architecture, most commonly primitive and semantic, sometimes with a third component-scoped layer added.' },
      { term: 'Component token', gloss: '"a token just for one component"', meaning: 'A third-tier token scoped to exactly one component, such as `--spectrum-button-background-color`, used in larger systems like Adobe Spectrum to isolate a single component\'s styling from the shared semantic layer.' },
      { term: 'Design token', gloss: '"any named design value"', meaning: 'Any named value in a design system, primitive, semantic, or component-scoped; the term was popularized publicly by Salesforce\'s Lightning Design System around 2014.' },
      { term: 'DTCG format', gloss: '"the standard token file format"', meaning: 'A draft JSON format published by the W3C Design Tokens Community Group starting in 2023, aiming to standardize how design tokens move between tools such as Figma and code.' },
      { term: 'Figma Variable', gloss: '"figma\'s version of a token"', meaning: 'Figma\'s native implementation of a design token (introduced 2023), used inside Figma files and increasingly synced to a codebase\'s token file via the DTCG format.' },
      { term: 'Lint rule (for tokens)', gloss: '"the thing that blocks a hardcoded color"', meaning: 'A Stylelint or ESLint rule configured to flag any raw hex, `rgb()`, or literal pixel value used directly in component code instead of a semantic token reference.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Classify each of the following as a primitive, a real semantic, or a fake semantic (a primitive disguised with a semantic-sounding name): `--blue-600`, `--color-primary-button`, `--color-blue-button`, `--space-8`.' },
      { level: 'medium', prompt: 'Write the two-tier token set (primitive plus semantic) for a card component that needs a background, a border, and a heading text color, in both a light and a dark theme.' },
      { level: 'hard', prompt: 'A product needs to support three white-label brand themes, each with a different accent hue, on top of light and dark mode, six theme combinations total. Design the tier structure (how many tiers, what each tier is scoped to) that avoids needing six full sets of hand-tuned component styles.' },
      { level: 'design', prompt: 'You are handed a real component file that uses `#3b82f6`, `#1e293b`, and `16px` directly inline in six places. Write the semantic token names you would introduce, and draft the one-paragraph note you would leave on the pull request explaining why each raw value needs to become a token before merge.' },
    ],
    furtherReading: [
      { label: 'Nathan Curtis, "Naming design tokens"', url: 'https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e4a0644739a', why: 'The canonical piece defining the primitive-versus-alias split and how to name each tier correctly.' },
      { label: 'Amy Hupe, "A design tokens system for scale"', url: 'https://amyhupe.co.uk/articles/', why: 'A maturity model for adopting tiered tokens across a growing design system, useful for planning the rollout, not just the naming.' },
      { label: 'shadcn/ui theming docs', url: 'https://ui.shadcn.com/docs/theming', why: 'A shipping, inspectable example of the `--background` / `--foreground` semantic pattern with a real dark-mode override block.' },
      { label: 'W3C Design Tokens Community Group', url: 'https://www.designtokens.org', why: 'The draft standard format for exchanging design tokens between tools, relevant once a token system needs to sync with Figma.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Semantic token naming audit',
      body: '- Does the token name describe a role (accent, danger, muted) rather than an appearance (blue, red, gray)?\n- Would the name still make sense if the underlying color, spacing, or radius value changed completely?\n- Does every component reference only semantic tokens, never a primitive directly?\n- Is there a lint rule (Stylelint/ESLint) that fails a raw hex, `rgb()`, or literal px value inside a component file?\n- If a three-tier system is in use, is the component-scoped tier reserved for genuinely component-specific overrides, not used as an escape hatch from naming a real semantic?\n- Does a theme change (light/dark, brand pivot) require editing only the semantic-to-primitive mapping, with zero component file changes?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-grid.png',
    diagramCaption:
      'The Vercel Geist spacing scale: eight non-linear steps (4, 8, 12, 16, 24, 32, 48, 64) covering every product surface.',
    whyItMatters:
      'Freeform spacing produces components where the gap above a card is 14px, the gap below is 18px, and nobody can explain why. On a grid, the same layout uses `gap-4` (16px) or `gap-6` (24px), and the choice is visible in review. Tailwind\'s spacing scale, Material\'s 4dp grid, Vercel Geist\'s 4px base, and Apple\'s 8pt grid all encode the same idea: bound the spacing vocabulary so a designer picks from six options instead of an unbounded integer number line.',
    learningObjectives: [
      'Explain why a spacing grid constrains choices without forcing every gap to be a single fixed value.',
      'Compare base-4 and base-8 conventions and identify which suits a dense product UI versus a coarser native app.',
      'Explain why non-linear spacing scales compress better than linear ones as values grow.',
      'Apply the same grid discipline to padding, gap, icon size, and radius, not just margin.',
      'Decide when an off-grid value is legitimate and how to document the exception so it does not multiply.',
    ],
    sections: [
      {
        heading: 'Pick 4 or 8, not both',
        body: 'The two live conventions: base-4 (Tailwind CSS, Vercel Geist) with steps at 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, and base-8 (Apple, most native iOS work) with steps at 0, 8, 16, 24, 32, 40, 48. Base-4 is finer, useful for text-heavy dense product UIs where an 8px jump between two options is sometimes too coarse. Base-8 is coarser and enforces a stronger rhythm at the cost of some flexibility, which suits Apple\'s platform-wide 8pt grid convention, dating back to early iOS Human Interface Guidelines. Pick one and never mix within a single system; mixing is exactly what causes half-steps (6px, 10px, 14px) to creep back in.',
      },
      {
        heading: 'The scale should not be linear',
        body: 'Once a base is chosen, a purely linear scale (4, 8, 12, 16, 20, 24, 28, 32) does not compress well as values grow. Most systems shift to non-linear steps at the large end (4, 8, 12, 16, 24, 32, 48, 64), matching a rough 1.5x ratio once past 16. This is because a difference between 40 and 48 reads as noise to the eye, while a difference between 32 and 48 reads as intent; the gap between a card and its immediate content should look different from the gap between two adjacent cards, and a non-linear scale is what supports that distinction without inventing a seventh nearly-identical step.',
      },
      {
        heading: 'The grid applies to every axis',
        body: 'Padding, margin, gap, icon size, radius, and even line-height should all be tokens on the same grid. If padding steps at multiples of 4 and icons come in sizes of 12, 16, 20, 24, icon and text spacing stay aligned by construction rather than by a designer manually eyeballing each pairing. This shared-grid discipline is a large part of why Vercel Geist and shadcn/ui read as "engineered": the same eight numbers show up in the spacing, the icon sizing, and the radius scale, so nothing in the interface has an orphaned, unrelated number floating in it.',
      },
      {
        heading: 'Off-grid values earn a comment',
        body: 'There are legitimate reasons to break the grid: a 1px hairline border, a small optical offset, a translated string that needs a 2px overshoot to avoid clipping. Break it, but not silently. The working rule is that any off-grid value in a component file needs a comment explaining why it exists. That single requirement is what stops one justified exception from quietly becoming permission for the next fifty unjustified ones. Tailwind\'s arbitrary-value syntax (`p-[7px]`) makes off-grid values easy to write, which is exactly why the accompanying discipline of commenting each one matters more, not less.',
      },
      {
        heading: 'Historical arc: where the two conventions came from',
        body: 'Google Material Design formalized an 8dp grid in 2014, chosen because Android screen densities are themselves defined in multiples of 4 and 8 density-independent pixels, making the grid a natural fit for the underlying rendering system. Apple\'s Human Interface Guidelines have used an 8-point baseline since the early iOS era, reinforced by the platform\'s point-based coordinate system. Tailwind CSS, released in 2017, chose a base-4 rem-derived scale (`0.25rem` increments) specifically for the web\'s finer-grained layout needs, and Vercel Geist inherited the same 4px base when it launched its own design system. By 2026, base-4 dominates web product design, and base-8 remains the default for native mobile platforms.',
      },
      {
        heading: 'A worked example: laying out a card end to end',
        body: 'A notification card on a base-4 grid might use 16px padding on all sides (`--space-4`), a 12px gap between the icon and the title (`--space-3`), a 24px gap between the card and the next card in the list (`--space-6`), and a 16px icon (aligned to the same 4px grid the padding uses). Every one of those four numbers comes from the same six-or-seven-entry token table, and a reviewer scanning the CSS can immediately tell which decision was made at each spot, rather than having to trust that 14px, 13px, 22px, and 17px were each independently reasoned through.',
      },
      {
        heading: 'Where the spacing grid meets the icon and type grids',
        body: 'A 24px icon inside a component that uses a 4px spacing grid wants padding that is itself a multiple of 4 around it, commonly 8px or 12px, so the icon\'s bounding box aligns to the same rhythm as the surrounding text and controls. Mismatches show up as icons that sit slightly closer to one edge of a button than the other, even when the button\'s overall padding looks even on paper, because the icon\'s own internal safe-area margin was not accounted for. Keeping the spacing grid, the icon grid, and the type scale\'s line-height all derived from the same base unit is what removes this entire class of near-miss alignment bug before it starts.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-grid-linear-vs-nonlinear.svg',
        alt: 'Linear versus non-linear spacing scale comparison',
        caption: 'A linear scale (4, 8, 12... 32) crowds together at the large end; a non-linear scale (4, 8, 12, 16, 24, 32, 48, 64) spreads intent across the same range.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Two horizontal number lines stacked vertically, both spanning 0 to 64. Top line labeled "linear (4, 8, 12, 16, 20, 24, 28, 32)": evenly spaced tick marks, all clustered in the first half of the line, with a bracket over the 28-32-36 region labeled "differences read as noise". Bottom line labeled "non-linear (4, 8, 12, 16, 24, 32, 48, 64)": tick marks spaced closer together at the low end and increasingly far apart toward the high end, with a bracket over the 32-48 region labeled "difference reads as intent".',
      },
      {
        src: '/lessons/de/de-cv-grid-card-example.svg',
        alt: 'A notification card annotated with spacing tokens',
        caption: 'Every gap in a notification card, padding, icon-to-title gap, and card-to-card gap, maps to one shared spacing token.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Draw a simple notification card: an icon square on the left, a title and subtitle text block to its right, all inside a rounded rectangle card. Label four measurements with small dimension-line arrows and accent-colored text: the padding on all sides of the card as "--space-4 (16px)", the gap between the icon and the text block as "--space-3 (12px)", the icon\'s own size as "16px icon", and the gap between this card and a second card drawn below it as "--space-6 (24px)".',
      },
    ],
    takeaways: [
      'Pick base-4 or base-8 at system inception and do not mix.',
      'Non-linear steps compress better than linear ones once the values grow.',
      'Apply the grid to padding, gap, icon size, and radius, not just margin.',
      'Off-grid values need a comment; that is what makes exceptions rare.',
    ],
    terms: [
      { term: 'Base grid', gloss: '"the spacing unit"', meaning: 'The single multiple every spacing token in a system derives from, almost always 4 or 8 pixels.' },
      { term: 'Spacing token', gloss: '"the gap value we use"', meaning: 'A named step on the base grid, such as `--space-4` for 16px, used in place of a raw pixel value inside components.' },
      { term: 'Non-linear scale', gloss: '"the gaps get bigger at the top"', meaning: 'A spacing or type scale where the difference between consecutive steps grows as the values increase, such as 4, 8, 12, 16, 24, 32, 48.' },
      { term: 'Rhythm', gloss: '"consistent spacing everywhere"', meaning: 'The overall visual pattern created when every spacing decision in a layout is drawn from the same small, shared token set.' },
      { term: 'dp / dip', gloss: '"android\'s pixel unit"', meaning: 'Density-independent pixel, the unit Android layouts are specified in, which scales automatically with a device\'s screen density; the basis of Material Design\'s 8dp grid.' },
      { term: 'pt (point)', gloss: '"apple\'s pixel unit"', meaning: 'The coordinate unit iOS layouts are specified in, analogous to Android\'s dp, and the basis of Apple\'s 8-point grid convention.' },
      { term: 'Half-step', gloss: '"an off-grid number"', meaning: 'A spacing value like 6px or 10px that falls between the grid\'s defined steps, breaking the shared rhythm; the thing a spacing grid exists to prevent.' },
      { term: 'Arbitrary value', gloss: '"a one-off css value"', meaning: 'Tailwind CSS\'s syntax (`p-[7px]`) for specifying an off-grid value directly, intended for the rare legitimate exception, not routine use.' },
      { term: 'Density-independent pixel', gloss: '"see dp"', meaning: 'The full name for Android\'s dp unit, defined so that a layout specified in it renders at a consistent physical size across screens of differing pixel density.' },
      { term: 'Safe area (icon)', gloss: '"the margin inside an icon\'s box"', meaning: 'The inset margin within an icon\'s drawing grid where the artwork actually sits, distinct from the full grid box, which affects how much surrounding padding an icon visually needs.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'Given this CSS snippet, `padding-top: 14px; gap: 18px; padding-bottom: 22px;`, identify which values are off a base-4 grid and propose the nearest on-grid replacement for each.' },
      { level: 'medium', prompt: 'Convert a component currently built on Apple\'s base-8 grid (padding 16, gap 8, icon 24) to a base-4 grid without changing its overall visual size, choosing the closest equivalent tokens.' },
      { level: 'hard', prompt: 'Design a non-linear base-4 spacing scale from 4px up to 96px, choosing where the ratio should shift from roughly 1.3x per step to roughly 1.5x per step, and justify the shift point with a concrete UI example where the distinction matters.' },
      { level: 'design', prompt: 'Find one off-grid value in a real product\'s CSS (browser devtools, inspect any card or button) and write the one-line code comment that would justify keeping it as an intentional exception, or the one-line fix if it should instead be moved onto the grid.' },
    ],
    furtherReading: [
      { label: 'Vercel Geist, "Spacing"', url: 'https://vercel.com/geist/design/spacing', why: 'A shipping base-4, non-linear spacing scale you can inspect directly, the primary real-world reference for this lesson.' },
      { label: 'Material Design 3, "Spacing"', url: 'https://m3.material.io/foundations/layout/understanding-layout/spacing', why: 'Google\'s published base-8dp spacing token table and the density-independent-pixel rationale behind it.' },
      { label: 'Tailwind CSS spacing docs', url: 'https://tailwindcss.com/docs/customizing-spacing', why: 'The default base-4 scale most web product teams start from, including the jump pattern at the large end.' },
      { label: 'Refactoring UI (Adam Wathan and Steve Schoger), chapter on spacing', url: 'https://www.refactoringui.com', why: 'Practical rationale, written for engineers, on why a small fixed spacing vocabulary beats freeform pixel values.' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Spacing-grid code review checklist',
      body: '- Every margin, padding, and gap value in this file is a token from the spacing scale, not a raw pixel number.\n- The system uses either base-4 or base-8, never a mix of both within one component.\n- Icon sizes and radii used in this file also come from a value on the same base grid.\n- Any off-grid value present has a code comment explaining why (hairline, optical offset, overshoot for translation).\n- No two visually similar gaps in this file use different tokens that resolve to nearly the same pixel value (a half-step in disguise).',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-contrast.png',
    diagramCaption:
      'A Linear card at three elevation tiers, each a slightly lighter surface with a 0.5 px hairline; a soft shadow enters only at the top tier.',
    whyItMatters:
      'Cards that use nothing but drop shadows to signal elevation stack into a shadow-on-shadow soup three levels deep. Linear, Vercel, and Radix all use the alternative: each surface tier is a slightly different background, separated by a 0.5 to 1px border in a color one step above the surface. The eye reads the border, not the shadow, and the design stays crisp at every zoom level, which is the single biggest visible gap between an "AI-generated dashboard" look and a shipping product.',
    learningObjectives: [
      'Explain why elevation is at root a contrast relationship between adjacent surfaces, with shadow as a secondary signal.',
      'Apply WCAG 2.2\'s 4.5:1 text-contrast floor and a looser 1.5:1 to 2:1 target for structural borders.',
      'Draw a 0.5px hairline correctly on Retina and standard displays and explain why it reads sharper than 1px.',
      'Build a two-layer shadow (tight edge plus diffuse ambient) instead of a single blurred rectangle.',
      'Explain why dark-mode elevation lightens a surface instead of adding more shadow.',
    ],
    sections: [
      {
        heading: 'Contrast is quantifiable, guess less',
        body: 'WCAG 2.2 (the current stable spec as of 2026) requires 4.5:1 contrast for body text and 3:1 for large text against its background; that is the accessibility floor, not a target to hover near. Structural elements, borders, dividers, disabled controls, should be visible but subordinate: roughly 1.5:1 to 2:1 against the surface reads as "there but not shouting." APCA, a newer perceptual contrast model expected to anchor a future WCAG 3, accounts for text weight and size in a way WCAG 2\'s simple luminance-ratio math does not. For product UI in 2026, the practical rule is to ship to WCAG 2.2 AA and cross-check the details with APCA; `webaim.org/resources/contrastchecker` remains the fastest day-to-day tool.',
      },
      {
        heading: 'Hairlines carry information at 1px or less',
        body: 'A 1px border in a subtle grey is the cheapest, sharpest way to separate two adjacent surfaces of similar brightness. On Retina and other 2x-density displays, 0.5px hairlines are drawable via `border-width: 0.5px` (reliable in Safari) or `box-shadow: inset 0 0 0 0.5px` (more consistent cross-browser), and they read as noticeably sharper than a full 1px line. Linear ships 0.5px borders on every card in its app. The border color is typically the surface color\'s step 6 or 7 in a Radix-style twelve-step scale: dark enough to register as a boundary, light enough not to compete with the content it separates.',
      },
      {
        heading: 'Shadows come last, and small',
        body: 'Once contrast and hairlines are doing the primary work, a shadow adds "this surface is floating above" as a secondary cue. Keep the elevation shadow soft (blur 8 to 24px, opacity 4 to 8 percent) and pointed in one consistent direction, usually straight down with a slight y-offset. Two-layer shadows, a tight, low-blur shadow for the surface\'s immediate edge plus a diffuse, wide-blur shadow for ambient light, read as noticeably more physically plausible than a single blurred rectangle. Material Design 3 and Apple\'s own elevation systems both publish their shadow recipes in this two-layer form rather than as one value.',
      },
      {
        heading: 'Dark themes need different math',
        body: 'In light mode, elevation moves toward lighter surfaces and toward more shadow as an element rises. In dark mode, elevation still moves toward lighter surfaces (each tier gets a touch brighter as it rises), but moves toward less shadow, sometimes replaced entirely by a subtle inner highlight along the top edge instead. This is because dark surfaces do not visually "cast" a shadow in the way light ones do; the eye reads increasing lightness as coming forward regardless of theme. Vercel Geist and Radix both bake this asymmetry into their token sets: dark-mode surface tokens step up in lightness at each elevation tier while the corresponding shadow tokens barely change.',
      },
      {
        heading: 'Historical arc: from shadow-only to contrast-first',
        body: 'Google\'s original Material Design (2014) leaned almost entirely on shadow to communicate elevation, a natural choice at a time when flat design had just displaced heavy skeuomorphism and any depth cue felt like progress. By the early 2020s, products like Linear and Vercel\'s own dashboard shifted toward contrast-and-hairline as the primary signal, reserving shadow for genuinely floating surfaces like modals and popovers. The APCA project, active research through the mid-2020s, is the formal recognition that contrast itself needed a better perceptual model, not just a better use in layout. By 2026, the products that read as "crafted" rather than "generated" are consistently the ones using contrast and hairlines first, shadow last.',
      },
      {
        heading: 'Computing contrast: what the ratio actually measures',
        body: 'WCAG\'s contrast ratio is computed from each color\'s relative luminance, a weighted sum of its linearized red, green, and blue channel values (green weighted heaviest, since the eye is most sensitive to it), then compared as `(L1 + 0.05) / (L2 + 0.05)` for the lighter and darker of the two colors. The formula produces a ratio between 1:1 (identical colors) and 21:1 (pure black on pure white). A designer does not need to compute this by hand day to day, but understanding that it is luminance-based, not simple RGB-distance-based, explains why two colors that look "obviously different" in hue can still fail a text-contrast check if their luminance happens to be close.',
      },
      {
        heading: 'A component-level walkthrough: Linear\'s card treatment',
        body: 'Linear\'s issue-list cards use three visible surface tiers in practice: the app background, the card surface (one step lighter), and a hover or active state (another step lighter still), each pair separated by a 0.5px border rather than a shadow. A shadow only appears on genuinely overlaid elements, command palettes and dropdown menus, where a surface is truly floating above the rest of the interface rather than simply sitting in a denser region of the same page. This is the concrete version of the lesson\'s core claim: most of what reads as "elevation" in a well-built product is contrast and a hairline doing the work that a shadow is often mistakenly assigned to do instead.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-contrast-tiers.svg',
        alt: 'Three surface tiers separated by hairlines instead of shadow',
        caption: 'App background, card surface, and hover state as three contrast tiers, each separated by a 0.5px hairline; shadow appears only on the truly floating top layer.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Draw three stacked rounded rectangles of slightly increasing lightness (simulate with increasingly sparse hatching or dot density rather than color, since this is monochrome), each separated by a thin single line labeled "0.5px hairline". Label the bottom rectangle "app background", the middle "card surface", the top "hover/active state". To the right, draw a fourth, separate floating rectangle (a dropdown menu) with a soft blurred shadow beneath it, labeled "genuinely floating: shadow appears here only".',
      },
      {
        src: '/lessons/de/de-cv-contrast-breakdown.svg',
        alt: 'Contrast ratio breakdown by UI role',
        caption: 'A single "average contrast" number hides failures; a per-element breakdown shows body text, headings, hairlines, and disabled controls each need a different target ratio.',
        diagramBrief: 'Cream paper background, black ink, one accent color. A horizontal bar chart with five bars, each labeled with a UI role and its contrast ratio: "body text 7.2:1", "heading 8.9:1", "hairline border 1.8:1", "muted label 3.4:1", "disabled control 2.1:1". Draw a vertical dashed line at the 4.5:1 mark labeled "WCAG AA text floor" and a second dashed line at roughly 1.5:1 labeled "structural target". Shade or mark the muted-label bar (3.4:1) as failing since it falls below the 4.5:1 text floor despite being close to it.',
      },
    ],
    takeaways: [
      'Elevation is contrast between surfaces plus a hairline border; shadow is polish.',
      'Structural borders want 1.5:1 to 2:1 contrast, text wants 4.5:1 (WCAG AA).',
      '0.5 px hairlines are drawable on Retina and read sharper than 1 px.',
      'In dark mode, elevation lightens the surface; do not just add shadow.',
    ],
    terms: [
      { term: 'Elevation', gloss: '"looks like it is floating"', meaning: 'The visual signal that one surface sits above another in a UI\'s implied z-axis, most reliably communicated through contrast and a hairline rather than shadow alone.' },
      { term: 'Hairline', gloss: '"a really thin border"', meaning: 'A very thin border, typically 1px or 0.5px, used to separate two adjacent surfaces of similar brightness without relying on a shadow.' },
      { term: 'Contrast ratio', gloss: '"how readable the text is"', meaning: 'A number from 1:1 to 21:1 computed from two colors\' relative luminance, as defined by the WCAG specification, used to judge legibility and structural visibility.' },
      { term: 'WCAG AA', gloss: '"the accessibility standard"', meaning: 'The accessibility conformance level requiring at least 4.5:1 contrast for normal text and 3:1 for large text against its background.' },
      { term: 'Relative luminance', gloss: '"how bright a color really is"', meaning: 'A weighted, linearized combination of a color\'s red, green, and blue channel values (green weighted most heavily) used as the basis for the WCAG contrast ratio formula.' },
      { term: 'APCA', gloss: '"the newer, more accurate contrast math"', meaning: 'A perceptual contrast algorithm, distinct from WCAG 2\'s luminance-ratio formula, that accounts for text size and weight; expected to anchor a future WCAG 3 specification.' },
      { term: 'Two-layer shadow', gloss: '"a more realistic drop shadow"', meaning: 'An elevation shadow composed of a tight, low-blur shadow at the surface\'s edge plus a separate, diffuse, wide-blur ambient shadow, used by both Material Design 3 and Apple\'s elevation systems.' },
      { term: 'Surface tier', gloss: '"how many levels of card"', meaning: 'One step in a design system\'s ordered set of background lightness values, used to signal relative elevation between adjacent UI regions.' },
      { term: 'Lc (APCA unit)', gloss: '"apca\'s version of a contrast ratio"', meaning: 'The lightness-contrast unit APCA reports instead of a WCAG-style ratio, scaled roughly 0 to 106 and dependent on both color values and the text\'s size and weight.' },
      { term: 'Ambient shadow', gloss: '"the soft, spread-out shadow"', meaning: 'The wide-blur, low-opacity half of a two-layer shadow, meant to simulate diffuse environmental light rather than a single hard light source.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A body-text and background color pair measures 3.8:1 contrast. Does it pass WCAG 2.2 AA for normal text? For large text (18pt+ or 14pt bold+)?' },
      { level: 'medium', prompt: 'Design three surface tiers (app background, card, hover state) for a light-mode UI, specifying a relative lightness step for each and the hairline border color you would use between adjacent tiers, targeting roughly 1.5:1 to 2:1 border-to-surface contrast.' },
      { level: 'hard', prompt: 'Specify a two-layer shadow (blur radius, offset, and opacity for each layer) for a modal that needs to read as elevation tier 3 (the highest tier in a 3-tier system), and explain why a single-layer shadow at the same total darkness would look less physically plausible.' },
      { level: 'design', prompt: 'Take a screenshot of a dashboard (yours or a public one) that relies on stacked drop shadows for card elevation. Redesign the same hierarchy using contrast tiers and hairlines instead, and write the one-paragraph rationale for why the result reads as less "AI-generated."' },
    ],
    furtherReading: [
      { label: 'W3C, WCAG 2.2 contrast minimum', url: 'https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum', why: 'The normative source for the 4.5:1 and 3:1 text-contrast requirements referenced throughout this lesson.' },
      { label: 'APCA project', url: 'https://apcacontrast.com', why: 'The working perceptual contrast model expected to inform a future WCAG version, including its own contrast calculator.' },
      { label: 'Radix Colors, palette composition', url: 'https://www.radix-ui.com/colors/docs/palette-composition/scales', why: 'Documents the twelve-step surface and border scale referenced in the hairline-color guidance in this lesson.' },
      { label: 'Josh Comeau, "Designing beautiful shadows in CSS"', url: 'https://www.joshwcomeau.com/css/designing-shadows/', why: 'A detailed, code-forward walkthrough of building a two-layer shadow system rather than a single blurred box-shadow.' },
    ],
    shipIt: {
      kind: 'rubric',
      name: 'Elevation quality rubric',
      body: '1. Contrast first: does each surface tier have a measured, non-arbitrary lightness step from the tier below it?\n2. Hairline present: is there a visible 0.5-1px border between adjacent surfaces of similar brightness, rather than relying on shadow alone to separate them?\n3. Text contrast: does every text element on every surface meet 4.5:1 (or 3:1 for large text) against its actual background, not just against a nominal "white" background?\n4. Structural contrast: do borders, dividers, and disabled controls sit around 1.5:1 to 2:1, visible but not competing with content?\n5. Shadow restraint: is shadow reserved for genuinely floating surfaces (modals, dropdowns, popovers) rather than applied to every card in a list?\n6. Dark-mode correctness: does dark mode lighten surfaces at higher elevation tiers, rather than only adding more or darker shadow?',
    },
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
    readTime: '~10 min read',
    diagram: '/lessons/de/de-cv-icon-system.png',
    diagramCaption:
      'Phosphor Icons at Regular, Bold, and Fill weights on the same glyph; a shared 24 grid, one stroke width per row, three variants per icon.',
    whyItMatters:
      'Mixing Phosphor with Lucide with a stray Material icon looks worse than any one of them alone, even when each is well drawn, because the eye reads the inconsistency before it reads any individual glyph. Icons in one set share a stroke width and a corner-rounding style; break that and every glyph looks like a stranger at the table. This is why the shortest fix to "the UI feels off" is often "you have three icon libraries loaded," and it is why picking one set (or drawing custom icons on its exact rules) is a decision worth making once, deliberately.',
    learningObjectives: [
      'Explain why an icon\'s optical bounding box, not its literal drawing-grid box, determines whether a set of icons looks even.',
      'Compare stroke widths across Radix, Lucide, and Phosphor and match a stroke choice to a given type weight.',
      'Draw a custom in-house icon on the same grid, stroke, and terminal rules as a chosen icon library.',
      'Explain why a 24px stroked icon cannot simply be scaled down to 16px without a separate size-tuned variant.',
      'Audit a real product for mixed-icon-library inconsistency and identify the fix.',
    ],
    sections: [
      {
        heading: 'The grid does more than fit the artwork',
        body: 'A 24px grid with a 2px safe margin gives every glyph a 20x20 optical square to draw inside. Icons that visually read as the same "size" are actually drawn to different literal box sizes: a circle is drawn at 20x20, a horizontal rectangle closer to 22x16, a triangle around 22x18. Fitting the optical size, not the literal box size, is why a Phosphor set at 24px looks even across dozens of different glyph shapes, and a mixed set pulled from three different libraries does not, no matter how carefully each individual icon was drawn. Lucide, Phosphor, Radix Icons, and Feather all publish these sizing rules and enforce them on community contributions.',
      },
      {
        heading: 'Stroke width is the loudest single choice',
        body: 'At the same nominal size, a 1px stroke reads as delicate and precise (Radix, Vercel Geist), 1.5px reads as balanced (Lucide, Feather), and 2px reads as bold and app-native (Phosphor Bold, Ionicons filled). Matching the stroke to the product\'s typography weight keeps the whole UI feeling like one voice: pair Inter Regular body text with roughly 1.5px icons, Inter Medium with 1.75 to 2px. This single dial changes how "serious" or "friendly" a UI reads more than the actual glyph shapes do. Filled icons are a separate axis entirely, generally reserved for selected or active states rather than the default resting state of a control.',
      },
      {
        heading: 'Custom icons need to obey the same rules',
        body: 'The most common failure mode is an in-house icon for a domain-specific concept, drawn ad hoc by whoever needed it fastest, sitting next to library icons and looking alien. The fix is to draw the custom glyph on the same grid, the same stroke width, the same corner style, and the same terminal style (rounded, squared, or beveled stroke ends) as the library it lives next to. Phosphor and Lucide both ship Figma libraries with the drawing grid visible as a template layer specifically so a team can extend the set correctly. The working test: a stranger should not be able to tell which icons in the product are custom and which came from the library.',
      },
      {
        heading: 'Weight and size are separate dials',
        body: 'Do not scale a 24px stroked icon down to 16px and expect it to read cleanly. At 16px, a stroke drawn at the 24px weight becomes roughly 1px effective on a standard-density display and can disappear entirely on some rendering engines. The correct fix is to ship distinct icon variants per size class (commonly 16, 20, and 24px) with hand-tuned stroke widths and simplified internal geometry at the smaller sizes. SF Symbols, Material Symbols, and Radix Icons all publish size-tuned variants for exactly this reason. If a team cannot afford to maintain three full sets, the safer fallback is to ship everything at 24px and never go below 20px anywhere in product UI.',
      },
      {
        heading: 'Historical arc: how icon style has moved',
        body: 'Material Icons (Google, 2014) shipped as flat, filled, single-weight glyphs, matching the flat-design wave of the era. Feather Icons (2016) popularized a thin, monoline stroke aesthetic that a wave of startup products adopted through the late 2010s. Phosphor (2020) introduced a full multi-weight family, Thin through Bold plus a Fill variant, on the same underlying glyph geometry, letting one icon set cover the range Feather and Material each only partially addressed alone. Lucide (a 2022 community fork of Feather, after Feather\'s original maintenance slowed) kept the monoline aesthetic but modernized the tooling and expanded the glyph count substantially. By 2026, most new products default to a multi-weight system like Phosphor or Lucide specifically because a single static weight no longer covers both resting and active states cleanly.',
      },
      {
        heading: 'A side-by-side comparison across libraries',
        body: 'Phosphor: 24px grid, 1.75px stroke at Regular weight, six total weights (Thin, Light, Regular, Bold, Fill, Duotone), open-source under MIT. Lucide: 24px grid, 2px stroke, single weight family with community-contributed variants, MIT-licensed and actively maintained since its 2022 fork. Radix Icons: an unusually small and precise 15px grid, 1px stroke, single weight, designed to sit inside dense Radix UI components at their default text size. SF Symbols: variable grid sized per Apple\'s own size classes, weight axis matching the nine San Francisco font weights directly, proprietary to Apple platforms. Picking between these is less about which glyphs look nicer in isolation and more about which grid and stroke convention matches the product\'s own type scale and density.',
      },
      {
        heading: 'Picking a library for an AI-heavy product',
        body: 'Products built around streaming, generative, or agentic interfaces increasingly need icons that render correctly at sizes and in states a static icon set was not originally designed for, a "thinking" spinner state, a partially-filled progress glyph, or a variable-weight icon that visually syncs with a variable-weight font as text streams in. Multi-weight systems like Phosphor handle this more gracefully than single-weight sets, because an active or loading state can shift to Bold or Fill without introducing a visually unrelated glyph shape. This is a genuinely new constraint on icon-library choice that did not exist for most of the 2010s, when a UI\'s icon states were limited to hover and disabled.',
      },
    ],
    inlineImages: [
      {
        src: '/lessons/de/de-cv-icon-optical-grid.svg',
        alt: 'Optical bounding box versus literal grid box for different icon shapes',
        caption: 'A circle, a rectangle, and a triangle each drawn to a different literal box size within the same 24px grid, so all three read as the same optical size.',
        diagramBrief: 'Cream paper background, black ink, one accent color. Draw a 24x24 grid square with a dashed inner square at 20x20 labeled "safe area / optical box". Inside, overlay three icon shapes at reduced opacity showing their actual drawn dimensions: a circle drawn at 20x20 (fits exactly), a horizontal rounded rectangle drawn at 22x16 (wider, shorter), and a triangle drawn at 22x18. Label each with its literal dimensions and a shared caption: "different literal sizes, same optical size".',
      },
      {
        src: '/lessons/de/de-cv-icon-library-comparison.svg',
        alt: 'Stroke width and grid comparison across four icon libraries',
        caption: 'Radix (1px, 15 grid), Lucide (2px, 24 grid), Phosphor Regular (1.75px, 24 grid), and Phosphor Bold (2.25px, 24 grid) drawn at matching visual size for comparison.',
        diagramBrief: 'Cream paper background, black ink, one accent color. A 4-column comparison chart, each column showing the same simple glyph (a house or a checkmark icon) drawn with a different stroke weight and grid size, labeled below each: "Radix, 1px stroke, 15 grid", "Lucide, 2px stroke, 24 grid", "Phosphor Regular, 1.75px stroke, 24 grid", "Phosphor Bold, 2.25px stroke, 24 grid". Draw the four glyphs at a consistent overall visual size so the stroke-weight difference is the visible variable, not the icon\'s size.',
      },
    ],
    takeaways: [
      'One library at a time, or draw your own on the same rules.',
      'Stroke width is the loudest dial: match it to your type weight.',
      'Icons are drawn to optical size, not box size; the grid enforces this.',
      'Ship per-size variants above and below 20 px, or do not shrink.',
    ],
    terms: [
      { term: 'Icon grid', gloss: '"the icon\'s canvas size"', meaning: 'The pixel canvas an icon is drawn on, typically 24x24 with a 2px safe area, though some systems (Radix Icons) use a smaller, denser grid such as 15px.' },
      { term: 'Optical bounding box', gloss: '"where the icon actually sits"', meaning: 'The visible square inside the drawing grid where a glyph\'s artwork actually lives, distinct from the literal dimensions of any individual shape drawn to fill it evenly.' },
      { term: 'Stroke width', gloss: '"how thick the lines are"', meaning: 'The thickness, in pixels, of the lines used to draw an icon; the single most visually dominant choice in an icon system, more so than any individual glyph\'s shape.' },
      { term: 'Terminal', gloss: '"how the line ends"', meaning: 'The style of a stroke\'s endpoint, rounded, squared, or beveled, which needs to match consistently across every icon in a set to avoid a visually inconsistent family.' },
      { term: 'Filled icon', gloss: '"the solid version"', meaning: 'A solid, non-outlined variant of an icon, typically reserved for active, selected, or emphasized states rather than a control\'s default resting appearance.' },
      { term: 'Size-tuned variant', gloss: '"a different drawing for a smaller size"', meaning: 'A separately hand-drawn version of an icon optimized for a specific size class (such as 16px versus 24px), with adjusted stroke width and simplified internal detail.' },
      { term: 'Multi-weight family', gloss: '"an icon set with several thicknesses"', meaning: 'An icon system, such as Phosphor, that ships the same glyph set at several stroke weights (Thin through Bold, plus a Fill variant), letting a UI shift icon weight to signal state.' },
      { term: 'Monoline', gloss: '"one consistent line thickness"', meaning: 'An icon style where every stroke in every glyph uses exactly one consistent width, with no variation for emphasis within a single icon.' },
      { term: 'Glyph', gloss: '"one icon"', meaning: 'A single icon or symbol within a set; the term borrowed directly from typography, where it refers to one drawn character within a typeface.' },
      { term: 'Variable stroke', gloss: '"stroke that syncs with font weight"', meaning: 'An icon rendering approach where stroke width is interpolated live to match a variable font\'s current weight axis value, an emerging pattern for products with streaming or generative text.' },
    ],
    exercises: [
      { level: 'easy', prompt: 'A toolbar mixes a Lucide search icon (2px stroke, 24 grid) with a Radix settings icon (1px stroke, 15 grid). Identify the two mismatches that will make the toolbar read as inconsistent, beyond "they are different libraries."' },
      { level: 'medium', prompt: 'A product uses Inter Medium (a heavier weight) for its body text. Pick an appropriate icon stroke width from the 1px, 1.5px, and 2px options discussed in this lesson, and justify the choice against the type weight.' },
      { level: 'hard', prompt: 'Design the size-tuned variant spec for a single "notification bell" glyph at 16px, 20px, and 24px: describe what changes between the three (stroke width, internal detail, overall silhouette simplification) and why a naive scale-down of the 24px version would fail at 16px.' },
      { level: 'design', prompt: 'Audit a real product\'s toolbar or sidebar for mixed icon libraries (check stroke width and corner style across five or six icons using browser devtools or a screenshot at 2x). Report which icons do not belong, and write the one-paragraph migration plan: which library becomes the standard, and how existing custom icons get redrawn to match it.' },
    ],
    furtherReading: [
      { label: 'Phosphor Icons', url: 'https://phosphoricons.com', why: 'A shipping multi-weight icon system (Thin through Bold, plus Fill) on a shared 24px grid, the primary example used throughout this lesson.' },
      { label: 'Lucide', url: 'https://lucide.dev', why: 'The actively-maintained 2022 fork of Feather Icons, showing a monoline 2px-stroke system at scale with an open contribution model.' },
      { label: 'Radix Icons', url: 'https://www.radix-ui.com/icons', why: 'An unusually small and precise 15px optical grid, useful for seeing how a denser grid changes stroke and detail decisions.' },
      { label: 'Apple SF Symbols', url: 'https://developer.apple.com/sf-symbols/', why: 'The reference implementation of size-tuned and weight-matched icon variants, directly tied to a variable type system (San Francisco).' },
    ],
    shipIt: {
      kind: 'checklist',
      name: 'Icon system consistency audit',
      body: '- Every icon currently on screen comes from the same library (or is a custom glyph drawn to match its exact grid and stroke).\n- The stroke width in use is matched to the product\'s body-text type weight, not chosen independently.\n- Custom, in-house icons are drawn on the same grid size, stroke width, and terminal style (rounded/squared/beveled) as the library icons they sit next to.\n- Icons below 20px use a dedicated size-tuned variant, not a naive scale-down of the 24px artwork.\n- Filled/bold variants are reserved for active or selected states, not mixed in as a stylistic choice on resting-state controls.\n- If the product has streaming or generative UI states, the icon system supports a weight or fill transition for those states without introducing a visually unrelated glyph.',
    },
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
