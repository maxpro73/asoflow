// @/lib/subscription-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SubscriptionPlan, UserSubscription, SubscriptionLimits } from '@/.next/dev/types/subscription'

interface SubscriptionState {
  currentSubscription: UserSubscription | null
  availablePlans: SubscriptionPlan[]
  limits: SubscriptionLimits
  isLoading: boolean
  
  // Actions
  setSubscription: (subscription: UserSubscription) => void
  updateUsage: (usage: Partial<UserSubscription['usage']>) => void
  checkLimit: (resource: 'users' | 'asos' | 'companies') => boolean
  getRemaining: (resource: 'users' | 'asos' | 'companies') => number
  resetSubscription: () => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentSubscription: null,
      availablePlans: [
        {
          id: 'basic',
          name: 'Básico',
          price: 99.90,
          currency: 'BRL',
          limits: {
            maxUsers: 5,
            maxASOs: 50,
            maxCompanies: 2,
            features: ['Até 5 usuários', '50 ASOs/mês', '2 empresas']
          },
          mercadoPagoPlanId: 'plan_basic_001',
          isActive: true
        },
        {
          id: 'professional',
          name: 'Profissional',
          price: 199.90,
          currency: 'BRL',
          limits: {
            maxUsers: 15,
            maxASOs: 200,
            maxCompanies: 5,
            features: ['Até 15 usuários', '200 ASOs/mês', '5 empresas', 'Suporte prioritário']
          },
          mercadoPagoPlanId: 'plan_pro_001',
          isActive: true
        },
        {
          id: 'enterprise',
          name: 'Empresarial',
          price: 399.90,
          currency: 'BRL',
          limits: {
            maxUsers: 50,
            maxASOs: 1000,
            maxCompanies: 20,
            features: ['Usuários ilimitados', '1000 ASOs/mês', '20 empresas', 'Suporte dedicado']
          },
          mercadoPagoPlanId: 'plan_enterprise_001',
          isActive: true
        }
      ],
      limits: {
        maxUsers: 0,
        maxASOs: 0,
        maxCompanies: 0,
        currentUsers: 0,
        currentASOs: 0,
        currentCompanies: 0
      },
      isLoading: false,

      setSubscription: (subscription: UserSubscription) => {
        const state = get()
        const plan = state.availablePlans.find(p => p.id === subscription.planId)
        
        if (plan) {
          set({
            currentSubscription: subscription,
            limits: {
              maxUsers: plan.limits.maxUsers,
              maxASOs: plan.limits.maxASOs,
              maxCompanies: plan.limits.maxCompanies,
              currentUsers: subscription.usage.usersCount,
              currentASOs: subscription.usage.asosCount,
              currentCompanies: subscription.usage.companiesCount
            }
          })
        } else {
          set({
            currentSubscription: subscription,
            limits: state.limits
          })
        }
      },

      updateUsage: (usage: Partial<UserSubscription['usage']>) => {
        const state = get()
        if (state.currentSubscription) {
          const updatedSubscription: UserSubscription = {
            ...state.currentSubscription,
            usage: {
              ...state.currentSubscription.usage,
              ...usage
            },
            updatedAt: new Date()
          }
          
          // Atualiza o estado diretamente
          const plan = state.availablePlans.find(p => p.id === updatedSubscription.planId)
          
          if (plan) {
            set({
              currentSubscription: updatedSubscription,
              limits: {
                maxUsers: plan.limits.maxUsers,
                maxASOs: plan.limits.maxASOs,
                maxCompanies: plan.limits.maxCompanies,
                currentUsers: updatedSubscription.usage.usersCount,
                currentASOs: updatedSubscription.usage.asosCount,
                currentCompanies: updatedSubscription.usage.companiesCount
              }
            })
          }
        }
      },

      checkLimit: (resource: 'users' | 'asos' | 'companies'): boolean => {
        const state = get()
        const resourceMap = {
          users: { current: 'currentUsers', max: 'maxUsers' },
          asos: { current: 'currentASOs', max: 'maxASOs' },
          companies: { current: 'currentCompanies', max: 'maxCompanies' }
        }
        
        const { current, max } = resourceMap[resource]
        return state.limits[current as keyof SubscriptionLimits] < state.limits[max as keyof SubscriptionLimits]
      },

      getRemaining: (resource: 'users' | 'asos' | 'companies'): number => {
        const state = get()
        const resourceMap = {
          users: { current: 'currentUsers', max: 'maxUsers' },
          asos: { current: 'currentASOs', max: 'maxASOs' },
          companies: { current: 'currentCompanies', max: 'maxCompanies' }
        }
        
        const { current, max } = resourceMap[resource]
        const currentValue = state.limits[current as keyof SubscriptionLimits] as number
        const maxValue = state.limits[max as keyof SubscriptionLimits] as number
        
        return Math.max(0, maxValue - currentValue)
      },

      resetSubscription: () => {
        set({
          currentSubscription: null,
          limits: {
            maxUsers: 0,
            maxASOs: 0,
            maxCompanies: 0,
            currentUsers: 0,
            currentASOs: 0,
            currentCompanies: 0
          }
        })
      }
    }),
    {
      name: 'subscription-storage'
    }
  )
)