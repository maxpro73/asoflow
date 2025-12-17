"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, BarChart3, Calendar } from "lucide-react"
import { getDepartmentStatistics, calculateStatistics, getAllEmployees } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function ReportsPage() {
  const stats = calculateStatistics()
  const deptStats = getDepartmentStatistics()
  const employees = getAllEmployees()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExportPDF = async () => {
    setIsExporting("pdf")

    // Create PDF content
    const pdfContent = `
RELATÓRIO DE CONFORMIDADE DE ASOs
Data: ${new Date().toLocaleDateString("pt-BR")}

RESUMO GERAL
====================
Total de Funcionários: ${stats.total}
Em Dia: ${stats.ok}
Vencendo Proximamente: ${stats.warning}
Vencidos: ${stats.expired}

DETALHES POR FUNCIONÁRIO
====================
${employees
  .map(
    (emp) =>
      `${emp.name} (${emp.cpf})
Cargo: ${emp.cargo}
Departamento: ${emp.department}
Próximo ASO: ${new Date(emp.nextAsoDate).toLocaleDateString("pt-BR")}
Status: ${emp.status === "ok" ? "Em Dia" : emp.status === "warning" ? "Vencendo" : "Vencido"}
`,
  )
  .join("\n")}

COMPLIANCE POR DEPARTAMENTO
====================
${Object.entries(deptStats)
  .map(([dept, data]) => {
    const compliance = Math.round((data.ok / data.total) * 100)
    return `${dept}: ${compliance}% (${data.ok}/${data.total})`
  })
  .join("\n")}
    `

    // Create blob and download
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-aso-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    await new Promise((resolve) => setTimeout(resolve, 800))
    toast({
      title: "Sucesso!",
      description: "Relatório PDF foi gerado e baixado com sucesso",
    })
    setIsExporting(null)
  }

  const handleExportCSV = async () => {
    setIsExporting("csv")

    // Create CSV content
    const csvContent = [
      ["Nome", "CPF", "Cargo", "Departamento", "Próximo ASO", "Status"],
      ...employees.map((emp) => [
        emp.name,
        emp.cpf,
        emp.cargo,
        emp.department,
        new Date(emp.nextAsoDate).toLocaleDateString("pt-BR"),
        emp.status === "ok" ? "Em Dia" : emp.status === "warning" ? "Vencendo" : "Vencido",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dados-funcionarios-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    await new Promise((resolve) => setTimeout(resolve, 800))
    toast({
      title: "Sucesso!",
      description: "Arquivo CSV foi gerado e baixado com sucesso",
    })
    setIsExporting(null)
  }

  const handleExportAudit = async () => {
    setIsExporting("audit")

    // Create audit content with mock audit history
    const auditContent = `
RELATÓRIO DE AUDITORIA - HISTÓRICO DE ALERTAS
Data da Geração: ${new Date().toLocaleString("pt-BR")}

HISTÓRICO DE ALERTAS ENVIADOS
====================
${[
  { date: "2024-12-15", employee: "Ana Costa", type: "Aviso (30d)", channel: "Email", status: "Enviado" },
  { date: "2024-12-14", employee: "Pedro Gomes", type: "Vencido", channel: "WhatsApp", status: "Enviado" },
  { date: "2024-12-13", employee: "Roberto Alves", type: "Vencido", channel: "Email", status: "Lido" },
  { date: "2024-12-12", employee: "Beatriz Martins", type: "Aviso (30d)", channel: "Email", status: "Enviado" },
  { date: "2024-12-11", employee: "Isabela Mendes", type: "Vencido", channel: "WhatsApp", status: "Respondido" },
  { date: "2024-12-10", employee: "Maria Santos", type: "Aviso (7d)", channel: "Email", status: "Lido" },
]
  .map(
    (log) =>
      `Data: ${log.date}
Funcionário: ${log.employee}
Tipo: ${log.type}
Canal: ${log.channel}
Status: ${log.status}
---`,
  )
  .join("\n")}

RESUMO DE AUDITORIA
====================
Total de Alertas: ${Math.round(stats.warning + stats.expired)}
Alertas Enviados: ${Math.round(stats.warning + stats.expired)}
Taxa de Entrega: 100%
Período: Últimos 30 dias
    `

    // Create blob and download
    const blob = new Blob([auditContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `auditoria-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    await new Promise((resolve) => setTimeout(resolve, 800))
    toast({
      title: "Sucesso!",
      description: "Relatório de auditoria foi gerado com sucesso",
    })
    setIsExporting(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
                <p className="text-sm text-muted-foreground mt-1">Gere e exporte relatórios de compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total de Funcionários</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Em Dia</p>
                <p className="text-3xl font-bold text-success">{stats.ok}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Vencendo Proximamente</p>
                <p className="text-3xl font-bold text-warning">{stats.warning}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Vencidos</p>
                <p className="text-3xl font-bold text-danger">{stats.expired}</p>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Relatório Completo</h3>
                    <p className="text-xs text-muted-foreground">Todos os funcionários e status em PDF</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary opacity-50" />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleExportPDF}
                  disabled={isExporting === "pdf"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting === "pdf" ? "Gerando..." : "Exportar PDF"}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Dados em CSV</h3>
                    <p className="text-xs text-muted-foreground">Todos os dados em formato Excel</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary opacity-50" />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleExportCSV}
                  disabled={isExporting === "csv"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting === "csv" ? "Gerando..." : "Exportar CSV"}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Auditoria</h3>
                    <p className="text-xs text-muted-foreground">Histórico de alertas e uploads</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary opacity-50" />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleExportAudit}
                  disabled={isExporting === "audit"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting === "audit" ? "Gerando..." : "Exportar"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Department Ranking */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Departamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(deptStats)
                  .map(([dept, data]) => ({
                    dept,
                    compliance: Math.round((data.ok / data.total) * 100),
                    total: data.total,
                    ok: data.ok,
                    warning: data.warning,
                    expired: data.expired,
                  }))
                  .sort((a, b) => b.compliance - a.compliance)
                  .map((item, index) => (
                    <div
                      key={item.dept}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{item.dept}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.ok}/{item.total} em dia | {item.warning} próx. | {item.expired} vencidos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{item.compliance}%</div>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-success transition-all" style={{ width: `${item.compliance}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Evolution */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal de Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: "Novembro", compliance: 82 },
                  { month: "Dezembro", compliance: 78 },
                  { month: "Janeiro", compliance: 85 },
                  { month: "Fevereiro", compliance: 88 },
                  { month: "Março", compliance: 92 },
                  { month: "Abril", compliance: 89 },
                ].map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-24">{item.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${item.compliance}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{item.compliance}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
