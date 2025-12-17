"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { 
  Home, Users, Mail, FileText, Settings, CreditCard, 
  Building2, User, LogOut, Bell, Shield, ChevronDown 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/employees", icon: Users, label: "Funcionários" },
  { href: "/alerts", icon: Mail, label: "Alertas" },
  { href: "/reports", icon: FileText, label: "Relatórios" },
  { href: "/planos", icon: CreditCard, label: "Planos" },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  // Função de logout
  const handleLogout = () => {
    setIsLoggingOut(true)

    try {
      // Limpar dados do usuário
      localStorage.removeItem("asoflow_user")
      localStorage.removeItem("asoflow_token")
      localStorage.removeItem("asoflow_payment")
      sessionStorage.clear()

    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error)
    }

    // Redirecionar para login
    setTimeout(() => {
      router.push("/login")
    }, 500)
  }

  const menuItems = [
    {
      icon: Building2,
      label: "Perfil da Empresa",
      action: () => {
        setIsMenuOpen(false)
        router.push("/perfil")
      },
    },
    {
      icon: User,
      label: "Minha Conta",
      action: () => {
        setIsMenuOpen(false)
        router.push("/settings")
      },
    },
    {
      icon: Bell,
      label: "Notificações",
      action: () => {
        setIsMenuOpen(false)
        router.push("/alerts")
      },
    },
    {
      icon: Shield,
      label: "Segurança",
      action: () => {
        setIsMenuOpen(false)
        router.push("/security")
      },
    },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image 
              src="/logo-briefcase.png" 
              alt="ASOflow" 
              width={40} 
              height={40} 
              className="w-8 h-8"
              priority
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">ASOflow</h1>
            <p className="text-xs text-sidebar-foreground/60">Gestão de ASO</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer com Menu de Configurações */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        
        {/* Botão de Configurações com Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isMenuOpen
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            aria-label="Configurações do sistema"
          >
            <Settings className={cn("w-5 h-5 transition-transform", isMenuOpen && "rotate-90")} />
            <span className="font-medium flex-1 text-left">Configurações</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", isMenuOpen && "rotate-180")} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-sidebar border border-sidebar-border rounded-lg shadow-xl overflow-hidden z-50 min-w-[240px]"
              role="menu"
              aria-orientation="vertical"
            >
              
              {/* Cabeçalho do Menu */}
              <div className="px-4 py-3 border-b border-sidebar-border bg-sidebar-accent/50">
                <h3 className="font-semibold text-sm text-sidebar-foreground">Configurações</h3>
              </div>

              {/* Menu Items */}
              <div className="py-2" role="none">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => item.action()}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Separador para Logout */}
              <div className="border-t border-sidebar-border pt-2" role="none">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleLogout()
                  }}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left disabled:opacity-50"
                  role="menuitem"
                  tabIndex={0}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isLoggingOut ? "Saindo..." : "Sair do Sistema"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toggle de Tema */}
        <ThemeToggle />
        
        {/* Versão */}
        <p className="text-xs text-sidebar-foreground/60 text-center">v1.0.0</p>
      </div>
    </aside>
  )
}