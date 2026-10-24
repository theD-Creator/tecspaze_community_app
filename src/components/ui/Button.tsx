import React from 'react'
import { clsx } from 'clsx'
import { ButtonVariant, ButtonSize } from '../../types'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  type = 'button', // Default "button": verhindert versehentliche Form-Submits (z.B. OAuth-Buttons im Login-Formular)
  ...props
}) => {
  const baseClasses = clsx(
    'button',
    `button--${variant}`,
    `button--${size}`,
    {
      'button--loading': isLoading,
      'button--disabled': disabled || isLoading,
    },
    className
  )

  return (
    <button type={type} className={baseClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="button__spinner" aria-hidden="true" />
      ) : (
        <>
          {leftIcon && <span className="button__icon button__icon--left">{leftIcon}</span>}
          <span className="button__content">{children}</span>
          {rightIcon && <span className="button__icon button__icon--right">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}

export default Button
