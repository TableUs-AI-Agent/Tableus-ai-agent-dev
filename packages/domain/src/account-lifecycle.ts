import { PUBLIC_CONTACTS } from "./public-info.ts";

export type AccountDeletionStatus = {
  status: "pending" | "completed";
  requested_at: string;
  completed_at: string | null;
  next_retry_at: string | null;
  last_error_code: string | null;
  needs_attention: boolean;
};

/** Public deletion guidance shared by web and mobile; these are descriptions, not a status lookup. */
export const ACCOUNT_DELETION_HELP = {
  request: `To request account deletion without signing in or reinstalling TableUs, email ${PUBLIC_CONTACTS.privacyEmail}. Tell us that you want your TableUs account deleted. Do not include a password, verification code, invite code, or private plan link.`,
  acknowledgment: "We aim to acknowledge your email within two business days. After we verify account ownership and assess any organized-plan blockers, we can give you a completion estimate. An email acknowledgment does not mean deletion is complete.",
  inApp: "When full deletion is available, you can sign in, open Account and data, and choose Delete my account. Transfer each shared plan to another participant first, or remove a plan if you are its only participant. You can export your application data before requesting deletion.",
  shared: "Your profile, reviews, and plan constraints are removed. Shared plans remain available to their other participants; plan titles and locations you authored are replaced with neutral placeholders. Recommendations and votes that depended on your input are removed. Other participants may need to repair plan details, generate new options, and vote again.",
  pending: `Once a full deletion request is accepted, application data is removed before sign-in account deletion finishes. A pending request is not complete. If sign-in removal needs attention or you can no longer check status with the same session, contact ${PUBLIC_CONTACTS.privacyEmail}.`,
  accessLoss: "If you lose access to your sign-in email, contact us for help. We may be unable to complete deletion until you can securely recover access. An email request alone does not verify ownership or complete deletion.",
  limits: "Pseudonymous invitation, usage, and recovery records remain for abuse prevention and stale-session safeguards. These records are not anonymous and do not currently have an automatic purge schedule. Logs, backups, and provider records have separate retention settings; completed account deletion does not establish their erasure. Contact us for the handling that applies to your request.",
} as const;

export type AccountControl = {
  can_delete: boolean;
  blockers: "organized_plans"[];
  organized_plan_count: number;
  deletion_scope: "application_profile";
  supabase_auth_removal: "operator_required";
  full_deletion_available?: boolean;
};

export type ManagedPlan = {
  id: string;
  title: string;
  organizer_id: string;
  viewer_is_organizer: boolean;
  updated_at: string;
  participants: Array<{
    profile_id: string;
    display_name: string;
    is_organizer: boolean;
  }>;
};
