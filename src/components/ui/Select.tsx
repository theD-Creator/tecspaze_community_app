import React from 'react'
import { clsx } from 'clsx'
import { SelectOption } from '../../types'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  icon?: React.ReactNode
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  icon,
  className,
  disabled,
  id,
  ...props
}) => {
  const inputId = id || props.name
  const hasError = Boolean(error)

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select
          id={inputId}
          className={clsx('select', { 'select--error': hasError }, className)}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        >
          {props.placeholder && (
            <option value="" disabled selected>
              {props.placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {icon && <span className="select-icon">{icon}</span>}
      </div>
      {hasError ? (
        <p id={`${inputId}-error`} className="input-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="input-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default Select
