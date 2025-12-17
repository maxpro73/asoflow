// app/components/CreateOrderButton.jsx
'use client'

import { useState, useEffect } from 'react'
import { Loader2, CreditCard, CheckCircle, AlertCircle, ExternalLink, User } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function CreateOrderButton({ 
  plan = {
    id: 'basic',
    title: 'Plano Básico',
    price: '29.90',
    description: 'Plano básico com recursos essenciais'
  },
  buttonText = 'Assinar agora',
  buttonVariant = 'primary',
  showUserInfo = true
}) {
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [preferenceId, setPreferenceId] = useState(null)
  const [checkoutUrl, setCheckoutUrl] = useState(null)
  const [user, setUser] = useState(null)

  // Buscar usuário da sessão do Supabase
  useEffect(() => {
    const getUserSession = async () => {
      try {
        setUserLoading(true)
        
        // Obter sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          return
        }

        if (session?.user) {
          // Obter dados completos do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userError && userError.code !== 'PGRST116') {
            console.error('Erro ao buscar dados do usuário:', userError)
          }

          setUser({
            id: session.user.id,
            email: session.user.email,
            name: userData?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            full_name: userData?.full_name,
            company: userData?.company
          })
        } else {
          console.log('Nenhuma sessão ativa encontrada')
          setError('Usuário não autenticado. Faça login para continuar.')
        }
      } catch (error) {
        console.error('Erro ao obter sessão do usuário:', error)
      } finally {
        setUserLoading(false)
      }
    }

    getUserSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
          })
          setError(null)
        } else {
          setUser(null)
          setError('Usuário não autenticado. Faça login para continuar.')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Variantes de estilo
  const buttonStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow hover:shadow-md transition-all',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all'
  }

  const handleCreateOrder = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    setPreferenceId(null)
    setCheckoutUrl(null)

    try {
      // Validar dados do plano
      if (!plan?.id || !plan?.title || !plan?.price) {
        throw new Error('Dados do plano incompletos')
      }

      // Validar usuário
      if (!user?.id || !user?.email) {
        throw new Error('Usuário não autenticado. Faça login para continuar.')
      }

      console.log('🔄 Iniciando criação de ordem...')
      console.log('📦 Plano:', plan)
      console.log('👤 Usuário:', user)

      // Preparar dados para a API - CAMPOS CORRIGIDOS
      const orderData = {
        planId: plan.id,
        price: parseFloat(plan.price).toFixed(2), // ✅ Campo obrigatório
        planName: plan.title, // ✅ Campo opcional mas recomendado
        userId: user.id,
        email: user.email,
        name: user.name || user.full_name || user.email?.split('@')[0] || '',
        description: plan.description || `Assinatura do plano ${plan.title}`
      }

      console.log('📤 Enviando para API:', orderData)

      // Chamar API do Mercado Pago
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      console.log('📥 Resposta da API:', data)

      // Verificar resposta
      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || 'Erro ao criar ordem de pagamento')
      }

      // ✅ CORRIGIDO: Verificar "preferenceId" ao invés de "id"
      if (!data.preferenceId) {
        throw new Error('ID da preferência não retornado')
      }

      // Usar sandbox em desenvolvimento, produção em produção
      const url = process.env.NODE_ENV === 'development' 
        ? data.sandboxInitPoint || data.initPoint
        : data.initPoint || data.sandboxInitPoint

      if (!url) {
        throw new Error('URL de checkout não disponível')
      }

      // ✅ CORRIGIDO: Usar "preferenceId" ao invés de "id"
      setPreferenceId(data.preferenceId)
      setCheckoutUrl(url)
      setSuccess(true)

      console.log('✅ Ordem criada:', data.preferenceId)
      console.log('🔗 URL:', url)

      // Salvar histórico no Supabase
      try {
        const { error: dbError } = await supabase
          .from('payment_history')
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            preference_id: data.preferenceId, // ✅ CORRIGIDO
            amount: plan.price,
            status: 'pending',
            checkout_url: url,
            metadata: {
              plan_title: plan.title,
              user_email: user.email
            }
          })

        if (dbError) {
          console.error('⚠️ Erro ao salvar histórico:', dbError)
          // Não interrompe o fluxo principal
        }
      } catch (dbError) {
        console.error('⚠️ Erro no save do histórico:', dbError)
      }

    } catch (error) {
      console.error('❌ Erro ao criar ordem:', error)
      setError(error.message || 'Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Estado de carregamento do usuário
  if (userLoading) {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando informações do usuário...</p>
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    return (
      <div className="w-full p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <User className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-800 mb-2">Autenticação necessária</h3>
            <p className="text-yellow-700 mb-4">
              Faça login ou crie uma conta para assinar um plano.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="px-6 py-2 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Informações do usuário */}
      {showUserInfo && user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
              {user.company && (
                <p className="text-gray-500 text-sm mt-1">
                  <span className="font-medium">Empresa:</span> {user.company}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
              <p className="text-xs text-green-600 font-medium mt-1">✓ Autenticado</p>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes do plano */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes do Plano</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Plano selecionado:</span>
            <span className="font-semibold text-gray-900">{plan.title}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Valor:</span>
            <span className="text-xl font-bold text-green-600">
              R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Período:</span>
            <span className="font-medium text-gray-900">Mensal</span>
          </div>
        </div>
      </div>

      {/* Botão principal */}
      <button
        onClick={success ? handleOpenCheckout : handleCreateOrder}
        disabled={loading || !user}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${buttonStyles[buttonVariant]}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : success ? (
          <>
            <ExternalLink className="w-5 h-5" />
            Ir para Pagamento
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {buttonText}
          </>
        )}
      </button>

      {/* Mensagem de sucesso */}
      {success && checkoutUrl && (
        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-800 mb-2">Ordem criada com sucesso!</h4>
              <p className="text-green-700 mb-3">
                Sua ordem de pagamento foi criada. Clique no botão acima para ser redirecionado ao Mercado Pago.
              </p>
              <div className="text-xs text-green-600 bg-green-100 px-3 py-2 rounded-lg font-mono break-all">
                ID: {preferenceId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 mb-2">Erro no processamento</h4>
              <p className="text-red-700 mb-3">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-700 hover:text-red-800 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informações de segurança */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.947v1.053h-2v-1.053c-3.332-.486-6-3.374-6-6.947h2c0 3.313 2.686 6 6 6s6-2.687 6-6h2c0 3.573-2.668 6.461-6 6.947z"/>
          </svg>
          <span>Pagamento 100% seguro processado pelo Mercado Pago</span>
        </div>
      </div>
    </div>
  )
}