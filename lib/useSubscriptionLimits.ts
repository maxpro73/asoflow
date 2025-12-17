// @/hooks/useSubscriptionLimits.ts
import { useSubscriptionStore } from '@/lib/subscription-store' // Importação nomeada

export const useSubscriptionLimits = () => {
  const { 
    currentSubscription, 
    limits, 
    checkLimit, 
    getRemaining,
    availablePlans 
  } = useSubscriptionStore()

  const canAddUser = (): boolean => checkLimit('users')
  const canAddASO = (): boolean => checkLimit('asos')
  const canAddCompany = (): boolean => checkLimit('companies')

  const getRemainingUsers = (): number => getRemaining('users')
  const getRemainingASOs = (): number => getRemaining('asos')
  const getRemainingCompanies = (): number => getRemaining('companies')

  const isSubscriptionActive = (): boolean => {
    return currentSubscription?.status === 'active'
  }

  const getCurrentPlan = () => {
    return availablePlans.find((plan: any) => plan.id === currentSubscription?.planId)
  }

  const getUpgradePlan = () => {
    const currentPlan = getCurrentPlan()
    if (!currentPlan) return availablePlans[0]
    
    const currentIndex = availablePlans.findIndex((plan: any) => plan.id === currentPlan.id)
    return availablePlans[currentIndex + 1] || null
  }

  return {
    currentSubscription,
    limits,
    canAddUser,
    canAddASO,
    canAddCompany,
    getRemainingUsers,
    getRemainingASOs,
    getRemainingCompanies,
    isSubscriptionActive,
    getCurrentPlan,
    getUpgradePlan,
    availablePlans
  }
}