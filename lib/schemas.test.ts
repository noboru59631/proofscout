import { describe, expect, it } from "vitest";
import { bullThesisSchema, claimSchema, contradictionSchema, judgeOutputSchema, plannerOutputSchema, researchReportSchema, scoutOutputSchema } from "./schemas";
import { demoProvider } from "./providers";

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
});
