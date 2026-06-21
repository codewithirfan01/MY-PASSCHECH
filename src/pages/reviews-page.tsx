import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageSquareQuote, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  computeReviewStats,
  deleteOwnReview,
  fetchReviews,
  submitReview,
  type Review,
} from "@/lib/reviews";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(0);
  const [usefulFeedback, setUsefulFeedback] = useState("");
  const [improvementFeedback, setImprovementFeedback] = useState("");
  const [discoverySource, setDiscoverySource] = useState("");

  const ownReview = user ? reviews.find((r) => r.user_id === user.id) ?? null : null;
  const stats = computeReviewStats(reviews);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch {
      toast.error("Could not load reviews. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (ownReview) {
      setDisplayName(ownReview.display_name);
      setRating(ownReview.rating);
      setUsefulFeedback(ownReview.useful_feedback);
      setImprovementFeedback(ownReview.improvement_feedback ?? "");
      setDiscoverySource(ownReview.discovery_source ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownReview?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!displayName.trim() || !usefulFeedback.trim()) {
      toast.error("Please fill in your name and what you found useful.");
      return;
    }

    setSubmitting(true);
    try {
      await submitReview(user.id, {
        display_name: displayName.trim(),
        rating,
        useful_feedback: usefulFeedback.trim(),
        improvement_feedback: improvementFeedback.trim(),
        discovery_source: discoverySource.trim(),
      });
      toast.success(ownReview ? "Review updated. Thank you!" : "Thanks for your review!");
      await loadReviews();
    } catch {
      toast.error("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteOwnReview(user.id);
      toast.success("Review removed");
      setDisplayName("");
      setRating(0);
      setUsefulFeedback("");
      setImprovementFeedback("");
      setDiscoverySource("");
      await loadReviews();
    } catch {
      toast.error("Could not remove your review.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header / aggregate rating */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/15">
            <MessageSquareQuote className="size-7 text-electric" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What <span className="text-gradient-electric">real users</span> say
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Genuine reviews from people who actually used PassCheck. No fake accounts, no
            filtering — every review here is real.
          </p>

          {!loading && stats.count > 0 && (
            <div className="mx-auto mt-6 flex w-fit items-center gap-4 rounded-2xl glass glass-border px-6 py-4">
              <div className="text-4xl font-bold tracking-tight">{stats.average.toFixed(1)}</div>
              <div className="flex flex-col items-start gap-1">
                <StarRating value={Math.round(stats.average)} readOnly size="sm" />
                <span className="text-xs text-muted-foreground">
                  from {stats.count} review{stats.count === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Submit / edit review form */}
          <div className="lg:col-span-2">
            <Card className="glass glass-border sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-electric" />
                  {ownReview ? "Edit your review" : "Leave a review"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
                    <p>Sign in to leave a review about your experience with PassCheck.</p>
                    <Button asChild size="sm">
                      <Link to="/login">Log in to review</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Your rating
                      </label>
                      <StarRating value={rating} onChange={setRating} size="lg" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Display name
                      </label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Ahmad K."
                        maxLength={40}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        What did you find useful?
                      </label>
                      <Textarea
                        value={usefulFeedback}
                        onChange={(e) => setUsefulFeedback(e.target.value)}
                        placeholder="What worked well for you?"
                        maxLength={500}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        What would you improve? (optional)
                      </label>
                      <Textarea
                        value={improvementFeedback}
                        onChange={(e) => setImprovementFeedback(e.target.value)}
                        placeholder="Anything that could be better?"
                        maxLength={500}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        How did you discover PassCheck? (optional)
                      </label>
                      <Input
                        value={discoverySource}
                        onChange={(e) => setDiscoverySource(e.target.value)}
                        placeholder="e.g. WhatsApp, Instagram, a friend"
                        maxLength={80}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {ownReview ? "Update review" : "Submit review"}
                      </Button>
                      {ownReview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleDelete}
                          disabled={deleting}
                          aria-label="Delete review"
                        >
                          {deleting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review wall */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" />
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <Card className="glass glass-border">
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                  <MessageSquareQuote className="size-8" />
                  <p>No reviews yet. Be the first to share your experience.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="glass glass-border animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-electric">
                            {initials(review.display_name) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>
                        <StarRating value={review.rating} readOnly size="sm" />
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                        {review.useful_feedback}
                      </p>

                      {review.improvement_feedback && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/70">Suggested improvement: </span>
                          {review.improvement_feedback}
                        </p>
                      )}

                      {review.discovery_source && (
                        <Badge variant="outline" className="mt-3">
                          Found via {review.discovery_source}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
