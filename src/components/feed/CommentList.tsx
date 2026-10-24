import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Comment } from '../../types'

// Clock icon
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// Reply icon
const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 17 15 17" />
    <path d="M15 17V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10" />
  </svg>
)

// More icon
const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
)

interface CommentListProps {
  comments: Comment[]
  onReply?: (comment: Comment) => void
  onReport?: (commentId: string) => void
}

const CommentItem: React.FC<{
  comment: Comment
  depth?: number
  onReply?: (comment: Comment) => void
  onReport?: (commentId: string) => void
}> = ({ comment, depth = 0, onReply, onReport }) => {
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
    <div
      className="comment-item"
      style={{ marginLeft: depth > 0 ? `${depth * 40}px` : '0' }}
    >
      <div className="comment-item__header">
        <Link to={`/profile`} className="comment-item__author">
          <Avatar src={comment.authorPhoto} alt={comment.authorName} size="sm" />
          <div className="comment-item__author-info">
            <div className="comment-item__author-name">{comment.authorName}</div>
            <div className="comment-item__date">
              <ClockIcon /> {formatDate(comment.createdAt)}
            </div>
          </div>
        </Link>
        <div className="comment-item__actions">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ReplyIcon />}
            onClick={() => onReply?.(comment)}
          >
            {t('comments.reply')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<MoreIcon />}
            onClick={() => onReport?.(comment.id)}
          />
        </div>
      </div>
      <div className="comment-item__content">
        <p>{comment.content}</p>
      </div>
      {comment.replies.length > 0 && (
        <div className="comment-item__replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onReply,
  onReport,
}) => {
  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onReport={onReport}
        />
      ))}
    </div>
  )
}

export default CommentList
