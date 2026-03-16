import type { AdaptationApiResult, AdaptationStatus, AdaptationType, Plan } from '../../types/index.ts';
import type { PlanDiffResult } from './planDiff.ts';

export interface AdaptationAuditInput {
  dogId: string;
  plan: Plan;
  triggeredBySessionLogId?: string | null;
  adaptationType: AdaptationType;
  status: AdaptationStatus;
  reasonCode: string;
  reasonSummary: string;
  evidence: Record<string, unknown>;
  diff: PlanDiffResult;
  latencyMs: number;
  modelName?: string | null;
  wasUserVisible?: boolean;
}

export interface AdaptationAuditRecord {
  dog_id: string;
  plan_id: string;
  triggered_by_session_log_id: string | null;
  adaptation_type: AdaptationType;
  status: AdaptationStatus;
  reason_code: string;
  reason_summary: string;
  evidence: Record<string, unknown>;
  previous_snapshot: Record<string, unknown>;
  new_snapshot: Record<string, unknown>;
  changed_session_ids: string[];
  changed_fields: string[];
  model_name: string | null;
  latency_ms: number;
  was_user_visible: boolean;
}

export function buildAdaptationAuditRecord(input: AdaptationAuditInput): AdaptationAuditRecord {
  return {
    dog_id: input.dogId,
    plan_id: input.plan.id,
    triggered_by_session_log_id: input.triggeredBySessionLogId ?? null,
    adaptation_type: input.adaptationType,
    status: input.status,
    reason_code: input.reasonCode,
    reason_summary: input.reasonSummary,
    evidence: input.evidence,
    previous_snapshot: input.diff.previousSnapshot,
    new_snapshot: input.diff.newSnapshot,
    changed_session_ids: input.diff.changedSessionIds,
    changed_fields: input.diff.changedFields,
    model_name: input.modelName ?? null,
    latency_ms: input.latencyMs,
    was_user_visible: input.wasUserVisible ?? true,
  };
}

export function toAdaptationApiResult(
  audit: AdaptationAuditRecord,
  adaptationId: string | null,
): AdaptationApiResult {
  return {
    applied: audit.status === 'applied',
    skipped: audit.status === 'skipped',
    adaptationId,
    adaptationType: audit.adaptation_type,
    reasonCode: audit.reason_code,
    reasonSummary: audit.reason_summary,
    changedSessionIds: audit.changed_session_ids,
    changedFields: audit.changed_fields,
  };
}
