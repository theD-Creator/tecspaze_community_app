import React from 'react'
import { EmployeeCard } from './EmployeeCard'
import { Employee } from '../../types'

interface EmployeeGridProps {
  employees: Employee[]
  onRate?: (employee: Employee) => void
  onEmployeeClick?: (employee: Employee) => void
  compact?: boolean
}

export const EmployeeGrid: React.FC<EmployeeGridProps> = ({
  employees,
  onRate,
  onEmployeeClick,
  compact = false,
}) => {
  return (
    <div className="employee-grid">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onRate={onRate}
          onClick={() => onEmployeeClick?.(employee)}
          showRating
          compact={compact}
        />
      ))}
    </div>
  )
}

export default EmployeeGrid
