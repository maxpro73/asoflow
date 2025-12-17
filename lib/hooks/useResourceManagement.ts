// @/hooks/useResourceManagement.ts
import { useState } from 'react'
import { useSubscriptionLimits } from '@/lib/useSubscriptionLimits'
import { useSubscriptionStore } from '@/lib/subscription-store'

export const useResourceManagement = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [requiredFeature, setRequiredFeature] = useState('')
  const { updateUsage } = useSubscriptionStore()
  const {
    canAddUser,
    canAddASO,
    canAddCompany,
    getRemainingUsers,
    getRemainingASOs,
    getRemainingCompanies,
    limits
  } = useSubscriptionLimits()

  const addUser = (): boolean => {
    if (!canAddUser()) {
      setRequiredFeature('usuários')
      setShowUpgradeModal(true)
      return false
    }
    
    // Lógica para adicionar usuário
    updateUsage({ usersCount: limits.currentUsers + 1 })
    return true
  }

  const addASO = (): boolean => {
    if (!canAddASO()) {
      setRequiredFeature('ASOs')
      setShowUpgradeModal(true)
      return false
    }
    
    // Lógica para adicionar ASO
    updateUsage({ asosCount: limits.currentASOs + 1 })
    return true
  }

  const addCompany = (): boolean => {
    if (!canAddCompany()) {
      setRequiredFeature('empresas')
      setShowUpgradeModal(true)
      return false
    }
    
    // Lógica para adicionar empresa
    updateUsage({ companiesCount: limits.currentCompanies + 1 })
    return true
  }

  return {
    addUser,
    addASO,
    addCompany,
    showUpgradeModal,
    setShowUpgradeModal,
    requiredFeature,
    currentUsage: {
      users: limits.currentUsers,
      asos: limits.currentASOs,
      companies: limits.currentCompanies
    },
    currentLimits: {
      users: limits.maxUsers,
      asos: limits.maxASOs,
      companies: limits.maxCompanies
    },
    remaining: {
      users: getRemainingUsers(),
      asos: getRemainingASOs(),
      companies: getRemainingCompanies()
    }
  }
}