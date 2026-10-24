import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { StaticRatingStars } from '../ui/RatingStars'
import { Employee } from '../../types'

// Star icon
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 17.27L18.18 21l-1.64-7.01L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

// Rate icon
const RateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

interface EmployeeCardProps {
  employee: Employee
  onRate?: (employee: Employee) => void
  onClick?: () => void
  showRating?: boolean
  compact?: boolean
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onRate,
  onClick,
  showRating = true,
  compact = false,
}) => {
  const { t } = useTranslation()

  return (
    <Card
      variant={compact ? 'compact' : 'default'}
      className="employee-card"
      onClick={onClick}
    >
      <Card.Body>
        <div className="employee-card__content">
          <Avatar
            src={employee.photo}
            alt={employee.name}
            size={compact ? 'md' : 'lg'}
            className="employee-card__avatar"
          />
          <div className="employee-card__info">
            <div className="employee-card__name">{employee.name}</div>
            {compact && (
              <div className="employee-card__category text-sm text-secondary">
                {employee.category}
              </div>
            )}
          </div>
          {showRating && (
            <div className="employee-card__rating">
              <StaticRatingStars value={employee.averageRating} size="sm" />
              <span className="employee-card__rating-value">
                {employee.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        {!compact && (
          <div className="employee-card__footer">
            <div className="employee-card__stats">
              <div className="employee-card__stat">
                <StarIcon /> {employee.ratingCount}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RateIcon />}
              onClick={(e) => {
                e.stopPropagation()
                onRate?.(employee)
              }}
            >
              {t('employees.rate')}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default EmployeeCard
