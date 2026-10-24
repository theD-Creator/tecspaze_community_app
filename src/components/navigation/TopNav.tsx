import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
// Brand logo (white wordmark with claim, from the assets folder)
const Logo: React.FC = () => (
  <img
    className="logo"
    src="/images/logos/tecspaze-claim-lok-weiss.svg"
    alt="TECSPAZE Community"
  />
)

// Notification icon
const NotificationIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
)

// Search icon
const SearchIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

// Menu icon
const MenuIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

interface TopNavProps {
  onMenuClick?: () => void
  onSearchClick?: () => void
  onNotificationClick?: () => void
}

export const TopNav: React.FC<TopNavProps> = ({
  onMenuClick,
  onSearchClick,
  onNotificationClick,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  // Slim header on auth pages: logo links back to the community
  if (isAuthPage) {
    return (
      <header className="top-nav top-nav--slim">
        <div className="top-nav__left">
          <Link to="/" className="top-nav__logo" aria-label="TECSPAZE – Startseite">
            <Logo />
          </Link>
        </div>
        <div className="top-nav__right">
          <Link to="/" className="top-nav__auth-back">
            {t('auth.backToCommunity')}
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <button className="top-nav__menu" onClick={onMenuClick} aria-label={t('navigation.home')}>
          <MenuIcon />
        </button>
        <Link to="/" className="top-nav__logo" aria-label="TECSPAZE – Startseite">
          <Logo />
        </Link>
      </div>
      <div className="top-nav__right">
        <button className="top-nav__icon" onClick={onSearchClick} aria-label={t('common.search')}>
          <SearchIcon />
        </button>
        <button className="top-nav__icon" onClick={onNotificationClick} aria-label={t('profile.settings.notifications')}>
          <NotificationIcon />
        </button>
        <Link to="/profile" className="top-nav__profile" aria-label={t('navigation.profile')}>
          <Avatar
            src={user?.photo || undefined}
            alt={user?.displayName || t('common.user')}
            size="sm"
            status={user ? 'online' : undefined}
            className="top-nav__avatar"
          />
        </Link>
      </div>
    </header>
  )
}

export default TopNav
