import { create } from 'zustand'
import { Post, Comment, CreatePostForm, CreateCommentForm } from '../types'
import { localDb } from '../services/database'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { nanoid } from 'nanoid'
import { showError } from './useNotification'
import { useAuthStore } from './useAuth'

const currentUser = () => {
  const user = useAuthStore.getState().user
  return {
    authorId: user?.id || 'anonymous',
    authorName: user?.displayName || 'Anonym',
    authorPhoto: user?.photo || '',
  }
}

interface PostsState {
  posts: Post[]
  loading: boolean
  error: string | null
  /** Geladene Kommentar-Listen je Post (postId → Comment[]) */
  commentsByPost: Record<string, Comment[]>
  commentsLoading: boolean
  fetchPosts: () => Promise<void>
  fetchComments: (postId: string) => Promise<void>
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

// ============ Supabase-Mapping (snake_case DB → camelCase App) ============
interface PostRow {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  like_count: number
  comment_count: number
  reported: boolean
  created_at: string
  updated_at: string
  profiles?: { display_name: string | null; photo: string | null; verified: boolean } | null
  post_likes?: { user_id: string }[] | null
}

interface CommentRow {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  reported: boolean
  created_at: string
  updated_at: string
  profiles?: { display_name: string | null; photo: string | null; verified: boolean } | null
}

const mapComment = (row: CommentRow): Comment => ({
  id: row.id,
  postId: row.post_id,
  content: row.content,
  authorId: row.user_id,
  authorName: row.profiles?.display_name || 'Anonym',
  authorPhoto: row.profiles?.photo || undefined,
  authorVerified: row.profiles?.verified || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  reported: row.reported,
  ...(row.parent_id && { parentId: row.parent_id }),
  replies: [],
})

const mapPost = (row: PostRow): Post => ({
  id: row.id,
  title: row.title,
  content: row.content,
  authorId: row.user_id,
  authorName: row.profiles?.display_name || 'Anonym',
  authorPhoto: row.profiles?.photo || undefined,
  authorVerified: row.profiles?.verified || undefined,
  likeCount: row.like_count,
  commentCount: row.comment_count,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  reported: row.reported,
  likes: (row.post_likes || []).map((l) => l.user_id),
  ...(row.image_url && { imageUrl: row.image_url }),
})

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  commentsByPost: {},
  commentsLoading: false,

  fetchPosts: async () => {
    set({ loading: true, error: null })
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, profiles(display_name, photo, verified), post_likes(user_id)')
          .order('created_at', { ascending: false })
          .limit(200)
        if (error) throw error
        const rows = (data ?? []) as unknown as PostRow[]
        set({ posts: rows.map(mapPost), loading: false })
        return
      } catch (err) {
        console.warn('[usePosts] Supabase-Fetch fehlgeschlagen – Fallback auf IndexedDB', err)
      }
    }
    // Offline / Gäste-Fallback: IndexedDB
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

  fetchComments: async (postId: string) => {
    set({ commentsLoading: true })
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*, profiles(display_name, photo, verified)')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          .limit(200)
        if (error) throw error
        const mapped = ((data ?? []) as unknown as CommentRow[]).map(mapComment)
        set((state) => ({
          commentsByPost: { ...state.commentsByPost, [postId]: mapped },
          commentsLoading: false,
        }))
        return
      } catch (err) {
        console.warn('[usePosts] Supabase-Comments fehlgeschlagen – Fallback auf IndexedDB', err)
      }
    }
    // Offline-Fallback: IndexedDB
    try {
      const comments = await localDb.getComments(postId)
      set((state) => ({
        commentsByPost: { ...state.commentsByPost, [postId]: comments },
        commentsLoading: false,
      }))
    } catch (err) {
      console.error('Failed to load comments:', err)
      set({ commentsLoading: false })
    }
  },

  createPost: async (form: CreatePostForm) => {
    const user = useAuthStore.getState().user

    // Remote-First: eingeloggt + Supabase konfiguriert
    if (isSupabaseConfigured && user) {
      try {
        let image_url: string | null = null
        if (form.image) {
          const ext = form.image.name.split('.').pop() || 'jpg'
          const path = `${user.id}-${Date.now()}.${ext}`
          const { error: uploadError } = await supabase
            .storage
            .from('post-images')
            .upload(path, form.image)
          if (uploadError) {
            console.error('Failed to upload post image:', uploadError)
            showError('Failed to upload post image')
          } else {
            const { data: urlData } = supabase
              .storage
              .from('post-images')
              .getPublicUrl(path)
            image_url = urlData.publicUrl
          }
        }

        const { data, error } = await supabase
          .from('posts')
          .insert({
            title: form.title,
            content: form.content,
            user_id: user.id,
            ...(image_url && { image_url }),
          })
          .select('id, created_at')
          .single()
        if (error) throw error

        const newPost: Post = {
          id: data.id,
          title: form.title,
          content: form.content,
          authorId: user.id,
          authorName: user.displayName,
          authorPhoto: user.photo,
          likeCount: 0,
          commentCount: 0,
          createdAt: data.created_at,
          updatedAt: data.created_at,
          reported: false,
          likes: [],
          ...(image_url && { imageUrl: image_url }),
        }
        set((state) => ({ posts: [newPost, ...state.posts] }))
        return newPost
      } catch (err) {
        console.error('Failed to create post:', err)
        showError('Failed to create post')
        return null
      }
    }

    // Offline / Gast: IndexedDB
    try {
      const author = currentUser()
      const now = new Date().toISOString()
      const newPost: Post = {
        id: nanoid(),
        title: form.title,
        content: form.content,
        authorId: author.authorId,
        authorName: author.authorName,
        authorPhoto: author.authorPhoto,
        likeCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
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
    const user = useAuthStore.getState().user

    // Remote-First (RLS erlaubt nur eigene Posts)
    if (isSupabaseConfigured && user) {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.content !== undefined) dbUpdates.content = updates.content
      if (updates.imageUrl !== undefined && updates.imageUrl !== null) {
        dbUpdates.image_url = updates.imageUrl
      }
      try {
        const { error } = await supabase
          .from('posts')
          .update(dbUpdates)
          .eq('id', id)
        if (error) throw error

        const existing = get().posts.find((p) => p.id === id)
        if (!existing) return null
        const updatedPost: Post = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
        }))
        return updatedPost
      } catch (err) {
        console.error('Failed to update post:', err)
        showError('Failed to update post')
        return null
      }
    }

    // Offline / Gast: IndexedDB
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
    const user = useAuthStore.getState().user

    // Remote-First (RLS erlaubt nur eigenen Posts zu löschen)
    if (isSupabaseConfigured && user) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', id)
        if (error) throw error
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }))
        return true
      } catch (err) {
        console.error('Failed to delete post:', err)
        showError('Failed to delete post')
        return false
      }
    }

    // Offline / Gast: IndexedDB
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

  likePost: async (postId: string, _userId: string) => {
    const user = useAuthStore.getState().user

    // Remote-First: Like = Zeile in post_likes (Trigger pflegt like_count)
    if (isSupabaseConfigured && user) {
      const post = get().posts.find((p) => p.id === postId)
      if (!post || post.likes.includes(user.id)) return

      try {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })
        if (error) {
          // Doppel-Like (Race) oder RLS – kein lauter Fehler nötig
          console.error('Failed to like post:', error)
          return
        }
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, likes: [...p.likes, user.id], likeCount: p.likeCount + 1 }
              : p
          ),
        }))
      } catch (err) {
        console.error('Failed to like post:', err)
      }
      return
    }

    // Offline / Gast: IndexedDB
    try {
      const post = get().posts.find((p) => p.id === postId)
      if (!post) return
      if (post.likes.includes(_userId)) return // Already liked

      const updatedPost = {
        ...post,
        likes: [...post.likes, _userId],
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

  unlikePost: async (postId: string, _userId: string) => {
    const user = useAuthStore.getState().user

    // Remote-First: Unlike = Zeile aus post_likes löschen (Trigger pflegt like_count)
    if (isSupabaseConfigured && user) {
      const post = get().posts.find((p) => p.id === postId)
      if (!post || !post.likes.includes(user.id)) return

      try {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        if (error) {
          console.error('Failed to unlike post:', error)
          return
        }
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, likes: p.likes.filter((id) => id !== user.id), likeCount: Math.max(0, p.likeCount - 1) }
              : p
          ),
        }))
      } catch (err) {
        console.error('Failed to unlike post:', err)
      }
      return
    }

    // Offline / Gast: IndexedDB
    try {
      const post = get().posts.find((p) => p.id === postId)
      if (!post) return

      const updatedPost = {
        ...post,
        likes: post.likes.filter((id) => id !== _userId),
        likeCount: Math.max(0, post.likeCount - 1),
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
    const user = useAuthStore.getState().user

    // Remote-First: Kommentar in comments (Trigger pflegt comment_count)
    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: form.postId,
            content: form.content,
            user_id: user.id,
            ...(form.parentId && { parent_id: form.parentId }),
          })
          .select('id, created_at, updated_at')
          .single()
        if (error) throw error

        const newComment: Comment = {
          id: data.id,
          postId: form.postId,
          content: form.content,
          authorId: user.id,
          authorName: user.displayName,
          authorPhoto: user.photo,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          reported: false,
          replies: [],
          ...(form.parentId && { parentId: form.parentId }),
        }

        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === form.postId ? { ...p, commentCount: p.commentCount + 1 } : p
          ),
          // Direkt in geladene Kommentar-Liste einsortieren
          commentsByPost: state.commentsByPost[form.postId]
            ? {
                ...state.commentsByPost,
                [form.postId]: [...state.commentsByPost[form.postId], newComment],
              }
            : state.commentsByPost,
        }))
        return newComment
      } catch (err) {
        console.error('Failed to create comment:', err)
        showError('Failed to create comment')
        return null
      }
    }

    // Offline / Gast: IndexedDB
    try {
      const author = currentUser()
      const now = new Date().toISOString()
      const newComment: Comment = {
        id: nanoid(),
        postId: form.postId,
        content: form.content,
        authorId: author.authorId,
        authorName: author.authorName,
        authorPhoto: author.authorPhoto,
        createdAt: now,
        updatedAt: now,
        reported: false,
        replies: [],
        ...(form.parentId && { parentId: form.parentId }),
      }

      await localDb.createComment(newComment)

      // Update post comment count
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === form.postId ? { ...p, commentCount: p.commentCount + 1 } : p
        ),
      }))

      return newComment
    } catch (err) {
      showError('Failed to create comment')
      return null
    }
  },

  deleteComment: async (id: string) => {
    const user = useAuthStore.getState().user

    // Remote-First: Rückgabe enthält post_id für den lokalen Count-Abgleich
    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .delete()
          .eq('id', id)
          .select('post_id')
        if (error) throw error

        const deletedPostId = (data as unknown as { post_id: string }[] | null)?.[0]?.post_id
        if (deletedPostId) {
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === deletedPostId
                ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
                : p
            ),
            commentsByPost: state.commentsByPost[deletedPostId]
              ? {
                  ...state.commentsByPost,
                  [deletedPostId]: state.commentsByPost[deletedPostId].filter((c) => c.id !== id),
                }
              : state.commentsByPost,
          }))
        }
        return true
      } catch (err) {
        console.error('Failed to delete comment:', err)
        showError('Failed to delete comment')
        return false
      }
    }

    // Offline / Gast: IndexedDB
    try {
      const deletedComment = await localDb.getComment(id)
      const success = await localDb.deleteComment(id)
      if (success && deletedComment) {
        // Decrement the comment count of the post the comment belonged to
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === deletedComment.postId
              ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
              : p
          ),
        }))
      }
      return success
    } catch (err) {
      showError('Failed to delete comment')
      return false
    }
  },

  reportPost: async (postId: string, reason: string, _reporterId: string) => {
    const user = useAuthStore.getState().user

    // Remote-First: Meldung in reports (Trigger setzt posts.reported)
    if (isSupabaseConfigured && user) {
      try {
        const { error } = await supabase
          .from('reports')
          .insert({ type: 'post', target_id: postId, reporter_id: user.id, reason })
        if (error) throw error

        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, reported: true } : p
          ),
        }))
      } catch (err) {
        console.error('Failed to report post:', err)
        showError('Failed to report post')
      }
      return
    }

    // Offline / Gast: IndexedDB
    try {
      await localDb.createReport({
        id: nanoid(),
        type: 'post',
        targetId: postId,
        reporterId: _reporterId,
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

  reportComment: async (commentId: string, reason: string, _reporterId: string) => {
    const user = useAuthStore.getState().user

    // Remote-First: Meldung in reports (Trigger setzt comments.reported)
    if (isSupabaseConfigured && user) {
      try {
        const { error } = await supabase
          .from('reports')
          .insert({ type: 'comment', target_id: commentId, reporter_id: user.id, reason })
        if (error) throw error
      } catch (err) {
        console.error('Failed to report comment:', err)
        showError('Failed to report comment')
      }
      return
    }

    // Offline / Gast: IndexedDB
    try {
      await localDb.createReport({
        id: nanoid(),
        type: 'comment',
        targetId: commentId,
        reporterId: _reporterId,
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
