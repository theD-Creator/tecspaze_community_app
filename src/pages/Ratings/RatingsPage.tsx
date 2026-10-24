import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { StaticRatingStars } from '../../components/ui/RatingStars'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useRatings } from '../../hooks/useRatings'
import { useEmployees } from '../../hooks/useEmployees'
import { EmployeeRating } from '../../types'

// Search icon
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// Filter icon
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

// Sort icon
const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 12 12 12" />
    <polyline points="11 6 11 12 11 18" />
    <polyline points="2 9 2 15" />
  </svg>
)

// Report icon
const ReportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

// Time icon
const TimeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const RatingsPage: React.FC = () => {
  const { t } = useTranslation()
  const { ratings, loading, fetchRatings, getEmployees } = useRatings()
  const { getRatingCategories } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'employee'>('newest')

  const employees = getEmployees()
  const categories = getRatingCategories()

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  const filteredRatings = ratings
    .filter((rating) => {
      const matchesSearch = 
        rating.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false
      const matchesEmployee = selectedEmployee === 'all' || rating.employeeId === selectedEmployee
      const matchesCategory = selectedCategory === 'all' || rating.category === selectedCategory
      return matchesSearch && matchesEmployee && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.value - a.value
        case 'employee':
          const aEmployee = employees.find((e) => e.id === a.employeeId)
          const bEmployee = employees.find((e) => e.id === b.employeeId)
          return (aEmployee?.name || '').localeCompare(bEmployee?.name || '')
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId)
    return employee?.name || t('common.user')
  }

  const getEmployeePhoto = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId)
    return employee?.photo || ''
  }

  const getCategoryTitle = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return t(`ratingCategories.${categoryId}`) || category?.title || categoryId
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return t('time.minutesAgo', { count: minutes })
    }
    if (hours < 24) {
      return t('time.hoursAgo', { count: hours })
    }
    const days = Math.floor(hours / 24)
    return t('time.daysAgo', { count: days })
  }

  const employeeOptions = [
    { value: 'all', label: t('ratings.allEmployees') },
    ...employees.map((emp) => ({
      value: emp.id,
      label: emp.name,
    })),
  ]

  const categoryOptions = [
    { value: 'all', label: t('ratings.allCategories') },
    ...categories.map((cat) => ({
      value: cat.id,
      label: t(`ratingCategories.${cat.id}`) || cat.title,
    })),
  ]

  return (
    <div className="page ratings-page">
      <div className="container">
        {/* Header */}
        <div className="ratings-header">
          <div className="ratings-header__left">
            <h1 className="ratings-title">{t('ratings.title')}</h1>
            <p className="ratings-subtitle text-secondary">{t('ratings.subtitle')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="ratings-filters">
          <div className="ratings-search">
            <SearchIcon />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ratings-search__input"
            />
          </div>
          <Select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employeeOptions}
            className="ratings-filter"
            icon={<FilterIcon />}
          />
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
            className="ratings-filter"
            icon={<FilterIcon />}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating' | 'employee')}
            options={[
              { value: 'newest', label: t('common.sort') + ' ' + t('time.newest') },
              { value: 'rating', label: t('common.sort') + ' ' + t('ratings.averageRating') },
              { value: 'employee', label: t('common.sort') + ' ' + t('common.name') },
            ]}
            className="ratings-sort"
            icon={<SortIcon />}
          />
        </div>

        {/* Stats */}
        <div className="ratings-stats mb-8">
          <Card className="ratings-stat-card">
            <Card.Body>
              <div className="ratings-stat">
                <div className="ratings-stat__value">{ratings.length}</div>
                <div className="ratings-stat__label">{t('ratings.totalRatings')}</div>
              </div>
            </Card.Body>
          </Card>
          <Card className="ratings-stat-card">
            <Card.Body>
              <div className="ratings-stat">
                <div className="ratings-stat__value">
                  {(ratings.reduce((sum, r) => sum + r.value, 0) / (ratings.length || 1)).toFixed(1)}
                </div>
                <div className="ratings-stat__label">{t('ratings.averageRating')}</div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Ratings List */}
        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : filteredRatings.length > 0 ? (
          <div className="ratings-list">
            {filteredRatings.map((rating: EmployeeRating) => (
              <Card key={rating.id} className="rating-card">
                <Card.Body>
                  <div className="rating-card__header">
                    <div className="rating-card__user">
                      <Avatar
                        src={getEmployeePhoto(rating.employeeId)}
                        alt={getEmployeeName(rating.employeeId)}
                        size="md"
                      />
                      <div className="rating-card__user-info">
                        <div className="rating-card__user-name">
                          {getEmployeeName(rating.employeeId)}
                        </div>
                        <div className="rating-card__category">
                          {getCategoryTitle(rating.category)}
                        </div>
                      </div>
                    </div>
                    <div className="rating-card__rating">
                      <StaticRatingStars value={rating.value} size="md" />
                      <span className="rating-card__rating-value">{rating.value}/5</span>
                    </div>
                  </div>

                  {rating.comment && (
                    <div className="rating-card__comment">
                      <p>{rating.comment}</p>
                    </div>
                  )}

                  <div className="rating-card__footer">
                    <div className="rating-card__time">
                      <TimeIcon /> {formatDate(rating.createdAt)}
                    </div>
                    <div className="rating-card__actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ReportIcon />}
                      >
                        {t('employeeRating.report')}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <Card.Body>
              <h3 className="empty-state__title">{t('ratings.noRatings')}</h3>
              <p className="empty-state__description text-secondary">
                {t('ratings.subtitle')}
              </p>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  )
}

export default RatingsPage
