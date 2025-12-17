// components/AlertBell.tsx
"use client"

import { useState } from 'react'
import { useAlertStore } from '@/lib/alert-store'

export default function AlertBell() {
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useAlertStore()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-.24-1.56 6 6 0 0112 0c0 .54-.08 1.06-.24 1.56m-1.76 2.44H4a2 2 0 01-2-2 10 10 0 0120 0 2 2 0 01-2 2h-4.5z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lida
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-gray-100 ${
                    !alert.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={`text-sm font-medium ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {alert.title}
                    </span>
                    {!alert.read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  {alert.actionUrl && alert.actionLabel && (
                    <a
                      href={alert.actionUrl}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      {alert.actionLabel}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}