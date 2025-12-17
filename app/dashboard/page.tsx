"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Search, Settings, Menu, X, Home, Users, FileText, CreditCard, BarChart3, Bell } from "lucide-react"

// Importar os componentes de cada seção
import DashboardView from "@/components/dashboard/dashboard-view"
import FuncionariosView from "@/components/dashboard/funcionarios-view"
import CertificadosView from "@/components/dashboard/certificados-view"
import PlanosView from "@/components/dashboard/planos-view"
import RelatoriosView from "@/components/dashboard/relatorios-view"
import SubscriptionLock from "@/components/dashboard/subscription-lock"
import NotificacoesView from "@/components/dashboard/notificacoes-view"

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [currentView, setCurrentView] = useState('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Verificar status da assinatura ao carregar
  useEffect(() => {
    const subscriptionStatus = localStorage.getItem('asoflow_subscription_active')
    setIsSubscriptionActive(subscriptionStatus !== 'false')
  }, [])

  const handleCancelSubscription = () => {
    setIsSubscriptionActive(false)
    localStorage.setItem('asoflow_subscription_active', 'false')
  }

  const handleReactivateSubscription = () => {
    window.open('https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PLAN_ID', '_blank')
    setTimeout(() => {
      setIsSubscriptionActive(true)
      localStorage.setItem('asoflow_subscription_active', 'true')
    }, 2000)
  }

  if (!isAuthenticated) {
    return null
  }

  const handleSettingsClick = () => {
    setShowSettings(!showSettings)
  }

  const handleCompanyProfile = () => {
    console.log('🏢 Navegando para Perfil da Empresa')
    setShowSettings(false)
    setIsMobileMenuOpen(false)
    router.push('/settings/empresa')
  }

  const handleSettingsSection = () => {
    console.log('⚙️ Navegando para Configurações')
    setShowSettings(false)
    setIsMobileMenuOpen(false)
    router.push('/settings/configuracoes')
  }

  // 🔥 FUNÇÃO DE LOGOUT CORRIGIDA E COM LOGS
  const handleLogout = async () => {
    console.log('🖱️ handleLogout chamado!')
    
    if (!confirm("Tem certeza que deseja sair do sistema?")) {
      console.log('❌ Logout cancelado pelo usuário')
      return
    }

    try {
      console.log('🚪 Iniciando processo de logout...')
      
      // 1. Limpar localStorage
      const itemsToRemove = [
        'token',
        'user',
        'assinatura',
        'auth-token',
        'session',
        'asoflow_subscription_active'
      ]
      
      itemsToRemove.forEach(item => {
        localStorage.removeItem(item)
        sessionStorage.removeItem(item)
        console.log(`🗑️ Removido: ${item}`)
      })
      
      console.log('✅ LocalStorage limpo')
      
      // 2. Limpar cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      console.log('✅ Cookies limpos')
      
      // 3. Limpar store de autenticação (Zustand)
      try {
        if (useAuthStore.getState().logout) {
          useAuthStore.getState().logout()
          console.log('✅ Zustand store limpo')
        }
      } catch (error) {
        console.log('⚠️ Erro ao limpar Zustand:', error)
      }
      
      // 4. Logout do Supabase (se estiver usando)
      try {
        const { supabase } = await import('@/lib/supabase/supabaseClient')
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('⚠️ Erro ao fazer logout no Supabase:', error)
        } else {
          console.log('✅ Logout do Supabase concluído')
        }
      } catch (error) {
        console.log('⚠️ Supabase não configurado ou erro:', error)
      }

      // 5. Chamar API de logout customizada (se existir)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        })
        console.log('✅ API de logout chamada')
      } catch (error) {
        console.log('⚠️ API de logout não disponível:', error)
      }

      console.log('✅ Logout concluído, redirecionando para /login...')
      
      // 6. Fechar menus
      setShowSettings(false)
      setIsMobileMenuOpen(false)
      
      // 7. Redirecionar para login (forçar reload completo)
      window.location.href = '/login'
      
    } catch (error) {
      console.error('❌ Erro crítico ao fazer logout:', error)
      // Mesmo com erro, tenta redirecionar
      window.location.href = '/login'
    }
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view)
    setIsMobileMenuOpen(false)
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'funcionarios', label: 'Funcionários', icon: Users },
    { id: 'certificados', label: 'Certificados', icon: FileText },
    { id: 'planos', label: 'Planos', icon: CreditCard },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ]

  const renderContent = () => {
    if (currentView === 'planos') {
      return (
        <PlanosView 
          onCancelSubscription={handleCancelSubscription}
          isSubscriptionActive={isSubscriptionActive}
          onReactivate={handleReactivateSubscription}
        />
      )
    }

    if (!isSubscriptionActive) {
      return <SubscriptionLock onReactivate={handleReactivateSubscription} />
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'funcionarios':
        return <FuncionariosView />
      case 'certificados':
        return <CertificadosView />
      case 'relatorios':
        return <RelatoriosView />
      case 'notificacoes':
        return <NotificacoesView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#f6f7f8] dark:bg-[#101922]">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-4 lg:px-10 py-3 bg-white dark:bg-[#101922] z-30 relative">
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <img 
              src="/logo-briefcase.png" 
              alt="ASOflow Logo" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-lg font-bold">ASOflow</h2>
          </div>
          
          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`text-sm ${
                currentView === 'dashboard' 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              } ${!isSubscriptionActive && currentView !== 'dashboard' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isSubscriptionActive && currentView !== 'dashboard'}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('funcionarios')}
              className={`text-sm ${
                currentView === 'funcionarios' 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              } ${!isSubscriptionActive && currentView !== 'funcionarios' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isSubscriptionActive && currentView !== 'funcionarios'}
            >
              Funcionários
            </button>
            <button 
              onClick={() => setCurrentView('certificados')}
              className={`text-sm ${
                currentView === 'certificados' 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              } ${!isSubscriptionActive && currentView !== 'certificados' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isSubscriptionActive && currentView !== 'certificados'}
            >
              Certificados
            </button>
            <button 
              onClick={() => setCurrentView('planos')}
              className={`text-sm ${
                currentView === 'planos' 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Planos
            </button>
            <button 
              onClick={() => setCurrentView('relatorios')}
              className={`text-sm ${
                currentView === 'relatorios' 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              } ${!isSubscriptionActive && currentView !== 'relatorios' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isSubscriptionActive && currentView !== 'relatorios'}
            >
              Relatórios
            </button>
            <button 
              onClick={() => setCurrentView('notificacoes')}
              className={`text-sm ${
                currentView === 'notificacoes' 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              } ${!isSubscriptionActive && currentView !== 'notificacoes' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isSubscriptionActive && currentView !== 'notificacoes'}
            >
              Notificações
            </button>
          </nav>
        </div>

        <div className="flex flex-1 justify-end items-center gap-2 lg:gap-4">
          <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64">
            <div className="flex w-full items-stretch rounded-lg h-full">
              <div className="flex bg-slate-100 dark:bg-slate-800 items-center justify-center pl-3 rounded-l-lg">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <input 
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-r-lg px-4 text-sm border-none focus:outline-none focus:ring-0"
                placeholder="Pesquisar"
                disabled={!isSubscriptionActive}
              />
            </div>
          </label>
          <div className="flex gap-2 relative">
            <button 
              onClick={handleSettingsClick}
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showSettings && (
              <div 
                className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-[60]"
                onClick={(e) => e.stopPropagation()} // ← CORREÇÃO AQUI
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Configurações</h3>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      console.log('🖱️ Botão Perfil da Empresa clicado')
                      handleCompanyProfile()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Perfil da Empresa
                  </button>
                  <button 
                    onClick={() => {
                      console.log('🖱️ Botão Configurações clicado')
                      handleSettingsSection()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Configurações
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                    <button 
                      onClick={() => {
                        console.log('🖱️ Botão Sair clicado')
                        handleLogout()
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                    >
                      Sair do Sistema
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {!isSubscriptionActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Assinatura Cancelada
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
          </div>
        </div>
      </header>

      {/* OVERLAY DO MENU MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* DRAWER MENU MOBILE */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-briefcase.png" 
              alt="ASOflow Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">ASOflow</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gestão de ASO</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const isDisabled = !isSubscriptionActive && item.id !== 'planos'
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && handleViewChange(item.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                    : isDisabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="text-left">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mx-4 my-4 border-t border-slate-200 dark:border-slate-700" />

        {!isSubscriptionActive && (
          <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm font-medium mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Assinatura Cancelada
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Acesse a seção Planos para reativar
            </p>
          </div>
        )}

        <div className="px-4 space-y-2">
          <button 
            onClick={() => {
              console.log('🖱️ Botão Perfil (mobile) clicado')
              handleCompanyProfile()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Perfil da Empresa</span>
          </button>
          
          <button 
            onClick={() => {
              console.log('🖱️ Botão Configurações (mobile) clicado')
              handleSettingsSection()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
          
          <button 
            onClick={() => {
              console.log('🖱️ Botão Sair (mobile) clicado')
              handleLogout()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>

      {/* OVERLAY DO DROPDOWN SETTINGS (apenas para desktop) */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-40 hidden md:block"
          onClick={() => setShowSettings(false)}
        />
      )}

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="px-4 sm:px-6 lg:px-10 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR (só mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-1 py-2 z-20 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center max-w-md mx-auto gap-1">
          {[
            { id: 'dashboard', label: 'Início', icon: Home },
            { id: 'funcionarios', label: 'Equipe', icon: Users },
            { id: 'certificados', label: 'ASOs', icon: FileText },
            { id: 'notificacoes', label: 'Avisos', icon: Bell },
          ].map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const isDisabled = !isSubscriptionActive && item.id !== 'planos'
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setCurrentView(item.id)}
                disabled={isDisabled}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all flex-1 max-w-[80px] ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : isDisabled
                    ? 'text-slate-300 dark:text-slate-600'
                    : 'text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform flex-shrink-0`} />
                <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}