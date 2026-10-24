import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  avatar?: React.ReactNode
  action?: React.ReactNode
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<CardHeaderProps>
  Body: React.FC<CardBodyProps>
  Footer: React.FC<CardFooterProps>
}

const CardBase: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  onClick,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        'card',
        `card--${variant}`,
        paddingClasses[padding],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export const Card = CardBase as CardComponent

// Card Header
Card.Header = function CardHeader({
  title,
  subtitle,
  avatar,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={clsx('card__header', className)} {...props}>
      {avatar && <div className="card__avatar">{avatar}</div>}
      <div className="card__header-content">
        {title && <h3 className="card__title">{title}</h3>}
        {subtitle && <p className="card__subtitle text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="card__header-action">{action}</div>}
    </div>
  )
}

// Card Body
Card.Body = function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={clsx('card__body', className)} {...props} />
}

// Card Footer
Card.Footer = function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={clsx('card__footer', className)} {...props} />
}

export default Card
