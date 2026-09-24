export type { AccountControl, AccountDeletionStatus, ManagedPlan } from "@tableus/domain";

export type AccountExportSummary = {
  valid: boolean;
  reviewCount: number;
  connectionCount: number;
  membershipCount: number;
  voteCount: number;
  authoredEventCount: number;
};

export function summarizeAccountExport(value: unknown): AccountExportSummary {
  const empty = {
    valid: false,
    reviewCount: 0,
    connectionCount: 0,
    membershipCount: 0,
    voteCount: 0,
    authoredEventCount: 0,
  };
  if (!value || typeof value !== "object") return empty;
  const exportValue = value as Record<string, unknown>;
  const profile = exportValue.profile;
  const collections = [
    exportValue.reviews,
    exportValue.connections,
    exportValue.plan_memberships,
    exportValue.votes,
    exportValue.authored_plan_events,
    exportValue.invite_redemptions,
  ];
  if (
    exportValue.schema_version !== "1"
    || !profile
    || typeof profile !== "object"
    || !collections.every(Array.isArray)
  ) {
    return empty;
  }
  return {
    valid: true,
    reviewCount: (exportValue.reviews as unknown[]).length,
    connectionCount: (exportValue.connections as unknown[]).length,
    membershipCount: (exportValue.plan_memberships as unknown[]).length,
    voteCount: (exportValue.votes as unknown[]).length,
    authoredEventCount: (exportValue.authored_plan_events as unknown[]).length,
  };
}
