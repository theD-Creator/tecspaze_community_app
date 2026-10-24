import React from 'react'
import { StaticRatingStars } from './RatingStars'

interface RatingBadgeProps {
  value: number
  maxValue?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  value,
  maxValue = 5,
  size = 'md',
  showValue = true,
}) => {
  return (
    <div className="rating-badge">
      <StaticRatingStars value={value} maxValue={maxValue} size={size} />
      {showValue && (
        <span className="rating-badge__value">
          {value.toFixed(1)} / {maxValue}
        </span>
      )}
    </div>
  )
}

export default RatingBadge
