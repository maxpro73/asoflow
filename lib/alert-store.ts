// lib/alert-store.ts
import { create } from 'zustand'
import { Alert, AlertType } from '@/.next/dev/types/alertas'

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeAlert: (id: string) => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
    }
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    }))
  },
  markAsRead: (id) => {
    set((state) => {
      const updatedAlerts = state.alerts.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
      return {
        alerts: updatedAlerts,
        unreadCount: updatedAlerts.filter((a) => !a.read).length,
      }
    })
  },
  markAllAsRead: () => {
    set((state) => ({
      alerts: state.alerts.map((alert) => ({ ...alert, read: true })),
      unreadCount: 0,
    }))
  },
  removeAlert: (id) => {
    set((state) => {
      const alertToRemove = state.alerts.find((a) => a.id === id)
      return {
        alerts: state.alerts.filter((a) => a.id !== id),
        unreadCount: alertToRemove?.read ? state.unreadCount : state.unreadCount - 1,
      }
    })
  },
}))