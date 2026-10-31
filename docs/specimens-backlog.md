# Specimens backlog

Lessons where an interactive specimen would be fake, so they need a different graphic instead. They keep the old text demo until then. The other 187 lessons have specimens (see `interactive-specimens.md`).

## Needs a different graphic (8)

| Lesson | Title | Why a specimen would be fake | Suggested graphic |
|---|---|---|---|
| `de-au-agentic-libraries` | Assistant UI and Vercel AI Elements are the agentic-UI component libraries to know | A library comparison and a budget argument. A specimen would be a feature checklist dressed up as UI. | Anatomy of an agent chat surface (Thread, Message, Composer, ToolCallDisplay), each part shaded "library gives you" vs "you extend". Below it, two stacked bars for a month of work: hand-rolled plumbing vs time spent on the seams. |
| `p11-17-framework-tradeoffs` | Agent framework tradeoffs: graph, role, chat, or box | Any control would just map to a framework name. It's a lookup table, nothing behaves. | A 2x2: durable state needed (low to high) on x, who decides the branch (emergent to explicit) on y. Plot AutoGen/Agno, CrewAI, LangGraph and the OpenAI Agents SDK, with one accent arrow tracing "brainstorm, then long-running workflow with approvals". |
| `p12-07-vlm-recipes` | Open-weight VLM recipes | The lesson is a variance breakdown. An ablation UI would only show invented runs. | A stacked bar (token count 60%, encoder 20%, connector 5%, rest 15%) with the connector in accent, beside the MM1 numbers (+3 MMMU from the encoder vs under 1 from the connector). |
| `p12-10-internvl3` | InternVL3 | Alignment debt only shows in training curves. A chat demo would be scripted answers. | Two training timelines, bolt-on vs native multimodal from step one. GSM8K text accuracy dips 5 to 10 points on the bolt-on side and stays flat on the native one. |
| `p12-15-janus-pro` | Janus-Pro | The idea is a routing topology, with nothing to operate. | Animated two-door diagram. Understanding: SigLIP, MLP, shared body, text. Generation: text, shared body, VQ ids, decoder. Note GenEval 0.80 vs DALL-E 3 at 0.67. |
| `p12-16-mio` | MIO | Splitting the vocabulary into ID ranges is a diagram. The latency side is already covered by the 12.20 Talker specimen. | A vocabulary ruler with four coloured ranges (text 0-31,999, image from 32,000, speech from 36,096, music from 40,192), a mixed token stream dropping into them, and the itemised ~300ms budget alongside. |
| `p15-19-anthropic-rsp` | Reading RSP v3.0 | A reading and classification skill. Any specimen would toggle text labels. | Two-column ledger (binding on Anthropic vs industry recommendation), with the SL-4 line moving across, the pause clause struck through, and SaferAI 2.2 to 1.9. |
| `p15-20-preparedness-fsf` | Tracked or Research | Compares three policy documents, with no UI to operate. | Three-lane swimlane routing "long-range autonomy" through OpenAI PF v2 (Research tier, not gated), DeepMind FSF v3 (folded into ML R&D and Cyber) and RSP v3.0 (AI R&D-4 affirmative case), ending at "your layer owns the gate". |

## Found along the way

- **Unreachable lessons.** `p15-09-coding-agent-landscape` and `p15-15-propose-then-commit` are not in the library tree (`src/lib/library.ts`), so `?l=` can't open them and no folder lists them. Their specimens are built and registered but can't be seen until they're placed in a folder. This predates this work.
- **Content bug in `de-cv-clamp`.** The worked example gives the intercept as `0.714rem`. It should be `0.857rem` (16 - 320 x 0.00714 = 13.71px). The specimen uses the correct value; the lesson body still has the wrong one.
- **Specimens that deviate from their lesson's numbers.** In these lessons the stated numbers contradicted each other, so the specimens use self-consistent values instead:
  - 15.13: per-tool cap set to 100 calls/hour.
  - 15.14: hard limit set to 40.
  - 15.21: the 90% crossing lands at 3.3h.
  - 15.18: uses S13 Elections. The lesson said S12, which is a different category.
  - 16.14: the old caption claimed the geometric median beats 3 of 5 correlated voters, which is false. The specimen shows it holding at 2 and breaking at 3.

  Each lesson's body text should be brought in line.
- **Modelled, not measured.** These specimens say on the stage that their numbers are modelled rather than computed from a simulation: 12.20, 16.07, 16.18, 16.20, 16.24.
- **Possible duplicate.** `de-pr-paco-coursey` uses the same modal-vs-drawer setup as `de-ci-overlay-choice`. Consider swapping it for another Paco technique (cmdk, Sonner).
- **Sub-cards not covered.** The ~250 mental-model, pattern, anti-pattern and invisible-problem cards (`src/lib/demo-configs.ts`) still use the text archetypes. This pass covered lessons only.
