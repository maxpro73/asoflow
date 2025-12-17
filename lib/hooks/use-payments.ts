// lib/hooks/use-payments.ts - VERSÃO CORRIGIDA
import { supabase } from '@/lib/services/supabase'

export function usePayment() { // Nome correto: usePayment
  const criarSessaoPagamento = async (planoId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      const response = await fetch('/api/pagamento/criar-sessao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ planoId })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de pagamento')
      }

      const data = await response.json()
      
      if (data.url) {
        // Redirecionar para checkout
        window.location.href = data.url
      }
      
      return data
    } catch (error) {
      console.error('Erro ao criar sessão de pagamento:', error)
      throw error
    }
  }

  const verificarPagamento = async (sessaoId: string) => {
    try {
      const response = await fetch(`/api/pagamento/verificar/${sessaoId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao verificar pagamento')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error)
      throw error
    }
  }

  return { 
    criarSessaoPagamento, 
    verificarPagamento 
  }
}

// Exportação alternativa se quiser manter usePagamento também
export const usePagamento = usePayment