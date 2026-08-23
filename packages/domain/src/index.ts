export type PlanStatus = "collecting" | "voting" | "finalized";

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
