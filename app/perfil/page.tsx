"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2, Mail, Phone, MapPin, FileText, Calendar,
  Save, ArrowLeft, User, Lock, Bell, CreditCard,
  CheckCircle, XCircle, Loader2, AlertCircle,
  Edit2, Camera, Trash2, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PerfilPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Dados da empresa
  const [empresaData, setEmpresaData] = useState({
    nome: "",
    cnpj: "",
    razaoSocial: "",
    inscricaoEstadual: "",
    email: "",
    telefone: "",
    celular: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    responsavel: "",
    cargoResponsavel: "",
    emailResponsavel: "",
    logo: null
  })

  // Carregar dados ao montar
  useEffect(() => {
    carregarDadosEmpresa()
  }, [])

  const carregarDadosEmpresa = () => {
    try {
      setIsLoading(true)
      const savedData = localStorage.getItem("asoflow_empresa")
      if (savedData) {
        setEmpresaData(JSON.parse(savedData))
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setErrorMessage("Erro ao carregar dados da empresa")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      if (!empresaData.nome) {
        setErrorMessage("Nome da empresa é obrigatório")
        return
      }

      if (!empresaData.email) {
        setErrorMessage("Email é obrigatório")
        return
      }

      localStorage.setItem("asoflow_empresa", JSON.stringify(empresaData))
      setSuccessMessage("Dados salvos com sucesso!")
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      setErrorMessage("Erro ao salvar dados. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substr(0, 18)
  }

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2")
      .substr(0, 15)
  }

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .substr(0, 9)
  }

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "")
    if (cepLimpo.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setEmpresaData(prev => ({
          ...prev,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }))
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEmpresaData(prev => ({ ...prev, logo: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Perfil da Empresa</h1>
          <p className="text-muted-foreground">Gerencie as informações da sua empresa</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Mensagens */}
      {successMessage && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
          <XCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="responsavel">Responsável</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          {/* Dados Gerais */}
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Dados básicos e de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Logo */}
                <div>
                  <Label>Logo da Empresa</Label>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="relative">
                      {empresaData.logo ? (
                        <img
                          src={empresaData.logo}
                          alt="Logo"
                          className="w-24 h-24 rounded-lg object-cover border-2"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2">
                          <Building2 className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition">
                        <Camera className="w-4 h-4 text-primary-foreground" />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        Escolha uma imagem para representar sua empresa
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                      </p>
                      {empresaData.logo && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setEmpresaData(prev => ({ ...prev, logo: null }))}
                          className="mt-2"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover logo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Fantasia *</Label>
                    <Input
                      id="nome"
                      value={empresaData.nome}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={empresaData.cnpj}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input
                      id="razaoSocial"
                      value={empresaData.razaoSocial}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                      placeholder="Razão social completa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricaoEstadual"
                      value={empresaData.inscricaoEstadual}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                      placeholder="000.000.000.000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={empresaData.email}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={empresaData.telefone}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={empresaData.celular}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, celular: formatPhone(e.target.value) }))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Endereço */}
          <TabsContent value="endereco" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Localização da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={empresaData.cep}
                      onChange={(e) => {
                        const cep = formatCEP(e.target.value)
                        setEmpresaData(prev => ({ ...prev, cep }))
                        if (cep.replace(/\D/g, "").length === 8) {
                          buscarCEP(cep)
                        }
                      }}
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={empresaData.endereco}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Rua, Avenida, etc"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={empresaData.numero}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, numero: e.target.value }))}
                      placeholder="Nº"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={empresaData.complemento}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, complemento: e.target.value }))}
                      placeholder="Apartamento, sala, etc"
                    />
                  </div>

                  <div className="space-y-2 col-span-3">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={empresaData.bairro}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, bairro: e.target.value }))}
                      placeholder="Bairro"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={empresaData.cidade}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, cidade: e.target.value }))}
                      placeholder="Cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={empresaData.estado}
                      onValueChange={(value) => setEmpresaData(prev => ({ ...prev, estado: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Responsável */}
          <TabsContent value="responsavel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Responsável Legal</CardTitle>
                <CardDescription>Informações do responsável pela empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Nome Completo</Label>
                    <Input
                      id="responsavel"
                      value={empresaData.responsavel}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, responsavel: e.target.value }))}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargoResponsavel">Cargo</Label>
                    <Input
                      id="cargoResponsavel"
                      value={empresaData.cargoResponsavel}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, cargoResponsavel: e.target.value }))}
                      placeholder="Ex: Diretor, Gerente, etc"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="emailResponsavel">Email do Responsável</Label>
                    <Input
                      id="emailResponsavel"
                      type="email"
                      value={empresaData.emailResponsavel}
                      onChange={(e) => setEmpresaData(prev => ({ ...prev, emailResponsavel: e.target.value }))}
                      placeholder="responsavel@empresa.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configurações de segurança da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Alert>
                    <Lock className="w-4 h-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Alterar Senha</div>
                      <p className="text-sm mb-3">Mantenha sua conta segura alterando sua senha regularmente</p>
                      <Button variant="outline" size="sm">Alterar Senha</Button>
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Autenticação em Dois Fatores</div>
                      <p className="text-sm mb-3">Adicione uma camada extra de segurança à sua conta</p>
                      <Button variant="outline" size="sm">Ativar 2FA</Button>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assinatura */}
          <TabsContent value="assinatura">
            <Card>
              <CardHeader>
                <CardTitle>Plano e Assinatura</CardTitle>
                <CardDescription>Gerencie sua assinatura do ASOflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Plano Pro</h3>
                      <p className="text-sm text-muted-foreground">Assinatura ativa</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      ATIVO
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Valor Mensal</p>
                      <p className="text-2xl font-bold">R$ 79,90</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Próxima Cobrança</p>
                      <p className="text-lg font-semibold">15/01/2025</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">Alterar Plano</Button>
                    <Button variant="outline">Ver Faturas</Button>
                  </div>
                </div>

                {/* Histórico */}
                <div>
                  <h3 className="font-semibold mb-4">Histórico de Pagamentos</h3>
                  <div className="space-y-3">
                    {[
                      { data: "15/12/2024", valor: "R$ 79,90", status: "Pago" },
                      { data: "15/11/2024", valor: "R$ 79,90", status: "Pago" },
                      { data: "15/10/2024", valor: "R$ 79,90", status: "Pago" }
                    ].map((pagamento, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{pagamento.valor}</p>
                            <p className="text-sm text-muted-foreground">{pagamento.data}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">{pagamento.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}