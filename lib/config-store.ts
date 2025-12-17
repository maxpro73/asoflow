"use client"

export interface CompanyConfig {
  name: string
  cnpj: string
  responsible: string
  email: string
  phone: string
  departments: string[]
  defaultPeriodicity: "annual" | "biannual"
}

let configState: CompanyConfig = {
  name: "TechCorp Brasil",
  cnpj: "12.345.678/0001-90",
  responsible: "João Silva",
  email: "contato@techcorp.com.br",
  phone: "(11) 3000-0000",
  departments: ["Logística", "RH", "TI", "Qualidade"],
  defaultPeriodicity: "annual",
}

const listeners: Set<() => void> = new Set()

export function subscribeToConfigChanges(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notifyListeners() {
  listeners.forEach((callback) => callback())
}

export function getConfig(): CompanyConfig {
  return { ...configState }
}

export function updateCompanyInfo(updates: Partial<Omit<CompanyConfig, "departments" | "defaultPeriodicity">>) {
  configState = { ...configState, ...updates }
  notifyListeners()
}

export function addDepartment(dept: string) {
  if (!configState.departments.includes(dept)) {
    configState.departments.push(dept)
    notifyListeners()
  }
}

export function removeDepartment(dept: string) {
  configState.departments = configState.departments.filter((d) => d !== dept)
  notifyListeners()
}

export function updateDefaultPeriodicity(periodicity: "annual" | "biannual") {
  configState.defaultPeriodicity = periodicity
  notifyListeners()
}
