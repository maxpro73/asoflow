// components/dashboard/subscription-lock.tsx
import { Lock, Zap, Users, BarChart3, Shield, CheckCircle } from "lucide-react"

interface SubscriptionLockProps {
  onReactivate: () => void
}

export default function SubscriptionLock({ onReactivate }: SubscriptionLockProps) {
  const features = [
    {
      icon: Users,
      title: "Gestão de Funcionários",
      description: "Controle completo da sua equipe"
    },
    {
      icon: Shield,
      title: "Gestão de ASOs",
      description: "Todos os certificados de saúde ocupacional"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Análises detalhadas e insights"
    },
    {
      icon: Zap,
      title: "Alertas Automáticos",
      description: "Notificações de vencimento em tempo real"
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Ícone de Cadeado */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                BLOQUEADO
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem Principal */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Assinatura Cancelada
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Seu acesso ao ASOflow foi suspenso. Reative sua assinatura para continuar 
            gerenciando a saúde ocupacional da sua empresa.
          </p>
        </div>

        {/* Recursos Bloqueados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex-shrink-0">
                <feature.icon className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefícios da Reativação */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-3">
            🎯 O que você ganha ao reativar:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Acesso imediato liberado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Dados preservados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Suporte prioritário</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Atualizações gratuitas</span>
            </div>
          </div>
        </div>

        {/* Botão de Reativação */}
        <div className="space-y-4">
          <button
            onClick={onReactivate}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-lg"
          >
            🔓 Reativar Assinatura no Mercado Pago
          </button>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirecionamento seguro para o Mercado Pago
          </p>
        </div>

        {/* Informação de Suporte */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Precisa de ajuda?{" "}
            <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Entre em contato com nosso suporte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}