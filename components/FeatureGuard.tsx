'use client'

import { useAssinatura } from '../lib/hooks/useAssinatura'
import { useEffect, useState, useRef } from 'react'

type FeatureGuardProps = {
  children: React.ReactNode
  feature: string
  action?: string
  fallback?: React.ReactNode
}

function FeatureGuard({ 
  children, 
  feature, 
  action = 'acessar',
  fallback = null 
}: FeatureGuardProps) {
  const { assinatura, loading } = useAssinatura()
  const [permitido, setPermitido] = useState<boolean | null>(null)
  const [motivo, setMotivo] = useState('')
  const verificandoRef = useRef(false)

  useEffect(() => {
    if (verificandoRef.current) return
    
    const verificarPermissao = async () => {
      verificandoRef.current = true
      
      try {
        if (loading) {
          setPermitido(null)
          return
        }

        // Type assertion para acessar propriedades
        const assinaturaComTipo = assinatura as any
        const assinaturaAtiva = assinaturaComTipo && assinaturaComTipo.ativa === true
        
        if (!assinaturaAtiva) {
          setPermitido(false)
          setMotivo('Assinatura necessária para acessar este recurso.')
          return
        }

        const plano = assinaturaComTipo?.plano
        if (!plano) {
          setPermitido(false)
          setMotivo('Plano não encontrado.')
          return
        }

        let temPermissao = true
        let motivoLocal = ''

        switch (feature) {
          case 'relatorios':
            if (action === 'avancado') {
              const temRelatoriosAvancados = plano.limitations?.relatorios_avancados === true
              temPermissao = Boolean(temRelatoriosAvancados)
              
              if (!temPermissao) {
                motivoLocal = 'Relatórios avançados não disponíveis no seu plano'
              }
            }
            break
          
          case 'funcionarios':
            if (action === 'adicionar') {
              temPermissao = true
            } else {
              temPermissao = true
            }
            break
          
          case 'certificados':
            if (action === 'criar') {
              temPermissao = true
            } else {
              temPermissao = true
            }
            break
          
          default:
            temPermissao = true
        }

        setPermitido(temPermissao)
        setMotivo(motivoLocal)
        
      } catch (error) {
        console.error('Erro ao verificar permissão:', error)
        setPermitido(false)
        setMotivo('Erro ao verificar permissões')
      } finally {
        verificandoRef.current = false
      }
    }

    verificarPermissao()
  }, [assinatura, loading, feature, action])

  if (loading || verificandoRef.current) {
    return (
      <div className="p-4 text-center text-slate-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        Verificando permissões...
      </div>
    )
  }

  const assinaturaComTipo = assinatura as any
  const assinaturaAtiva = assinaturaComTipo && assinaturaComTipo.ativa === true

  if (!assinaturaAtiva) {
    return fallback || (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-sm">
          Assinatura necessária para acessar este recurso.
        </p>
        <a href="/planos" className="text-yellow-600 hover:underline text-sm font-medium block mt-2">
          Ver planos disponíveis →
        </a>
      </div>
    )
  }

  if (permitido === false) {
    return fallback || (
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-orange-700 text-sm">
          {motivo || `Recurso "${feature}" não disponível no seu plano atual.`}
        </p>
        <a href="/planos" className="text-orange-600 hover:underline text-sm font-medium block mt-2">
          Ver planos disponíveis →
        </a>
      </div>
    )
  }

  if (permitido === null) {
    return (
      <div className="p-4 text-center text-slate-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        Verificando permissões...
      </div>
    )
  }

  return <>{children}</>
}

export default FeatureGuard