import { z } from "zod";

export const sourceTypeSchema = z.enum(["primary", "secondary", "community"]);
export const claimStatusSchema = z.enum(["verified", "contradicted", "unverified"]);
export const agentStageSchema = z.enum(["PLANNING", "SEARCHING", "VERIFYING", "CHALLENGING", "CONTRADICTION FOUND", "RECHECKING", "VERDICT READY"]);
export const verdictSchema = z.enum(["SUPPORTED", "MIXED", "NOT SUPPORTED"]);
export const reportModeSchema = z.enum(["demo", "live", "fallback"]);
export const sourceSchema = z.object({ id: z.string().min(1), title: z.string().min(1), publisher: z.string().min(1), url: z.string().url(), type: sourceTypeSchema, publishedAt: z.string().optional(), retrievedAt: z.string().min(1), excerpt: z.string().min(1), reliability: z.number().min(0).max(1), evidenceScore: z.number().min(0).max(1) });
export const plannerOutputSchema = z.object({ traceId: z.string().min(1), question: z.string().min(1), subquestions: z.array(z.string().min(1)).min(1), stages: z.array(z.string().min(1)).min(1) });
export const scoutOutputSchema = z.object({ traceId: z.string().min(1), query: z.string().min(1), sources: z.array(sourceSchema).min(1) });
export const claimSchema = z.object({ id: z.string().min(1), text: z.string().min(1), status: claimStatusSchema, confidence: z.number().min(0).max(1), evidenceScore: z.number().min(0).max(1), supportingSourceIds: z.array(z.string()), contradictingSourceIds: z.array(z.string()), rationale: z.string().min(1) });
export const bullThesisSchema = z.object({ position: z.literal("BULL"), summary: z.string().min(1), claims: z.array(z.string()).min(1), confidence: z.number().min(0).max(1) });
export const bearThesisSchema = z.object({ position: z.literal("BEAR"), summary: z.string().min(1), claims: z.array(z.string()).min(1), confidence: z.number().min(0).max(1) });
export const contradictionSchema = z.object({ id: z.string().min(1), claimId: z.string().min(1), description: z.string().min(1), severity: z.enum(["material", "minor"]), sourceIds: z.array(z.string()).min(1) });
export const judgeOutputSchema = z.object({ verdict: verdictSchema, summary: z.string().min(1), confidence: z.number().min(0).max(1), claimIds: z.array(z.string()), contradictionIds: z.array(z.string()), supportingClaimIds: z.array(z.string()), contradictingClaimIds: z.array(z.string()), unresolvedClaimIds: z.array(z.string()), sourceIds: z.array(z.string()), conditions: z.array(z.string()) });
export const comparisonSchema = z.object({ simulated: z.boolean(), standard: z.object({ verdict: z.string(), claims: z.number(), primarySources: z.number(), contradictions: z.number(), unresolved: z.number(), lineage: z.boolean(), adjudicated: z.boolean() }), proofScout: z.object({ verdict: verdictSchema, claims: z.number(), primarySources: z.number(), contradictions: z.number(), unresolved: z.number(), lineage: z.boolean(), adjudicated: z.boolean() }) });
export const researchReportSchema = z.object({ runId: z.string(), query: z.string(), mode: reportModeSchema, createdAt: z.string(), verdict: verdictSchema, verdictSummary: z.string(), confidence: z.number().min(0).max(1), planner: plannerOutputSchema, scout: scoutOutputSchema, bull: bullThesisSchema, bear: bearThesisSchema, claims: z.array(claimSchema), sources: z.array(sourceSchema), contradictions: z.array(contradictionSchema), majorContradictions: z.array(z.string()), whatWouldChangeConclusion: z.array(z.string()), judge: judgeOutputSchema, comparison: comparisonSchema, trace: z.array(z.object({ stage: agentStageSchema, detail: z.string(), at: z.string() })) });
export type SourceRecord = z.infer<typeof sourceSchema>;
export type PlannerOutput = z.infer<typeof plannerOutputSchema>;
export type ScoutOutput = z.infer<typeof scoutOutputSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type BullThesis = z.infer<typeof bullThesisSchema>;
export type BearThesis = z.infer<typeof bearThesisSchema>;
export type Contradiction = z.infer<typeof contradictionSchema>;
export type JudgeOutput = z.infer<typeof judgeOutputSchema>;
export type ResearchReport = z.infer<typeof researchReportSchema>;

export function scoreEvidence(sourceRecords: SourceRecord[], claim: Pick<Claim, "supportingSourceIds" | "contradictingSourceIds" | "status">) {
  const sourceTier = (type: SourceRecord["type"]) => type === "primary" ? 1 : type === "secondary" ? 0.65 : 0.35;
  const supporting = sourceRecords.filter(source => claim.supportingSourceIds.includes(source.id));
  const contradicting = sourceRecords.filter(source => claim.contradictingSourceIds.includes(source.id));
  const independentSupport = Math.min(1, new Set(supporting.map(source => source.publisher)).size / 3);
  const tier = supporting.length ? supporting.reduce((sum, source) => sum + sourceTier(source.type), 0) / supporting.length : 0;
  const contradictionPenalty = contradicting.length ? 0.25 : 0;
  const unresolvedPenalty = claim.status === "unverified" ? 0.25 : 0;
  const recency = supporting.some(source => source.publishedAt) ? 1 : 0.8;
  return Math.max(0, Math.min(1, 0.35 * tier + 0.3 * independentSupport + 0.2 * recency + 0.15 - contradictionPenalty - unresolvedPenalty));
}
