import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { useAuthStore } from '@/lib/auth-store'

interface PlanLimits {
  planId: string
  planName: string
  maxEmployees: number
  maxCertificates: number
  maxRHUsers: number
  currentEmployees: number
  currentCertificates: number
  currentRHUsers: number
  canAddEmployee: boolean
  canAddCertificate: boolean
  canAddRHUser: boolean
  loading: boolean
  isAuthenticated: boolean
  lastUpdated: Date | null
  certificadosIlimitados: boolean
  isTrialUser: boolean
}

// Cache válido por 10 minutos
const CACHE_TTL = 10 * 60 * 1000

// Função auxiliar para validar UUID
const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id || id === 'undefined' || id === 'null') return false
  if (id.startsWith('temp_')) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function usePlanLimits(
  employeesCount: number = 0, 
  certificatesCount: number = 0,
  rhUsersCount: number = 0
): PlanLimits {
  const [limits, setLimits] = useState<PlanLimits>({
    planId: '',
    planName: 'Carregando...',
    maxEmployees: 0,
    maxCertificates: 0,
    maxRHUsers: 0,
    currentEmployees: employeesCount,
    currentCertificates: certificatesCount,
    currentRHUsers: rhUsersCount,
    canAddEmployee: false,
    canAddCertificate: false,
    canAddRHUser: false,
    loading: true,
    isAuthenticated: false,
    lastUpdated: null,
    certificadosIlimitados: false,
    isTrialUser: false
  })

  const { isAuthenticated, user, sessionChecked, loading: authLoading } = useAuthStore()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const loadPlanLimits = async () => {
      // Cancelar requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      try {
        console.log('🔄 [usePlanLimits] Iniciando...', {
          isAuthenticated,
          userId: user?.id,
          sessionChecked,
          authLoading
        })

        // 1. AGUARDAR AUTENTICAÇÃO CARREGAR
        if (authLoading || !sessionChecked) {
          console.log('⏳ Aguardando auth carregar...')
          if (isMounted) {
            setLimits(prev => ({ ...prev, loading: true }))
          }
          return
        }

        // 2. VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO
        if (!isAuthenticated || !user || !isValidUUID(user.id)) {
          console.log('🔒 Usuário não autenticado ou ID inválido')
          
          if (isMounted) {
            setLimits({
              planId: '',
              planName: 'Sem acesso',
              maxEmployees: 0,
              maxCertificates: 0,
              maxRHUsers: 0,
              currentEmployees: employeesCount,
              currentCertificates: certificatesCount,
              currentRHUsers: rhUsersCount,
              canAddEmployee: false,
              canAddCertificate: false,
              canAddRHUser: false,
              loading: false,
              isAuthenticated: false,
              lastUpdated: new Date(),
              certificadosIlimitados: false,
              isTrialUser: false
            })
          }
          return
        }

        const userId = user.id
        console.log('✅ Usuário autenticado com UUID válido:', userId)

        // 3. VERIFICAR CACHE VÁLIDO
        const cachedData = localStorage.getItem('cachedPlanData')
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData)
            const isCacheValid = 
              parsed.userId === userId &&
              parsed.timestamp &&
              Date.now() - parsed.timestamp < CACHE_TTL
            
            if (isCacheValid) {
              console.log('📦 Usando cache válido:', parsed.planName)
              
              if (isMounted) {
                setLimits({
                  planId: parsed.planId,
                  planName: parsed.planName,
                  maxEmployees: parsed.maxEmployees,
                  maxCertificates: parsed.maxCertificates,
                  maxRHUsers: parsed.maxRHUsers,
                  currentEmployees: employeesCount,
                  currentCertificates: certificatesCount,
                  currentRHUsers: rhUsersCount,
                  canAddEmployee: employeesCount < parsed.maxEmployees,
                  canAddCertificate: parsed.certificadosIlimitados 
                    ? true 
                    : certificatesCount < parsed.maxCertificates,
                  canAddRHUser: rhUsersCount < parsed.maxRHUsers,
                  loading: false,
                  isAuthenticated: true,
                  lastUpdated: new Date(parsed.timestamp),
                  certificadosIlimitados: parsed.certificadosIlimitados || false,
                  isTrialUser: false
                })
              }
              return
            }
          } catch (e) {
            console.warn('⚠️ Cache inválido, buscando do banco...')
          }
        }

        // 4. BUSCAR DADOS DO BANCO
        console.log('🗄️ Buscando dados do banco...')
        
        // Buscar plano do usuário
        let planId = 'essencial_mensal' // Plano padrão
        
        // Se usuário já tem plano_id no store, usar
        if (user.plano_id) {
          planId = user.plano_id
          console.log('📋 Usando plano do store:', planId)
        } else {
          // Buscar da tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('plano_id')
            .eq('id', userId)
            .maybeSingle()

          if (userError) {
            console.error('❌ Erro ao buscar usuário:', userError.message)
          } else if (userData?.plano_id) {
            planId = userData.plano_id
            console.log('📋 Plano encontrado no banco:', planId)
          }
        }

        // Buscar detalhes do plano
        const { data: planData, error: planError } = await supabase
          .from('planos')
          .select('*')
          .eq('id', planId)
          .eq('ativo', true)
          .maybeSingle()

        if (planError) {
          console.error('❌ Erro ao buscar plano:', planError.message)
        }

        if (!planData) {
          console.error('❌ Plano não encontrado ou inativo:', planId)
          
          if (isMounted) {
            setLimits({
              planId: 'erro',
              planName: 'Plano não encontrado',
              maxEmployees: 0,
              maxCertificates: 0,
              maxRHUsers: 0,
              currentEmployees: employeesCount,
              currentCertificates: certificatesCount,
              currentRHUsers: rhUsersCount,
              canAddEmployee: false,
              canAddCertificate: false,
              canAddRHUser: false,
              loading: false,
              isAuthenticated: true,
              lastUpdated: new Date(),
              certificadosIlimitados: false,
              isTrialUser: false
            })
          }
          return
        }

        console.log('✅ Plano encontrado:', {
          id: planData.id,
          nome: planData.nome,
          max_certificados: planData.max_certificados,
          ilimitados: planData.certificados_ilimitados
        })

        // Extrair limites
        const planLimits = {
          planId: planData.id,
          planName: planData.nome,
          maxEmployees: planData.max_funcionarios || 0,
          maxCertificates: planData.max_certificados || 0,
          maxRHUsers: planData.max_usuarios_rh || 0,
          certificadosIlimitados: planData.certificados_ilimitados || false
        }

        // 5. SALVAR NO CACHE
        const cacheToSave = {
          ...planLimits,
          userId,
          timestamp: Date.now()
        }
        localStorage.setItem('cachedPlanData', JSON.stringify(cacheToSave))

        // 6. ATUALIZAR STATE
        if (isMounted) {
          setLimits({
            ...planLimits,
            currentEmployees: employeesCount,
            currentCertificates: certificatesCount,
            currentRHUsers: rhUsersCount,
            canAddEmployee: employeesCount < planLimits.maxEmployees,
            canAddCertificate: planLimits.certificadosIlimitados 
              ? true 
              : certificatesCount < planLimits.maxCertificates,
            canAddRHUser: rhUsersCount < planLimits.maxRHUsers,
            loading: false,
            isAuthenticated: true,
            lastUpdated: new Date(),
            isTrialUser: false
          })
        }

        console.log('🎯 Limites carregados:', planLimits)

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('⏹️ Requisição cancelada')
          return
        }
        
        console.error('💥 Erro ao carregar limites:', error)
        
        if (isMounted) {
          setLimits({
            planId: 'erro',
            planName: 'Erro ao carregar',
            maxEmployees: 0,
            maxCertificates: 0,
            maxRHUsers: 0,
            currentEmployees: employeesCount,
            currentCertificates: certificatesCount,
            currentRHUsers: rhUsersCount,
            canAddEmployee: false,
            canAddCertificate: false,
            canAddRHUser: false,
            loading: false,
            isAuthenticated: isAuthenticated,
            lastUpdated: new Date(),
            certificadosIlimitados: false,
            isTrialUser: false
          })
        }
      }
    }

    // Delay para evitar múltiplas execuções rápidas
    const timer = setTimeout(loadPlanLimits, 100)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [
    isAuthenticated, 
    user?.id, 
    user?.plano_id,
    sessionChecked,
    authLoading,
    employeesCount, 
    certificatesCount, 
    rhUsersCount
  ])

  return limits
}