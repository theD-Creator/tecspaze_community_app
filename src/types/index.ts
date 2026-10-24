// ============================================
// TECSPAZE COMMUNITY - Type Definitions
// ============================================

// ============================================
// Employee Types
// ============================================

export interface Employee {
  id: string
  name: string
  photo: string
  description: string
  category: string
  averageRating: number
  ratingCount: number
  ratings: EmployeeRating[]
}

export interface EmployeeRating {
  id: string
  employeeId: string
  userId: string
  category: string
  value: number
  comment?: string
  createdAt: string
  reported: boolean
}

export type RatingCategory = {
  id: string
  key: string
  title: string
  description: string
  icon?: string
  maxValue: number
}

// ============================================
// Community Post Types
// ============================================

export interface Post {
  id: string
  title: string
  content: string
  imageUrl?: string
  authorId: string
  authorName: string
  authorPhoto?: string
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  reported: boolean
  likes: string[] // User IDs who liked
}

export interface Comment {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  authorPhoto?: string
  createdAt: string
  updatedAt: string
  reported: boolean
  replies: Comment[]
}

export interface Report {
  id: string
  type: 'post' | 'comment' | 'rating'
  targetId: string
  reporterId: string
  reason: string
  createdAt: string
  resolved: boolean
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string
  email: string
  displayName: string
  photo?: string
  bio?: string
  createdAt: string
  lastLoginAt: string
  role: 'user' | 'moderator' | 'admin'
  badges: string[]
}

export interface UserProfile extends User {
  postCount: number
  likeCount: number
  commentCount: number
  ratingCount: number
}

// ============================================
// Badge Types
// ============================================

export interface Badge {
  id: string
  key: string
  title: string
  description: string
  icon: string
  color: string
  condition: (user: User) => boolean
}

// ============================================
// UI Types
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// ============================================
// Sort Types
// ============================================

export type PostSortOrder = 'newest' | 'popular' | 'trending'

export type EmployeeSortOrder = 'name' | 'rating' | 'newest'

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  createdAt: string
}

// ============================================
// Form Types
// ============================================

export interface CreatePostForm {
  title: string
  content: string
  image?: File
}

export interface CreateRatingForm {
  employeeId: string
  category: string
  value: number
  comment?: string
}

export interface CreateCommentForm {
  postId: string
  content: string
  parentId?: string // For replies
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
