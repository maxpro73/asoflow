// Mock data for the ASO management system
export interface Employee {
  id: string
  name: string
  cpf: string
  cargo: string
  department: string
  lastAsoDate: string
  nextAsoDate: string
  periodicity: "annual" | "biannual"
  status: "ok" | "warning" | "expired"
}

export interface Alert {
  id: string
  employeeId: string
  employeeName: string
  type: "warning" | "expired"
  sentDate: string
  channel: "email" | "whatsapp"
  status: "sent" | "read" | "responded"
}

export interface CompanyConfig {
  name: string
  cnpj: string
  responsible: string
  defaultPeriodicity: "annual" | "biannual"
  departments: string[]
}

// Helper function to calculate status
function getStatus(nextDate: string): "ok" | "warning" | "expired" {
  const today = new Date()
  const next = new Date(nextDate)
  const daysUntil = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) return "expired"
  if (daysUntil <= 30) return "warning"
  return "ok"
}

// Generate mock employees
const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "João Silva",
    cpf: "123.456.789-00",
    cargo: "Operador",
    department: "Produção",
    lastAsoDate: "2024-06-15",
    nextAsoDate: "2025-06-15",
    periodicity: "annual",
    status: "ok",
  },
  {
    id: "2",
    name: "Maria Santos",
    cpf: "234.567.890-11",
    cargo: "Supervisor",
    department: "Produção",
    lastAsoDate: "2024-09-10",
    nextAsoDate: "2025-09-10",
    periodicity: "annual",
    status: "ok",
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    cpf: "345.678.901-22",
    cargo: "Analista",
    department: "TI",
    lastAsoDate: "2024-11-01",
    nextAsoDate: "2025-11-01",
    periodicity: "annual",
    status: "ok",
  },
  {
    id: "4",
    name: "Ana Costa",
    cpf: "456.789.012-33",
    cargo: "Gerente",
    department: "Administrativo",
    lastAsoDate: "2024-10-20",
    nextAsoDate: "2024-12-15",
    periodicity: "biannual",
    status: "warning",
  },
  {
    id: "5",
    name: "Pedro Gomes",
    cpf: "567.890.123-44",
    cargo: "Operador",
    department: "Logística",
    lastAsoDate: "2024-08-05",
    nextAsoDate: "2024-11-20",
    periodicity: "biannual",
    status: "expired",
  },
  {
    id: "6",
    name: "Lucia Ferreira",
    cpf: "678.901.234-55",
    cargo: "Técnico",
    department: "Qualidade",
    lastAsoDate: "2024-07-12",
    nextAsoDate: "2025-01-12",
    periodicity: "biannual",
    status: "ok",
  },
  {
    id: "7",
    name: "Roberto Alves",
    cpf: "789.012.345-66",
    cargo: "Operador",
    department: "Produção",
    lastAsoDate: "2024-09-03",
    nextAsoDate: "2024-11-25",
    periodicity: "biannual",
    status: "expired",
  },
  {
    id: "8",
    name: "Beatriz Martins",
    cpf: "890.123.456-77",
    cargo: "Analista",
    department: "TI",
    lastAsoDate: "2024-10-15",
    nextAsoDate: "2024-12-10",
    periodicity: "biannual",
    status: "warning",
  },
  {
    id: "9",
    name: "Fernando Rocha",
    cpf: "901.234.567-88",
    cargo: "Supervisor",
    department: "Logística",
    lastAsoDate: "2024-06-01",
    nextAsoDate: "2025-06-01",
    periodicity: "annual",
    status: "ok",
  },
  {
    id: "10",
    name: "Isabela Mendes",
    cpf: "012.345.678-99",
    cargo: "Gerente",
    department: "Qualidade",
    lastAsoDate: "2024-05-20",
    nextAsoDate: "2024-11-18",
    periodicity: "biannual",
    status: "expired",
  },
]

export const mockAlerts: Alert[] = [
  {
    id: "1",
    employeeId: "4",
    employeeName: "Ana Costa",
    type: "warning",
    sentDate: "2024-11-15",
    channel: "email",
    status: "sent",
  },
  {
    id: "2",
    employeeId: "5",
    employeeName: "Pedro Gomes",
    type: "expired",
    sentDate: "2024-11-22",
    channel: "email",
    status: "read",
  },
]

export const companyConfig: CompanyConfig = {
  name: "ASOflow",
  cnpj: "12.345.678/0001-90",
  responsible: "RH Department",
  defaultPeriodicity: "annual",
  departments: ["Produção", "Logística", "Administrativo", "TI", "Qualidade"],
}

export function getAllEmployees(): Employee[] {
  return mockEmployees.map((emp) => ({
    ...emp,
    status: getStatus(emp.nextAsoDate),
  }))
}

export function getEmployeeById(id: string): Employee | undefined {
  return getAllEmployees().find((emp) => emp.id === id)
}

export function getEmployeesByStatus(status: "ok" | "warning" | "expired"): Employee[] {
  return getAllEmployees().filter((emp) => getStatus(emp.nextAsoDate) === status)
}

export function getEmployeesByDepartment(department: string): Employee[] {
  return getAllEmployees().filter((emp) => emp.department === department)
}

export function calculateStatistics() {
  const all = getAllEmployees()
  const ok = getEmployeesByStatus("ok").length
  const warning = getEmployeesByStatus("warning").length
  const expired = getEmployeesByStatus("expired").length

  return {
    total: all.length,
    ok,
    warning,
    expired,
    okPercentage: Math.round((ok / all.length) * 100),
    warningPercentage: Math.round((warning / all.length) * 100),
    expiredPercentage: Math.round((expired / all.length) * 100),
    estimatedRisk: expired * 4000, // R$ 4.000 por ASO vencido
  }
}

export function getDepartmentStatistics() {
  const stats: { [key: string]: { total: number; ok: number; warning: number; expired: number } } = {}

  companyConfig.departments.forEach((dept) => {
    const employees = getEmployeesByDepartment(dept)
    stats[dept] = {
      total: employees.length,
      ok: employees.filter((e) => getStatus(e.nextAsoDate) === "ok").length,
      warning: employees.filter((e) => getStatus(e.nextAsoDate) === "warning").length,
      expired: employees.filter((e) => getStatus(e.nextAsoDate) === "expired").length,
    }
  })

  return stats
}
