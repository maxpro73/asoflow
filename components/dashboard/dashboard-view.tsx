'use client'

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { supabase } from "@/lib/supabase/supabaseClient"

interface Certificate {
  id: string
  type: string
  employee_name: string
  employee_id?: string
  issue_date: string
  expiry_date: string
  status: string
  image_url?: string
  file_name?: string
  created_at: string
}

interface Employee {
  id: string
  name: string
  status: string
}

export default function DashboardView() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados do Supabase
  const loadData = async () => {
    setLoading(true)
    
    // Carregar certificados
    const { data: certsData, error: certsError } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })

    if (certsError) {
      console.error('Erro ao carregar certificados:', certsError)
    } else {
      setCertificates(certsData || [])
    }

    // Carregar funcionários
    const { data: empsData, error: empsError } = await supabase
      .from('employees')
      .select('*')

    if (empsError) {
      console.error('Erro ao carregar funcionários:', empsError)
    } else {
      setEmployees(empsData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    
    // 🔥 ATUALIZAÇÃO EM TEMPO REAL - Supabase Realtime
    console.log('🔌 Conectando aos canais Realtime...')

    // Canal para certificados
    const certificatesChannel = supabase
      .channel('certificates-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'certificates' },
        (payload) => {
          console.log('🔄 Certificados atualizados:', payload)
          loadData()
        }
      )
      .subscribe()

    // Canal para funcionários
    const employeesChannel = supabase
      .channel('employees-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        (payload) => {
          console.log('🔄 Funcionários atualizados:', payload)
          loadData()
        }
      )
      .subscribe()
    
    // 🔥 Escutar eventos personalizados (de outros componentes)
    const handleEmployeesUpdate = () => {
      console.log('🔔 Evento employeesUpdated recebido!')
      loadData()
    }

    const handleCertificatesUpdate = () => {
      console.log('🔔 Evento certificatesUpdated recebido!')
      loadData()
    }
    
    window.addEventListener('employeesUpdated', handleEmployeesUpdate)
    window.addEventListener('certificatesUpdated', handleCertificatesUpdate)
    
    // Cleanup ao desmontar
    return () => {
      console.log('🔌 Desconectando canais Realtime...')
      certificatesChannel.unsubscribe()
      employeesChannel.unsubscribe()
      window.removeEventListener('employeesUpdated', handleEmployeesUpdate)
      window.removeEventListener('certificatesUpdated', handleCertificatesUpdate)
    }
  }, [])

  // Calcular dias até expiração
  const calculateDaysUntilExpiration = (expiryDate: string) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiration = new Date(expiryDate)
    const diffTime = expiration.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calcular estatísticas em tempo real
  const statsData = {
    totalASOs: certificates.length,
    activeASOs: certificates.filter(cert => {
      const days = calculateDaysUntilExpiration(cert.expiry_date)
      return days && days >= 30
    }).length,
    expiringASOs: certificates.filter(cert => {
      const days = calculateDaysUntilExpiration(cert.expiry_date)
      return days && days > 0 && days < 30
    }).length,
    expiredASOs: certificates.filter(cert => {
      const days = calculateDaysUntilExpiration(cert.expiry_date)
      return !days || days < 0
    }).length,
    totalFuncionarios: employees.length
  }

  console.log('📊 Dashboard Stats:', statsData)

  // Estatísticas para os cards - CORRIGIDO: Sem "λ"
  const stats = [
    { 
      label: 'Total de ASOs', 
      value: statsData.totalASOs.toString(), 
      change: '+2.5%', 
      trend: 'up' as const 
    },
    { 
      label: 'ASOs Válidos', 
      value: statsData.activeASOs.toString(), 
      change: '+5%', 
      trend: 'up' as const 
    },
    { 
      label: 'ASOs Vencendo (30 dias)', 
      value: statsData.expiringASOs.toString(), 
      change: '+10%', 
      trend: 'up' as const 
    },
    { 
      label: 'Total de Funcionários', 
      value: statsData.totalFuncionarios.toString(),
      change: '+1.2%', 
      trend: 'up' as const 
    }
  ]

  // Funções do gráfico
  const getChartData = () => {
    const baseData = [45, 52, 38, 65, 72, 58, 49, 61, 55, 48, 67, 53]
    switch(selectedPeriod) {
      case '30days': return baseData.slice(0, 4)
      case '6months': return baseData.slice(0, 6)
      case 'year': return baseData
      default: return baseData.slice(0, 4)
    }
  }

  const chartData = getChartData()
  const maxChartValue = Math.max(...chartData)
  const minChartValue = Math.min(...chartData)

  const generateChartPath = (data: number[]) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 475
      const y = 150 - ((value - min) / range) * 130
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
    return points
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-0"> {/* 🔥 ZERO Z-INDEX PARA NÃO SOBREPOR */}
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold">Dashboard de Gestão ASO</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Visão geral dos certificados de saúde ocupacional da sua empresa.
          </p>
        </div>
        {/* 🔥 Indicador de atualização em tempo real */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Atualização em tempo real
        </div>
      </div>

      <div className="flex gap-2 py-6 overflow-x-auto">
        {['30days', '6months', 'year'].map((period) => (
          <button 
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              selectedPeriod === period 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {period === '30days' && 'Últimos 30 dias'}
            {period === '6months' && 'Últimos 6 meses'}
            {period === 'year' && 'Este Ano'}
          </button>
        ))}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg">
            <p className="text-base font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-slate-900 dark:text-white text-3xl font-bold">{stat.value}</p>
            <p className={`text-sm font-medium flex items-center gap-1 ${
              stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-orange-500'
            }`}>
              {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
          <p className="text-slate-900 dark:text-white text-lg font-semibold">Tendência de Emissão de ASOs</p>
          <div className="flex min-h-[300px] flex-col gap-8 py-4">
            <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 475 150" width="100%">
              <defs>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2b8cee" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2b8cee" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`${generateChartPath(chartData)} L 475 150 L 0 150 Z`}
                fill="url(#areaGradient)" 
              />
              <path 
                d={generateChartPath(chartData)}
                stroke="#2b8cee" 
                strokeLinecap="round" 
                strokeWidth="3" 
                fill="none"
              />
            </svg>
            <div className="flex justify-between px-2">
              {chartData.map((_, index) => (
                <p key={index} className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  {selectedPeriod === '30days' ? `Sem ${index + 1}` : 
                   selectedPeriod === '6months' ? `Mês ${index + 1}` : 
                   `Mês ${index + 1}`}
                </p>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
              <span>Mín: {minChartValue}</span>
              <span>Máx: {maxChartValue}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
          <p className="text-slate-900 dark:text-white text-lg font-semibold">Status dos ASOs</p>
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 py-4">
            <div className="relative w-48 h-48">
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
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3" 
                  strokeDasharray={`${(statsData.activeASOs / Math.max(statsData.totalASOs, 1)) * 100}, 100`}
                  strokeLinecap="round"
                />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="3" 
                  strokeDasharray={`${(statsData.expiringASOs / Math.max(statsData.totalASOs, 1)) * 100}, 100`}
                  strokeDashoffset={`-${(statsData.activeASOs / Math.max(statsData.totalASOs, 1)) * 100}`}
                  strokeLinecap="round"
                />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="3" 
                  strokeDasharray={`${(statsData.expiredASOs / Math.max(statsData.totalASOs, 1)) * 100}, 100`}
                  strokeDashoffset={`-${((statsData.activeASOs + statsData.expiringASOs) / Math.max(statsData.totalASOs, 1)) * 100}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{statsData.totalASOs}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Total ASOs</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Válido ({statsData.activeASOs})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Vencendo ({statsData.expiringASOs})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Vencido ({statsData.expiredASOs})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ASOs Próximos do Vencimento */}
      {certificates.length > 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-900 dark:text-white text-lg font-semibold">
              ASOs Próximos do Vencimento
            </p>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {certificates.filter(cert => {
                const days = calculateDaysUntilExpiration(cert.expiry_date)
                return days && days > 0 && days <= 60
              }).length} itens
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Funcionário</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Tipo de ASO</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Data de Vencimento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Dias Restantes</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {certificates
                  .filter(cert => {
                    const days = calculateDaysUntilExpiration(cert.expiry_date)
                    return days && days > 0 && days <= 60
                  })
                  .sort((a, b) => {
                    const daysA = calculateDaysUntilExpiration(a.expiry_date) || 999
                    const daysB = calculateDaysUntilExpiration(b.expiry_date) || 999
                    return daysA - daysB
                  })
                  .slice(0, 5)
                  .map((cert) => {
                    const daysLeft = calculateDaysUntilExpiration(cert.expiry_date)
                    let statusColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    let statusText = "Válido"
                    
                    if (!daysLeft || daysLeft < 0) {
                      statusColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      statusText = "Vencido"
                    } else if (daysLeft < 30) {
                      statusColor = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      statusText = "Vencendo"
                    }
                    
                    return (
                      <tr key={cert.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">{cert.employee_name}</div>
                          {cert.employee_id && (
                            <div className="text-sm text-slate-500 dark:text-slate-400">ID: {cert.employee_id}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{cert.type}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {new Date(cert.expiry_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            !daysLeft || daysLeft < 0 
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : daysLeft < 15
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}>
                            {!daysLeft || daysLeft < 0 ? "Vencido" : `${daysLeft} dias`}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          
          {certificates.filter(cert => {
            const days = calculateDaysUntilExpiration(cert.expiry_date)
            return days && days > 0 && days <= 60
          }).length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400 dark:text-slate-500 mb-2">🎉</div>
              <p className="text-slate-500 dark:text-slate-400">Nenhum ASO próximo do vencimento</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}