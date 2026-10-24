import { create } from 'zustand'
import { EmployeeRating, CreateRatingForm, Employee } from '../types'
import { localDb } from '../services/database'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { nanoid } from 'nanoid'
import { showError } from './useNotification'
import { useAuthStore } from './useAuth'
import rawEmployeesData from '../data/employees.json'

interface RatingsState {
  ratings: EmployeeRating[]
  loading: boolean
  error: string | null
  fetchRatings: (employeeId?: string) => Promise<void>
  createRating: (form: CreateRatingForm) => Promise<EmployeeRating | null>
  updateRating: (id: string, updates: Partial<EmployeeRating>) => Promise<EmployeeRating | null>
  deleteRating: (id: string) => Promise<boolean>
  reportRating: (ratingId: string, reason: string, reporterId: string) => Promise<void>
  getEmployeeRatings: (employeeId: string) => EmployeeRating[]
  getUserRating: (employeeId: string, userId: string) => EmployeeRating | null
  getEmployees: () => Employee[]
}

// Type for employees from JSON
interface EmployeesData {
  employees: Record<string, any>
  categories: Record<string, any>
  awards: Record<string, any>
}

// ============ Supabase-Mapping (snake_case DB → camelCase App) ============
export interface RatingRow {
  id: string
  employee_id: string
  user_id: string
  category: string
  value: number
  comment: string | null
  reported: boolean
  created_at: string
}

export const mapRating = (row: RatingRow): EmployeeRating => ({
  id: row.id,
  employeeId: row.employee_id,
  userId: row.user_id,
  category: row.category,
  value: row.value,
  ...(row.comment && { comment: row.comment }),
  createdAt: row.created_at,
  reported: row.reported,
})

export const useRatingsStore = create<RatingsState>((set, get) => {
  const employeesData: EmployeesData = rawEmployeesData as any

  return {
    ratings: [],
    loading: false,
    error: null,

    fetchRatings: async (employeeId?: string) => {
      set({ loading: true, error: null })

      // Remote-First: eine einzige Query für alle (oder einen) Mitarbeiter
      if (isSupabaseConfigured) {
        try {
          let query = supabase
            .from('employee_ratings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500)
          if (employeeId) {
            query = query.eq('employee_id', employeeId)
          }
          const { data, error } = await query
          if (error) throw error

          const mapped = ((data ?? []) as unknown as RatingRow[]).map(mapRating)
          if (employeeId) {
            // Nur den Slice des Mitarbeiters ersetzen, Rest behalten
            set((state) => ({
              ratings: [
                ...state.ratings.filter((r) => r.employeeId !== employeeId),
                ...mapped,
              ],
              loading: false,
            }))
          } else {
            set({ ratings: mapped, loading: false })
          }
          return
        } catch (err) {
          console.warn('[useRatings] Supabase-Fetch fehlgeschlagen – Fallback auf IndexedDB', err)
        }
      }

      // Offline-Fallback: IndexedDB
      try {
        let ratings: EmployeeRating[]
        if (employeeId) {
          ratings = await localDb.getRatings(employeeId)
        } else {
          // Get all ratings
          const employees = Object.keys(employeesData.employees)
          const allRatings: EmployeeRating[] = []
          for (const empId of employees) {
            const empRatings = await localDb.getRatings(empId)
            allRatings.push(...empRatings)
          }
          ratings = allRatings
        }
        set({ ratings, loading: false })
      } catch (err) {
        set({ error: 'Failed to fetch ratings', loading: false })
        showError('Failed to fetch ratings')
      }
    },

    createRating: async (form: CreateRatingForm) => {
      const user = useAuthStore.getState().user

      // Remote-First: echtes auth-User-ID statt Test-User
      if (isSupabaseConfigured && user) {
        try {
          const { data, error } = await supabase
            .from('employee_ratings')
            .insert({
              employee_id: form.employeeId,
              user_id: user.id,
              category: form.category,
              value: form.value,
              ...(form.comment && { comment: form.comment }),
            })
            .select('id, created_at')
            .single()
          if (error) throw error

          const newRating: EmployeeRating = {
            id: data.id,
            employeeId: form.employeeId,
            userId: user.id,
            category: form.category,
            value: form.value,
            ...(form.comment && { comment: form.comment }),
            createdAt: data.created_at,
            reported: false,
          }
          set((state) => ({ ratings: [...state.ratings, newRating] }))
          return newRating
        } catch (err) {
          console.error('Failed to create rating:', err)
          showError('Failed to create rating')
          return null
        }
      }

      // Offline / Gast: IndexedDB
      try {
        const userId = user?.id || 'user_001'
        const now = new Date().toISOString()
        const newRating: EmployeeRating = {
          id: nanoid(),
          employeeId: form.employeeId,
          userId,
          category: form.category,
          value: form.value,
          ...(form.comment && { comment: form.comment }),
          createdAt: now,
          reported: false,
        }

        await localDb.createRating(newRating)
        set((state) => ({ ratings: [...state.ratings, newRating] }))
        return newRating
      } catch (err) {
        showError('Failed to create rating')
        return null
      }
    },

    updateRating: async (id: string, updates: Partial<EmployeeRating>) => {
      const user = useAuthStore.getState().user

      // Remote-First (RLS erlaubt nur eigene Ratings)
      if (isSupabaseConfigured && user) {
        try {
          const dbUpdates: Record<string, unknown> = {}
          if (updates.category !== undefined) dbUpdates.category = updates.category
          if (updates.value !== undefined) dbUpdates.value = updates.value
          if (updates.comment !== undefined) dbUpdates.comment = updates.comment
          const { error } = await supabase
            .from('employee_ratings')
            .update(dbUpdates)
            .eq('id', id)
          if (error) throw error
        } catch (err) {
          console.error('Failed to update rating:', err)
          showError('Failed to update rating')
          return null
        }
      }

      try {
        const updatedRating = await localDb.updateRating(id, updates)
        const merged =
          updatedRating ||
          (() => {
            const existing = get().ratings.find((r) => r.id === id)
            return existing ? { ...existing, ...updates } : null
          })()
        if (merged) {
          set((state) => ({
            ratings: state.ratings.map((r) => (r.id === id ? merged : r)),
          }))
          return merged
        }
        return null
      } catch (err) {
        showError('Failed to update rating')
        return null
      }
    },

    deleteRating: async (id: string) => {
      const user = useAuthStore.getState().user

      // Remote-First (RLS erlaubt nur eigene Ratings)
      if (isSupabaseConfigured && user) {
        try {
          const { error } = await supabase
            .from('employee_ratings')
            .delete()
            .eq('id', id)
          if (error) throw error
          set((state) => ({ ratings: state.ratings.filter((r) => r.id !== id) }))
          return true
        } catch (err) {
          console.error('Failed to delete rating:', err)
          showError('Failed to delete rating')
          return false
        }
      }

      // Offline / Gast: IndexedDB
      try {
        const success = await localDb.deleteRating(id)
        if (success) {
          set((state) => ({ ratings: state.ratings.filter((r) => r.id !== id) }))
        }
        return success
      } catch (err) {
        showError('Failed to delete rating')
        return false
      }
    },

    reportRating: async (ratingId: string, reason: string, _reporterId: string) => {
      const user = useAuthStore.getState().user

      // Remote-First: Meldung in reports (Trigger setzt employee_ratings.reported)
      if (isSupabaseConfigured && user) {
        try {
          const { error } = await supabase
            .from('reports')
            .insert({ type: 'rating', target_id: ratingId, reporter_id: user.id, reason })
          if (error) throw error
        } catch (err) {
          console.error('Failed to report rating:', err)
          showError('Failed to report rating')
        }
        return
      }

      // Offline / Gast: IndexedDB
      try {
        await localDb.createReport({
          id: nanoid(),
          type: 'rating',
          targetId: ratingId,
          reporterId: _reporterId,
          reason,
          createdAt: new Date().toISOString(),
          resolved: false,
        })
      } catch (err) {
        showError('Failed to report rating')
      }
    },

    getEmployeeRatings: (employeeId: string) => {
      return get().ratings.filter((r) => r.employeeId === employeeId)
    },

    getUserRating: (employeeId: string, userId: string) => {
      const ratings = get().ratings
      return ratings.find((r) => r.employeeId === employeeId && r.userId === userId) || null
    },

    getEmployees: () => {
      const employees: Employee[] = []

      Object.entries(employeesData.employees).forEach(([id, emp]) => {
        employees.push({
          id,
          name: emp.name,
          photo: `/${emp.photo}`,
          description: emp.description,
          category: emp.category,
          averageRating: emp.averageRating,
          ratingCount: emp.ratingCount,
          ratings: [],
        })
      })

      return employees
    },
  }
})

export const useRatings = () => {
  const state = useRatingsStore()
  return state
}

export default useRatings
