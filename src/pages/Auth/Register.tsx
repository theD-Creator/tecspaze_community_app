import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { showError, showSuccess } from '../../hooks/useNotification'

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

// Arrow left icon
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const { signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!displayName.trim()) {
      newErrors.displayName = t('validation.required')
    }

    if (!email.trim()) {
      newErrors.email = t('validation.required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('validation.email')
    }

    if (!password) {
      newErrors.password = t('validation.required')
    } else if (password.length < 6) {
      newErrors.password = t('validation.password')
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.register.passwordMatchError')
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = t('validation.required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const { error } = await signUp(email, password, displayName)
    if (!error) {
      showSuccess(t('auth.register.success'))
      navigate('/')
    } else {
      showError(error || t('auth.register.error'))
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <Card.Body>
            <div className="auth-header">
              <h1 className="auth-title">{t('auth.register.title')}</h1>
              <p className="auth-subtitle text-secondary">{t('auth.register.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <Input
                  label={t('auth.register.displayName')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.register.displayNamePlaceholder')}
                  error={errors.displayName}
                  required
                />
              </div>

              <div className="auth-field">
                <Input
                  label={t('auth.register.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.register.emailPlaceholder')}
                  error={errors.email}
                  required
                />
              </div>

              <div className="auth-field">
                <Input
                  label={t('auth.register.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  error={errors.password}
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

              <div className="auth-field">
                <Input
                  label={t('auth.register.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  error={errors.confirmPassword}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="auth-password-toggle"
                    >
                      {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  }
                  required
                />
              </div>

              <div className="auth-options">
                <label className={`auth-option ${errors.agreeTerms ? 'auth-option--error' : ''}`}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="auth-checkbox"
                  />
                  <span>{t('auth.register.agreeTerms')}</span>
                </label>
                {errors.agreeTerms && (
                  <span className="auth-option__error">{errors.agreeTerms}</span>
                )}
              </div>

              <Button
                variant="primary"
                type="submit"
                className="auth-submit"
                isLoading={loading}
              >
                {t('auth.register.submit')}
              </Button>

              <div className="auth-footer">
                <p className="auth-footer-text">
                  {t('auth.register.alreadyHaveAccount')}
                </p>
                <Link to="/login" className="auth-footer-link">
                  <ArrowLeftIcon /> {t('auth.register.alreadyHaveAccount')}
                </Link>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
