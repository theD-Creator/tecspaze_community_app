import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'
import { Button } from '../ui/Button'

// Menu icon
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
)

const CommunityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const EmployeesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
)

const RatingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    onClose()
  }

  const menuItems = [
    { to: '/', icon: <HomeIcon />, label: t('navigation.home'), onClick: onClose },
    { to: '/community', icon: <CommunityIcon />, label: t('navigation.community'), onClick: onClose },
    { to: '/employees', icon: <EmployeesIcon />, label: t('navigation.employees'), onClick: onClose },
    { to: '/ratings', icon: <RatingsIcon />, label: t('navigation.ratings'), onClick: onClose },
    { to: '/profile', icon: <ProfileIcon />, label: t('navigation.profile'), onClick: onClose },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx('side-menu__backdrop', { 'side-menu__backdrop--open': isOpen })}
        onClick={onClose}
      />

      {/* Menu */}
      <aside className={clsx('side-menu', { 'side-menu--open': isOpen })}>
        <div className="side-menu__header">
          <div className="side-menu__logo">
            <span className="text-xl font-bold text-cyan">TECSPAZE</span>
            <span className="text-xs text-muted">Community</span>
          </div>
          <button className="side-menu__close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <nav className="side-menu__nav">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="side-menu__item"
              onClick={item.onClick}
            >
              <span className="side-menu__icon">{item.icon}</span>
              <span className="side-menu__label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="side-menu__footer">
          <div className="side-menu__section">
            <div className="side-menu__section-title">{t('profile.settings.language')}</div>
            <div className="side-menu__language-options">
              <Button
                variant={i18n.language === 'de' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('de')}
                className="w-full justify-start"
              >
                Deutsch
              </Button>
              <Button
                variant={i18n.language === 'en' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('en')}
                className="w-full justify-start"
              >
                English
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start side-menu__logout"
            leftIcon={<LogoutIcon />}
          >
            {t('navigation.logout')}
          </Button>
        </div>
      </aside>
    </>
  )
}

export default SideMenu
