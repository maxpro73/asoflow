import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAssinatura() {
  const [assinatura, setAssinatura] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const verificarStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      const response = await fetch('/api/assinatura/status', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao verificar assinatura')
      }

      const data = await response.json()
      setAssinatura(data)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao verificar assinatura:', err)
    } finally {
      setLoading(false)
    }
  }

  const verificarPermissao = async (modulo, acao) => {
    try {
      const response = await fetch('/api/limitations/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ modulo, acao })
      })

      if (!response.ok) {
        throw new Error('Erro ao verificar permissão')
      }

      return await response.json()
    } catch (err) {
      console.error('Erro ao verificar permissão:', err)
      return { permitido: false, motivo: 'Erro interno' }
    }
  }

  useEffect(() => {
    verificarStatus()
  }, [])

  return {
    assinatura,
    loading,
    error,
    verificarStatus,
    verificarPermissao
  }
}