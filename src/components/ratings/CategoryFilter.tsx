import React from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '../ui/Select'
import { SelectOption } from '../../types'

interface CategoryFilterProps {
  categories: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  value,
  onChange,
  placeholder,
}) => {
  const { t } = useTranslation()

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[
        { value: 'all', label: t('ratings.allCategories') },
        ...categories,
      ]}
      placeholder={placeholder}
    />
  )
}

export default CategoryFilter
