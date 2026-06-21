import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareQuote } from "lucide-react";

import { computeReviewStats, fetchReviews } from "@/lib/reviews";
import { StarRating } from "@/components/star-rating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReviewsTeaser() {
  const [stats, setStats] = useState<{ count: number; average: number } | null>(null);

  useEffect(() => {
    fetchReviews()
      .then((reviews) => setStats(computeReviewStats(reviews)))
      .catch(() => setStats(null));
  }, []);

  if (!stats || stats.count === 0) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="glass glass-border overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <MessageSquareQuote className="size-6 text-electric" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <span className="text-2xl font-bold">{stats.average.toFixed(1)}</span>
                <StarRating value={Math.round(stats.average)} readOnly size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">
                Rated by {stats.count} real user{stats.count === 1 ? "" : "s"} — no fake reviews
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/reviews">
              Read reviews
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
