"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  getConfig,
  updateCompanyInfo,
  addDepartment,
  removeDepartment,
  updateDefaultPeriodicity,
  subscribeToConfigChanges,
} from "@/lib/config-store"
import { X, LogOut } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [config, setConfig] = useState(getConfig())
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    responsible: "",
    email: "",
    phone: "",
  })
  const [newDepartment, setNewDepartment] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const currentConfig = getConfig()
    setConfig(currentConfig)
    setFormData({
      name: currentConfig.name,
      cnpj: currentConfig.cnpj,
      responsible: currentConfig.responsible,
      email: currentConfig.email,
      phone: currentConfig.phone,
    })

    const unsubscribe = subscribeToConfigChanges(() => {
      const updated = getConfig()
      setConfig(updated)
    })
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleSaveCompanyInfo = async () => {
    if (!formData.name || !formData.cnpj || !formData.responsible) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    updateCompanyInfo({
      name: formData.name,
      cnpj: formData.cnpj,
      responsible: formData.responsible,
      email: formData.email,
      phone: formData.phone,
    })

    setIsSaving(false)
    toast({
      title: "Sucesso!",
      description: "Informações da empresa atualizadas",
    })
  }

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do departamento",
        variant: "destructive",
      })
      return
    }

    if (config.departments.includes(newDepartment)) {
      toast({
        title: "Erro",
        description: "Este departamento já existe",
        variant: "destructive",
      })
      return
    }

    addDepartment(newDepartment)
    setNewDepartment("")
    toast({
      title: "Sucesso!",
      description: `Departamento ${newDepartment} adicionado`,
    })
  }

  const handleRemoveDepartment = (dept: string) => {
    removeDepartment(dept)
    setConfig(getConfig())
    toast({
      title: "Sucesso!",
      description: `Departamento ${dept} removido`,
    })
  }

  const handleSavePeriodicity = (periodicity: "annual" | "biannual") => {
    updateDefaultPeriodicity(periodicity)
    setConfig(getConfig())
    toast({
      title: "Sucesso!",
      description: "Periodicidade atualizada",
    })
  }

  const handleLogout = () => {
    // Limpa qualquer estado de autenticação no localStorage
    localStorage.removeItem("auth-storage")
    localStorage.removeItem("isAuthenticated")
    sessionStorage.removeItem("auth-storage")
    sessionStorage.removeItem("isAuthenticated")
    
    // Redireciona para a página de login
    router.push("/login")
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie as configurações da empresa e do sistema</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Nome da Empresa</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: TechCorp Brasil"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">CNPJ</label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Responsável</label>
                <Input
                  value={formData.responsible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, responsible: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 0000-0000"
                  />
                </div>
              </div>
              <Button onClick={handleSaveCompanyInfo} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle>Departamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {config.departments.map((dept) => (
                  <Badge key={dept} variant="secondary" className="flex items-center gap-2 px-3 py-2">
                    {dept}
                    <button 
                      onClick={() => handleRemoveDepartment(dept)} 
                      className="ml-2 hover:text-danger transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddDepartment()}
                  placeholder="Nome do novo departamento"
                />
                <Button onClick={handleAddDepartment} variant="outline">
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Default Periodicity */}
          <Card>
            <CardHeader>
              <CardTitle>Periodicidade Padrão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecione a periodicidade padrão para novos ASOs</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodicity"
                      value="annual"
                      checked={config.defaultPeriodicity === "annual"}
                      onChange={() => handleSavePeriodicity("annual")}
                    />
                    <span className="text-sm font-medium">Anual (12 meses)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodicity"
                      value="biannual"
                      checked={config.defaultPeriodicity === "biannual"}
                      onChange={() => handleSavePeriodicity("biannual")}
                    />
                    <span className="text-sm font-medium">Semestral (6 meses)</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sair da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Sair da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Encerrar sua sessão atual na plataforma
                </p>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}