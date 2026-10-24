import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

import { Post } from '../../types'

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

// More icon
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

interface PostCardProps {
  post: Post
  onLike?: () => void
  onUnlike?: () => void
  onComment?: () => void
  onShare?: () => void
  onReport?: () => void
  hasLiked?: boolean
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onUnlike,
  onComment,
  onShare,
  onReport,
  hasLiked = false,
}) => {
  const { t } = useTranslation()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return t('time.minutesAgo', { count: minutes })
    }
    if (hours < 24) {
      return t('time.hoursAgo', { count: hours })
    }
    const days = Math.floor(hours / 24)
    return t('time.daysAgo', { count: days })
  }

  return (
    <Card className="feed-post-card">
      <Card.Body>
        {/* Post Header */}
        <div className="feed-post-card__header">
          <Link to={`/profile`} className="feed-post-card__author">
            <Avatar src={post.authorPhoto} alt={post.authorName} size="md" />
            <div className="feed-post-card__author-info">
              <div className="feed-post-card__author-name">{post.authorName}</div>
              <div className="feed-post-card__date">
                <ClockIcon /> {formatDate(post.createdAt)}
              </div>
            </div>
          </Link>
          <div className="feed-post-card__actions">
            <Button variant="ghost" size="sm" leftIcon={<MoreIcon />} onClick={onReport} />
          </div>
        </div>

        {/* Post Content */}
        <div className="feed-post-card__content">
          <h3 className="feed-post-card__title">{post.title}</h3>
          <p className="feed-post-card__text">{post.content}</p>
          {post.imageUrl && (
            <div className="feed-post-card__image">
              <img src={post.imageUrl} alt={post.title} />
            </div>
          )}
        </div>

        {/* Post Stats & Actions */}
        <div className="feed-post-card__footer">
          <div className="feed-post-card__stats">
            <button
              className="feed-post-card__stat"
              onClick={hasLiked ? onUnlike : onLike}
            >
              {hasLiked ? <HeartFilledIcon /> : <HeartIcon />}
              <span className="feed-post-card__stat-text">
                {post.likeCount} {t('posts.likes')}
              </span>
            </button>
            <button className="feed-post-card__stat" onClick={onComment}>
              <CommentIcon />
              <span className="feed-post-card__stat-text">
                {post.commentCount} {t('posts.comments')}
              </span>
            </button>
          </div>
          <div className="feed-post-card__share">
            <Button variant="ghost" size="sm" onClick={onShare}>
              Share
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default PostCard
