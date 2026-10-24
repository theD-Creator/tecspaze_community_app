import React from 'react'
import { clsx } from 'clsx'

// Star icon as a simple SVG
const StarIcon: React.FC<{ filled: boolean; partial?: number }> = ({ filled, partial }) => {
  if (partial !== undefined) {
    return (
      <svg className="rating-star rating-star--partial" viewBox="0 0 20 20" fill="currentColor">
        <defs>
          <clipPath id={`clip-${partial}`}>
            <rect x="0" y="0" width={partial * 20} height="20" />
          </clipPath>
        </defs>
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          clipPath={`url(#clip-${partial})`}
        />
      </svg>
    )
  }

  return (
    <svg className={clsx('rating-star', { 'rating-star--filled': filled })} viewBox="0 0 20 20">
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={filled ? 0 : 2}
      />
    </svg>
  )
}

interface RatingStarsProps {
  value: number
  maxValue?: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  onChange?: (value: number) => void
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  maxValue = 5,
  maxStars = 5,
  size = 'md',
  editable = false,
  onChange,
}) => {
  const sizeClasses = {
    sm: 'rating-stars--sm',
    md: 'rating-stars--md',
    lg: 'rating-stars--lg',
  }

  const handleClick = (index: number) => {
    if (!editable || !onChange) return
    onChange(index + 1)
  }

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(value)
    const hasPartial = value % 1 !== 0
    const partialValue = value % 1

    for (let i = 0; i < maxStars; i++) {
      const filled = i < fullStars
      const partial = i === fullStars && hasPartial ? partialValue : undefined
      const ariaLabel = `Bewertung: ${i + 1} von ${maxValue}`

      if (!editable) {
        // Static display: plain spans (never nest buttons)
        stars.push(
          <span key={i} className="rating-star-wrapper" role="presentation">
            <StarIcon filled={filled} partial={partial} />
          </span>
        )
      } else {
        stars.push(
          <button
            key={i}
            type="button"
            className="rating-star-wrapper"
            onClick={() => handleClick(i)}
            aria-label={ariaLabel}
          >
            <StarIcon filled={filled} partial={partial} />
          </button>
        )
      }
    }

    return stars
  }

  return <div className={clsx('rating-stars', sizeClasses[size])}>{renderStars()}</div>
}

// Static rating display (non-editable)
export const StaticRatingStars: React.FC<Omit<RatingStarsProps, 'editable' | 'onChange'>> = ({
  value,
  maxValue = 5,
  maxStars = 5,
  size = 'md',
}) => (
  <RatingStars
    value={value}
    maxValue={maxValue}
    maxStars={maxStars}
    size={size}
    editable={false}
  />
)

export default RatingStars
