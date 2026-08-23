export type PlanStatus = "collecting" | "voting" | "finalized";
export type AuthLinkMode = "join" | "sign-in";

export type Place = {
  place_id: string;
  name: string;
  cuisine: string;
  address: string;
  rating: number;
  price_level: number;
  latitude: number;
  longitude: number;
  data_provider: "fixture" | "google_maps";
};

export type Candidate = {
  id: string;
  place: Place;
  match_score: number;
  reasoning: string;
  rank: number;
  vote_score: number;
};

export type Participant = {
  profile_id: string;
  display_name: string;
  constraints: Record<string, unknown>;
  is_organizer: boolean;
};

export type Plan = {
  id: string;
  title: string;
  organizer_id: string;
  viewer_is_organizer: boolean;
  status: PlanStatus;
  location_label: string;
  latitude: number;
  longitude: number;
  participants: Participant[];
  candidates: Candidate[];
  my_vote: string[] | null;
  finalized_candidate_id: string | null;
  created_at: string;
  updated_at: string;
};

export function bordaScores(rankings: string[][]): Record<string, number> {
  const scores: Record<string, number> = {};
  const points = [3, 2, 1];
  for (const ranking of rankings) {
    ranking.slice(0, 3).forEach((id, index) => {
      scores[id] = (scores[id] ?? 0) + points[index];
    });
  }
  return scores;
}

export function normalizeHttpsOrigin(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Link origin must be a valid HTTPS origin");
  }
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    throw new Error("Link origin must be HTTPS with no credentials, port, path, query, or fragment");
  }
  return parsed.origin;
}

export function buildJoinUrl(origin: string, planId: string, shareToken: string): string {
  if (!planId.trim() || !shareToken.trim()) throw new Error("Plan ID and share token are required");
  const url = new URL(`/join/${encodeURIComponent(planId.trim())}`, normalizeHttpsOrigin(origin));
  url.searchParams.set("token", shareToken.trim());
  return url.toString();
}

export function buildAuthUrl(origin: string, mode: AuthLinkMode): string {
  const url = new URL("/auth", normalizeHttpsOrigin(origin));
  url.searchParams.set("mode", mode);
  return url.toString();
}
