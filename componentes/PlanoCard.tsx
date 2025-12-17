// components/PlanoCard.tsx
'use client'

import { Check } from 'lucide-react'
import { usePayment } from '@/lib/hooks/use-payments' // Alterado para usePayment

interface PlanoCardProps {
  plano: {
    id: string
    nome: string
    descricao: string
    preco: number
    limitations: {
      max_usuarios: number
      certificados_mes: number
      relatorios_avancados: boolean
    }
  }
  isCurrent?: boolean
}

export function PlanoCard({ plano, isCurrent }: PlanoCardProps) {
  const { criarSessaoPagamento } = usePayment() // Alterado para usePayment

  const handleAssinar = async () => {
    try {
      await criarSessaoPagamento(plano.id)
    } catch (error) {
      alert('Erro ao iniciar pagamento')
    }
  }

  // ... resto do código
}