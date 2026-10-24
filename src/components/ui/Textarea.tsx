import React from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  hint,
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
      <textarea
        id={inputId}
        className={clsx('textarea', { 'textarea--error': hasError }, className)}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
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

export default Textarea
