import { create } from 'zustand'
import { Employee, EmployeeRating } from '../types'
import rawEmployeesData from '../data/employees.json'
import { localDb } from '../services/database'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { useAuthStore } from './useAuth'
import { mapRating, RatingRow } from './useRatings'

interface EmployeesState {
  employees: Employee[]
  loading: boolean
  error: string | null
  selectedEmployee: Employee | null
  fetchEmployees: () => Promise<void>
  getEmployeeById: (id: string) => Employee | null
  selectEmployee: (employee: Employee | null) => void
  rateEmployee: (employeeId: string, rating: EmployeeRating) => Promise<void>
  getRatingCategories: () => any[]
  getAwards: () => any
}

// Type for employees from JSON
interface EmployeesData {
  employees: Record<string, any>
  categories: Record<string, any>
  awards: Record<string, any>
}

export const useEmployeesStore = create<EmployeesState>((set, get) => {
  const employeesData: EmployeesData = rawEmployeesData as any

  return {
    employees: [],
    loading: false,
    error: null,
    selectedEmployee: null,

    fetchEmployees: async () => {
      set({ loading: true, error: null })
      try {
        // Convert JSON data to Employee type
        const employees: Employee[] = []
        
        Object.entries(employeesData.employees).forEach(([id, emp]) => {
          employees.push({
            id,
            name: emp.name,
            photo: `/${emp.photo}`,
            description: emp.description,
            category: emp.category,
            averageRating: emp.averageRating || 0,
            ratingCount: emp.ratingCount || 0,
            ratings: [],
          })
        })
        
        // Load ratings — Remote-First (eine Query), IndexedDB-Fallback
        try {
          const ratingsByEmployee = new Map<string, EmployeeRating[]>()
          if (isSupabaseConfigured) {
            const { data, error } = await supabase
              .from('employee_ratings')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(500)
            if (error) throw error
            const mapped = ((data ?? []) as unknown as RatingRow[]).map(mapRating)
            for (const rating of mapped) {
              ratingsByEmployee.set(rating.employeeId, [
                ...(ratingsByEmployee.get(rating.employeeId) || []),
                rating,
              ])
            }
          } else {
            for (const employee of employees) {
              ratingsByEmployee.set(employee.id, await localDb.getRatings(employee.id))
            }
          }

          for (const employee of employees) {
            const ratings = ratingsByEmployee.get(employee.id) || []
            employee.ratings = ratings

            // Recalculate average rating when the user has rated before
            if (ratings.length > 0) {
              const total = ratings.reduce((sum, r) => sum + r.value, 0)
              employee.averageRating = total / ratings.length
              employee.ratingCount = ratings.length
            }
          }
        } catch (err) {
          console.warn('[useEmployees] Supabase-Ratings fehlgeschlagen – Fallback auf IndexedDB', err)
          try {
            for (const employee of employees) {
              const ratings = await localDb.getRatings(employee.id)
              employee.ratings = ratings
              if (ratings.length > 0) {
                const total = ratings.reduce((sum, r) => sum + r.value, 0)
                employee.averageRating = total / ratings.length
                employee.ratingCount = ratings.length
              }
            }
          } catch (localErr) {
            console.warn('[useEmployees] IndexedDB-Ratings fehlgeschlagen – nutze JSON-Baseline', localErr)
          }
        }
        
        set({ employees, loading: false })
      } catch (err) {
        set({ error: 'Failed to fetch employees', loading: false })
        // Fallback to JSON data
        const employees: Employee[] = []
        Object.entries(employeesData.employees).forEach(([id, emp]) => {
          employees.push({
            id,
            name: emp.name,
            photo: `/${emp.photo}`,
            description: emp.description,
            category: emp.category,
            averageRating: emp.averageRating || 0,
            ratingCount: emp.ratingCount || 0,
            ratings: [],
          })
        })
        set({ employees, loading: false })
      }
    },

    getEmployeeById: (id: string) => {
      const employees = get().employees
      return employees.find((e) => e.id === id) || null
    },

    selectEmployee: (employee: Employee | null) => {
      set({ selectedEmployee: employee })
    },

    rateEmployee: async (employeeId: string, rating: EmployeeRating) => {
      try {
        const user = useAuthStore.getState().user

        if (isSupabaseConfigured && user) {
          const { error } = await supabase
            .from('employee_ratings')
            .insert({
              employee_id: employeeId,
              user_id: user.id,
              category: rating.category,
              value: rating.value,
              ...(rating.comment && { comment: rating.comment }),
            })
          if (error) throw error
        } else {
          await localDb.createRating(rating)
        }

        // Update employee ratings (je Quelle frisch nachrechnen)
        const employee = get().employees.find((e) => e.id === employeeId)
        if (employee) {
          let ratings: EmployeeRating[]
          if (isSupabaseConfigured && user) {
            const { data, error } = await supabase
              .from('employee_ratings')
              .select('*')
              .eq('employee_id', employeeId)
              .order('created_at', { ascending: false })
            if (error) throw error
            ratings = ((data ?? []) as unknown as RatingRow[]).map(mapRating)
          } else {
            ratings = await localDb.getRatings(employeeId)
          }

          const total = ratings.reduce((sum, r) => sum + r.value, 0)
          const newRating = {
            ...employee,
            ratings,
            averageRating: ratings.length > 0 ? total / ratings.length : 0,
            ratingCount: ratings.length,
          }

          set((state) => ({
            employees: state.employees.map((e) =>
              e.id === employeeId ? newRating : e
            ),
          }))
        }
      } catch (err) {
        console.error('Failed to rate employee:', err)
      }
    },

    getRatingCategories: () => {
      return Object.entries(employeesData.categories).map(([key, category]) => ({
        id: key,
        key,
        title: category.title,
        description: category.description,
        icon: category.icon,
        maxValue: category.maxValue,
      }))
    },

    getAwards: () => {
      return employeesData.awards
    },
  }
})

export const useEmployees = () => {
  const state = useEmployeesStore()
  return state
}

export default useEmployees
