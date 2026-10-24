import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
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
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'input',
            {
              'input--error': hasError,
              'pl-10': leftIcon,
              'pr-10': rightIcon,
            },
            className
          )}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {rightIcon}
          </div>
        )}
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

export default Input
