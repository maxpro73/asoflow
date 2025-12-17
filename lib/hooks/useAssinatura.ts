// lib/hooks/useAssinatura.ts - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { User } from '@supabase/supabase-js'

// Interface baseada na estrutura de tabela
export interface PlanoDB {
  id: string
  nome: string
  descricao?: string
  preco_mensal: number
  preco_anual?: number | null
  max_funcionarios: number
  max_usuarios_rh: number
  max_empresas: number
  alertas_mes: number | null
  // Recursos booleanos
  dashboard_basico: boolean
  dashboard_filtros: boolean
  dashboard_gerencial: boolean
  relatorio_simples: boolean
  relatorio_customizado: boolean
  exportacao_graficos: boolean
  suporte_email: boolean
  suporte_whatsapp: boolean
  suporte_prioritario: boolean
  onboarding_automatico: boolean
  onboarding_ao_vivo: boolean
  early_bird?: boolean
  max_clientes_early_bird?: number | null
  ativo: boolean
  ordem: number
  created_at?: string
}

export interface AssinaturaDB {
  id: string
  user_id: string
  plano_id: string
  status: 'ativa' | 'cancelada' | 'suspensa' | 'pendente' | 'expirada'
  data_inicio: string
  data_fim: string | null
  created_at?: string
  updated_at?: string
  plano?: PlanoDB // Joined pelo Supabase
}

export interface UseAssinaturaReturn {
  assinatura: AssinaturaDB | null
  loading: boolean
  user: User | null
  temAssinaturaAtiva: boolean
  planoAtual: PlanoDB | null
  // Funções de verificação
  podeAdicionarFuncionario: (quantidadeAtual: number) => boolean
  podeEnviarAlerta: (alertasEnviadosEsteMes: number) => boolean
  temAcessoRecurso: (recurso: keyof PlanoDB) => boolean
  getLimiteFuncionarios: () => number
  getLimiteUsuariosRH: () => number
  getAlertasRestantes: (alertasUsados: number) => number
  // Recursos específicos
  temDashboardBasico: boolean
  temDashboardFiltros: boolean
  temDashboardGerencial: boolean
  temRelatorioCustomizado: boolean
  temExportacaoGraficos: boolean
  temSuportePrioritario: boolean
  // Recarregar
  recarregarAssinatura: () => Promise<void>
}

export function useAssinatura(): UseAssinaturaReturn {
  const [assinatura, setAssinatura] = useState<AssinaturaDB | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const carregarDados = async (userId: string) => {
    try {
      // Buscar assinatura com plano (join)
      const { data, error } = await supabase
        .from('assinaturas')
        .select(`
          *,
          plano:planos(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        console.log('Nenhuma assinatura ativa encontrada')
        setAssinatura(null)
        return
      }

      // Verificar se não expirou
      const hoje = new Date()
      const dataFim = data.data_fim ? new Date(data.data_fim) : null
      const ativa = data.status === 'ativa' && (!dataFim || dataFim > hoje)

      if (!ativa && data.status === 'ativa') {
        // Atualizar status para expirada
        await supabase
          .from('assinaturas')
          .update({ status: 'expirada' })
          .eq('id', data.id)
      }

      setAssinatura(data)
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error)
      setAssinatura(null)
    }
  }

  const iniciar = async () => {
    setLoading(true)
    try {
      // 1. Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 2. Carregar assinatura
        await carregarDados(user.id)
      } else {
        setAssinatura(null)
      }
    } catch (error) {
      console.error('Erro ao iniciar hook:', error)
      setAssinatura(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    iniciar()

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await carregarDados(currentUser.id)
        } else {
          setAssinatura(null)
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const recarregarAssinatura = async () => {
    if (user) {
      await carregarDados(user.id)
    }
  }

  // ========== FUNÇÕES DE VERIFICAÇÃO ==========
  const podeAdicionarFuncionario = (quantidadeAtual: number): boolean => {
    if (!assinatura?.plano?.max_funcionarios) return false
    return quantidadeAtual < assinatura.plano.max_funcionarios
  }

  const podeEnviarAlerta = (alertasEnviadosEsteMes: number): boolean => {
    const limite = assinatura?.plano?.alertas_mes
    if (limite === null) return true // ilimitado
    return alertasEnviadosEsteMes < (limite || 0)
  }

  const temAcessoRecurso = (recurso: keyof PlanoDB): boolean => {
    if (!assinatura?.plano) return false
    const valor = assinatura.plano[recurso]
    return typeof valor === 'boolean' ? valor : true
  }

  const getLimiteFuncionarios = (): number => {
    return assinatura?.plano?.max_funcionarios || 0
  }

  const getLimiteUsuariosRH = (): number => {
    return assinatura?.plano?.max_usuarios_rh || 0
  }

  const getAlertasRestantes = (alertasUsados: number): number => {
    const limite = assinatura?.plano?.alertas_mes
    if (limite === null) return Infinity // ilimitado
    return Math.max(0, (limite || 0) - alertasUsados)
  }

  // ========== VALORES DERIVADOS ==========
  const temAssinaturaAtiva = !!(assinatura && assinatura.status === 'ativa')
  const planoAtual = assinatura?.plano || null

  // Recursos específicos
  const temDashboardBasico = temAcessoRecurso('dashboard_basico')
  const temDashboardFiltros = temAcessoRecurso('dashboard_filtros')
  const temDashboardGerencial = temAcessoRecurso('dashboard_gerencial')
  const temRelatorioCustomizado = temAcessoRecurso('relatorio_customizado')
  const temExportacaoGraficos = temAcessoRecurso('exportacao_graficos')
  const temSuportePrioritario = temAcessoRecurso('suporte_prioritario')

  return {
    assinatura,
    loading,
    user,
    temAssinaturaAtiva,
    planoAtual,
    // Funções
    podeAdicionarFuncionario,
    podeEnviarAlerta,
    temAcessoRecurso,
    getLimiteFuncionarios,
    getLimiteUsuariosRH,
    getAlertasRestantes,
    // Recursos
    temDashboardBasico,
    temDashboardFiltros,
    temDashboardGerencial,
    temRelatorioCustomizado,
    temExportacaoGraficos,
    temSuportePrioritario,
    // Recarregar
    recarregarAssinatura
  }
}

// ========== EXEMPLO DE USO ==========
/*
import { useAssinatura } from '@/lib/hooks/useAssinatura'

function MeuComponente() {
  const {
    assinatura,
    loading,
    temAssinaturaAtiva,
    planoAtual,
    podeAdicionarFuncionario,
    getLimiteFuncionarios,
    temDashboardGerencial
  } = useAssinatura()

  if (loading) return <div>Carregando...</div>

  if (!temAssinaturaAtiva) {
    return <div>Você precisa de uma assinatura ativa</div>
  }

  return (
    <div>
      <h1>Plano: {planoAtual?.nome}</h1>
      <p>Limite de funcionários: {getLimiteFuncionarios()}</p>
      
      {temDashboardGerencial ? (
        <DashboardGerencial />
      ) : (
        <DashboardBasico />
      )}
    </div>
  )
}
*/