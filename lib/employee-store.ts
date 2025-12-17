const employees: Employee[] = [
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

function getStatus(nextDate: string): "ok" | "warning" | "expired" {
  const today = new Date()
  const next = new Date(nextDate)
  const daysUntil = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) return "expired"
  if (daysUntil <= 30) return "warning"
  return "ok"
}

export function getAllEmployees(): Employee[] {
  // Remove a reatribuição de status para evitar conflitos de tipo
  return [...employees]
}

export function addEmployee(employee: Omit<Employee, "id" | "status">): Employee {
  const newEmployee: Employee = {
    ...employee,
    id: String(Date.now()),
    status: getStatus(employee.nextAsoDate),
  }
  employees.push(newEmployee)
  return newEmployee
}

export function updateEmployee(id: string, employee: Omit<Employee, "id" | "status">): Employee | null {
  const index = employees.findIndex((e) => e.id === id)
  if (index === -1) return null

  const updated: Employee = {
    ...employee,
    id,
    status: getStatus(employee.nextAsoDate),
  }
  employees[index] = updated
  return updated
}

export function deleteEmployee(id: string): boolean {
  const index = employees.findIndex((e) => e.id === id)
  if (index === -1) return false

  employees.splice(index, 1)
  return true
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((emp) => emp.id === id)
}