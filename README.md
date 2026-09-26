# ProofScout

**Adversarial research with evidence before conviction.** ProofScout turns a question into a typed research graph: Planner → Scout → Verifier → Bull/Bear → Contradiction review → Evidence Judge.

> Nebius is the execution fabric. Nemotron is the reasoning engine.

## Local setup

Requirements: Node.js 22+ and npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Demo mode is the default, needs no credentials, and uses deterministic evidence records so the entire workflow can be reviewed offline.

Validation:

```bash
npm test
npm run typecheck
npm run build
```

## Modes and architecture

- **Demo mode:** deterministic mock provider; shows the complete planner/scout/verifier/bull/bear/contradiction/judge flow, claim-level lineage, source quality, trace IDs, and a clearly labelled simulated single-pass comparison.
- **Live mode:** set `NEXT_PUBLIC_DEMO_MODE=false` and provide `NEBIUS_API_KEY`. The native `fetch` adapter calls Nebius Token Factory’s OpenAI-compatible API and validates JSON with Zod after every stage.
- **Optional retrieval:** `TAVILY_API_KEY` enables Tavily search for live Scout candidates. Without it, the live Scout model must return its own normalized source records.
- **Safety boundary:** no trading execution, wallet custody, swaps, or blockchain writes are implemented.

The schemas in `lib/schemas.ts` define `PlannerOutput`, `ScoutOutput`, `SourceRecord`, `Claim`, `BullThesis`, `BearThesis`, `Contradiction`, `JudgeOutput`, and `FinalReport` (the validated `ResearchReport`). No stage passes unchecked free-form text to the next stage.

## Official Nebius model IDs

These exact IDs are from the official [Nebius Token Factory Nemotron catalog](https://github.com/nebius/token-factory-cookbook/tree/main/models/nemotron):

| Role | Model ID | Use |
| --- | --- | --- |
| Fast extraction / verification | `nvidia/nvidia-nemotron-3-nano-30b-a3b` | low-latency structured artifacts |
| Planner / Bull / Bear / contradictions | `nvidia/nemotron-3-super-120b-a12b` | multi-agent reasoning |
| Final judge | `nvidia/Nemotron-3-Ultra-550b-a55b` | hardest evidence reconciliation |

The case and spelling are intentional: Token Factory model IDs are case-sensitive. The previous Lightning assumption is not used as a Nemotron Nano alias; the official Nano endpoint above is selected instead. Availability can vary by account, so confirm the model list for the specific API key before live use.

## CI and limitations

`.github/workflows/ci.yml` runs `npm ci`, tests, TypeScript validation, and the Next.js production build on pushes to `main` and pull requests. Demo URLs are illustrative and do not constitute real evidence. Live output quality depends on retrieved sources and model responses; confidence and contradictions remain visible rather than being presented as certainty.

Live mode requires only `NEBIUS_API_KEY`; `TAVILY_API_KEY` is optional and improves retrieval. No secrets belong in `.env.example` or source control.

## License

MIT. See `LICENSE`.
