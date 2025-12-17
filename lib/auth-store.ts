// store/auth-store.ts - VERSÃO PARA PAGAMENTO PRIMEIRO
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from '@/lib/supabase/supabaseClient'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name?: string
  company?: string
  phone?: string
  plano_id?: string
  payment_status?: 'pending' | 'paid' | 'failed' // Novo campo
}

interface AuthState {
  isAuthenticated: boolean
  userEmail: string | null
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  sessionChecked: boolean
  
  // Actions
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  createAccountAfterPayment: (userData: {
    email: string
    password: string
    nome: string
    empresa: string
    telefone: string
    plano_id: string
    payment_id: string
  }) => Promise<{ success: boolean; error?: string; userId?: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<void>
  syncUserFromDatabase: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userEmail: null,
      user: null,
      supabaseUser: null,
      loading: true,
      sessionChecked: false,

      // 🔐 LOGIN NORMAL (mantém igual - mas implementado corretamente)
      loginWithSupabase: async (email: string, password: string) => {
        try {
          set({ loading: true })
          
          console.log('🔐 Tentando login no Supabase:', email)
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            console.error('❌ Erro no login:', error)
            
            let userMessage = error.message
            
            if (error.message === 'Invalid login credentials') {
              userMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
            } else if (error.message.includes('Email not confirmed')) {
              userMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
            }
            
            return { 
              success: false, 
              error: userMessage 
            }
          }

          if (data.user) {
            console.log('✅ Login bem-sucedido:', data.user.id)
            
            // Sincronizar com banco de dados
            await get().syncUserFromDatabase()
            
            return { success: true }
          }

          return { success: false, error: 'Erro desconhecido no login' }
          
        } catch (error) {
          console.error('💥 Erro no login:', error)
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          }
        } finally {
          set({ loading: false })
        }
      },

      // 🆕 MÉTODO NOVO: CRIAR CONTA APÓS PAGAMENTO
      createAccountAfterPayment: async (userData) => {
        try {
          set({ loading: true })
          
          console.log('💰 Criando conta após pagamento confirmado:', userData.email)
          
          // 1. Cria usuário no Auth do Supabase
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                nome: userData.nome,
                empresa: userData.empresa,
                telefone: userData.telefone
              }
            }
          })

          if (authError) {
            console.error('❌ Erro ao criar conta auth:', authError)
            return { 
              success: false, 
              error: 'Erro ao criar conta. Verifique se o email já existe.' 
            }
          }

          if (!authData.user) {
            return { 
              success: false, 
              error: 'Usuário não criado no auth' 
            }
          }

          // 2. Cria registro na tabela users
          const { error: dbError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: userData.email,
              nome: userData.nome,
              empresa: userData.empresa,
              telefone: userData.telefone,
              plano_id: userData.plano_id,
              payment_id: userData.payment_id, // ID do pagamento no Mercado Pago
              payment_status: 'paid',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (dbError) {
            console.error('❌ Erro ao criar registro na tabela:', dbError)
            
            // Tenta apagar o usuário do auth se falhou na tabela
            // Nota: Precisa de service role key para isso
            try {
              await supabase.auth.admin.deleteUser(authData.user.id)
            } catch (deleteError) {
              console.error('⚠️ Não foi possível apagar usuário:', deleteError)
            }
            
            return { 
              success: false, 
              error: 'Erro ao salvar dados do usuário' 
            }
          }

          console.log('✅ Conta criada com sucesso após pagamento:', authData.user.id)
          
          return { 
            success: true,
            userId: authData.user.id
          }
          
        } catch (error) {
          console.error('💥 Erro ao criar conta:', error)
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido' 
          }
        } finally {
          set({ loading: false })
        }
      },

      // 🚪 LOGOUT
      logout: async () => {
        console.log('🚪 Fazendo logout...')
        
        try {
          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error('Erro ao fazer logout:', error)
          }
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
        }
        
        // Limpar localStorage
        const keysToRemove = [
          'cachedPlanData',
          'cachedUserId', 
          'userPlanId',
          'user_id',
          'user_email',
          'user_name',
          'pending_account' // Novo: limpar dados pendentes
        ]
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        set({ 
          isAuthenticated: false, 
          userEmail: null,
          user: null,
          supabaseUser: null,
          loading: false,
          sessionChecked: true
        })
      },

      // 🔄 VERIFICAR SESSÃO
      checkSession: async () => {
        try {
          console.log('🔄 Verificando sessão...')
          set({ loading: true })
          
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('❌ Erro ao verificar sessão:', error)
            set({ 
              isAuthenticated: false,
              userEmail: null,
              user: null,
              supabaseUser: null,
              loading: false,
              sessionChecked: true
            })
            return
          }

          if (data.session?.user) {
            console.log('✅ Sessão ativa encontrada')
            
            // Sincronizar com banco de dados
            await get().syncUserFromDatabase()
          } else {
            console.log('👎 Nenhuma sessão ativa')
            set({
              isAuthenticated: false,
              userEmail: null,
              user: null,
              supabaseUser: null,
              loading: false,
              sessionChecked: true
            })
          }
        } catch (error) {
          console.error('💥 Erro ao verificar sessão:', error)
          set({
            isAuthenticated: false,
            userEmail: null,
            user: null,
            supabaseUser: null,
            loading: false,
            sessionChecked: true
          })
        }
      },

      // 🔄 SINCRONIZAR USUÁRIO DO BANCO DE DADOS
      syncUserFromDatabase: async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          const supabaseUser = sessionData.session?.user
          
          if (!supabaseUser) {
            console.log('❌ Nenhum usuário na sessão')
            set({
              isAuthenticated: false,
              userEmail: null,
              user: null,
              supabaseUser: null,
              loading: false,
              sessionChecked: true
            })
            return
          }

          console.log('🔄 Sincronizando dados do usuário:', supabaseUser.id)
          
          // Buscar dados completos da tabela users
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .maybeSingle()

          if (error) {
            console.error('❌ Erro ao buscar dados do usuário:', error)
            return
          }

          if (userData) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.nome,
              company: userData.empresa,
              phone: userData.telefone,
              plano_id: userData.plano_id,
              payment_status: userData.payment_status
            }

            console.log('✅ Usuário sincronizado:', {
              id: user.id,
              email: user.email,
              plano_id: user.plano_id,
              payment_status: user.payment_status
            })

            set({
              isAuthenticated: true,
              userEmail: user.email,
              user,
              supabaseUser,
              loading: false,
              sessionChecked: true
            })

            // Salvar no localStorage
            localStorage.setItem('user_id', user.id)
            localStorage.setItem('user_email', user.email)
            localStorage.setItem('user_name', user.name || '')
          } else {
            console.warn('⚠️ Usuário não encontrado na tabela users')
          }
        } catch (error) {
          console.error('💥 Erro ao sincronizar usuário:', error)
          set({
            isAuthenticated: false,
            userEmail: null,
            user: null,
            supabaseUser: null,
            loading: false,
            sessionChecked: true
          })
        }
      },

      // ✏️ ATUALIZAR PERFIL
      updateUserProfile: async (updates: Partial<User>) => {
        const currentUser = get().user
        if (!currentUser) {
          throw new Error('Usuário não encontrado')
        }
        
        try {
          console.log('✏️ Atualizando perfil:', updates)
          
          const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', currentUser.id)
          
          if (error) {
            console.error('❌ Erro ao atualizar perfil:', error)
            throw error
          }
          
          // Atualizar store
          const updatedUser = { ...currentUser, ...updates }
          set({ user: updatedUser })
          
          console.log('✅ Perfil atualizado com sucesso')
        } catch (error) {
          console.error('💥 Erro ao atualizar perfil:', error)
          throw error
        }
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        user: state.user
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            console.log('🔄 Auth store re-hidratado:', {
              isAuthenticated: state.isAuthenticated,
              userEmail: state.userEmail,
              userId: state.user?.id
            })
          }
        }
      }
    }
  )
)