import { supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  useful_feedback: string;
  improvement_feedback: string | null;
  discovery_source: string | null;
  created_at: string;
}

export interface SubmitReviewInput {
  display_name: string;
  rating: number;
  useful_feedback: string;
  improvement_feedback?: string;
  discovery_source?: string;
}

export interface ReviewStats {
  count: number;
  average: number;
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Review[];
}

export function computeReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { count: reviews.length, average: total / reviews.length };
}

export async function fetchOwnReview(userId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Review | null) ?? null;
}

export async function submitReview(
  userId: string,
  input: SubmitReviewInput
): Promise<void> {
  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: userId,
      display_name: input.display_name,
      rating: input.rating,
      useful_feedback: input.useful_feedback,
      improvement_feedback: input.improvement_feedback || null,
      discovery_source: input.discovery_source || null,
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

export async function deleteOwnReview(userId: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("user_id", userId);
  if (error) throw error;
}
