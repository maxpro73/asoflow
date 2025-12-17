"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

export function PaymentFeedback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (status && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      // Remover o parâmetro status da URL após o countdown
      router.replace('/planos')
    }
  }, [countdown, status, router])

  // Se não houver status, não mostrar nada
  if (!status) return null

  const feedbackConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      title: 'Pagamento Aprovado! 🎉',
      message: 'Seu pagamento foi processado com sucesso. Sua assinatura já está ativa!',
      action: 'Seu plano será atualizado em instantes.'
    },
    failure: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      title: 'Pagamento Recusado',
      message: 'Não foi possível processar seu pagamento. Por favor, tente novamente.',
      action: 'Você pode tentar com outro método de pagamento.'
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      title: 'Pagamento Pendente',
      message: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
      action: 'Avisaremos por email quando o pagamento for confirmado.'
    }
  }

  const config = feedbackConfig[status as keyof typeof feedbackConfig]

  if (!config) {
    return (
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-gray-500" />
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Status de pagamento desconhecido
            </p>
          </div>
        </div>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <div className={`mb-6 p-6 rounded-xl ${config.bgColor} border ${config.borderColor} shadow-sm animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className="flex items-start gap-4">
        <Icon className={`w-8 h-8 ${config.color} flex-shrink-0 mt-1`} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {config.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {config.message}
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            {config.action}
          </p>
          
          {status === 'failure' && (
            <button
              onClick={() => router.replace('/planos')}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tentar Novamente
            </button>
          )}

          <div className="mt-4 pt-4 border-t border-current/10">
            <p className="text-xs text-muted-foreground">
              Esta mensagem será fechada automaticamente em {countdown} segundo{countdown !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}