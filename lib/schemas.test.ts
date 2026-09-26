import { describe, expect, it } from "vitest";
import { bullThesisSchema, claimSchema, contradictionSchema, judgeOutputSchema, plannerOutputSchema, researchReportSchema, scoutOutputSchema, scoreEvidence } from "./schemas";
import { demoProvider, getResearchProvider, NEBIUS_MODELS } from "./providers";

describe("ProofScout evidence contracts", () => {
  it("accepts deterministic demo output", async () => {
    const report = await demoProvider().run("Research BNKR. Is the current bullish narrative supported by evidence?");
    expect(researchReportSchema.parse(report).claims).toHaveLength(4);
  });
  it("rejects invalid claim statuses", () => {
    expect(() => claimSchema.parse({ id: "c", text: "x", status: "maybe", confidence: .5, supportingSourceIds: [], contradictingSourceIds: [], rationale: "x" })).toThrow();
  });
  it("retains source lineage on every claim", async () => {
    const report = await demoProvider().run("test question");
    for (const claim of report.claims) expect(claim.supportingSourceIds.length + claim.contradictingSourceIds.length).toBeGreaterThan(0);
  });
  it("validates every typed workflow artifact", async () => {
    const report = await demoProvider().run("test question");
    expect(plannerOutputSchema.parse(report.planner).stages).toContain("judge");
    expect(scoutOutputSchema.parse(report.scout).sources).toHaveLength(4);
    expect(bullThesisSchema.parse(report.bull).position).toBe("BULL");
    expect(contradictionSchema.parse(report.contradictions[0]).severity).toBe("material");
    expect(judgeOutputSchema.parse(report.judge).verdict).toBe("MIXED");
  });
  it("uses transparent evidence scoring and exposes traceability", async () => {
    const report = await demoProvider().run("test question");
    expect(report.claims.find(claim => claim.id === "c1")?.evidenceScore).toBeGreaterThan(.5);
    expect(report.judge.supportingClaimIds).toContain("c1");
    expect(report.judge.unresolvedClaimIds).toContain("c3");
    expect(report.comparison.simulated).toBe(true);
    expect(scoreEvidence(report.sources, report.claims[2])).toBeLessThan(scoreEvidence(report.sources, report.claims[0]));
  });
  it("keeps the expected sponsor model routing", () => {
    expect(NEBIUS_MODELS.nano).toBe("nvidia/nvidia-nemotron-3-nano-30b-a3b");
    expect(NEBIUS_MODELS.super).toBe("nvidia/nemotron-3-super-120b-a12b");
    expect(NEBIUS_MODELS.ultra).toBe("nvidia/Nemotron-3-Ultra-550b-a55b");
  });
  it("labels missing live credentials as fallback without exposing secrets", async () => {
    const originalMode = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    delete process.env.NEBIUS_API_KEY;
    const report = await getResearchProvider().run("test question");
    expect(report.mode).toBe("fallback");
    expect(report.verdictSummary).toContain("Live provider unavailable");
    if (originalMode === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
    else process.env.NEXT_PUBLIC_DEMO_MODE = originalMode;
  });
});
