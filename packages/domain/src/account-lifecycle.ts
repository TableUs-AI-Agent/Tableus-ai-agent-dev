export type AccountDeletionStatus = {
  status: "pending" | "completed";
  requested_at: string;
  completed_at: string | null;
  next_retry_at: string | null;
  last_error_code: string | null;
  needs_attention: boolean;
};

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
