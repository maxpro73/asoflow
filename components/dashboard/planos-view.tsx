import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { usePlanLimits } from "@/hooks/usePlanLimits"
import { FileText, Check, Crown, Star, Download, X, Calendar, CreditCard, AlertTriangle, Users, BarChart3, ChevronRight, Zap, Mail, Phone, HelpCircle, Shield, ZapOff, Lock, Menu } from "lucide-react"

interface Plan {
  id: string // Mudado para string para bater com o banco
  name: string
  description: string
  price: number
  annualPrice?: number
  originalPrice?: number
  period: string
  features: string[]
  limitEmployees: number
  limitASOs: number
  popular?: boolean
  recommended?: boolean
  earlyBird?: boolean
  buttonText: string
  buttonVariant: 'primary' | 'secondary' | 'default'
  tag?: string
}

export default function PlanosView() {
  // ========== ESTADOS ==========
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showManageSubscription, setShowManageSubscription] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [selectedAnnual, setSelectedAnnual] = useState(false)
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [changeToAnnual, setChangeToAnnual] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  
  // Estados para dados do usuário
  const [funcionariosAtivos, setFuncionariosAtivos] = useState(0)
  const [asosAtivos, setAsosAtivos] = useState(0)
  const [currentPlanId, setCurrentPlanId] = useState<string>('essencial_mensal')

  // 🔥 USAR O HOOK DE LIMITES
  const limits = usePlanLimits(funcionariosAtivos, asosAtivos, 0)

  // ========== CARREGAR DADOS DO SUPABASE ==========
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // 1. Buscar planos ativos do banco
      const { data: planosData, error: planosError } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('max_funcionarios', { ascending: true })

      if (planosError) throw planosError

      // 2. Mapear planos do banco para o formato do componente
      const mappedPlans: Plan[] = (planosData || []).map(plano => ({
        id: plano.id,
        name: plano.nome,
        description: plano.descricao || `Para empresas com até ${plano.max_funcionarios} funcionários`,
        price: plano.preco_mensal,
        annualPrice: plano.preco_anual,
        period: "mês",
        limitEmployees: plano.max_funcionarios,
        limitASOs: plano.max_certificados,
        features: plano.features || [
          `Até ${plano.max_funcionarios} funcionários`,
          `${plano.max_certificados} certificados/ASOs`,
          plano.max_usuarios_rh ? `${plano.max_usuarios_rh} usuários RH` : 'Usuários ilimitados',
          "Dashboard completo",
          "Alertas automáticos",
          "Suporte técnico"
        ],
        popular: plano.destaque || false,
        earlyBird: plano.id === 'early_bird_mensal',
        buttonText: "Escolher Plano",
        buttonVariant: 'primary'
      }))

      setPlans(mappedPlans)

      // 3. Buscar plano atual do usuário
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('plano_id')
          .eq('id', user.id)
          .single()

        if (userData?.plano_id) {
          setCurrentPlanId(userData.plano_id)
        }

        // 4. Buscar contagem de funcionários
        const { count: empCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setFuncionariosAtivos(empCount || 0)

        // 5. Buscar contagem de ASOs/Certificados
        const { count: asoCount } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setAsosAtivos(asoCount || 0)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar informações. Por favor, recarregue a página.')
    } finally {
      setLoading(false)
    }
  }

  // Obter plano atual
  const currentPlan = plans.find(plan => plan.id === currentPlanId) || plans[0]

  // Calcular porcentagens para as barras de progresso
  const porcentagemFuncionarios = currentPlan 
    ? Math.min((funcionariosAtivos / currentPlan.limitEmployees) * 100, 100)
    : 0
  const porcentagemASOs = currentPlan
    ? Math.min((asosAtivos / currentPlan.limitASOs) * 100, 100)
    : 0

  // ========== HANDLER: VALIDAÇÃO E SELEÇÃO DE PLANO ==========
  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      alert("Você já está neste plano!")
      return
    }

    // ✅ VALIDAÇÃO: Verificar se o novo plano comporta o uso atual
    if (funcionariosAtivos > plan.limitEmployees) {
      alert(
        `⚠️ Atenção!\n\n` +
        `Você tem ${funcionariosAtivos} funcionários ativos, mas o plano ${plan.name} suporta apenas ${plan.limitEmployees}.\n\n` +
        `Por favor, reduza o número de funcionários ou escolha um plano maior.`
      )
      return
    }

    if (asosAtivos > plan.limitASOs) {
      alert(
        `⚠️ Atenção!\n\n` +
        `Você tem ${asosAtivos} ASOs cadastrados, mas o plano ${plan.name} suporta apenas ${plan.limitASOs}.\n\n` +
        `Por favor, escolha um plano maior ou entre em contato com o suporte.`
      )
      return
    }

    setSelectedPlan(plan)
    setChangeToAnnual(selectedAnnual)
    setShowPlanChangeModal(true)
  }

  // ========== HANDLER: CONFIRMAÇÃO DE MUDANÇA DE PLANO ==========
  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return

    try {
      setIsProcessingPayment(true)
      setPaymentError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Atualizar plano no banco
      const { error } = await supabase
        .from('users')
        .update({ plano_id: selectedPlan.id })
        .eq('id', user.id)

      if (error) throw error

      // Limpar cache
      localStorage.removeItem('cachedPlanData')

      // Atualizar estado local
      setCurrentPlanId(selectedPlan.id)
      setShowPlanChangeModal(false)
      setSelectedPlan(null)
      setChangeToAnnual(false)

      alert('✅ Plano atualizado com sucesso!')
      
      // Recarregar dados
      await loadData()

    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error)
      setPaymentError(error.message || 'Erro ao atualizar plano')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // ========== HELPER FUNCTIONS ==========
  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace('.', ',')
  }

  const getPlanPrice = (plan: Plan): number => {
    return selectedAnnual && plan.annualPrice ? plan.annualPrice : plan.price
  }

  const getPlanDisplayPrice = (plan: Plan): string => {
    const price = getPlanPrice(plan)
    return `R$ ${formatPrice(price)}/${plan.period}`
  }

  const getAnnualSavings = (plan: Plan): string => {
    if (!plan.annualPrice) return ""
    const savings = plan.price - plan.annualPrice
    return `Economize R$ ${formatPrice(savings * 12)}/ano`
  }

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando planos...</p>
        </div>
      </div>
    )
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Erro ao carregar plano atual</p>
          <button 
            onClick={loadData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // ========== INTERFACE: ASSINATURA ATIVA ==========
  return (
    <>
      {/* Seção: Planos Disponíveis */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mx-4 sm:mx-0">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">Planos Disponíveis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-4 sm:p-6 transition-all duration-300 hover:shadow-lg ${
                plan.id === currentPlanId
                  ? 'ring-2 ring-green-500 border-green-300 dark:border-green-600 bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-slate-900'
                  : plan.earlyBird || plan.popular
                    ? 'border-blue-300 dark:border-blue-600 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {plan.id === currentPlanId && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-600 text-white">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Plano Atual
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">{plan.description}</p>
                </div>

                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      R$ {formatPrice(getPlanPrice(plan))}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.id === currentPlanId}
                  className={`w-full mt-3 sm:mt-4 rounded-lg h-10 sm:h-12 font-semibold transition-all duration-300 text-sm sm:text-base ${
                    plan.id === currentPlanId
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25'
                  }`}
                >
                  {plan.id === currentPlanId ? 'Plano Atual' : plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showPlanChangeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Confirmar Mudança de Plano
              </h2>
              
              {isProcessingPayment ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-600 dark:text-slate-400">Processando...</p>
                </div>
              ) : paymentError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-800 dark:text-red-400">{paymentError}</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 dark:text-slate-400">
                    Você está mudando para o plano <strong>{selectedPlan.name}</strong>
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowPlanChangeModal(false)
                        setSelectedPlan(null)
                      }}
                      className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmPlanChange}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirmar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}