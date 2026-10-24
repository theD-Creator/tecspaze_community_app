import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { BadgeWithDefinition } from '../../components/ui/Badge'
import { StaticRatingStars } from '../../components/ui/RatingStars'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { useEmployees } from '../../hooks/useEmployees'
import { useRatings } from '../../hooks/useRatings'
import { Employee } from '../../types'

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

// Rate button icon
const RateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

// Employee Detail Modal
const EmployeeDetailModal: React.FC<{
  employee: Employee
  onClose: () => void
  onRate: (employee: Employee) => void
}> = ({ employee, onClose, onRate }) => {
  const { t } = useTranslation()

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal open" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{employee.name}</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <div className="employee-detail">
            <div className="employee-detail__header">
              <Avatar
                src={employee.photo}
                alt={employee.name}
                size="xl"
                className="employee-detail__avatar"
              />
              <div className="employee-detail__info">
                <h3 className="employee-detail__name">{employee.name}</h3>
                <BadgeWithDefinition badgeId={employee.category.toLowerCase().replace(/\s+/g, '_')} />
              </div>
            </div>
            
            <div className="employee-detail__description">
              <p>{employee.description}</p>
            </div>

            <div className="employee-detail__stats">
              <div className="employee-detail__stat">
                <div className="employee-detail__stat-value">{employee.averageRating.toFixed(1)}</div>
                <div className="employee-detail__stat-label">{t('employees.rating')}</div>
                <StaticRatingStars value={employee.averageRating} size="sm" />
              </div>
              <div className="employee-detail__stat">
                <div className="employee-detail__stat-value">{employee.ratingCount}</div>
                <div className="employee-detail__stat-label">
                  {t('employees.ratings', { count: employee.ratingCount })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <Button variant="ghost" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Button variant="primary" leftIcon={<RateIcon />} onClick={() => onRate(employee)}>
            {t('employees.rateNow')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Rating Modal
const RatingModal: React.FC<{
  employee: Employee
  onClose: () => void
  categories: any[]
  onSubmit: (category: string, value: number, comment: string) => void
}> = ({ employee, onClose, categories, onSubmit }) => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '')
  const [selectedValue, setSelectedValue] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(selectedCategory, selectedValue, comment)
    onClose()
  }

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal open" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{t('employeeRating.title')}</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-secondary">
              {t('employeeRating.subtitle', { name: employee.name })}
            </p>
            
            <div className="mb-4">
              <label className="input-label mb-2 block">{t('employeeRating.selectCategory')}</label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: t(`ratingCategories.${cat.id}`) || cat.title,
                }))}
              />
            </div>

            <div className="mb-4">
              <label className="input-label mb-2 block">{t('employeeRating.selectValue')}</label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`rating-option ${selectedValue === value ? 'selected' : ''}`}
                    onClick={() => setSelectedValue(value)}
                  >
                    <StaticRatingStars value={value} size="md" />
                    <span className="rating-option__label">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <Textarea
                label={t('employeeRating.addComment')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('employeeRating.commentPlaceholder', { name: employee.name })}
                rows={3}
              />
            </div>

            <div className="modal__footer">
              <Button variant="ghost" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit">
                {t('employeeRating.submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export const EmployeesPage: React.FC = () => {
  const { t } = useTranslation()
  const { employees, loading, fetchEmployees, getRatingCategories } = useEmployees()
  const { createRating, fetchRatings } = useRatings()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'newest'>('rating')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [ratingModalEmployee, setRatingModalEmployee] = useState<Employee | null>(null)
  const categories = getRatingCategories()

  useEffect(() => {
    fetchEmployees()
    fetchRatings()
  }, [fetchEmployees, fetchRatings])

  const filteredEmployees = employees
    .filter((employee) => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || employee.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.averageRating - a.averageRating
        case 'newest':
          return b.ratingCount - a.ratingCount
        default:
          return 0
      }
    })

  const handleRate = (employee: Employee) => {
    setRatingModalEmployee(employee)
  }

  const handleSubmitRating = async (category: string, value: number, comment: string) => {
    if (ratingModalEmployee) {
      await createRating({
        employeeId: ratingModalEmployee.id,
        category,
        value,
        comment,
      })
    }
    setRatingModalEmployee(null)
  }

  // Get unique categories from employees
  const employeeCategories = Array.from(new Set(employees.map((e) => e.category)))

  return (
    <div className="page employees-page">
      <div className="container">
        {/* Header */}
        <div className="employees-header">
          <div className="employees-header__left">
            <h1 className="employees-title">{t('employees.title')}</h1>
            <p className="employees-subtitle text-secondary">{t('employees.subtitle')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="employees-filters">
          <div className="employees-search">
            <SearchIcon />
            <Input
              placeholder={t('employees.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="employees-search__input"
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'all', label: t('employees.allCategories') },
              ...employeeCategories.map((cat) => ({
                value: cat,
                label: cat,
              })),
            ]}
            className="employees-filter"
            icon={<FilterIcon />}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'newest')}
            options={[
              { value: 'rating', label: t('common.sort') + ' ' + t('employees.rating') },
              { value: 'name', label: t('common.sort') + ' ' + t('common.name') },
              { value: 'newest', label: t('common.sort') + ' ' + t('time.newest') },
            ]}
            className="employees-sort"
            icon={<SortIcon />}
          />
        </div>

        {/* Employees Grid */}
        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : filteredEmployees.length > 0 ? (
          <div className="employees-grid">
            {filteredEmployees.map((employee) => (
              <Card
                key={employee.id}
                variant="compact"
                className="employee-card"
                onClick={() => setSelectedEmployee(employee)}
              >
                <Card.Body>
                  <div className="employee-card__content">
                    <Avatar
                      src={employee.photo}
                      alt={employee.name}
                      size="md"
                      className="employee-card__avatar"
                    />
                    <div className="employee-card__info">
                      <div className="employee-card__name">{employee.name}</div>
                      <div className="employee-card__category text-sm text-secondary">
                        {employee.category}
                      </div>
                    </div>
                    <div className="employee-card__rating">
                      <StaticRatingStars value={employee.averageRating} size="sm" />
                      <span className="employee-card__rating-value">
                        {employee.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="employee-card__footer">
                    <div className="employee-card__rating-count">
                      {employee.ratingCount} {t('employees.ratings')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRate(employee)
                      }}
                    >
                      {t('employees.rate')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <Card.Body>
              <h3 className="empty-state__title">{t('employees.noEmployees')}</h3>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onRate={(emp) => {
            setSelectedEmployee(null)
            handleRate(emp)
          }}
        />
      )}

      {/* Rating Modal */}
      {ratingModalEmployee && categories.length > 0 && (
        <RatingModal
          employee={ratingModalEmployee}
          onClose={() => setRatingModalEmployee(null)}
          categories={categories}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  )
}

export default EmployeesPage
