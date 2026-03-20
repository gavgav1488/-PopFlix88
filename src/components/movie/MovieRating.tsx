"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MovieRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const MAX_RATING = 10;
const STAR_VALUES = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

export function MovieRating({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = "md",
}: MovieRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSize = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  const handleClick = (value: number) => {
    if (!readonly) onRatingChange?.(value);
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const getStarColor = (starValue: number) => {
    const current = hoverRating || rating;
    return starValue <= current
      ? "text-yellow-400 fill-current"
      : "text-muted-foreground";
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {STAR_VALUES.map((starValue) => (
          <Button
            key={starValue}
            variant="ghost"
            size="sm"
            className={`p-0 h-auto ${readonly ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Star
              className={`${starSize} ${getStarColor(starValue)} transition-colors`}
            />
          </Button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm font-medium ml-2">{rating}/10</span>
      )}
    </div>
  );
}
