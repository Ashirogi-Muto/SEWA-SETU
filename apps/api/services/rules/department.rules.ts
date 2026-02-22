/**
 * Department Rules - Issue Routing and Assignment
 */

export interface DepartmentMapping {
  name: string
  categories: string[]
  slaDefault: number
  contact?: string
}

export const DEPARTMENTS: Record<string, DepartmentMapping> = {
  PWD: {
    name: 'Public Works Department',
    categories: ['roads'],
    slaDefault: 48
  },
  SANITATION: {
    name: 'Municipal Corporation - Sanitation',
    categories: ['sanitation'],
    slaDefault: 24
  },
  ELECTRICITY: {
    name: 'Electricity Board',
    categories: ['electricity', 'power'],
    slaDefault: 12
  },
  WATER: {
    name: 'Water Supply Department',
    categories: ['water'],
    slaDefault: 24
  }
}

export function assignDepartment(category: string): string {
  for (const dept of Object.values(DEPARTMENTS)) {
    if (dept.categories.includes(category)) {
      return dept.name
    }
  }
  return 'General Administration'
}

export function getDepartmentSLA(department: string): number {
  const dept = Object.values(DEPARTMENTS).find(d => d.name === department)
  return dept?.slaDefault || 72
}
