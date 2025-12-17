// components/DebugStore.tsx
"use client"

import { useAsoStore } from "@/lib/aso-store"

export default function DebugStore() {
  const { asos, funcionarios, getStats } = useAsoStore()
  const stats = getStats()

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <h3 className="font-bold mb-2">🔧 Debug Store</h3>
      <div className="space-y-1">
        <div>ASOs: {asos.length}</div>
        <div>Funcionários: {funcionarios.length}</div>
        <div>Ativos: {stats.activeASOs}</div>
        <div>Vencendo: {stats.expiringASOs}</div>
        <div>Pendentes: {stats.pendingASOs}</div>
      </div>
    </div>
  )
}