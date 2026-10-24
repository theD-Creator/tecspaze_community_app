import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { usePosts } from '../../hooks/usePosts'
import { useEmployees } from '../../hooks/useEmployees'
import { useAuth } from '../../hooks/useAuth'

// Fire icon
const FireIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 13 10-13-10-5z" />
    <path d="M12 2v13.5" />
    <path d="M2 7l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
)

// Star icon
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 17.27L18.18 21l-1.64-7.01L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

// Clock icon
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const HomePage: React.FC = () => {
  const { t } = useTranslation()
  const { posts, loading, fetchPosts } = usePosts()
  const { employees, loading: employeesLoading, fetchEmployees } = useEmployees()
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
    fetchEmployees()
  }, [fetchPosts, fetchEmployees])

  // Get top rated employees
  const topEmployees = employees
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3)

  // Get trending posts
  const trendingPosts = posts
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 3)

  // Get recent posts
  const recentPosts = posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return t('time.minutesAgo', { count: minutes })
      }
      return t('time.hoursAgo', { count: hours })
    }
    return t('time.daysAgo', { count: days })
  }

  if (loading || employeesLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="page home-page">
      <div className="container">
        {/* Welcome Section */}
        <section className="home-welcome py-8">
          <div className="home-welcome__content">
            <h1 className="home-welcome__title">{t('home.welcome')}</h1>
            <p className="home-welcome__description text-secondary">
              {t('app.tagline')}
            </p>
          </div>
          {user && (
            <div className="home-welcome__actions">
              <Link to="/community">
                <Button variant="primary" leftIcon={<FireIcon />}>
                  {t('community.createPost')}
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="home-stats mb-8">
          <div className="home-stats__grid">
            <Card className="home-stat-card">
              <Card.Body>
                <div className="home-stat__value">{employees.length}</div>
                <div className="home-stat__label text-secondary">{t('employees.title')}</div>
              </Card.Body>
            </Card>
            <Card className="home-stat-card">
              <Card.Body>
                <div className="home-stat__value">{posts.length}</div>
                <div className="home-stat__label text-secondary">{t('community.title')}</div>
              </Card.Body>
            </Card>
            <Card className="home-stat-card">
              <Card.Body>
                <div className="home-stat__value">
                  {employees.reduce((sum, e) => sum + e.ratingCount, 0)}
                </div>
                <div className="home-stat__label text-secondary">{t('ratings.title')}</div>
              </Card.Body>
            </Card>
          </div>
        </section>

        {/* Top Employees */}
        <section className="home-section mb-8">
          <div className="home-section__header">
            <h2 className="home-section__title">{t('home.topRated')}</h2>
            <Link to="/employees" className="home-section__more">
              {t('common.more')}
            </Link>
          </div>
          <div className="home-employees-grid">
            {topEmployees.map((employee) => (
              <Card key={employee.id} variant="compact" className="employee-card">
                <Card.Body>
                  <div className="employee-card__content">
                    <Avatar
                      src={employee.photo}
                      alt={employee.name}
                      size="md"
                      className="employee-card__avatar"
                    />
                    <div className="employee-card__info">
                      <div className="employee-card__name">{employee.name}</div>
                      <div className="employee-card__category text-sm text-secondary">
                        {employee.category}
                      </div>
                    </div>
                    <div className="employee-card__rating">
                      <div className="employee-card__rating-value">
                        {employee.averageRating.toFixed(1)}
                      </div>
                      <div className="employee-card__rating-count text-xs text-muted">
                        ({employee.ratingCount})
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </section>

        {/* Trending Posts */}
        <section className="home-section mb-8">
          <div className="home-section__header">
            <h2 className="home-section__title">{t('home.trendingPosts')}</h2>
            <Link to="/community" className="home-section__more">
              {t('common.more')}
            </Link>
          </div>
          {trendingPosts.length > 0 ? (
            <div className="home-posts-list">
              {trendingPosts.map((post) => (
                <Card key={post.id} className="post-card">
                  <Card.Body>
                    <div className="post-card__header">
                      <Link to={`/profile`} className="post-card__author">
                        <Avatar src={post.authorPhoto} alt={post.authorName} size="sm" />
                        <div className="post-card__author-info">
                          <div className="post-card__author-name">{post.authorName}</div>
                          <div className="post-card__date text-xs text-muted">
                            <ClockIcon /> {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="post-card__content">
                      <h3 className="post-card__title">{post.title}</h3>
                      <p className="post-card__text text-secondary">{post.content}</p>
                    </div>
                    <div className="post-card__stats">
                      <div className="post-card__stat">
                        <StarIcon /> {post.likeCount}
                      </div>
                      <div className="post-card__stat">
                        {post.commentCount} {t('posts.comments')}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="empty-state">
              <Card.Body>
                <p className="text-secondary">{t('community.noPosts')}</p>
              </Card.Body>
            </Card>
          )}
        </section>

        {/* Recent Activity */}
        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">{t('home.recentActivity')}</h2>
          </div>
          {recentPosts.length > 0 ? (
            <div className="home-activity-list">
              {recentPosts.map((post) => (
                <div key={post.id} className="activity-item">
                  <Link to={`/profile`} className="activity-item__avatar">
                    <Avatar src={post.authorPhoto} alt={post.authorName} size="sm" />
                  </Link>
                  <div className="activity-item__content">
                    <div className="activity-item__text">
                      <span className="activity-item__author">{post.authorName}</span>
                      <span className="activity-item__action"> {t('posts.create')}</span>
                      <span className="activity-item__title"> {post.title}</span>
                    </div>
                    <div className="activity-item__time text-xs text-muted">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="empty-state">
              <Card.Body>
                <p className="text-secondary">{t('home.noPosts')}</p>
              </Card.Body>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage
