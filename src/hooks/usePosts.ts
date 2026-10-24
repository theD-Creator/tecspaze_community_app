import { create } from 'zustand'
import { Post, Comment, CreatePostForm, CreateCommentForm } from '../types'
import { localDb } from '../services/database'
import { nanoid } from 'nanoid'
import { showError } from './useNotification'

interface PostsState {
  posts: Post[]
  loading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
  createPost: (form: CreatePostForm) => Promise<Post | null>
  updatePost: (id: string, updates: Partial<Post>) => Promise<Post | null>
  deletePost: (id: string) => Promise<boolean>
  likePost: (postId: string, userId: string) => Promise<void>
  unlikePost: (postId: string, userId: string) => Promise<void>
  createComment: (form: CreateCommentForm) => Promise<Comment | null>
  deleteComment: (id: string) => Promise<boolean>
  reportPost: (postId: string, reason: string, reporterId: string) => Promise<void>
  reportComment: (commentId: string, reason: string, reporterId: string) => Promise<void>
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const posts = await localDb.getPosts()
      // Sort by createdAt descending (newest first)
      const sortedPosts = posts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      set({ posts: sortedPosts, loading: false })
    } catch (err) {
      set({ error: 'Failed to fetch posts', loading: false })
      showError('Failed to fetch posts')
    }
  },

  createPost: async (form: CreatePostForm) => {
    try {
      const user = get().posts.find((p) => p.authorId === 'current-user')?.authorId || 'user_001'
      
      const newPost: Post = {
        id: nanoid(),
        title: form.title,
        content: form.content,
        authorId: user,
        authorName: 'Current User',
        authorPhoto: '',
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reported: false,
        likes: [],
        ...(form.image && { imageUrl: URL.createObjectURL(form.image) }),
      }

      await localDb.createPost(newPost)
      set((state) => ({ posts: [newPost, ...state.posts] }))
      return newPost
    } catch (err) {
      showError('Failed to create post')
      return null
    }
  },

  updatePost: async (id: string, updates: Partial<Post>) => {
    try {
      const updatedPost = await localDb.updatePost(id, updates)
      if (updatedPost) {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
        }))
        return updatedPost
      }
      return null
    } catch (err) {
      showError('Failed to update post')
      return null
    }
  },

  deletePost: async (id: string) => {
    try {
      const success = await localDb.deletePost(id)
      if (success) {
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }))
      }
      return success
    } catch (err) {
      showError('Failed to delete post')
      return false
    }
  },

  likePost: async (postId: string, userId: string) => {
    try {
      const post = get().posts.find((p) => p.id === postId)
      if (!post) return

      const hasLiked = post.likes.includes(userId)
      if (hasLiked) return // Already liked

      const updatedPost = {
        ...post,
        likes: [...post.likes, userId],
        likeCount: post.likeCount + 1,
      }

      await localDb.updatePost(postId, updatedPost)
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
      }))
    } catch (err) {
      showError('Failed to like post')
    }
  },

  unlikePost: async (postId: string, userId: string) => {
    try {
      const post = get().posts.find((p) => p.id === postId)
      if (!post) return

      const updatedPost = {
        ...post,
        likes: post.likes.filter((id) => id !== userId),
        likeCount: post.likeCount - 1,
      }

      await localDb.updatePost(postId, updatedPost)
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
      }))
    } catch (err) {
      showError('Failed to unlike post')
    }
  },

  createComment: async (form: CreateCommentForm) => {
    try {
      const user = 'user_001'
      const newComment: Comment = {
        id: nanoid(),
        postId: form.postId,
        content: form.content,
        authorId: user,
        authorName: 'Current User',
        authorPhoto: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reported: false,
        replies: [],
        ...(form.parentId && { parentId: form.parentId }),
      }

      await localDb.createComment(newComment)
      
      // Update post comment count
      const post = get().posts.find((p) => p.id === form.postId)
      if (post) {
        await localDb.updatePost(form.postId, {
          commentCount: post.commentCount + 1,
        })
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === form.postId ? { ...p, commentCount: p.commentCount + 1 } : p
          ),
        }))
      }

      return newComment
    } catch (err) {
      showError('Failed to create comment')
      return null
    }
  },

  deleteComment: async (id: string) => {
    try {
      const success = await localDb.deleteComment(id)
      if (success) {
        // Find and update post comment count
        const comments = await localDb.getComments('dummy')
        const comment = comments.find((c) => c.id === id)
        if (comment) {
          const post = get().posts.find((p) => p.id === comment.postId)
          if (post) {
            await localDb.updatePost(comment.postId, {
              commentCount: Math.max(0, post.commentCount - 1),
            })
            set((state) => ({
              posts: state.posts.map((p) =>
                p.id === comment.postId
                  ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
                  : p
              ),
            }))
          }
        }
      }
      return success
    } catch (err) {
      showError('Failed to delete comment')
      return false
    }
  },

  reportPost: async (postId: string, reason: string, reporterId: string) => {
    try {
      await localDb.createReport({
        id: nanoid(),
        type: 'post',
        targetId: postId,
        reporterId,
        reason,
        createdAt: new Date().toISOString(),
        resolved: false,
      })
      
      // Mark post as reported
      await localDb.updatePost(postId, { reported: true })
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, reported: true } : p
        ),
      }))
    } catch (err) {
      showError('Failed to report post')
    }
  },

  reportComment: async (commentId: string, reason: string, reporterId: string) => {
    try {
      await localDb.createReport({
        id: nanoid(),
        type: 'comment',
        targetId: commentId,
        reporterId,
        reason,
        createdAt: new Date().toISOString(),
        resolved: false,
      })
    } catch (err) {
      showError('Failed to report comment')
    }
  },
}))

export const usePosts = () => {
  const state = usePostsStore()
  return state
}

export default usePosts
