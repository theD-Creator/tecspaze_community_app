import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import VerifiedBadge from '../../components/ui/VerifiedBadge'
import PostComments from '../../components/community/PostComments'
import { usePosts } from '../../hooks/usePosts'
import { useAuth } from '../../hooks/useAuth'
import { PostSortOrder } from '../../types'

// Plus icon
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

// Clock icon
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// Heart icon
const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

// Heart filled icon
const HeartFilledIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

// Comment icon
const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

// Share icon
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

// More icon (3 dots)
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

// Search icon
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// Sort icon
const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 12 12 12" />
    <polyline points="11 6 11 12 11 18" />
    <polyline points="2 9 2 15" />
  </svg>
)

export const CommunityPage: React.FC = () => {
  const { t } = useTranslation()
  const { posts, loading, fetchPosts, createPost, likePost, unlikePost } = usePosts()
  const { user } = useAuth()
  const [sortOrder, setSortOrder] = useState<PostSortOrder>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  /** Aufgeklappte Kommentarpanels: postId → true */
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const sortedPosts = [...posts]
    .filter((post) => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'popular':
          return b.likeCount - a.likeCount
        case 'trending':
          // Simple trending algorithm: likes + comments / age
          const aScore = (a.likeCount + a.commentCount) / (Date.now() - new Date(a.createdAt).getTime() + 1)
          const bScore = (b.likeCount + b.commentCount) / (Date.now() - new Date(b.createdAt).getTime() + 1)
          return bScore - aScore
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    try {
      await createPost({ title, content })
      setTitle('')
      setContent('')
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    const hasLiked = posts.find((p) => p.id === postId)?.likes.includes(user.id || '')
    if (hasLiked) {
      await unlikePost(postId, user.id || '')
    } else {
      await likePost(postId, user.id || '')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes <= 0) {
        return t('time.justNow')
      }
      return t('time.minutesAgo', { count: minutes })
    }
    if (hours < 24) {
      return t('time.hoursAgo', { count: hours })
    }
    const days = Math.floor(hours / 24)
    return t('time.daysAgo', { count: days })
  }

  const getLikeButtonIcon = (postId: string) => {
    if (!user) return <HeartIcon />
    const post = posts.find((p) => p.id === postId)
    const hasLiked = post?.likes.includes(user.id || '')
    return hasLiked ? <HeartFilledIcon /> : <HeartIcon />
  }

  return (
    <div className="page community-page">
      <div className="container">
        {/* Header */}
        <div className="community-header">
          <h1 className="community-title">{t('community.title')}</h1>
          {user ? (
            <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setShowCreateForm(true)}>
              {t('posts.create')}
            </Button>
          ) : (
            <Link to="/login" className="community-guest-notice">
              {t('community.guestNotice')}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="community-filters">
          <div className="community-search">
            <SearchIcon />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="community-search__input"
            />
          </div>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as PostSortOrder)}
            options={[
              { value: 'newest', label: t('community.sort.newest') },
              { value: 'popular', label: t('community.sort.popular') },
              { value: 'trending', label: t('community.sort.trending') },
            ]}
            className="community-sort"
            icon={<SortIcon />}
          />
        </div>

        {/* Create Post Form */}
        {showCreateForm && (
          <Card className="community-create-form mb-6">
            <Card.Body>
              <form onSubmit={handleCreatePost}>
                <h3 className="mb-4">{t('posts.create')}</h3>
                <Input
                  label={t('posts.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('posts.titlePlaceholder')}
                  className="mb-4"
                />
                <Textarea
                  label={t('posts.contentPlaceholder')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('posts.contentPlaceholder')}
                  className="mb-4"
                  rows={4}
                />
                <div className="community-create-form__actions">
                  <Button variant="ghost" onClick={() => setShowCreateForm(false)} disabled={isSubmitting}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="primary" type="submit" isLoading={isSubmitting}>
                    {t('posts.submit')}
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="animate-pulse text-muted">{t('common.loading')}</div>
        ) : sortedPosts.length > 0 ? (
          <div className="community-posts">
            {sortedPosts.map((post) => {
              const likeCount = post.likeCount
              
              return (
                <Card key={post.id} className="community-post">
                  <Card.Body>
                    {/* Post Header */}
                    <div className="community-post__header">
                      <Link to={`/profile`} className="community-post__author">
                        <Avatar src={post.authorPhoto} alt={post.authorName} size="md" />
                        <div className="community-post__author-info">
                          <div className="community-post__author-name">
                            {post.authorName}
                            {post.authorVerified && <VerifiedBadge title={t('users.verified')} />}
                          </div>
                          <div className="community-post__date">
                            <ClockIcon /> {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </Link>
                      <div className="community-post__actions">
                        <Button variant="ghost" size="sm" leftIcon={<MoreIcon />} />
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="community-post__content">
                      <h3 className="community-post__title">{post.title}</h3>
                      <p className="community-post__text">{post.content}</p>
                      {post.imageUrl && (
                        <div className="community-post__image">
                          <img src={post.imageUrl} alt={post.title} />
                        </div>
                      )}
                    </div>

                    {/* Post Stats & Actions */}
                    <div className="community-post__footer">
                      <div className="community-post__stats">
                        <button
                          className="community-post__stat"
                          onClick={() => handleLike(post.id)}
                          disabled={!user}
                          title={user ? undefined : t('community.guestNotice')}
                        >
                          {getLikeButtonIcon(post.id)}
                          <span className="community-post__stat-text">
                            {t('posts.likes', { count: likeCount })}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="community-post__stat"
                          onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
                          aria-expanded={!!openComments[post.id]}
                        >
                          <CommentIcon />
                          <span className="community-post__stat-text">
                            {t('posts.comments', { count: post.commentCount })}
                          </span>
                        </button>
                      </div>
                      <div className="community-post__share">
                        <Button variant="ghost" size="sm" leftIcon={<ShareIcon />} />
                      </div>
                    </div>

                    {/* Kommentarbereich (aufklappbar) */}
                    {!!openComments[post.id] && (
                      <PostComments postId={post.id} />
                    )}
                  </Card.Body>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="empty-state">
            <Card.Body>
              <div className="empty-state__icon">💬</div>
              <h3 className="empty-state__title">{t('community.noPosts')}</h3>
              {user && (
                <p className="empty-state__description text-secondary">
                  {t('community.createPostDescription')}
                </p>
              )}
              {user && (
                <Button
                  variant="primary"
                  leftIcon={<PlusIcon />}
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4"
                >
                  {t('posts.create')}
                </Button>
              )}
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CommunityPage
