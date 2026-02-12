'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MovieRatingProps {
  rating?: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function MovieRating({ 
  rating = 0, 
  onRatingChange, 
  readonly = false,
  size = 'md' 
}: MovieRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  
  const maxRating = 10
  const starSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size]

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const getStarColor = (index: number) => {
    const currentRating = hoverRating || rating
    if (index <= currentRating) {
      return 'text-yellow-400 fill-current'
    }
    return 'text-muted-foreground'
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`p-0 h-auto ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              <Star className={`${starSize} ${getStarColor(starValue)} transition-colors`} />
            </Button>
          )
        })}
      </div>
      
      {rating > 0 && (
        <span className="text-sm font-medium ml-2">
          {rating}/10
        </span>
      )}
    </div>
  )
}