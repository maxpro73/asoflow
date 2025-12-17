'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Filter, RefreshCw } from 'lucide-react'

// Simulação de dados para o exemplo
const mockEmployees = [
  {
    id: '1',
    name: 'Ana Clara Souza',
    cpf: '12345678901',
    department: 'Desenvolvedora Frontend',
    status: 'ok',
    aso_expiration: '2025-01-09'
  },
  {
    id: '2',
    name: 'Bruno Oliveira',
    cpf: '23456789012',
    department: 'Analista de Sistemas',
    status: 'warning',
    aso_expiration: '2024-03-14'
  },
  {
    id: '3',
    name: 'Carla Mendes',
    cpf: '34567890123',
    department: 'Gerente de Projetos',
    status: 'expired',
    aso_expiration: '2024-01-19'
  },
  {
    id: '4',
    name: 'Daniel Costa',
    cpf: '45678901234',
    department: 'Desenvolvedor Backend',
    status: 'ok',
    aso_expiration: '2025-01-31'
  },
  {
    id: '5',
    name: 'Eduarda Lima',
    cpf: '56789012345',
    department: 'Designer UX/UI',
    status: 'warning',
    aso_expiration: '2024-02-09'
  },
  {
    id: '6',
    name: 'Fernando Silva',
    cpf: '67890123456',
    department: 'Analista de Dados',
    status: 'ok',
    aso_expiration: '2025-01-29'
  }
]

export default function FuncionariosView() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const calculateDaysUntilExpiration = (expirationDate: string) => {
    if (!expirationDate) return null
    const today = new Date()
    const expiration = new Date(expirationDate)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return '-'
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf?.includes(searchTerm) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      ok: 'bg-green-100 text-green-700',
      warning: 'bg-orange-100 text-orange-700',
      expired: 'bg-red-100 text-red-700'
    }
    const labels: { [key: string]: string } = {
      ok: 'Ativo',
      warning: 'Vencendo',
      expired: 'Pendente'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.expired}`}>
        {labels[status] || 'Pendente'}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
            <p className="text-gray-500 mt-1">Gerencie os funcionários e seus respectivos ASOs.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + Adicionar Funcionário
          </button>
        </div>

        {/* Search and filters bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar por nome, CPF ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtrar por Status
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              Exportar
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">CPF</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cargo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status ASO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Próximo ASO</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Carregando funcionários...
                    </td>
                  </tr>
                )}

                {!loading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum funcionário encontrado.
                    </td>
                  </tr>
                )}

                {!loading && filteredEmployees.map((emp) => {
                  const daysUntilExpiration = calculateDaysUntilExpiration(emp.aso_expiration)
                  return (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCPF(emp.cpf)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(emp.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {formatDate(emp.aso_expiration)}
                          </span>
                          {daysUntilExpiration !== null && (
                            <span className={`text-xs mt-0.5 ${
                              daysUntilExpiration < 0 
                                ? 'text-red-600' 
                                : daysUntilExpiration < 30 
                                ? 'text-orange-600' 
                                : 'text-gray-500'
                            }`}>
                              {daysUntilExpiration < 0 
                                ? `Vencido há ${Math.abs(daysUntilExpiration)} dias`
                                : `Vencendo há ${daysUntilExpiration} dias`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button className="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" />
                            Renovar
                          </button>
                          <button className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                            Editar
                          </button>
                          <button className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}