import React from 'react'
import { clsx } from 'clsx'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
  placeholder?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  status,
  placeholder,
  className,
  ...props
}) => {
  const hasImage = Boolean(src)
  const initial = placeholder || alt.charAt(0).toUpperCase()

  return (
    <div className={clsx('avatar', `avatar--${size}`, className)} {...props}>
      {hasImage ? (
        <img src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="avatar-placeholder">{initial}</div>
      )}
      {status && (
        <span
          className={clsx('avatar-status', {
            'avatar-status--offline': status === 'offline',
            'avatar-status--busy': status === 'busy',
            'avatar-status--away': status === 'away',
          })}
        />
      )}
    </div>
  )
}

export default Avatar
