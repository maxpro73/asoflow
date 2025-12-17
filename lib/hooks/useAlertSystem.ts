// hooks/useAlertSystem.ts (atualizado)
import { useEffect } from 'react'
import { useSubscriptionLimits } from '@/lib/useSubscriptionLimits'
import { useAlertStore } from '@/lib/alert-store'
import { sendWhatsAppAlert } from '@/lib/whatsapp-service'

export const useAlertSystem = () => {
  const { limits, getRemainingUsers, getRemainingASOs, getRemainingCompanies, currentSubscription } = useSubscriptionLimits()
  const { addAlert } = useAlertStore()

  useEffect(() => {
    // Verificar limites de usuários
    const remainingUsers = getRemainingUsers()
    const userUsagePercent = (limits.currentUsers / limits.maxUsers) * 100

    if (userUsagePercent >= 80 && userUsagePercent < 100) {
      const alert = {
        type: 'warning' as const,
        title: 'Limite de usuários próximo',
        message: `Você está usando ${limits.currentUsers} de ${limits.maxUsers} usuários. Restam ${remainingUsers}.`,
        actionUrl: '/settings/users',
        actionLabel: 'Gerenciar usuários',
      }
      addAlert(alert)

      // Enviar WhatsApp se tiver o número do usuário
      // Aqui você precisaria ter o número do usuário armazenado em algum lugar
      // Exemplo: const userPhone = user.phone;
      // if (userPhone) {
      //   sendWhatsAppAlert({
      //     to: userPhone,
      //     message: `ASOflow: ${alert.title}. ${alert.message}`
      //   });
      // }
    } else if (userUsagePercent >= 100) {
      const alert = {
        type: 'error' as const,
        title: 'Limite de usuários atingido',
        message: `Você atingiu o limite de ${limits.maxUsers} usuários. Não é possível adicionar mais.`,
        actionUrl: '/upgrade',
        actionLabel: 'Fazer upgrade',
      }
      addAlert(alert)

      // Enviar WhatsApp para limite atingido
      // if (userPhone) {
      //   sendWhatsAppAlert({
      //     to: userPhone,
      //     message: `ASOflow: ${alert.title}. ${alert.message}`
      //   });
      // }
    }

    // ... (outros alertas para ASOs e empresas)

  }, [limits, currentSubscription, addAlert, getRemainingUsers, getRemainingASOs, getRemainingCompanies])
}