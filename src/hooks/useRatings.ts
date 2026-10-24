import { create } from 'zustand'
import { EmployeeRating, CreateRatingForm, Employee } from '../types'
import { localDb } from '../services/database'
import { nanoid } from 'nanoid'
import { showError } from './useNotification'
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

export const useRatingsStore = create<RatingsState>((set, get) => {
  const employeesData: EmployeesData = rawEmployeesData as any

  return {
    ratings: [],
    loading: false,
    error: null,

    fetchRatings: async (employeeId?: string) => {
      set({ loading: true, error: null })
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
      try {
        const userId = 'user_001' // Replace with actual user ID
        
        const newRating: EmployeeRating = {
          id: nanoid(),
          employeeId: form.employeeId,
          userId,
          category: form.category,
          value: form.value,
          comment: form.comment,
          createdAt: new Date().toISOString(),
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
      try {
        const updatedRating = await localDb.updateRating(id, updates)
        if (updatedRating) {
          set((state) => ({
            ratings: state.ratings.map((r) => (r.id === id ? updatedRating : r)),
          }))
          return updatedRating
        }
        return null
      } catch (err) {
        showError('Failed to update rating')
        return null
      }
    },

    deleteRating: async (id: string) => {
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

    reportRating: async (ratingId: string, reason: string, reporterId: string) => {
      try {
        await localDb.createReport({
          id: nanoid(),
          type: 'rating',
          targetId: ratingId,
          reporterId,
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
      
      Object.entries(rawEmployeesData.employees).forEach(([id, emp]) => {
        employees.push({
          id,
          name: emp.name,
          photo: emp.photo,
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
