import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { StaticRatingStars } from '../ui/RatingStars'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { RatingCategory, EmployeeRating, CreateRatingForm } from '../../types'

// Rate icon
const RateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

interface RatingFormProps {
  employeeId: string
  categories: RatingCategory[]
  existingRating?: EmployeeRating | null
  onSubmit: (form: CreateRatingForm) => void
  onCancel?: () => void
  loading?: boolean
}

export const RatingForm: React.FC<RatingFormProps> = ({
  employeeId,
  categories,
  existingRating,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState(
    existingRating?.category || categories[0]?.id || ''
  )
  const [selectedValue, setSelectedValue] = useState(
    existingRating?.value || 5
  )
  const [comment, setComment] = useState(existingRating?.comment || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      employeeId,
      category: selectedCategory,
      value: selectedValue,
      comment,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rating-form">
      <h3 className="rating-form__title">{t('employeeRating.title')}</h3>
      
      <div className="rating-form__field">
        <label className="input-label">{t('employeeRating.selectCategory')}</label>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={categories.map((cat) => ({
            value: cat.id,
            label: t(`ratingCategories.${cat.id}`) || cat.title,
          }))}
          className="rating-form__select"
        />
      </div>

      <div className="rating-form__field">
        <label className="input-label">{t('employeeRating.selectValue')}</label>
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

      <div className="rating-form__field">
        <Textarea
          label={t('employeeRating.addComment')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('employeeRating.commentPlaceholder')}
          rows={3}
        />
      </div>

      <div className="rating-form__actions">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          leftIcon={<RateIcon />}
          isLoading={loading}
        >
          {existingRating ? t('employeeRating.update') : t('employeeRating.submit')}
        </Button>
      </div>
    </form>
  )
}

export default RatingForm
