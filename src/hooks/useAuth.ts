import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'
import { supabase } from '../services/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string }>
}

// Convert Supabase user to our User type
const convertSupabaseUser = (user: any): User => ({
  id: user.id,
  email: user.email || '',
  displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
  photo: user.user_metadata?.avatar_url || null,
  bio: user.user_metadata?.bio || null,
  createdAt: user.created_at || new Date().toISOString(),
  lastLoginAt: user.last_sign_in_at || new Date().toISOString(),
  role: 'user',
  badges: [],
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,

      checkAuth: async () => {
        set({ loading: true, error: null })
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error) {
            set({ user: null, loading: false })
            return
          }

          if (user) {
            const profile = await getUserProfile(user.id)
            set({ user: profile || convertSupabaseUser(user), loading: false })
          } else {
            set({ user: null, loading: false })
          }
        } catch (err) {
          set({ error: 'Failed to check authentication', loading: false })
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            const profile = await getUserProfile(data.user.id)
            set({ user: profile || convertSupabaseUser(data.user), loading: false })
            return {}
          }

          return { error: 'Authentication failed' }
        } catch (err) {
          set({ error: 'Authentication failed', loading: false })
          return { error: 'Authentication failed' }
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
              },
            },
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            // Create profile in database
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: data.user.id,
                email,
                display_name: displayName,
                created_at: new Date().toISOString(),
              }])

            if (profileError) {
              console.error('Failed to create profile:', profileError)
            }

            set({ user: convertSupabaseUser(data.user), loading: false })
            return {}
          }

          return { error: 'Registration failed' }
        } catch (err) {
          set({ error: 'Registration failed', loading: false })
          return { error: 'Registration failed' }
        }
      },

      signOut: async () => {
        set({ loading: true })
        try {
          const { error } = await supabase.auth.signOut()
          if (!error) {
            set({ user: null, loading: false })
          }
        } catch (err) {
          set({ error: 'Failed to sign out', loading: false })
        }
      },

      signInWithOAuth: async (provider: 'google' | 'github') => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          })

          if (error) {
            return { error: error.message }
          }

          return {}
        } catch (err) {
          set({ error: 'OAuth sign in failed', loading: false })
          return { error: 'OAuth sign in failed' }
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email)
          if (error) {
            return { error: error.message }
          }
          return {}
        } catch (err) {
          return { error: 'Failed to reset password' }
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get()
        if (!user) {
          return { error: 'No user authenticated' }
        }

        try {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

          if (error) {
            return { error: error.message }
          }

          set({ user: { ...user, ...updates } })
          return {}
        } catch (err) {
          return { error: 'Failed to update profile' }
        }
      },

      uploadAvatar: async (file: File) => {
        const { user } = get()
        if (!user) {
          return { error: 'No user authenticated' }
        }

        try {
          // Generate unique filename
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`

          // Upload to storage
          const { error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(fileName, file)

          if (uploadError) {
            return { error: uploadError.message }
          }

          // Get public URL
          const { data: urlData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(fileName)

          if (!urlData.publicUrl) {
            return { error: 'Failed to get avatar URL' }
          }

          // Update user metadata
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: urlData.publicUrl,
            },
          })

          if (updateError) {
            console.error('Failed to update user metadata:', updateError)
          }

          // Update profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ photo: urlData.publicUrl })
            .eq('id', user.id)

          if (profileError) {
            console.error('Failed to update profile:', profileError)
          }

          set({ user: { ...user, photo: urlData.publicUrl } })
          return { url: urlData.publicUrl }
        } catch (err) {
          return { error: 'Failed to upload avatar' }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)

// Helper function to get user profile from database
const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name || data.email.split('@')[0],
      photo: data.photo || null,
      bio: data.bio || null,
      createdAt: data.created_at || new Date().toISOString(),
      lastLoginAt: data.last_login_at || new Date().toISOString(),
      role: data.role as 'user' | 'moderator' | 'admin' || 'user',
      badges: data.badges || [],
    }
  } catch (err) {
    return null
  }
}

export const useAuth = () => {
  const state = useAuthStore()
  return state
}

export default useAuth
