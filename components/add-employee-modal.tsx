"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addEmployee } from "@/lib/employee-store"
import { useToast } from "@/hooks/use-toast"
import { getConfig } from "@/lib/config-store"

interface AddEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  cpf: string
  cargo: string
  department: string
  lastAsoDate: string
  periodicity: "annual" | "biannual"
}

interface ValidationErrors {
  [key: string]: string
}

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const config = getConfig()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    cpf: "",
    cargo: "",
    department: config.departments[0] || "Produção",
    lastAsoDate: "",
    periodicity: "annual",
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const updatedConfig = getConfig()
      setFormData((prev) => ({
        ...prev,
        department: updatedConfig.departments[0] || "Produção",
      }))
    }
  }, [open])

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, "")
    return cleaned.length === 11
  }

  const formatCPF = (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, "")
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF deve conter 11 dígitos"
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = "Cargo é obrigatório"
    }

    if (!formData.lastAsoDate) {
      newErrors.lastAsoDate = "Data do último ASO é obrigatória"
    } else {
      const selectedDate = new Date(formData.lastAsoDate)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.lastAsoDate = "Data não pode ser futura"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Erro na validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const nextAsoDate = new Date(formData.lastAsoDate)
    const monthsToAdd = formData.periodicity === "annual" ? 12 : 6
    nextAsoDate.setMonth(nextAsoDate.getMonth() + monthsToAdd)

    // CORREÇÃO APLICADA: Removida a propriedade status que causava o erro
    addEmployee({
      name: formData.name,
      cpf: formData.cpf,
      cargo: formData.cargo,
      department: formData.department,
      lastAsoDate: formData.lastAsoDate,
      nextAsoDate: nextAsoDate.toISOString().split("T")[0],
      periodicity: formData.periodicity,
    })

    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Sucesso!",
      description: `Funcionário ${formData.name} adicionado com sucesso`,
    })

    const updatedConfig = getConfig()
    setFormData({
      name: "",
      cpf: "",
      cargo: "",
      department: updatedConfig.departments[0] || "Produção",
      lastAsoDate: "",
      periodicity: "annual",
    })
    setErrors({})
    setIsLoading(false)
    onOpenChange(false)
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 11) {
      const formatted = value.length === 11 ? formatCPF(value) : value
      setFormData((prev) => ({ ...prev, cpf: formatted }))
    }
  }

  const currentConfig = getConfig()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
          <DialogDescription>Preencha os dados para adicionar um novo funcionário ao sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-2">Nome Completo</label>
              <Input
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                }}
                className={errors.name ? "border-danger" : ""}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>

            {/* CPF */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">CPF</label>
              <Input
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleCPFChange}
                className={errors.cpf ? "border-danger" : ""}
              />
              {errors.cpf && <p className="text-xs text-danger mt-1">{errors.cpf}</p>}
            </div>

            {/* Cargo */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Cargo</label>
              <Input
                placeholder="Ex: Operador"
                value={formData.cargo}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, cargo: e.target.value }))
                  if (errors.cargo) setErrors((prev) => ({ ...prev, cargo: "" }))
                }}
                className={errors.cargo ? "border-danger" : ""}
              />
              {errors.cargo && <p className="text-xs text-danger mt-1">{errors.cargo}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Departamento</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
              >
                {currentConfig.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Last ASO Date */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-2">Data do Último ASO</label>
              <Input
                type="date"
                value={formData.lastAsoDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, lastAsoDate: e.target.value }))
                  if (errors.lastAsoDate) setErrors((prev) => ({ ...prev, lastAsoDate: "" }))
                }}
                className={errors.lastAsoDate ? "border-danger" : ""}
              />
              {errors.lastAsoDate && <p className="text-xs text-danger mt-1">{errors.lastAsoDate}</p>}
            </div>

            {/* Periodicity */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-3">Periodicidade</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periodicity"
                    value="annual"
                    checked={formData.periodicity === "annual"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        periodicity: e.target.value as "annual" | "biannual",
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Anual (12 meses)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periodicity"
                    value="biannual"
                    checked={formData.periodicity === "biannual"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        periodicity: e.target.value as "annual" | "biannual",
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Semestral (6 meses)</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Funcionário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}