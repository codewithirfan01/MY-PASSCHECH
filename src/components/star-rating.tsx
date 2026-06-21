import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
};

export function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className={cn("flex items-center gap-1", readOnly ? "" : "cursor-pointer")}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          className={cn(
            "transition-transform",
            !readOnly && "hover:scale-110 focus-visible:outline-none"
          )}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              sizeMap[size],
              star <= display
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
