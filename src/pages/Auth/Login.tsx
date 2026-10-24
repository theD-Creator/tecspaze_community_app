import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { showError } from '../../hooks/useNotification'

// Eye icon
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// Eye off icon
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

// Google icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

// GitHub icon
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.44-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.311-.469-2.381-1.236-3.221-.777-1.387.998-2.61 0-3.221 0 0-1.005-.323-2.306-1.236C5.08 2.38 3.633 1.85 3.633 1.85c-1.222-.998-2.826-1.305-2.826-1.305C.437.297 0 .297 0 .297s.437 0 .437.297c.593.17 1.405.428 2.27.948.875.52 1.405 1.311 1.405 2.44 0 .593-.633 1.548-1.18 2.188.417-.593 1.18-1.236 2.18-1.236.975 0 1.838.633 2.306 1.405.469.777.998 1.766.998 2.594 0 .875-.633 2.084-1.305 2.594.975.875 2.61.875 3.495 0 .875.633 1.766.998 2.306.998.593 0 1.548-.633 2.18-1.18.777-.777 1.305-1.85 1.305-2.665 0-1.405-.323-2.61-.998-3.221.777-.469 1.236-1.405 1.236-2.44 0-1.04-.015-2.084-.015-2.44.82.319.6.922.6 1.548 0 1.04-.01 2.381-.01 3.221 0 .777.258 1.61.76 2.27.52.66.998 1.305 1.305 1.835.469.875.875 1.766.875 2.61 0 1.548-.633 3.221-1.838 4.53-1.61.998-3.676 1.305-5.577.998-.875-.319-1.766-.777-2.44-1.405-.66-.633-1.305-1.387-1.838-2.27z"
    />
  </svg>
)

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const { signIn, signInWithOAuth, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      showError(t('auth.login.error'))
      return
    }

    const { error } = await signIn(email, password)
    if (!error) {
      navigate('/')
    } else {
      showError(error || t('auth.login.error'))
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    const { error } = await signInWithOAuth(provider)
    if (error) {
      showError(error)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <Card.Body>
            <div className="auth-header">
              <img
                src="/images/logos/tecspaze-claim-lok-verlauf.svg"
                alt="TECSPAZE"
                className="auth-logo"
              />
              <h1 className="auth-title">{t('auth.login.title')}</h1>
              <p className="auth-subtitle text-secondary">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <Input
                  label={t('auth.login.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder')}
                  required
                />
              </div>

              <div className="auth-field">
                <Input
                  label={t('auth.login.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-password-toggle"
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  }
                  required
                />
              </div>

              <div className="auth-options">
                <label className="auth-option">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="auth-checkbox"
                  />
                  <span>{t('auth.login.remember')}</span>
                </label>
                <Link to="/forgot-password" className="auth-link">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="auth-submit"
                isLoading={loading}
              >
                {t('auth.login.submit')}
              </Button>

              <div className="auth-divider">
                <span>{t('auth.login.or')}</span>
              </div>

              <div className="auth-oauth">
                <Button
                  variant="ghost"
                  className="auth-oauth-button"
                  onClick={() => handleOAuthSignIn('google')}
                  leftIcon={<GoogleIcon />}
                >
                  {t('auth.login.google')}
                </Button>
                <Button
                  variant="ghost"
                  className="auth-oauth-button"
                  onClick={() => handleOAuthSignIn('github')}
                  leftIcon={<GitHubIcon />}
                >
                  {t('auth.login.github')}
                </Button>
              </div>
            </form>

            <div className="auth-footer">
              <p className="auth-footer-text">
                {t('auth.register.alreadyHaveAccount')}
              </p>
              <Link to="/register" className="auth-footer-link">
                {t('auth.login.createAccount')}
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
