import { useState, useEffect } from "react"
import { 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart,
  BarChart3,
  RefreshCw,
  Smartphone
} from "lucide-react"

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = require('@supabase/supabase-js').createClient(supabaseUrl, supabaseAnonKey)

interface Certificate {
  id: number
  type: string
  employeeName: string
  employeeId: string
  issueDate: string
  expiryDate: string
  status: 'Válido' | 'A Vencer' | 'Vencido' | 'Arquivado'
  companyId?: string
  createdAt?: string
  updatedAt?: string
}

interface ReportData {
  totalEmployees: number
  activeCertificates: number
  expiringCertificates: number
  expiredCertificates: number
  certificateTypes: { type: string; count: number; percentage: number }[]
  statusDistribution: { status: string; count: number; color: string }[]
  monthlyTrends: { month: string; issued: number; expiring: number }[]
}

export default function RelatoriosView() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Buscar dados do Supabase
  const fetchCertificates = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando certificados do Supabase...')
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar certificados:', error)
        return
      }

      console.log('✅ Certificados encontrados:', data?.length || 0)

      // Converter para o formato interno da aplicação
      const formattedCertificates: Certificate[] = (data || []).map((cert: any) => ({
        id: cert.id,
        type: cert.type || 'Não especificado',
        employeeName: cert.employee_name || 'Nome não informado',
        employeeId: cert.employee_id || 'ID não informado',
        issueDate: cert.issue_date || new Date().toISOString(),
        expiryDate: cert.expiry_date || new Date().toISOString(),
        status: cert.status || 'Válido',
        companyId: cert.company_id,
        createdAt: cert.created_at,
        updatedAt: cert.updated_at
      }))

      setCertificates(formattedCertificates)
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados dos employees do Supabase
  const fetchEmployees = async () => {
    try {
      console.log('🔍 Buscando employees do Supabase...')
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar employees:', error)
        return []
      }

      console.log('✅ Employees encontrados:', data?.length || 0)
      setEmployees(data || [])
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar employees:', error)
      return []
    }
  }

  // Configurar subscription em tempo real
  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      if (mounted) {
        await fetchCertificates()
        await fetchEmployees()
      }
    }

    initializeData()

    // Configurar subscription para mudanças em tempo real
    const certificatesSubscription = supabase
      .channel('certificates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificates'
        },
        (payload: any) => {
          console.log('🔄 Mudança detectada na tabela certificates:', payload.eventType)
          if (mounted) {
            fetchCertificates()
          }
        }
      )
      .subscribe()

    const employeesSubscription = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload: any) => {
          console.log('🔄 Mudança detectada na tabela employees:', payload.eventType)
          if (mounted) {
            fetchEmployees()
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      mounted = false
      certificatesSubscription.unsubscribe()
      employeesSubscription.unsubscribe()
    }
  }, [])

  // Calcular dados do relatório em tempo real baseado nos certificados
  useEffect(() => {
    console.log('📊 Calculando relatório com', certificates.length, 'certificados e', employees.length, 'employees')
    
    if (certificates.length === 0) {
      setReportData({
        totalEmployees: employees.length,
        activeCertificates: 0,
        expiringCertificates: 0,
        expiredCertificates: 0,
        certificateTypes: [],
        statusDistribution: [
          { status: "Válido", count: 0, color: "bg-green-500" },
          { status: "A Vencer", count: 0, color: "bg-orange-500" },
          { status: "Vencido", count: 0, color: "bg-red-500" },
          { status: "Arquivado", count: 0, color: "bg-slate-500" }
        ],
        monthlyTrends: generateMonthlyTrends([])
      })
      return
    }

    // Usar employees reais do Supabase
    const totalEmployees = employees.length

    // Calcular certificados válidos (com data de expiração futura)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activeCertificates = certificates.filter(cert => {
      if (!cert.expiryDate) return false
      try {
        const expiryDate = new Date(cert.expiryDate)
        expiryDate.setHours(0, 0, 0, 0)
        return expiryDate >= today && cert.status !== "Arquivado"
      } catch {
        return false
      }
    }).length

    // Calcular certificados a vencer (próximos 30 dias)
    const next30Days = new Date()
    next30Days.setDate(today.getDate() + 30)
    next30Days.setHours(23, 59, 59, 999)

    const expiringCertificates = certificates.filter(cert => {
      if (!cert.expiryDate) return false
      try {
        const expiryDate = new Date(cert.expiryDate)
        return expiryDate > today && expiryDate <= next30Days && cert.status !== "Arquivado"
      } catch {
        return false
      }
    }).length

    // Calcular certificados vencidos
    const expiredCertificates = certificates.filter(cert => {
      if (!cert.expiryDate) return false
      try {
        const expiryDate = new Date(cert.expiryDate)
        expiryDate.setHours(0, 0, 0, 0)
        return expiryDate < today && cert.status !== "Arquivado"
      } catch {
        return false
      }
    }).length

    // Distribuição por tipo
    const typeCounts: { [key: string]: number } = {}
    certificates.forEach(cert => {
      const type = cert.type || 'Não especificado'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    const totalCerts = certificates.length
    const certificateTypes = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: totalCerts > 0 ? Math.round((count / totalCerts) * 100) : 0
    }))

    // Distribuição por status
    const statusCounts: { [key: string]: number } = {}
    certificates.forEach(cert => {
      const status = cert.status || 'Válido'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const statusDistribution = [
      { status: "Válido", count: statusCounts['Válido'] || 0, color: "bg-green-500" },
      { status: "A Vencer", count: statusCounts['A Vencer'] || 0, color: "bg-orange-500" },
      { status: "Vencido", count: statusCounts['Vencido'] || 0, color: "bg-red-500" },
      { status: "Arquivado", count: statusCounts['Arquivado'] || 0, color: "bg-slate-500" }
    ]

    // Gerar tendências mensais baseadas nos dados reais
    const monthlyTrends = generateMonthlyTrends(certificates)

    const newReportData: ReportData = {
      totalEmployees,
      activeCertificates,
      expiringCertificates,
      expiredCertificates,
      certificateTypes,
      statusDistribution,
      monthlyTrends
    }

    console.log('📈 Dados do relatório calculados:', newReportData)
    setReportData(newReportData)
  }, [certificates, employees])

  // Gerar tendências mensais baseadas nos dados reais
  const generateMonthlyTrends = (certs: Certificate[]) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const currentYear = new Date().getFullYear()
    
    return months.map((month, index) => {
      const issued = certs.filter(cert => {
        if (!cert.issueDate) return false
        try {
          const issueDate = new Date(cert.issueDate)
          return issueDate.getMonth() === index && issueDate.getFullYear() === currentYear
        } catch {
          return false
        }
      }).length

      const expiring = certs.filter(cert => {
        if (!cert.expiryDate) return false
        try {
          const expiryDate = new Date(cert.expiryDate)
          return expiryDate.getMonth() === index && expiryDate.getFullYear() === currentYear && expiryDate > new Date()
        } catch {
          return false
        }
      }).length
      
      return { 
        month, 
        issued: Math.max(0, issued), 
        expiring: Math.max(0, expiring) 
      }
    })
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      await fetchCertificates()
      await fetchEmployees()
      alert("Relatório atualizado com dados mais recentes!")
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error)
      alert("Erro ao atualizar relatório. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!reportData) return
    
    const dataStr = JSON.stringify({
      ...reportData,
      exportDate: new Date().toISOString(),
      totalCertificates: certificates.length,
      totalEmployees: employees.length,
      certificates,
      employees,
      supabaseConnection: {
        url: supabaseUrl,
        hasData: certificates.length > 0,
        lastUpdate: lastUpdate.toISOString()
      }
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-aso-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleRefreshData = async () => {
    setLoading(true)
    try {
      await fetchCertificates()
      await fetchEmployees()
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBarHeight = (value: number, maxValue: number) => {
    if (maxValue === 0) return 0
    return (value / maxValue) * 100
  }

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-slate-600 dark:text-slate-400">Carregando dados...</div>
          <div className="text-xs text-slate-500">Buscando informações em tempo real</div>
        </div>
      </div>
    )
  }

  const maxTrendValue = Math.max(...(reportData?.monthlyTrends.map(t => Math.max(t.issued, t.expiring)) || [1]))

  return (
    <>
      {/* Indicador Mobile */}
      {isMobile && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300">Modo mobile ativo</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between gap-4 items-start sm:items-center">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold truncate">Relatórios</h1>
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Dados em tempo real sobre os certificados de saúde ocupacional.
            <div className="text-xs text-slate-500 mt-1">
              Atualizado: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handleRefreshData}
            disabled={loading}
            className="flex items-center justify-center rounded-lg h-10 px-3 sm:px-4 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold gap-2 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 flex-1 sm:flex-none min-w-[120px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="truncate">Atualizar</span>
          </button>
          <button 
            onClick={handleExportReport}
            disabled={loading || certificates.length === 0}
            className="flex items-center justify-center rounded-lg h-10 px-3 sm:px-4 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold gap-2 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 flex-1 sm:flex-none min-w-[120px]"
          >
            <Download className="w-4 h-4" />
            <span className="truncate">Exportar</span>
          </button>
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center justify-center rounded-lg h-10 px-3 sm:px-4 bg-blue-600 text-white text-sm font-semibold gap-2 hover:bg-blue-700 disabled:opacity-50 flex-1 sm:flex-none min-w-[140px]"
          >
            <FileText className="w-4 h-4" />
            <span className="truncate">Gerar Relatório</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais - TOTALMENTE RESPONSIVO */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
        <div className="flex flex-col gap-2 sm:gap-3 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">Total de Funcionários</span>
          </div>
          <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold">{reportData?.totalEmployees || 0}</p>
          <p className="text-xs sm:text-sm text-green-600 font-medium flex items-center gap-1 truncate">
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{certificates.length} certificados no sistema</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">ASOs Ativos</span>
          </div>
          <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold">{reportData?.activeCertificates || 0}</p>
          <p className="text-xs sm:text-sm text-green-600 font-medium flex items-center gap-1 truncate">
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {reportData?.totalEmployees ? ((reportData.activeCertificates / reportData.totalEmployees) * 100).toFixed(1) : 0}% dos funcionários
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">A Vencer (30 dias)</span>
          </div>
          <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold">{reportData?.expiringCertificates || 0}</p>
          <p className={`text-xs sm:text-sm font-medium flex items-center gap-1 truncate ${
            (reportData?.expiringCertificates || 0) > 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {(reportData?.expiringCertificates || 0) > 0 ? <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
            <span className="truncate">{(reportData?.expiringCertificates || 0) > 0 ? 'Atenção necessária' : 'Tudo em dia'}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">ASOs Vencidos</span>
          </div>
          <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold">{reportData?.expiredCertificates || 0}</p>
          <p className={`text-xs sm:text-sm font-medium flex items-center gap-1 truncate ${
            (reportData?.expiredCertificates || 0) > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {(reportData?.expiredCertificates || 0) > 0 ? <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
            <span className="truncate">{(reportData?.expiredCertificates || 0) > 0 ? 'Requer ação imediata' : 'Nenhum vencido'}</span>
          </p>
        </div>
      </div>

      {/* Gráficos e Visualizações - RESPONSIVO */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Gráfico de Barras - Tendência Mensal */}
        <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-slate-900 dark:text-white text-base sm:text-lg font-semibold truncate">Tendência Mensal de ASOs</p>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          </div>
          <div className="flex-1 min-h-[200px] sm:min-h-[300px] flex items-end justify-between gap-1 sm:gap-2 pt-6 sm:pt-8 overflow-x-auto">
            {reportData?.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-[20px] sm:min-w-0">
                <div className="flex flex-col items-center gap-0.5 sm:gap-1 w-full max-w-8 sm:max-w-12">
                  <div 
                    className="w-full bg-blue-600 rounded-t transition-all duration-500 hover:bg-blue-500"
                    style={{ height: `${getBarHeight(trend.issued, maxTrendValue)}%`, minHeight: '3px' }}
                  />
                  <div 
                    className="w-full bg-orange-500 rounded-t transition-all duration-500 hover:bg-orange-400"
                    style={{ height: `${getBarHeight(trend.expiring, maxTrendValue)}%`, minHeight: '3px' }}
                  />
                </div>
                <span className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 font-medium">{trend.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-600"></div>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Emitidos</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">A Vencer</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Pizza - Distribuição por Tipo */}
        <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-slate-900 dark:text-white text-base sm:text-lg font-semibold truncate">Distribuição por Tipo de ASO</p>
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          </div>
          <div className="flex-1 min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
            <div className={`relative ${isMobile ? 'w-32 h-32' : 'w-40 h-40 sm:w-48 sm:h-48'}`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  className="text-slate-200 dark:text-slate-700"
                />
                {reportData?.certificateTypes.map((type, index, array) => {
                  const previousPercentages = array.slice(0, index).reduce((sum, t) => sum + t.percentage, 0);
                  const colors = ['#2b8cee', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
                  
                  return (
                    <circle 
                      key={type.type}
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke={colors[index] || colors[0]}
                      strokeWidth="3" 
                      strokeDasharray={`${type.percentage} ${100 - type.percentage}`}
                      strokeDashoffset={-previousPercentages}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {certificates.length}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total ASOs</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {reportData?.certificateTypes.map((type, index) => {
              const colors = ['#2b8cee', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
              
              return (
                <div key={type.type} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index] || colors[0] }}
                  />
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex-1 truncate">{type.type}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap flex-shrink-0">{type.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Status Detalhado - RESPONSIVO */}
      <div className="flex flex-col gap-4 sm:gap-6 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-slate-900 mt-4 sm:mt-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-900 dark:text-white text-base sm:text-lg font-semibold truncate">Distribuição Detalhada por Status</p>
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {reportData?.statusDistribution.map((status) => (
            <div key={status.status} className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${status.color}`}></div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{status.status}</span>
              </div>
              <p className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold">{status.count}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 sm:h-2">
                <div 
                  className={`h-1.5 sm:h-2 rounded-full ${status.color} transition-all duration-1000`}
                  style={{ 
                    width: `${certificates.length > 0 ? (status.count / certificates.length) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights e Recomendações Baseados em Dados Reais - RESPONSIVO */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-slate-900">
          <p className="text-slate-900 dark:text-white text-base sm:text-lg font-semibold">Insights do Período</p>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Conformidade Geral</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {certificates.length > 0 ? ((reportData?.activeCertificates || 0) / certificates.length * 100).toFixed(1) : 0}% dos ASOs estão válidos.
                </p>
              </div>
            </div>
            {(reportData?.expiringCertificates || 0) > 0 && (
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Atenção Necessária</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {reportData?.expiringCertificates} ASOs vencerão nos próximos 30 dias.
                  </p>
                </div>
              </div>
            )}
            {(reportData?.expiredCertificates || 0) > 0 && (
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Ação Imediata</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {reportData?.expiredCertificates} ASOs estão vencidos e requerem atenção urgente.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Cobertura de Funcionários</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {reportData?.totalEmployees ? ((reportData.activeCertificates / reportData.totalEmployees) * 100).toFixed(1) : 0}% dos funcionários possuem ASOs válidos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-slate-900">
          <p className="text-slate-900 dark:text-white text-base sm:text-lg font-semibold">Próximas Ações Recomendadas</p>
          <div className="space-y-2 sm:space-y-3">
            {(reportData?.expiringCertificates || 0) > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Agendar Renovações</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Programar exames para {reportData?.expiringCertificates} funcionários com ASOs próximos do vencimento.
                  </p>
                </div>
              </div>
            )}
            {(reportData?.expiredCertificates || 0) > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Regularizar Situação</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Urgente: {reportData?.expiredCertificates} ASOs vencidos precisam ser regularizados.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Emitir Relatório Mensal</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Gerar documentação completa para auditoria e compliance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Revisar Cadastros</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Verificar dados de {reportData?.totalEmployees} funcionários cadastrados no sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}