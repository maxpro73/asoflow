// @/components/UpgradeModal.tsx
"use client"

import { useState } from 'react'
import { useSubscriptionLimits } from '@/lib/useSubscriptionLimits'
import { createMercadoPagoSubscription } from '@/lib/mercado-pago'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  requiredFeature: string
  currentUsage: number
  currentLimit: number
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  requiredFeature, 
  currentUsage, 
  currentLimit 
}: UpgradeModalProps) {
  const { availablePlans, getCurrentPlan, getUpgradePlan } = useSubscriptionLimits()
  
  const [selectedPlan, setSelectedPlan] = useState<string>(() => {
    const upgrade = getUpgradePlan()
    return upgrade?.id ?? availablePlans[1]?.id ?? availablePlans[0]?.id ?? ''
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPlan = getCurrentPlan()
  
  // ✅ CORREÇÃO: Tipar explicitamente o parâmetro 'plan'
  const upgradePlan = availablePlans?.find((plan: any) => plan.id === selectedPlan)

  const handleUpgrade = async () => {
    if (!upgradePlan) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      if (!upgradePlan.mercadoPagoPlanId) {
        throw new Error('Plano sem ID do Mercado Pago')
      }
      
      const checkoutUrl = await createMercadoPagoSubscription(upgradePlan.mercadoPagoPlanId)
      window.location.href = checkoutUrl
    } catch (err) {
      console.error('Erro ao criar assinatura:', err)
      setError('Erro ao processar upgrade. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Limite Atingido
        </h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            Você atingiu o limite de <strong>{requiredFeature}</strong> do seu plano atual.
          </p>
          <p className="text-yellow-800 text-sm mt-1">
            Uso atual: <strong>{currentUsage}/{currentLimit}</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Faça upgrade para continuar</h3>
          
          {availablePlans && availablePlans.length > 0 ? (
            <div className="space-y-3">
              {availablePlans.map((plan: any) => (
                <label 
                  key={plan.id} 
                  className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="upgrade-plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-900">{plan.name}</span>
                      <span className="font-bold text-gray-900">
                        R$ {(plan.price ?? 0).toFixed(2)}/mês
                      </span>
                    </div>
                    {plan.limits?.features && Array.isArray(plan.limits.features) && (
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        {plan.limits.features.map((feature: string, index: number) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum plano disponível</p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Voltar
          </button>
          <button
            onClick={handleUpgrade}
            disabled={!upgradePlan || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? 'Processando...' : upgradePlan ? `Upgrade para ${upgradePlan.name}` : 'Selecione um plano'}
          </button>
        </div>
      </div>
    </div>
  )
}