// app/debug/planos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import PlanosView from '@/components/dashboard/planos-view'

export default function DebugPlanosPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    // Simular chamada ao hook usePlanLimits
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/user/plan-limits')
        const data = await response.json()
        
        console.log('🔍 Debug Info Completo:', data)
        setDebugInfo(data)
      } catch (error) {
        console.error('❌ Erro ao buscar debug info:', error)
      }
    }

    fetchDebugInfo()
  }, [])

  return (
    <div className="p-8 space-y-6">
      {/* Card de Debug */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4">
          🐛 Informações de Debug
        </h2>
        
        {debugInfo ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">📊 Dados do Usuário</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-600">Plano Atual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {debugInfo.currentPlan?.name || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">
                  ID: {debugInfo.currentPlanId || 'N/A'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-600">Funcionários</p>
                <p className="text-2xl font-bold text-green-600">
                  {debugInfo.totalFuncionarios || 0}
                </p>
                <p className="text-xs text-slate-500">
                  Limite: {debugInfo.currentPlan?.limitEmployees || 'N/A'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-600">ASOs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {debugInfo.totalASOs || 0}
                </p>
                <p className="text-xs text-slate-500">
                  Limite: {debugInfo.currentPlan?.limitASOs || 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">✅ Status da Assinatura</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  debugInfo.isSubscriptionActive ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-semibold">
                  {debugInfo.isSubscriptionActive ? 'Ativa' : 'Cancelada'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-yellow-900">Carregando dados...</p>
          </div>
        )}
      </div>

      {/* Componente Real */}
      <div className="border-4 border-blue-400 rounded-xl p-1">
        <div className="bg-blue-50 px-4 py-2 rounded-t-lg">
          <h2 className="font-bold text-blue-900">📦 Componente PlanosView</h2>
        </div>
        <div className="bg-white p-6 rounded-b-lg">
          {debugInfo ? (
            <PlanosView
              onCancelSubscription={() => {
                console.log('🔴 CANCELAR ASSINATURA')
                alert('Assinatura cancelada!')
              }}
              isSubscriptionActive={debugInfo.isSubscriptionActive}
              onReactivate={() => {
                console.log('🟢 REATIVAR ASSINATURA')
                alert('Assinatura reativada!')
              }}
              totalFuncionarios={debugInfo.totalFuncionarios || 0}
              totalASOs={debugInfo.totalASOs || 0}
              currentPlanId={debugInfo.currentPlanId || 1}
              user={{
                id: debugInfo.userId,
                email: debugInfo.userEmail,
                name: debugInfo.userName
              }}
            />
          ) : (
            <div className="text-center py-12 text-slate-500">
              Aguardando dados...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}