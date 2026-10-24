import React from 'react'
import { clsx } from 'clsx'
import { Badge as BadgeType } from '../../types'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'magenta' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={clsx(
        'badge',
        `badge--${variant}`,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Predefined badges based on badges.json
const badgeDefinitions: Record<string, BadgeType> = {
  workshop_legend: {
    id: 'workshop_legend',
    key: 'workshop_legend',
    title: 'Workshop-Legende',
    description: 'Hat besonders gute Workshops durchgeführt',
    icon: 'trophy',
    color: 'cyan',
    condition: () => true,
  },
  design_master: {
    id: 'design_master',
    key: 'design_master',
    title: 'Design-Meister',
    description: 'Ausgezeichnetes Design-Talent',
    icon: 'paintbrush',
    color: 'magenta',
    condition: () => true,
  },
  tech_guru: {
    id: 'tech_guru',
    key: 'tech_guru',
    title: 'Technik-Guru',
    description: 'Technisches Know-how auf höchstem Niveau',
    icon: 'cog',
    color: 'cyan',
    condition: () => true,
  },
  community_hero: {
    id: 'community_hero',
    key: 'community_hero',
    title: 'Community-Held',
    description: 'Besonderes Engagement in der Community',
    icon: 'heart',
    color: 'magenta',
    condition: () => true,
  },
  chaos_champion: {
    id: 'chaos_champion',
    key: 'chaos_champion',
    title: 'Chaos-Champion',
    description: 'Bringt Leben in die Bude',
    icon: 'zap',
    color: 'warning',
    condition: () => true,
  },
  early_adopter: {
    id: 'early_adopter',
    key: 'early_adopter',
    title: 'Early Adopter',
    description: 'Immer als Erster dabei',
    icon: 'rocket',
    color: 'success',
    condition: () => true,
  },
  top_contributor: {
    id: 'top_contributor',
    key: 'top_contributor',
    title: 'Top-Contributor',
    description: 'Besonders aktiv in der Community',
    icon: 'star',
    color: 'cyan',
    condition: () => true,
  },
}

export const getBadgeDefinition = (badgeId: string): BadgeType | undefined => {
  return badgeDefinitions[badgeId]
}

export const BadgeWithDefinition: React.FC<{ badgeId: string } & React.HTMLAttributes<HTMLSpanElement>> = ({
  badgeId,
  className,
  ...props
}) => {
  const badge = getBadgeDefinition(badgeId)
  if (!badge) return null

  const variantMap: Record<string, BadgeProps['variant']> = {
    cyan: 'cyan',
    magenta: 'magenta',
    success: 'success',
    warning: 'warning',
    error: 'error',
  }

  return (
    <Badge variant={variantMap[badge.color] || 'cyan'} className={className} {...props}>
      {badge.title}
    </Badge>
  )
}

export default Badge
