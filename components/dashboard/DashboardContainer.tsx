'use client'

import { useAssinatura } from '@/hooks/useAssinatura'

interface DashboardContainerProps {
  children: React.ReactNode
}

export function DashboardContainer({ children }: DashboardContainerProps) {
  const { assinatura, loading } = useAssinatura()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!assinatura || !(assinatura as any).ativa) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Assinatura Necessária</h3>
          <p className="mb-3">Você precisa de uma assinatura ativa para acessar o dashboard.</p>
          <a 
            href="/planos" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ver planos disponíveis
          </a>
        </div>
      </div>
    )
  }

  // Destructuring das propriedades após garantir que assinatura existe
  const plano = (assinatura as any).plano
  const data_expiracao = (assinatura as any).data_expiracao
  const nomePlano = plano?.nome || 'Não definido'
  
  return (
    <div className="p-6 space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-green-800 dark:text-green-200 text-lg">
              Plano: {nomePlano}
            </h2>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Status: <span className="font-medium">Ativa</span>
            </p>
            {data_expiracao && (
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                Expira em: {new Date(data_expiracao).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full">
            <svg 
              className="w-6 h-6 text-green-600 dark:text-green-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}