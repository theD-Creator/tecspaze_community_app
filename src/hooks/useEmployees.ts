import { create } from 'zustand'
import { Employee, EmployeeRating } from '../types'
import rawEmployeesData from '../data/employees.json'
import { localDb } from '../services/database'

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
        
        // Load actual ratings from database
        for (const employee of employees) {
          const ratings = await localDb.getRatings(employee.id)
          employee.ratings = ratings
          
          // Recalculate average rating
          if (ratings.length > 0) {
            const total = ratings.reduce((sum, r) => sum + r.value, 0)
            employee.averageRating = total / ratings.length
            employee.ratingCount = ratings.length
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
        await localDb.createRating(rating)
        
        // Update employee ratings
        const employee = get().employees.find((e) => e.id === employeeId)
        if (employee) {
          const ratings = await localDb.getRatings(employeeId)
          const total = ratings.reduce((sum, r) => sum + r.value, 0)
          const newRating = {
            ...employee,
            ratings,
            averageRating: total / ratings.length,
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
