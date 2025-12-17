"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAlerts, getAllEmployees } from "@/lib/mock-data"
import { Bell, Mail, MessageCircle, Send, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const statusConfig = {
  sent: { label: "Enviado", className: "bg-blue-100 text-blue-800" },
  read: { label: "Lido", className: "bg-purple-100 text-purple-800" },
  responded: { label: "Respondido", className: "bg-success/20 text-success" },
}

const typeConfig = {
  warning: { label: "Aviso (30d)", icon: Bell },
  expired: { label: "Vencido", icon: AlertTriangle },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [selectedDays, setSelectedDays] = useState<number[]>([30, 15, 7])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const employees = getAllEmployees()

  const getPendingCount = () => {
    return employees.filter((emp) => emp.status === "warning" || emp.status === "expired").length
  }

  const handleSendAlerts = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const pending = getPendingCount()
    toast({
      title: "Sucesso!",
      description: `${pending} alertas foram enviados com sucesso`,
    })

    // Simulate adding new alerts
    setAlerts((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        employeeId: "4",
        employeeName: "Ana Costa",
        type: "warning" as const,
        sentDate: new Date().toISOString().split("T")[0],
        channel: "email" as const,
        status: "sent" as const,
      },
    ])

    setIsLoading(false)
  }

  const handleToggleDay = (day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
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
                <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerencie e configure alertas de vencimento de ASOs</p>
              </div>
              {getPendingCount() > 0 && (
                <Button className="bg-success hover:bg-success/90" onClick={handleSendAlerts} disabled={isLoading}>
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Enviando..." : `Enviar ${getPendingCount()} Alertas`}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configuração de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[30, 15, 7, 3].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleToggleDay(days)}
                    className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      selectedDays.includes(days)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{days} dias</p>
                        <p className="text-xs text-muted-foreground">antes do vencimento</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedDays.includes(days) ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {selectedDays.includes(days) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Channel Configuration */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Canais de Comunicação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <Mail className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <MessageCircle className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alertas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Funcionário</th>
                      <th className="text-left py-3 px-4 font-semibold">Tipo de Alerta</th>
                      <th className="text-left py-3 px-4 font-semibold">Data de Envio</th>
                      <th className="text-left py-3 px-4 font-semibold">Canal</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{alert.employeeName}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{alert.type === "warning" ? "Aviso" : "Vencido"}</Badge>
                        </td>
                        <td className="py-3 px-4">{new Date(alert.sentDate).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {alert.channel === "email" ? (
                              <>
                                <Mail className="w-4 h-4" />
                                Email
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusConfig[alert.status].className}>
                            {statusConfig[alert.status].label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {alerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nenhum alerta enviado ainda.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
