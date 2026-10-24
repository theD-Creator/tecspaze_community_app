import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { BadgeWithDefinition } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { StaticRatingStars } from '../../components/ui/RatingStars'
import { useAuth } from '../../hooks/useAuth'
import { usePosts } from '../../hooks/usePosts'
import { useRatings } from '../../hooks/useRatings'
import { formatDate } from '../../utils/date'

// Edit icon
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

// Settings icon
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V7a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

// Logout icon
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// Calendar icon
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

// Post icon
const PostIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

// Like icon
const LikeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

// Comment icon
const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

// Star icon
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation()
  const { user, signOut, updateProfile, uploadAvatar } = useAuth()
  const { posts, fetchPosts } = usePosts()
  const { ratings, fetchRatings, getEmployees } = useRatings()
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
    fetchRatings()
    if (user) {
      setDisplayName(user.displayName)
      setBio(user.bio || '')
    }
  }, [fetchPosts, fetchRatings, user])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile)
      }

      await updateProfile({ displayName, bio })
      setEditMode(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // Get user's posts and ratings
  const userPosts = posts.filter((p) => p.authorId === user?.id)
  const userRatings = ratings.filter((r) => r.userId === user?.id)
  const employees = getEmployees()

  const stats = {
    posts: userPosts.length,
    likes: userPosts.reduce((sum, p) => sum + p.likeCount, 0),
    comments: posts.filter((p) => p.authorId === user?.id).reduce(
      (sum, p) => sum + p.commentCount,
      0
    ),
    ratings: userRatings.length,
    joined: user?.createdAt ? formatDate(user.createdAt) : '',
  }

  if (!user) {
    return (
      <div className="page profile-page">
        <div className="container">
          <Card className="empty-state">
            <Card.Body>
              <p className="text-secondary">{t('auth.login.submit')} to view profile</p>
            </Card.Body>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page profile-page">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-cover">
            {editMode && avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="profile-cover__preview" />
            ) : (
              user?.photo && (
                <img src={user.photo} alt="Cover" className="profile-cover__image" />
              )
            )}
          </div>
          
          <div className="profile-info">
            <div className="profile-avatar">
              {editMode ? (
                <label className="profile-avatar__label">
                  <Avatar
                    src={avatarPreview || user?.photo}
                    alt={user.displayName}
                    size="xl"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="profile-avatar__input"
                  />
                </label>
              ) : (
                <Avatar
                  src={user?.photo}
                  alt={user.displayName}
                  size="xl"
                />
              )}
              
              {editMode && (
                <div className="profile-avatar__edit">
                  <EditIcon />
                </div>
              )}
            </div>

            <div className="profile-details">
              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="profile-edit-form__name"
                    autoFocus
                  />
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t('profile.edit.bioPlaceholder')}
                    className="profile-edit-form__bio"
                    rows={2}
                  />
                  <div className="profile-edit-form__actions">
                    <Button variant="ghost" onClick={() => setEditMode(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button variant="primary" type="submit" isLoading={loading}>
                      {t('profile.save')}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="profile-name">{user.displayName}</h1>
                  {user.bio && (
                    <p className="profile-bio text-secondary">{user.bio}</p>
                  )}
                  <div className="profile-badges">
                    <BadgeWithDefinition badgeId="community_hero" />
                    <BadgeWithDefinition badgeId="top_contributor" />
                  </div>
                </>
              )}
            </div>

            {!editMode && (
              <Button
                variant="ghost"
                leftIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                className="profile-edit-button"
              >
                {t('profile.editProfile')}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat__value">{stats.posts}</div>
              <div className="profile-stat__label">
                <PostIcon /> {t('profile.stats.posts')}
              </div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__value">{stats.likes}</div>
              <div className="profile-stat__label">
                <LikeIcon /> {t('profile.stats.likes')}
              </div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__value">{stats.comments}</div>
              <div className="profile-stat__label">
                <CommentIcon /> {t('profile.stats.comments')}
              </div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat__value">{stats.ratings}</div>
              <div className="profile-stat__label">
                <StarIcon /> {t('profile.stats.ratings')}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="profile-section">
          <h2 className="profile-section__title">{t('common.about')}</h2>
          <Card className="profile-about">
            <Card.Body>
              <div className="profile-about__item">
                <div className="profile-about__label">{t('auth.register.email')}</div>
                <div className="profile-about__value">{user.email}</div>
              </div>
              <div className="profile-about__item">
                <div className="profile-about__label">{t('profile.stats.joined', { date: stats.joined })}</div>
                <div className="profile-about__value">
                  <CalendarIcon /> {formatDate(user.createdAt || '')}
                </div>
              </div>
            </Card.Body>
          </Card>
        </section>

        {/* My Ratings Section */}
        {userRatings.length > 0 && (
          <section className="profile-section">
            <h2 className="profile-section__title">{t('profile.stats.ratings')}</h2>
            <div className="profile-ratings">
              {userRatings.map((rating) => {
                const employee = employees.find((e) => e.id === rating.employeeId)
                return (
                  <Card key={rating.id} variant="compact" className="profile-rating">
                    <Card.Body>
                      <div className="profile-rating__content">
                        {employee && (
                          <Avatar
                            src={employee.photo}
                            alt={employee.name}
                            size="sm"
                          />
                        )}
                        <div className="profile-rating__info">
                          <div className="profile-rating__name">{employee?.name || 'Unknown'}</div>
                          <StaticRatingStars value={rating.value} size="sm" />
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="profile-rating__comment">{rating.comment}</p>
                      )}
                    </Card.Body>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Settings Section */}
        <section className="profile-section">
          <h2 className="profile-section__title">{t('profile.settings.title')}</h2>
          <Card className="profile-settings">
            <Card.Body>
              <Button
                variant="ghost"
                leftIcon={<SettingsIcon />}
                className="profile-settings__button"
              >
                {t('profile.settings.notifications')}
              </Button>
              <Button
                variant="ghost"
                leftIcon={<SettingsIcon />}
                className="profile-settings__button"
              >
                {t('profile.settings.theme')}
              </Button>
              <Button
                variant="ghost"
                leftIcon={<LogoutIcon />}
                className="profile-settings__button profile-settings__button--danger"
                onClick={handleSignOut}
              >
                {t('profile.settings.logout')}
              </Button>
            </Card.Body>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default ProfilePage
