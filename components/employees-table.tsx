"use client"

import { useState, useEffect } from "react"
import { getAllEmployees, deleteEmployee } from "@/lib/employee-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Eye } from "lucide-react"
import { AddEmployeeModal } from "./add-employee-modal"
import { EditEmployeeModal } from "./edit-employee-modal"
import { useToast } from "@/hooks/use-toast"

const statusConfig = {
  ok: { label: "Em Dia", className: "bg-success/10 text-success border-success/20" },
  warning: { label: "Próximos 30d", className: "bg-warning/10 text-warning border-warning/20" },
  expired: { label: "Vencido", className: "bg-danger/10 text-danger border-danger/20" },
}

export function EmployeesTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "warning" | "expired">("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [employees, setEmployees] = useState(getAllEmployees())
  const { toast } = useToast()

  useEffect(() => {
    setEmployees(getAllEmployees())
  }, [addModalOpen, editModalOpen])

  const filtered = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.cpf.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter
    const matchesDept = departmentFilter === "all" || emp.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDept
  })

  const departments = [...new Set(employees.map((e) => e.department))]

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar ${name}?`)) {
      if (deleteEmployee(id)) {
        toast({
          title: "Sucesso!",
          description: `Funcionário ${name} removido com sucesso`,
        })
        setEmployees(getAllEmployees())
      }
    }
  }

  const handleEdit = (id: string) => {
    setSelectedEmployeeId(id)
    setEditModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Buscar por Nome ou CPF</label>
              <Input placeholder="João Silva..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
              >
                <option value="all">Todos</option>
                <option value="ok">Em Dia</option>
                <option value="warning">Próximos 30d</option>
                <option value="expired">Vencido</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Departamento</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
              >
                <option value="all">Todos</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setAddModalOpen(true)}>
                Adicionar Funcionário
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">CPF</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Cargo</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Departamento</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Último ASO</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Próximo ASO</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{emp.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{emp.cpf}</td>
                    <td className="py-3 px-4">{emp.cargo}</td>
                    <td className="py-3 px-4">{emp.department}</td>
                    <td className="py-3 px-4 text-xs">{new Date(emp.lastAsoDate).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-4 text-xs">{new Date(emp.nextAsoDate).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={statusConfig[emp.status].className}>
                        {statusConfig[emp.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(emp.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id, emp.name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum funcionário encontrado com os filtros aplicados.
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Mostrando {filtered.length} de {employees.length} funcionários
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddEmployeeModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <EditEmployeeModal open={editModalOpen} onOpenChange={setEditModalOpen} employeeId={selectedEmployeeId} />
    </>
  )
}
